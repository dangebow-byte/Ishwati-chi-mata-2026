/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { deleteObject, ref } from 'firebase/storage';
import { deleteCloudMediaObject } from './cloudMediaStorage';

export interface HomeLiveVideo {
  id: string;
  titleMR: string;
  titleEN: string;
  descriptionMR?: string;
  descriptionEN?: string;
  sourceType: 'cloud' | 'youtube' | 'instagram';
  url: string;
  embedUrl?: string;
  storagePath?: string;
  thumbnailUrl?: string;
  duration?: string;
  isLive?: boolean;
  aspectRatio?: 'portrait' | 'landscape';
  category?: 'aarti' | 'miravnuk' | 'visarjan' | 'darshan' | 'reels';
  createdAt: string;
  viewsCount?: number;
  likesCount?: number;
  orderIndex?: number;
}

export const DEFAULT_HOME_LIVE_VIDEOS: HomeLiveVideo[] = [
  {
    id: 'hlv-1-adarsh-shinde-aarti',
    titleMR: 'अष्टमी - धर्मवीर दुर्गा महाआरती | गायक: आदर्श शिंदे',
    titleEN: 'Ashtami - Dharmaveer Durga Maha Aarti | Adarsh Shinde',
    descriptionMR: 'श्री यंग ईश्वटी नवरात्रौत्सव मंडळ - अधिकृत पावन महाआरती व दुर्गा स्तुती.',
    descriptionEN: 'Official Ashtami Maha Aarti and Durga Stuti streaming live.',
    sourceType: 'youtube',
    url: 'https://youtu.be/28TJIom9GFw?si=rTrYi7hPJleZzsEG',
    embedUrl: 'https://www.youtube-nocookie.com/embed/28TJIom9GFw?enablejsapi=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://img.youtube.com/vi/28TJIom9GFw/maxresdefault.jpg',
    duration: '04:32',
    isLive: false,
    aspectRatio: 'landscape',
    category: 'aarti',
    createdAt: '2024-10-10T12:00:00.000Z',
    viewsCount: 15420,
    likesCount: 1890,
    orderIndex: 0
  },
  {
    id: 'hlv-2-visarjan-sohala-reel',
    titleMR: 'श्री विसर्जन सोहळा २०२४ - ५३ वे वर्ष भव्य मिरवणूक',
    titleEN: 'Shree Visarjan Sohala 2024 - 53rd Year Grand Procession Reel',
    descriptionMR: 'मंडळाचे ५३ वे वर्ष - पारंपरिक वाद्ये, ढोल ताशा व विसर्जन घाट मिरवणूक क्षणचित्रे.',
    descriptionEN: '53rd year festival grand visarjan procession highlights and dhol tasha.',
    sourceType: 'cloud',
    url: '/assets/aistudio/image_c72c833a.png', // Fallback poster/video
    thumbnailUrl: '/assets/aistudio/image_c72c833a.png',
    duration: '00:29',
    isLive: true,
    aspectRatio: 'portrait',
    category: 'visarjan',
    createdAt: '2024-10-12T16:00:00.000Z',
    viewsCount: 8940,
    likesCount: 1240,
    orderIndex: 1
  },
  {
    id: 'hlv-3-dhol-tasha-pathak',
    titleMR: 'पारंपरिक ढोल-ताशा पथक व भव्य आतषबाजी',
    titleEN: 'Traditional Dhol Tasha Pathak & Firework Spectacle',
    descriptionMR: 'ईश्वटी चौक व मुख्य बाजारपेठ मार्गावर नेत्रदीपक आतषबाजी व नादब्रह्म वादन.',
    descriptionEN: 'Spectacular fireworks and resonant dhol tasha beats through Ishwati Chowk.',
    sourceType: 'youtube',
    url: 'https://youtu.be/28TJIom9GFw?si=rTrYi7hPJleZzsEG',
    embedUrl: 'https://www.youtube-nocookie.com/embed/28TJIom9GFw?enablejsapi=1&rel=0&modestbranding=1',
    duration: '03:15',
    isLive: false,
    aspectRatio: 'landscape',
    category: 'miravnuk',
    createdAt: '2024-10-12T18:00:00.000Z',
    viewsCount: 11250,
    likesCount: 1480,
    orderIndex: 2
  },
  {
    id: 'hlv-4-sanctum-live-darshan',
    titleMR: 'श्री ईश्वटीची माता गर्भगृह थेट दर्शन व दीप प्रज्वलन',
    titleEN: 'Sanctum Live Sanctum Darshan & Sacred Diya Aarti',
    descriptionMR: 'सकल भाविकांसाठी २४x७ पावन लाइव्ह दर्शन, अलंकार पूजा व महाआरती.',
    descriptionEN: '24/7 Sanctum live darshan, adorned alankar puja, and evening aarti.',
    sourceType: 'youtube',
    url: 'https://youtu.be/28TJIom9GFw?si=rTrYi7hPJleZzsEG',
    embedUrl: 'https://www.youtube-nocookie.com/embed/28TJIom9GFw?enablejsapi=1&rel=0&modestbranding=1',
    duration: 'Live',
    isLive: true,
    aspectRatio: 'landscape',
    category: 'darshan',
    createdAt: '2024-10-11T09:00:00.000Z',
    viewsCount: 22600,
    likesCount: 3120,
    orderIndex: 3
  }
];

const LOCAL_STORAGE_KEY = 'ishwatichi_home_live_videos';

/**
 * Retrieves the cached list of home live videos from local storage
 */
export function getCachedHomeLiveVideos(): HomeLiveVideo[] {
  if (typeof window === 'undefined') return DEFAULT_HOME_LIVE_VIDEOS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading cached home live videos:', err);
  }
  return DEFAULT_HOME_LIVE_VIDEOS;
}

/**
 * Saves home live videos to local storage
 */
function setCachedHomeLiveVideos(videos: HomeLiveVideo[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(videos));
  } catch (err) {
    console.warn('Error saving home live videos to cache:', err);
  }
}

/**
 * Subscribes to real-time updates for Home Live Videos via Firestore,
 * with instantaneous local storage cache delivery.
 */
export function subscribeHomeLiveVideos(
  callback: (videos: HomeLiveVideo[]) => void
): () => void {
  // Deliver cached or default state immediately
  callback(getCachedHomeLiveVideos());

  const docRef = doc(db, 'site_content', 'home_live_videos');

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const videosList: HomeLiveVideo[] = data?.videos || data?.data?.videos || [];
        if (Array.isArray(videosList) && videosList.length > 0) {
          const sorted = [...videosList].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
          setCachedHomeLiveVideos(sorted);
          callback(sorted);
          return;
        }
      }
      callback(getCachedHomeLiveVideos());
    },
    (error) => {
      console.warn('Firestore Home Live Videos sync error:', error);
      callback(getCachedHomeLiveVideos());
    }
  );

  return unsubscribe;
}

/**
 * Persists the entire list of home live videos to Firestore and local cache
 */
export async function saveHomeLiveVideos(videos: HomeLiveVideo[]): Promise<void> {
  const sorted = [...videos].map((v, idx) => ({ ...v, orderIndex: idx }));
  setCachedHomeLiveVideos(sorted);

  const docRef = doc(db, 'site_content', 'home_live_videos');
  await setDoc(
    docRef,
    {
      id: 'home_live_videos',
      contentKey: 'home_live_videos',
      videos: sorted,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );
}

/**
 * Adds multiple newly uploaded videos in one atomic operation
 */
export async function addMultipleHomeLiveVideos(newVideos: Omit<HomeLiveVideo, 'orderIndex'>[]): Promise<void> {
  const current = getCachedHomeLiveVideos();
  const formatted: HomeLiveVideo[] = newVideos.map((v, i) => ({
    ...v,
    orderIndex: current.length + i
  }));
  const combined = [...current, ...formatted];
  await saveHomeLiveVideos(combined);
}

/**
 * Deletes a video and cleans up any associated Cloud Storage file
 */
export async function deleteHomeLiveVideo(id: string, storagePath?: string): Promise<void> {
  const current = getCachedHomeLiveVideos();
  const updated = current.filter(v => v.id !== id);
  await saveHomeLiveVideos(updated);

  if (storagePath) {
    try {
      await deleteCloudMediaObject(storagePath);
    } catch (err) {
      console.warn('Could not delete storage file for deleted home live video:', err);
    }
  }
}

/**
 * Resets home live videos back to the authentic 53rd year festival defaults
 */
export async function resetHomeLiveVideos(): Promise<void> {
  await saveHomeLiveVideos(DEFAULT_HOME_LIVE_VIDEOS);
}
