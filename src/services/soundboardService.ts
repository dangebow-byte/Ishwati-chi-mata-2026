/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { SacredMantra, SACRED_MANTRAS } from '../utils/templeSoundboardEngine';

export interface SoundboardItem extends SacredMantra {
  category?: 'mantra' | 'instrument' | 'stuti' | 'aarti';
  audioUrl?: string; // Optional direct audio URL for custom recorded recordings
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

const COLLECTION_NAME = 'soundboard_items';
const LOCAL_STORAGE_KEY = 'temple_soundboard_items_cache';

/**
 * Initial standard soundboard items mapped from SACRED_MANTRAS
 */
export const DEFAULT_SOUNDBOARD_ITEMS: SoundboardItem[] = SACRED_MANTRAS.map((m, idx) => ({
  ...m,
  category: idx === 3 ? 'stuti' : 'mantra',
  isActive: true,
  displayOrder: idx + 1,
  createdAt: '2026-10-11T00:00:00.000Z'
}));

/**
 * Retrieves cached soundboard items from localStorage for zero-latency loading and offline resilience
 */
export function getCachedSoundboardItems(): SoundboardItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_SOUNDBOARD_ITEMS;
}

/**
 * Saves soundboard items to localStorage cache
 */
export function setCachedSoundboardItems(items: SoundboardItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

/**
 * Real-time subscription to Soundboard items in Firestore
 */
export function subscribeSoundboardItems(
  onUpdate: (items: SoundboardItem[]) => void,
  onError?: (error: unknown) => void
): () => void {
  // Always emit cached/default items immediately so UI never blocks
  const initial = getCachedSoundboardItems();
  onUpdate(initial);

  try {
    const q = query(collection(db, COLLECTION_NAME));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty, use defaults and keep local cache
          setCachedSoundboardItems(DEFAULT_SOUNDBOARD_ITEMS);
          onUpdate(DEFAULT_SOUNDBOARD_ITEMS);
          return;
        }

        const items: SoundboardItem[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          items.push({
            id: d.id,
            nameMR: data.nameMR || '',
            nameEN: data.nameEN || '',
            chantTextMR: data.chantTextMR || '',
            chantTextEN: data.chantTextEN || '',
            frequencyHz: typeof data.frequencyHz === 'number' ? data.frequencyHz : 136.1,
            category: data.category || 'mantra',
            audioUrl: data.audioUrl || '',
            descriptionMR: data.descriptionMR || '',
            descriptionEN: data.descriptionEN || '',
            isActive: data.isActive !== false,
            displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 99,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt
          });
        });

        // Sort items by displayOrder ASC, then nameMR
        items.sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));

        setCachedSoundboardItems(items);
        onUpdate(items);
      },
      (error) => {
        console.warn('Soundboard items Firestore subscription notice:', error);
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Could not establish real-time Soundboard listener; using cache fallback:', error);
    return () => {};
  }
}

/**
 * Admin: Adds a new Soundboard item
 */
export async function addSoundboardItem(
  item: Omit<SoundboardItem, 'id' | 'createdAt'>,
  customId?: string
): Promise<SoundboardItem> {
  const id = customId || `sb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newItem: SoundboardItem = {
    ...item,
    id,
    isActive: item.isActive !== false,
    displayOrder: item.displayOrder ?? 10,
    createdAt: now,
    updatedAt: now
  };

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, {
      id: newItem.id,
      nameMR: newItem.nameMR,
      nameEN: newItem.nameEN,
      chantTextMR: newItem.chantTextMR,
      chantTextEN: newItem.chantTextEN || '',
      frequencyHz: newItem.frequencyHz || 136.1,
      category: newItem.category || 'mantra',
      audioUrl: newItem.audioUrl || '',
      descriptionMR: newItem.descriptionMR || '',
      descriptionEN: newItem.descriptionEN || '',
      isActive: newItem.isActive,
      displayOrder: newItem.displayOrder,
      createdAt: newItem.createdAt,
      updatedAt: newItem.updatedAt
    });

    // Update local cache
    const current = getCachedSoundboardItems();
    const updated = [...current.filter(i => i.id !== id), newItem].sort(
      (a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99)
    );
    setCachedSoundboardItems(updated);

    return newItem;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
}

/**
 * Admin: Updates an existing Soundboard item
 */
export async function updateSoundboardItem(
  id: string,
  updates: Partial<SoundboardItem>
): Promise<void> {
  const updatedAt = new Date().toISOString();
  const payload: Record<string, any> = {
    ...updates,
    updatedAt
  };
  delete payload.id; // Prevent overwriting ID

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, payload);

    // Update local cache
    const current = getCachedSoundboardItems();
    const index = current.findIndex(i => i.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updates, updatedAt };
      current.sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
      setCachedSoundboardItems(current);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
}

/**
 * Admin: Deletes a Soundboard item
 */
export async function deleteSoundboardItem(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);

    // Update local cache
    const current = getCachedSoundboardItems();
    const filtered = current.filter(i => i.id !== id);
    setCachedSoundboardItems(filtered);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
}

/**
 * Admin: Toggles the active status of a Soundboard item
 */
export async function toggleSoundboardItemActive(
  id: string,
  currentStatus: boolean
): Promise<void> {
  return updateSoundboardItem(id, { isActive: !currentStatus });
}
