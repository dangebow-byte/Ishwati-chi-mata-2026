/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile } from '../types';

/**
 * Normalizes any date input (ISO string, timestamp, date string, or Date object)
 * into a standardized 'YYYY-MM-DD' calendar date string strictly derived via UTC.
 * 
 * By extracting UTC year, month, and day (e.g. from `.toISOString().split('T')[0]` or
 * `.getUTCFullYear()`, `.getUTCMonth()`, `.getUTCDate()`), date comparisons remain
 * completely immune to client time zones, daylight saving transitions, or local clock boundaries.
 */
export const normalizeToUTCDateString = (input?: string | number | Date | null): string => {
  if (!input) return '';

  if (typeof input === 'string') {
    const trimmed = input.trim();
    // Fast path: if string starts with YYYY-MM-DD
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymdMatch) {
      // If it contains time and timezone information (like '2026-10-10T18:30:00Z'),
      // parse it with Date to respect the UTC conversion
      if (trimmed.includes('T') || trimmed.includes(':')) {
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString().split('T')[0];
        }
      }
      // Pure calendar date string like '2026-10-11'
      const year = ymdMatch[1];
      const month = ymdMatch[2].padStart(2, '0');
      const day = ymdMatch[3].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  const d = new Date(input);
  if (isNaN(d.getTime())) return '';

  return d.toISOString().split('T')[0];
};

/**
 * Backwards compatibility alias for normalizeToUTCDateString
 */
export const normalizeToDateString = normalizeToUTCDateString;

/**
 * Returns today's ISO date string 'YYYY-MM-DD' strictly retrieved via UTC
 */
export const getTodayUTCDateString = (refDate: Date = new Date()): string => {
  return refDate.toISOString().split('T')[0];
};

/**
 * Backwards compatibility alias for getTodayUTCDateString
 */
export const getTodayDateString = getTodayUTCDateString;

/**
 * Returns yesterday's ISO date string 'YYYY-MM-DD' strictly retrieved via UTC
 */
export const getYesterdayUTCDateString = (refDate: Date = new Date()): string => {
  const d = new Date(refDate.getTime() - 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
};

/**
 * Backwards compatibility alias for getYesterdayUTCDateString
 */
export const getYesterdayDateString = getYesterdayUTCDateString;

/**
 * Calculate difference in calendar days between two dates strictly using UTC calendar dates.
 * 
 * Returns:
 *   0  -> Same UTC calendar day
 *   1  -> Exactly consecutive UTC calendar days (yesterday to today)
 *  >1  -> More than 1 day apart (streak broken)
 *  <0  -> Negative or future day (same day / clock skew safety)
 */
export const getDayDifference = (
  fromDateInput: string | number | Date | null | undefined, 
  toDateInput: string | number | Date | null | undefined
): number => {
  const fromStr = normalizeToUTCDateString(fromDateInput);
  const toStr = normalizeToUTCDateString(toDateInput);

  if (!fromStr || !toStr) return Infinity;

  const [y1, m1, d1] = fromStr.split('-').map(Number);
  const [y2, m2, d2] = toStr.split('-').map(Number);

  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return Infinity;

  // Use UTC timestamps for accurate calendar day arithmetic
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((utc2 - utc1) / MS_PER_DAY);
};

export interface CheckInResult {
  alreadyCheckedIn: boolean;
  newStreak: number;
  newMilestones: { id: string; title: string; date: string }[];
  todayStr: string;
}

/**
 * Accurately process a daily devotional check-in / Diya lighting.
 * 
 * All date checks and comparisons rely exclusively on ISO date strings in 'YYYY-MM-DD'
 * format retrieved via UTC, preventing erroneous streak resets across different
 * time zones or day boundaries.
 * 
 * Rules:
 * 1. UTC Date Normalization: Both `lastPrayerDate` and `currentTime` are normalized to 'YYYY-MM-DD' via UTC.
 * 2. Same UTC Day (dayDiff === 0 or normalizedLastPrayer === todayStr):
 *    Already checked in today. Preserves current streak without re-incrementing or resetting.
 * 3. Consecutive UTC Day (dayDiff === 1):
 *    Devotee checked in yesterday (UTC) and continues their streak today.
 *    Streak increments by 1.
 * 4. Clock Skew / Intra-day Safety (dayDiff <= 0):
 *    Safe fallback for same-day actions or slight timezone clock variance.
 * 5. Missed Days (dayDiff > 1 or no previous check-in):
 *    Streak accurately starts/resets to Day 1.
 * 6. Milestone Allocation:
 *    Ensures devotee milestone badges are allocated dynamically with the UTC date string.
 */
export const calculateDevoteeCheckIn = (profile: UserProfile, currentTime?: Date): CheckInResult => {
  const now = currentTime || new Date();
  const todayStr = getTodayUTCDateString(now);
  const rawLastPrayer = profile.lastPrayerDate;
  const normalizedLastPrayer = normalizeToUTCDateString(rawLastPrayer);

  // 1. Check if already checked in today in UTC calendar date
  if (normalizedLastPrayer === todayStr) {
    return {
      alreadyCheckedIn: true,
      newStreak: Math.max(1, profile.streakCount),
      newMilestones: profile.milestonesReached || [],
      todayStr
    };
  }

  // 2. Compute calendar day difference in UTC
  const dayDiff = getDayDifference(normalizedLastPrayer, todayStr);

  let newStreak = 1;

  if (dayDiff <= 0 && normalizedLastPrayer) {
    // Edge case: Timezone skew or intra-day check-in
    return {
      alreadyCheckedIn: true,
      newStreak: Math.max(1, profile.streakCount),
      newMilestones: profile.milestonesReached || [],
      todayStr
    };
  } else if (dayDiff === 1 && profile.streakCount > 0) {
    // Exactly consecutive UTC day: increment streak
    newStreak = profile.streakCount + 1;
  } else {
    // First-time devotee or missed one or more days: start at Day 1
    newStreak = 1;
  }

  // 3. Update milestones
  const milestones = [...(profile.milestonesReached || [])];

  if (!milestones.some(m => m.id === 'mil-1')) {
    milestones.push({
      id: 'mil-1',
      title: 'Prarambhik Bhakta (First Holy Darshan)',
      date: todayStr
    });
  }

  if (newStreak >= 3 && !milestones.some(m => m.id === 'mil-3')) {
    milestones.push({
      id: 'mil-3',
      title: 'Nitya Dharmee Badge (Regular Practitioner)',
      date: todayStr
    });
  }

  if (newStreak >= 5 && !milestones.some(m => m.id === 'mil-5')) {
    milestones.push({
      id: 'mil-5',
      title: 'Ananya Upasak Badge (Deeply Devoted)',
      date: todayStr
    });
  }

  return {
    alreadyCheckedIn: false,
    newStreak,
    newMilestones: milestones,
    todayStr
  };
};

/**
 * Returns current valid active streak for display when loading profile.
 * If user hasn't checked in today or yesterday (in UTC), active streak is 0 until they check in.
 */
export const getActiveDevoteeStreak = (profile: UserProfile, currentTime?: Date): number => {
  const now = currentTime || new Date();
  const todayStr = getTodayUTCDateString(now);
  const normalizedLastPrayer = normalizeToUTCDateString(profile.lastPrayerDate);

  if (!normalizedLastPrayer) {
    return 0;
  }

  if (normalizedLastPrayer === todayStr) {
    return Math.max(1, profile.streakCount);
  }

  const dayDiff = getDayDifference(normalizedLastPrayer, todayStr);
  if (dayDiff === 1) {
    // Valid streak from yesterday (UTC) awaiting today's check-in
    return Math.max(1, profile.streakCount);
  }

  // Streak lapsed
  return 0;
};

/**
 * Sanitizes and normalizes a devotee profile retrieved from storage or API.
 * Ensures that if the devotee has not checked in today or yesterday,
 * streak count is accurately zeroed out so that lighting a Diya or checking in today
 * correctly registers as Day 1 (not Day 3 or an outdated stale count).
 */
export const sanitizeDevoteeProfile = (rawProfile: any, currentTime?: Date): UserProfile => {
  if (!rawProfile || typeof rawProfile !== 'object') {
    return {
      name: 'Sanjay Deshpande',
      phone: '+91 94825 00000',
      email: 'dsanjay@spiritual.in',
      gotra: 'Bharadwaj',
      streakCount: 0,
      lastPrayerDate: '',
      milestonesReached: [],
      totalDonation: 0
    };
  }

  const now = currentTime || new Date();
  const todayStr = getTodayUTCDateString(now);
  const normalizedLastPrayer = normalizeToUTCDateString(rawProfile.lastPrayerDate);

  let validStreak = typeof rawProfile.streakCount === 'number' ? rawProfile.streakCount : 0;

  if (!normalizedLastPrayer) {
    validStreak = 0;
  } else if (normalizedLastPrayer === todayStr) {
    // Checked in today: streak count is at least 1
    validStreak = Math.max(1, validStreak);
  } else {
    const dayDiff = getDayDifference(normalizedLastPrayer, todayStr);
    if (dayDiff === 1) {
      // Checked in yesterday: valid ongoing streak awaiting today's check-in
      validStreak = Math.max(1, validStreak);
    } else {
      // Checked in more than 1 day ago or historical dummy date: streak lapsed, resets to 0
      validStreak = 0;
    }
  }

  return {
    name: rawProfile.name || 'Sanjay Deshpande',
    phone: rawProfile.phone || '+91 94825 00000',
    email: rawProfile.email || 'dsanjay@spiritual.in',
    gotra: rawProfile.gotra || 'Bharadwaj',
    streakCount: validStreak,
    lastPrayerDate: normalizedLastPrayer,
    milestonesReached: Array.isArray(rawProfile.milestonesReached) ? rawProfile.milestonesReached : [],
    totalDonation: typeof rawProfile.totalDonation === 'number' ? rawProfile.totalDonation : 0
  };
};
