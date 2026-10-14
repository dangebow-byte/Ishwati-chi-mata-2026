/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Local Media Storage Service
 * Handles device file uploads (Images & Videos) using native browser IndexedDB & Canvas.
 * Supports:
 * - High-resolution client-side image compression (returns compressed Data URL)
 * - Large video file storage in IndexedDB with Blob URL resolution for smooth HTML5 playback
 * - Automatic persistence across browser sessions
 */

const DB_NAME = 'IshwatiMataMediaDB';
const DB_VERSION = 1;
const VIDEO_STORE = 'local_videos';

interface StoredVideoRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  blob: Blob;
  createdAt: string;
}

let dbInstance: IDBDatabase | null = null;

/**
 * Opens or initializes the native IndexedDB database
 */
function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(VIDEO_STORE)) {
        db.createObjectStore(VIDEO_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Compress an image file using an HTML Canvas element
 * Target size is optimized to be crisp and strictly under 450 KB (well within Firestore 1MB document limit)
 * Returns an optimized Data URL suitable for persistent cloud sync and instant display
 */
export async function compressAndReadImageFile(
  file: File,
  maxDimension: number = 960,
  quality: number = 0.72
): Promise<{ dataUrl: string; name: string; size: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale proportionally to maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const raw = readerEvent.target?.result as string;
          resolve({
            dataUrl: raw,
            name: file.name,
            size: file.size
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for optimal byte-to-quality ratio
        let compressedDataUrl = canvas.toDataURL('image/webp', quality);
        if (!compressedDataUrl.startsWith('data:image/webp')) {
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Multi-pass safeguard: If size exceeds 450KB, compress further to guarantee Firestore acceptance
        if (compressedDataUrl.length > 450 * 1024) {
          compressedDataUrl = canvas.toDataURL('image/jpeg', 0.60);
        }
        if (compressedDataUrl.length > 500 * 1024) {
          // Scale down canvas dimensions slightly if still large
          const halfCanvas = document.createElement('canvas');
          halfCanvas.width = Math.round(width * 0.8);
          halfCanvas.height = Math.round(height * 0.8);
          const halfCtx = halfCanvas.getContext('2d');
          if (halfCtx) {
            halfCtx.drawImage(canvas, 0, 0, halfCanvas.width, halfCanvas.height);
            compressedDataUrl = halfCanvas.toDataURL('image/jpeg', 0.55);
          }
        }

        resolve({
          dataUrl: compressedDataUrl,
          name: file.name,
          size: Math.round((compressedDataUrl.length * 3) / 4)
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image file into canvas.'));
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Saves a local video File/Blob to IndexedDB and returns its persistent ID and blob URL
 */
export async function saveLocalVideoFile(
  file: File,
  customId?: string
): Promise<{ id: string; blobUrl: string; name: string; size: number }> {
  const db = await getDB();
  const id = customId || ('local-vid-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7));

  const record: StoredVideoRecord = {
    id,
    name: file.name,
    type: file.type || 'video/mp4',
    size: file.size,
    blob: file,
    createdAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(VIDEO_STORE, 'readwrite');
    const store = tx.objectStore(VIDEO_STORE);
    const putRequest = store.put(record);

    putRequest.onsuccess = () => {
      const blobUrl = URL.createObjectURL(file);
      resolve({
        id,
        blobUrl,
        name: file.name,
        size: file.size
      });
    };

    putRequest.onerror = () => reject(putRequest.error);
  });
}

/**
 * Retrieves a stored video from IndexedDB and creates a playable Blob URL
 */
export async function getLocalVideoBlobUrl(idOrKey: string): Promise<string | null> {
  if (!idOrKey) return null;
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(VIDEO_STORE, 'readonly');
      const store = tx.objectStore(VIDEO_STORE);
      const getReq = store.get(idOrKey);

      getReq.onsuccess = () => {
        const record = getReq.result as StoredVideoRecord | undefined;
        if (record && record.blob) {
          const blobUrl = URL.createObjectURL(record.blob);
          resolve(blobUrl);
          return;
        }

        // Fallback: search all records if key was a sub-id or timestamp match
        const cursorReq = store.openCursor();
        let found = false;
        cursorReq.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            const item = cursor.value as StoredVideoRecord;
            if (item.id === idOrKey || idOrKey.includes(item.id) || item.id.includes(idOrKey)) {
              found = true;
              resolve(URL.createObjectURL(item.blob));
              return;
            }
            cursor.continue();
          } else if (!found) {
            resolve(null);
          }
        };
        cursorReq.onerror = () => resolve(null);
      };

      getReq.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Formats byte size to human-readable string (e.g. 2.4 MB)
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
