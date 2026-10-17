/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DevoteeExperience {
  id: string;
  name: string;
  location: string;
  story: string;
  approved: boolean;
  date: string;
  avatarUrl?: string;
  rating?: number;
}

export interface DigitalSevaBooking {
  id: string;
  type: 'aarti' | 'pooja' | 'sankalp' | 'prasad' | 'volunteer';
  subType: string;
  devoteeName: string;
  gotra?: string;
  phone: string;
  email: string;
  date: string;
  status: 'confirmed' | 'pending';
}

export interface DonationRecord {
  id: string;
  donorName: string;
  amount: number;
  paymentMethod: string;
  phone: string;
  email: string;
  pan?: string;
  utr?: string;
  date: string;
  category: string;
}

export interface TempleEvent {
  id: string;
  title: string;
  titleMarathi: string;
  description: string;
  descriptionMarathi: string;
  date: string;
  time: string;
  category: string;
  rsvpCount: number;
  image?: string;
}

export interface Announcement {
  id: string;
  title: string;
  titleMarathi: string;
  category: 'Notice' | 'Festival' | 'Press' | 'Event';
  date: string;
  content: string;
  contentMarathi: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  gotra: string;
  streakCount: number;
  lastPrayerDate: string; // YYYY-MM-DD
  milestonesReached: { id: string; title: string; date: string }[];
  totalDonation: number;
  navratriThemeDay?: number | 'auto'; // Day 1 to 9 or 'auto'
  navratriThemeDate?: string; // IST date (YYYY-MM-DD) when manual theme was set
}
