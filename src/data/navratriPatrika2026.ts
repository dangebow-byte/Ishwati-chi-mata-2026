/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PatrikaSubEvent {
  timeMr?: string;
  timeEn?: string;
  titleMr: string;
  titleEn: string;
  highlight?: boolean;
}

export interface NavratriPatrikaDay {
  id: string;
  dayIndex: number;
  dayNameMr: string;
  dayNameEn: string;
  dateStrMr: string;
  dateStrEn: string;
  dateIso: string;
  defaultTimeMr: string;
  defaultTimeEn: string;
  category: 'pooja' | 'cultural' | 'devotional' | 'havan' | 'visarjan' | 'auction';
  categoryLabelMr: string;
  categoryLabelEn: string;
  events: PatrikaSubEvent[];
}

export const MANDAL_PATRIKA_METADATA = {
  mandalNameMr: 'श्री यंग ईश्वटी नवरात्रौत्सव मंडळ (रजि.)',
  mandalNameEn: 'Shree Young Ishwati Navratrotsav Mandal (Regd.)',
  regNumberMr: '(नोंदणी क्र. २१३३/१०, जी.बी.बी.एस.डी.) क्र. एफ/४२६६९',
  regNumberEn: '(Reg. No. 2133/10, G.B.B.S.D.) No. F/42669',
  yearLabelMr: 'वर्ष ५२ वे',
  yearLabelEn: '52nd Year Celebrations',
  titleMr: 'कार्यक्रम पत्रिका - २०२६',
  titleEn: 'Official Navratri Festival Schedule - 2026',
  specialNoticeMr: 'विशेष सूचना : उत्सवाच्या प्रत्येक दिवशी देवीची पूजा व सांज आरती होईल. विविध स्पर्धांचे कार्यक्रम वेळोवेळी जाहीर करण्यात येतील. कोणत्याही कार्यक्रमात फेरफार करण्याचे अधिकार कार्यकारी मंडळास राहतील.',
  specialNoticeEn: 'Special Notice: Daily sacred Pooja and Sandhya Aarti will be performed each day. Schedules for sports competitions will be announced periodically. The Executive Board reserves all rights to amend programs if required.',
  officers: [
    { titleMr: 'अध्यक्ष', titleEn: 'President', nameMr: 'श्री. अमित र. चव्हाण', nameEn: 'Shri Amit R. Chavan' },
    { titleMr: 'कार्याध्यक्ष', titleEn: 'Working President', nameMr: 'श्री. सुहास ए. विलगणकर', nameEn: 'Shri Suhas A. Vilgankar' },
    { titleMr: 'मानद् सचिव', titleEn: 'Hon. Secretary', nameMr: 'श्री. ओमकार श. चव्हाण', nameEn: 'Shri Omkar Sh. Chavan' },
    { titleMr: 'खजिनदार', titleEn: 'Treasurer', nameMr: 'श्री. चिन्मय उ. साळुंखे', nameEn: 'Shri Chinmay U. Salunkhe' },
  ]
};

export const NAVRATRI_PATRIKA_2026: NavratriPatrikaDay[] = [
  {
    id: 'patrika-day-1',
    dayIndex: 1,
    dayNameMr: 'रविवार',
    dayNameEn: 'Sunday',
    dateStrMr: '११ ऑक्टोबर २०२६',
    dateStrEn: '11 Oct 2026',
    dateIso: '2026-10-11',
    defaultTimeMr: 'सकाळी ११.०० वा.',
    defaultTimeEn: '11:00 AM',
    category: 'pooja',
    categoryLabelMr: 'घटस्थापना व पूजा',
    categoryLabelEn: 'Consecration & Pooja',
    events: [
      {
        timeMr: 'सकाळी ११.०० वा.',
        timeEn: '11:00 AM',
        titleMr: 'श्री देवीची प्रतिष्ठापना (घटस्थापना सोहळा)',
        titleEn: 'Shree Devi Idol Consecration & Ghatasthapana Ceremony',
        highlight: true
      }
    ]
  },
  {
    id: 'patrika-day-2',
    dayIndex: 2,
    dayNameMr: 'सोमवार',
    dayNameEn: 'Monday',
    dateStrMr: '१२ ऑक्टोबर २०२६',
    dateStrEn: '12 Oct 2026',
    dateIso: '2026-10-12',
    defaultTimeMr: 'सायं. ०५.०० वा.',
    defaultTimeEn: '05:00 PM',
    category: 'devotional',
    categoryLabelMr: 'महिला भजन',
    categoryLabelEn: 'Women Devotional Bhajan',
    events: [
      {
        timeMr: 'सायं. ०५.०० वा.',
        timeEn: '05:00 PM',
        titleMr: 'महिला भजन - स्वामी समर्थ महिला भजन मंडळ, अभ्युदयनगर, काळाचौकी, मुंबई - ४०० ०३३',
        titleEn: 'Mahila Bhajan - Swami Samarth Mahila Bhajan Mandal, Abhyudayanagar, Kalachowki, Mumbai - 400 033',
        highlight: false
      }
    ]
  },
  {
    id: 'patrika-day-3',
    dayIndex: 3,
    dayNameMr: 'मंगळवार',
    dayNameEn: 'Tuesday',
    dateStrMr: '१३ ऑक्टोबर २०२६',
    dateStrEn: '13 Oct 2026',
    dateIso: '2026-10-13',
    defaultTimeMr: 'सायं. ६ ते रात्रौ. १० वा.',
    defaultTimeEn: '06:00 PM to 10:00 PM',
    category: 'cultural',
    categoryLabelMr: 'मैदानी स्पर्धा व संस्कृती',
    categoryLabelEn: 'Sports & Cultural Events',
    events: [
      {
        timeMr: 'सायं. ६ ते रात्रौ. १० वा.',
        timeEn: '06:00 PM to 10:00 PM',
        titleMr: 'मैदानी स्पर्धा व सांस्कृतिक कार्यक्रम',
        titleEn: 'Outdoor Sports Competitions & Cultural Programs',
        highlight: false
      }
    ]
  },
  {
    id: 'patrika-day-4',
    dayIndex: 4,
    dayNameMr: 'बुधवार',
    dayNameEn: 'Wednesday',
    dateStrMr: '१४ ऑक्टोबर २०२६',
    dateStrEn: '14 Oct 2026',
    dateIso: '2026-10-14',
    defaultTimeMr: 'सायं. ६ ते रात्रौ. १० वा.',
    defaultTimeEn: '06:00 PM to 10:00 PM',
    category: 'cultural',
    categoryLabelMr: 'सांस्कृतिक कार्यक्रम',
    categoryLabelEn: 'Cultural Programs',
    events: [
      {
        timeMr: 'सायं. ६ ते रात्रौ. १० वा.',
        timeEn: '06:00 PM to 10:00 PM',
        titleMr: 'सांस्कृतिक कार्यक्रम व बालकलाकार सादरीकरण',
        titleEn: 'Grand Cultural Evening & Youth Talent Performances',
        highlight: false
      }
    ]
  },
  {
    id: 'patrika-day-5',
    dayIndex: 5,
    dayNameMr: 'गुरुवार',
    dayNameEn: 'Thursday',
    dateStrMr: '१५ ऑक्टोबर २०२६',
    dateStrEn: '15 Oct 2026',
    dateIso: '2026-10-15',
    defaultTimeMr: 'सायं. ६ ते रात्रौ. १० वा.',
    defaultTimeEn: '06:00 PM to 10:00 PM',
    category: 'cultural',
    categoryLabelMr: 'सांस्कृतिक कार्यक्रम',
    categoryLabelEn: 'Cultural Programs',
    events: [
      {
        timeMr: 'सायं. ६ ते रात्रौ. १० वा.',
        timeEn: '06:00 PM to 10:00 PM',
        titleMr: 'सांस्कृतिक कार्यक्रम व पारंपारिक लोकनृत्य',
        titleEn: 'Traditional Folk Dance & Cultural Programs',
        highlight: false
      }
    ]
  },
  {
    id: 'patrika-day-6',
    dayIndex: 6,
    dayNameMr: 'शुक्रवार',
    dayNameEn: 'Friday',
    dateStrMr: '१६ ऑक्टोबर २०२६',
    dateStrEn: '16 Oct 2026',
    dateIso: '2026-10-16',
    defaultTimeMr: 'रात्रौ ९.०० वा.',
    defaultTimeEn: '09:00 PM',
    category: 'devotional',
    categoryLabelMr: 'देवीचा गोंधळ',
    categoryLabelEn: 'Devotional Gondhal Jagran',
    events: [
      {
        timeMr: 'रात्रौ ९.०० वा.',
        timeEn: '09:00 PM',
        titleMr: 'देवीचा पावन गोंधळ व जागर सोहळा',
        titleEn: 'Sacred Devi Gondhal & Divine Awakening Chants',
        highlight: true
      }
    ]
  },
  {
    id: 'patrika-day-7',
    dayIndex: 7,
    dayNameMr: 'शनिवार',
    dayNameEn: 'Saturday',
    dateStrMr: '१७ ऑक्टोबर २०२६',
    dateStrEn: '17 Oct 2026',
    dateIso: '2026-10-17',
    defaultTimeMr: 'रात्रौ ८.०० वा.',
    defaultTimeEn: '08:00 PM',
    category: 'cultural',
    categoryLabelMr: 'अंताक्षरी स्पर्धा',
    categoryLabelEn: 'Antakshari Musical Night',
    events: [
      {
        timeMr: 'रात्रौ ८.०० वा.',
        timeEn: '08:00 PM',
        titleMr: 'चला खेळ खेळूया अंताक्षरी (भव्य कौटुंबिक संगीत स्पर्धा)',
        titleEn: 'Chala Khel Kheluya Antakshari (Grand Devotional Musical Game)',
        highlight: false
      }
    ]
  },
  {
    id: 'patrika-day-8',
    dayIndex: 8,
    dayNameMr: 'रविवार',
    dayNameEn: 'Sunday',
    dateStrMr: '१८ ऑक्टोबर २०२६',
    dateStrEn: '18 Oct 2026',
    dateIso: '2026-10-18',
    defaultTimeMr: 'रात्रौ ८.०० वा.',
    defaultTimeEn: '08:00 PM',
    category: 'cultural',
    categoryLabelMr: 'मैदानी स्पर्धा व संस्कृती',
    categoryLabelEn: 'Sports & Cultural Events',
    events: [
      {
        timeMr: 'रात्रौ ८.०० वा.',
        timeEn: '08:00 PM',
        titleMr: 'मैदानी स्पर्धा व सांस्कृतिक कार्यक्रम',
        titleEn: 'Outdoor Sports Championship & Cultural Program',
        highlight: false
      }
    ]
  },
  {
    id: 'patrika-day-9',
    dayIndex: 9,
    dayNameMr: 'सोमवार',
    dayNameEn: 'Monday',
    dateStrMr: '१९ ऑक्टोबर २०२६',
    dateStrEn: '19 Oct 2026',
    dateIso: '2026-10-19',
    defaultTimeMr: 'दुपारी २.०० वा. व सायं. ७.०० वा.',
    defaultTimeEn: '02:00 PM & 07:00 PM',
    category: 'havan',
    categoryLabelMr: 'होम हवन व महाप्रसाद',
    categoryLabelEn: 'Sacred Homa & Mahaprasad Feast',
    events: [
      {
        timeMr: 'दुपारी २.०० वा.',
        timeEn: '02:00 PM',
        titleMr: 'होम हवन (नवचंडी विधी व पूर्णाहुती)',
        titleEn: 'Sacred Navachandi Homa Havanam Ritual & Purnahuti',
        highlight: true
      },
      {
        timeMr: 'सायं. ७.०० वा.',
        timeEn: '07:00 PM',
        titleMr: 'महाप्रसाद (अखंड भंडारा भोजन वाटप)',
        titleEn: 'Community Mahaprasad (Grand Bhandara Feast)',
        highlight: true
      }
    ]
  },
  {
    id: 'patrika-day-10',
    dayIndex: 10,
    dayNameMr: 'मंगळवार',
    dayNameEn: 'Tuesday',
    dateStrMr: '२० ऑक्टोबर २०२६',
    dateStrEn: '20 Oct 2026',
    dateIso: '2026-10-20',
    defaultTimeMr: 'सायं. ६ ते रात्रौ. १० वा.',
    defaultTimeEn: '06:00 PM to 10:00 PM',
    category: 'cultural',
    categoryLabelMr: 'मैदानी स्पर्धा',
    categoryLabelEn: 'Sports Championship Finals',
    events: [
      {
        timeMr: 'सायं. ६ ते रात्रौ. १० वा.',
        timeEn: '06:00 PM to 10:00 PM',
        titleMr: 'मैदानी स्पर्धा (अंतिम फेरी व पारितोषिक सोहळा)',
        titleEn: 'Sports Championships (Final Rounds & Awards)',
        highlight: false
      }
    ]
  },
  {
    id: 'patrika-day-11',
    dayIndex: 11,
    dayNameMr: 'बुधवार',
    dayNameEn: 'Wednesday',
    dateStrMr: '२१ ऑक्टोबर २०२६',
    dateStrEn: '21 Oct 2026',
    dateIso: '2026-10-21',
    defaultTimeMr: 'सायं ६.०० वा. व रात्रौ ९.०० वा.',
    defaultTimeEn: '06:00 PM & 09:00 PM',
    category: 'cultural',
    categoryLabelMr: 'विजयादशमी व दसरा सोहळा',
    categoryLabelEn: 'Dussehra & Dandiya Raas',
    events: [
      {
        timeMr: 'सायं ६.०० वा.',
        timeEn: '06:00 PM',
        titleMr: 'हळदी कुंकू समारंभ',
        titleEn: 'Suvasini Haldi Kunku Ceremony',
        highlight: false
      },
      {
        timeMr: 'रात्रौ ९.०० वा.',
        timeEn: '09:00 PM',
        titleMr: 'दसरा संमेलन (आपट्याची पाने - सोने लुटणे सोहळा)',
        titleEn: 'Dussehra Sammelan (Traditional Gold Exchange & Greetings)',
        highlight: true
      },
      {
        timeMr: 'रात्रौ ९.०० वा.',
        timeEn: '09:00 PM',
        titleMr: 'भव्य पारंपारिक दांडीया रास',
        titleEn: 'Grand Traditional Dandiya Raas Celebration',
        highlight: true
      }
    ]
  },
  {
    id: 'patrika-day-12',
    dayIndex: 12,
    dayNameMr: 'गुरुवार',
    dayNameEn: 'Thursday',
    dateStrMr: '२२ ऑक्टोबर २०२६',
    dateStrEn: '22 Oct 2026',
    dateIso: '2026-10-22',
    defaultTimeMr: 'सकाळी ११.०० वा. व सायं. ६.०० वा.',
    defaultTimeEn: '11:00 AM & 06:00 PM',
    category: 'visarjan',
    categoryLabelMr: 'विसर्जन मिरवणूक व लिलाव',
    categoryLabelEn: 'Visarjan Procession & Saree Auction',
    events: [
      {
        timeMr: 'सकाळी ११.०० वा.',
        timeEn: '11:00 AM',
        titleMr: 'देवीच्या साड्यांचा भव्य जाहीर लिलाव (प्रथम सत्र)',
        titleEn: 'Public Open Auction of Consecrated Devi Sarees (Session 1)',
        highlight: false
      },
      {
        timeMr: 'सायं. ६.०० वा.',
        timeEn: '06:00 PM',
        titleMr: 'श्री ईश्वटी मातेची भव्य दिव्य विसर्जन मिरवणूक सोहळा',
        titleEn: 'Shree Ishwati Mata Grand Holy Visarjan Immersion Procession',
        highlight: true
      }
    ]
  },
  {
    id: 'patrika-day-13',
    dayIndex: 13,
    dayNameMr: 'रविवार',
    dayNameEn: 'Sunday',
    dateStrMr: '२५ ऑक्टोबर २०२६',
    dateStrEn: '25 Oct 2026',
    dateIso: '2026-10-25',
    defaultTimeMr: 'सकाळी ११.०० वा.',
    defaultTimeEn: '11:00 AM',
    category: 'auction',
    categoryLabelMr: 'साड्यांचा जाहीर लिलाव',
    categoryLabelEn: 'Devi Saree Public Auction',
    events: [
      {
        timeMr: 'सकाळी ११.०० वा.',
        timeEn: '11:00 AM',
        titleMr: 'देवीच्या साड्यांचा भव्य जाहीर लिलाव (अंतिम सत्र)',
        titleEn: 'Grand Public Auction of Consecrated Devi Sarees (Final Session)',
        highlight: true
      }
    ]
  }
];
