/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PatrikaSubEvent {
  id?: string;
  timeMr?: string;
  timeEn?: string;
  time?: string;
  titleMr: string;
  titleEn: string;
  venueMr?: string;
  venueEn?: string;
  descriptionMr?: string;
  descriptionEn?: string;
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
  category: 'pooja' | 'cultural' | 'devotional' | 'havan' | 'visarjan' | 'auction' | 'general';
  categoryLabelMr?: string;
  categoryLabelEn?: string;
  events: PatrikaSubEvent[];
  deviRoopMr?: string;
  deviRoopEn?: string;
  colorNameMr?: string;
  colorNameEn?: string;
  colorHex?: string;
}

export const MANDAL_PATRIKA_METADATA = {
  mandalNameMr: 'यंग इश्वटी नवरात्रौत्सव मंडळ',
  mandalNameEn: 'Young Ishwati Navratrotsav Mandal',
  invocationMr: '॥ इश्वटीची माता प्रसन्न ॥',
  invocationEn: '|| Ishwatichi Mata Prasanna ||',
  establishmentYearMr: 'स्थापना १९७४',
  establishmentYearEn: 'Est. 1974',
  yearLabelMr: 'वर्ष ५३ वे',
  yearLabelEn: '53rd Year Celebrations',
  titleMr: 'श्री इश्वटी मातेचा उत्सव कार्यक्रम २०२६',
  titleEn: 'Shree Ishwati Mata Festival Program 2026',
  specialNoticeMr: 'विशेष सूचना : उत्सवाच्या प्रत्येक दिवशी देवीची पूजा व सांज आरती होईल. विविध स्पर्धांचे कार्यक्रम वेळोवेळी जाहीर करण्यात येतील. कोणत्याही कार्यक्रमात फेरफार करण्याचे अधिकार कार्यकारी मंडळास राहतील.',
  specialNoticeEn: 'Special Notice: Daily sacred Pooja and Sandhya Aarti will be performed each day. Schedules for various competitions will be announced from time to time. The Executive Board reserves all rights to make changes to any program.',
  officers: [
    { titleMr: 'अध्यक्ष', titleEn: 'President', nameMr: 'रोहित रमेश घोले', nameEn: 'Rohit Ramesh Ghole' },
    { titleMr: 'सरचिटणीस', titleEn: 'General Secretary', nameMr: 'ओमकार शरद चव्हाण', nameEn: 'Omkar Sharad Chavan' },
    { titleMr: 'खजिनदार', titleEn: 'Treasurer', nameMr: 'वरद सुभाष चिले', nameEn: 'Varad Subhash Chile' },
    { titleMr: 'कार्याध्यक्ष', titleEn: 'Working President', nameMr: 'संतोष दशरथ पराडकर', nameEn: 'Santosh Dashrath Paradkar' },
  ]
};

export const NAVRATRI_PATRIKA_2026: NavratriPatrikaDay[] = [
  {
    id: 'patrika-day-1',
    dayIndex: 1,
    dayNameMr: 'शनिवार',
    dayNameEn: 'Saturday',
    dateStrMr: '१०/१०/२०२६',
    dateStrEn: '10/10/2026',
    dateIso: '2026-10-10',
    defaultTimeMr: 'संध्याकाळी ५.०० वाजता',
    defaultTimeEn: '05:00 PM',
    category: 'pooja',
    categoryLabelMr: 'देवीचे आगमन',
    categoryLabelEn: 'Devi Arrival (Aagman)',
    events: [
      {
        timeMr: 'संध्याकाळी ५.०० वाजता',
        timeEn: '05:00 PM',
        titleMr: 'श्री इश्वटी देवीचे आगमन',
        titleEn: 'Shree Ishwati Devi Grand Arrival',
        venueMr: 'स्थळ : उदय खातू कारखाना (भालचंद्र मैदान)',
        venueEn: 'Venue: Uday Khatu Karkhana (Bhalchandra Maidan)',
        highlight: true
      }
    ]
  },
  {
    id: 'patrika-day-2',
    dayIndex: 2,
    dayNameMr: 'रविवार',
    dayNameEn: 'Sunday',
    dateStrMr: '११/१०/२०२६',
    dateStrEn: '11/10/2026',
    dateIso: '2026-10-11',
    defaultTimeMr: 'सकाळी ११.०० वाजता',
    defaultTimeEn: '11:00 AM',
    category: 'pooja',
    categoryLabelMr: 'घटस्थापना व अंताक्षरी',
    categoryLabelEn: 'Ghatasthapana & Antakshari',
    events: [
      {
        timeMr: 'सकाळी ११.०० वाजता',
        timeEn: '11:00 AM',
        titleMr: 'देवीची घटस्थापना',
        titleEn: 'Devi Ghatasthapana (Consecration)',
        highlight: true
      },
      {
        timeMr: 'संध्याकाळी ६.०० वाजता',
        timeEn: '06:00 PM',
        titleMr: 'सांस्कृतिक कार्यक्रम (भजन) | जीवन विद्या मिशन (उपासना यज्ञ)',
        titleEn: 'Cultural Program (Bhajan) | Jeevan Vidya Mission (Upasana Yajna)',
        highlight: false
      },
      {
        timeMr: 'ठीक ८.०० वाजता',
        timeEn: '08:00 PM (Sharp)',
        titleMr: 'खेळ खेळूया अंताक्षरीचा स्पर्धा सौजन्य संजय परब',
        titleEn: 'Khel Kheluya Antakshari Competition (Courtesy: Sanjay Parab)',
        highlight: true
      }
    ]
  },
  {
    id: 'patrika-day-3',
    dayIndex: 3,
    dayNameMr: 'सोमवार',
    dayNameEn: 'Monday',
    dateStrMr: '१२/१०/२०२६',
    dateStrEn: '12/10/2026',
    dateIso: '2026-10-12',
    defaultTimeMr: 'संध्याकाळी ६.०० वाजता',
    defaultTimeEn: '06:00 PM',
    category: 'devotional',
    categoryLabelMr: 'महिला भजन',
    categoryLabelEn: 'Women Bhajan',
    events: [
      {
        timeMr: 'संध्याकाळी ६.०० वाजता',
        timeEn: '06:00 PM',
        titleMr: 'सांस्कृतिक कार्यक्रम (भजन) - श्री स्वामी समर्थ महिला भजन मंडळ (अभ्युदयनगर)',
        titleEn: 'Cultural Program (Bhajan) - Shree Swami Samarth Mahila Bhajan Mandal (Abhyudayanagar)',
        highlight: false
      }
    ]
  },
  {
    id: 'patrika-day-4',
    dayIndex: 4,
    dayNameMr: 'मंगळवार',
    dayNameEn: 'Tuesday',
    dateStrMr: '१३/१०/२०२६',
    dateStrEn: '13/10/2026',
    dateIso: '2026-10-13',
    defaultTimeMr: 'दुपारी २.३० वाजता',
    defaultTimeEn: '02:30 PM',
    category: 'cultural',
    categoryLabelMr: 'मैदानी स्पर्धा व पाठ',
    categoryLabelEn: 'Sports & Durga Saptashati',
    events: [
      {
        timeMr: 'दुपारी २.३० वाजता',
        timeEn: '02:30 PM',
        titleMr: 'सांस्कृतिक कार्यक्रम - मैदानी स्पर्धा',
        titleEn: 'Cultural Program - Outdoor Sports Competition',
        highlight: false
      },
      {
        timeMr: 'दुपारी २.३० वाजता',
        timeEn: '02:30 PM',
        titleMr: 'अखिल भारतीय श्री स्वामी समर्थ आध्यात्मिक विकास मार्ग (काळाचौकी केंद्रातर्फे) दुर्गासप्तशती पाठ',
        titleEn: 'Durga Saptashati Path by Akhil Bharatiya Shree Swami Samarth Adhyatmik Vikas Marg (Kalachowki Center)',
        highlight: true
      }
    ]
  },
  {
    id: 'patrika-day-5',
    dayIndex: 5,
    dayNameMr: 'बुधवार',
    dayNameEn: 'Wednesday',
    dateStrMr: '१४/१०/२०२६',
    dateStrEn: '14/10/2026',
    dateIso: '2026-10-14',
    defaultTimeMr: 'रात्री ८.०० वाजता',
    defaultTimeEn: '08:00 PM',
    category: 'devotional',
    categoryLabelMr: 'महाआरती व पाककला',
    categoryLabelEn: 'Maha Aarti & Cooking Contest',
    events: [
      {
        timeMr: 'रात्री ८.०० वाजता',
        timeEn: '08:00 PM',
        titleMr: 'महाआरती ( बिल्डिंग नंबर ४१ अभ्युदयनगर )',
        titleEn: 'Maha Aarti (Building No. 41, Abhyudayanagar)',
        highlight: true
      },
      {
        timeMr: 'संध्याकाळी ८.०० वाजता',
        timeEn: '08:00 PM',
        titleMr: 'पाककला स्पर्धा',
        titleEn: 'Pakkala Spardha (Culinary / Cooking Contest)',
        highlight: false
      }
    ]
  },
  {
    id: 'patrika-day-6',
    dayIndex: 6,
    dayNameMr: 'गुरुवार',
    dayNameEn: 'Thursday',
    dateStrMr: '१५/१०/२०२६',
    dateStrEn: '15/10/2026',
    dateIso: '2026-10-15',
    defaultTimeMr: 'सायंकाळी ४.०० वाजता',
    defaultTimeEn: '04:00 PM',
    category: 'pooja',
    categoryLabelMr: 'सत्यनारायण व भजन',
    categoryLabelEn: 'Satyanarayan & Bhajan',
    events: [
      {
        timeMr: 'सायंकाळी ४.०० वाजता',
        timeEn: '04:00 PM',
        titleMr: 'सत्यनारायण पूजा',
        titleEn: 'Shree Satyanarayan Pooja',
        highlight: true
      },
      {
        timeMr: 'संध्याकाळी ७.०० वाजता',
        timeEn: '07:00 PM',
        titleMr: 'भजन कार्यक्रम',
        titleEn: 'Devotional Bhajan Program',
        highlight: false
      }
    ]
  },
  {
    id: 'patrika-day-7',
    dayIndex: 7,
    dayNameMr: 'शुक्रवार',
    dayNameEn: 'Friday',
    dateStrMr: '१६/१०/२०२६',
    dateStrEn: '16/10/2026',
    dateIso: '2026-10-16',
    defaultTimeMr: 'संध्याकाळी ७.०० वाजता',
    defaultTimeEn: '07:00 PM',
    category: 'cultural',
    categoryLabelMr: 'संगीत कार्यक्रम',
    categoryLabelEn: 'Music Orchestra',
    events: [
      {
        timeMr: 'संध्याकाळी ७.०० वाजता',
        timeEn: '07:00 PM',
        titleMr: 'संगीत कार्यक्रम',
        titleEn: 'Grand Musical Orchestra & Devotional Songs Program',
        highlight: true
      }
    ]
  },
  {
    id: 'patrika-day-8',
    dayIndex: 8,
    dayNameMr: 'शनिवार',
    dayNameEn: 'Saturday',
    dateStrMr: '१७/१०/२०२६',
    dateStrEn: '17/10/2026',
    dateIso: '2026-10-17',
    defaultTimeMr: 'रात्री ९.०० वाजता',
    defaultTimeEn: '09:00 PM',
    category: 'devotional',
    categoryLabelMr: 'जागरण व गोंधळ',
    categoryLabelEn: 'Jagran & Gondhal',
    events: [
      {
        timeMr: 'रात्री ९.०० वाजता',
        timeEn: '09:00 PM',
        titleMr: 'देवीच जागरण व गोंधळ',
        titleEn: 'Devicha Jagran & Gondhal Sacred Night Ceremony',
        highlight: true
      }
    ]
  },
  {
    id: 'patrika-day-9',
    dayIndex: 9,
    dayNameMr: 'रविवार',
    dayNameEn: 'Sunday',
    dateStrMr: '१८/१०/२०२६',
    dateStrEn: '18/10/2026',
    dateIso: '2026-10-18',
    defaultTimeMr: 'दुपारी २.३० वाजता',
    defaultTimeEn: '02:30 PM',
    category: 'havan',
    categoryLabelMr: 'होमहवन व महाप्रसाद',
    categoryLabelEn: 'Hom-Havan & Mahaprasad',
    events: [
      {
        timeMr: 'दुपारी २.३० वाजता',
        timeEn: '02:30 PM',
        titleMr: 'होमहवन व देवीचा महाप्रसाद (भंडारा)',
        titleEn: 'Sacred Hom-Havan & Devi Mahaprasad (Grand Bhandara Feast)',
        highlight: true
      }
    ]
  },
  {
    id: 'patrika-day-10',
    dayIndex: 10,
    dayNameMr: 'सोमवार',
    dayNameEn: 'Monday',
    dateStrMr: '१९/१०/२०२६',
    dateStrEn: '19/10/2026',
    dateIso: '2026-10-19',
    defaultTimeMr: 'संध्याकाळी ८.०० वाजता',
    defaultTimeEn: '08:00 PM',
    category: 'cultural',
    categoryLabelMr: 'खेळ खेळू पैठणीचा',
    categoryLabelEn: 'Khel Khelu Paithanicha',
    events: [
      {
        timeMr: 'संध्याकाळी ८.०० वाजता',
        timeEn: '08:00 PM',
        titleMr: 'खेळ खेळू पैठणीचा',
        titleEn: 'Khel Khelu Paithanicha (Grand Family Traditional Contest)',
        highlight: true
      }
    ]
  },
  {
    id: 'patrika-day-11',
    dayIndex: 11,
    dayNameMr: 'मंगळवार',
    dayNameEn: 'Tuesday',
    dateStrMr: '२०/१०/२०२६',
    dateStrEn: '20/10/2026',
    dateIso: '2026-10-20',
    defaultTimeMr: 'संध्याकाळी ८.०० वाजता',
    defaultTimeEn: '08:00 PM',
    category: 'cultural',
    categoryLabelMr: 'दसरा - सोने लुटणे',
    categoryLabelEn: 'Dussehra Celebrations',
    events: [
      {
        timeMr: 'संध्याकाळी ८.०० वाजता',
        timeEn: '08:00 PM',
        titleMr: 'दसरा-सोने लुटण्याचा कार्यक्रम',
        titleEn: 'Dussehra - Sone Lutnyacha Karyakram (Traditional Gold Leaf Greetings)',
        highlight: true
      }
    ]
  },
  {
    id: 'patrika-day-12',
    dayIndex: 12,
    dayNameMr: 'बुधवार',
    dayNameEn: 'Wednesday',
    dateStrMr: '२१/१०/२०२६',
    dateStrEn: '21/10/2026',
    dateIso: '2026-10-21',
    defaultTimeMr: 'संध्याकाळी ६.०० वाजता',
    defaultTimeEn: '06:00 PM',
    category: 'visarjan',
    categoryLabelMr: 'विसर्जन मिरवणूक',
    categoryLabelEn: 'Visarjan Immersion Procession',
    events: [
      {
        timeMr: 'संध्याकाळी ६.०० वाजता',
        timeEn: '06:00 PM',
        titleMr: 'श्री इश्वटी मातेची भव्य-दिव्य मिरवणूक विसर्जन',
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
    dateStrMr: '२५/१०/२०२६',
    dateStrEn: '25/10/2026',
    dateIso: '2026-10-25',
    defaultTimeMr: 'सकाळी ११.०० वाजता',
    defaultTimeEn: '11:00 AM',
    category: 'auction',
    categoryLabelMr: 'साडी लिलाव व कोजागिरी',
    categoryLabelEn: 'Saree Auction & Kojagiri',
    events: [
      {
        timeMr: 'सकाळी ११.०० वाजता',
        timeEn: '11:00 AM',
        titleMr: 'साडी लिलाव व कोजागिरी पौर्णिमा',
        titleEn: 'Consecrated Devi Saree Public Auction & Kojagiri Pournima Celebration',
        highlight: true
      }
    ]
  }
];
