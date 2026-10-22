/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface VisarjanBannerConfig {
  id: string;
  isVisible: boolean; // Show/Hide toggle
  bannerImageUrl: string;
  titleEn: string;
  titleMr: string;
  subtitleEn: string;
  subtitleMr: string;
  dateEn: string;
  dateMr: string;
  timeEn: string;
  timeMr: string;
  routeEn: string;
  routeMr: string;
  specialAttractionEn: string;
  specialAttractionMr: string;
  durationSeconds: number; // Flash timer (default 60s)
  soundEnabledByDefault: boolean;
  showDecorations: boolean; // Side fireworks and festive crackers
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_VISARJAN_BANNER_CONFIG: VisarjanBannerConfig = {
  id: 'primary_visarjan_banner',
  isVisible: true,
  bannerImageUrl: '/assets/aistudio/visarjan_banner_clean.png',
  titleEn: '53rd Year Grand Visarjan Miravnuk 2026',
  titleMr: '५३ वे वर्ष : श्री इश्वटीची माता भव्य विसर्जन सोहळा',
  subtitleEn: '53rd Year Visarjan Sohala',
  subtitleMr: '५३ वे वर्ष विसर्जन सोहळा',
  dateEn: 'Wed, 21 Oct 2026',
  dateMr: 'बुधवार, २१ ऑक्टोबर २०२६',
  timeEn: '6:00 PM Onwards',
  timeMr: 'सायंकाळी ६:०० वाजता',
  routeEn: 'Ishwati Prasad Ground to Kalachowki Naka',
  routeMr: 'इश्वटी प्रसाद पटांगण ते काळाचौकी नाका',
  specialAttractionEn: 'Sai Musical Group - Govandi',
  specialAttractionMr: 'साई म्युझिकल ग्रुप - गोवंडी',
  durationSeconds: 60,
  soundEnabledByDefault: true,
  showDecorations: true,
  updatedAt: '2026-10-21T18:00:00.000Z'
};

const STORAGE_KEY = 'ishwatichi_visarjan_banner_config';

/**
 * Retrieves the currently cached Visarjan banner config from localStorage,
 * falling back gracefully to authentic festival defaults.
 */
export const getCachedVisarjanBannerConfig = (): VisarjanBannerConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_VISARJAN_BANNER_CONFIG,
        ...parsed,
        id: 'primary_visarjan_banner'
      };
    }
  } catch {
    // Graceful fallback to default
  }
  return DEFAULT_VISARJAN_BANNER_CONFIG;
};

/**
 * Saves configuration to localStorage cache.
 */
const cacheVisarjanBannerConfig = (config: VisarjanBannerConfig) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage quote errors
  }
};

/**
 * Subscribes to real-time Visarjan Banner config updates from Firestore,
 * with resilient offline/cache fallback.
 */
export const subscribeVisarjanBannerConfig = (
  callback: (config: VisarjanBannerConfig) => void
): (() => void) => {
  // Emit initial cached value immediately
  callback(getCachedVisarjanBannerConfig());

  try {
    const docRef = doc(db, 'site_content', 'visarjan_banner');
    const unsub = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const remoteData = docSnap.data();
          const merged: VisarjanBannerConfig = {
            ...DEFAULT_VISARJAN_BANNER_CONFIG,
            ...(remoteData.data || remoteData),
            id: 'primary_visarjan_banner'
          };
          cacheVisarjanBannerConfig(merged);
          callback(merged);
        }
      },
      (err) => {
        console.warn('Visarjan banner config sync warning (using cached mode):', err);
      }
    );
    return unsub;
  } catch (err) {
    console.warn('Could not establish real-time listener for visarjan banner:', err);
    return () => {};
  }
};

/**
 * Saves/updates Visarjan banner configuration in Firestore and local cache.
 */
export const saveVisarjanBannerConfig = async (
  updates: Partial<VisarjanBannerConfig>,
  userEmail?: string
): Promise<VisarjanBannerConfig> => {
  const current = getCachedVisarjanBannerConfig();
  const nextConfig: VisarjanBannerConfig = {
    ...current,
    ...updates,
    id: 'primary_visarjan_banner',
    updatedAt: new Date().toISOString(),
    updatedBy: userEmail || current.updatedBy || 'admin'
  };

  cacheVisarjanBannerConfig(nextConfig);

  try {
    const docRef = doc(db, 'site_content', 'visarjan_banner');
    await setDoc(docRef, {
      id: 'visarjan_banner',
      contentKey: 'visarjan_banner',
      data: nextConfig,
      updatedAt: nextConfig.updatedAt
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore write warning for visarjan banner:', err);
  }

  return nextConfig;
};

/**
 * Toggles the public visibility (Show/Hide) of the Visarjan Miravnuk banner.
 */
export const toggleVisarjanBannerVisibility = async (
  isVisible: boolean,
  userEmail?: string
): Promise<VisarjanBannerConfig> => {
  return saveVisarjanBannerConfig({ isVisible }, userEmail);
};

/**
 * Resets the Visarjan banner configuration to authentic defaults.
 */
export const resetVisarjanBannerConfig = async (
  userEmail?: string
): Promise<VisarjanBannerConfig> => {
  const resetConfig: VisarjanBannerConfig = {
    ...DEFAULT_VISARJAN_BANNER_CONFIG,
    updatedAt: new Date().toISOString(),
    updatedBy: userEmail || 'admin'
  };

  cacheVisarjanBannerConfig(resetConfig);

  try {
    const docRef = doc(db, 'site_content', 'visarjan_banner');
    await setDoc(docRef, {
      id: 'visarjan_banner',
      contentKey: 'visarjan_banner',
      data: resetConfig,
      updatedAt: resetConfig.updatedAt
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore reset warning for visarjan banner:', err);
  }

  return resetConfig;
};
