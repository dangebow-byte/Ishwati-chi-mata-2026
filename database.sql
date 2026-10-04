-- ====================================================================
-- Shree Ishwatichi Mata Devasthan Mandal (श्री ईश्वटीची माता देवस्थान)
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
    'श्री ईश्वटीची आषाढी एकादशी महापूजा आणि भजन संध्या',
    'श्री ईश्वटीची आषाढी एकादशी महापूजा आणि भजन संध्या',
    'श्री ईश्वटीची माता महापूजा, त्यानंतर प्रख्यात स्थानिक कलाकारांद्वारे अखंड भजन संध्या.',
    'श्री ईश्वटीची माता महापूजा, त्यानंतर प्रख्यात स्थानिक कलाकारांद्वारे अखंड भजन संध्या.',
    '2026-07-05',
    'सकाळी ०५:०० ते रात्री १०:००',
    'उत्सव',
    245,
    'https://images.unsplash.com/photo-1609137144814-726d36e8b792?auto=format&fit=crop&q=80&w=800'
),
(
    'ev-2',
    'श्री ईश्वटीची शारदीय नवरात्र महोत्सव सोहळा',
    'श्री ईश्वटीची शारदीय नवरात्र महोत्सव सोहळा',
    'श्री ईश्वटीची मातेची ९ दिवसांची दैवी ऊर्जा. १,००८ तेलाच्या दिव्यांचा दीपोत्सव, गरबा नृत्य, अखंड जप, आणि महाप्रसाद वाटप.',
    'श्री ईश्वटीची मातेची ९ दिवसांची दैवी ऊर्जा. १,००८ तेलाच्या दिव्यांचा दीपोत्सव, गरबा नृत्य, अखंड जप, आणि महाप्रसाद वाटप.',
    '2026-10-11',
    'दररोज पहाटे ०४:०० ते रात्री ११:३०',
    'उत्सव',
    1890,
    'https://images.unsplash.com/photo-1561361513-2d000a50f0db?auto=format&fit=crop&q=80&w=800'
),
(
    'ev-3',
    'श्री ईश्वटीची मंडळ: मोफत बहुविशेषज्ञता भव्य आरोग्य व दंत तपासणी शिबीर',
    'श्री ईश्वटीची मंडळ: मोफत बहुविशेषज्ञता भव्य आरोग्य व दंत तपासणी शिबीर',
    'श्री ईश्वटीची मंडळ समाजोपयोगी उपक्रमांतर्गत मोफत आरोग्य तपासणी, दंत आणि डोळे तपासणी व मोफत औषध वाटप.',
    'श्री ईश्वटीची मंडळ समाजोपयोगी उपक्रमांतर्गत मोफत आरोग्य तपासणी, दंत आणि डोळे तपासणी व मोफत औषध वाटप.',
    '2026-08-15',
    'सकाळी ०९:०० ते दुपारी ०४:००',
    'सामाजिक सेवा',
    512,
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800'
),
(
    'ev-4',
    'श्री ईश्वटीची चैत्र शुद्ध प्रतिपदा (गुढीपाडवा) शोभायात्रा उत्सव',
    'श्री ईश्वटीची चैत्र शुद्ध प्रतिपदा (गुढीपाडवा) शोभायात्रा उत्सव',
    'श्री ईश्वटीची मातेच्या आशीर्वादाने हिंदू नववर्षाच्या स्वागतासाठी भव्य पारंपरिक शोभायात्रा, पावन गुढी उभारणी, कडू लिंब-गुळ प्रसाद वाटप.',
    'श्री ईश्वटीची मातेच्या आशीर्वादाने हिंदू नववर्षाच्या स्वागतासाठी भव्य पारंपरिक शोभायात्रा, पावन गुढी उभारणी, कडू लिंब-गुळ प्रसाद वाटप.',
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
    'गेल्या नवरात्रात मी आई ईश्वटीचीच्या दरबारात संकल्प केला होता. मातेच्या आशीर्वादाने माझ्या मुलाला उच्च शिक्षणासाठी शिष्यवृत्ती मिळाली आणि आमचे कौटुंबिक संकट दूर झाले. अखंड ज्योतीचे दर्शन मनाला असीम शांतता देते.',
    TRUE,
    5,
    '2026-05-14'
),
(
    'exp-2',
    'रमेश पाटील (Ramesh Patil)',
    'ठाणे (Thane)',
    'दर मंगळवारी मी मंडळाच्या मोफत महाप्रसाद सेवेत अन्नदान करतो. या पवित्र देवस्थानात आल्यावर मिळणारा मानसिक आनंद शब्दातीत आहे. ईश्वटीची मातेची कृपा सदैव भक्तांवर राहू दे!',
    TRUE,
    5,
    '2026-06-02'
)
ON CONFLICT (id) DO NOTHING;
