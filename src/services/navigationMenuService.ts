/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { cleanDevanagariSpelling } from '../utils/spellingSanitizer';

export interface NavigationMenuItem {
  id: string;
  labelMR: string;
  labelEN: string;
  icon: string;
  descMR: string;
  descEN: string;
  isVisible: boolean;
  displayOrder: number;
  isCustom?: boolean;
  targetTab?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_MENU_ITEMS: NavigationMenuItem[] = [
  {
    id: 'home',
    labelMR: 'मुख्य दालन',
    labelEN: 'Home',
    icon: '🏠',
    descMR: 'मुख्य डिजिटल दालन व वैशिष्ट्ये',
    descEN: 'Main digital sanctum & highlights',
    isVisible: true,
    displayOrder: 1,
    isCustom: false
  },
  {
    id: 'about',
    labelMR: 'इतिहास',
    labelEN: 'About Sanctum',
    icon: '🕉️',
    descMR: 'मंदिराचा इतिहास व देवीची आख्यायिका',
    descEN: 'Sanctum history & sacred origin',
    isVisible: true,
    displayOrder: 2,
    isCustom: false
  },
  {
    id: 'patrika',
    labelMR: 'कार्यक्रम पत्रिका',
    labelEN: 'Karyakram Patrika',
    icon: '📜',
    descMR: 'अधिकृत २०२६ नवरात्रौत्सव ९-दिवसीय कार्यक्रम पत्रिका',
    descEN: 'Official 2026 9-Day Navratri Festival Program',
    isVisible: true,
    displayOrder: 3,
    isCustom: false
  },
  {
    id: 'darshan',
    labelMR: 'थेट दर्शन',
    labelEN: 'Live Darshan',
    icon: '🎥',
    descMR: 'थेट दर्शन प्रक्षेपण व घंटानाद',
    descEN: 'Live camera feeds & divine soundboard',
    isVisible: true,
    displayOrder: 4,
    isCustom: false
  },
  {
    id: 'seva',
    labelMR: 'सेवा नोंदणी',
    labelEN: 'Digital Seva',
    icon: '🕯️',
    descMR: 'आरती, अभिषेक पूजा व प्रसाद नोंदणी',
    descEN: 'Book aarti, pooja, prasad & volunteering',
    isVisible: true,
    displayOrder: 5,
    isCustom: false
  },
  {
    id: 'events',
    labelMR: 'उत्सव वेळापत्रक',
    labelEN: 'Events & Utsav',
    icon: '🗓️',
    descMR: 'उत्सव वेळापत्रक व उपस्थिती नोंदणी',
    descEN: 'Festival calendar & RSVP presence',
    isVisible: true,
    displayOrder: 6,
    isCustom: false
  },
  {
    id: 'gallery',
    labelMR: 'छायाचित्रे व व्हिडिओ',
    labelEN: 'Media Gallery',
    icon: '🖼️',
    descMR: 'पवित्र दर्शन छायाचित्रे व व्हिडिओ',
    descEN: 'HD photos, holy darshan & videos',
    isVisible: true,
    displayOrder: 7,
    isCustom: false
  },
  {
    id: 'testimonials',
    labelMR: 'भक्तांचे अनुभव',
    labelEN: 'Testimonials',
    icon: '💬',
    descMR: 'भाविकांचे दैवी अनुभव व साक्ष',
    descEN: 'Devotee divine experiences & stories',
    isVisible: true,
    displayOrder: 8,
    isCustom: false
  },
  {
    id: 'donation',
    labelMR: 'देणगी निधी',
    labelEN: 'Donations',
    icon: '💝',
    descMR: '८०जी करसवलत देणगी व मंदिर निधी',
    descEN: '80G tax exempt trust funds & donations',
    isVisible: true,
    displayOrder: 9,
    isCustom: false
  },
  {
    id: 'social',
    labelMR: 'समाजकार्य',
    labelEN: 'Social Initiatives',
    icon: '🤝',
    descMR: 'अन्नछत्र, मोफत दवाखाना व शिक्षण सेवा',
    descEN: 'Tribal food distribution, clinics & school',
    isVisible: true,
    displayOrder: 10,
    isCustom: false
  },
  {
    id: 'news',
    labelMR: 'परिपत्रके व सूचना',
    labelEN: 'Board Circulars',
    icon: '📢',
    descMR: 'मंडळाची अधिकृत परिपत्रके व सूचना',
    descEN: 'Official temple board circulars & press',
    isVisible: true,
    displayOrder: 11,
    isCustom: false
  },
  {
    id: 'profile',
    labelMR: 'माझे प्रोफाईल',
    labelEN: 'My Profile',
    icon: '🕉️',
    descMR: 'भक्ती सातत्य गुण व सुवर्ण पदके',
    descEN: 'Prayer streak, badges & personalized hub',
    isVisible: true,
    displayOrder: 12,
    isCustom: false
  },
  {
    id: 'admin',
    labelMR: 'विश्वस्त नियंत्रण कक्ष',
    labelEN: 'Admin Station',
    icon: '⚙️',
    descMR: 'अधिकृत विश्वस्त नियंत्रण कक्ष',
    descEN: 'Authorized trustee control station',
    isVisible: true,
    displayOrder: 13,
    isCustom: false
  }
];

const MENU_CACHE_KEY = 'mandal_navigation_menu_cache';

export function getCachedMenuItems(): NavigationMenuItem[] {
  try {
    const raw = localStorage.getItem(MENU_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_MENU_ITEMS;
}

export function setCachedMenuItems(items: NavigationMenuItem[]): void {
  try {
    localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(items));
  } catch {}
}

/**
 * Real-time subscription to Navigation Menu Items
 */
export function subscribeNavigationMenu(
  onUpdate: (items: NavigationMenuItem[]) => void,
  onError?: (err: unknown) => void
): () => void {
  // Emit cached or default immediately
  onUpdate(getCachedMenuItems());

  return onSnapshot(
    doc(db, 'site_content', 'navigation'),
    (snap) => {
      if (snap.exists()) {
        const docData = snap.data();
        const items = docData.data?.items || docData.items;
        if (Array.isArray(items) && items.length > 0) {
          const sorted = [...items].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setCachedMenuItems(sorted);
          onUpdate(cleanDevanagariSpelling(sorted));
          return;
        }
      }
      onUpdate(DEFAULT_MENU_ITEMS);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'site_content/navigation');
      if (onError) onError(err);
    }
  );
}

/**
 * Saves all menu items to Firestore
 */
export async function saveNavigationMenu(items: NavigationMenuItem[]): Promise<void> {
  const sorted = [...items].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const payload = {
    id: 'navigation',
    contentKey: 'navigation',
    data: {
      items: cleanDevanagariSpelling(sorted)
    },
    updatedAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'site_content', 'navigation'), payload, { merge: true });
  setCachedMenuItems(sorted);
}

/**
 * Add a new Menu Item
 */
export async function addNavigationMenuItem(item: Omit<NavigationMenuItem, 'displayOrder'> & { displayOrder?: number }): Promise<void> {
  const current = getCachedMenuItems();
  const maxOrder = current.reduce((max, i) => Math.max(max, i.displayOrder || 0), 0);
  const newItem: NavigationMenuItem = {
    ...item,
    displayOrder: item.displayOrder || maxOrder + 1,
    isCustom: true,
    isVisible: item.isVisible !== false,
    createdAt: new Date().toISOString()
  };

  await saveNavigationMenu([...current, newItem]);
}

/**
 * Update an existing Menu Item
 */
export async function updateNavigationMenuItem(id: string, updates: Partial<NavigationMenuItem>): Promise<void> {
  const current = getCachedMenuItems();
  const updatedList = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
    return item;
  });

  await saveNavigationMenu(updatedList);
}

/**
 * Delete a Menu Item (or hide if core)
 */
export async function deleteNavigationMenuItem(id: string): Promise<void> {
  const current = getCachedMenuItems();
  // Filter out the item
  const filtered = current.filter(item => item.id !== id);
  // Re-index display orders
  const reindexed = filtered.map((item, idx) => ({
    ...item,
    displayOrder: idx + 1
  }));

  await saveNavigationMenu(reindexed);
}

/**
 * Toggle visibility of a menu item
 */
export async function toggleNavigationItemVisibility(id: string, isVisible: boolean): Promise<void> {
  await updateNavigationMenuItem(id, { isVisible });
}

/**
 * Reorders menu items (move up/down)
 */
export async function reorderNavigationItems(items: NavigationMenuItem[]): Promise<void> {
  const reindexed = items.map((item, idx) => ({
    ...item,
    displayOrder: idx + 1
  }));
  await saveNavigationMenu(reindexed);
}

/**
 * Reset Navigation Menu to default configuration
 */
export async function resetNavigationMenuToDefault(): Promise<void> {
  await saveNavigationMenu(DEFAULT_MENU_ITEMS);
}
