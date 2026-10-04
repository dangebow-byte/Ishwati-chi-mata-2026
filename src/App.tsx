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

import { Sparkles, Play, Flame, Award, HelpCircle } from 'lucide-react';
import { SiteLogo } from './components/SiteLogo';
import { DeviImage } from './components/DeviImage';
import { HeroAudioPlayer } from './components/HeroAudioPlayer';
import { UpcomingFestivalCountdown } from './components/UpcomingFestivalCountdown';
import { NavratriPatrikaSection } from './components/NavratriPatrikaSection';
import { aartiAudioEngine } from './utils/aartiAudioEngine';

// Official Shree Ishwatichi Mata Mandal branding and Devi darshan assets
import logoImg from './assets/branding/Mandal logo Maroon Transparent BG.png';
import heroImg from './assets/devotional/devi-mata-main.webp';

export default function App() {
  const [lang, setLang] = useState<'EN' | 'MR'>('MR');
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  // Unified State from Firestore & Auth
  const [siteContent, setSiteContent] = useState(DEFAULT_SITE_CONTENT);
  const [events, setEvents] = useState<TempleEvent[]>([]);
  const [experiences, setExperiences] = useState<DevoteeExperience[]>([]);
  const [bookings, setBookings] = useState<DigitalSevaBooking[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
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

  // Function to seed database on first mount if empty
  const seedDatabaseIfNeeded = async () => {
    try {
      const siteContentCheck = await getDocs(collection(db, 'site_content'));
      if (siteContentCheck.empty) {
        console.log('Database empty! Seeding default entries to Firestore...');
        
        // Seed site_content documents
        const keys: (keyof typeof DEFAULT_SITE_CONTENT)[] = ['welcome', 'about', 'contact', 'aarti', 'milestones'];
        for (const key of keys) {
          await setDoc(doc(db, 'site_content', key), {
            id: key,
            contentKey: key,
            data: DEFAULT_SITE_CONTENT[key]
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
    } catch (e) {
      console.warn('Silent seeding error (mostly rules/sandbox permissions checks):', e);
    }
  };

  // Setup Firestore real-time onSnapshot sync
  useEffect(() => {
    seedDatabaseIfNeeded();

    const unsubContent = onSnapshot(collection(db, 'site_content'), (snapshot) => {
      const contentMap: any = { ...DEFAULT_SITE_CONTENT };
      snapshot.forEach(docSnap => {
        const val = docSnap.data();
        if (val.contentKey && val.data) {
          contentMap[val.contentKey] = val.data;
        }
      });
      setSiteContent(contentMap);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'site_content');
    });

    const unsubAnn = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      const list: Announcement[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Announcement);
      });
      list.sort((a, b) => b.date.localeCompare(a.date));
      setAnnouncements(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'announcements');
    });

    const unsubEvt = onSnapshot(collection(db, 'events'), (snapshot) => {
      const list: TempleEvent[] = [];
      snapshot.forEach(docSnap => {
        const evtData = docSnap.data() as TempleEvent;
        // Fix for ev-2 if previously stored in Firestore as 2026-10-12
        if (evtData.id === 'ev-2' && evtData.date === '2026-10-12') {
          evtData.date = '2026-10-11';
          setDoc(doc(db, 'events', 'ev-2'), { date: '2026-10-11' }, { merge: true }).catch(() => {});
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
        list.push(docSnap.data() as DevoteeExperience);
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
      await setDoc(doc(db, 'testimonials', exp.id), exp);
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
        data: data
      });
      alert(lang === 'EN' ? 'Site content saved to database!' : 'वेबसाईट माहिती डेटाबेसमध्ये जतन केली!');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `site_content/${key}`);
    }
  };

  const handleNewBooking = async (booking: DigitalSevaBooking) => {
    try {
      await setDoc(doc(db, 'bookings', booking.id), booking);

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
      await setDoc(doc(db, 'announcements', ann.id), ann);
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

      {/* HERO SECTION / BANNER CANVAS */}
      {activeTab === 'home' && (
        <section className="relative w-full m-0 p-0 min-h-[460px] sm:min-h-[540px] lg:min-h-[600px] overflow-hidden border-b border-brand-gold/15 bg-black flex flex-col items-center justify-center">
          {/* Main Visual Altar background */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <DeviImage 
              aspectRatio="auto"
              objectFit="cover"
              priority
              className="w-full h-full opacity-65 brightness-95 saturate-[1.1] scale-100 transform transform-gpu overflow-hidden"
              imageClassName="w-full h-full object-cover object-[center_12%] sm:object-[center_18%]"
            />
            {/* Soft Royal gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-maroon via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_20%,rgba(13,1,1,0.85)_100%)] pointer-events-none" />
          </div>

          {/* Side decorative vertical text/rules - Visible only on ultra-wide 2xl screens to avoid collision */}
          <div className="hidden 2xl:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col items-center gap-8 opacity-50 z-20 pointer-events-none">
            <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent"></div>
            <span className="uppercase tracking-[0.4em] text-[10px] text-[#D4AF37] font-semibold font-mono" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              {lang === 'EN' ? 'Established 1976' : 'स्थापना १९७६'}
            </span>
            <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent"></div>
          </div>

          {/* Side quick status panels - Visible only on ultra-wide 2xl screens to avoid collision */}
          <div className="hidden 2xl:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-5 z-20 w-48 text-left">
            <div className="p-4 bg-[#4A0404]/75 border-l-2 border-[#FF9933] backdrop-blur-md rounded-r shadow-xl relative">
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <p className="text-[10px] uppercase text-[#FF9933] font-mono tracking-wider mb-1">
                {lang === 'EN' ? 'Live Viewers' : 'थेट दर्शनार्थी'}
              </p>
              <p className="text-xl font-black font-sans text-white">12,482</p>
            </div>
            <div className="p-4 bg-[#4A0404]/75 border-l-2 border-[#D4AF37] backdrop-blur-md rounded-r shadow-xl">
              <p className="text-[10px] uppercase text-[#D4AF37] font-mono tracking-wider mb-1">
                {lang === 'EN' ? 'Next Aarti' : 'पुढील आरती'}
              </p>
              <p className="text-xl font-black font-sans text-white">07:30 PM</p>
            </div>
          </div>

          {/* MAIN CONTENT WRAPPER: Zero horizontal whitespace (margins/padding) across all breakpoints */}
          <div className="w-full m-0 p-0 px-0 sm:px-0 md:px-0 lg:px-0 xl:px-0 2xl:px-0 py-6 sm:py-10 lg:py-12 relative z-10 text-center space-y-4 sm:space-y-6">
            
            {/* Traditional Sacred Glowing Devi Mata Darshan & Akhand Jyot Diya */}
            <div className="flex justify-center items-center gap-2.5 sm:gap-4 select-none">
              <span className="text-base sm:text-2xl text-brand-gold opacity-90 animate-pulse">✨</span>
              <div className="relative group">
                <div className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full border-2 sm:border-3 border-brand-gold shadow-[0_0_24px_rgba(255,153,51,0.85)] overflow-hidden bg-black/80 flex items-center justify-center p-0.5 transition-transform duration-300 group-hover:scale-105">
                  <DeviImage 
                    aspectRatio="square" 
                    objectFit="cover"
                    priority
                    className="w-full h-full rounded-full" 
                    imageClassName="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-2 -right-1 animate-diya-flicker text-xl sm:text-2xl drop-shadow-[0_0_12px_rgba(255,153,51,0.95)]">
                  🪔
                </div>
              </div>
              <span className="text-base sm:text-2xl text-brand-gold opacity-90 animate-pulse">✨</span>
            </div>

            <div className="space-y-2 sm:space-y-3 w-full px-2 sm:px-4">
              <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-[0_0_25px_rgba(255,153,51,0.85)] hover:scale-[1.01] transition-transform duration-500 tracking-normal leading-tight">
                {lang === 'EN' ? (siteContent.welcome?.titleEN || 'Shree Ishwatichi Mata (श्री ईश्वटीची)') : (siteContent.welcome?.titleMR || 'श्री ईश्वटीची माता')}
              </h1>
              <p className="font-sans text-xs sm:text-lg lg:text-xl font-extrabold text-[#FF9933] tracking-wide uppercase drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] leading-relaxed">
                {lang === 'EN' ? (siteContent.welcome?.subtitleEN || 'Faith • Devotion • Tradition • Service') : (siteContent.welcome?.subtitleMR || 'श्रद्धा • भक्ती • परंपरा • सेवा')}
              </p>
              <div className="h-0.5 sm:h-1 w-20 sm:w-28 mx-auto bg-gradient-to-r from-transparent via-brand-gold to-transparent" />
              <p className="text-[11px] sm:text-xs md:text-sm text-gray-200 font-sans max-w-4xl mx-auto leading-relaxed drop-shadow line-clamp-3 sm:line-clamp-none">
                {lang === 'EN'
                  ? (siteContent.welcome?.descEN || 'Welcome to the official digital portal of Shree Ishwatichi Mata Devasthan Mandal. Experience live darshan from home and contribute to our community welfare initiatives.')
                  : (siteContent.welcome?.descMR || 'श्री ईश्वटीची माता देवस्थान मंडळाच्या अधिकृत डिजिटल कक्षात भाविकांचे स्वागत. घरबसल्या लाईव्ह पूजेचा आनंद घ्या आणि समाजोपयोगी उपक्रमांत भाग घ्या.')}
              </p>
            </div>

            {/* Quick Action Button Portals - Full-width responsive 4-column matrix */}
            <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2.5 lg:gap-3.5 pt-2 sm:pt-3 px-1 sm:px-2">
              <button 
                onClick={() => setActiveTab('darshan')}
                className="w-full min-h-[46px] sm:min-h-[52px] px-2 sm:px-4 py-2 sm:py-3 rounded-xl font-serif font-bold text-xs sm:text-sm lg:text-base bg-brand-red text-white border-2 border-brand-gold hover:bg-brand-saffron hover:text-brand-maroon transition-all shadow-xl cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 hover:scale-[1.02] active:scale-95"
              >
                <span className="text-base sm:text-xl shrink-0">🎥</span> 
                <span className="font-sans leading-tight text-center sm:text-left">{t.hero_btn1}</span>
              </button>
              <button 
                onClick={() => setActiveTab('seva')}
                className="w-full min-h-[46px] sm:min-h-[52px] px-2 sm:px-4 py-2 sm:py-3 rounded-xl font-serif font-bold text-xs sm:text-sm lg:text-base bg-brand-maroon text-brand-gold border-2 border-brand-gold hover:bg-brand-gold hover:text-brand-maroon transition-all shadow-xl cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 hover:scale-[1.02] active:scale-95"
              >
                <span className="text-base sm:text-xl shrink-0">🕯️</span> 
                <span className="font-sans leading-tight text-center sm:text-left">{t.hero_btn2}</span>
              </button>
              <button 
                onClick={() => setActiveTab('donation')}
                className="w-full min-h-[46px] sm:min-h-[52px] px-2 sm:px-4 py-2 sm:py-3 rounded-xl font-serif font-bold text-xs sm:text-sm lg:text-base bg-brand-gold text-brand-maroon hover:opacity-95 transition-all shadow-xl cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 hover:scale-[1.02] active:scale-95"
              >
                <span className="text-base sm:text-xl shrink-0">💝</span> 
                <span className="font-sans leading-tight text-center sm:text-left">{t.hero_btn3}</span>
              </button>
              <button 
                onClick={() => setActiveTab('testimonials')}
                className="w-full min-h-[46px] sm:min-h-[52px] px-2 sm:px-4 py-2 sm:py-3 rounded-xl font-serif font-bold text-xs sm:text-sm lg:text-base bg-black/70 text-white border-2 border-white/20 hover:bg-white/20 transition-all shadow-xl cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 hover:scale-[1.02] active:scale-95"
              >
                <span className="text-base sm:text-xl shrink-0">📝</span> 
                <span className="font-sans leading-tight text-center sm:text-left">{t.hero_btn4}</span>
              </button>
            </div>

            {/* Background Devotional Web Audio Player (Aarti vs Silence) */}
            <HeroAudioPlayer lang={lang} />

          </div>
        </section>
      )}

      {/* MAIN VIEWPORT MATRIX CONTROLLER */}
      <main className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 relative z-10 space-y-8 sm:space-y-10">
        
        {/* Render Tab specific portals */}
        {activeTab === 'home' && (
          <>
            {/* Live Upcoming Major Festival Countdown Widget */}
            <UpcomingFestivalCountdown
              lang={lang}
              events={events.length > 0 ? events : INITIAL_EVENTS}
              onNavigateToEvents={() => setActiveTab('events')}
              onNavigateToSeva={() => setActiveTab('seva')}
              onRsvp={handleRsvpEvent}
            />

            {/* Official Shardiya Navratri 2026 9-Day Festival Patrika (कार्यक्रम पत्रिका - २०२६) */}
            <NavratriPatrikaSection lang={lang} />

            {/* Live streaming & quick timing schedule dashboards */}
            <LiveDarshanSection lang={lang} heroImagePath={heroImg} />

            {/* General Highlights about the Temple Origin */}
            <AboutSection lang={lang} />

            {/* Fast Quick Buttons to contact & locations */}
            <div className="text-center py-6 sm:py-8 bg-black/45 rounded-2xl border border-brand-gold/25 p-5 sm:p-8 w-full max-w-2xl mx-auto space-y-3 shadow-xl">
              <span className="text-xs text-brand-saffron uppercase tracking-wider font-mono font-bold">
                {lang === 'EN' ? '24/7 Digital Helpline' : '२४/७ डिजिटल साहाय्यता कक्ष'}
              </span>
              <h4 className="text-base sm:text-lg font-serif font-bold text-white leading-relaxed">
                {lang === 'EN' 
                  ? 'Have questions regarding Abhishek Pooja or Prasad deliveries?' 
                  : 'अभिषेक पूजा, आरती किंवा प्रसाद घरपोच सेवेविषयी काही प्रश्न आहेत का?'}
              </h4>
              <button 
                onClick={() => setActiveTab('contact')}
                className="px-5 py-2.5 bg-brand-gold text-brand-maroon font-black font-serif text-xs sm:text-sm rounded-xl hover:scale-105 transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
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
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <SiteLogo size="md" withGlow className="drop-shadow-md" />
              <h4 className="font-serif font-black text-brand-gold text-sm tracking-widest">{t.title}</h4>
            </div>
            <p className="text-gray-300 leading-normal">
              {lang === 'EN' 
                ? 'Registered non-profit public organization establishing social unity, moral spirituality, and cultural pride since 1976.' 
                : '१९७६ पासून कार्यरत अधिकृत धर्मादाय ट्रस्ट. समाजकार्य आणि शुद्ध भक्ती परंपरा जोपासणारे महाराष्ट्रातील अग्रगण्य मंडळ.'}
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white font-serif tracking-widest uppercase text-xs">{lang === 'EN' ? 'Spiritual Portals' : 'मुख्य विभाग दुवे'}</h5>
            <ul className="space-y-1.5 text-gray-300">
              <li><button onClick={() => setActiveTab('about')} className="hover:text-brand-saffron text-left cursor-pointer">{t.nav_about}</button></li>
              <li><button onClick={() => setActiveTab('darshan')} className="hover:text-brand-saffron text-left cursor-pointer">{t.nav_darshan}</button></li>
              <li><button onClick={() => setActiveTab('seva')} className="hover:text-brand-saffron text-left cursor-pointer">{t.nav_seva}</button></li>
              <li><button onClick={() => setActiveTab('donation')} className="hover:text-brand-saffron text-left cursor-pointer">{t.nav_donation}</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white font-serif tracking-widest uppercase text-xs">{lang === 'EN' ? 'Holy Calendars' : 'अधिकृत उत्सव'}</h5>
            <ul className="space-y-1.5 text-gray-300">
              <li><button onClick={() => setActiveTab('events')} className="hover:text-brand-saffron text-left cursor-pointer">Navratri Mahotsav</button></li>
              <li><button onClick={() => setActiveTab('events')} className="hover:text-brand-saffron text-left cursor-pointer">Ashadhi Ekadashi</button></li>
              <li><button onClick={() => setActiveTab('events')} className="hover:text-brand-saffron text-left cursor-pointer">Gudi Padwa Shobha Yatra</button></li>
              <li><button onClick={() => setActiveTab('events')} className="hover:text-brand-saffron text-left cursor-pointer">Charitable Medical Drive</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white font-serif tracking-widest uppercase text-xs">{lang === 'EN' ? 'Mandal Head Office' : 'मध्यवर्ती कार्यालय'}</h5>
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
          <p>© २०२६ श्री यंग ईश्वटी नवरात्रौत्सव मंडळ चॅरिटेबल ट्रस्ट. सर्व हक्क सुरक्षित. नोंदणी क्र. E-५०१२५/मुंबई.</p>
          <p className="tracking-widest">{lang === 'EN' ? '|| Shree Ishwatichi Mata Devasthan ||' : '|| श्री ईश्वटीची माता देवस्थान ||'}</p>
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

    </div>
  );
}
