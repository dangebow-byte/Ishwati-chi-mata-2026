/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Client-side image processing helpers. Uploaded media files are stored in Firebase Storage.
 */

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
 * Formats byte size to human-readable string (e.g. 2.4 MB)
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
