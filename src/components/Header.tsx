/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sunset, Languages, Moon, Sun, ShieldAlert, Award, Sparkles, Volume2, VolumeX, Menu, X, ChevronRight, Video, Heart, Calendar, BookOpen, Users, Phone, Settings, Sparkle } from 'lucide-react';
import { TRANSLATIONS } from '../data';
import { SiteLogo } from './SiteLogo';
import { TempleBell } from './TempleBell';
import { aartiAudioEngine } from '../utils/aartiAudioEngine';

interface HeaderProps {
  lang: 'EN' | 'MR';
  setLang: (lang: 'EN' | 'MR') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  streak: number;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  logoUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  darkMode,
  setDarkMode,
  activeTab,
  setActiveTab,
  streak,
  user,
  onLogin,
  onLogout,
  logoUrl
}) => {
  const t = TRANSLATIONS[lang];
  const [isAudioPlaying, setIsAudioPlaying] = useState(() => aartiAudioEngine.getIsPlaying());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = aartiAudioEngine.onStateChange(playing => {
      setIsAudioPlaying(playing);
    });
    return () => {
      unsub();
    };
  }, []);

  // Close mobile drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLangToggle = () => {
    setLang(lang === 'EN' ? 'MR' : 'EN');
  };

  const navItems = [
    { 
      id: 'home', 
      label: t.nav_home, 
      icon: '🏠', 
      desc: lang === 'EN' ? 'Main digital sanctum & highlights' : 'मुख्य डिजिटल दालन व वैशिष्ट्ये' 
    },
    { 
      id: 'about', 
      label: t.nav_about, 
      icon: '📜', 
      desc: lang === 'EN' ? 'Sanctum history & sacred origin' : 'मंदिराचा इतिहास व देवीची आख्यायिका' 
    },
    { 
      id: 'darshan', 
      label: t.nav_darshan, 
      icon: '🎥', 
      desc: lang === 'EN' ? 'Live camera feeds & divine soundboard' : 'थेट दर्शन प्रक्षेपण व घंटानाद' 
    },
    { 
      id: 'seva', 
      label: t.nav_seva, 
      icon: '🕯️', 
      desc: lang === 'EN' ? 'Book aarti, pooja, prasad & volunteering' : 'आरती, अभिषेक पूजा व प्रसाद नोंदणी' 
    },
    { 
      id: 'events', 
      label: t.nav_events, 
      icon: '🗓️', 
      desc: lang === 'EN' ? 'Festival calendar & RSVP presence' : 'उत्सव वेळापत्रक व उपस्थिती नोंदणी' 
    },
    { 
      id: 'gallery', 
      label: t.nav_gallery, 
      icon: '🖼️', 
      desc: lang === 'EN' ? 'HD photos, holy darshan & videos' : 'पवित्र दर्शन छायाचित्रे व व्हिडिओ' 
    },
    { 
      id: 'testimonials', 
      label: t.nav_testimonials, 
      icon: '💬', 
      desc: lang === 'EN' ? 'Devotee divine experiences & stories' : 'भाविकांचे दैवी अनुभव व साक्ष' 
    },
    { 
      id: 'donation', 
      label: t.nav_donation, 
      icon: '💝', 
      desc: lang === 'EN' ? '80G tax exempt trust funds & donations' : '८०जी करसवलत देणगी व मंदिर निधी' 
    },
    { 
      id: 'social', 
      label: t.nav_social, 
      icon: '🤝', 
      desc: lang === 'EN' ? 'Tribal food distribution, clinics & school' : 'अन्नछत्र, मोफत दवाखाना व शिक्षण सेवा' 
    },
    { 
      id: 'news', 
      label: t.nav_news, 
      icon: '📢', 
      desc: lang === 'EN' ? 'Official temple board circulars & press' : 'मंडळाची अधिकृत परिपत्रके व सूचना' 
    },
    { 
      id: 'profile', 
      label: t.nav_profile, 
      icon: '🕉️', 
      desc: lang === 'EN' ? 'Prayer streak, badges & personalized hub' : 'भक्ती सातत्य गुण व सुवर्ण पदके' 
    },
    { 
      id: 'admin', 
      label: t.nav_admin, 
      icon: '⚙️', 
      desc: lang === 'EN' ? 'Trustee control station (PIN: 1234)' : 'विश्वस्त मंडळ नियंत्रण कक्ष (PIN: 1234)' 
    }
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-gold/20 bg-brand-maroon/95 backdrop-blur-md text-white shadow-xl transition-all">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        
        {/* Top utility bar */}
        <div className="flex h-9 sm:h-10 items-center justify-between border-b border-white/10 text-xs text-brand-saffron gap-2">
          {/* Sacred chant greeting */}
          <div className="flex items-center gap-1.5 font-medium min-w-0 truncate">
            <Sparkles className="h-3.5 w-3.5 shrink-0 animate-pulse text-brand-gold" />
            <span className="hidden md:inline truncate text-[11px] lg:text-xs">
              {lang === 'EN' ? '|| Hail Shree Ishwatichi Mata (श्री ईश्वटीची)! Welcome to Official Digital Portal ||' : '|| श्री ईश्वटीची माता की जय! अधिकृत डिजिटल कक्षात स्वागत ||'}
            </span>
            <span className="md:hidden text-[10px] sm:text-xs font-serif font-bold text-brand-gold truncate">
              || श्री ईश्वटीची प्रसन्न ||
            </span>
          </div>

          {/* Quick utility controls row */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Background Aarti Live Audio Indicator */}
            {isAudioPlaying ? (
              <button
                onClick={() => aartiAudioEngine.silence()}
                className="flex items-center gap-1 text-brand-gold bg-amber-950/80 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-brand-gold/50 hover:bg-amber-900/80 transition-all cursor-pointer shadow-sm animate-pulse text-[10px]"
                title={lang === 'EN' ? "Aarti playing • Click to silence" : "आरती सुरू आहे • शांत करा"}
              >
                <Volume2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-saffron" />
                <span className="font-serif font-bold text-[9px] sm:text-[10px] hidden xs:inline">
                  {lang === 'EN' ? "Aarti" : "आरती"}
                </span>
                <span className="text-[8px] sm:text-[9px] bg-brand-gold text-brand-maroon px-1 rounded font-bold">
                  {lang === 'EN' ? "Mute" : "म्यूट"}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  aartiAudioEngine.playAarti();
                  if (activeTab !== 'home') setActiveTab('home');
                }}
                className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-300 hover:text-brand-gold bg-black/40 hover:bg-black/60 px-2 py-0.5 rounded-full border border-white/10 hover:border-brand-gold/30 transition-all cursor-pointer"
                title={lang === 'EN' ? "Play Marathi Aarti" : "मराठी आरती सुरू करा"}
              >
                <VolumeX className="h-3 w-3 text-gray-400" />
                <span className="font-serif hidden sm:inline">{lang === 'EN' ? "Aarti: Off" : "आरती"}</span>
              </button>
            )}

            {/* Devotion Streak Indicator */}
            <button 
              onClick={() => handleSelectTab('profile')} 
              className="flex items-center gap-1 rounded-full bg-black/40 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs text-brand-gold border border-brand-gold/30 hover:border-brand-saffron transition-all"
              title="Your Prayer Streak counter! Click to claim rewards"
            >
              <Award className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-saffron" />
              <span className="hidden sm:inline">{lang === 'EN' ? 'Streak' : 'सातत्य'}: </span>
              <strong>{streak} 🔥</strong>
            </button>

            {/* Language Selection */}
            <button
              onClick={handleLangToggle}
              className="flex items-center gap-1 text-brand-gold bg-black/40 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-brand-gold/20 hover:bg-black/60 transition-all cursor-pointer text-[9px] sm:text-[10px] font-bold"
              title={lang === 'EN' ? 'मराठीमध्ये बदला' : 'Switch to English'}
            >
              <Languages className="h-3 w-3 text-brand-gold" />
              <span>{lang === 'EN' ? 'MR' : 'EN'}</span>
            </button>

            {/* Google Authentication */}
            {user ? (
              <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 sm:py-1 rounded-full border border-brand-gold/20">
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&q=80'}
                  alt={user.displayName || 'Devotee'}
                  className="h-4 w-4 sm:h-4.5 sm:w-4.5 rounded-full border border-brand-gold/40"
                  referrerPolicy="no-referrer"
                />
                <span className="hidden lg:inline text-[9px] text-white max-w-[80px] truncate">
                  {user.displayName?.split(' ')[0] || 'Devotee'}
                </span>
                <button
                  onClick={onLogout}
                  className="text-[8px] font-bold text-brand-saffron hover:underline cursor-pointer border-l border-white/20 pl-1"
                >
                  {lang === 'EN' ? 'Out' : 'बाहेर'}
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-1 bg-brand-gold hover:bg-brand-saffron text-brand-maroon px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-serif font-black text-[9px] sm:text-[10px] shadow border border-brand-gold/50 cursor-pointer"
              >
                🔐 <span className="hidden xs:inline">{lang === 'EN' ? 'Login' : 'लॉगिन'}</span>
              </button>
            )}

            {/* Night usage toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1 hover:text-brand-gold transition-colors text-brand-saffron"
              title={darkMode ? 'Switch to Bright Theme' : 'Switch to Sunset Night view'}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-gold" /> : <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            </button>
          </div>
        </div>

        {/* Primary Navbar Brand Row */}
        <div className="flex items-center justify-between py-3 sm:py-4 lg:py-5 gap-3 sm:gap-4">
          
          {/* Logo & Temple Title */}
          <div 
            className="flex items-center gap-3 sm:gap-4 lg:gap-5 cursor-pointer group min-w-0" 
            onClick={() => handleSelectTab('home')}
          >
            <div className="relative shrink-0 flex items-center justify-center">
              <SiteLogo 
                size="lg" 
                className="group-hover:scale-105 transition-transform drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]" 
                priority 
              />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h1 className="font-serif text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-normal text-brand-gold drop-shadow-md leading-normal">
                  श्री ईश्वटीची माता मंडळ
                </h1>
                <span className="text-[9px] sm:text-xs bg-brand-red text-brand-gold border border-brand-gold/40 px-2 py-0.5 rounded font-serif font-bold shrink-0 shadow-sm">
                  देवस्थान
                </span>
              </div>
              <p className="text-[11px] sm:text-xs md:text-sm lg:text-base text-brand-saffron tracking-wide font-sans font-medium mt-0.5 sm:mt-1 leading-relaxed">
                {lang === 'EN' ? 'Shree Ishwatichi Mata Devasthan Trust • Estd 1976' : t.subtitle}
              </p>
            </div>
          </div>

          {/* Interactive Sacred Temple Bells in Header with physical & visual feedback */}
          <div className="hidden lg:flex items-center gap-3.5 px-3.5 py-1.5 bg-black/35 rounded-2xl border border-brand-gold/30 backdrop-blur-sm shadow-inner">
            <TempleBell 
              size="md" 
              variant="deep" 
              label={lang === 'EN' ? 'Ring Ghanta' : 'घंटानाद'} 
            />
            <div className="text-left text-[11px] leading-tight select-none">
              <span className="font-serif font-bold text-brand-gold block">
                {lang === 'EN' ? 'Temple Bell' : 'पवित्र घंटी'}
              </span>
              <span className="text-gray-300 text-[10px] font-sans">
                {lang === 'EN' ? 'Click to ring' : 'नाद स्पर्श करा'}
              </span>
            </div>
          </div>

          {/* Right Controls: Quick Action & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Interactive Header Temple Bell for mobile & small screens */}
            <div className="lg:hidden flex items-center pr-1">
              <TempleBell 
                size="sm" 
                showChain={false} 
                variant="high"
                label={lang === 'EN' ? 'Bell' : 'घंटी'} 
              />
            </div>

            {/* Quick Live Darshan CTA on tablet/desktop */}
            <button
              onClick={() => handleSelectTab('darshan')}
              className="hidden sm:flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-brand-red to-red-700 hover:from-red-700 hover:to-brand-red border border-brand-gold/50 text-white font-serif font-bold text-xs lg:text-sm shadow-lg cursor-pointer transition-all hover:scale-105"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-ping" />
              <span>{lang === 'EN' ? 'Live Darshan' : 'थेट दर्शन'}</span>
            </button>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-black/40 hover:bg-black/60 border border-brand-gold/30 text-brand-gold transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Desktop / Tablet Horizontal Navigation Tabs */}
        <div className="hidden md:block border-t border-brand-gold/15 pt-2.5 pb-2.5">
          <nav className="flex items-center justify-center flex-wrap gap-1.5 lg:gap-2 xl:gap-2.5 py-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  className={`px-3 py-1.5 lg:px-3.5 lg:py-2 text-xs lg:text-sm font-semibold rounded-lg transition-all duration-300 pointer cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-brand-red text-white border-b-2 border-brand-gold shadow-lg shadow-black/40 scale-105'
                      : 'hover:bg-white/10 text-white/90 hover:text-white'
                  }`}
                >
                  <span className="text-sm lg:text-base">{item.icon}</span>
                  <span className="font-sans leading-normal whitespace-nowrap">{item.label}</span>
                  {item.id === 'darshan' && (
                    <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-ping ml-0.5" />
                  )}
                  {item.id === 'admin' && (
                    <span className="ml-1 text-[9px] px-1.5 py-0.5 bg-brand-saffron text-brand-maroon rounded font-mono font-bold">
                      Pin
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Horizontal Fast Swipe Tabs (visible on < md) */}
        <div className="md:hidden relative -mx-3 px-3 overflow-x-auto pb-2.5 pt-0.5 scrollbar-none">
          <div className="flex items-center gap-1.5 w-max">
            {navItems.slice(0, 6).map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-full whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-gold text-brand-maroon shadow-md border border-brand-gold'
                      : 'bg-black/35 text-white/85 border border-white/10'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="px-2.5 py-1 text-[11px] font-bold rounded-full whitespace-nowrap bg-brand-red/80 text-white border border-brand-gold/40 cursor-pointer"
            >
              + {lang === 'EN' ? 'All Portals' : 'सर्व विभाग'}
            </button>
          </div>
        </div>

      </div>

      {/* Full-Featured Mobile Slide-over Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop blur overlay */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content sheet */}
          <div className="relative bg-gradient-to-b from-[#3A0303] via-[#240101] to-black border-t-2 border-brand-gold rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-up">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-2.5">
                <SiteLogo size="xs" />
                <div>
                  <h3 className="font-serif font-black text-sm text-brand-gold">
                    श्री ईश्वटीची माता डिजिटल दालन
                  </h3>
                  <p className="text-[10px] text-brand-saffron font-mono">
                    {lang === 'EN' ? 'Select a sacred portal to navigate' : 'हव्या असलेल्या मुख्य विभागात प्रवेश करा'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Actions Bar inside mobile drawer */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-brand-maroon/60 border-b border-white/5">
              <button
                onClick={() => handleSelectTab('darshan')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-black/50 border border-brand-gold/30 hover:border-brand-gold cursor-pointer"
              >
                <span className="text-base">🎥</span>
                <span className="text-[10px] font-bold text-brand-gold mt-0.5">{lang === 'EN' ? 'Live Stream' : 'थेट दर्शन'}</span>
              </button>
              <button
                onClick={() => handleSelectTab('seva')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-black/50 border border-brand-gold/30 hover:border-brand-gold cursor-pointer"
              >
                <span className="text-base">🕯️</span>
                <span className="text-[10px] font-bold text-brand-gold mt-0.5">{lang === 'EN' ? 'Book Seva' : 'सेवा नोंदणी'}</span>
              </button>
              <button
                onClick={() => handleSelectTab('donation')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-black/50 border border-brand-gold/30 hover:border-brand-gold cursor-pointer"
              >
                <span className="text-base">💝</span>
                <span className="text-[10px] font-bold text-brand-gold mt-0.5">{lang === 'EN' ? 'Donate 80G' : 'देणगी निधी'}</span>
              </button>
            </div>

            {/* Scrollable List of All Portals */}
            <div className="overflow-y-auto p-3 space-y-1.5 flex-1 divide-y divide-white/5 font-sans">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-brand-red text-white border border-brand-gold font-bold shadow'
                        : 'hover:bg-white/10 text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0 p-1.5 bg-black/40 rounded-lg border border-white/5">
                        {item.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif text-sm font-bold truncate">{item.label}</span>
                          {item.id === 'darshan' && (
                            <span className="h-2 w-2 rounded-full bg-green-400 animate-ping shrink-0" />
                          )}
                          {item.id === 'admin' && (
                            <span className="text-[8px] bg-brand-gold text-brand-maroon px-1 rounded font-bold font-mono">
                              PIN
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-brand-gold shrink-0 opacity-70" />
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer with Helpline & Copyright */}
            <div className="p-3 bg-black/70 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400">
              <span className="text-brand-saffron">📞 Helpline: 0251-2489999</span>
              <button 
                onClick={() => handleSelectTab('contact')}
                className="text-brand-gold underline font-bold"
              >
                {lang === 'EN' ? 'Find Location' : 'पत्ता पहा'}
              </button>
            </div>

          </div>
        </div>
      )}

    </header>
  );
};

export default Header;
