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
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { GALLERY_ITEMS, OFFICIAL_INSTAGRAM_REELS } from '../data';

export type GalleryMediaType = 'photo' | 'video' | 'instagram';

export interface GalleryMediaItem {
  id: string;
  type: GalleryMediaType;
  url: string; // Image URL or Video URL or Instagram URL
  embedUrl?: string; // Optional embed URL for YouTube/Instagram/direct video
  titleMR: string;
  titleEN: string;
  category: string;
  year: string; // e.g., '2026', '2025', '2024'
  descriptionMR?: string;
  descriptionEN?: string;
  authorHandle?: string;
  displayOrder?: number; // Order index for custom reordering
  createdAt: string;
  updatedAt?: string;
}

const COLLECTION_NAME = 'gallery_media';
const LOCAL_STORAGE_KEY = 'temple_gallery_media_cache';

// Sort helper to sort items consistently by displayOrder first, then createdAt
export function sortGalleryMediaItems(items: GalleryMediaItem[]): GalleryMediaItem[] {
  return [...items].sort((a, b) => {
    const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 999999;
    const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 999999;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

// Transform initial bundled data to standard items with default displayOrder
export const INITIAL_GALLERY_MEDIA: GalleryMediaItem[] = [
  ...GALLERY_ITEMS.map((item, idx) => {
    let year = '2026';
    if (item.id.includes('2025')) year = '2025';
    else if (item.id.includes('1974')) year = '1974';
    
    return {
      id: item.id || `photo-${idx}`,
      type: 'photo' as GalleryMediaType,
      url: item.url,
      titleMR: item.titleMarathi || item.title,
      titleEN: item.title,
      category: item.category || 'Mata Darshan',
      year,
      displayOrder: idx,
      createdAt: new Date().toISOString()
    };
  }),
  ...OFFICIAL_INSTAGRAM_REELS.map((reel, idx) => ({
    id: reel.id,
    type: 'instagram' as GalleryMediaType,
    url: reel.reelUrl,
    embedUrl: reel.embedUrl,
    titleMR: reel.titleMR,
    titleEN: reel.titleEN,
    category: 'Videos & Reels',
    year: '2026',
    descriptionMR: reel.descriptionMR,
    descriptionEN: reel.descriptionEN,
    authorHandle: reel.authorHandle || '@ishwatichi_mata',
    displayOrder: GALLERY_ITEMS.length + idx,
    createdAt: new Date().toISOString()
  }))
];

export function getCachedGalleryMedia(): GalleryMediaItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const seen = new Set<string>();
        const uniqueItems: GalleryMediaItem[] = [];
        parsed.forEach((item, idx) => {
          let itemId = item.id;
          if (!itemId || seen.has(itemId)) {
            itemId = itemId ? `${itemId}-dup-${idx}` : `gal-item-${idx}`;
            item = { ...item, id: itemId };
          }
          seen.add(itemId);
          uniqueItems.push(item);
        });
        return sortGalleryMediaItems(uniqueItems);
      }
    }
  } catch {}
  return sortGalleryMediaItems(INITIAL_GALLERY_MEDIA);
}

export function setCachedGalleryMedia(items: GalleryMediaItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

/**
 * Subscribes to real-time updates for all gallery media (photos, videos, reels)
 */
export function subscribeGalleryMedia(
  onUpdate: (items: GalleryMediaItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          const cached = getCachedGalleryMedia();
          onUpdate(cached);
          return;
        }

        const items: GalleryMediaItem[] = [];
        const seenIds = new Set<string>();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const docId = docSnap.id;
          if (!seenIds.has(docId)) {
            seenIds.add(docId);
            items.push({
              id: docId,
              type: (data.type as GalleryMediaType) || 'photo',
              url: data.url || '',
              embedUrl: data.embedUrl,
              titleMR: data.titleMR || '',
              titleEN: data.titleEN || '',
              category: data.category || 'Mata Darshan',
              year: data.year || '2026',
              descriptionMR: data.descriptionMR,
              descriptionEN: data.descriptionEN,
              authorHandle: data.authorHandle,
              displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : undefined,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt
            });
          }
        });

        // Merge any bundled items not in firestore so nothing is lost
        INITIAL_GALLERY_MEDIA.forEach(initItem => {
          if (!seenIds.has(initItem.id)) {
            items.push(initItem);
            seenIds.add(initItem.id);
          }
        });

        const sortedItems = sortGalleryMediaItems(items);
        setCachedGalleryMedia(sortedItems);
        onUpdate(sortedItems);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
        onUpdate(getCachedGalleryMedia());
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    onUpdate(getCachedGalleryMedia());
    return () => {};
  }
}

/**
 * Helper to strip undefined values so Firestore setDoc does not throw
 */
function cleanFirestoreData<T extends Record<string, any>>(data: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Helper to reorder items within a filtered subset while preserving the relative positions of other items in the master list.
 */
export function applyReorderToMasterList(
  masterItems: GalleryMediaItem[],
  filteredItems: GalleryMediaItem[],
  dragIndex: number,
  dropIndex: number
): GalleryMediaItem[] {
  if (dragIndex === dropIndex || dragIndex < 0 || dropIndex < 0) {
    return masterItems;
  }
  if (dragIndex >= filteredItems.length || dropIndex >= filteredItems.length) {
    return masterItems;
  }

  // 1. Compute reordered filtered subset
  const newFiltered = [...filteredItems];
  const [movedItem] = newFiltered.splice(dragIndex, 1);
  newFiltered.splice(dropIndex, 0, movedItem);

  // 2. Identify and replace filtered items within the master list in order
  const filteredIds = new Set(filteredItems.map(item => item.id));
  let filteredPointer = 0;

  const newMaster = masterItems.map(item => {
    if (filteredIds.has(item.id)) {
      const replacement = newFiltered[filteredPointer++];
      return replacement;
    }
    return item;
  });

  // 3. Normalize displayOrder across the master list
  return newMaster.map((item, idx) => ({
    ...item,
    displayOrder: idx
  }));
}

/**
 * Persists the reordered list of media items.
 * Updates local cache immediately and writes batch updates to Firestore.
 */
export async function reorderGalleryMedia(reorderedItems: GalleryMediaItem[]): Promise<void> {
  const normalized = reorderedItems.map((item, idx) => ({
    ...item,
    displayOrder: idx,
    updatedAt: new Date().toISOString()
  }));

  setCachedGalleryMedia(normalized);

  try {
    const batch = writeBatch(db);
    normalized.forEach((item) => {
      const docRef = doc(db, COLLECTION_NAME, item.id);
      batch.set(
        docRef,
        cleanFirestoreData({
          ...item,
          displayOrder: item.displayOrder,
          updatedAt: item.updatedAt
        }),
        { merge: true }
      );
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, COLLECTION_NAME);
  }
}

/**
 * Saves a new media item (Photo, Video, or Instagram Reel)
 */
export async function addGalleryMedia(item: {
  type: GalleryMediaType;
  url: string;
  embedUrl?: string;
  titleMR: string;
  titleEN: string;
  category: string;
  year: string;
  descriptionMR?: string;
  descriptionEN?: string;
  authorHandle?: string;
}): Promise<GalleryMediaItem> {
  const id = `media-${Date.now()}`;
  const newItem: GalleryMediaItem = {
    id,
    type: item.type,
    url: item.url,
    titleMR: item.titleMR,
    titleEN: item.titleEN,
    category: item.category,
    year: item.year,
    displayOrder: 0,
    createdAt: new Date().toISOString()
  };

  if (item.embedUrl) newItem.embedUrl = item.embedUrl;
  if (item.descriptionMR) newItem.descriptionMR = item.descriptionMR;
  if (item.descriptionEN) newItem.descriptionEN = item.descriptionEN;
  if (item.authorHandle) newItem.authorHandle = item.authorHandle;

  const current = getCachedGalleryMedia();
  const reordered = [newItem, ...current].map((it, idx) => ({ ...it, displayOrder: idx }));
  setCachedGalleryMedia(reordered);

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const firestorePayload = cleanFirestoreData({
      ...newItem,
      serverCreated: serverTimestamp()
    });
    await setDoc(docRef, firestorePayload);
    return newItem;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${id}`);
    return newItem;
  }
}

/**
 * Updates an existing gallery media item
 */
export async function updateGalleryMedia(
  id: string,
  params: Partial<GalleryMediaItem>
): Promise<void> {
  const current = getCachedGalleryMedia();
  const updated = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        ...params,
        updatedAt: new Date().toISOString()
      };
    }
    return item;
  });
  setCachedGalleryMedia(updated);

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const firestorePayload = cleanFirestoreData({
      ...params,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, firestorePayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

/**
 * Deletes a media item from gallery
 */
export async function deleteGalleryMedia(id: string): Promise<void> {
  const current = getCachedGalleryMedia();
  setCachedGalleryMedia(current.filter(item => item.id !== id));

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}
