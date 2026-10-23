-- ====================================================================
-- Shree Young Ishwati Navratrotsav Mandal (श्री यंग इश्वटी नवरात्रौत्सव मंडळ)
-- Database Architecture & Schema Specification
-- Dialect: PostgreSQL 14+ (ANSI SQL Standard Compliant)
-- Design: Clean Architecture & SOLID Domain-Driven Data Modeling
-- ====================================================================

-- Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. Table: devotee_experiences
-- Testimonials & divine experiences submitted by devotees
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS devotee_experiences (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    story TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    date DATE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_devotee_exp_approved_date 
    ON devotee_experiences (approved, date DESC);

-- --------------------------------------------------------------------
-- 2. Table: digital_seva_bookings
-- Devotee registrations for Pooja, Aarti, Sankalp, Prasad & Volunteering
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_seva_bookings (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(32) NOT NULL CHECK (type IN ('aarti', 'pooja', 'sankalp', 'prasad', 'volunteer')),
    sub_type VARCHAR(255) NOT NULL,
    devotee_name VARCHAR(255) NOT NULL,
    gotra VARCHAR(128),
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seva_booking_date 
    ON digital_seva_bookings (booking_date DESC);
CREATE INDEX IF NOT EXISTS idx_seva_booking_type 
    ON digital_seva_bookings (type, status);

-- --------------------------------------------------------------------
-- 3. Table: donation_records
-- Sacred financial contributions with 80G tax rebate audit tracking
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS donation_records (
    id VARCHAR(64) PRIMARY KEY,
    donor_name VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(64) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(255) NOT NULL,
    pan VARCHAR(20),
    utr VARCHAR(128),
    donation_date DATE NOT NULL,
    category VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_donations_date 
    ON donation_records (donation_date DESC);
CREATE INDEX IF NOT EXISTS idx_donations_category 
    ON donation_records (category);

-- --------------------------------------------------------------------
-- 4. Table: temple_events
-- Annual festivals, celebrations, and community initiatives
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS temple_events (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    title_marathi VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    description_marathi TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(128) NOT NULL,
    category VARCHAR(128) NOT NULL,
    rsvp_count INTEGER NOT NULL DEFAULT 0 CHECK (rsvp_count >= 0),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_temple_events_date 
    ON temple_events (event_date ASC);
CREATE INDEX IF NOT EXISTS idx_temple_events_category 
    ON temple_events (category);

-- --------------------------------------------------------------------
-- 5. Table: announcements
-- Official notices, press releases, circulars & public alerts
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    title_marathi VARCHAR(500) NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN ('Notice', 'Festival', 'Press', 'Event')),
    publication_date DATE NOT NULL,
    content TEXT NOT NULL,
    content_marathi TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcements_pubdate 
    ON announcements (publication_date DESC);

-- --------------------------------------------------------------------
-- 6. Table: user_profiles
-- Devotee profile, prayer streak tracking, and personalized milestones
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
    email VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    gotra VARCHAR(128),
    streak_count INTEGER NOT NULL DEFAULT 1 CHECK (streak_count >= 0),
    last_prayer_date DATE,
    total_donation NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    milestones_reached JSONB DEFAULT '[]'::jsonb,
    navratri_theme_day VARCHAR(32) DEFAULT 'auto',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 7. Table: site_content
-- Dynamic CMS content parameters managed by Mandal Trustees
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_content (
    id VARCHAR(64) PRIMARY KEY,
    content_key VARCHAR(128) NOT NULL UNIQUE,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- Initial Seed Data
-- ====================================================================

-- Festivals Seed Data (Starting Navratri on 11 Oct 2026)
INSERT INTO temple_events (id, title, title_marathi, description, description_marathi, event_date, event_time, category, rsvp_count, image_url)
VALUES 
(
    'ev-1',
    'श्री इश्वटीची आषाढी एकादशी महापूजा आणि भजन संध्या',
    'श्री इश्वटीची आषाढी एकादशी महापूजा आणि भजन संध्या',
    'श्री इश्वटीची माता महापूजा, त्यानंतर प्रख्यात स्थानिक कलाकारांद्वारे अखंड भजन संध्या.',
    'श्री इश्वटीची माता महापूजा, त्यानंतर प्रख्यात स्थानिक कलाकारांद्वारे अखंड भजन संध्या.',
    '2026-07-05',
    'सकाळी ०५:०० ते रात्री १०:००',
    'उत्सव',
    245,
    'https://images.unsplash.com/photo-1609137144814-726d36e8b792?auto=format&fit=crop&q=80&w=800'
),
(
    'ev-2',
    'श्री इश्वटी मातेचा ५३ वा शारदीय नवरात्र महोत्सव सोहळा २०२६',
    'श्री इश्वटी मातेचा ५३ वा शारदीय नवरात्र महोत्सव सोहळा २०२६',
    'श्री इश्वटी मातेचा ५३ वा शारदीय नवरात्रौत्सव सोहळा २०२६ (स्थापना १९७४). १० ऑक्टोबर आगमन सोहळा (सायं ०५:००), ११ ऑक्टोबर घटस्थापना (मध्यरात्र १२:०० AM IST पर्वकाळ / स. ११:०० पूजा) ते २५ ऑक्टोबर कोजागिरी व साडी लिलाव.',
    'श्री इश्वटी मातेचा ५३ वा शारदीय नवरात्रौत्सव सोहळा २०२६ (स्थापना १९७४). १० ऑक्टोबर आगमन सोहळा (सायं ०५:००), ११ ऑक्टोबर घटस्थापना (मध्यरात्र १२:०० AM IST पर्वकाळ / स. ११:०० पूजा) ते २५ ऑक्टोबर कोजागिरी व साडी लिलाव.',
    '2026-10-11',
    '१० ऑक्टोबर आगमन (सायं ०५:००) | ११ ऑक्टोबर घटस्थापना (१२:०० AM IST) ते २५ ऑक्टोबर २०२६',
    'उत्सव',
    1890,
    'https://images.unsplash.com/photo-1561361513-2d000a50f0db?auto=format&fit=crop&q=80&w=800'
),
(
    'ev-3',
    'श्री यंग इश्वटी नवरात्रौत्सव मंडळ: मोफत बहुविशेषज्ञता भव्य आरोग्य व दंत तपासणी शिबीर',
    'श्री यंग इश्वटी नवरात्रौत्सव मंडळ: मोफत बहुविशेषज्ञता भव्य आरोग्य व दंत तपासणी शिबीर',
    'श्री यंग इश्वटी नवरात्रौत्सव मंडळ समाजोपयोगी उपक्रमांतर्गत मोफत आरोग्य तपासणी, दंत आणि डोळे तपासणी व मोफत औषध वाटप.',
    'श्री यंग इश्वटी नवरात्रौत्सव मंडळ समाजोपयोगी उपक्रमांतर्गत मोफत आरोग्य तपासणी, दंत आणि डोळे तपासणी व मोफत औषध वाटप.',
    '2026-08-15',
    'सकाळी ०९:०० ते दुपारी ०४:००',
    'सामाजिक सेवा',
    512,
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800'
),
(
    'ev-4',
    'श्री इश्वटीची चैत्र शुद्ध प्रतिपदा (गुढीपाडवा) शोभायात्रा उत्सव',
    'श्री इश्वटीची चैत्र शुद्ध प्रतिपदा (गुढीपाडवा) शोभायात्रा उत्सव',
    'श्री इश्वटीची मातेच्या आशीर्वादाने हिंदू नववर्षाच्या स्वागतासाठी भव्य पारंपरिक शोभायात्रा, पावन गुढी उभारणी, कडू लिंब-गुळ प्रसाद वाटप.',
    'श्री इश्वटीची मातेच्या आशीर्वादाने हिंदू नववर्षाच्या स्वागतासाठी भव्य पारंपरिक शोभायात्रा, पावन गुढी उभारणी, कडू लिंब-गुळ प्रसाद वाटप.',
    '2026-03-29',
    'सकाळी ०६:०० ते ११:००',
    'सांस्कृतिक कार्यक्रम',
    410,
    'https://images.unsplash.com/photo-1621245366437-0ea87295aafe?auto=format&fit=crop&q=80&w=800'
)
ON CONFLICT (id) DO NOTHING;

-- Devotee Experiences Seed Data
INSERT INTO devotee_experiences (id, name, location, story, approved, rating, date)
VALUES
(
    'exp-1',
    'सुनीता कुलकर्णी (Sunita Kulkarni)',
    'पुणे, महाराष्ट्र (Pune)',
    'गेल्या नवरात्रात मी आई इश्वटीचीच्या दरबारात संकल्प केला होता. मातेच्या आशीर्वादाने माझ्या मुलाला उच्च शिक्षणासाठी शिष्यवृत्ती मिळाली आणि आमचे कौटुंबिक संकट दूर झाले. अखंड ज्योतीचे दर्शन मनाला असीम शांतता देते.',
    TRUE,
    5,
    '2026-05-14'
),
(
    'exp-2',
    'रमेश पाटील (Ramesh Patil)',
    'ठाणे (Thane)',
    'दर मंगळवारी मी मंडळाच्या मोफत महाप्रसाद सेवेत अन्नदान करतो. या पवित्र देवस्थानात आल्यावर मिळणारा मानसिक आनंद शब्दातीत आहे. इश्वटीची मातेची कृपा सदैव भक्तांवर राहू दे!',
    TRUE,
    5,
    '2026-06-02'
)
ON CONFLICT (id) DO NOTHING;

-- Devotee Profile Seed Data (Official Devotee Sanctuary)
INSERT INTO user_profiles (email, name, phone, gotra, streak_count, last_prayer_date, total_donation, milestones_reached, navratri_theme_day)
VALUES (
    'devendraparte2001@gmail.com',
    'DEVENDRA PRAKASH PARTE',
    '9892938554',
    'Kashyap',
    1,
    '2026-10-10',
    0.00,
    '[]'::jsonb,
    'auto'
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    navratri_theme_day = EXCLUDED.navratri_theme_day,
    updated_at = CURRENT_TIMESTAMP;

-- --------------------------------------------------------------------
-- 8. Table: navratri_patrika_schedule
-- Authentic 9-Day Festival Calendar for Shardiya Navratri Celebrations
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS navratri_patrika_schedule (
    id VARCHAR(64) PRIMARY KEY,
    day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 15),
    day_name_mr VARCHAR(64) NOT NULL,
    day_name_en VARCHAR(64) NOT NULL,
    date_str_mr VARCHAR(128) NOT NULL,
    date_str_en VARCHAR(128) NOT NULL,
    date_iso DATE NOT NULL,
    time_schedule VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN ('pooja', 'devotional', 'cultural', 'havan', 'visarjan', 'auction')),
    event_details_mr TEXT NOT NULL,
    event_details_en TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patrika_schedule_date 
    ON navratri_patrika_schedule (date_iso ASC);
CREATE INDEX IF NOT EXISTS idx_patrika_schedule_day 
    ON navratri_patrika_schedule (day_number ASC);
CREATE INDEX IF NOT EXISTS idx_patrika_category 
    ON navratri_patrika_schedule (category);

-- Seed Data: Official Shardiya Navratri 2026 Patrika (यंग इश्वटी नवरात्रौत्सव मंडळ)
INSERT INTO navratri_patrika_schedule (id, day_number, day_name_mr, day_name_en, date_str_mr, date_str_en, date_iso, time_schedule, category, event_details_mr, event_details_en)
VALUES
('patrika-day-1', 1, 'शनिवार', 'Saturday', '१०/१०/२०२६', '10/10/2026', '2026-10-10', 'संध्याकाळी ५.०० वाजता', 'pooja', 'श्री इश्वटी देवीचे आगमन | स्थळ : उदय खातू कारखाना (भालचंद्र मैदान)', 'Shree Ishwati Devi Grand Arrival (Aagman) | Venue: Uday Khatu Karkhana (Bhalchandra Maidan)'),
('patrika-day-2', 2, 'रविवार', 'Sunday', '११/१०/२०२६', '11/10/2026', '2026-10-11', 'सकाळी ११.०० वा., सायं. ६.०० वा., ठीक ८.०० वा.', 'pooja', 'सकाळी ११.०० वा. देवीची घटस्थापना | सायं. ६.०० वा. सांस्कृतिक कार्यक्रम (भजन) - जीवन विद्या मिशन (उपासना यज्ञ) | ठीक ८.०० वा. खेळ खेळूया अंताक्षरीचा स्पर्धा सौजन्य संजय परब', '11:00 AM Devi Ghatasthapana | 06:00 PM Bhajan - Jeevan Vidya Mission (Upasana Yajna) | 08:00 PM Antakshari Competition courtesy Sanjay Parab'),
('patrika-day-3', 3, 'सोमवार', 'Monday', '१२/१०/२०२६', '12/10/2026', '2026-10-12', 'संध्याकाळी ६.०० वाजता', 'devotional', 'सांस्कृतिक कार्यक्रम (भजन) - श्री स्वामी समर्थ महिला भजन मंडळ (अभ्युदयनगर)', 'Cultural Program (Bhajan) - Shree Swami Samarth Mahila Bhajan Mandal (Abhyudayanagar)'),
('patrika-day-4', 4, 'मंगळवार', 'Tuesday', '१३/१०/२०२६', '13/10/2026', '2026-10-13', 'दुपारी २.३० वाजता', 'cultural', 'सांस्कृतिक कार्यक्रम - मैदानी स्पर्धा | अखिल भारतीय श्री स्वामी समर्थ आध्यात्मिक विकास मार्ग (काळाचौकी केंद्रातर्फे) दुर्गासप्तशती पाठ', 'Cultural Program - Sports Competition | Durga Saptashati Path by Akhil Bharatiya Shree Swami Samarth Adhyatmik Vikas Marg (Kalachowki Center)'),
('patrika-day-5', 5, 'बुधवार', 'Wednesday', '१४/१०/२०२६', '14/10/2026', '2026-10-14', 'रात्री ८.०० वा. व सायं. ८.०० वा.', 'devotional', 'रात्री ८.०० वा. महाआरती ( बिल्डिंग नंबर ४१ अभ्युदयनगर ) | संध्याकाळी ८.०० वा. पाककला स्पर्धा', '08:00 PM Maha Aarti (Building No. 41, Abhyudayanagar) | 08:00 PM Pakkala Spardha (Culinary Competition)'),
('patrika-day-6', 6, 'गुरुवार', 'Thursday', '१५/१०/२०२६', '15/10/2026', '2026-10-15', 'सायंकाळी ४.०० वा. व सायं. ७.०० वा.', 'pooja', 'सायंकाळी ४.०० वा. सत्यनारायण पूजा | संध्याकाळी ७.०० वा. भजन कार्यक्रम', '04:00 PM Satyanarayan Pooja | 07:00 PM Devotional Bhajan Program'),
('patrika-day-7', 7, 'शुक्रवार', 'Friday', '१६/१०/२०२६', '16/10/2026', '2026-10-16', 'संध्याकाळी ७.०० वाजता', 'cultural', 'संगीत कार्यक्रम', 'Musical Orchestra & Devotional Songs Program'),
('patrika-day-8', 8, 'शनिवार', 'Saturday', '१७/१०/२०२६', '17/10/2026', '2026-10-17', 'रात्री ९.०० वाजता', 'devotional', 'देवीच जागरण व गोंधळ', 'Devicha Jagran & Gondhal Sacred Ceremony'),
('patrika-day-9', 9, 'रविवार', 'Sunday', '१८/१०/२०२६', '18/10/2026', '2026-10-18', 'दुपारी २.३० वाजता', 'havan', 'होमहवन व देवीचा महाप्रसाद (भंडारा)', 'Sacred Hom-Havan & Devi Mahaprasad (Grand Bhandara Feast)'),
('patrika-day-10', 10, 'सोमवार', 'Monday', '१९/१०/२०२६', '19/10/2026', '2026-10-19', 'संध्याकाळी ८.०० वाजता', 'cultural', 'खेळ खेळू पैठणीचा', 'Khel Khelu Paithanicha (Grand Family Traditional Contest)'),
('patrika-day-11', 11, 'मंगळवार', 'Tuesday', '२०/१०/२०२६', '20/10/2026', '2026-10-20', 'संध्याकाळी ८.०० वाजता', 'cultural', 'दसरा-सोने लुटण्याचा कार्यक्रम', 'Dussehra - Sone Lutnyacha Karyakram (Traditional Gold Leaf Greetings)'),
('patrika-day-12', 12, 'बुधवार', 'Wednesday', '२१/१०/२०२६', '21/10/2026', '2026-10-21', 'संध्याकाळी ६.०० वाजता', 'visarjan', 'श्री इश्वटी मातेची भव्य-दिव्य मिरवणूक विसर्जन', 'Shree Ishwati Mata Grand Holy Visarjan Immersion Procession'),
('patrika-day-13', 13, 'रविवार', 'Sunday', '२५/१०/२०२६', '25/10/2026', '2026-10-25', 'सकाळी ११.०० वाजता', 'auction', 'साडी लिलाव व कोजागिरी पौर्णिमा', 'Devi Saree Public Auction & Kojagiri Pournima Celebration')
ON CONFLICT (id) DO UPDATE SET
    day_number = EXCLUDED.day_number,
    day_name_mr = EXCLUDED.day_name_mr,
    day_name_en = EXCLUDED.day_name_en,
    date_str_mr = EXCLUDED.date_str_mr,
    date_str_en = EXCLUDED.date_str_en,
    date_iso = EXCLUDED.date_iso,
    time_schedule = EXCLUDED.time_schedule,
    category = EXCLUDED.category,
    event_details_mr = EXCLUDED.event_details_mr,
    event_details_en = EXCLUDED.event_details_en;

-- --------------------------------------------------------------------
-- 9. Table: gallery_videos
-- Sacred Instagram Video Reels & holy festival footage (Add / Edit / Delete supported)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery_videos (
    id VARCHAR(64) PRIMARY KEY,
    reel_url TEXT NOT NULL,
    embed_url TEXT NOT NULL,
    title_mr VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    description_mr TEXT,
    description_en TEXT,
    author_handle VARCHAR(100) DEFAULT '@ishwatichi_mata',
    established_year VARCHAR(20) DEFAULT '१९७४',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gallery_videos_created 
    ON gallery_videos (created_at DESC);

-- Seed Data: Official Instagram Reel (Est. 1974)
INSERT INTO gallery_videos (id, reel_url, embed_url, title_mr, title_en, description_mr, description_en, author_handle, established_year)
VALUES (
    'reel-official-navratri-1974',
    'https://www.instagram.com/reel/Cx0sn8AoN7l/?stkn=MTAzcXJldTZpdm15ag==',
    'https://www.instagram.com/reel/Cx0sn8AoN7l/embed',
    'यंग ईश्र्वती नवरात्रौत्सव मंडळ || ईश्र्वतीची माता || परंपरा उत्सवाची स्थापना: १९७४',
    'Shree Young Ishwati Navratrotsav Mandal || Ishwatichi Mata || Tradition of Celebration (Est. 1974)',
    'मंडळाचा अधिकृत इंस्टाग्राम व्हिडिओ रील - श्री ईश्वटीची माता परंपरा, भव्य मिरवणूक आणि भक्तिमय दर्शन.',
    'Official holy Instagram video reel featuring Shree Ishwatichi Mata grand festival traditions and divine blessings.',
    '@ishwatichi_mata',
    '१९७४'
)
ON CONFLICT (id) DO UPDATE SET
    reel_url = EXCLUDED.reel_url,
    embed_url = EXCLUDED.embed_url,
    title_mr = EXCLUDED.title_mr,
    title_en = EXCLUDED.title_en,
    description_mr = EXCLUDED.description_mr,
    description_en = EXCLUDED.description_en,
    updated_at = CURRENT_TIMESTAMP;

-- --------------------------------------------------------------------
-- 10. Table: navratri_2026_colors
-- Official Navratri 2026 – 9 Days, 9 Colours, 9 Blessings Schema
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS navratri_2026_colors (
    day_number INTEGER PRIMARY KEY CHECK (day_number BETWEEN 1 AND 9),
    date_str VARCHAR(32) NOT NULL,
    date_iso DATE NOT NULL,
    goddess_name VARCHAR(128) NOT NULL,
    color_name VARCHAR(64) NOT NULL,
    color_hex VARCHAR(16) NOT NULL,
    significance TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data: Official Navratri 2026 (9 Days, 9 Colours, 9 Blessings)
INSERT INTO navratri_2026_colors (day_number, date_str, date_iso, goddess_name, color_name, color_hex, significance)
VALUES
(1, '11th October 2026', '2026-10-11', 'Maa Shailputri', 'Orange', '#EA580C', 'Warmth, energy and brightness'),
(2, '12th October 2026', '2026-10-12', 'Maa Brahmacharini', 'White', '#F8FAFC', 'Purity, peace and simplicity'),
(3, '13th October 2026', '2026-10-13', 'Maa Chandraghanta', 'Red', '#DC2626', 'Passion, love and raw strength'),
(4, '14th October 2026', '2026-10-14', 'Maa Kushmada', 'Royal Blue', '#1D4ED8', 'Depth, richness, and divine calm'),
(5, '15th October 2026', '2026-10-15', 'Maa Skandamata', 'Yellow', '#EAB308', 'Joy, optimism and brightness'),
(6, '16th October 2026', '2026-10-16', 'Maa Katyayani', 'Green', '#16A34A', 'Growth, nature and new beginnings'),
(7, '17th October 2026', '2026-10-17', 'Maa Kalaratri', 'Grey', '#6B7280', 'Quiet strength and balance'),
(8, '18th October 2026', '2026-10-18', 'Maa Mahagauri', 'Purple', '#7E22CE', 'Ambition, dignity, and spiritual fulfilments'),
(9, '19th October 2026', '2026-10-19', 'Maa Siddhidatri', 'Peacock Green', '#0D9488', 'Individuality, freshness and compassion')
ON CONFLICT (day_number) DO UPDATE SET
    date_str = EXCLUDED.date_str,
    date_iso = EXCLUDED.date_iso,
    goddess_name = EXCLUDED.goddess_name,
    color_name = EXCLUDED.color_name,
    color_hex = EXCLUDED.color_hex,
    significance = EXCLUDED.significance;

-- --------------------------------------------------------------------
-- 11. Table: devi_mata_images
-- Daily sacred darshan images of Shree Ishwatichi Mata with CRUD support
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS devi_mata_images (
    id VARCHAR(64) PRIMARY KEY,
    url TEXT NOT NULL,
    title_mr VARCHAR(500) NOT NULL,
    title_en VARCHAR(500) NOT NULL,
    description_mr TEXT,
    description_en TEXT,
    date_str VARCHAR(32) NOT NULL,
    year VARCHAR(10) NOT NULL DEFAULT '2026',
    is_hero_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_devi_mata_images_date 
    ON devi_mata_images (date_str DESC);

-- Seed Data: Official Sanctum Darshan
INSERT INTO devi_mata_images (id, url, title_mr, title_en, date_str, year, is_hero_default)
VALUES (
    'devi-default-sanctum-2026',
    'https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/ishwatichi_mata_authentic_hero.png',
    'श्री इश्वटीची माता ५३ वे वर्ष - अखंड पावन दर्शन',
    'Shree Ishwatichi Mata 53rd Year - Sacred Sanctum Darshan',
    '2026-10-11',
    '2026',
    TRUE
)
ON CONFLICT (id) DO UPDATE SET
    title_mr = EXCLUDED.title_mr,
    title_en = EXCLUDED.title_en,
    updated_at = CURRENT_TIMESTAMP;

-- --------------------------------------------------------------------
-- 12. Table: gallery_media
-- Unified repository of photos, videos, and devotional reels with year filters
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery_media (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(32) NOT NULL CHECK (type IN ('photo', 'video', 'instagram')),
    url TEXT NOT NULL,
    embed_url TEXT,
    local_video_id VARCHAR(128),
    file_name VARCHAR(255),
    file_size BIGINT,
    title_mr VARCHAR(500) NOT NULL,
    title_en VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    year VARCHAR(10) NOT NULL DEFAULT '2026',
    description_mr TEXT,
    description_en TEXT,
    author_handle VARCHAR(100) DEFAULT '@ishwatichi_mata',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gallery_media_order 
    ON gallery_media (display_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_media_category 
    ON gallery_media (category, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_gallery_media_year 
    ON gallery_media (year, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_gallery_media_local_video 
    ON gallery_media (local_video_id);

-- --------------------------------------------------------------------
-- 13. Table: featured_ashtami_video_configs
-- Configurable video player under Ashtami Maha Aarti (Official, Local, YouTube, Instagram)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS featured_ashtami_video_configs (
    id VARCHAR(64) PRIMARY KEY,
    source_type VARCHAR(32) NOT NULL CHECK (source_type IN ('official', 'youtube', 'instagram', 'local')),
    video_url TEXT NOT NULL,
    embed_url TEXT,
    title VARCHAR(500) NOT NULL,
    title_marathi VARCHAR(500) NOT NULL,
    local_video_id VARCHAR(128),
    file_name VARCHAR(255),
    file_size BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data: Default Official Ashtami Dharmaveer Durga Maha Aarti
INSERT INTO featured_ashtami_video_configs (id, source_type, video_url, embed_url, title, title_marathi, is_active)
VALUES (
    'ashtami-featured-official',
    'official',
    'https://youtu.be/28TJIom9GFw?si=rTrYi7hPJleZzsEG',
    'https://www.youtube-nocookie.com/embed/28TJIom9GFw?enablejsapi=1&rel=0&modestbranding=1',
    'Ashtami - Dharmaveer Durga Maha Aarti | Adarsh Shinde',
    'अष्टमी - धर्मवीर दुर्गा महाआरती | गायक: आदर्श शिंदे (झी म्युझिक मराठी)',
    TRUE
)
ON CONFLICT (id) DO UPDATE SET
    video_url = EXCLUDED.video_url,
    embed_url = EXCLUDED.embed_url,
    title = EXCLUDED.title,
    title_marathi = EXCLUDED.title_marathi,
    updated_at = CURRENT_TIMESTAMP;

-- ====================================================================
-- Incremental Migrations
-- ====================================================================

-- Migration: Add display_order to gallery_media for drag-and-drop reordering
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_gallery_media_order ON gallery_media (display_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_media_category ON gallery_media (category, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_gallery_media_year ON gallery_media (year, display_order ASC);

-- Migration: Add local video persistence columns to gallery_media
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS local_video_id VARCHAR(128);
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS file_size BIGINT;
CREATE INDEX IF NOT EXISTS idx_gallery_media_local_video ON gallery_media (local_video_id);

-- Migration: Add Firebase Cloud Storage path column for global media access
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS storage_path VARCHAR(512);
ALTER TABLE featured_ashtami_video_configs ADD COLUMN IF NOT EXISTS storage_path VARCHAR(512);
CREATE INDEX IF NOT EXISTS idx_gallery_media_storage_path ON gallery_media (storage_path);

-- --------------------------------------------------------------------
-- 10. Table: site_seo_metadata
-- Google SEO, Structured Data & Multilingual Keyword Catalog
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_seo_metadata (
    id VARCHAR(64) PRIMARY KEY,
    canonical_url TEXT NOT NULL,
    default_title_en VARCHAR(255) NOT NULL,
    default_title_mr VARCHAR(255) NOT NULL,
    meta_description_en TEXT NOT NULL,
    meta_description_mr TEXT NOT NULL,
    keywords TEXT NOT NULL,
    schema_markup JSONB,
    sitemap_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default SEO record matching exact search query 'ishwati chi mata'
INSERT INTO site_seo_metadata (id, canonical_url, default_title_en, default_title_mr, meta_description_en, meta_description_mr, keywords)
VALUES (
    'seo-primary-config',
    'https://ishwatichimata.org/',
    'Ishwati Chi Mata | Shree Ishwatichi Mata Official Website',
    'श्री इश्वटीची माता देवस्थान (मंडळ) | अधिकृत संकेतस्थळ',
    'Official website of Shree Ishwati Chi Mata Devasthan Mandal (श्री इश्वटीची माता). Watch 24/7 live darshan, daily aartis, Navratri festival celebrations, photos, videos & seva bookings.',
    'श्री इश्वटीची माता देवस्थान मंडळाचे अधिकृत संकेतस्थळ. २४/७ पावन थेट दर्शन, दैनंदिन महाआरती, शारदीय नवरात्रौत्सव, पावन व्हिडिओ व फोटो दालन, आणि डिजिटल सेवा बुकिंग.',
    'ishwati chi mata, ishwati chi mata mandir, ishwati chi mata devasthan, ishwati chi mata navratri, ishwati chi mata photo, ishwati chi mata video, ishwati chi mata aarti, ishwatichi mata, ishwatichimata, shree ishwati chi mata, श्री इश्वटीची माता, इश्वटीची माता'
)
ON CONFLICT (id) DO UPDATE SET
    canonical_url = EXCLUDED.canonical_url,
    default_title_en = EXCLUDED.default_title_en,
    default_title_mr = EXCLUDED.default_title_mr,
    updated_at = CURRENT_TIMESTAMP;

-- --------------------------------------------------------------------
-- 11. Table: soundboard_items
-- Sacred Soundboard (पवित्र ध्वनी) Mantras, Conch Shell & Vedic Chants
-- Managed by Admin with Real-time Devotee Audio Synthesis
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS soundboard_items (
    id VARCHAR(64) PRIMARY KEY,
    name_mr VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    chant_text_mr TEXT NOT NULL,
    chant_text_en TEXT,
    frequency_hz NUMERIC(6, 2) DEFAULT 136.1,
    category VARCHAR(50) NOT NULL DEFAULT 'mantra' CHECK (category IN ('mantra', 'stuti', 'instrument', 'aarti')),
    audio_url TEXT,
    storage_path TEXT,
    audio_file_name VARCHAR(255),
    audio_file_size BIGINT,
    description_mr TEXT,
    description_en TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Safe incremental alter commands for existing production databases:
ALTER TABLE soundboard_items ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE soundboard_items ADD COLUMN IF NOT EXISTS audio_file_name VARCHAR(255);
ALTER TABLE soundboard_items ADD COLUMN IF NOT EXISTS audio_file_size BIGINT;

CREATE INDEX IF NOT EXISTS idx_soundboard_items_active ON soundboard_items (is_active, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_soundboard_items_category ON soundboard_items (category, display_order ASC);

-- Seed default sacred soundboard items
INSERT INTO soundboard_items (id, name_mr, name_en, chant_text_mr, chant_text_en, frequency_hz, category, description_mr, description_en, is_active, display_order)
VALUES
(
    'omkar',
    'ॐकार पवित्र नाद',
    'Omkar Chant (136.1Hz)',
    '॥ ॐ ॐ ॐ ॥',
    'Om Om Om',
    136.1,
    'mantra',
    'विश्वब्रह्मांडाचा मूल ध्वनी आणि वैश्विक शांती कंपन',
    'Primordial cosmic vibration of the universe tuned to natural earth frequency',
    TRUE,
    1
),
(
    'ishwati_mata',
    'श्री इश्वटीची माता महामंत्र',
    'Ishwati Mata Mahamantra',
    '॥ ॐ श्री इश्वटीची माता प्रसन्न ॥',
    'Om Shree Ishwatichi Mata Prasanna',
    136.1,
    'mantra',
    'कुलस्वामिनी श्री इश्वटीची मातेचा आशीर्वाद देणारा पावन मंत्र',
    'Sacred invocation of the presiding Divine Mother for universal blessings',
    TRUE,
    2
),
(
    'durga_gayatri',
    'दुर्गा गायत्री मंत्र',
    'Durga Gayatri Mantra',
    '॥ ॐ कात्यायनाय विद्महे कन्यकुमारि धीमहि तन्नो दुर्गा प्रचोदयात् ॥',
    'Om Katyayanaya Vidmahe Kanyakumari Dhimahi Tanno Durgah Prachodayat',
    144.0,
    'mantra',
    'आत्मशक्ती जागृत करणारा आणि भय निवारण करणारा गायत्री मंत्र',
    'Vedic prayer invoking inner strength, courage and spiritual wisdom',
    TRUE,
    3
),
(
    'sarva_mangal',
    'सर्वमंगल मांगल्ये स्तोत्र',
    'Sarva Mangal Mangalye',
    '॥ सर्वमंगल मांगल्ये शिवे सर्वार्थ साधिके । शरण्ये त्र्यंबके गौरि नारायणि नमोऽस्तु ते ॥',
    'Sarva Mangala Mangalye Shive Sarvartha Sadhike Sharanye Tryambake Gauri Narayani Namostute',
    153.3,
    'stuti',
    'सर्व शुभ कार्यांची सिद्धी करणारी आदिशक्तीची परम स्तुती',
    'Universal benediction verse invoking the benevolent Mother of all creation',
    TRUE,
    4
)
ON CONFLICT (id) DO UPDATE SET
    name_mr = EXCLUDED.name_mr,
    name_en = EXCLUDED.name_en,
    chant_text_mr = EXCLUDED.chant_text_mr,
    frequency_hz = EXCLUDED.frequency_hz,
    updated_at = CURRENT_TIMESTAMP;

-- --------------------------------------------------------------------
-- 12. Table: site_branding_and_logo
-- Official Logo & Visual Identity Configurations (CRUD)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_branding_and_logo (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'primary_branding',
    logo_url TEXT NOT NULL,
    logo_alt_mr VARCHAR(255) NOT NULL,
    logo_alt_en VARCHAR(255) NOT NULL,
    logo_width INTEGER DEFAULT 80,
    storage_path TEXT,
    is_custom_logo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_branding_and_logo (id, logo_url, logo_alt_mr, logo_alt_en, logo_width, is_custom_logo)
VALUES (
    'primary_branding',
    '/assets/branding/Mandal logo Maroon Transparent BG.png',
    'श्री यंग ईश्वटी नवरात्रौत्सव मंडळ - अधिकृत बोधचिन्ह',
    'Shree Young Ishwati Navratrotsav Mandal Official Logo',
    80,
    FALSE
)
ON CONFLICT (id) DO UPDATE SET
    updated_at = CURRENT_TIMESTAMP;

-- --------------------------------------------------------------------
-- 13. Table: site_header_config
-- Header Titles, Subtitles, Badges & Invocations (CRUD)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_header_config (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'primary_header',
    title_mr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    badge_mr VARCHAR(100) NOT NULL DEFAULT 'देवस्थान',
    badge_en VARCHAR(100) NOT NULL DEFAULT 'Devasthan',
    subtitle_mr VARCHAR(255) NOT NULL,
    subtitle_en VARCHAR(255) NOT NULL,
    invocation_mr VARCHAR(255) NOT NULL,
    invocation_en VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_header_config (id, title_mr, title_en, badge_mr, badge_en, subtitle_mr, subtitle_en, invocation_mr, invocation_en)
VALUES (
    'primary_header',
    'श्री यंग इश्वटी नवरात्रौत्सव मंडळ',
    'Shree Young Ishwati Navratrotsav Mandal',
    'देवस्थान',
    'Devasthan',
    'श्रद्धा • भक्ती • परंपरा • सेवा',
    'Shree Ishwatichi Mata Devasthan Trust • Estd 1974',
    '|| श्री इश्वटीची माता की जय! अधिकृत डिजिटल कक्षात स्वागत ||',
    '|| Hail Shree Ishwatichi Mata! Welcome to Official Digital Portal ||'
)
ON CONFLICT (id) DO UPDATE SET
    updated_at = CURRENT_TIMESTAMP;

-- --------------------------------------------------------------------
-- 14. Table: navigation_menu_items
-- Header Navbar & Mobile Navigation Menu Items (CRUD)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS navigation_menu_items (
    id VARCHAR(64) PRIMARY KEY,
    label_mr VARCHAR(100) NOT NULL,
    label_en VARCHAR(100) NOT NULL,
    icon VARCHAR(30) NOT NULL,
    desc_mr VARCHAR(255),
    desc_en VARCHAR(255),
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 1,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    target_tab VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_navigation_menu_order ON navigation_menu_items (is_visible, display_order ASC);

INSERT INTO navigation_menu_items (id, label_mr, label_en, icon, desc_mr, desc_en, is_visible, display_order, is_custom)
VALUES
    ('home', 'मुख्य दालन', 'Home', '🏠', 'मुख्य डिजिटल दालन व वैशिष्ट्ये', 'Main digital sanctum & highlights', TRUE, 1, FALSE),
    ('about', 'इतिहास', 'About Sanctum', '🕉️', 'मंदिराचा इतिहास व देवीची आख्यायिका', 'Sanctum history & sacred origin', TRUE, 2, FALSE),
    ('patrika', 'कार्यक्रम पत्रिका', 'Karyakram Patrika', '📜', 'अधिकृत २०२६ नवरात्रौत्सव ९-दिवसीय कार्यक्रम पत्रिका', 'Official 2026 9-Day Navratri Festival Program', TRUE, 3, FALSE),
    ('darshan', 'थेट दर्शन', 'Live Darshan', '🎥', 'थेट दर्शन प्रक्षेपण व घंटानाद', 'Live camera feeds & divine soundboard', TRUE, 4, FALSE),
    ('seva', 'सेवा नोंदणी', 'Digital Seva', '🕯️', 'आरती, अभिषेक पूजा व प्रसाद नोंदणी', 'Book aarti, pooja, prasad & volunteering', TRUE, 5, FALSE),
    ('events', 'उत्सव वेळापत्रक', 'Events & Utsav', '🗓️', 'उत्सव वेळापत्रक व उपस्थिती नोंदणी', 'Festival calendar & RSVP presence', TRUE, 6, FALSE),
    ('gallery', 'छायाचित्रे व व्हिडिओ', 'Media Gallery', '🖼️', 'पवित्र दर्शन छायाचित्रे व व्हिडिओ', 'HD photos, holy darshan & videos', TRUE, 7, FALSE),
    ('testimonials', 'भक्तांचे अनुभव', 'Testimonials', '💬', 'भाविकांचे दैवी अनुभव व साक्ष', 'Devotee divine experiences & stories', TRUE, 8, FALSE),
    ('donation', 'देणगी निधी', 'Donations', '💝', '८०जी करसवलत देणगी व मंदिर निधी', '80G tax exempt trust funds & donations', TRUE, 9, FALSE),
    ('social', 'समाजकार्य', 'Social Initiatives', '🤝', 'अन्नछत्र, मोफत दवाखाना व शिक्षण सेवा', 'Tribal food distribution, clinics & school', TRUE, 10, FALSE),
    ('news', 'परिपत्रके व सूचना', 'Board Circulars', '📢', 'मंडळाची अधिकृत परिपत्रके व सूचना', 'Official temple board circulars & press', TRUE, 11, FALSE),
    ('profile', 'माझे प्रोफाईल', 'My Profile', '🕉️', 'भक्ती सातत्य गुण व सुवर्ण पदके', 'Prayer streak, badges & personalized hub', TRUE, 12, FALSE),
    ('admin', 'विश्वस्त नियंत्रण कक्ष', 'Admin Station', '⚙️', 'अधिकृत विश्वस्त नियंत्रण कक्ष', 'Authorized trustee control station', TRUE, 13, FALSE)
ON CONFLICT (id) DO UPDATE SET
    label_mr = EXCLUDED.label_mr,
    label_en = EXCLUDED.label_en,
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order,
    updated_at = CURRENT_TIMESTAMP;

-- --------------------------------------------------------------------
-- 15. Table: historical_milestones
-- ऐतिहासिक प्रवास आलेख (Interactive Chronicle Timeline) (CRUD)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historical_milestones (
    id VARCHAR(64) PRIMARY KEY,
    year VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_marathi VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    description_marathi TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 1,
    badge_mr VARCHAR(100) DEFAULT 'महत्त्वाचा टप्पा',
    badge_en VARCHAR(100) DEFAULT 'Verified Milestone',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_historical_milestones_order ON historical_milestones (display_order ASC);

INSERT INTO historical_milestones (id, year, title, title_marathi, description, description_marathi, display_order)
VALUES
    ('milestone-1', '१९७४', 'Shree Ishwatichi Mandal Foundation', 'श्री यंग इश्वटी नवरात्रौत्सव मंडळाची स्थापना', 'Simple wooden altar introduced by local energetic youth which marked the beginning of community devotion.', 'स्थानिक तरुणांद्वारे छोट्या लाकडी देव्हाऱ्यात अत्यंत साधेपणाने श्री इश्वटीची मातेची स्थापना व उत्सवाला सुरुवात.', 1),
    ('milestone-2', '१९८७', 'First Altar Brick Temple of Shree Ishwatichi', 'श्री इश्वटीची पहिले भव्य मंदिर उभारणी', 'Establishment of the brick hall, shifting from clay to beautiful stone-carved patterns with local support.', 'श्री इश्वटीची मातीच्या मूर्तीची प्राणप्रतिष्ठा आणि भाविकांच्या लोकवर्गणीतून विटांचे उत्कृष्ट सभागृह मंदिर उभारले गेले.', 2),
    ('milestone-3', '१९९९', 'Social Service Commenced', 'श्री इश्वटीची सामाजिक सेवा कक्षाची सुरुवात', 'Beginning of food security drives, organizing daily free meals kitchen and student support cells.', 'श्री इश्वटीची नियमित सामाजिक कार्याला सुरुवात: गरजूंना मदत आणि दररोज विनामूल्य अन्नछत्र सेवा सुरू.', 3),
    ('milestone-4', '२०१२', 'Grand Stone Temple Built', 'श्री इश्वटीची नूतन दगडी हेमांडपंती मंदिर उभारणी', 'Constructed an architectural masterpiece in Hemadpanti style using pure rocks, adding gold towers.', 'श्री इश्वटीची हेमांडपंती शैलीतील कोरीव भव्य दगडी मंदिर उभारणी, आकर्षक सोन्याचा कळस आणि अद्ययावत दर्शन रांगांचे नियोजन.', 4),
    ('milestone-5', '२०२६', 'Digital Seva Live Portals', 'श्री इश्वटीची अद्ययावत डिजिटल सोयी-सुविधा', 'Global release of online bookings, digital streams, interactive devotee feedback, and secure ledgers.', 'श्री इश्वटीची भक्तांच्या सुविधेसाठी जागतिक स्तरावर डिजिटल सेवा आणि थेट प्रक्षेपण सुविधांचे अनावरण.', 5)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    title_marathi = EXCLUDED.title_marathi,
    description = EXCLUDED.description,
    description_marathi = EXCLUDED.description_marathi,
    display_order = EXCLUDED.display_order,
    updated_at = CURRENT_TIMESTAMP;

-- Safe incremental alter commands for existing production databases:
ALTER TABLE temple_events ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE site_content ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE navratri_patrika_schedule ADD COLUMN IF NOT EXISTS color_name_mr VARCHAR(100);
ALTER TABLE navratri_patrika_schedule ADD COLUMN IF NOT EXISTS color_name_en VARCHAR(100);
ALTER TABLE navratri_patrika_schedule ADD COLUMN IF NOT EXISTS devis_roop_mr VARCHAR(100);
ALTER TABLE navratri_patrika_schedule ADD COLUMN IF NOT EXISTS devis_roop_en VARCHAR(100);
ALTER TABLE navratri_patrika_schedule ADD COLUMN IF NOT EXISTS events_json JSONB;

-- --------------------------------------------------------------------
-- Task 3: Application Module Visibility Control Matrix
-- Allows authorized temple administrators to show/hide any component or
-- module across the website dynamically in real-time.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_modules_visibility (
    id VARCHAR(50) PRIMARY KEY,
    module_key VARCHAR(50) NOT NULL UNIQUE,
    name_mr VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    category_label_mr VARCHAR(100) NOT NULL,
    category_label_en VARCHAR(100) NOT NULL,
    description_mr TEXT,
    description_en TEXT,
    icon VARCHAR(10),
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_modules_category ON app_modules_visibility(category);
CREATE INDEX IF NOT EXISTS idx_modules_visible ON app_modules_visibility(is_visible);

INSERT INTO app_modules_visibility (id, module_key, name_mr, name_en, category, category_label_mr, category_label_en, description_mr, description_en, icon, is_visible)
VALUES
    ('mod-1', 'hero_banner', 'मुख्य हिरो बॅनर व स्वयंभू दर्शन', 'Hero Banner & Divine Idol Showcase', 'home', 'मुख्य पृष्ठ घटक', 'Home Page Components', 'मुख्य पृष्ठावरील श्री इश्वटीची मातेचे स्वयंभू दर्शन, बॅनर व जलद कृती बटणे.', 'Main hero banner with full sanctum idol showcase.', '🕉️', TRUE),
    ('mod-2', 'hero_diya', 'दीप प्रज्वलन सुविधा (Interactive Diya)', 'Interactive Diya Lighting', 'home', 'मुख्य पृष्ठ घटक', 'Home Page Components', 'भक्तांना डिजिटल समई / दिवा तेवत ठेवण्याची सुविधा.', 'Allows devotees to offer a digital flame/diya.', '🪔', TRUE),
    ('mod-3', 'hero_aarti_player', 'मुख्य पृष्ठावरील आरती ऑडिओ प्लेयर', 'Home Aarti Audio Player', 'home', 'मुख्य पृष्ठ घटक', 'Home Page Components', 'होमपेजवर वाजणारा पवित्र आरतीचा वेब ऑडिओ प्लेयर.', 'Quick holy aarti web audio player embedded on homepage.', '🎵', TRUE),
    ('mod-4', 'helpline_banner', '२४/७ डिजिटल साहाय्यता कक्ष', '24/7 Digital Helpline Banner', 'home', 'मुख्य पृष्ठ घटक', 'Home Page Components', 'अभिषेक, पूजा व संपर्क साहाय्यता हेल्पलाइन बॅनर.', 'Helpline banner with direct calling and query assistance.', '📞', TRUE),
    ('mod-5', 'live_darshan', 'थेट दर्शन व आरती दालन', 'Live Darshan & Sanctum Stream', 'sanctum', 'दर्शन व पवित्र माध्यमे', 'Sanctum & Media Portals', '२४/७ थेट गाभारा दर्शन, कॅमेरा प्रक्षेपण व आरती वेळापत्रक.', '24/7 live camera feeds from inner sanctum.', '🎥', TRUE),
    ('mod-6', 'ashtami_featured_video', 'अष्टमी महाआरती विशेष व्हिडिओ', 'Ashtami Maha Aarti Featured Video', 'sanctum', 'दर्शन व पवित्र माध्यमे', 'Sanctum & Media Portals', 'अष्टमी विशेष महाआरतीचा व्हिडिओ, बोल व आदर्श शिंदे गायन.', 'Featured Ashtami Maha Aarti video with ambient backdrop.', '🎬', TRUE),
    ('mod-7', 'sacred_soundboard', 'पवित्र ध्वनी व वैदिक मंत्र (Soundboard)', 'Sacred Soundboard & Chants', 'sanctum', 'दर्शन व पवित्र माध्यमे', 'Sanctum & Media Portals', 'शंखनाद, वैदिक मंत्र, स्तोत्रे व तानपुरा ध्वनी.', 'Interactive soundboard with conch shells and mantras.', '🔔', TRUE),
    ('mod-8', 'media_gallery', 'छायाचित्रे, व्हिडिओ व इन्स्टाग्राम रील दालन', 'Photo, Video & Reel Media Gallery', 'sanctum', 'दर्शन व पवित्र माध्यमे', 'Sanctum & Media Portals', 'मंडळाचे एचडी फोटो, व्हिडिओ व इन्स्टाग्राम रील गॅलरी.', 'HD photos, festival celebration videos, and reels.', '🖼️', TRUE),
    ('mod-9', 'patrika_section', 'शारदीय नवरात्रौत्सव कार्यक्रम पत्रिका', 'Navratri Festival Karyakram Patrika', 'devotion', 'भक्ती व उत्सव दालने', 'Devotional Portals', 'अधिकृत ९-दिवसीय कार्यक्रम पत्रिका, दैनिक रंग व वेळ.', 'Official day-by-day festival program schedule.', '📜', TRUE),
    ('mod-10', 'digital_seva', 'डिजिटल सेवा, पूजा व प्रसाद नोंदणी', 'Digital Seva & Pooja Booking', 'devotion', 'भक्ती व उत्सव दालने', 'Devotional Portals', 'अभिषेक, महाआरती, प्रसाद घरपोच व स्वयंसेवक नोंदणी.', 'Online reservations for pooja and prasad.', '🕯️', TRUE),
    ('mod-11', 'temple_events', 'उत्सव वेळापत्रक व उपस्थिती नोंदणी', 'Festival Events & RSVP Presence', 'devotion', 'भक्ती व उत्सव दालने', 'Devotional Portals', 'मंदिर कार्यक्रम दिनदर्शिका आणि भक्तांची उपस्थिती.', 'Temple calendar, upcoming festival events and RSVP.', '🗓️', TRUE),
    ('mod-12', 'devotee_testimonials', 'भक्तांचे दैवी अनुभव व साक्ष (Testimonials)', 'Devotee Experiences & Testimonials', 'devotion', 'भक्ती व उत्सव दालने', 'Devotional Portals', 'भाविकांनी अनुभवलेले दैवी अनुभव, साक्ष व अभिप्राय.', 'Miraculous experiences and feedback shared by devotees.', '💬', TRUE),
    ('mod-13', 'about_heritage', 'मंदिराचा इतिहास व दैवी महात्म्य', 'About Sanctum & Divine Heritage', 'trust', 'इतिहास व सामाजिक कार्य', 'Trust & Heritage Portals', 'श्री इश्वटीची मातेचा उगम, गाभारा माहिती व देवस्थान ध्येय.', 'Origin chronicles of Shree Ishwatichi Mata.', '🏛️', TRUE),
    ('mod-14', 'historical_milestones', 'ऐतिहासिक प्रवास आलेख (Chronicle Timeline)', 'Historical Journey Milestones', 'trust', 'इतिहास व सामाजिक कार्य', 'Trust & Heritage Portals', '१९७४ पासून २०२६ पर्यंतचा मंडळाचा देदीप्यमान ऐतिहासिक आलेख.', 'Interactive timeline marking historic milestones from 1974.', '📜', TRUE),
    ('mod-15', 'donations', 'देणगी निधी व अन्नछत्र सहकार्य', 'Donations & 80G Trust Funds', 'trust', 'इतिहास व सामाजिक कार्य', 'Trust & Heritage Portals', '८०जी करसवलत देणगी, अन्नछत्र व मंदिर नूतनीकरण निधी.', 'Direct donations with 80G tax benefits.', '💝', TRUE),
    ('mod-16', 'social_initiatives', 'समाजकार्य, मोफत दवाखाना व शिक्षण सेवा', 'Social Welfare & Community Initiatives', 'trust', 'इतिहास व सामाजिक कार्य', 'Trust & Heritage Portals', 'अन्नछत्र, गरजू विद्यार्थ्यांना मदत, आरोग्य शिबिरे.', 'Free meal drives, health clinics, and educational aid.', '🤝', TRUE),
    ('mod-17', 'news_announcements', 'मंडळाची अधिकृत परिपत्रके व सूचना', 'Board Notices & Circulars', 'trust', 'इतिहास व सामाजिक कार्य', 'Trust & Heritage Portals', 'अधिकृत परिपत्रके, प्रसिद्धीपत्रके व महत्त्वाच्या घोषणा.', 'Official circulars, media releases, and alerts.', '📢', TRUE),
    ('mod-18', 'my_profile', 'वैयक्तिक भक्ती प्रोफाईल व सातत्य गुण', 'Devotee Profile & Spiritual Milestones', 'system', 'प्रणाली व रचना', 'System & Layout Modules', 'दैनंदिन नामस्मरण, आरती सातत्य गुण, सुवर्ण पदके.', 'Daily check-in, devotion streak, badges.', '🕉️', TRUE),
    ('mod-19', 'contact_details', 'देवस्थान कार्यालय संपर्क व नकाशा', 'Office Contact & Directions', 'system', 'प्रणाली व रचना', 'System & Layout Modules', 'कार्यालय पत्ता, दूरध्वनी, ईमेल व थेट गुगल मॅप मार्ग.', 'Devasthan office address, phone, email and location map.', '📍', TRUE),
    ('mod-20', 'footer_section', 'मुख्य तळटीप (Application Footer)', 'Application Main Footer', 'system', 'प्रणाली व रचना', 'System & Layout Modules', 'वेबसाईटच्या सर्वात खाली असणारी मुख्य तळटीप व लिंक्स.', 'Bottom footer with quick links and copyright.', '🔻', TRUE)
ON CONFLICT (module_key) DO UPDATE SET
    name_mr = EXCLUDED.name_mr,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    category_label_mr = EXCLUDED.category_label_mr,
    category_label_en = EXCLUDED.category_label_en,
    description_mr = EXCLUDED.description_mr,
    description_en = EXCLUDED.description_en,
    icon = EXCLUDED.icon,
    updated_at = CURRENT_TIMESTAMP;

-- --------------------------------------------------------------------
-- Note on Dynamic Vercel Deployments & Google Indexing:
-- When deploying to Vercel (e.g. *.vercel.app), canonical URLs resolve
-- dynamically to window.location.origin to prevent cross-domain canonical drop.
-- In devotee profile records, navratri_theme_day defaults to 'auto' which
-- cleanly falls back to the initial default maroon (#4A0404) theme once the
-- 9 sacred days of Navratri conclude.
-- --------------------------------------------------------------------

-- --------------------------------------------------------------------
-- 15. Table: visarjan_miravnuk_banner_config
-- 53rd Year Grand Visarjan Miravnuk 3D Flash Banner Configuration
-- Full CRUD and Dynamic Show/Hide management by authorized administrators
-- Authorized Admins: dangebow@gmail.com, ishwatichimata10@gmail.com
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visarjan_miravnuk_banner_config (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'primary_visarjan_banner',
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    banner_image_url TEXT NOT NULL,
    title_mr VARCHAR(500) NOT NULL,
    title_en VARCHAR(500) NOT NULL,
    subtitle_mr VARCHAR(500) NOT NULL,
    subtitle_en VARCHAR(500) NOT NULL,
    date_mr VARCHAR(100) NOT NULL,
    date_en VARCHAR(100) NOT NULL,
    time_mr VARCHAR(100) NOT NULL,
    time_en VARCHAR(100) NOT NULL,
    route_mr VARCHAR(500) NOT NULL,
    route_en VARCHAR(500) NOT NULL,
    special_attraction_mr VARCHAR(500) NOT NULL,
    special_attraction_en VARCHAR(500) NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 60 CHECK (duration_seconds BETWEEN 10 AND 600),
    sound_enabled_by_default BOOLEAN NOT NULL DEFAULT TRUE,
    show_decorations BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255) DEFAULT 'admin'
);

-- Seed default authentic 53rd Year Visarjan Sohala 2026 record
INSERT INTO visarjan_miravnuk_banner_config (
    id, is_visible, banner_image_url,
    title_mr, title_en, subtitle_mr, subtitle_en,
    date_mr, date_en, time_mr, time_en,
    route_mr, route_en, special_attraction_mr, special_attraction_en,
    duration_seconds, sound_enabled_by_default, show_decorations, updated_by
)
VALUES (
    'primary_visarjan_banner',
    TRUE,
    '/assets/aistudio/visarjan_banner_clean.png',
    '५३ वे वर्ष : श्री इश्वटीची माता भव्य विसर्जन सोहळा',
    '53rd Year Grand Visarjan Miravnuk 2026',
    '५३ वे वर्ष विसर्जन सोहळा',
    '53rd Year Visarjan Sohala',
    'बुधवार, २१ ऑक्टोबर २०२६',
    'Wed, 21 Oct 2026',
    'सायंकाळी ६:०० वाजता',
    '6:00 PM Onwards',
    'इश्वटी प्रसाद पटांगण ते काळाचौकी नाका',
    'Ishwati Prasad Ground to Kalachowki Naka',
    'साई म्युझिकल ग्रुप - गोवंडी',
    'Sai Musical Group - Govandi',
    60,
    TRUE,
    TRUE,
    'ishwatichimata10@gmail.com'
)
ON CONFLICT (id) DO UPDATE SET
    banner_image_url = EXCLUDED.banner_image_url,
    title_mr = EXCLUDED.title_mr,
    title_en = EXCLUDED.title_en,
    subtitle_mr = EXCLUDED.subtitle_mr,
    subtitle_en = EXCLUDED.subtitle_en,
    date_mr = EXCLUDED.date_mr,
    date_en = EXCLUDED.date_en,
    time_mr = EXCLUDED.time_mr,
    time_en = EXCLUDED.time_en,
    route_mr = EXCLUDED.route_mr,
    route_en = EXCLUDED.route_en,
    special_attraction_mr = EXCLUDED.special_attraction_mr,
    special_attraction_en = EXCLUDED.special_attraction_en,
    duration_seconds = EXCLUDED.duration_seconds,
    sound_enabled_by_default = EXCLUDED.sound_enabled_by_default,
    show_decorations = EXCLUDED.show_decorations,
    updated_at = CURRENT_TIMESTAMP;




-- ============================================================================
-- 15. HOME LIVE VIDEOS (GOOGLE-STYLE SCROLLABLE LIVE VIDEO GALLERY)
-- ============================================================================
CREATE TABLE IF NOT EXISTS home_live_videos (
    id VARCHAR(128) PRIMARY KEY,
    title_mr VARCHAR(500) NOT NULL,
    title_en VARCHAR(500) NOT NULL,
    description_mr TEXT,
    description_en TEXT,
    source_type VARCHAR(50) NOT NULL DEFAULT 'cloud',
    url TEXT NOT NULL,
    embed_url TEXT,
    storage_path TEXT,
    thumbnail_url TEXT,
    duration VARCHAR(50) DEFAULT '0:30',
    is_live BOOLEAN DEFAULT FALSE,
    aspect_ratio VARCHAR(20) DEFAULT 'portrait',
    category VARCHAR(50) DEFAULT 'aarti',
    views_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO home_live_videos (
    id, title_mr, title_en, description_mr, description_en, source_type,
    url, embed_url, thumbnail_url, duration, is_live, aspect_ratio, category,
    views_count, likes_count, order_index
) VALUES
(
    'hlv-1-adarsh-shinde-aarti',
    'अष्टमी - धर्मवीर दुर्गा महाआरती | गायक: आदर्श शिंदे',
    'Ashtami - Dharmaveer Durga Maha Aarti | Adarsh Shinde',
    'श्री यंग ईश्वटी नवरात्रौत्सव मंडळ - अधिकृत पावन महाआरती व दुर्गा स्तुती.',
    'Official Ashtami Maha Aarti and Durga Stuti streaming live.',
    'youtube',
    'https://youtu.be/28TJIom9GFw?si=rTrYi7hPJleZzsEG',
    'https://www.youtube-nocookie.com/embed/28TJIom9GFw?enablejsapi=1&rel=0&modestbranding=1',
    'https://img.youtube.com/vi/28TJIom9GFw/maxresdefault.jpg',
    '04:32',
    FALSE,
    'landscape',
    'aarti',
    15420,
    1890,
    0
),
(
    'hlv-2-visarjan-sohala-reel',
    'श्री विसर्जन सोहळा २०२४ - ५३ वे वर्ष भव्य मिरवणूक',
    'Shree Visarjan Sohala 2024 - 53rd Year Grand Procession Reel',
    'मंडळाचे ५३ वे वर्ष - पारंपरिक वाद्ये, ढोल ताशा व विसर्जन घाट मिरवणूक क्षणचित्रे.',
    '53rd year festival grand visarjan procession highlights and dhol tasha.',
    'cloud',
    '/assets/aistudio/image_c72c833a.png',
    NULL,
    '/assets/aistudio/image_c72c833a.png',
    '00:29',
    TRUE,
    'portrait',
    'visarjan',
    8940,
    1240,
    1
),
(
    'hlv-3-dhol-tasha-pathak',
    'पारंपरिक ढोल-ताशा पथक व भव्य आतषबाजी',
    'Traditional Dhol Tasha Pathak & Firework Spectacle',
    'ईश्वटी चौक व मुख्य बाजारपेठ मार्गावर नेत्रदीपक आतषबाजी व नादब्रह्म वादन.',
    'Spectacular fireworks and resonant dhol tasha beats through Ishwati Chowk.',
    'youtube',
    'https://youtu.be/28TJIom9GFw?si=rTrYi7hPJleZzsEG',
    'https://www.youtube-nocookie.com/embed/28TJIom9GFw?enablejsapi=1&rel=0&modestbranding=1',
    NULL,
    '03:15',
    FALSE,
    'landscape',
    'miravnuk',
    11250,
    1480,
    2
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 16. NAVRATRI DAILY COLOR THEMES CONFIGURATION MAP (DAYS 1 TO 9 + 10)
-- ============================================================================
CREATE TABLE IF NOT EXISTS navratri_daily_themes (
    day_number INT PRIMARY KEY CHECK (day_number BETWEEN 1 AND 10),
    tithi_mr VARCHAR(100) NOT NULL,
    tithi_en VARCHAR(100) NOT NULL,
    goddess_mr VARCHAR(100) NOT NULL,
    goddess_en VARCHAR(100) NOT NULL,
    color_name_mr VARCHAR(100) NOT NULL,
    color_name_en VARCHAR(100) NOT NULL,
    color_hex VARCHAR(20) NOT NULL,
    primary_color VARCHAR(20) NOT NULL,
    secondary_color VARCHAR(20) NOT NULL,
    maroon_tone VARCHAR(20) NOT NULL,
    red_tone VARCHAR(20) NOT NULL,
    glow_color VARCHAR(50) NOT NULL,
    significance_mr TEXT NOT NULL,
    significance_en TEXT NOT NULL
);

INSERT INTO navratri_daily_themes (
    day_number, tithi_mr, tithi_en, goddess_mr, goddess_en, color_name_mr, color_name_en,
    color_hex, primary_color, secondary_color, maroon_tone, red_tone, glow_color,
    significance_mr, significance_en
) VALUES
(1, 'पहिली माळ - प्रतिपदा', 'Day 1 - Pratipada', 'मां शैलपुत्री', 'Maa Shailaputri', 'पिवळा (Royal Yellow)', 'Royal Yellow', '#EAB308', '#F59E0B', '#FBBF24', '#361802', '#B45309', 'rgba(234, 179, 8, 0.35)', 'आनंद, उत्साह व सकारात्मक ऊर्जेचे प्रतीक. घटस्थापना दिवस.', 'Symbol of joy, enthusiasm, and divine beginnings on Ghatasthapana.'),
(2, 'दुसरी माळ - द्वितीया', 'Day 2 - Dwitiya', 'मां ब्रह्मचारिणी', 'Maa Brahmacharini', 'हिरवा (Emerald Green)', 'Emerald Green', '#10B981', '#059669', '#34D399', '#052919', '#047857', 'rgba(16, 185, 129, 0.35)', 'प्रकृती, समृद्धी, शांतता व नव्या संकल्पांचे प्रतीक.', 'Represents nature, prosperity, inner peace, and penance.'),
(3, 'तिसरी माळ - तृतीया', 'Day 3 - Tritiya', 'मां चंद्रघंटा', 'Maa Chandraghanta', 'राखाडी (Pearl Slate)', 'Pearl Slate', '#94A3B8', '#64748B', '#CBD5E1', '#1A222F', '#475569', 'rgba(148, 163, 184, 0.35)', 'धैर्य, शौर्य व नकारात्मकतेवर विजयाचे प्रतीक.', 'Symbolizes courage, valor, and calm determination.'),
(4, 'चौथी माळ - चतुर्थी', 'Day 4 - Chaturthi', 'मां कुष्मांडा', 'Maa Kushmanda', 'नारंगी (Sacred Orange)', 'Sacred Orange', '#F97316', '#EA580C', '#FB923C', '#421406', '#C2410C', 'rgba(249, 115, 22, 0.35)', 'दिव्य प्रकाश, ऊर्जा, आरोग्य व विश्वाची निर्मिती.', 'Radiance, cosmic energy, and luminous warmth.'),
(5, 'पाचवी माळ - पंचमी', 'Day 5 - Panchami', 'मां स्कंदमाता', 'Maa Skandamata', 'पांढरा (Divine White)', 'Divine White', '#F8FAFC', '#E2E8F0', '#D4AF37', '#2A101C', '#FDA4AF', 'rgba(248, 250, 252, 0.35)', 'शुद्धता, वात्सल्य, ज्ञान व निष्कलंक भक्ती.', 'Purity, motherly love, wisdom, and profound devotion.'),
(6, 'सहावी माळ - षष्ठी', 'Day 6 - Shashthi', 'मां कात्यायनी', 'Maa Katyayani', 'लाल (Kumkum Red)', 'Kumkum Red', '#EF4444', '#DC2626', '#F87171', '#450707', '#991B1B', 'rgba(239, 68, 68, 0.35)', 'पराक्रम, असीम शक्ती, महिषासुरमर्दिनी स्वरूप.', 'Fierce courage, supreme power, and victory over evil.'),
(7, 'सातवी माळ - सप्तमी', 'Day 7 - Saptami', 'मां कालरात्री', 'Maa Kalaratri', 'शाही निळा (Royal Blue)', 'Royal Blue', '#3B82F6', '#2563EB', '#60A5FA', '#0E172C', '#1D4ED8', 'rgba(59, 130, 246, 0.35)', 'अंधकाराचा नाश करणारी, निर्भयता व संकटनाशक शक्ती.', 'Destruction of darkness, fearlessness, and absolute protection.'),
(8, 'आठवी माळ - अष्टमी', 'Day 8 - Ashtami', 'मां महागौरी', 'Maa Mahagauri', 'गुलाबी (Lotus Pink)', 'Lotus Pink', '#EC4899', '#DB2777', '#F472B6', '#430623', '#BE185D', 'rgba(236, 72, 153, 0.35)', 'करुणा, सौंदर्य, मोक्ष, धर्मवीर महाआरती व पावन हवन.', 'Compassion, grace, auspiciousness, and the sacred Ashtami Maha Aarti.'),
(9, 'नववी माळ - नवमी', 'Day 9 - Navami', 'मां सिद्धिदात्री', 'Maa Siddhidatri', 'जांभळा (Imperial Purple)', 'Imperial Purple', '#A855F7', '#9333EA', '#C084FC', '#34055B', '#7E22CE', 'rgba(168, 85, 247, 0.35)', 'सर्व सिद्धी, कार्यपूर्ती, ज्ञान व आशिर्वादांचे सर्वोच्च रूप.', 'Bestower of all spiritual achievements and divine blessings.'),
(10, 'दसरा - विजयादशमी / विसर्जन', 'Day 10 - Vijayadashami / Visarjan', 'श्री ईश्वटीची माता', 'Shree Ishwati Mata', 'भगवा व सुवर्ण (Saffron Gold)', 'Saffron Gold', '#FF9933', '#FF9933', '#D4AF37', '#4A0404', '#8B0000', 'rgba(255, 153, 51, 0.35)', 'विजयाचा सोहळा, सीमोल्लंघन, आपट्याची पाने व भव्य विसर्जन मिरवणूक.', 'Grand Victory celebration, Vijayadashami, and auspicious Visarjan Miravnuk.')
ON CONFLICT (day_number) DO UPDATE SET
    tithi_mr = EXCLUDED.tithi_mr,
    color_name_mr = EXCLUDED.color_name_mr,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color,
    maroon_tone = EXCLUDED.maroon_tone;
