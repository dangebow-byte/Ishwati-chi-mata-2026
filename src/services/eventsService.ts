/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { TempleEvent } from '../types';
import { INITIAL_EVENTS } from '../data';
import { cleanDevanagariSpelling } from '../utils/spellingSanitizer';

const EVENTS_CACHE_KEY = 'mandal_temple_events_cache';

export function getCachedEvents(): TempleEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return INITIAL_EVENTS;
}

export function setCachedEvents(events: TempleEvent[]): void {
  try {
    localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(events));
  } catch {}
}

/**
 * Real-time subscription to Utsav Schedule Events
 */
export function subscribeTempleEvents(
  onUpdate: (events: TempleEvent[]) => void,
  onError?: (err: unknown) => void
): () => void {
  // Emit initial cached or default events
  onUpdate(getCachedEvents());

  return onSnapshot(
    collection(db, 'events'),
    (snapshot) => {
      const list: TempleEvent[] = [];
      snapshot.forEach((docSnap) => {
        list.push(cleanDevanagariSpelling(docSnap.data() as TempleEvent));
      });
      list.sort((a, b) => a.date.localeCompare(b.date));
      if (list.length > 0) {
        setCachedEvents(list);
        onUpdate(list);
      } else {
        onUpdate(INITIAL_EVENTS);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'events');
      if (onError) onError(err);
    }
  );
}

/**
 * Add a new Utsav Schedule event
 */
export async function addTempleEvent(event: TempleEvent): Promise<void> {
  const sanitized = cleanDevanagariSpelling(event);
  await setDoc(doc(db, 'events', event.id), sanitized);
  const current = getCachedEvents();
  const updated = [...current.filter(e => e.id !== event.id), sanitized].sort((a, b) => a.date.localeCompare(b.date));
  setCachedEvents(updated);
}

/**
 * Update an existing Utsav Schedule event
 */
export async function updateTempleEvent(id: string, updates: Partial<TempleEvent>): Promise<void> {
  const sanitized = cleanDevanagariSpelling(updates);
  await updateDoc(doc(db, 'events', id), sanitized);
  const current = getCachedEvents();
  const updated = current.map(e => e.id === id ? { ...e, ...sanitized } : e);
  setCachedEvents(updated);
}

/**
 * Delete an Utsav Schedule event
 */
export async function deleteTempleEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, 'events', id));
  const current = getCachedEvents();
  const filtered = current.filter(e => e.id !== id);
  setCachedEvents(filtered);
}

/**
 * Reset Utsav Schedule events to initial authentic temple events
 */
export async function resetEventsToDefault(): Promise<void> {
  for (const evt of INITIAL_EVENTS) {
    await setDoc(doc(db, 'events', evt.id), cleanDevanagariSpelling(evt), { merge: true });
  }
  setCachedEvents(INITIAL_EVENTS);
}
