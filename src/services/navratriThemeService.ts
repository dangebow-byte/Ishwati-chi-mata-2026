/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NavratriDayTheme {
  dayNumber: number; // 1 to 9 (10 for Visarjan / Dussehra)
  tithiMarathi: string;
  tithiEnglish: string;
  goddessMarathi: string;
  goddessEnglish: string;
  colorNameMarathi: string;
  colorNameEnglish: string;
  colorHex: string;
  primaryColor: string; // Used for --color-brand-saffron
  secondaryColor: string; // Used for --color-brand-gold
  maroonTone: string; // Used for --color-brand-maroon (dark theme background)
  redTone: string; // Used for --color-brand-red
  glowColor: string;
  significanceMarathi: string;
  significanceEnglish: string;
}

/**
 * Local Configuration Map for Navratri 9 Days Color Tradition & Sacred Deities:
 * Day 1: Yellow (शैलपुत्री - पिवळा)
 * Day 2: Green (ब्रह्मचारिणी - हिरवा)
 * Day 3: Grey (चंद्रघंटा - राखाडी)
 * Day 4: Orange (कुष्मांडा - नारंगी)
 * Day 5: White (स्कंदमाता - पांढरा)
 * Day 6: Red (कात्यायनी - लाल)
 * Day 7: Royal Blue (कालरात्री - शाही निळा)
 * Day 8: Pink (महागौरी - गुलाबी)
 * Day 9: Purple (सिद्धिदात्री - जांभळा)
 * Day 10: Saffron & Rich Gold (विजयादशमी - विसर्जन)
 */
export const NAVRATRI_THEMES_MAP: Record<number, NavratriDayTheme> = {
  1: {
    dayNumber: 1,
    tithiMarathi: 'पहिली माळ - प्रतिपदा',
    tithiEnglish: 'Day 1 - Pratipada',
    goddessMarathi: 'मां शैलपुत्री',
    goddessEnglish: 'Maa Shailaputri',
    colorNameMarathi: 'पिवळा (Royal Yellow)',
    colorNameEnglish: 'Royal Yellow',
    colorHex: '#EAB308',
    primaryColor: '#F59E0B',
    secondaryColor: '#FBBF24',
    maroonTone: '#361802',
    redTone: '#B45309',
    glowColor: 'rgba(234, 179, 8, 0.35)',
    significanceMarathi: 'आनंद, उत्साह व सकारात्मक ऊर्जेचे प्रतीक. घटस्थापना दिवस.',
    significanceEnglish: 'Symbol of joy, enthusiasm, and divine beginnings on Ghatasthapana.'
  },
  2: {
    dayNumber: 2,
    tithiMarathi: 'दुसरी माळ - द्वितीया',
    tithiEnglish: 'Day 2 - Dwitiya',
    goddessMarathi: 'मां ब्रह्मचारिणी',
    goddessEnglish: 'Maa Brahmacharini',
    colorNameMarathi: 'हिरवा (Emerald Green)',
    colorNameEnglish: 'Emerald Green',
    colorHex: '#10B981',
    primaryColor: '#059669',
    secondaryColor: '#34D399',
    maroonTone: '#052919',
    redTone: '#047857',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    significanceMarathi: 'प्रकृती, समृद्धी, शांतता व नव्या संकल्पांचे प्रतीक.',
    significanceEnglish: 'Represents nature, prosperity, inner peace, and penance.'
  },
  3: {
    dayNumber: 3,
    tithiMarathi: 'तिसरी माळ - तृतीया',
    tithiEnglish: 'Day 3 - Tritiya',
    goddessMarathi: 'मां चंद्रघंटा',
    goddessEnglish: 'Maa Chandraghanta',
    colorNameMarathi: 'राखाडी (Pearl Slate)',
    colorNameEnglish: 'Pearl Slate',
    colorHex: '#94A3B8',
    primaryColor: '#64748B',
    secondaryColor: '#CBD5E1',
    maroonTone: '#1A222F',
    redTone: '#475569',
    glowColor: 'rgba(148, 163, 184, 0.35)',
    significanceMarathi: 'धैर्य, शौर्य व नकारात्मकतेवर विजयाचे प्रतीक.',
    significanceEnglish: 'Symbolizes courage, valor, and calm determination.'
  },
  4: {
    dayNumber: 4,
    tithiMarathi: 'चौथी माळ - चतुर्थी',
    tithiEnglish: 'Day 4 - Chaturthi',
    goddessMarathi: 'मां कुष्मांडा',
    goddessEnglish: 'Maa Kushmanda',
    colorNameMarathi: 'नारंगी (Sacred Orange)',
    colorNameEnglish: 'Sacred Orange',
    colorHex: '#F97316',
    primaryColor: '#EA580C',
    secondaryColor: '#FB923C',
    maroonTone: '#421406',
    redTone: '#C2410C',
    glowColor: 'rgba(249, 115, 22, 0.35)',
    significanceMarathi: 'दिव्य प्रकाश, ऊर्जा, आरोग्य व विश्वाची निर्मिती.',
    significanceEnglish: 'Radiance, cosmic energy, and luminous warmth.'
  },
  5: {
    dayNumber: 5,
    tithiMarathi: 'पाचवी माळ - पंचमी',
    tithiEnglish: 'Day 5 - Panchami',
    goddessMarathi: 'मां स्कंदमाता',
    goddessEnglish: 'Maa Skandamata',
    colorNameMarathi: 'पांढरा (Divine White)',
    colorNameEnglish: 'Divine White',
    colorHex: '#F8FAFC',
    primaryColor: '#E2E8F0',
    secondaryColor: '#D4AF37',
    maroonTone: '#2A101C',
    redTone: '#FDA4AF',
    glowColor: 'rgba(248, 250, 252, 0.35)',
    significanceMarathi: 'शुद्धता, वात्सल्य, ज्ञान व निष्कलंक भक्ती.',
    significanceEnglish: 'Purity, motherly love, wisdom, and profound devotion.'
  },
  6: {
    dayNumber: 6,
    tithiMarathi: 'सहावी माळ - षष्ठी',
    tithiEnglish: 'Day 6 - Shashthi',
    goddessMarathi: 'मां कात्यायनी',
    goddessEnglish: 'Maa Katyayani',
    colorNameMarathi: 'लाल (Kumkum Red)',
    colorNameEnglish: 'Kumkum Red',
    colorHex: '#EF4444',
    primaryColor: '#DC2626',
    secondaryColor: '#F87171',
    maroonTone: '#450707',
    redTone: '#991B1B',
    glowColor: 'rgba(239, 68, 68, 0.35)',
    significanceMarathi: 'पराक्रम, असीम शक्ती, महिषासुरमर्दिनी स्वरूप.',
    significanceEnglish: 'Fierce courage, supreme power, and victory over evil.'
  },
  7: {
    dayNumber: 7,
    tithiMarathi: 'सातवी माळ - सप्तमी',
    tithiEnglish: 'Day 7 - Saptami',
    goddessMarathi: 'मां कालरात्री',
    goddessEnglish: 'Maa Kalaratri',
    colorNameMarathi: 'शाही निळा (Royal Blue)',
    colorNameEnglish: 'Royal Blue',
    colorHex: '#3B82F6',
    primaryColor: '#2563EB',
    secondaryColor: '#60A5FA',
    maroonTone: '#0E172C',
    redTone: '#1D4ED8',
    glowColor: 'rgba(59, 130, 246, 0.35)',
    significanceMarathi: 'अंधकाराचा नाश करणारी, निर्भयता व संकटनाशक शक्ती.',
    significanceEnglish: 'Destruction of darkness, fearlessness, and absolute protection.'
  },
  8: {
    dayNumber: 8,
    tithiMarathi: 'आठवी माळ - अष्टमी',
    tithiEnglish: 'Day 8 - Ashtami',
    goddessMarathi: 'मां महागौरी',
    goddessEnglish: 'Maa Mahagauri',
    colorNameMarathi: 'गुलाबी (Lotus Pink)',
    colorNameEnglish: 'Lotus Pink',
    colorHex: '#EC4899',
    primaryColor: '#DB2777',
    secondaryColor: '#F472B6',
    maroonTone: '#430623',
    redTone: '#BE185D',
    glowColor: 'rgba(236, 72, 153, 0.35)',
    significanceMarathi: 'करुणा, सौंदर्य, मोक्ष, धर्मवीर महाआरती व पावन हवन.',
    significanceEnglish: 'Compassion, grace, auspiciousness, and the sacred Ashtami Maha Aarti.'
  },
  9: {
    dayNumber: 9,
    tithiMarathi: 'नववी माळ - नवमी',
    tithiEnglish: 'Day 9 - Navami',
    goddessMarathi: 'मां सिद्धिदात्री',
    goddessEnglish: 'Maa Siddhidatri',
    colorNameMarathi: 'जांभळा (Imperial Purple)',
    colorNameEnglish: 'Imperial Purple',
    colorHex: '#A855F7',
    primaryColor: '#9333EA',
    secondaryColor: '#C084FC',
    maroonTone: '#34055B',
    redTone: '#7E22CE',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    significanceMarathi: 'सर्व सिद्धी, कार्यपूर्ती, ज्ञान व आशिर्वादांचे सर्वोच्च रूप.',
    significanceEnglish: 'Bestower of all spiritual achievements and divine blessings.'
  },
  10: {
    dayNumber: 10,
    tithiMarathi: 'दसरा - विजयादशमी / विसर्जन',
    tithiEnglish: 'Day 10 - Vijayadashami / Visarjan',
    goddessMarathi: 'श्री ईश्वटीची माता - विसर्जन मिरवणूक',
    goddessEnglish: 'Shree Ishwati Mata - Visarjan Miravnuk',
    colorNameMarathi: 'भगवा व सुवर्ण (Saffron Gold)',
    colorNameEnglish: 'Saffron Gold',
    colorHex: '#FF9933',
    primaryColor: '#FF9933',
    secondaryColor: '#D4AF37',
    maroonTone: '#4A0404',
    redTone: '#8B0000',
    glowColor: 'rgba(255, 153, 51, 0.35)',
    significanceMarathi: 'विजयाचा सोहळा, सीमोल्लंघन, आपट्याची पाने व भव्य विसर्जन मिरवणूक.',
    significanceEnglish: 'Grand Victory celebration, Vijayadashami, and auspicious Visarjan Miravnuk.'
  }
};

const THEME_STORAGE_KEY = 'ishwatichi_navratri_active_theme_day';

/**
 * Automatically computes which Navratri day should be active based on current date,
 * or retrieves devotee's selected day from localStorage.
 */
export function detectCurrentNavratriDay(): number {
  if (typeof window === 'undefined') return 1;

  // 1. Check if user/admin manually previewed or selected a specific day
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (parsed >= 1 && parsed <= 10) {
        return parsed;
      }
    }
  } catch {}

  // 2. Automated date-based day rotation (Cycle through 1-9 based on day of month)
  const now = new Date();
  const dayOfMonth = now.getDate();
  // Maps day of month modulo 9 to 1..9
  const calculatedDay = ((dayOfMonth - 1) % 9) + 1;
  return calculatedDay;
}

/**
 * Applies the Navratri Day Theme by querying the local configuration map
 * and dynamically adjusting CSS variables in the root element (document.documentElement).
 */
export function applyNavratriTheme(dayNumber: number): NavratriDayTheme {
  const safeDay = dayNumber >= 1 && dayNumber <= 10 ? dayNumber : 1;
  const theme = NAVRATRI_THEMES_MAP[safeDay] || NAVRATRI_THEMES_MAP[1];

  if (typeof document !== 'undefined') {
    const root = document.documentElement;

    // Dynamically adjust CSS variables in the root element
    root.style.setProperty('--color-brand-saffron', theme.primaryColor);
    root.style.setProperty('--color-brand-gold', theme.secondaryColor);
    root.style.setProperty('--color-brand-maroon', theme.maroonTone);
    root.style.setProperty('--color-brand-red', theme.redTone);

    root.style.setProperty('--navratri-theme-color', theme.primaryColor);
    root.style.setProperty('--navratri-theme-secondary', theme.secondaryColor);
    root.style.setProperty('--navratri-theme-bg', theme.maroonTone);
    root.style.setProperty('--navratri-theme-glow', theme.glowColor);
    root.style.setProperty('--navratri-day-color', theme.colorHex);

    // Smoothly adjust body background for full visual atmosphere
    if (document.body) {
      document.body.style.backgroundColor = theme.maroonTone;
      document.body.style.backgroundImage = `radial-gradient(circle at 50% 12%, ${theme.glowColor} 0%, transparent 65%)`;
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, safeDay.toString());
    } catch {}

    // Dispatch custom event so React components can re-render if needed
    window.dispatchEvent(new CustomEvent('navratriThemeChanged', { detail: { theme } }));
  }

  return theme;
}

export function getAllNavratriThemes(): NavratriDayTheme[] {
  return Object.values(NAVRATRI_THEMES_MAP);
}

export function getNavratriThemeForDay(dayNumber: number): NavratriDayTheme {
  return NAVRATRI_THEMES_MAP[dayNumber] || NAVRATRI_THEMES_MAP[1];
}
