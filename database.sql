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
    title_mr VARCHAR(500) NOT NULL,
    title_en VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    year VARCHAR(10) NOT NULL DEFAULT '2026',
    description_mr TEXT,
    description_en TEXT,
    author_handle VARCHAR(100) DEFAULT '@ishwatichi_mata',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

