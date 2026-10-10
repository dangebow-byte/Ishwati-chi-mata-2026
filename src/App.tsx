/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { TRANSLATIONS, INITIAL_EVENTS, INITIAL_ANNOUNCEMENTS, INITIAL_TESTIMONIALS, DEFAULT_SITE_CONTENT } from './data';
import { DevoteeExperience, DigitalSevaBooking, DonationRecord, Announcement, UserProfile, TempleEvent } from './types';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

// Importing all modular devotional components
import { Header } from './components/Header';
import { AboutSection } from './components/AboutSection';
import { LiveDarshanSection } from './components/LiveDarshanSection';
import { DigitalSevaSection } from './components/DigitalSevaSection';
import { EventsSection } from './components/EventsSection';
import { MasonryGallery } from './components/MasonryGallery';
import { DevoteeExperiencesSection } from './components/DevoteeExperiencesSection';
import { DonationSection } from './components/DonationSection';
import { SocialWorkSection } from './components/SocialWorkSection';
import { NewsSection } from './components/NewsSection';
import { UserProfileDashboard } from './components/UserProfileDashboard';
import { AdminPanel } from './components/AdminPanel';
import { ContactSection } from './components/ContactSection';

import { Sparkles, Play, Flame, Award, HelpCircle, Maximize2, X } from 'lucide-react';
import { SiteLogo } from './components/SiteLogo';
import { DeviImage } from './components/DeviImage';
import { SacredDarshanZoomViewer } from './components/SacredDarshanZoomViewer';
import { HeroAudioPlayer } from './components/HeroAudioPlayer';
import { UpcomingFestivalCountdown } from './components/UpcomingFestivalCountdown';
import { NavratriPatrikaSection } from './components/NavratriPatrikaSection';
import { AgamanBanner } from './components/AgamanBanner';
import { GlobalAudioController } from './components/GlobalAudioController';
import { aartiAudioEngine } from './utils/aartiAudioEngine';

// Official Shree Ishwatichi Mata Mandal branding and Devi darshan assets
import logoImg from './assets/branding/Mandal logo Maroon Transparent BG.png';
import heroImg from './assets/devotional/devi-mata-main.webp';

import { cleanDevanagariSpelling } from './utils/spellingSanitizer';
export { cleanDevanagariSpelling };

export default function App() {
  const [lang, setLang] = useState<'EN' | 'MR'>('MR');
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  // Unified State from Firestore & Auth - initialized with authentic defaults to survive quota exhaustion
  const [siteContent, setSiteContent] = useState(DEFAULT_SITE_CONTENT);
  const [events, setEvents] = useState<TempleEvent[]>(INITIAL_EVENTS);
  const [experiences, setExperiences] = useState<DevoteeExperience[]>(INITIAL_TESTIMONIALS);
  const [bookings, setBookings] = useState<DigitalSevaBooking[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [quotaWarning, setQuotaWarning] = useState<string | null>(null);
  
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Sanjay Deshpande',
    phone: '+91 94825 00000',
    email: 'dsanjay@spiritual.in',
    gotra: 'Bharadwaj',
    streakCount: 2,
    lastPrayerDate: '2026-06-06',
    milestonesReached: [{ id: 'mil-0', title: 'First Holy Connection', date: '2026-06-05' }],
    totalDonation: 0
  });
  const [claimsHistory, setClaimsHistory] = useState<{ id: string; title: string; date: string }[]>([]);
  const [isFullDarshanOpen, setIsFullDarshanOpen] = useState(false);
  const [flowerShowerCount, setFlowerShowerCount] = useState(0);

  // Function to seed database on first mount if empty - guarded against redundant quota consumption
  const seedDatabaseIfNeeded = async () => {
    try {
      if (localStorage.getItem('mandal_seeded_v1') === 'true') {
        return;
      }
      const siteContentCheck = await getDocs(collection(db, 'site_content'));
      if (siteContentCheck.empty) {
        console.log('Database empty! Seeding default entries to Firestore...');
        
        // Seed site_content documents
        const keys: (keyof typeof DEFAULT_SITE_CONTENT)[] = ['welcome', 'about', 'contact', 'aarti', 'milestones'];
        for (const key of keys) {
          await setDoc(doc(db, 'site_content', key), {
            id: key,
            contentKey: key,
            data: cleanDevanagariSpelling(DEFAULT_SITE_CONTENT[key])
          });
        }

        // Seed announcements
        for (const ann of INITIAL_ANNOUNCEMENTS) {
          await setDoc(doc(db, 'announcements', ann.id), ann);
        }

        // Seed events
        for (const evt of INITIAL_EVENTS) {
          await setDoc(doc(db, 'events', evt.id), evt, { merge: true });
        }

        // Seed testimonials
        for (const test of INITIAL_TESTIMONIALS) {
          await setDoc(doc(db, 'testimonials', test.id), test);
        }

        console.log('Firestore seed complete!');
      }
      localStorage.setItem('mandal_seeded_v1', 'true');
    } catch (e) {
      console.warn('Silent seeding error (mostly rules/sandbox permissions checks):', e);
    }
  };

  // Setup Firestore real-time onSnapshot sync & quota listener
  useEffect(() => {
    const handleQuotaNotification = (e: Event) => {
      const customEvt = e as CustomEvent;
      setQuotaWarning(customEvt.detail?.message || 'Daily free read quota reached');
    };
    window.addEventListener('firestore-quota-exceeded', handleQuotaNotification);

    seedDatabaseIfNeeded();

    const unsubContent = onSnapshot(collection(db, 'site_content'), (snapshot) => {
      const contentMap: any = { ...DEFAULT_SITE_CONTENT };
      snapshot.forEach(docSnap => {
        const val = docSnap.data();
        if (val.contentKey && val.data) {
          contentMap[val.contentKey] = cleanDevanagariSpelling(val.data);
        }
      });
      setSiteContent(cleanDevanagariSpelling(contentMap));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'site_content');
    });

    const unsubAnn = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      const list: Announcement[] = [];
      snapshot.forEach(docSnap => {
        list.push(cleanDevanagariSpelling(docSnap.data() as Announcement));
      });
      list.sort((a, b) => b.date.localeCompare(a.date));
      setAnnouncements(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'announcements');
    });

    const unsubEvt = onSnapshot(collection(db, 'events'), (snapshot) => {
      const list: TempleEvent[] = [];
      snapshot.forEach(docSnap => {
        const evtData = cleanDevanagariSpelling(docSnap.data() as TempleEvent);
        // Sync ev-2 date with official Ghatsthapana date (2026-10-11 12:00 AM IST) & Devi Agaman Sohala (2026-10-10)
        if (evtData.id === 'ev-2' && (evtData.date === '2026-10-12' || evtData.date === '2026-10-10')) {
          evtData.date = '2026-10-11';
          evtData.time = '१० ऑक्टोबर आगमन (सायं ०५:००) | ११ ऑक्टोबर घटस्थापना (१२:०० AM IST) ते २५ ऑक्टोबर २०२६';
          evtData.title = 'श्री इश्वटी मातेचा ५३ वा शारदीय नवरात्र महोत्सव सोहळा २०२६';
          evtData.titleMarathi = 'श्री इश्वटी मातेचा ५३ वा शारदीय नवरात्र महोत्सव सोहळा २०२६';
          setDoc(doc(db, 'events', 'ev-2'), { 
            date: '2026-10-11',
            time: evtData.time,
            title: evtData.title,
            titleMarathi: evtData.titleMarathi
          }, { merge: true }).catch(() => {});
        }
        list.push(evtData);
      });
      list.sort((a, b) => a.date.localeCompare(b.date));
      setEvents(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'events');
    });

    const unsubAuth = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
        setUserProfile(prev => ({
          ...prev,
          name: authUser.displayName || prev.name,
          email: authUser.email || prev.email,
        }));
      } else {
        setUser(null);
      }
    });

    // LocalStorage fallback for profile & checking timeline tracking locally
    try {
      const storedProfile = localStorage.getItem('ishwatichi_profile') || localStorage.getItem('ishawati_profile');
      if (storedProfile) setUserProfile(JSON.parse(storedProfile));

      const storedHistory = localStorage.getItem('ishwatichi_history') || localStorage.getItem('ishawati_history');
      if (storedHistory) setClaimsHistory(JSON.parse(storedHistory));
    } catch (e) {
      console.warn('LocalStorage not readable inside dev sandboxes', e);
    }

    return () => {
      window.removeEventListener('firestore-quota-exceeded', handleQuotaNotification);
      unsubContent();
      unsubAnn();
      unsubEvt();
      unsubAuth();
    };
  }, []);

  // Separate useEffect to handle subscriptions which depend on the user check
  useEffect(() => {
    const isAdminUser = user && user.email === 'dangebow@gmail.com';

    // 4. Testimonials Sub: Admins see everything, Standard/visitor only see approved ones
    const testimonialsRef = collection(db, 'testimonials');
    const testimonialsQuery = isAdminUser 
      ? testimonialsRef 
      : query(testimonialsRef, where('approved', '==', true));

    const unsubTest = onSnapshot(testimonialsQuery, (snapshot) => {
      const list: DevoteeExperience[] = [];
      snapshot.forEach(docSnap => {
        list.push(cleanDevanagariSpelling(docSnap.data() as DevoteeExperience));
      });
      list.sort((a, b) => b.date.localeCompare(a.date));
      setExperiences(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'testimonials');
    });

    // 5. Bookings Sub: Admins see everything, Signed-in users see their own
    let unsubBook = () => {};
    if (isAdminUser) {
      unsubBook = onSnapshot(collection(db, 'bookings'), (snapshot) => {
        const list: DigitalSevaBooking[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as DigitalSevaBooking);
        });
        list.sort((a, b) => b.date.localeCompare(a.date));
        setBookings(list);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'bookings');
      });
    } else if (user && user.email) {
      unsubBook = onSnapshot(query(collection(db, 'bookings'), where('email', '==', user.email)), (snapshot) => {
        const list: DigitalSevaBooking[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as DigitalSevaBooking);
        });
        list.sort((a, b) => b.date.localeCompare(a.date));
        setBookings(list);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'bookings');
      });
    } else {
      setBookings([]);
    }

    // 6. Donations Sub: Admins see everything, Signed-in users see their own
    let unsubDon = () => {};
    if (isAdminUser) {
      unsubDon = onSnapshot(collection(db, 'donations'), (snapshot) => {
        const list: DonationRecord[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as DonationRecord);
        });
        list.sort((a, b) => b.date.localeCompare(a.date));
        setDonations(list);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'donations');
      });
    } else if (user && user.email) {
      unsubDon = onSnapshot(query(collection(db, 'donations'), where('email', '==', user.email)), (snapshot) => {
        const list: DonationRecord[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as DonationRecord);
        });
        list.sort((a, b) => b.date.localeCompare(a.date));
        setDonations(list);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'donations');
      });
    } else {
      setDonations([]);
    }

    return () => {
      unsubTest();
      unsubBook();
      unsubDon();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      const errorCode = e?.code || '';
      const errorMsg = e?.message || '';
      // Gracefully handle normal user actions (closing or cancelling the popup window)
      if (
        errorCode === 'auth/popup-closed-by-user' ||
        errorCode === 'auth/cancelled-popup-request' ||
        errorMsg.includes('auth/popup-closed-by-user') ||
        errorMsg.includes('auth/cancelled-popup-request')
      ) {
        // Normal user cancellation - do not alert or console.error
        return;
      }
      if (errorCode === 'auth/popup-blocked' || errorMsg.includes('popup-blocked')) {
        alert(lang === 'EN' 
          ? 'Browser popup blocked. Please allow popups for this site to sign in.' 
          : 'ब्राउझर पॉपअप ब्लॉक केले आहे. कृपया लॉगिन करण्यासाठी पॉपअपची परवानगी द्या.');
        return;
      }
      console.warn('Authentication status:', errorCode || errorMsg);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  const updateProfileState = (newProf: UserProfile) => {
    setUserProfile(newProf);
    try {
      localStorage.setItem('ishwatichi_profile', JSON.stringify(newProf));
    } catch (e) {}
  };

  const updateHistoryState = (newHist: typeof claimsHistory) => {
    setClaimsHistory(newHist);
    try {
      localStorage.setItem('ishwatichi_history', JSON.stringify(newHist));
    } catch (e) {}
  };

  // State handlers triggers
  const handleAddExperience = async (exp: DevoteeExperience) => {
    try {
      await setDoc(doc(db, 'testimonials', exp.id), cleanDevanagariSpelling(exp));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `testimonials/${exp.id}`);
    }
  };

  const handleApproveExperience = async (id: string, approve: boolean) => {
    try {
      if (approve) {
        await updateDoc(doc(db, 'testimonials', id), { approved: true });
        alert(lang === 'EN' ? 'Devotee story successfully approved!' : 'भक्ताचे अनुभव यशस्वीरित्या मंजूर!');
      } else {
        await deleteDoc(doc(db, 'testimonials', id));
        alert(lang === 'EN' ? 'Selected story has been rejected.' : 'निवडलेले अनुभव नाकारले गेले.');
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `testimonials/${id}`);
    }
  };

  const handleSaveSiteContent = async (key: string, data: any) => {
    try {
      await setDoc(doc(db, 'site_content', key), {
        contentKey: key,
        data: cleanDevanagariSpelling(data)
      });
      alert(lang === 'EN' ? 'Site content saved to database!' : 'वेबसाईट माहिती डेटाबेसमध्ये जतन केली!');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `site_content/${key}`);
    }
  };

  const handleNewBooking = async (booking: DigitalSevaBooking) => {
    try {
      await setDoc(doc(db, 'bookings', booking.id), cleanDevanagariSpelling(booking));

      // Save logs to history locally
      const logId = 'lg-' + Math.floor(Math.random() * 10000);
      const newLog = {
        id: logId,
        title: `Registered: ${booking.subType}`,
        date: new Date().toISOString().split('T')[0]
      };
      updateHistoryState([newLog, ...claimsHistory]);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `bookings/${booking.id}`);
    }
  };

  const handleRsvpEvent = async (eventId: string, devoteeName: string) => {
    const targetEvt = events.find(x => x.id === eventId) || INITIAL_EVENTS.find(x => x.id === eventId);
    
    // Increment RSVP count in Firestore if possible
    try {
      if (targetEvt) {
        const evtRef = doc(db, 'events', eventId);
        await updateDoc(evtRef, {
          rsvpCount: (targetEvt.rsvpCount || 0) + 1
        });
      }
    } catch {
      // Non-blocking if offline/unseeded
    }

    handleNewBooking({
      id: 'RSVP-' + Math.floor(1000 + Math.random() * 9000),
      type: 'volunteer',
      subType: `RSVP Presence: ${targetEvt?.titleMarathi || targetEvt?.title || 'Temple Festival'}`,
      devoteeName: devoteeName,
      phone: userProfile.phone,
      email: userProfile.email,
      date: targetEvt?.date || new Date().toISOString().split('T')[0],
      status: 'confirmed'
    });
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'bookings', id));
      alert('Booking registration cancelled.');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `bookings/${id}`);
    }
  };

  const handleNewDonation = async (record: DonationRecord) => {
    try {
      await setDoc(doc(db, 'donations', record.id), record);

      // Update profile locally
      const calculated = userProfile.totalDonation + record.amount;
      const isFirstDonation = userProfile.totalDonation === 0;
      
      let milestones = [...userProfile.milestonesReached];
      if (isFirstDonation) {
        milestones.push({
          id: 'mil-dan',
          title: 'Daanveer Badge (Generous Heart)',
          date: new Date().toISOString().split('T')[0]
        });
      }

      const updatedProfile = {
        ...userProfile,
        totalDonation: calculated,
        milestonesReached: milestones
      };
      updateProfileState(updatedProfile);

      // Save logs to history
      const logId = 'lg-' + Math.floor(Math.random() * 10000);
      const newLog = {
        id: logId,
        title: `Contribution: ₹${record.amount.toLocaleString()} for ${record.category}`,
        date: new Date().toISOString().split('T')[0]
      };
      updateHistoryState([newLog, ...claimsHistory]);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `donations/${record.id}`);
    }
  };

  const handleAddAnnouncement = async (ann: Announcement) => {
    try {
      await setDoc(doc(db, 'announcements', ann.id), cleanDevanagariSpelling(ann));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `announcements/${ann.id}`);
    }
  };

  const handleUpdateProfile = (updatedFields: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...updatedFields };
    updateProfileState(updated);
  };

  // Daily Devotion Claim streak engine check
  const handleClaimDailyCheckIn = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (userProfile.lastPrayerDate === todayStr) {
      alert(lang === 'EN' 
        ? '🙏 Your daily devotion check-in is already accounted for today! Check in tomorrow to increase your streak.' 
        : '🙏 आजचे दपदर्शन गुण आधीच नोंदवले गेले आहेत. उद्या पुन्हा भेट देऊन सातत्य टिकवून ठेवा.');
      return;
    }

    const newStreak = userProfile.streakCount + 1;
    let milestones = [...userProfile.milestonesReached];

    // Check benchmarks and assign milestone badges dynamically
    if (newStreak === 3) {
      milestones.push({
        id: 'mil-3',
        title: 'Nitya Dharmee Badge (Regular Practitioner)',
        date: todayStr
      });
    } else if (newStreak === 5) {
      milestones.push({
        id: 'mil-5',
        title: 'Ananya Upasak Badge (Deeply Devoted)',
        date: todayStr
      });
    }

    const updatedProfile: UserProfile = {
      ...userProfile,
      streakCount: newStreak,
      lastPrayerDate: todayStr,
      milestonesReached: milestones
    };
    updateProfileState(updatedProfile);

    // Save logs
    const logId = 'lg-' + Math.floor(Math.random() * 10000);
    const newLog = {
      id: logId,
      title: `Checked In: Completed Day ${newStreak} Darshan`,
      date: todayStr
    };
    updateHistoryState([newLog, ...claimsHistory]);

    alert(lang === 'EN' 
      ? `🎉 Jai Mata Di! Daily check-in successful. Your devotion streak is now 🔥 ${newStreak} Days!` 
      : `🎉 विजयाभव! आजचे दर्शन यशस्वी नोंदले गेले. तुमची भक्ती गुण सातत्य आता 🔥 ${newStreak} दिवस झाले आहे!`);
  };

  // Add 25 streak boost points for Digital Seva
  const handleBoostStreakSeva = () => {
    const updated = {
      ...userProfile,
      streakCount: userProfile.streakCount + 1
    };
    updateProfileState(updated);
  };

  const t = TRANSLATIONS[lang];

  return (
    <div className={`w-full m-0 p-0 min-h-screen transition-all duration-300 ${darkMode ? 'bg-black/25 text-white' : 'bg-[#fffdf6] text-stone-900'}`}>
      
      {/* Dynamic Animated floral blossom floating elements in background */}
      <div className="fixed inset-x-0 top-0 overflow-hidden h-[500px] pointer-events-none z-0">
        <span className="absolute animate-flower-1 left-[10%] top-10 text-xl font-bold opacity-30 select-none">🌸</span>
        <span className="absolute animate-flower-1 left-[40%] top-24 text-2xl font-bold opacity-20 select-none" style={{ animationDelay: '2s' }}>🌸</span>
        <span className="absolute animate-flower-1 left-[80%] top-5 text-xl font-bold opacity-35 select-none" style={{ animationDelay: '4s' }}>🌸</span>
        <span className="absolute animate-flower-1 left-[95%] top-20 text-lg font-bold opacity-25 select-none" style={{ animationDelay: '1s' }}>🌸</span>
      </div>

      {/* Shared Header (Logo, Language selectors, Dark/Light usage themes, Streak values) */}
      <Header
        lang={lang}
        setLang={setLang}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streak={userProfile.streakCount}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        logoUrl={logoImg}
      />

      {/* Resilient Quota Notification Banner */}
      {quotaWarning && (
        <div className="w-full bg-amber-950/90 border-b border-amber-500/40 text-amber-200 text-xs py-2 z-40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base">ℹ️</span>
              <span>
                {lang === 'EN'
                  ? 'Daily free read quota reached for today. Running in high-performance cached mode with full live access. Quota automatically resets tomorrow.'
                  : 'दैनिक मोफत मर्यादा पूर्ण झाल्यामुळे स्थानिक सुरक्षित डेटा वापरला जात आहे. सर्व दर्शन, सेवा व देणगी वैशिष्ट्ये सुरळीत सुरू आहेत.'}
              </span>
            </div>
            <button
              onClick={() => setQuotaWarning(null)}
              className="text-amber-300 hover:text-white px-2 py-0.5 rounded text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Special Festive Agaman Sohala Celebration Banner - Displayed below Menu Bar and before Main Mata Idol */}
      {activeTab === 'home' && (
        <AgamanBanner 
          lang={lang} 
          onViewDetails={() => setActiveTab('events')} 
        />
      )}

      {/* HERO SECTION / BANNER CANVAS - FULL DEVI MATA SACRED DARSHAN SHOWCASE */}
      {activeTab === 'home' && (
        <section 
          className="relative w-full overflow-hidden border-b border-brand-gold/25 bg-gradient-to-b from-[#240101] via-[#380303] to-[#200101] text-white py-6 sm:py-8 lg:py-10"
        >
          {/* Subtle Ambient Sanctum Background Glow & Motifs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-radial from-brand-gold/15 via-brand-saffron/5 to-transparent blur-3xl opacity-60" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,153,51,0.09)_0%,transparent_70%)]" />
          </div>

          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Top Traditional Invocation Line */}
            <div className="flex items-center justify-center gap-2 text-center mb-4 sm:mb-5 select-none">
              <span className="text-brand-gold text-sm sm:text-base animate-pulse">🕉️</span>
              <span className="font-sans font-bold text-xs sm:text-sm md:text-base text-brand-gold tracking-widest drop-shadow-[0_0_12px_rgba(212,175,55,0.7)] uppercase">
                {lang === 'EN' ? '|| Shree Kulswamini Ishwatichi Mata Prasanna ||' : '॥ ॐ श्री कुलस्वामिनी इश्वटीची माता प्रसन्न ॥'}
              </span>
              <span className="text-brand-gold text-sm sm:text-base animate-pulse">🕉️</span>
            </div>

            {/* Responsive Grid: Sacred Idol Column (Left) + Sacred Information & Action Matrix (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-center">
              
              {/* SACRED IDOL SHOWCASE (Devi Mata Full Sacred Idol View - 100% Uncut) */}
              <div className="lg:col-span-5 xl:col-span-5 flex flex-col items-center justify-center">
                <div 
                  onClick={() => setIsFullDarshanOpen(true)}
                  className="relative group w-full max-w-[340px] xs:max-w-[380px] sm:max-w-[420px] lg:max-w-none rounded-2xl mt-[-10px] sm:mt-0 pt-2 p-2 sm:p-2.5 bg-gradient-to-b from-[#4A0404]/90 via-black/85 to-[#300202]/95 border-2 sm:border-3 border-brand-gold/75 ring-2 ring-brand-gold/25 shadow-[0_0_35px_rgba(255,153,51,0.45)] backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_0_45px_rgba(255,153,51,0.7)]"
                  title={lang === 'EN' ? 'Click to view full sacred idol in high-definition' : 'संपूर्ण दिव्य दर्शन मोठ्या आकारात पाहण्यासाठी क्लिक करा'}
                >
                  {/* Sacred Top Arch Header */}
                  <div className="flex items-center justify-between px-3 py-1.5 mb-1.5 bg-brand-maroon/80 border border-brand-gold/40 rounded-lg text-center">
                    <span className="text-xs text-brand-saffron animate-pulse">✨</span>
                    <span className="text-[11px] sm:text-xs font-sans font-black text-brand-gold tracking-wider">
                      {lang === 'EN' ? 'Shree Ishwatichi Mata Sanctum' : 'श्री इश्वटीची माता अधिकृत स्वयंभू दर्शन'}
                    </span>
                    <span className="text-xs text-brand-saffron animate-pulse">✨</span>
                  </div>

                  {/* Complete, Full Portrait Idol Container - Uncut on all devices */}
                  <div className="relative w-full flex items-center justify-center overflow-hidden rounded-xl bg-black/70 py-1">
                    <DeviImage 
                      aspectRatio="auto"
                      objectFit="contain"
                      objectPosition="center center"
                      priority
                      className="w-full h-auto max-h-[380px] xs:max-h-[440px] sm:max-h-[500px] md:max-h-[540px] lg:max-h-[560px] xl:max-h-[600px] flex items-center justify-center"
                      imageClassName="w-auto h-auto max-h-[380px] xs:max-h-[440px] sm:max-h-[500px] md:max-h-[540px] lg:max-h-[560px] xl:max-h-[600px] object-contain mx-auto transition-transform duration-700 group-hover:scale-[1.03] drop-shadow-[0_8px_25px_rgba(0,0,0,0.9)]"
                    />

                    {/* Divine Diya flickering at bottom corner */}
                    <div className="absolute bottom-2 right-2 animate-diya-flicker text-2xl sm:text-3xl select-none drop-shadow-[0_0_15px_rgba(255,153,51,0.9)] z-20">
                      🪔
                    </div>

                    {/* Interactive "Full View" Badge Overlay */}
                    <div className="absolute top-2 right-2 z-20 bg-black/75 hover:bg-black/90 text-brand-gold border border-brand-gold/50 text-[10px] sm:text-xs font-sans font-bold px-2 py-1 rounded-md shadow-md backdrop-blur-sm flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-3 w-3" />
                      <span>{lang === 'EN' ? 'Full View' : 'संपूर्ण दर्शन'}</span>
                    </div>
                  </div>

                  {/* Sacred footer banner of the frame */}
                  <div className="mt-2 pt-1.5 border-t border-brand-gold/25 flex items-center justify-between text-[10px] sm:text-[11px] text-gray-300 px-1">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                      {lang === 'EN' ? 'Live Darshan Open' : 'थेट दर्शन सुरू आहे'}
                    </span>
                    <span className="text-brand-gold font-mono font-bold">
                      {lang === 'EN' ? 'Est. 1974 • 53rd Year' : 'स्थापना १९७४ • ५३ वे वर्ष'}
                    </span>
                  </div>
                </div>
              </div>

              {/* TEMPLE INFORMATION & ACTION MATRIX (Right / Side Column) */}
              <div className="lg:col-span-7 xl:col-span-7 text-center lg:text-left space-y-4 sm:space-y-5">
                
                {/* Header Titles */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold text-[11px] sm:text-xs font-sans font-bold">
                    <Sparkles className="h-3.5 w-3.5 text-brand-saffron animate-pulse" />
                    <span>{lang === 'EN' ? '53rd Year Celebration • Est. 1974' : '५३ वे वर्ष शारदीय नवरात्रौत्सव • स्थापना १९७४'}</span>
                  </div>

                  <h1 className="font-sans text-2xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] tracking-tight leading-tight">
                    {cleanDevanagariSpelling(lang === 'EN' ? (siteContent.welcome?.titleEN || 'Shree Ishwatichi Mata Devasthan Mandal') : (siteContent.welcome?.titleMR || 'श्री इश्वटीची माता देवस्थान मंडळ'))}
                  </h1>

                  <p className="font-sans text-xs sm:text-base lg:text-lg font-extrabold text-brand-saffron tracking-wide uppercase drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]">
                    {cleanDevanagariSpelling(lang === 'EN' ? (siteContent.welcome?.subtitleEN || 'Faith • Devotion • Tradition • Service') : (siteContent.welcome?.subtitleMR || 'श्रद्धा • भक्ती • परंपरा • सेवा'))}
                  </p>

                  <div className="h-0.5 sm:h-1 w-20 sm:w-28 mx-auto lg:mx-0 bg-gradient-to-r from-brand-gold via-brand-saffron to-transparent" />

                  <p className="text-xs sm:text-sm md:text-base text-gray-200 font-sans max-w-2xl leading-relaxed drop-shadow">
                    {cleanDevanagariSpelling(lang === 'EN'
                      ? (siteContent.welcome?.descEN || 'Welcome to the official digital portal of Shree Ishwatichi Mata Devasthan Mandal. Experience 24/7 live darshan from home and contribute to our community welfare initiatives.')
                      : (siteContent.welcome?.descMR || 'श्री इश्वटीची माता देवस्थान मंडळाच्या अधिकृत डिजिटल दालनात आपले सहर्ष स्वागत. मातेच्या संपूर्ण दर्शनाचा घरबसल्या लाभ घ्या आणि सेवा उपक्रमांत सहभागी व्हा.'))}
                  </p>
                </div>

                {/* Status indicator strip */}
                <div className="p-3 sm:p-3.5 bg-black/50 border border-brand-gold/30 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="font-sans font-bold text-gray-200">
                      {lang === 'EN' ? 'Sanctum Status: Live Darshan Open' : 'गाभारा दर्शन: थेट प्रक्षेपण सुरू'}
                    </span>
                  </div>
                  <div className="text-brand-gold font-sans font-bold">
                    {lang === 'EN' ? 'Daily Aarti: 07:30 PM' : 'दैनिक महाआरती: सायं. ०७:३०'}
                  </div>
                </div>

                {/* Quick Action Button Portals - Full-width responsive 4-column matrix with comfortable gaps and padding */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
                  <button 
                    onClick={() => setActiveTab('darshan')}
                    className="w-full min-h-[48px] px-3 py-2.5 rounded-xl font-sans font-bold text-xs sm:text-sm bg-brand-red text-white border-2 border-brand-gold hover:bg-brand-saffron hover:text-brand-maroon transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95"
                  >
                    <span className="text-base shrink-0">🎥</span> 
                    <span className="font-sans leading-tight text-center">{t.hero_btn1}</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('seva')}
                    className="w-full min-h-[48px] px-3 py-2.5 rounded-xl font-sans font-bold text-xs sm:text-sm bg-brand-maroon text-brand-gold border-2 border-brand-gold hover:bg-brand-gold hover:text-brand-maroon transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95"
                  >
                    <span className="text-base shrink-0">🕯️</span> 
                    <span className="font-sans leading-tight text-center">{t.hero_btn2}</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('donation')}
                    className="w-full min-h-[48px] px-3 py-2.5 rounded-xl font-sans font-bold text-xs sm:text-sm bg-brand-gold text-brand-maroon hover:opacity-95 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95"
                  >
                    <span className="text-base shrink-0">💝</span> 
                    <span className="font-sans leading-tight text-center">{t.hero_btn3}</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('patrika')}
                    className="w-full min-h-[48px] px-3 py-2.5 rounded-xl font-sans font-bold text-xs sm:text-sm bg-amber-900/80 text-brand-gold border-2 border-brand-gold/70 hover:bg-brand-gold hover:text-brand-maroon transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95"
                  >
                    <span className="text-base shrink-0">📜</span> 
                    <span className="font-sans leading-tight text-center">{lang === 'EN' ? 'Karyakram Patrika' : 'कार्यक्रम पत्रिका'}</span>
                  </button>
                </div>

                {/* Hero Aarti Web Audio Player */}
                <HeroAudioPlayer lang={lang} />

              </div>

            </div>
          </div>
        </section>
      )}

      {/* MAIN VIEWPORT MATRIX CONTROLLER */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10 space-y-8 sm:space-y-12">
        
        {/* Render Tab specific portals */}
        {activeTab === 'home' && (
          <>
            {/* Live Upcoming Major Festival Countdown Widget */}
            <UpcomingFestivalCountdown
              lang={lang}
              events={events.length > 0 ? events : INITIAL_EVENTS}
              onNavigateToEvents={() => setActiveTab('events')}
              onNavigateToSeva={() => setActiveTab('seva')}
              onNavigateToPatrika={() => setActiveTab('patrika')}
              onRsvp={handleRsvpEvent}
            />

            {/* Live streaming & quick timing schedule dashboards */}
            <LiveDarshanSection lang={lang} heroImagePath={heroImg} />

            {/* General Highlights about the Temple Origin */}
            <AboutSection lang={lang} />

            {/* Fast Quick Buttons to contact & locations */}
            <div className="text-center py-6 sm:py-8 bg-black/45 rounded-2xl border border-brand-gold/25 p-5 sm:p-8 w-full max-w-2xl mx-auto space-y-3 shadow-xl">
              <span className="text-xs text-brand-saffron uppercase tracking-wider font-mono font-bold">
                {lang === 'EN' ? '24/7 Digital Helpline' : '२४/७ डिजिटल साहाय्यता कक्ष'}
              </span>
              <h4 className="text-base sm:text-lg font-sans font-bold text-white leading-relaxed">
                {lang === 'EN' 
                  ? 'Have questions regarding Abhishek Pooja or Prasad deliveries?' 
                  : 'अभिषेक पूजा, आरती किंवा प्रसाद घरपोच सेवेविषयी काही प्रश्न आहेत का?'}
              </h4>
              <button 
                onClick={() => setActiveTab('contact')}
                className="px-5 py-2.5 bg-brand-gold text-brand-maroon font-bold font-sans text-xs sm:text-sm rounded-xl hover:scale-105 transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>📞</span> <span>{lang === 'EN' ? 'Contact Devasthan Center' : 'देवस्थान कार्यालयाशी संपर्क साधा'}</span>
              </button>
            </div>
          </>
        )}

        {activeTab === 'about' && (
          <AboutSection lang={lang} />
        )}

        {activeTab === 'darshan' && (
          <LiveDarshanSection lang={lang} heroImagePath={heroImg} />
        )}

        {activeTab === 'seva' && (
          <DigitalSevaSection 
            lang={lang} 
            onNewBooking={handleNewBooking} 
            userStreakPlus={handleBoostStreakSeva} 
          />
        )}

        {activeTab === 'events' && (
          <EventsSection 
            lang={lang} 
            events={events.length > 0 ? events : INITIAL_EVENTS} 
            onRsvp={(evtId, name) => {
              const matchedEvt = (events.length > 0 ? events : INITIAL_EVENTS).find(x => x.id === evtId);
              handleNewBooking({
                id: 'RSVP-' + Math.floor(1000 + Math.random() * 9000),
                type: 'volunteer',
                subType: `RSVP Presence: ${matchedEvt?.title || 'Temple Event'}`,
                devoteeName: name,
                phone: userProfile.phone,
                email: userProfile.email,
                date: matchedEvt?.date || new Date().toISOString().split('T')[0],
                status: 'confirmed'
              });
              alert(`Awesome RSVP Registered under name: ${name}. Welcome to the local mandir!`);
            }}
          />
        )}

        {activeTab === 'patrika' && (
          <NavratriPatrikaSection lang={lang} />
        )}

        {activeTab === 'gallery' && (
          <MasonryGallery lang={lang} />
        )}

        {activeTab === 'testimonials' && (
          <DevoteeExperiencesSection 
            lang={lang} 
            experiences={experiences} 
            onAddExperience={handleAddExperience} 
          />
        )}

        {activeTab === 'donation' && (
          <DonationSection 
            lang={lang} 
            onNewDonation={handleNewDonation} 
            userDonationPlus={(amt) => setUserProfile(p => ({ ...p, totalDonation: p.totalDonation + amt }))} 
          />
        )}

        {activeTab === 'social' && (
          <SocialWorkSection lang={lang} />
        )}

        {activeTab === 'news' && (
          <NewsSection lang={lang} announcements={announcements} />
        )}

        {activeTab === 'profile' && (
          <UserProfileDashboard
            lang={lang}
            profile={userProfile}
            onClaimDaily={handleClaimDailyCheckIn}
            onUpdateProfile={handleUpdateProfile}
            claimsHistory={claimsHistory}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            lang={lang}
            experiences={experiences}
            onApproveExperience={handleApproveExperience}
            bookings={bookings}
            onDeleteBooking={handleDeleteBooking}
            donations={donations}
            onAddAnnouncement={handleAddAnnouncement}
            siteContent={siteContent}
            onSaveSiteContent={handleSaveSiteContent}
          />
        )}

        {activeTab === 'contact' && (
          <ContactSection lang={lang} siteContent={siteContent.contact} />
        )}

      </main>

      {/* MAIN FOOTER */}
      <footer className="w-full bg-brand-maroon border-t border-brand-gold/25 text-white/95 py-10 pb-28 md:pb-12 select-none relative z-10 font-sans text-xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <SiteLogo size="md" withGlow className="drop-shadow-md" />
              <h4 className="font-sans font-extrabold sm:font-black text-brand-gold text-sm tracking-widest">{t.title}</h4>
            </div>
            <p className="text-gray-300 leading-normal">
              {lang === 'EN' 
                ? 'Registered non-profit public organization establishing social unity, moral spirituality, and cultural pride since 1974.' 
                : '१९७४ पासून कार्यरत अधिकृत धर्मादाय ट्रस्ट. समाजकार्य आणि शुद्ध भक्ती परंपरा जोपासणारे महाराष्ट्रातील अग्रगण्य मंडळ.'}
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white font-sans tracking-widest uppercase text-xs">{lang === 'EN' ? 'Spiritual Portals' : 'मुख्य विभाग दुवे'}</h5>
            <ul className="space-y-1.5 text-gray-300">
              <li><button onClick={() => setActiveTab('about')} className="hover:text-brand-saffron text-left cursor-pointer">{t.nav_about}</button></li>
              <li><button onClick={() => setActiveTab('darshan')} className="hover:text-brand-saffron text-left cursor-pointer">{t.nav_darshan}</button></li>
              <li><button onClick={() => setActiveTab('seva')} className="hover:text-brand-saffron text-left cursor-pointer">{t.nav_seva}</button></li>
              <li><button onClick={() => setActiveTab('donation')} className="hover:text-brand-saffron text-left cursor-pointer">{t.nav_donation}</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white font-sans tracking-widest uppercase text-xs">{lang === 'EN' ? 'Holy Calendars' : 'अधिकृत उत्सव'}</h5>
            <ul className="space-y-1.5 text-gray-300">
              <li><button onClick={() => setActiveTab('patrika')} className="hover:text-brand-saffron text-left cursor-pointer font-bold text-brand-gold">{lang === 'EN' ? '📜 Navratri Patrika 2026' : '📜 नवरात्र कार्यक्रम पत्रिका २०२६'}</button></li>
              <li><button onClick={() => setActiveTab('events')} className="hover:text-brand-saffron text-left cursor-pointer">Navratri Mahotsav</button></li>
              <li><button onClick={() => setActiveTab('events')} className="hover:text-brand-saffron text-left cursor-pointer">Ashadhi Ekadashi</button></li>
              <li><button onClick={() => setActiveTab('events')} className="hover:text-brand-saffron text-left cursor-pointer">Gudi Padwa Shobha Yatra</button></li>
              <li><button onClick={() => setActiveTab('events')} className="hover:text-brand-saffron text-left cursor-pointer">Charitable Medical Drive</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white font-sans tracking-widest uppercase text-xs">{lang === 'EN' ? 'Mandal Head Office' : 'मध्यवर्ती कार्यालय'}</h5>
            <p className="text-gray-300 leading-normal">
              {lang === 'EN'
                ? 'Sector-4, Main Mandir Marg, Dombivli East, Thane. Near Shivaji Garden, Maharashtra 421201'
                : 'सेक्टर-४, मुख्य मंदिर मार्ग, डोंबिवली पूर्व, ठाणे. जवळ शिवाजी उद्यान, महाराष्ट्र ४२१२०१'}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('admin')} className="text-brand-gold underline font-mono tracking-wider font-bold cursor-pointer">
                [ {lang === 'EN' ? 'Admin Access Code: 1234' : 'प्रशासकीय लॉगिन कोड: 1234'} ]
              </button>
            </div>
          </div>

        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 mt-8 pt-8 border-t border-white/5 text-center text-gray-400 text-[10px] space-y-1">
          <p>© २०२६ श्री यंग इश्वटी नवरात्रौत्सव मंडळ चॅरिटेबल ट्रस्ट. सर्व हक्क सुरक्षित. नोंदणी क्र. E-५०१२५/मुंबई.</p>
          <p className="tracking-widest">{lang === 'EN' ? '|| Shree Ishwatichi Mata Devasthan ||' : '|| श्री इश्वटीची माता देवस्थान ||'}</p>
        </div>
      </footer>

      {/* Persistent Mobile Bottom Navigation Bar (visible only on mobile/tablet < md) */}
      <nav 
        aria-label="Mobile Bottom Navigation" 
        className="fixed bottom-0 inset-x-0 z-40 bg-[#280101]/95 backdrop-blur-md border-t border-brand-gold/30 md:hidden shadow-[0_-4px_24px_rgba(0,0,0,0.7)] py-1.5 px-2 select-none"
      >
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto items-center text-center">
          <button
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'home' ? 'text-brand-gold font-bold scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-lg">🏠</span>
            <span className="text-[10px] tracking-tight">{lang === 'EN' ? 'Home' : 'मुख्य'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('darshan');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`relative flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'darshan' ? 'text-brand-gold font-bold scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-lg">🎥</span>
            <span className="absolute top-1 right-3 h-2 w-2 rounded-full bg-green-400 animate-ping" />
            <span className="text-[10px] tracking-tight">{lang === 'EN' ? 'Darshan' : 'दर्शन'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('seva');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'seva' ? 'text-brand-gold font-bold scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-lg">🕯️</span>
            <span className="text-[10px] tracking-tight">{lang === 'EN' ? 'Seva' : 'सेवा'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('donation');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'donation' ? 'text-brand-gold font-bold scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-lg">💝</span>
            <span className="text-[10px] tracking-tight">{lang === 'EN' ? 'Donate' : 'देणगी'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('profile');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'profile' ? 'text-brand-gold font-bold scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-lg">🕉️</span>
            <span className="text-[10px] tracking-tight">{lang === 'EN' ? 'Streak' : 'भक्ती'}</span>
          </button>
        </div>
      </nav>

      {/* GLOBAL HIGH-FIDELITY AUDIO CONTROLLER */}
      <GlobalAudioController 
        lang={lang} 
        onNavigateToDarshan={() => {
          setActiveTab('darshan');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* FULL-SCREEN IMMERSIVE SACRED DARSHAN MODAL */}
      {isFullDarshanOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button 
            onClick={() => setIsFullDarshanOpen(false)}
            className="absolute top-4 right-4 z-50 bg-brand-maroon/90 text-brand-gold hover:text-white border border-brand-gold/60 p-2 sm:p-2.5 rounded-full cursor-pointer shadow-2xl hover:scale-110 transition-transform"
            aria-label="Close full darshan"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Floating Flower shower elements when clicked */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {Array.from({ length: 16 }).map((_, i) => (
              <span 
                key={`flower-${i}-${flowerShowerCount}`}
                className="absolute animate-flower-1 text-2xl select-none"
                style={{
                  left: `${(i * 6.5 + 4) % 95}%`,
                  top: `-${(i * 18) % 100}px`,
                  animationDuration: `${3.5 + (i % 4)}s`,
                  animationDelay: `${(i * 0.25) % 2}s`
                }}
              >
                {i % 2 === 0 ? '🌸' : '🌺'}
              </span>
            ))}
          </div>

          <div className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 my-auto py-4">
            
            {/* Sacred Title */}
            <div className="space-y-1">
              <span className="text-xs sm:text-sm text-brand-saffron font-bold font-sans">
                ॥ ॐ श्री कुलस्वामिनी इश्वटीची माता प्रसन्न ॥
              </span>
              <h3 className="text-lg sm:text-2xl font-black text-brand-gold font-sans">
                {lang === 'EN' ? 'Shree Ishwatichi Mata • Complete Sacred Sanctum Darshan' : 'श्री इश्वटीची माता • संपूर्ण पावन गाभारा दर्शन'}
              </h3>
            </div>

            {/* Sacred Image container with Pinch-to-Zoom, Fine Details Inspection & Overlays */}
            <SacredDarshanZoomViewer 
              lang={lang} 
              alt={lang === 'EN' ? 'Shree Ishwatichi Mata Official Sacred Idol' : 'श्री इश्वटीची माता अधिकृत स्वयंभू दर्शन मूर्ती'}
            />

            {/* Devotional Shloka */}
            <p className="text-xs sm:text-sm text-brand-gold font-serif italic max-w-xl px-4 leading-relaxed">
              "सर्वमंगल मांगल्ये शिवे सर्वार्थ साधिके । शरण्ये त्र्यंबके गौरी नारायणि नमोऽस्तु ते ॥"
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                onClick={() => setFlowerShowerCount(prev => prev + 1)}
                className="px-4 py-2 bg-brand-maroon text-brand-gold border border-brand-gold/60 rounded-xl hover:bg-brand-gold hover:text-brand-maroon text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>🌸</span>
                <span>{lang === 'EN' ? 'Offer Flower Shower (पुष्पवृष्टी)' : 'पुष्पवृष्टी अर्पण करा'}</span>
              </button>
              
              <button
                onClick={() => {
                  aartiAudioEngine.playAarti();
                }}
                className="px-4 py-2 bg-brand-gold text-brand-maroon font-bold rounded-xl hover:bg-brand-saffron text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>🔔</span>
                <span>{lang === 'EN' ? 'Play Aarti (आरती सुरू करा)' : 'आरती सुरू करा'}</span>
              </button>

              <button
                onClick={() => setIsFullDarshanOpen(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                {lang === 'EN' ? 'Close' : 'बंद करा'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
