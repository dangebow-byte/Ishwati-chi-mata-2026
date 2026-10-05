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
    'श्री इश्वटीची शारदीय नवरात्र महोत्सव सोहळा',
    'श्री इश्वटीची शारदीय नवरात्र महोत्सव सोहळा',
    'श्री इश्वटीची मातेची ९ दिवसांची दैवी ऊर्जा. १,००८ तेलाच्या दिव्यांचा दीपोत्सव, गरबा नृत्य, अखंड जप, आणि महाप्रसाद वाटप.',
    'श्री इश्वटीची मातेची ९ दिवसांची दैवी ऊर्जा. १,००८ तेलाच्या दिव्यांचा दीपोत्सव, गरबा नृत्य, अखंड जप, आणि महाप्रसाद वाटप.',
    '2026-10-11',
    'दररोज पहाटे ०४:०० ते रात्री ११:३०',
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
    category VARCHAR(64) NOT NULL,
    event_details_mr TEXT NOT NULL,
    event_details_en TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patrika_schedule_date 
    ON navratri_patrika_schedule (date_iso ASC);

-- Seed Data: Official Shardiya Navratri 2026 Patrika (श्री यंग इश्वटी नवरात्रौत्सव मंडळ रजि.)
INSERT INTO navratri_patrika_schedule (id, day_number, day_name_mr, day_name_en, date_str_mr, date_str_en, date_iso, time_schedule, category, event_details_mr, event_details_en)
VALUES
('patrika-day-1', 1, 'रविवार', 'Sunday', '११ ऑक्टोबर २०२६', '11 Oct 2026', '2026-10-11', 'सकाळी ११.०० वा.', 'pooja', 'श्री देवीची प्रतिष्ठापना (घटस्थापना सोहळा)', 'Shree Devi Idol Consecration & Ghatasthapana Ceremony'),
('patrika-day-2', 2, 'सोमवार', 'Monday', '१२ ऑक्टोबर २०२६', '12 Oct 2026', '2026-10-12', 'सायं. ०५.०० वा.', 'devotional', 'महिला भजन - स्वामी समर्थ महिला भजन मंडळ, अभ्युदयनगर, काळाचौकी, मुंबई - ४०० ०३३', 'Mahila Bhajan - Swami Samarth Mahila Bhajan Mandal, Abhyudayanagar, Kalachowki, Mumbai - 400 033'),
('patrika-day-3', 3, 'मंगळवार', 'Tuesday', '१३ ऑक्टोबर २०२६', '13 Oct 2026', '2026-10-13', 'सायं. ६ ते रात्रौ. १० वा.', 'cultural', 'मैदानी स्पर्धा व सांस्कृतिक कार्यक्रम', 'Outdoor Sports Competitions & Cultural Programs'),
('patrika-day-4', 4, 'बुधवार', 'Wednesday', '१४ ऑक्टोबर २०२६', '14 Oct 2026', '2026-10-14', 'सायं. ६ ते रात्रौ. १० वा.', 'cultural', 'सांस्कृतिक कार्यक्रम व बालकलाकार सादरीकरण', 'Grand Cultural Evening & Youth Talent Performances'),
('patrika-day-5', 5, 'गुरुवार', 'Thursday', '१५ ऑक्टोबर २०२६', '15 Oct 2026', '2026-10-15', 'सायं. ६ ते रात्रौ. १० वा.', 'cultural', 'सांस्कृतिक कार्यक्रम व पारंपारिक लोकनृत्य', 'Traditional Folk Dance & Cultural Programs'),
('patrika-day-6', 6, 'शुक्रवार', 'Friday', '१६ ऑक्टोबर २०२६', '16 Oct 2026', '2026-10-16', 'रात्रौ ९.०० वा.', 'devotional', 'देवीचा पावन गोंधळ व जागर सोहळा', 'Sacred Devi Gondhal & Divine Awakening Chants'),
('patrika-day-7', 7, 'शनिवार', 'Saturday', '१७ ऑक्टोबर २०२६', '17 Oct 2026', '2026-10-17', 'रात्रौ ८.०० वा.', 'cultural', 'चला खेळ खेळूया अंताक्षरी (भव्य कौटुंबिक संगीत स्पर्धा)', 'Chala Khel Kheluya Antakshari (Grand Devotional Musical Game)'),
('patrika-day-8', 8, 'रविवार', 'Sunday', '१८ ऑक्टोबर २०२६', '18 Oct 2026', '2026-10-18', 'रात्रौ ८.०० वा.', 'cultural', 'मैदानी स्पर्धा व सांस्कृतिक कार्यक्रम', 'Outdoor Sports Championship & Cultural Program'),
('patrika-day-9', 9, 'सोमवार', 'Monday', '१९ ऑक्टोबर २०२६', '19 Oct 2026', '2026-10-19', 'दुपारी २.०० वा. व सायं. ७.०० वा.', 'havan', 'दुपारी २.०० वा. होम हवन | सायं. ७.०० वा. महाप्रसाद (भंडारा)', '02:00 PM Sacred Homa Havanam | 07:00 PM Community Mahaprasad Bhandara Feast'),
('patrika-day-10', 10, 'मंगळवार', 'Tuesday', '२० ऑक्टोबर २०२६', '20 Oct 2026', '2026-10-20', 'सायं. ६ ते रात्रौ. १० वा.', 'cultural', 'मैदानी स्पर्धा (अंतिम फेरी व पारितोषिक सोहळा)', 'Sports Championships (Final Rounds & Awards)'),
('patrika-day-11', 11, 'बुधवार', 'Wednesday', '२१ ऑक्टोबर २०२६', '21 Oct 2026', '2026-10-21', 'सायं ६.०० वा. व रात्रौ ९.०० वा.', 'cultural', 'सायं ६.०० वा. हळदी कुंकू समारंभ | रात्रौ ९.०० वा. दसरा संमेलन (सोने लुटणे) | रात्रौ ९.०० वा. दांडीया रास', '06:00 PM Haldi Kunku | 09:00 PM Dussehra Sammelan | 09:00 PM Dandiya Raas'),
('patrika-day-12', 12, 'गुरुवार', 'Thursday', '२२ ऑक्टोबर २०२६', '22 Oct 2026', '2026-10-22', 'सकाळी ११.०० वा. व सायं. ६.०० वा.', 'visarjan', 'सकाळी ११.०० वा. देवीच्या साड्यांचा भव्य जाहीर लिलाव | सायं. ६.०० वा. श्री इश्वटी मातेची भव्य दिव्य विसर्जन मिरवणूक', '11:00 AM Devi Saree Auction | 06:00 PM Shree Ishwati Mata Grand Visarjan Procession'),
('patrika-day-13', 13, 'रविवार', 'Sunday', '२५ ऑक्टोबर २०२६', '25 Oct 2026', '2026-10-25', 'सकाळी ११.०० वा.', 'auction', 'देवीच्या साड्यांचा भव्य जाहीर लिलाव (अंतिम सत्र)', 'Grand Public Auction of Consecrated Devi Sarees (Final Session)')
ON CONFLICT (id) DO NOTHING;
