/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DevoteeExperience, TempleEvent, Announcement } from './types';
import logoImg from './assets/branding/Mandal logo Maroon Transparent BG.png';

export { logoImg };

export const INITIAL_EVENTS: TempleEvent[] = [
  {
    id: 'ev-1',
    title: 'श्री इश्वटीची आषाढी एकादशी महापूजा आणि भजन संध्या',
    titleMarathi: 'श्री इश्वटीची आषाढी एकादशी महापूजा आणि भजन संध्या',
    description: 'श्री इश्वटीची माता महापूजा, त्यानंतर प्रख्यात स्थानिक कलाकारांद्वारे अखंड भजन संध्या.',
    descriptionMarathi: 'श्री इश्वटीची माता महापूजा, त्यानंतर प्रख्यात स्थानिक कलाकारांद्वारे अखंड भजन संध्या.',
    date: '2026-07-05',
    time: 'सकाळी ०५:०० ते रात्री १०:००',
    category: 'उत्सव',
    rsvpCount: 245,
    image: 'https://images.unsplash.com/photo-1609137144814-726d36e8b792?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ev-2',
    title: 'श्री इश्वटी मातेचा ५३ वा शारदीय नवरात्र महोत्सव सोहळा २०२६',
    titleMarathi: 'श्री इश्वटी मातेचा ५३ वा शारदीय नवरात्र महोत्सव सोहळा २०२६',
    description: 'श्री इश्वटी मातेचा ५३ वा शारदीय नवरात्रौत्सव सोहळा २०२६ (स्थापना १९७४). १० ऑक्टोबर आगमन सोहळा (सायं ०५:००), ११ ऑक्टोबर घटस्थापना (मध्यरात्र १२:०० AM IST पर्वकाळ / स. ११:०० पूजा) ते २५ ऑक्टोबर कोजागिरी व साडी लिलाव.',
    descriptionMarathi: 'श्री इश्वटी मातेचा ५३ वा शारदीय नवरात्रौत्सव सोहळा २०२६ (स्थापना १९७४). १० ऑक्टोबर आगमन सोहळा (सायं ०५:००), ११ ऑक्टोबर घटस्थापना (मध्यरात्र १२:०० AM IST पर्वकाळ / स. ११:०० पूजा) ते २५ ऑक्टोबर कोजागिरी व साडी लिलाव.',
    date: '2026-10-11', // Ghatasthapana 11 October 2026 (12:00 AM IST), preceded by Devi Agaman Sohala on 10 October 2026 (05:00 PM IST)
    time: '१० ऑक्टोबर आगमन (सायं ०५:००) | ११ ऑक्टोबर घटस्थापना (१२:०० AM IST) ते २५ ऑक्टोबर २०२६',
    category: 'उत्सव',
    rsvpCount: 1890,
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0db?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ev-3',
    title: 'श्री यंग इश्वटी नवरात्रौत्सव मंडळ: मोफत बहुविशेषज्ञता भव्य आरोग्य व दंत तपासणी शिबीर',
    titleMarathi: 'श्री यंग इश्वटी नवरात्रौत्सव मंडळ: मोफत बहुविशेषज्ञता भव्य आरोग्य व दंत तपासणी शिबीर',
    description: 'श्री यंग इश्वटी नवरात्रौत्सव मंडळ समाजोपयोगी उपक्रमांतर्गत मोफत आरोग्य तपासणी, दंत आणि डोळे तपासणी व मोफत औषध वाटप.',
    descriptionMarathi: 'श्री यंग इश्वटी नवरात्रौत्सव मंडळ समाजोपयोगी उपक्रमांतर्गत मोफत आरोग्य तपासणी, दंत आणि डोळे तपासणी व मोफत औषध वाटप.',
    date: '2026-08-15',
    time: 'सकाळी ०९:०० ते दुपारी ०४:००',
    category: 'सामाजिक सेवा',
    rsvpCount: 512,
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ev-4',
    title: 'श्री इश्वटीची चैत्र शुद्ध प्रतिपदा (गुढीपाडवा) शोभायात्रा उत्सव',
    titleMarathi: 'श्री इश्वटीची चैत्र शुद्ध प्रतिपदा (गुढीपाडवा) शोभायात्रा उत्सव',
    description: 'श्री इश्वटीची मातेच्या आशीर्वादाने हिंदू नववर्षाच्या स्वागतासाठी भव्य पारंपरिक शोभायात्रा, पावन गुढी उभारणी, कडू लिंब-गुळ प्रसाद वाटप.',
    descriptionMarathi: 'श्री इश्वटीची मातेच्या आशीर्वादाने हिंदू नववर्षाच्या स्वागतासाठी भव्य पारंपरिक शोभायात्रा, पावन गुढी उभारणी, कडू लिंब-गुळ प्रसाद वाटप.',
    date: '2026-03-29',
    time: 'सकाळी ०६:०० ते ११:००',
    category: 'सांस्कृतिक कार्यक्रम',
    rsvpCount: 410,
    image: 'https://images.unsplash.com/photo-1621245366437-0ea87295aafe?auto=format&fit=crop&q=80&w=800'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'श्री इश्वटीची महा मुकुट समर्पण उपक्रम आणि सहभाग नियम',
    titleMarathi: 'श्री इश्वटीची महा मुकुट समर्पण उपक्रम आणि सहभाग नियम',
    category: 'Notice',
    date: '2026-06-05',
    content: 'श्री इश्वटीची माता मंदिरासाठी शुद्ध सोन्याचा महा मुकुट साकारण्याचा संकल्प मंडळाने केला आहे. भाविक आपल्या सोयीने महा मुकुट निधी अंतर्गत थेट देणगी देऊन यात सहभागी होऊ शकतात. त्वरित पावती दिली जाईल.',
    contentMarathi: 'श्री इश्वटीची माता मंदिरासाठी शुद्ध सोन्याचा महा मुकुट साकारण्याचा संकल्प मंडळाने केला आहे. भाविक आपल्या सोयीने महा मुकुट निधी अंतर्गत थेट देणगी देऊन यात सहभागी होऊ शकतात. त्वरित पावती दिली जाईल.'
  },
  {
    id: 'ann-2',
    title: 'श्री इश्वटीची नवरात्र सेवा पूर्वनोंदणी आणि संकल्प नाव नोंदणी सुरू',
    titleMarathi: 'श्री इश्वटीची नवरात्र सेवा पूर्वनोंदणी आणि संकल्प नाव नोंदणी सुरू',
    category: 'Festival',
    date: '2026-06-01',
    content: 'ऑक्टोबर महिन्यातील श्री इश्वटीची शारदीय नवरात्रीच्या ९ दिवसांच्या विशेष आरती, पूजा आणि अभिषेक सेवेचे आगाऊ वाटप आजपासून सुरू होत आहे. मंदिर परिसरातील गर्दीचे नियोजन पाहता भाविकांनी त्वरित नाव नोंदणी करावी.',
    contentMarathi: 'ऑक्टोबर महिन्यातील श्री इश्वटीची शारदीय नवरात्रीच्या ९ दिवसांच्या विशेष आरती, पूजा आणि अभिषेक सेवेचे आगाऊ वाटप आजपासून सुरू होत आहे. मंदिर परिसरातील गर्दीचे नियोजन पाहता भाविकांनी त्वरित नाव नोंदणी करावी.'
  },
  {
    id: 'ann-3',
    title: 'श्री यंग इश्वटी नवरात्रौत्सव मंडळ प्रेस रिलीज: रक्तदान शिबिरास उत्स्फूर्त प्रतिसाद',
    titleMarathi: 'श्री यंग इश्वटी नवरात्रौत्सव मंडळ प्रेस रिलीज: रक्तदान शिबिरास उत्स्फूर्त प्रतिसाद',
    category: 'Press',
    date: '2026-05-25',
    content: 'श्री इश्वटीची मातेच्या आशीर्वादाने मागील रविवारी आयोजित केलेल्या वार्षिक रक्तदान शिबिरामध्ये २८५ पेक्षा जास्त रक्त पिशव्या गोळा झाल्या. या सर्व पिशव्या पालिकेच्या आपत्कालीन रुग्णालयाकडे सुपूर्द करण्यात आल्या आहेत.',
    contentMarathi: 'श्री इश्वटीची मातेच्या आशीर्वादाने मागील रविवारी आयोजित केलेल्या वार्षिक रक्तदान शिबिरामध्ये २८५ पेक्षा जास्त रक्त पिशव्या गोळा झाल्या. या सर्व पिशव्या पालिकेच्या आपत्कालीन रुग्णालयाकडे सुपूर्द करण्यात आल्या आहेत.'
  }
];

export const INITIAL_TESTIMONIALS: DevoteeExperience[] = [
  {
    id: 'test-1',
    name: 'सुहास देशमुख',
    location: 'मुंबई, महाराष्ट्र',
    story: 'माझे कुटुंब गेल्या तीन पिढ्यांपासून श्री यंग इश्वटी नवरात्रौत्सव मंडळाला भेट देत आहे. अत्यंत कठीण शस्त्रक्रियेदरम्यान मी मंदिरात प्रार्थना केली. मातेच्या असीम कृपेने प्रकृती जलद गतीने सुधारली. या मंदिरातील शांतता मिळणे हे जगात इतरत्र कुठेही अशक्य आहे.',
    approved: true,
    rating: 5,
    date: '2026-05-18',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'test-2',
    name: 'प्रियंका कुलकर्णी',
    location: 'पुणे, महाराष्ट्र',
    story: 'स्पर्धा परीक्षेतील यशासाठी मी मंदिरात येऊन श्री इश्वटीची मातेसमोर संकल्प केला आणि समाजोपयोगी कार्यात सहभागी झाले. मातेच्या अपूर्व आशीर्वादाने मला यश मिळाले. येथील चैतन्य आणि ऊर्जा विलक्षण आहे.',
    approved: true,
    rating: 5,
    date: '2026-05-30',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'test-3',
    name: 'राहुल शेणॉय',
    location: 'बंगळुरू, कर्नाटक',
    story: 'राज्याबाहेर राहत असतानाही, श्री इश्वटीची डिजिटल थेट दर्शन सुविधेमुळे मी सदैव मंदिराशी जोडलेला राहतो. स्पीड पोस्टद्वारे मिळालेला मंदिरामधील पवित्र प्रसाद स्वीकारून कृतकृत्य झालो. आधुनिक तंत्रज्ञानाचा सुंदर वापर!',
    approved: true,
    rating: 5,
    date: '2026-06-03',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'test-4',
    name: 'अंजली सावंत',
    location: 'ठाणे, महाराष्ट्र',
    story: 'श्री इश्वटीची मातेने माझी हाक ऐकली! तीर्थ लावल्यानंतर माझे डोळे आणि मन अगदी प्रसन्न झाले. मला हा दैवी अनुभव सर्वांसोबत शेअर करायचा आहे!',
    approved: false,
    rating: 5,
    date: '2026-06-06',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150'
  }
];

export const TIMELINE_MILESTONES = [
  {
    year: '१९७४',
    title: 'श्री यंग इश्वटी नवरात्रौत्सव मंडळाची स्थापना',
    titleMarathi: 'श्री यंग इश्वटी नवरात्रौत्सव मंडळाची स्थापना',
    description: 'स्थानिक तरुणांद्वारे छोट्या लाकडी देव्हाऱ्यात अत्यंत साधेपणाने श्री इश्वटीची मातेची स्थापना व उत्सवाला सुरुवात.',
    descriptionMarathi: 'स्थानिक तरुणांद्वारे छोट्या लाकडी देव्हाऱ्यात अत्यंत साधेपणाने श्री इश्वटीची मातेची स्थापना व उत्सवाला सुरुवात.'
  },
  {
    year: '१९८७',
    title: 'श्री इश्वटीची पहिले भव्य मंदिर उभारणी',
    titleMarathi: 'श्री इश्वटीची पहिले भव्य मंदिर उभारणी',
    description: 'श्री इश्वटीची मातीच्या मूर्तीची प्राणप्रतिष्ठा आणि भाविकांच्या लोकवर्गणीतून विटांचे उत्कृष्ट सभागृह मंदिर उभारले गेले.',
    descriptionMarathi: 'श्री इश्वटीची मातीच्या मूर्तीची प्राणप्रतिष्ठा आणि भाविकांच्या लोकवर्गणीतून विटांचे उत्कृष्ट सभागृह मंदिर उभारले गेले.'
  },
  {
    year: '१९९९',
    title: 'श्री इश्वटीची सामाजिक सेवा कक्षाची सुरुवात',
    titleMarathi: 'श्री इश्वटीची सामाजिक सेवा कक्षाची सुरुवात',
    description: 'श्री इश्वटीची नियमित सामाजिक कार्याला सुरुवात: गरजूंना मदत आणि दररोज विनामूल्य अन्नछत्र सेवा सुरू.',
    descriptionMarathi: 'श्री इश्वटीची नियमित सामाजिक कार्याला सुरुवात: गरजूंना मदत आणि दररोज विनामूल्य अन्नछत्र सेवा सुरू.'
  },
  {
    year: '२०१२',
    title: 'श्री इश्वटीची नूतन दगडी हेमांडपंती मंदिर उभारणी',
    titleMarathi: 'श्री इश्वटीची नूतन दगडी हेमांडपंती मंदिर उभारणी',
    description: 'श्री इश्वटीची हेमांडपंती शैलीतील कोरीव भव्य दगडी मंदिर उभारणी, आकर्षक सोन्याचा कळस आणि अद्ययावत दर्शन रांगांचे नियोजन.',
    descriptionMarathi: 'श्री इश्वटीची हेमांडपंती शैलीतील कोरीव भव्य दगडी मंदिर उभारणी, आकर्षक सोन्याचा कळस आणि अद्ययावत दर्शन रांगांचे नियोजन.'
  },
  {
    year: '२०२६',
    title: 'श्री इश्वटीची अद्ययावत डिजिटल सोयी-सुविधा',
    titleMarathi: 'श्री इश्वटीची अद्ययावत डिजिटल सोयी-सुविधा',
    description: 'श्री इश्वटीची भक्तांच्या सुविधेसाठी जागतिक स्तरावर डिजिटल सेवा आणि थेट प्रक्षेपण सुविधांचे अनावरण.',
    descriptionMarathi: 'श्री इश्वटीची भक्तांच्या सुविधेसाठी जागतिक स्तरावर डिजिटल सेवा आणि थेट प्रक्षेपण सुविधांचे अनावरण.'
  }
];

export const GALLERY_ITEMS = [
  {
    id: 'gal-official-logo',
    category: 'Decorations',
    title: 'श्री यंग इश्वटी नवरात्रौत्सव मंडळ अधिकृत राजमुद्रा बोधचिन्ह',
    titleMarathi: 'श्री यंग इश्वटी नवरात्रौत्सव मंडळ अधिकृत राजमुद्रा बोधचिन्ह',
    url: logoImg
  },
  {
    id: 'gal-community-health',
    category: 'Community Service',
    title: 'श्री यंग इश्वटी नवरात्रौत्सव मंडळ: मोफत आरोग्य व नेत्र तपासणी शिबीर',
    titleMarathi: 'श्री यंग इश्वटी नवरात्रौत्सव मंडळ: मोफत आरोग्य व नेत्र तपासणी शिबीर',
    url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'gal-community-annadaan',
    category: 'Community Service',
    title: 'श्री इश्वटीची महाप्रसाद वाटप व अन्नदान सेवा उपक्रम',
    titleMarathi: 'श्री इश्वटीची महाप्रसाद वाटप व अन्नदान सेवा उपक्रम',
    url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800'
  }
];

export interface GalleryVideoReel {
  id: string;
  reelUrl: string;
  embedUrl: string;
  titleEN: string;
  titleMR: string;
  descriptionEN: string;
  descriptionMR: string;
  authorHandle: string;
  establishedYear: string;
  date?: string;
}

export const OFFICIAL_INSTAGRAM_REELS: GalleryVideoReel[] = [
  {
    id: 'reel-official-navratri-1974',
    reelUrl: 'https://www.instagram.com/reel/Cx0sn8AoN7l/?stkn=MTAzcXJldTZpdm15ag==',
    embedUrl: 'https://www.instagram.com/reel/Cx0sn8AoN7l/embed',
    titleEN: 'Shree Young Ishwati Navratrotsav Mandal || Ishwatichi Mata || Tradition of Celebration (Est. 1974)',
    titleMR: 'यंग इश्वटी नवरात्रौत्सव मंडळ || इश्वटीची माता || परंपरा उत्सवाची स्थापना: १९७४',
    descriptionEN: 'Official holy Instagram video reel featuring Shree Ishwatichi Mata grand festival traditions and divine blessings.',
    descriptionMR: 'मंडळाचा अधिकृत इंस्टाग्राम व्हिडिओ रील - श्री इश्वटीची माता परंपरा, भव्य मिरवणूक आणि भक्तिमय दर्शन.',
    authorHandle: '@ishwatichi_mata',
    establishedYear: '१९७४',
    date: '30 September 2023'
  }
];

export const TRANSLATIONS = {
  EN: {
    title: 'Shree Ishwatichi Mata Mandal',
    subtitle: 'Faith • Devotion • Tradition • Social Welfare',
    darshanTime: 'Mata Darshan Schedule',
    nav_home: 'Home',
    nav_about: 'About Mata',
    nav_patrika: 'Karyakram Patrika',
    nav_darshan: 'Live Darshan',
    nav_seva: 'Digital Seva',
    nav_events: 'Festivals & Events',
    nav_gallery: 'Gallery',
    nav_donation: 'Donate',
    nav_social: 'Social Initiatives',
    nav_testimonials: 'Devotee Experiences',
    nav_news: 'News & Updates',
    nav_profile: 'My Profile',
    nav_contact: 'Contact Us',
    nav_admin: 'Admin Console',
    hero_btn1: 'Watch Live Darshan',
    hero_btn2: 'Book Seva',
    hero_btn3: 'Contribute Now',
    hero_btn4: 'Post Your Story',
    aarti_timings: 'Daily Aarti Schedule',
    countdown_festival: 'Ghatasthapana Countdown (11 Oct, 12:00 AM IST)',
    mandal_history: 'Faith History & Milestones',
    mandal_history_desc: 'A divine journey starting from a humble altar in 1974 and leading major social welfare initiatives.',
    live_darshan_stream: 'Live Darshan Facility & Channels',
    live_darshan_desc: 'Live 24-hour transmission of Shree Ishwatichi Mata for devotees worldwide. Morning rituals and grand aartis live.',
    digital_seva_title: 'Online Puja, Aarti & Prasad Bookings',
    donate_holy_title: 'Sacred Contribution & Temple Fund',
    news_announcements: 'Latest Updates & Notifications',
    social_impact_title: 'Social Impact Services & Development',
    language_toggle: 'Selected Language: English',
    temple_status: 'Devotion Streak Tracker',
    streak_encouragement: 'Keep your streak alive by claiming darshan daily!'
  },
  MR: {
    title: 'श्री यंग इश्वटी नवरात्रौत्सव मंडळ',
    subtitle: 'श्रद्धा • भक्ती • परंपरा • सामाजिक सेवा',
    darshanTime: 'माता दर्शन वेळापत्रक',
    nav_home: 'मुख्यपृष्ठ',
    nav_about: 'मातेविषयी माहिती',
    nav_patrika: 'कार्यक्रम पत्रिका',
    nav_darshan: 'थेट दर्शन',
    nav_seva: 'डिजिटल सेवा',
    nav_events: 'उत्सव व कार्यक्रम',
    nav_gallery: 'अल्बम',
    nav_donation: 'देणगी द्या',
    nav_social: 'सामाजिक कार्य',
    nav_testimonials: 'भाविकांचे अनुभव',
    nav_news: 'घोषणा व बातम्या',
    nav_profile: 'माझे प्रोफाईल',
    nav_contact: 'संपर्क साधा',
    nav_admin: 'प्रशासक विभाग',
    hero_btn1: 'थेट दर्शन लाइव्ह',
    hero_btn2: 'सेवा बुकिंग',
    hero_btn3: 'देणगी जमा करा',
    hero_btn4: 'भक्तांचे अनुभव फॉर्म',
    aarti_timings: 'आरती वेळापत्रक',
    countdown_festival: 'घटस्थापना उलटी गणना (११ ऑक्टोबर, १२:०० AM IST)',
    mandal_history: 'श्रद्धेचा इतिहास आणि टप्पे',
    mandal_history_desc: '१९७४ मधील साध्या देव्हाऱ्यापासून सुरू झालेली दैवी वाटचाल आणि मंडळाचे सामाजिक उपक्रम.',
    live_darshan_stream: 'थेट दर्शन सुविधा आणि चॅनेल',
    live_darshan_desc: 'जगभरातील भाविकांसाठी श्री इश्वटीची मातेचे थेट २४ तास प्रक्षेपण. सकाळचे विधी आणि महाआरती लाईव्ह.',
    digital_seva_title: 'ऑनलाइन पूजा-आरती व प्रसाद नावनोंदणी',
    donate_holy_title: 'पवित्र देणगी आणि मंदिर निधी',
    news_announcements: 'ताज्या घडामोडी व मंडळाच्या सूचना',
    social_impact_title: 'समाज उपयोगी उपक्रम आणि विकास',
    language_toggle: 'निवडलेली भाषा: मराठी',
    temple_status: 'नियमित भक्ती ट्रॅकर',
    streak_encouragement: 'दररोज दर्शन घेऊन तुमची भक्ती सातत्य टिकवून ठेवा!'
  }
};

export const DEFAULT_SITE_CONTENT = {
  welcome: {
    titleEN: 'Shree Ishwatichi Mata Devasthan',
    titleMR: 'श्री इश्वटीची माता देवस्थान',
    subtitleEN: 'Faith • Devotion • Tradition • Service',
    subtitleMR: 'श्रद्धा • भक्ती • परंपरा • सेवा',
    descEN: 'Welcome to the official digital portal of Shree Ishwatichi Mata Devasthan Mandal. Experience live darshan from home and contribute to our community welfare initiatives.',
    descMR: 'श्री इश्वटीची माता देवस्थान मंडळाच्या अधिकृत डिजिटल कक्षात भाविकांचे स्वागत. घरबसल्या लाईव्ह पूजेचा आनंद घ्या आणि समाजोपयोगी उपक्रमांत भाग घ्या.'
  },
  about: {
    headerDescEN: 'Deeply rooted in ancient traditional heritage, Shree Ishwatichi Mata reigns as the supreme protectress of the region, blessing millions of devotees who experience physical healing and inner peace upon entering her presence.',
    headerDescMR: 'अनादी काळापासून भक्तांचे श्रद्धास्थान असलेल्या श्री इश्वटीची देवीच्या स्थापनेपासूनचा देदीप्यमान इतिहास, भक्तांना आलेले दैवी अनुभव आणि समाजोपयोगी कार्याची यशोगाथा.',
    originTitleEN: 'The Goddess & Origin',
    originTitleMR: 'देवीची उत्पत्ती व आख्यायिका',
    originTextEN: 'The holy origin story of Shree Ishwatichi Mata stems from deep community devotion. Legend states that in the early 1900s, a divine clay self-manifested (Swayambhu) stone was protected in areca plantations in the coastal regions. Blessed with elements of pure nature, she was lovingly named Ishwatichi ("She who holds the divine spark of Ishwar"). Devotees who visited the small sanctum witnessed sudden cures of visual ailments, crop yield increases, and extreme mental relief. Soon, the humble Mandal grew, channeling devotee contributions towards building a structured temple and leading major educational and emergency medical services.',
    originTextMR: 'श्री इश्वटीची मातेच्या मूळ मंदिराचा उगम अत्यंत पवित्र आहे. जुन्या काळात एका शेताजवळ स्वयंभू पाषाण स्वरूपात भक्तांना देवीचे दर्शन घडले. निधड्या भक्तीने आणि पारंपरिक संस्कारांनी पूजली गेलेली ही माता श्री इश्वटीची या नावाने सर्वदूर परिचित झाली. अनेक वर्षांपूर्वी गावात आलेल्या प्लेग व दुष्काळातून मातेच्या प्रसादाने गावाची सुटका झाली, अशी भक्तांची अतूट श्रद्धा आहे. यामुळेच दरवर्षी मुंबई, ठाणे, कोकण आणि परराज्यांतून लाखो भाविक मातेच्या दर्शनासाठी दरड कोसळण्याची भीती न बाळगता आवर्जून येतात.',
    missionTitleEN: 'Mandal Mission & Community Vision',
    missionTitleMR: 'मंडळाचा संकल्प आणि उद्दिष्टे',
    mission1_titleEN: 'Preserve Spiritual Architecture',
    mission1_titleMR: 'भक्ती संस्कारांचे संवर्धन',
    mission1_descEN: 'Ensuring thousands of devotees secure safe daily darshan, keeping temple clean, dry, and pure.',
    mission1_descMR: 'परंपरा आणि संस्कृती पिढ्यानपिढ्या जपणूक करून नवीन तंत्रज्ञानाद्वारे जागतिक पातळीवर पोहचवणे.',
    mission2_titleEN: 'Serve Humanity (Seva)',
    mission2_titleMR: 'अखंड मानव सेवा (अन्न आणि औषध वाटप)',
    mission2_descEN: 'Transforming devotional offerings directly into food distribution programs, free healthcare clinics, and tribal education centers.',
    mission2_descMR: 'भक्तांच्या देणगीचा योग्य विनियोग करून दररोज मोफत भोजन आणि गरीब रुग्णांना मोफत उपचार.',
    mission3_titleEN: 'Eco-Commitment & Welfare',
    mission3_titleMR: 'शाश्वत पर्यावरण संकल्प',
    mission3_descEN: 'Pledging 100% plastic-free festivals and organizing local sapling distribution drives.',
    mission3_descMR: 'उत्सवात शंभर टक्के कचराविहीन व्यवस्था आणि वृक्षारोपण मोहिमेला गती देणे.',
    quoteEN: 'True prayer manifests not only in dynamic chants, but in feeding the hungry and supporting emergency healthcare.',
    quoteMR: 'देवीची खरी भक्ती केवळ पूजा आणि आरतीत नसून भुकेलेल्यांना अन्न देणे आणि समाज हिताचे कार्य करण्यात सामावली आहे.'
  },
  contact: {
    addressEN: 'Shree Ishwatichi Mata Mandir, A/004, Shri Ishwati Prasad C.H.S., Dattaram Lad Marg, Kalachowki, Mumbai-400 033 ',
    addressMR: 'श्री इश्वटीची माता मंदिर, अ/००४, श्री इश्वटी प्रसाद को. ऑप. हौ. सो., दत्ताराम लाड मार्ग, काळाचौकी, मुंबई-४०० ०३३',
    phone: '+91 98929 38554',
    email: 'ishwatichimata10@gmail.com',
    hoursEN: '05:00 AM - 10:00 PM Daily',
    hoursMR: 'दररोज सकाळी ०५:०० ते रात्री १०:००'
  },
  aarti: {
    morningTimeEN: '05:30 AM (Morning Kakad Aarti)',
    morningTimeMR: 'सकाळी ०५:३० (प्रातः काकड महाआरती)',
    noonTimeEN: '12:00 PM (Noon Abhishek Puja & Bhog)',
    noonTimeMR: 'दुपारी १२:०० (मध्यान्ह पूजा व नैवेद्य)',
    eveningTimeEN: '07:30 PM (Grand evening Shringar Aarti)',
    eveningTimeMR: 'सायंकाळी ०७:३० (धूप आरती व मुख्य सायंकालीन महाआरती)'
  },
  milestones: [
    {
      year: '१९७४',
      title: 'Shree Ishwatichi Mandal Foundation',
      titleMarathi: 'श्री यंग इश्वटी नवरात्रौत्सव मंडळाची स्थापना',
      description: 'Simple wooden altar introduced by local energetic youth which marked the beginning of community devotion.',
      descriptionMarathi: 'स्थानिक तरुणांद्वारे छोट्या लाकडी देव्हाऱ्यात अत्यंत साधेपणाने श्री इश्वटीची मातेची स्थापना व उत्सवाला सुरुवात.'
    },
    {
      year: '१९८७',
      title: 'First Altar Brick Temple of Shree Ishwatichi',
      titleMarathi: 'श्री इश्वटीची पहिले भव्य मंदिर उभारणी',
      description: 'Establishment of the brick hall, shifting from clay to beautiful stone-carved patterns with local support.',
      descriptionMarathi: 'श्री इश्वटीची मातीच्या मूर्तीची प्राणप्रतिष्ठा आणि भाविकांच्या लोकवर्गणीतून विटांचे उत्कृष्ट सभागृह मंदिर उभारले गेले.'
    },
    {
      year: '१९९९',
      title: 'Social Service Commenced',
      titleMarathi: 'श्री इश्वटीची सामाजिक सेवा कक्षाची सुरुवात',
      description: 'Beginning of food security drives, organizing daily free meals kitchen and student support cells.',
      descriptionMarathi: 'श्री इश्वटीची नियमित सामाजिक कार्याला सुरुवात: गरजूंना मदत आणि दररोज विनामूल्य अन्नछत्र सेवा सुरू.'
    },
    {
      year: '२०१२',
      title: 'Grand Stone Temple Built',
      titleMarathi: 'श्री इश्वटीची नूतन दगडी हेमांडपंती मंदिर उभारणी',
      description: 'Constructed an architectural masterpiece in Hemadpanti style using pure rocks, adding gold towers.',
      descriptionMarathi: 'श्री इश्वटीची हेमांडपंती शैलीतील कोरीव भव्य दगडी मंदिर उभारणी, आकर्षक सोन्याचा कळस आणि अद्ययावत दर्शन रांगांचे नियोजन.'
    },
    {
      year: '२०२६',
      title: 'Digital Seva Live Portals',
      titleMarathi: 'श्री इश्वटीची अद्ययावत डिजिटल सोयी-सुविधा',
      description: 'Global release of online bookings, digital streams, interactive devotee feedback, and secure ledgers.',
      descriptionMarathi: 'श्री इश्वटीची भक्तांच्या सुविधेसाठी जागतिक स्तरावर डिजिटल सेवा आणि थेट प्रक्षेपण सुविधांचे अनावरण.'
    }
  ]
};

