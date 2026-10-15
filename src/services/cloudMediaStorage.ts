/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from '../firebase';

export interface UploadProgressCallback {
  (percentage: number, bytesTransferred: number, totalBytes: number): void;
}

export interface CloudUploadResult {
  url: string;
  storagePath: string;
  name: string;
  size: number;
  contentType: string;
}

/**
 * Sanitizes a filename to avoid URL and storage encoding issues
 */
function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_');
}

/**
 * Uploads a media file (Video or Image) directly to Firebase Cloud Storage.
 * Uses Firebase's resumable upload task and reports progress until success or error.
 * @param file The File object selected from the user's device
 * @param folder The storage directory ('gallery_videos', 'ashtami_videos', 'gallery_photos')
 * @param onProgress Optional callback for real-time upload progress (0-100%)
 */
export async function uploadMediaToCloudStorage(
  file: File,
  folder: 'gallery_videos' | 'ashtami_videos' | 'gallery_photos' = 'gallery_videos',
  onProgress?: UploadProgressCallback
): Promise<CloudUploadResult> {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  const inferredType: Record<string, string> = {
    mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', ogg: 'video/ogg',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp'
  };
  const contentType = file.type || inferredType[extension || ''] || '';
  const isPhoto = folder === 'gallery_photos';
  const allowedTypes = isPhoto
    ? ['image/jpeg', 'image/png', 'image/webp']
    : ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];
  const maxBytes = isPhoto ? 10 * 1024 * 1024 : 500 * 1024 * 1024;
  if (!allowedTypes.includes(contentType)) {
    throw new Error(`Unsupported media type: ${contentType || 'unknown'}.`);
  }
  if (file.size <= 0 || file.size > maxBytes) {
    throw new Error(`File exceeds the ${isPhoto ? '10 MB image' : '500 MB video'} upload limit.`);
  }

  const cleanName = sanitizeFileName(file.name || 'media_file');
  const uniqueId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const storagePath = `${folder}/${uniqueId}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  const metadata = {
    contentType,
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString()
    }
  };

  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = snapshot.totalBytes > 0
          ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          : 0;
        if (onProgress) {
          onProgress(progress, snapshot.bytesTransferred, snapshot.totalBytes);
        }
      },
      (error) => {
        console.warn('Firebase Storage Upload Error / CORS:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadUrl,
            storagePath,
            name: file.name,
            size: file.size,
            contentType
          });
        } catch (urlError) {
          reject(urlError);
        }
      }
    );
  });
}

export async function deleteCloudMediaObject(storagePath: string): Promise<void> {
  if (!storagePath) return;
  await deleteObject(ref(storage, storagePath));
}
