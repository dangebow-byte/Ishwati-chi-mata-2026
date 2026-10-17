/**
 * Dynamic SEO & OpenGraph Document Manager
 * Keeps document.title, meta descriptions, and canonical URL in sync
 * Ensures top Google search ranking relevance for 'ishwati chi mata' across languages.
 */

export interface SEOMetadataOptions {
  tab?: string;
  lang?: 'EN' | 'MR';
  customTitle?: string;
  customDescription?: string;
}

const TAB_TITLES: Record<string, { en: string; mr: string; descEn: string; descMr: string }> = {
  home: {
    en: 'Ishwati Chi Mata | श्री इश्वटीची माता देवस्थान (मंडळ) | Official Website',
    mr: 'श्री इश्वटीची माता देवस्थान (मंडळ) | Ishwati Chi Mata Official Portal',
    descEn: 'Official website of Shree Ishwati Chi Mata Devasthan Mandal (श्री इश्वटीची माता). Watch 24/7 live darshan, daily aartis, Navratri festival celebrations, photos, videos & seva bookings.',
    descMr: 'श्री इश्वटीची माता देवस्थान मंडळाचे अधिकृत संकेतस्थळ. २४/७ पावन थेट दर्शन, दैनंदिन महाआरती, शारदीय नवरात्रौत्सव, पावन व्हिडिओ व फोटो दालन, आणि डिजिटल सेवा बुकिंग.'
  },
  darshan: {
    en: 'Live Sanctum Darshan 24/7 | Ishwati Chi Mata | श्री इश्वटीची माता थेट दर्शन',
    mr: 'थेट पावन दर्शन २४/७ | श्री इश्वटीची माता देवस्थान | Ishwati Chi Mata Live Darshan',
    descEn: 'Experience 24/7 live sanctum darshan of Shree Ishwati Chi Mata Devasthan with HD streaming and holy blessings.',
    descMr: 'श्री इश्वटीची माता देवस्थानचे घरबसल्या २४/७ थेट पावन गर्भगृह दर्शन आणि महाआरतीचा लाभ घ्या.'
  },
  gallery: {
    en: 'Photo & Video Reels Gallery | Ishwati Chi Mata | श्री इश्वटीची माता दालन',
    mr: 'पावन फोटो व व्हिडिओ रिल्स दालन | श्री इश्वटीची माता | Ishwati Chi Mata Gallery',
    descEn: 'Browse rare photos, festive video reels, and celebrations of Shree Ishwati Chi Mata Devasthan across years.',
    descMr: 'श्री इश्वटीची माता नवरात्रौत्सव, पावन सोहळे आणि ऐतिहासिक उत्सवांचे दुर्मीळ फोटो व व्हिडिओ रिल्स संग्रह.'
  },
  aarti: {
    en: 'Maha Aarti, Bhajans & Lyrics | Ishwati Chi Mata | श्री इश्वटीची माता महाआरती',
    mr: 'पावन महाआरती, भजने व बोल | श्री इश्वटीची माता | Ishwati Chi Mata Maha Aarti',
    descEn: 'Listen to devotional Marathi aartis, Ashtami stutis, and sacred chants of Shree Ishwati Chi Mata with full lyrics.',
    descMr: 'श्री इश्वटीची माता पावन महाआरती, काकड आरती, धूप आरती व भजनांचे संपूर्ण बोल आणि ऑडिओ संग्रह.'
  },
  ashtami: {
    en: 'Ashtami Mahotsav & Dharmaveer Aarti | Ishwati Chi Mata | अष्टमी महाआरती',
    mr: 'अष्टमी दुर्गा महाआरती व महोत्सव | श्री इश्वटीची माता | Ishwati Chi Mata Ashtami',
    descEn: 'Sacred Ashtami Mahotsav celebrations, Dharmaveer Durga Maha Aarti stream, and festival specials of Ishwati Chi Mata.',
    descMr: 'श्री इश्वटीची माता शारदीय नवरात्रौत्सव अष्टमी दुर्गा महाआरती आणि विशेष धार्मिक सोहळे.'
  },
  donate: {
    en: 'Online Seva & Holy Donations (80G) | Ishwati Chi Mata | देणगी व सेवा बुकिंग',
    mr: 'ऑनलाइन सेवा बुकिंग व देणगी (८०जी पावती) | श्री इश्वटीची माता | Ishwati Chi Mata Seva',
    descEn: 'Book puja, aarti, and abhishek sevas online or make tax-exempt donations for Shree Ishwati Chi Mata temple development.',
    descMr: 'श्री इश्वटीची माता देवस्थानसाठी ऑनलाइन सेवा बुकिंग करा अथवा देणगी देऊन त्वरित ८०जी कर सवलत पावती मिळवा.'
  },
  experiences: {
    en: 'Devotee Miracle Experiences | Ishwati Chi Mata | भक्तांचे पावन अनुभव',
    mr: 'भक्तांचे पावन अनुभव व साक्षात्कारी प्रचिती | श्री इश्वटीची माता | Ishwati Chi Mata',
    descEn: 'Read inspiring miracle stories and divine testimonials shared by devotees of Shree Ishwati Chi Mata.',
    descMr: 'श्री इश्वटीची मातेच्या कृपेने भक्तांना आलेले दैवी अनुभव, प्रचिती आणि साक्षात्कारांचे मनोगत वाचा.'
  },
  history: {
    en: 'Devasthan Heritage & History (Estd. 1974) | Ishwati Chi Mata | मंडळाचा इतिहास',
    mr: 'मंडळाचा ५३ वर्षांचा दैदीप्यमान इतिहास (स्थापना १९७४) | श्री इश्वटीची माता | Ishwati Chi Mata',
    descEn: 'Discover the rich 53-year heritage and social welfare initiatives of Shree Young Ishwati Navratrotsav Mandal Devasthan.',
    descMr: 'श्री यंग इश्वटी नवरात्रौत्सव मंडळ देवस्थानच्या स्थापनेपासूनचा ५३ वर्षांचा गौरवशाली इतिहास व समाजोपयोगी कार्य.'
  },
  contact: {
    en: 'Temple Location, Address & Helpline | Ishwati Chi Mata | संपर्क व पत्ता',
    mr: 'पत्ता, संपर्क व थेट चौकशी | श्री इश्वटीची माता | Ishwati Chi Mata Contact & Map',
    descEn: 'Get directions, contact numbers, direct WhatsApp helpdesk, and visiting hours for Shree Ishwati Chi Mata temple.',
    descMr: 'श्री इश्वटीची माता मंदिराचा पत्ता, गुगल मॅप मार्गदर्शन, थेट व्हाट्सॲप संपर्क आणि हेल्पलाइन माहिती.'
  }
};

/**
 * Updates browser document title, description, and canonical URL
 */
export const updatePageSEO = ({ tab = 'home', lang = 'MR', customTitle, customDescription }: SEOMetadataOptions) => {
  if (typeof document === 'undefined') return;

  const currentTab = tab.toLowerCase();
  const tabConfig = TAB_TITLES[currentTab] || TAB_TITLES.home;

  const title = customTitle || (lang === 'EN' ? tabConfig.en : tabConfig.mr);
  const description = customDescription || (lang === 'EN' ? tabConfig.descEn : tabConfig.descMr);

  // 1. Update Title tag
  document.title = title;

  // 2. Update Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', description);
  }

  // 3. Update OpenGraph Title & Description
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', description);

  // 4. Update Twitter Title & Description
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) twitterTitle.setAttribute('content', title);

  const twitterDesc = document.querySelector('meta[name="twitter:description"]');
  if (twitterDesc) twitterDesc.setAttribute('content', description);

  // 5. Update Canonical Link & og:url dynamically
  const canonical = document.querySelector('link[rel="canonical"]');
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const hash = currentTab !== 'home' ? `#${currentTab}` : '';
    const fullUrl = `${origin}/${hash}`;
    if (canonical) canonical.setAttribute('href', fullUrl);
    if (ogUrl) ogUrl.setAttribute('content', fullUrl);
  }
};
