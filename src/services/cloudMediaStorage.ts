/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL
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
 * Returns the permanent public download URL accessible from any device or deployed site.
 * 
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

  const cleanName = sanitizeFileName(file.name || 'media_file');
  const timestamp = Date.now();
  const storagePath = `${folder}/${timestamp}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  const metadata = {
    contentType: file.type || (cleanName.endsWith('.mp4') ? 'video/mp4' : 'application/octet-stream'),
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
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) {
          onProgress(progress, snapshot.bytesTransferred, snapshot.totalBytes);
        }
      },
      (error) => {
        console.error('Firebase Storage Upload Error:', error);
        let userMessage = 'व्हिडिओ अपलोड अयशस्वी झाला (Cloud Upload Failed).';
        if (error.code === 'storage/unauthorized') {
          userMessage = 'क्लाउड स्टोरेज परवानगी नाकारली गेली. कृपया पुन्हा प्रयत्न करा किंवा ॲडमिनशी संपर्क साधा (Storage unauthorized).';
        } else if (error.code === 'storage/quota-exceeded') {
          userMessage = 'स्टोरेज कोटा मर्यादा संपली आहे (Storage quota exceeded).';
        } else if (error.code === 'storage/retry-limit-exceeded') {
          userMessage = 'इंटरनेट कनेक्शन कमकुवत असल्यामुळे वेळ संपली (Network timeout).';
        }
        reject(new Error(userMessage));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadUrl,
            storagePath,
            name: file.name,
            size: file.size,
            contentType: file.type
          });
        } catch (urlError) {
          console.error('Failed to get download URL:', urlError);
          reject(new Error('डाउनलोड लिंक मिळवण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'));
        }
      }
    );
  });
}
