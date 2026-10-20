/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, setDoc, deleteDoc, onSnapshot, collection } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { cleanDevanagariSpelling } from '../utils/spellingSanitizer';
export { 
  type NavratriPatrikaDay, 
  type PatrikaSubEvent, 
  NAVRATRI_PATRIKA_2026, 
  MANDAL_PATRIKA_METADATA 
} from '../data/navratriPatrika2026';
import { 
  NavratriPatrikaDay, 
  NAVRATRI_PATRIKA_2026, 
  MANDAL_PATRIKA_METADATA 
} from '../data/navratriPatrika2026';

export type PatrikaMetadata = typeof MANDAL_PATRIKA_METADATA;

const PATRIKA_DAYS_CACHE_KEY = 'mandal_patrika_days_cache';
const PATRIKA_METADATA_CACHE_KEY = 'mandal_patrika_metadata_cache';

export function getCachedPatrikaDays(): NavratriPatrikaDay[] {
  try {
    const raw = localStorage.getItem(PATRIKA_DAYS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return NAVRATRI_PATRIKA_2026;
}

export function setCachedPatrikaDays(days: NavratriPatrikaDay[]): void {
  try {
    localStorage.setItem(PATRIKA_DAYS_CACHE_KEY, JSON.stringify(days));
  } catch {}
}

export function getCachedPatrikaMetadata(): PatrikaMetadata {
  try {
    const raw = localStorage.getItem(PATRIKA_METADATA_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.mandalNameMr === 'string') {
        return parsed;
      }
    }
  } catch {}
  return MANDAL_PATRIKA_METADATA;
}

export function setCachedPatrikaMetadata(metadata: PatrikaMetadata): void {
  try {
    localStorage.setItem(PATRIKA_METADATA_CACHE_KEY, JSON.stringify(metadata));
  } catch {}
}

/**
 * Real-time subscription to Karyakram Patrika days
 */
export function subscribeKaryakramPatrika(
  onUpdateDays: (days: NavratriPatrikaDay[]) => void,
  onUpdateMeta?: (meta: PatrikaMetadata) => void,
  onError?: (err: unknown) => void
): () => void {
  // Emit initial cached/defaults
  onUpdateDays(getCachedPatrikaDays());
  if (onUpdateMeta) onUpdateMeta(getCachedPatrikaMetadata());

  // Listen to collection or site_content doc
  const unsubDoc = onSnapshot(
    doc(db, 'site_content', 'patrika_schedule'),
    (snap) => {
      if (snap.exists()) {
        const docData = snap.data();
        const days = docData.data?.days || docData.days;
        const meta = docData.data?.metadata || docData.metadata;

        if (Array.isArray(days) && days.length > 0) {
          const sorted = [...days].sort((a, b) => (a.dayIndex || 0) - (b.dayIndex || 0));
          setCachedPatrikaDays(sorted);
          onUpdateDays(cleanDevanagariSpelling(sorted));
        }

        if (meta && typeof meta === 'object') {
          const mergedMeta = { ...MANDAL_PATRIKA_METADATA, ...meta };
          setCachedPatrikaMetadata(mergedMeta);
          if (onUpdateMeta) onUpdateMeta(cleanDevanagariSpelling(mergedMeta));
        }
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'site_content/patrika_schedule');
      if (onError) onError(err);
    }
  );

  return unsubDoc;
}

/**
 * Saves entire Patrika schedule with days and metadata
 */
export async function saveKaryakramPatrika(days: NavratriPatrikaDay[], metadata?: PatrikaMetadata): Promise<void> {
  const currentMeta = metadata || getCachedPatrikaMetadata();
  const sortedDays = [...days].sort((a, b) => (a.dayIndex || 0) - (b.dayIndex || 0));

  const payload = {
    id: 'patrika_schedule',
    contentKey: 'patrika_schedule',
    data: {
      days: cleanDevanagariSpelling(sortedDays),
      metadata: cleanDevanagariSpelling(currentMeta)
    },
    updatedAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'site_content', 'patrika_schedule'), payload, { merge: true });
  setCachedPatrikaDays(sortedDays);
  if (metadata) setCachedPatrikaMetadata(currentMeta);
}

/**
 * Add a new Patrika Day
 */
export async function addPatrikaDay(newDay: NavratriPatrikaDay): Promise<void> {
  const currentDays = getCachedPatrikaDays();
  const dayId = newDay.id || `patrika-day-${Date.now()}`;
  const dayWithId: NavratriPatrikaDay = {
    ...newDay,
    id: dayId,
    dayIndex: newDay.dayIndex || currentDays.length + 1
  };

  await saveKaryakramPatrika([...currentDays, dayWithId]);
}

/**
 * Update an existing Patrika Day
 */
export async function updatePatrikaDay(id: string, updates: Partial<NavratriPatrikaDay>): Promise<void> {
  const currentDays = getCachedPatrikaDays();
  const updatedDays = currentDays.map(day => {
    if (day.id === id) {
      return { ...day, ...updates };
    }
    return day;
  });

  await saveKaryakramPatrika(updatedDays);
}

/**
 * Delete a Patrika Day
 */
export async function deletePatrikaDay(id: string): Promise<void> {
  const currentDays = getCachedPatrikaDays();
  const filteredDays = currentDays.filter(day => day.id !== id);
  // Re-index remaining days
  const reindexed = filteredDays.map((day, idx) => ({
    ...day,
    dayIndex: idx + 1
  }));

  await saveKaryakramPatrika(reindexed);
}

/**
 * Update Patrika Metadata (Year, Mandal Name, Invocation, Officers, Notice)
 */
export async function updatePatrikaMetadata(updates: Partial<PatrikaMetadata>): Promise<void> {
  const currentMeta = getCachedPatrikaMetadata();
  const updatedMeta: PatrikaMetadata = {
    ...currentMeta,
    ...updates
  };

  const currentDays = getCachedPatrikaDays();
  await saveKaryakramPatrika(currentDays, updatedMeta);
}

/**
 * Reset Karyakram Patrika to official 2026 printed schedule
 */
export async function resetPatrikaToDefault(): Promise<void> {
  await saveKaryakramPatrika(NAVRATRI_PATRIKA_2026, MANDAL_PATRIKA_METADATA);
}
