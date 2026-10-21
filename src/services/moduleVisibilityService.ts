/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export type AppModuleKey =
  | 'hero_banner'
  | 'hero_diya'
  | 'hero_aarti_player'
  | 'live_darshan'
  | 'ashtami_featured_video'
  | 'sacred_soundboard'
  | 'about_heritage'
  | 'historical_milestones'
  | 'helpline_banner'
  | 'patrika_section'
  | 'digital_seva'
  | 'temple_events'
  | 'media_gallery'
  | 'devotee_testimonials'
  | 'donations'
  | 'social_initiatives'
  | 'news_announcements'
  | 'my_profile'
  | 'contact_details'
  | 'footer_section';

export interface ModuleConfigDefinition {
  key: AppModuleKey;
  nameMR: string;
  nameEN: string;
  category: 'home' | 'sanctum' | 'devotion' | 'trust' | 'system';
  categoryLabelMR: string;
  categoryLabelEN: string;
  descriptionMR: string;
  descriptionEN: string;
  icon: string;
  defaultVisible: boolean;
}

export const APP_MODULE_DEFINITIONS: ModuleConfigDefinition[] = [
  // 1. Home Page Components
  {
    key: 'hero_banner',
    nameMR: 'मुख्य हिरो बॅनर व स्वयंभू दर्शन',
    nameEN: 'Hero Banner & Divine Idol Showcase',
    category: 'home',
    categoryLabelMR: 'मुख्य पृष्ठ घटक',
    categoryLabelEN: 'Home Page Components',
    descriptionMR: 'मुख्य पृष्ठावरील श्री इश्वटीची मातेचे स्वयंभू दर्शन, बॅनर व जलद कृती बटणे.',
    descriptionEN: 'Main hero banner with full sanctum idol showcase and quick action portals.',
    icon: '🕉️',
    defaultVisible: true
  },
  {
    key: 'hero_diya',
    nameMR: 'दीप प्रज्वलन सुविधा (Interactive Diya)',
    nameEN: 'Interactive Diya Lighting',
    category: 'home',
    categoryLabelMR: 'मुख्य पृष्ठ घटक',
    categoryLabelEN: 'Home Page Components',
    descriptionMR: 'भक्तांना डिजिटल समई / दिवा तेवत ठेवण्याची सुविधा.',
    descriptionEN: 'Allows devotees to offer a digital flame/diya at the lotus feet.',
    icon: '🪔',
    defaultVisible: true
  },
  {
    key: 'hero_aarti_player',
    nameMR: 'मुख्य पृष्ठावरील आरती ऑडिओ प्लेयर',
    nameEN: 'Home Aarti Audio Player',
    category: 'home',
    categoryLabelMR: 'मुख्य पृष्ठ घटक',
    categoryLabelEN: 'Home Page Components',
    descriptionMR: 'होमपेजवर वाजणारा पवित्र आरतीचा वेब ऑडिओ प्लेयर.',
    descriptionEN: 'Quick holy aarti web audio player embedded on the homepage.',
    icon: '🎵',
    defaultVisible: true
  },
  {
    key: 'helpline_banner',
    nameMR: '२४/७ डिजिटल साहाय्यता कक्ष',
    nameEN: '24/7 Digital Helpline Banner',
    category: 'home',
    categoryLabelMR: 'मुख्य पृष्ठ घटक',
    categoryLabelEN: 'Home Page Components',
    descriptionMR: 'अभिषेक, पूजा व संपर्क साहाय्यता हेल्पलाइन बॅनर.',
    descriptionEN: 'Helpline banner with direct calling and query assistance.',
    icon: '📞',
    defaultVisible: true
  },

  // 2. Sanctum & Media
  {
    key: 'live_darshan',
    nameMR: 'थेट दर्शन व आरती दालन',
    nameEN: 'Live Darshan & Sanctum Stream',
    category: 'sanctum',
    categoryLabelMR: 'दर्शन व पवित्र माध्यमे',
    categoryLabelEN: 'Sanctum & Media Portals',
    descriptionMR: '२४/७ थेट गाभारा दर्शन, कॅमेरा प्रक्षेपण व आरती वेळापत्रक.',
    descriptionEN: '24/7 live camera feeds from the inner sanctum and holy aarti bells.',
    icon: '🎥',
    defaultVisible: true
  },
  {
    key: 'ashtami_featured_video',
    nameMR: 'अष्टमी महाआरती विशेष व्हिडिओ',
    nameEN: 'Ashtami Maha Aarti Featured Video',
    category: 'sanctum',
    categoryLabelMR: 'दर्शन व पवित्र माध्यमे',
    categoryLabelEN: 'Sanctum & Media Portals',
    descriptionMR: 'अष्टमी विशेष महाआरतीचा व्हिडिओ, बोल व आदर्श शिंदे गायन.',
    descriptionEN: 'Featured Ashtami Maha Aarti video player, lyrics and singer credentials.',
    icon: '🎬',
    defaultVisible: true
  },
  {
    key: 'sacred_soundboard',
    nameMR: 'पवित्र ध्वनी व वैदिक मंत्र (Soundboard)',
    nameEN: 'Sacred Soundboard & Chants',
    category: 'sanctum',
    categoryLabelMR: 'दर्शन व पवित्र माध्यमे',
    categoryLabelEN: 'Sanctum & Media Portals',
    descriptionMR: 'शंखनाद, वैदिक मंत्र, स्तोत्रे व तानपुरा ध्वनी संश्लेषण.',
    descriptionEN: 'Interactive soundboard with conch shells, mantras, and drone frequencies.',
    icon: '🔔',
    defaultVisible: true
  },
  {
    key: 'media_gallery',
    nameMR: 'छायाचित्रे, व्हिडिओ व इन्स्टाग्राम रील दालन',
    nameEN: 'Photo, Video & Reel Media Gallery',
    category: 'sanctum',
    categoryLabelMR: 'दर्शन व पवित्र माध्यमे',
    categoryLabelEN: 'Sanctum & Media Portals',
    descriptionMR: 'मंडळाचे एचडी फोटो, व्हिडिओ, युट्यूब व इन्स्टाग्राम रील गॅलरी.',
    descriptionEN: 'HD photos, festival celebration videos, and Instagram reels.',
    icon: '🖼️',
    defaultVisible: true
  },

  // 3. Devotion Portals
  {
    key: 'patrika_section',
    nameMR: 'शारदीय नवरात्रौत्सव कार्यक्रम पत्रिका',
    nameEN: 'Navratri Festival Karyakram Patrika',
    category: 'devotion',
    categoryLabelMR: 'भक्ती व उत्सव दालने',
    categoryLabelEN: 'Devotional Portals',
    descriptionMR: 'अधिकृत ९-दिवसीय कार्यक्रम पत्रिका, दैनिक रंग व वेळ.',
    descriptionEN: 'Official day-by-day festival program schedule and daily color palette.',
    icon: '📜',
    defaultVisible: true
  },
  {
    key: 'digital_seva',
    nameMR: 'डिजिटल सेवा, पूजा व प्रसाद नोंदणी',
    nameEN: 'Digital Seva & Pooja Booking',
    category: 'devotion',
    categoryLabelMR: 'भक्ती व उत्सव दालने',
    categoryLabelEN: 'Devotional Portals',
    descriptionMR: 'अभिषेक, महाआरती, प्रसाद घरपोच व स्वयंसेवक नोंदणी.',
    descriptionEN: 'Online reservations for pooja, home prasad deliveries and volunteering.',
    icon: '🕯️',
    defaultVisible: true
  },
  {
    key: 'temple_events',
    nameMR: 'उत्सव वेळापत्रक व उपस्थिती नोंदणी',
    nameEN: 'Festival Events & RSVP Presence',
    category: 'devotion',
    categoryLabelMR: 'भक्ती व उत्सव दालने',
    categoryLabelEN: 'Devotional Portals',
    descriptionMR: 'मंदिर कार्यक्रम दिनदर्शिका आणि भक्तांची उपस्थिती (RSVP).',
    descriptionEN: 'Temple calendar, upcoming festival events and presence RSVP.',
    icon: '🗓️',
    defaultVisible: true
  },
  {
    key: 'devotee_testimonials',
    nameMR: 'भक्तांचे दैवी अनुभव व साक्ष (Testimonials)',
    nameEN: 'Devotee Experiences & Testimonials',
    category: 'devotion',
    categoryLabelMR: 'भक्ती व उत्सव दालने',
    categoryLabelEN: 'Devotional Portals',
    descriptionMR: 'भाविकांनी अनुभवलेले दैवी अनुभव, साक्ष व अभिप्राय.',
    descriptionEN: 'Miraculous experiences, feedback and stories shared by devotees.',
    icon: '💬',
    defaultVisible: true
  },

  // 4. Trust & Social Portals
  {
    key: 'about_heritage',
    nameMR: 'मंदिराचा इतिहास व दैवी महात्म्य',
    nameEN: 'About Sanctum & Divine Heritage',
    category: 'trust',
    categoryLabelMR: 'इतिहास व सामाजिक कार्य',
    categoryLabelEN: 'Trust & Heritage Portals',
    descriptionMR: 'श्री इश्वटीची मातेचा उगम, गाभारा माहिती व देवस्थान ध्येय.',
    descriptionEN: 'Origin chronicles of Shree Ishwatichi Mata and temple sanctum history.',
    icon: '🏛️',
    defaultVisible: true
  },
  {
    key: 'historical_milestones',
    nameMR: 'ऐतिहासिक प्रवास आलेख (Chronicle Timeline)',
    nameEN: 'Historical Journey Milestones',
    category: 'trust',
    categoryLabelMR: 'इतिहास व सामाजिक कार्य',
    categoryLabelEN: 'Trust & Heritage Portals',
    descriptionMR: '१९७४ पासून २०२६ पर्यंतचा मंडळाचा देदीप्यमान ऐतिहासिक आलेख.',
    descriptionEN: 'Interactive timeline marking historic milestones from 1974 to present.',
    icon: '📜',
    defaultVisible: true
  },
  {
    key: 'donations',
    nameMR: 'देणगी निधी व अन्नछत्र सहकार्य',
    nameEN: 'Donations & 80G Trust Funds',
    category: 'trust',
    categoryLabelMR: 'इतिहास व सामाजिक कार्य',
    categoryLabelEN: 'Trust & Heritage Portals',
    descriptionMR: '८०जी करसवलत देणगी, अन्नछत्र व मंदिर नूतनीकरण निधी.',
    descriptionEN: 'Direct UPI/Bank donations with 80G tax benefits and transparent receipts.',
    icon: '💝',
    defaultVisible: true
  },
  {
    key: 'social_initiatives',
    nameMR: 'समाजकार्य, मोफत दवाखाना व शिक्षण सेवा',
    nameEN: 'Social Welfare & Community Initiatives',
    category: 'trust',
    categoryLabelMR: 'इतिहास व सामाजिक कार्य',
    categoryLabelEN: 'Trust & Heritage Portals',
    descriptionMR: 'अन्नछत्र, गरजू विद्यार्थ्यांना मदत, आरोग्य शिबिरे व समाजोपयोगी उपक्रम.',
    descriptionEN: 'Free meal drives, health clinics, and tribal student educational support.',
    icon: '🤝',
    defaultVisible: true
  },
  {
    key: 'news_announcements',
    nameMR: 'मंडळाची अधिकृत परिपत्रके व सूचना',
    nameEN: 'Board Notices & Circulars',
    category: 'trust',
    categoryLabelMR: 'इतिहास व सामाजिक कार्य',
    categoryLabelEN: 'Trust & Heritage Portals',
    descriptionMR: 'विश्वस्त मंडळाची महत्त्वाची परिपत्रके, सूचना व अपडेट्स.',
    descriptionEN: 'Official trustee circulars, press releases and temple updates.',
    icon: '📢',
    defaultVisible: true
  },

  // 5. System & Layout Modules
  {
    key: 'my_profile',
    nameMR: 'भाविक प्रोफाईल व भक्ती सातत्य गुण',
    nameEN: 'Devotee Profile & Sadhana Streak',
    category: 'system',
    categoryLabelMR: 'प्रणाली व रचना',
    categoryLabelEN: 'System & Layout Modules',
    descriptionMR: 'दैनिक हजेरी, भक्ती सातत्य गुण, सुवर्ण पदके व वैयक्तिक केंद्र.',
    descriptionEN: 'Personalized devotee dashboard with streak badges and donation history.',
    icon: '👤',
    defaultVisible: true
  },
  {
    key: 'contact_details',
    nameMR: 'देवस्थान कार्यालय संपर्क व नकाशा',
    nameEN: 'Office Contact & Directions',
    category: 'system',
    categoryLabelMR: 'प्रणाली व रचना',
    categoryLabelEN: 'System & Layout Modules',
    descriptionMR: 'कार्यालय पत्ता, दूरध्वनी, ईमेल व थेट गुगल मॅप मार्ग.',
    descriptionEN: 'Devasthan office address, official phone, email and location map.',
    icon: '📍',
    defaultVisible: true
  },
  {
    key: 'footer_section',
    nameMR: 'मुख्य तळटीप (Application Footer)',
    nameEN: 'Application Main Footer',
    category: 'system',
    categoryLabelMR: 'प्रणाली व रचना',
    categoryLabelEN: 'System & Layout Modules',
    descriptionMR: 'वेबसाईटच्या सर्वात खाली असणारी मुख्य तळटीप व लिंक्स.',
    descriptionEN: 'Bottom footer with quick links, mandal copyright, and disclaimer.',
    icon: '🔻',
    defaultVisible: true
  }
];

export const DEFAULT_MODULE_VISIBILITY: Record<AppModuleKey, boolean> = APP_MODULE_DEFINITIONS.reduce(
  (acc, item) => {
    acc[item.key] = item.defaultVisible;
    return acc;
  },
  {} as Record<AppModuleKey, boolean>
);

const MODULE_VISIBILITY_CACHE_KEY = 'mandal_module_visibility_cache_v1';

export function getCachedModuleVisibility(): Record<AppModuleKey, boolean> {
  try {
    const raw = localStorage.getItem(MODULE_VISIBILITY_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_MODULE_VISIBILITY, ...parsed };
      }
    }
  } catch {}
  return { ...DEFAULT_MODULE_VISIBILITY };
}

export function setCachedModuleVisibility(visibility: Record<AppModuleKey, boolean>): void {
  try {
    localStorage.setItem(MODULE_VISIBILITY_CACHE_KEY, JSON.stringify(visibility));
  } catch {}
}

/**
 * Subscribes in real-time to Module Visibility preferences
 */
export function subscribeModuleVisibility(
  callback: (visibility: Record<AppModuleKey, boolean>) => void
): () => void {
  callback(getCachedModuleVisibility());

  const unsub = onSnapshot(
    doc(db, 'site_content', 'module_visibility'),
    (docSnap) => {
      if (docSnap.exists()) {
        const val = docSnap.data();
        const serverData = val?.data || val?.visibility;
        if (serverData && typeof serverData === 'object') {
          const merged: Record<AppModuleKey, boolean> = {
            ...DEFAULT_MODULE_VISIBILITY,
            ...serverData
          };
          setCachedModuleVisibility(merged);
          callback(merged);
          return;
        }
      }
      callback(getCachedModuleVisibility());
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'site_content/module_visibility');
      callback(getCachedModuleVisibility());
    }
  );

  return unsub;
}

/**
 * Toggle single module visibility
 */
export async function toggleModuleVisibility(
  key: AppModuleKey,
  isVisible: boolean
): Promise<void> {
  const current = getCachedModuleVisibility();
  const updated = {
    ...current,
    [key]: isVisible
  };
  setCachedModuleVisibility(updated);

  try {
    await setDoc(
      doc(db, 'site_content', 'module_visibility'),
      {
        id: 'module_visibility',
        contentKey: 'module_visibility',
        data: updated,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'site_content/module_visibility');
    throw err;
  }
}

/**
 * Save all module visibilities
 */
export async function updateAllModuleVisibility(
  visibilityMap: Record<AppModuleKey, boolean>
): Promise<void> {
  setCachedModuleVisibility(visibilityMap);

  try {
    await setDoc(
      doc(db, 'site_content', 'module_visibility'),
      {
        id: 'module_visibility',
        contentKey: 'module_visibility',
        data: visibilityMap,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'site_content/module_visibility');
    throw err;
  }
}

/**
 * Reset all module visibilities back to all visible
 */
export async function resetModuleVisibilityToDefault(): Promise<void> {
  return updateAllModuleVisibility({ ...DEFAULT_MODULE_VISIBILITY });
}

/**
 * Checks if a specific module key is visible in the visibility map.
 * Defaults to true if unspecified.
 */
export function isModuleVisible(
  visibilityMap: Record<AppModuleKey, boolean> | undefined,
  key: AppModuleKey
): boolean {
  if (!visibilityMap) return true;
  return visibilityMap[key] !== false;
}
