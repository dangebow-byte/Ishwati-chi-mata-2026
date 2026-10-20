/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { cleanDevanagariSpelling } from '../utils/spellingSanitizer';
import { DEFAULT_SITE_CONTENT } from '../data';

export interface HistoricalMilestone {
  id: string;
  year: string;
  title: string;
  titleMarathi: string;
  description: string;
  descriptionMarathi: string;
  displayOrder?: number;
  badgeMR?: string;
  badgeEN?: string;
}

export const DEFAULT_MILESTONES: HistoricalMilestone[] = DEFAULT_SITE_CONTENT.milestones.map((m, idx) => ({
  id: `milestone-${idx + 1}`,
  year: m.year,
  title: m.title,
  titleMarathi: m.titleMarathi,
  description: m.description,
  descriptionMarathi: m.descriptionMarathi,
  displayOrder: idx + 1,
  badgeMR: 'महत्त्वाचा टप्पा',
  badgeEN: 'Verified Milestone'
}));

const MILESTONES_CACHE_KEY = 'mandal_historical_milestones_cache';

export function getCachedMilestones(): HistoricalMilestone[] {
  try {
    const raw = localStorage.getItem(MILESTONES_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_MILESTONES;
}

export function setCachedMilestones(items: HistoricalMilestone[]): void {
  try {
    localStorage.setItem(MILESTONES_CACHE_KEY, JSON.stringify(items));
  } catch {}
}

/**
 * Real-time subscription to Historical Journey Milestones (ऐतिहासिक प्रवास आलेख)
 */
export function subscribeMilestones(
  onUpdate: (items: HistoricalMilestone[]) => void,
  onError?: (err: unknown) => void
): () => void {
  // Emit initial cached or default items immediately
  onUpdate(getCachedMilestones());

  return onSnapshot(
    doc(db, 'site_content', 'milestones'),
    (snap) => {
      if (snap.exists()) {
        const docData = snap.data();
        const rawItems = docData.data?.items || docData.items || (Array.isArray(docData.data) ? docData.data : null);
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          const formatted: HistoricalMilestone[] = rawItems.map((item: any, idx: number) => ({
            id: item.id || `milestone-${item.year || idx}`,
            year: item.year || '',
            title: item.title || '',
            titleMarathi: item.titleMarathi || '',
            description: item.description || '',
            descriptionMarathi: item.descriptionMarathi || '',
            displayOrder: item.displayOrder || idx + 1,
            badgeMR: item.badgeMR || 'महत्त्वाचा टप्पा',
            badgeEN: item.badgeEN || 'Verified Milestone'
          }));
          formatted.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setCachedMilestones(formatted);
          onUpdate(cleanDevanagariSpelling(formatted));
          return;
        }
      }
      onUpdate(DEFAULT_MILESTONES);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'site_content/milestones');
      if (onError) onError(err);
    }
  );
}

/**
 * Saves all milestones to Firestore
 */
export async function saveMilestones(items: HistoricalMilestone[]): Promise<void> {
  const sorted = [...items].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const payload = {
    id: 'milestones',
    contentKey: 'milestones',
    data: {
      items: cleanDevanagariSpelling(sorted)
    },
    updatedAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'site_content', 'milestones'), payload, { merge: true });
  setCachedMilestones(sorted);
}

/**
 * Add a new Historical Milestone
 */
export async function addMilestone(item: Omit<HistoricalMilestone, 'id'> & { id?: string }): Promise<void> {
  const current = getCachedMilestones();
  const maxOrder = current.reduce((max, i) => Math.max(max, i.displayOrder || 0), 0);
  const newMilestone: HistoricalMilestone = {
    ...item,
    id: item.id || `milestone-${Date.now()}`,
    displayOrder: item.displayOrder || maxOrder + 1,
    badgeMR: item.badgeMR || 'महत्त्वाचा टप्पा',
    badgeEN: item.badgeEN || 'Verified Milestone'
  };

  await saveMilestones([...current, newMilestone]);
}

/**
 * Update an existing Milestone
 */
export async function updateMilestone(idOrYear: string, updates: Partial<HistoricalMilestone>): Promise<void> {
  const current = getCachedMilestones();
  const updatedList = current.map(item => {
    if (item.id === idOrYear || item.year === idOrYear) {
      return { ...item, ...updates };
    }
    return item;
  });

  await saveMilestones(updatedList);
}

/**
 * Delete a Milestone
 */
export async function deleteMilestone(idOrYear: string): Promise<void> {
  const current = getCachedMilestones();
  const filtered = current.filter(item => item.id !== idOrYear && item.year !== idOrYear);
  const reindexed = filtered.map((item, idx) => ({
    ...item,
    displayOrder: idx + 1
  }));

  await saveMilestones(reindexed);
}

/**
 * Reset Milestones to official authentic foundation timeline
 */
export async function resetMilestonesToDefault(): Promise<void> {
  await saveMilestones(DEFAULT_MILESTONES);
}
