/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { cleanDevanagariSpelling } from '../utils/spellingSanitizer';
import defaultLogoImg from '../assets/branding/Mandal logo Maroon Transparent BG.png';

export interface SiteBrandingConfig {
  logoUrl: string;
  logoAltMR: string;
  logoAltEN: string;
  logoWidth?: number;
  storagePath?: string;
  isCustomLogo?: boolean;
  updatedAt?: string;
}

export interface HeaderTitleConfig {
  titleMR: string;
  titleEN: string;
  badgeMR: string;
  badgeEN: string;
  subtitleMR: string;
  subtitleEN: string;
  invocationMR: string;
  invocationEN: string;
  updatedAt?: string;
}

export const DEFAULT_BRANDING_CONFIG: SiteBrandingConfig = {
  logoUrl: defaultLogoImg,
  logoAltMR: 'श्री यंग ईश्वटी नवरात्रौत्सव मंडळ - अधिकृत बोधचिन्ह',
  logoAltEN: 'Shree Young Ishwati Navratrotsav Mandal Official Logo',
  logoWidth: 80,
  isCustomLogo: false
};

export const DEFAULT_HEADER_CONFIG: HeaderTitleConfig = {
  titleMR: 'श्री यंग इश्वटी नवरात्रौत्सव मंडळ',
  titleEN: 'Shree Young Ishwati Navratrotsav Mandal',
  badgeMR: 'देवस्थान',
  badgeEN: 'Devasthan',
  subtitleMR: 'श्रद्धा • भक्ती • परंपरा • सेवा',
  subtitleEN: 'Shree Ishwatichi Mata Devasthan Trust • Estd 1974',
  invocationMR: '|| श्री इश्वटीची माता की जय! अधिकृत डिजिटल कक्षात स्वागत ||',
  invocationEN: '|| Hail Shree Ishwatichi Mata! Welcome to Official Digital Portal ||'
};

const BRANDING_CACHE_KEY = 'mandal_branding_config_cache';
const HEADER_CACHE_KEY = 'mandal_header_config_cache';

export function getCachedBranding(): SiteBrandingConfig {
  try {
    const raw = localStorage.getItem(BRANDING_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.logoUrl === 'string') {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_BRANDING_CONFIG;
}

export function setCachedBranding(config: SiteBrandingConfig): void {
  try {
    localStorage.setItem(BRANDING_CACHE_KEY, JSON.stringify(config));
  } catch {}
}

export function getCachedHeaderConfig(): HeaderTitleConfig {
  try {
    const raw = localStorage.getItem(HEADER_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.titleMR === 'string') {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_HEADER_CONFIG;
}

export function setCachedHeaderConfig(config: HeaderTitleConfig): void {
  try {
    localStorage.setItem(HEADER_CACHE_KEY, JSON.stringify(config));
  } catch {}
}

/**
 * Real-time listener for Logo and Branding configurations
 */
export function subscribeBranding(
  onUpdate: (config: SiteBrandingConfig) => void,
  onError?: (err: unknown) => void
): () => void {
  // Emit cached or default immediately
  onUpdate(getCachedBranding());

  return onSnapshot(
    doc(db, 'site_content', 'branding'),
    (snap) => {
      if (snap.exists()) {
        const docData = snap.data();
        const data = docData.data || docData;
        const merged: SiteBrandingConfig = {
          ...DEFAULT_BRANDING_CONFIG,
          ...data,
          logoUrl: data.logoUrl || defaultLogoImg
        };
        setCachedBranding(merged);
        onUpdate(cleanDevanagariSpelling(merged));
      } else {
        onUpdate(DEFAULT_BRANDING_CONFIG);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'site_content/branding');
      if (onError) onError(err);
    }
  );
}

/**
 * Saves or updates Logo Branding in Firestore
 */
export async function saveBranding(config: Partial<SiteBrandingConfig>): Promise<void> {
  const current = getCachedBranding();
  const updated: SiteBrandingConfig = {
    ...current,
    ...config,
    updatedAt: new Date().toISOString()
  };

  const payload = {
    id: 'branding',
    contentKey: 'branding',
    data: cleanDevanagariSpelling(updated),
    updatedAt: updated.updatedAt
  };

  await setDoc(doc(db, 'site_content', 'branding'), payload, { merge: true });
  setCachedBranding(updated);
}

/**
 * Resets Logo Branding to default official asset
 */
export async function resetBrandingToDefault(): Promise<void> {
  await saveBranding({
    logoUrl: defaultLogoImg,
    isCustomLogo: false,
    storagePath: ''
  });
}

/**
 * Real-time listener for Header Title and Tagline configurations
 */
export function subscribeHeaderConfig(
  onUpdate: (config: HeaderTitleConfig) => void,
  onError?: (err: unknown) => void
): () => void {
  // Emit cached or default immediately
  onUpdate(getCachedHeaderConfig());

  return onSnapshot(
    doc(db, 'site_content', 'header'),
    (snap) => {
      if (snap.exists()) {
        const docData = snap.data();
        const data = docData.data || docData;
        const merged: HeaderTitleConfig = {
          ...DEFAULT_HEADER_CONFIG,
          ...data
        };
        setCachedHeaderConfig(merged);
        onUpdate(cleanDevanagariSpelling(merged));
      } else {
        onUpdate(DEFAULT_HEADER_CONFIG);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'site_content/header');
      if (onError) onError(err);
    }
  );
}

/**
 * Saves or updates Header Title in Firestore
 */
export async function saveHeaderConfig(config: Partial<HeaderTitleConfig>): Promise<void> {
  const current = getCachedHeaderConfig();
  const updated: HeaderTitleConfig = {
    ...current,
    ...config,
    updatedAt: new Date().toISOString()
  };

  const payload = {
    id: 'header',
    contentKey: 'header',
    data: cleanDevanagariSpelling(updated),
    updatedAt: updated.updatedAt
  };

  await setDoc(doc(db, 'site_content', 'header'), payload, { merge: true });
  setCachedHeaderConfig(updated);
}

/**
 * Resets Header Title to authentic defaults
 */
export async function resetHeaderConfigToDefault(): Promise<void> {
  await saveHeaderConfig(DEFAULT_HEADER_CONFIG);
}
