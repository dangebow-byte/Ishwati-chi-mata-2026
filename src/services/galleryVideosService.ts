/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { extractInstagramShortcode, getInstagramEmbedUrl } from '../components/InstagramVideoEmbed';
import { OFFICIAL_INSTAGRAM_REELS } from '../data';

export interface GalleryVideoDoc {
  id: string;
  reelUrl: string;
  embedUrl: string;
  titleEN: string;
  titleMR: string;
  descriptionEN: string;
  descriptionMR: string;
  authorHandle: string;
  establishedYear: string;
  createdAt: string;
  updatedAt?: string;
}

const COLLECTION_NAME = 'gallery_videos';

// Default official reel as reliable fallback
export const DEFAULT_OFFICIAL_REEL: GalleryVideoDoc = {
  id: 'reel-official-navratri-1974',
  reelUrl: 'https://www.instagram.com/reel/Cx0sn8AoN7l/?stkn=MTAzcXJldTZpdm15ag==',
  embedUrl: 'https://www.instagram.com/reel/Cx0sn8AoN7l/embed',
  titleEN: 'Shree Young Ishwati Navratrotsav Mandal || Ishwatichi Mata || Tradition of Celebration (Est. 1974)',
  titleMR: 'यंग ईश्र्वती नवरात्रौत्सव मंडळ || ईश्र्वतीची माता || परंपरा उत्सवाची स्थापना: १९७४',
  descriptionEN: 'Official holy Instagram video reel featuring Shree Ishwatichi Mata grand festival traditions and divine blessings.',
  descriptionMR: 'मंडळाचा अधिकृत इंस्टाग्राम व्हिडिओ रील - श्री ईश्वटीची माता परंपरा, भव्य मिरवणूक आणि भक्तिमय दर्शन.',
  authorHandle: '@ishwatichi_mata',
  establishedYear: '१९७४',
  createdAt: new Date().toISOString()
};

/**
 * Subscribes to real-time updates from Firestore 'gallery_videos' collection.
 * Gracefully falls back to default official reels if offline, quota exceeded, or empty.
 */
export function subscribeGalleryVideos(
  onUpdate: (videos: GalleryVideoDoc[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If collection is empty, trigger seed in background and return default
          seedDefaultOfficialVideoIfEmpty().catch(() => {});
          onUpdate([DEFAULT_OFFICIAL_REEL]);
          return;
        }

        const videos: GalleryVideoDoc[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          videos.push({
            id: docSnap.id,
            reelUrl: data.reelUrl || '',
            embedUrl: data.embedUrl || getInstagramEmbedUrl(data.reelUrl || ''),
            titleEN: data.titleEN || '',
            titleMR: data.titleMR || '',
            descriptionEN: data.descriptionEN || '',
            descriptionMR: data.descriptionMR || '',
            authorHandle: data.authorHandle || '@ishwatichi_mata',
            establishedYear: data.establishedYear || '१९७४',
            createdAt: data.createdAt || new Date().toISOString()
          });
        });

        // Ensure default reel is present if not already in list
        if (!videos.some(v => extractInstagramShortcode(v.reelUrl) === 'Cx0sn8AoN7l')) {
          videos.unshift(DEFAULT_OFFICIAL_REEL);
        }

        onUpdate(videos);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
        onUpdate([DEFAULT_OFFICIAL_REEL]);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    onUpdate([DEFAULT_OFFICIAL_REEL]);
    return () => {};
  }
}

/**
 * Seeds the default official reel into Firestore if the collection is empty.
 */
export async function seedDefaultOfficialVideoIfEmpty(): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, DEFAULT_OFFICIAL_REEL.id);
    await setDoc(docRef, {
      ...DEFAULT_OFFICIAL_REEL,
      serverCreated: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    // Non-critical, swallow quota/connectivity errors
  }
}

/**
 * Saves a new Instagram video link to the Firestore 'gallery_videos' collection.
 */
export async function saveGalleryVideoToFirestore(params: {
  url: string;
  titleMR?: string;
  titleEN?: string;
  descriptionMR?: string;
  descriptionEN?: string;
  authorHandle?: string;
  establishedYear?: string;
}): Promise<GalleryVideoDoc> {
  const shortcode = extractInstagramShortcode(params.url);
  if (!shortcode) {
    throw new Error('Invalid Instagram Reel URL format. Please provide a valid Instagram Reel or Post link.');
  }

  const id = `reel-${shortcode}`;
  const embedUrl = `https://www.instagram.com/reel/${shortcode}/embed`;
  const cleanReelUrl = `https://www.instagram.com/reel/${shortcode}/`;

  const newVideo: GalleryVideoDoc = {
    id,
    reelUrl: cleanReelUrl,
    embedUrl,
    titleMR: params.titleMR || 'श्री ईश्वटीची माता पावन दर्शन व्हिडिओ',
    titleEN: params.titleEN || 'Shree Ishwatichi Mata Devotional Video Reel',
    descriptionMR: params.descriptionMR || 'मंडळाचा अधिकृत व्हिडिओ रील गॅलरीमध्ये समाविष्ट करण्यात आला आहे.',
    descriptionEN: params.descriptionEN || 'Official devotional video published to the sacred gallery.',
    authorHandle: params.authorHandle || '@ishwatichi_mata',
    establishedYear: params.establishedYear || '१९७४',
    createdAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, {
      ...newVideo,
      serverCreated: serverTimestamp()
    });
    return newVideo;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
}

/**
 * Updates an existing Instagram video in the Firestore 'gallery_videos' collection.
 */
export async function updateGalleryVideoInFirestore(
  id: string,
  params: {
    reelUrl?: string;
    titleMR?: string;
    titleEN?: string;
    descriptionMR?: string;
    descriptionEN?: string;
    authorHandle?: string;
    establishedYear?: string;
  }
): Promise<Partial<GalleryVideoDoc>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    if (params.reelUrl) {
      const shortcode = extractInstagramShortcode(params.reelUrl);
      if (!shortcode) {
        throw new Error('Invalid Instagram Reel URL format.');
      }
      updates.reelUrl = `https://www.instagram.com/reel/${shortcode}/`;
      updates.embedUrl = `https://www.instagram.com/reel/${shortcode}/embed`;
    }

    if (params.titleMR !== undefined) updates.titleMR = params.titleMR;
    if (params.titleEN !== undefined) updates.titleEN = params.titleEN;
    if (params.descriptionMR !== undefined) updates.descriptionMR = params.descriptionMR;
    if (params.descriptionEN !== undefined) updates.descriptionEN = params.descriptionEN;
    if (params.authorHandle !== undefined) updates.authorHandle = params.authorHandle;
    if (params.establishedYear !== undefined) updates.establishedYear = params.establishedYear;

    await setDoc(docRef, updates, { merge: true });
    return updates;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
}

/**
 * Deletes an Instagram video from the Firestore 'gallery_videos' collection.
 */
export async function deleteGalleryVideoFromFirestore(id: string): Promise<void> {
  if (id === DEFAULT_OFFICIAL_REEL.id) {
    throw new Error('The primary official Mandal reel (स्थापना १९७४) is protected and cannot be deleted.');
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
}
