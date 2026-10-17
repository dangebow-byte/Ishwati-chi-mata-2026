/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NavratriColorTheme {
  dayIndex: number; // 1 to 9
  dateStr: string;
  nameMr: string;
  nameEn: string;
  colorNameMr: string;
  colorNameEn: string;
  goddessFormMr: string;
  goddessFormEn: string;
  swatchHex: string;
  hexPrimary: string;
  hexSecondary: string;
  hexGradient: string;
  accentGold: string;
  lightBackgroundHex?: string;
  darkBackgroundHex?: string;
  descriptionMr: string;
  descriptionEn: string;
  blessingMr?: string;
  blessingEn?: string;
}

/**
 * Official 9 Sacred Colors of Sharad Navratri 2026 (9 Days, 9 Colours, 9 Blessings):
 * Day 1: 11th Oct 2026 - Maa Shailputri - Orange (Warmth, energy and brightness)
 * Day 2: 12th Oct 2026 - Maa Brahmacharini - White (Purity, peace and simplicity)
 * Day 3: 13th Oct 2026 - Maa Chandraghanta - Red (Passion, love and raw strength)
 * Day 4: 14th Oct 2026 - Maa Kushmada - Royal Blue (Depth, richness, and divine calm)
 * Day 5: 15th Oct 2026 - Maa Skandamata - Yellow (Joy, optimism and brightness)
 * Day 6: 16th Oct 2026 - Maa Katyayani - Green (Growth, nature and new beginnings)
 * Day 7: 17th Oct 2026 - Maa Kalaratri - Grey (Quiet strength and balance)
 * Day 8: 18th Oct 2026 - Maa Mahagauri - Purple (Ambition, dignity, and spiritual fulfilments)
 * Day 9: 19th Oct 2026 - Maa Siddhidatri - Peacock Green (Individuality, freshness and compassion)
 */
export const NAVRATRI_9_COLORS: NavratriColorTheme[] = [
  {
    dayIndex: 1,
    dateStr: '2026-10-11',
    nameMr: 'दिवस १ (प्रतिपदा)',
    nameEn: 'Day 1 (Pratipada)',
    colorNameMr: 'नारंगी (भगवा / केशरी)',
    colorNameEn: 'Orange',
    goddessFormMr: 'माँ शैलपुत्री',
    goddessFormEn: 'Maa Shailputri',
    swatchHex: '#EA580C',
    hexPrimary: '#3D1702',
    hexSecondary: '#C2410C',
    hexGradient: 'from-[#260E01] via-[#521E06] to-[#170601]',
    accentGold: '#FB923C',
    lightBackgroundHex: '#FFF7ED',
    darkBackgroundHex: '#2A0F02',
    descriptionMr: 'उबदारपणा, ऊर्जा आणि उज्वल तेज (Warmth, energy and brightness).',
    descriptionEn: 'Warmth, energy and brightness.',
    blessingMr: 'उबदारपणा, ऊर्जा आणि उज्वल चैतन्य',
    blessingEn: 'Warmth, energy and brightness'
  },
  {
    dayIndex: 2,
    dateStr: '2026-10-12',
    nameMr: 'दिवस २ (द्वितीया)',
    nameEn: 'Day 2 (Dwitiya)',
    colorNameMr: 'पांढरा (श्वेत)',
    colorNameEn: 'White',
    goddessFormMr: 'माँ ब्रह्मचारिणी',
    goddessFormEn: 'Maa Brahmacharini',
    swatchHex: '#FFFFFF',
    hexPrimary: '#FFFFFF',
    hexSecondary: '#F1F5F9',
    hexGradient: 'from-[#FFFFFF] via-[#F8FAFC] to-[#F1F5F9]',
    accentGold: '#D4AF37',
    lightBackgroundHex: '#FFFFFF',
    darkBackgroundHex: '#0F172A',
    descriptionMr: 'पवित्रता, शांतता आणि साधेपणा (Purity, peace and simplicity).',
    descriptionEn: 'Purity, peace and simplicity.',
    blessingMr: 'पवित्रता, शांतता आणि साधेपणा',
    blessingEn: 'Purity, peace and simplicity'
  },
  {
    dayIndex: 3,
    dateStr: '2026-10-13',
    nameMr: 'दिवस ३ (तृतीया)',
    nameEn: 'Day 3 (Tritiya)',
    colorNameMr: 'लाल (रक्तवर्ण)',
    colorNameEn: 'Red',
    goddessFormMr: 'माँ चंद्रघंटा',
    goddessFormEn: 'Maa Chandraghanta',
    swatchHex: '#DC2626',
    hexPrimary: '#4A0404',
    hexSecondary: '#8B0000',
    hexGradient: 'from-[#3A0204] via-[#5B0508] to-[#250102]',
    accentGold: '#FFD700',
    lightBackgroundHex: '#FEF2F2',
    darkBackgroundHex: '#350204',
    descriptionMr: 'भक्ती-प्रेम, समर्पण आणि अदम्य शक्ती (Passion, love and raw strength).',
    descriptionEn: 'Passion, love and raw strength.',
    blessingMr: 'भक्ती-प्रेम आणि अदम्य शक्ती',
    blessingEn: 'Passion, love and raw strength'
  },
  {
    dayIndex: 4,
    dateStr: '2026-10-14',
    nameMr: 'दिवस ४ (चतुर्थी)',
    nameEn: 'Day 4 (Chaturthi)',
    colorNameMr: 'रॉयल ब्लू (राजेशाही निळा)',
    colorNameEn: 'Royal Blue',
    goddessFormMr: 'माँ कुष्मांडा',
    goddessFormEn: 'Maa Kushmada',
    swatchHex: '#1D4ED8',
    hexPrimary: '#0A192F',
    hexSecondary: '#1E3A8A',
    hexGradient: 'from-[#071326] via-[#102A54] to-[#040B17]',
    accentGold: '#FBBF24',
    lightBackgroundHex: '#EFF6FF',
    darkBackgroundHex: '#081224',
    descriptionMr: 'अथांग खोली, समृद्धी आणि दिव्य शांतता (Depth, richness, and divine calm).',
    descriptionEn: 'Depth, richness, and divine calm.',
    blessingMr: 'अथांग समृद्धी आणि दिव्य शांतता',
    blessingEn: 'Depth, richness, and divine calm'
  },
  {
    dayIndex: 5,
    dateStr: '2026-10-15',
    nameMr: 'दिवस ५ (पंचमी)',
    nameEn: 'Day 5 (Panchami)',
    colorNameMr: 'पिवळा (पीतवर्ण)',
    colorNameEn: 'Yellow',
    goddessFormMr: 'माँ स्कंदमाता',
    goddessFormEn: 'Maa Skandamata',
    swatchHex: '#EAB308',
    hexPrimary: '#2E2204',
    hexSecondary: '#B45309',
    hexGradient: 'from-[#1F1702] via-[#4D3806] to-[#1F1702]',
    accentGold: '#FDE047',
    lightBackgroundHex: '#FEFCE8',
    darkBackgroundHex: '#211802',
    descriptionMr: 'आनंद, आशावाद आणि उज्वल तेज (Joy, optimism and brightness).',
    descriptionEn: 'Joy, optimism and brightness.',
    blessingMr: 'आनंद, आशावाद आणि उज्वल तेज',
    blessingEn: 'Joy, optimism and brightness'
  },
  {
    dayIndex: 6,
    dateStr: '2026-10-16',
    nameMr: 'दिवस ६ (षष्ठी)',
    nameEn: 'Day 6 (Shashthi)',
    colorNameMr: 'हिरवा (हरितवर्ण)',
    colorNameEn: 'Green',
    goddessFormMr: 'माँ कात्यायनी',
    goddessFormEn: 'Maa Katyayani',
    swatchHex: '#16A34A',
    hexPrimary: '#062617',
    hexSecondary: '#065F46',
    hexGradient: 'from-[#03180E] via-[#0B3822] to-[#02120B]',
    accentGold: '#34D399',
    lightBackgroundHex: '#F0FDF4',
    darkBackgroundHex: '#041B10',
    descriptionMr: 'प्रगती, निसर्ग आणि नवचैतन्य (Growth, nature and new beginnings).',
    descriptionEn: 'Growth, nature and new beginnings.',
    blessingMr: 'प्रगती, निसर्ग आणि नवी सुरुवात',
    blessingEn: 'Growth, nature and new beginnings'
  },
  {
    dayIndex: 7,
    dateStr: '2026-10-17',
    nameMr: 'दिवस ७ (सप्तमी)',
    nameEn: 'Day 7 (Saptami)',
    colorNameMr: 'राखाडी (ग्रे / भस्म वर्ण)',
    colorNameEn: 'Grey',
    goddessFormMr: 'माँ कालरात्री',
    goddessFormEn: 'Maa Kalaratri',
    swatchHex: '#6B7280',
    hexPrimary: '#212529',
    hexSecondary: '#4B5563',
    hexGradient: 'from-[#16191D] via-[#333740] to-[#0E1014]',
    accentGold: '#D1D5DB',
    lightBackgroundHex: '#F3F4F6',
    darkBackgroundHex: '#181B1E',
    descriptionMr: 'संयमी आत्मिक सामर्थ्य आणि समतोल (Quiet strength and balance).',
    descriptionEn: 'Quiet strength and balance.',
    blessingMr: 'संयमी सामर्थ्य आणि समतोल',
    blessingEn: 'Quiet strength and balance'
  },
  {
    dayIndex: 8,
    dateStr: '2026-10-18',
    nameMr: 'दिवस ८ (अष्टमी - महाष्टमी)',
    nameEn: 'Day 8 (Ashtami - Mahagauri)',
    colorNameMr: 'जांभळा (पर्पल)',
    colorNameEn: 'Purple',
    goddessFormMr: 'माँ महागौरी',
    goddessFormEn: 'Maa Mahagauri',
    swatchHex: '#7E22CE',
    hexPrimary: '#280838',
    hexSecondary: '#6B21A8',
    hexGradient: 'from-[#180422] via-[#3B0E50] to-[#12021A]',
    accentGold: '#C084FC',
    lightBackgroundHex: '#FAF5FF',
    darkBackgroundHex: '#1B0526',
    descriptionMr: 'उच्च ध्येय, प्रतिष्ठा आणि आध्यात्मिक सिद्धी (Ambition, dignity, and spiritual fulfilments).',
    descriptionEn: 'Ambition, dignity, and spiritual fulfilments.',
    blessingMr: 'उच्च ध्येय, प्रतिष्ठा आणि आध्यात्मिक सिद्धी',
    blessingEn: 'Ambition, dignity, and spiritual fulfilments'
  },
  {
    dayIndex: 9,
    dateStr: '2026-10-19',
    nameMr: 'दिवस ९ (नवमी - महानवमी)',
    nameEn: 'Day 9 (Navami - Siddhidatri)',
    colorNameMr: 'मोरपंखी हिरवा (पिकॉक ग्रीन)',
    colorNameEn: 'Peacock Green',
    goddessFormMr: 'माँ सिद्धिदात्री',
    goddessFormEn: 'Maa Siddhidatri',
    swatchHex: '#0D9488',
    hexPrimary: '#062426',
    hexSecondary: '#0F766E',
    hexGradient: 'from-[#031618] via-[#0E3639] to-[#020D0E]',
    accentGold: '#2DD4BF',
    lightBackgroundHex: '#F0FDFA',
    darkBackgroundHex: '#041719',
    descriptionMr: 'वैशिष्ट्यपूर्ण तेज, चैतन्य आणि असीम करुणा (Individuality, freshness and compassion).',
    descriptionEn: 'Individuality, freshness and compassion.',
    blessingMr: 'वैशिष्ट्यपूर्ण चैतन्य, ताजेपणा आणि करुणा',
    blessingEn: 'Individuality, freshness and compassion'
  }
];

/**
 * Returns the calendar date formatted as 'YYYY-MM-DD' in Indian Standard Time (Asia/Kolkata).
 * Ensures midnight color transitions trigger precisely at 12:00 AM IST.
 */
export const getISTDateString = (date: Date = new Date()): string => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(date);
  } catch {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
};

/**
 * Calculates today's Navratri day index (1 to 9) automatically.
 * 1. Checks exact match with the 9 sacred festival dates (2026-10-11 to 2026-10-19).
 * 2. If accessed outside the festival dates, smoothly rotates through the 9 sacred colors daily
 *    based on the day-of-year, ensuring the website colors change automatically every single day!
 */
export const getTodayNavratriDayIndex = (refDate: Date = new Date()): number => {
  const istDateStr = getISTDateString(refDate);

  // 1. Direct match with official festival dates (2026-10-11 to 2026-10-19)
  const matched = NAVRATRI_9_COLORS.find(c => c.dateStr === istDateStr);
  if (matched) {
    return matched.dayIndex;
  }

  // 2. Year-round automatic rotation: assigns each calendar day one of the 9 sacred colors
  const parts = istDateStr.split('-').map(Number);
  const year = parts[0] || refDate.getFullYear();
  const month = (parts[1] || refDate.getMonth() + 1) - 1;
  const day = parts[2] || refDate.getDate();

  const current = new Date(Date.UTC(year, month, day));
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const dayOfYear = Math.floor((current.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Modulo 9 daily sequence (1 to 9)
  return ((dayOfYear - 1) % 9) + 1;
};

/**
 * Checks whether the current preference is in automatic daily mode.
 */
export const isAutoNavratriTheme = (themePref: string | number = 'auto'): boolean => {
  return themePref === 'auto' || themePref === undefined || themePref === null || themePref === '';
};

/**
 * Returns the active Navratri theme.
 * - When in 'auto' mode: dynamically derives today's sacred color automatically.
 * - When a specific day number (1 to 9) is provided: returns that chosen day.
 */
export const getActiveNavratriTheme = (themePref: string | number = 'auto', refDate: Date = new Date()): NavratriColorTheme => {
  if (typeof themePref === 'number' || (typeof themePref === 'string' && themePref !== 'auto' && !isNaN(Number(themePref)))) {
    const idx = Number(themePref);
    if (idx >= 1 && idx <= 9) {
      const found = NAVRATRI_9_COLORS.find(c => c.dayIndex === idx);
      if (found) return found;
    }
  }

  // Automatic mode: fetch today's sacred day index (1 to 9)
  const todayIdx = getTodayNavratriDayIndex(refDate);
  return NAVRATRI_9_COLORS[todayIdx - 1] || NAVRATRI_9_COLORS[0];
};

