/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export interface DeviMataImageItem {
  id: string;
  url: string;
  titleMR: string;
  titleEN: string;
  descriptionMR?: string;
  descriptionEN?: string;
  dateStr: string; // YYYY-MM-DD
  year: string; // e.g., '2026'
  isHeroDefault?: boolean;
  createdAt: string;
  updatedAt?: string;
}

const COLLECTION_NAME = 'devi_mata_images';

// Initial default Devi Mata sacred idol image
export const DEFAULT_DEVI_IMAGE: DeviMataImageItem = {
  id: 'devi-mata-default-sanctum',
  url: '', // Empty means fallback to official bundled sacred WebP/PNG idol
  titleMR: 'श्री इश्वटीची माता अधिकृत दिव्य दर्शन मूर्ती',
  titleEN: 'Shree Ishwatichi Mata Official Sacred Sanctum Idol',
  descriptionMR: 'श्री इश्वटीची मातेची स्वयंभू पाषाण व सुवर्ण अलंकारित पावन मूर्ती (स्थापना १९७४).',
  descriptionEN: 'Original consecrated idol venerated continuously since 1974 under spiritual guardianship.',
  dateStr: '2026-10-12',
  year: '2026',
  isHeroDefault: true,
  createdAt: new Date().toISOString()
};

const LOCAL_STORAGE_KEY = 'temple_devi_mata_images_cache';

export function getCachedDeviImages(): DeviMataImageItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const seen = new Set<string>();
        const uniqueList: DeviMataImageItem[] = [];
        parsed.forEach((item, idx) => {
          let itemId = item.id;
          if (!itemId || seen.has(itemId)) {
            itemId = itemId ? `${itemId}-dup-${idx}` : `devi-img-${idx}`;
            item = { ...item, id: itemId };
          }
          seen.add(itemId);
          uniqueList.push(item);
        });
        return uniqueList;
      }
    }
  } catch {}
  return [DEFAULT_DEVI_IMAGE];
}

export function setCachedDeviImages(images: DeviMataImageItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(images));
  } catch {}
}

/**
 * Subscribes to real-time updates for Devi Mata images
 */
export function subscribeDeviMataImages(
  onUpdate: (images: DeviMataImageItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          const cached = getCachedDeviImages();
          onUpdate(cached.length > 0 ? cached : [DEFAULT_DEVI_IMAGE]);
          return;
        }

        const images: DeviMataImageItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          images.push({
            id: docSnap.id,
            url: data.url || '',
            titleMR: data.titleMR || 'श्री इश्वटीची माता पावन दर्शन',
            titleEN: data.titleEN || 'Shree Ishwatichi Mata Sacred Darshan',
            descriptionMR: data.descriptionMR || '',
            descriptionEN: data.descriptionEN || '',
            dateStr: data.dateStr || new Date().toISOString().split('T')[0],
            year: data.year || '2026',
            isHeroDefault: Boolean(data.isHeroDefault),
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt
          });
        });

        // Ensure default image exists in collection
        if (!images.some(img => img.id === DEFAULT_DEVI_IMAGE.id)) {
          images.unshift(DEFAULT_DEVI_IMAGE);
        }

        setCachedDeviImages(images);
        onUpdate(images);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
        const cached = getCachedDeviImages();
        onUpdate(cached.length > 0 ? cached : [DEFAULT_DEVI_IMAGE]);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    const cached = getCachedDeviImages();
    onUpdate(cached.length > 0 ? cached : [DEFAULT_DEVI_IMAGE]);
    return () => {};
  }
}

/**
 * Adds a new Devi Mata image (for daily updates)
 */
export async function addDeviMataImage(params: {
  url: string;
  titleMR?: string;
  titleEN?: string;
  descriptionMR?: string;
  descriptionEN?: string;
  dateStr?: string;
  year?: string;
  isHeroDefault?: boolean;
}): Promise<DeviMataImageItem> {
  if (!params.url || !params.url.trim()) {
    throw new Error('Image URL is required.');
  }

  const id = 'devi-img-' + Date.now();
  const dateStr = params.dateStr || new Date().toISOString().split('T')[0];
  const year = params.year || dateStr.split('-')[0] || '2026';

  const newItem: DeviMataImageItem = {
    id,
    url: params.url.trim(),
    titleMR: params.titleMR?.trim() || 'श्री इश्वटीची माता पावन दर्शन',
    titleEN: params.titleEN?.trim() || 'Shree Ishwatichi Mata Sacred Darshan',
    descriptionMR: params.descriptionMR?.trim() || '',
    descriptionEN: params.descriptionEN?.trim() || '',
    dateStr,
    year,
    isHeroDefault: Boolean(params.isHeroDefault),
    createdAt: new Date().toISOString()
  };

  // Local storage update immediately
  const existing = getCachedDeviImages();
  setCachedDeviImages([newItem, ...existing]);

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const cleanedPayload: Record<string, any> = {};
    for (const [key, value] of Object.entries(newItem)) {
      if (value !== undefined) cleanedPayload[key] = value;
    }
    cleanedPayload.serverCreated = serverTimestamp();
    await setDoc(docRef, cleanedPayload);
    return newItem;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${id}`);
    return newItem;
  }
}

/**
 * Updates an existing Devi Mata image
 */
export async function updateDeviMataImage(
  id: string,
  params: {
    url?: string;
    titleMR?: string;
    titleEN?: string;
    descriptionMR?: string;
    descriptionEN?: string;
    dateStr?: string;
    year?: string;
    isHeroDefault?: boolean;
  }
): Promise<void> {
  const existing = getCachedDeviImages();
  const updatedList = existing.map(img => {
    if (img.id === id) {
      return {
        ...img,
        ...params,
        updatedAt: new Date().toISOString()
      };
    }
    return img;
  });
  setCachedDeviImages(updatedList);

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const cleanedParams: Record<string, any> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) cleanedParams[key] = value;
    }
    cleanedParams.updatedAt = new Date().toISOString();
    await setDoc(docRef, cleanedParams, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

/**
 * Deletes a Devi Mata image
 */
export async function deleteDeviMataImage(id: string): Promise<void> {
  if (id === DEFAULT_DEVI_IMAGE.id) {
    throw new Error('Default sanctum idol cannot be deleted.');
  }

  const existing = getCachedDeviImages();
  setCachedDeviImages(existing.filter(img => img.id !== id));

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}
