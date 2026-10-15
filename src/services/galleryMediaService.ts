/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  deleteField,
  setDoc,
  onSnapshot,
  query,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { storage } from '../firebase';
import { GALLERY_ITEMS, OFFICIAL_INSTAGRAM_REELS, OFFICIAL_FESTIVAL_VIDEOS } from '../data';

export type GalleryMediaType = 'photo' | 'video' | 'instagram';

export interface GalleryMediaItem {
  id: string;
  type: GalleryMediaType;
  url: string; // Image URL or Video URL or Instagram URL
  embedUrl?: string; // Optional embed URL for YouTube/Instagram/direct video
  localVideoId?: string; // Legacy browser-local field; new uploads must use Storage URLs.
  storagePath?: string;
  isDeleted?: boolean;
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

type UpdateGalleryMediaParams = Partial<Omit<GalleryMediaItem, 'storagePath' | 'localVideoId'>> & {
  storagePath?: string | null;
  localVideoId?: string | null;
};

const COLLECTION_NAME = 'gallery_media';
let inMemoryGalleryCache: GalleryMediaItem[] | null = null;

const TYPE_PRIORITY: Record<GalleryMediaType, number> = {
  photo: 1,     // 1) Sacred Photos / Images first
  video: 2,     // 2) Festival Videos & YouTube second
  instagram: 3  // 3) Instagram Reels third
};

// Sort helper: Photos first -> Videos second -> Instagram Reels third, then displayOrder, then createdAt
export function sortGalleryMediaItems(items: GalleryMediaItem[]): GalleryMediaItem[] {
  return [...items].sort((a, b) => {
    const priorityA = TYPE_PRIORITY[a.type] ?? 99;
    const priorityB = TYPE_PRIORITY[b.type] ?? 99;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

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
  ...OFFICIAL_FESTIVAL_VIDEOS.map((vid, idx) => ({
    id: vid.id,
    type: 'video' as GalleryMediaType,
    url: vid.url,
    titleMR: vid.titleMR,
    titleEN: vid.titleEN,
    category: vid.category,
    year: vid.year,
    descriptionMR: vid.descriptionMR,
    descriptionEN: vid.descriptionEN,
    displayOrder: idx,
    createdAt: new Date().toISOString()
  })),
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
      displayOrder: OFFICIAL_FESTIVAL_VIDEOS.length + idx,
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
    displayOrder: OFFICIAL_FESTIVAL_VIDEOS.length + GALLERY_ITEMS.length + idx,
    createdAt: new Date().toISOString()
  }))
];

export function getCachedGalleryMedia(): GalleryMediaItem[] {
  return sortGalleryMediaItems(inMemoryGalleryCache ?? INITIAL_GALLERY_MEDIA);
}

export function setCachedGalleryMedia(items: GalleryMediaItem[]): void {
  inMemoryGalleryCache = sortGalleryMediaItems(items);
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
          const initial = sortGalleryMediaItems(INITIAL_GALLERY_MEDIA);
          setCachedGalleryMedia(initial);
          onUpdate(initial);
          return;
        }

        const items: GalleryMediaItem[] = [];
        const seenIds = new Set<string>();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const docId = docSnap.id;
          if (!seenIds.has(docId)) {
            seenIds.add(docId);
            if (data.isDeleted === true) return;
            items.push({
              id: docId,
              type: (data.type as GalleryMediaType) || 'photo',
              url: data.url || '',
              embedUrl: data.embedUrl,
              localVideoId: data.localVideoId,
              storagePath: data.storagePath,
              titleMR: data.titleMR || '',
              titleEN: data.titleEN || '',
              category: data.category || 'Mata Darshan',
              year: data.year || '2026',
              descriptionMR: data.descriptionMR,
              descriptionEN: data.descriptionEN,
              authorHandle: data.authorHandle,
              displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : undefined,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt,
              isDeleted: data.isDeleted === true
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
        onUpdate(getCachedGalleryMedia());
        if (onError) onError(error);
        try {
          handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
        } catch (reportedError) {
          console.error('Gallery subscription failed; showing in-memory content:', reportedError);
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    onUpdate(getCachedGalleryMedia());
    if (onError && error instanceof Error) onError(error);
    try {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    } catch (reportedError) {
      console.error('Gallery subscription could not be started:', reportedError);
    }
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
  localVideoId?: string;
  storagePath?: string;
  titleMR: string;
  titleEN: string;
  category: string;
  year: string;
  descriptionMR?: string;
  descriptionEN?: string;
  authorHandle?: string;
}): Promise<GalleryMediaItem> {
  const id = `media-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
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
  if (item.localVideoId) newItem.localVideoId = item.localVideoId;
  if (item.storagePath) newItem.storagePath = item.storagePath;
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
    setCachedGalleryMedia(current);
    if (newItem.storagePath) {
      try {
        await deleteObject(ref(storage, newItem.storagePath));
      } catch (storageError) {
        console.warn('Gallery metadata could not be saved and its uploaded file could not be cleaned up:', storageError);
      }
    }
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${id}`);
    return newItem;
  }
}

/**
 * Updates an existing gallery media item
 */
export async function updateGalleryMedia(
  id: string,
  params: UpdateGalleryMediaParams
): Promise<void> {
  const current = getCachedGalleryMedia();
  const previousItem = current.find(item => item.id === id);
  const updated = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        ...params,
        storagePath: params.storagePath === null ? undefined : (params.storagePath ?? item.storagePath),
        localVideoId: params.localVideoId === null ? undefined : (params.localVideoId ?? item.localVideoId),
        updatedAt: new Date().toISOString()
      } as GalleryMediaItem;
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
    if (params.storagePath === null) firestorePayload.storagePath = deleteField();
    if (params.localVideoId === null) firestorePayload.localVideoId = deleteField();
    await setDoc(docRef, firestorePayload, { merge: true });
    if (previousItem?.storagePath && params.storagePath !== undefined && previousItem.storagePath !== params.storagePath) {
      try {
        await deleteObject(ref(storage, previousItem.storagePath));
      } catch (storageError) {
        console.warn('Gallery item updated, but its previous Storage object could not be deleted:', storageError);
      }
    }
  } catch (error) {
    setCachedGalleryMedia(current);
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

/**
 * Deletes a media item from gallery
 */
export async function deleteGalleryMedia(id: string): Promise<void> {
  const current = getCachedGalleryMedia();
  const item = current.find(candidate => candidate.id === id);
  if (!item) return;

  const tombstone = { ...item, isDeleted: true, updatedAt: new Date().toISOString() };
  setCachedGalleryMedia(current.filter(candidate => candidate.id !== id));

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, cleanFirestoreData(tombstone), { merge: true });
    if (item.storagePath) {
      try {
        await deleteObject(ref(storage, item.storagePath));
      } catch (storageError) {
        console.warn('Gallery item removed, but its Storage object could not be deleted:', storageError);
      }
    }
  } catch (error) {
    setCachedGalleryMedia(current);
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}
