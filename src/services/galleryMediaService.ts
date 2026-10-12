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
  createdAt: string;
  updatedAt?: string;
}

const COLLECTION_NAME = 'gallery_media';
const LOCAL_STORAGE_KEY = 'temple_gallery_media_cache';

// Transform initial bundled data to standard items
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
      createdAt: new Date().toISOString()
    };
  }),
  ...OFFICIAL_INSTAGRAM_REELS.map((reel) => ({
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
    createdAt: new Date().toISOString()
  }))
];

export function getCachedGalleryMedia(): GalleryMediaItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return INITIAL_GALLERY_MEDIA;
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
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
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
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt
          });
        });

        // Merge any bundled items not in firestore so nothing is lost
        const firestoreIds = new Set(items.map(x => x.id));
        INITIAL_GALLERY_MEDIA.forEach(initItem => {
          if (!firestoreIds.has(initItem.id)) {
            items.push(initItem);
          }
        });

        setCachedGalleryMedia(items);
        onUpdate(items);
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
    ...item,
    id,
    createdAt: new Date().toISOString()
  };

  const current = getCachedGalleryMedia();
  setCachedGalleryMedia([newItem, ...current]);

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, {
      ...newItem,
      serverCreated: serverTimestamp()
    });
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
    await setDoc(docRef, {
      ...params,
      updatedAt: new Date().toISOString()
    }, { merge: true });
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
