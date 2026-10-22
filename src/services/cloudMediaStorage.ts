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
 * @param folder The storage directory ('gallery_videos', 'ashtami_videos', 'gallery_photos', 'soundboard_audio', 'site_branding')
 * @param onProgress Optional callback for real-time upload progress (0-100%)
 */
export async function uploadMediaToCloudStorage(
  file: File,
  folder: 'gallery_videos' | 'ashtami_videos' | 'gallery_photos' | 'soundboard_audio' | 'site_branding' | 'event_images' | 'visarjan_banners' = 'gallery_videos',
  onProgress?: UploadProgressCallback
): Promise<CloudUploadResult> {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  const inferredType: Record<string, string> = {
    mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', ogg: 'video/ogg',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
    svg: 'image/svg+xml', gif: 'image/gif',
    mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', aac: 'audio/aac',
    oga: 'audio/ogg', weba: 'audio/webm'
  };
  const contentType = file.type || inferredType[extension || ''] || '';
  const isAudio = folder === 'soundboard_audio';
  const isPhoto = folder === 'gallery_photos' || folder === 'site_branding' || folder === 'event_images' || folder === 'visarjan_banners';

  const allowedTypes = isAudio
    ? ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/aac', 'audio/webm', 'audio/x-m4a']
    : isPhoto
    ? ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
    : ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];

  const maxBytes = isAudio ? 50 * 1024 * 1024 : isPhoto ? 10 * 1024 * 1024 : 500 * 1024 * 1024;
  if (!allowedTypes.includes(contentType)) {
    throw new Error(`Unsupported media type: ${contentType || 'unknown'}.`);
  }
  if (file.size <= 0 || file.size > maxBytes) {
    throw new Error(`File exceeds the ${isAudio ? '50 MB audio' : isPhoto ? '10 MB image' : '500 MB video'} upload limit.`);
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
        // Resilient fallback for audio files up to 6MB if Cloud Storage is restricted or offline
        if (isAudio && file.size <= 6 * 1024 * 1024) {
          console.info('Using local Data URL fallback for audio storage resilience.');
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              url: reader.result as string,
              storagePath: `fallback_${uniqueId}`,
              name: file.name,
              size: file.size,
              contentType: contentType || 'audio/mpeg'
            });
          };
          reader.onerror = () => reject(error);
          reader.readAsDataURL(file);
          return;
        }
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

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function deleteCloudMediaObject(storagePath: string): Promise<void> {
  if (!storagePath) return;
  if (storagePath.startsWith('fallback_')) return;
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (err) {
    console.warn('Delete cloud media warning:', err);
  }
}
