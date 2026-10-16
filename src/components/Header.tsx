/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sunset, Languages, Moon, Sun, ShieldAlert, Award, Sparkles, Volume2, VolumeX, Menu, X, ChevronRight, Video, Heart, Calendar, BookOpen, Users, Phone, Settings, Sparkle, LogOut } from 'lucide-react';
import { TRANSLATIONS } from '../data';
import { SiteLogo } from './SiteLogo';
import { aartiAudioEngine } from '../utils/aartiAudioEngine';
import { NavratriColorTheme } from '../utils/navratriColorTheme';

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
  navratriTheme?: NavratriColorTheme;
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
  logoUrl,
  navratriTheme
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
      icon: '🕉️', 
      desc: lang === 'EN' ? 'Sanctum history & sacred origin' : 'मंदिराचा इतिहास व देवीची आख्यायिका' 
    },
    { 
      id: 'patrika', 
      label: t.nav_patrika || (lang === 'EN' ? 'Karyakram Patrika' : 'कार्यक्रम पत्रिका'), 
      icon: '📜', 
      desc: lang === 'EN' ? 'Official 2026 9-Day Navratri Festival Program' : 'अधिकृत २०२६ नवरात्रौत्सव ९-दिवसीय कार्यक्रम पत्रिका' 
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
      desc: lang === 'EN' ? 'Authorized trustee control station' : 'अधिकृत विश्वस्त नियंत्रण कक्ष' 
    }
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b border-brand-gold/20 bg-brand-maroon/95 backdrop-blur-md text-white shadow-xl transition-all"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top utility bar */}
        <div className="flex h-9 sm:h-10 items-center justify-between border-b border-white/10 text-xs text-brand-saffron gap-1.5 sm:gap-2 overflow-hidden w-full">
          {/* Sacred chant greeting */}
          <div className="flex items-center gap-1 sm:gap-1.5 font-medium min-w-0 truncate">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 animate-pulse text-brand-gold" />
            <span className="hidden lg:inline truncate text-[11px] lg:text-xs">
              {lang === 'EN' ? '|| Hail Shree Ishwatichi Mata (श्री इश्वटीची)! Welcome to Official Digital Portal ||' : '|| श्री इश्वटीची माता की जय! अधिकृत डिजिटल कक्षात स्वागत ||'}
            </span>
            <span className="lg:hidden text-[10px] sm:text-xs font-sans font-bold text-brand-gold truncate">
             || श्री इश्वटीची माता प्रसन्न ||
            </span>
          </div>

          {/* Quick utility controls row */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Background Aarti Live Audio Indicator */}
            {isAudioPlaying ? (
              <button
                onClick={() => aartiAudioEngine.silence()}
                className="flex items-center gap-1 text-brand-gold bg-amber-950/80 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-brand-gold/50 hover:bg-amber-900/80 transition-all cursor-pointer shadow-sm animate-pulse text-[9px] sm:text-[10px]"
                title={lang === 'EN' ? "Aarti playing • Click to silence" : "आरती सुरू आहे • शांत करा"}
              >
                <Volume2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-saffron shrink-0" />
                <span className="font-sans font-bold text-[9px] sm:text-[10px] hidden xs:inline">
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
                className="flex items-center gap-1 text-[9px] sm:text-[10px] text-gray-300 hover:text-brand-gold bg-black/40 hover:bg-black/60 px-1.5 sm:px-2 py-0.5 rounded-full border border-white/10 hover:border-brand-gold/30 transition-all cursor-pointer"
                title={lang === 'EN' ? "Play Marathi Aarti" : "मराठी आरती सुरू करा"}
              >
                <VolumeX className="h-3 w-3 text-gray-400 shrink-0" />
                <span className="font-sans hidden sm:inline">{lang === 'EN' ? "Aarti" : "आरती"}</span>
              </button>
            )}

            {/* Devotion Streak Indicator */}
            <button 
              onClick={() => handleSelectTab('profile')} 
              className="flex items-center gap-1 rounded-full bg-black/40 px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-xs text-brand-gold border border-brand-gold/30 hover:border-brand-saffron transition-all shrink-0 cursor-pointer"
              title="Your Prayer Streak counter! Click to claim rewards"
            >
              <Award className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-saffron shrink-0" />
              <span className="hidden md:inline">{lang === 'EN' ? 'Streak' : 'सातत्य'}: </span>
              <strong>{streak}🔥</strong>
            </button>

            {/* Navratri Sacred Color Day Badge */}
            {navratriTheme && (
              <button 
                onClick={() => handleSelectTab('profile')} 
                className="hidden xs:flex items-center gap-1.5 rounded-full bg-black/40 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-xs text-white border border-brand-gold/30 hover:border-brand-saffron transition-all shrink-0 cursor-pointer"
                title={lang === 'EN' ? `Active Navratri Color: ${navratriTheme.nameEn} (${navratriTheme.colorNameEn}) - Click to manage in Profile` : `नवरात्र रंग: ${navratriTheme.nameMr} (${navratriTheme.colorNameMr}) - बदलण्यासाठी प्रोफाईल उघडा`}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm shrink-0" 
                  style={{ backgroundColor: navratriTheme.swatchHex }} 
                />
                <span className="font-sans font-bold text-brand-gold">
                  {lang === 'EN' ? navratriTheme.colorNameEn.split(' ')[0] : navratriTheme.colorNameMr.split(' ')[0]}
                </span>
              </button>
            )}

            {/* Polished Smooth Transition Language Toggle Switch */}
            <div 
              onClick={handleLangToggle}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLangToggle(); } }}
              className="relative inline-flex items-center h-6 sm:h-7 p-0.5 bg-black/60 hover:bg-black/80 border border-brand-gold/40 hover:border-brand-gold/70 rounded-full cursor-pointer select-none transition-all shadow-inner shrink-0 group active:scale-95"
              title={lang === 'EN' ? 'मराठीमध्ये बदला (Switch to Marathi)' : 'Switch to English (इंग्रजीत बदला)'}
              aria-label={`Language toggle: current ${lang === 'EN' ? 'English' : 'Marathi'}`}
            >
              {/* Sliding Gold Indicator Pill */}
              <div 
                className={`absolute top-0.5 bottom-0.5 w-[30px] sm:w-[36px] rounded-full bg-gradient-to-r from-brand-gold to-brand-saffron shadow-[0_0_10px_rgba(255,153,51,0.5)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  lang === 'MR' ? 'left-[32px] sm:left-[38px]' : 'left-0.5'
                }`} 
              />
              
              <span className={`relative z-10 w-[30px] sm:w-[36px] text-center text-[9px] sm:text-[10px] font-bold transition-colors duration-200 flex items-center justify-center ${
                lang === 'EN' ? 'text-brand-maroon font-black' : 'text-gray-300 group-hover:text-white'
              }`}>
                EN
              </span>
              
              <span className={`relative z-10 w-[30px] sm:w-[36px] text-center text-[9px] sm:text-[10px] font-bold transition-colors duration-200 flex items-center justify-center ${
                lang === 'MR' ? 'text-brand-maroon font-black' : 'text-gray-300 group-hover:text-white'
              }`}>
                मराठी
              </span>
            </div>

            {/* Google Authentication */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-black/60 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-brand-gold/40 shrink-0 shadow-inner">
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&q=80'}
                  alt={user.displayName || 'Devotee'}
                  className="h-4 w-4 sm:h-5 sm:w-5 rounded-full border border-brand-gold/50 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="hidden xl:inline text-[10px] text-brand-gold font-bold max-w-[90px] truncate">
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Devotee'}
                </span>
                <button
                  onClick={onLogout}
                  className="text-[9px] sm:text-[10px] font-bold text-red-300 hover:text-white bg-red-950/70 hover:bg-red-900 px-1.5 sm:px-2 py-0.5 rounded-full border border-red-500/30 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                  title={lang === 'EN' ? 'Sign Out / Logout' : 'लॉगआउट / बाहेर पडा'}
                >
                  <LogOut className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span>{lang === 'EN' ? 'Logout' : 'बाहेर'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-1 bg-brand-gold hover:bg-brand-saffron text-brand-maroon px-2 sm:px-3 py-1 rounded-full font-sans font-extrabold sm:font-black text-[9px] sm:text-[10px] shadow border border-brand-gold/50 cursor-pointer shrink-0 transition-all active:scale-95"
              >
                🔐 <span>{lang === 'EN' ? 'Login' : 'लॉगिन'}</span>
              </button>
            )}

            {/* Night usage toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1 hover:text-brand-gold transition-colors text-brand-saffron shrink-0"
              title={darkMode ? 'Switch to Bright Theme' : 'Switch to Sunset Night view'}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-gold" /> : <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            </button>
          </div>
        </div>

        {/* Primary Navbar Brand Row */}
        <div className="flex items-center justify-between py-2 sm:py-3.5 lg:py-4 gap-2 sm:gap-4 w-full m-0 p-0 px-0">
          
          {/* Logo & Temple Title */}
          <div 
            className="flex items-center gap-2 sm:gap-3.5 lg:gap-4 cursor-pointer group min-w-0 flex-1" 
            onClick={() => handleSelectTab('home')}
          >
            <div className="relative shrink-0 flex items-center justify-center">
              <SiteLogo 
                size="md"
                className="h-10 w-10 xs:h-12 xs:w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20 group-hover:scale-105 transition-transform drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]" 
                priority 
              />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
                <h1 className="font-sans text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold sm:font-black tracking-normal text-brand-gold drop-shadow-md leading-tight">
                  श्री यंग इश्वटी नवरात्रौत्सव मंडळ
                </h1>
                <span className="text-[8px] xs:text-[9px] sm:text-xs bg-brand-red text-brand-gold border border-brand-gold/40 px-1.5 sm:px-2 py-0.5 rounded font-sans font-bold shrink-0 shadow-sm">
                  देवस्थान
                </span>
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-brand-saffron tracking-wide font-sans font-medium mt-0.5 leading-normal truncate">
                {lang === 'EN' ? 'Shree Ishwatichi Mata Devasthan Trust • Estd 1974' : t.subtitle}
              </p>
            </div>
          </div>

          {/* Right Controls: Quick Action & Mobile Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Quick Live Darshan CTA on tablet/desktop */}
            <button
              onClick={() => handleSelectTab('darshan')}
              className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-brand-red to-red-700 hover:from-red-700 hover:to-brand-red border border-brand-gold/50 text-white font-sans font-bold text-xs lg:text-sm shadow-lg cursor-pointer transition-all hover:scale-105"
            >
              <span className="h-2 w-2 rounded-full bg-green-400 animate-ping" />
              <span>{lang === 'EN' ? 'Live Darshan' : 'थेट दर्शन'}</span>
            </button>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-black/40 hover:bg-black/60 border border-brand-gold/30 text-brand-gold transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Desktop / Tablet Horizontal Navigation Tabs */}
        <div className="hidden md:block border-t border-brand-gold/15 pt-2 pb-2 w-full m-0 p-0 px-0">
          <nav className="flex items-center justify-center flex-wrap gap-1 lg:gap-2 py-1 w-full m-0 p-0 px-0">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  className={`px-2.5 py-1.5 lg:px-3.5 lg:py-2 text-xs lg:text-sm font-semibold rounded-lg transition-all duration-200 pointer cursor-pointer flex items-center gap-1.5 ${
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
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Horizontal Fast Swipe Tabs (visible on < md) */}
        <div className="md:hidden relative overflow-x-auto pb-2 pt-1 scrollbar-none w-full m-0 p-0 px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex items-center gap-1.5 w-max m-0 p-0 px-0">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-full whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                    isActive
                      ? 'bg-brand-gold text-brand-maroon shadow-md border border-brand-gold'
                      : 'bg-black/40 text-white/90 border border-white/10 hover:border-brand-gold/40'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.id === 'darshan' && (
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping ml-0.5" />
                  )}
                </button>
              );
            })}
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
                  <h3 className="font-sans font-extrabold sm:font-black text-sm text-brand-gold">
                    श्री इश्वटीची माता डिजिटल दालन
                  </h3>
                  <p className="text-[10px] text-brand-saffron font-mono">
                    {lang === 'EN' ? 'Select a sacred portal to navigate' : 'हव्या असलेल्या मुख्य विभागात प्रवेश करा'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile Drawer Smooth Animated Language Toggle */}
                <div 
                  onClick={handleLangToggle}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLangToggle(); } }}
                  className="relative inline-flex items-center h-6 p-0.5 bg-black/70 border border-brand-gold/40 rounded-full cursor-pointer select-none transition-all shadow-inner shrink-0 group active:scale-95"
                  title={lang === 'EN' ? 'मराठीमध्ये बदला' : 'Switch to English'}
                  aria-label={`Language toggle: current ${lang === 'EN' ? 'English' : 'Marathi'}`}
                >
                  <div 
                    className={`absolute top-0.5 bottom-0.5 w-[28px] rounded-full bg-gradient-to-r from-brand-gold to-brand-saffron shadow-[0_0_8px_rgba(255,153,51,0.5)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                      lang === 'MR' ? 'left-[30px]' : 'left-0.5'
                    }`} 
                  />
                  <span className={`relative z-10 w-[28px] text-center text-[9px] font-bold transition-colors duration-200 flex items-center justify-center ${
                    lang === 'EN' ? 'text-brand-maroon font-black' : 'text-gray-300'
                  }`}>
                    EN
                  </span>
                  <span className={`relative z-10 w-[28px] text-center text-[9px] font-bold transition-colors duration-200 flex items-center justify-center ${
                    lang === 'MR' ? 'text-brand-maroon font-black' : 'text-gray-300'
                  }`}>
                    मराठी
                  </span>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Mobile Drawer Devotee Account & Logout Station */}
            <div className="p-3 bg-black/60 border-b border-brand-gold/20 flex items-center justify-between gap-2.5">
              {user ? (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&q=80'}
                      alt={user.displayName || 'Devotee'}
                      className="h-9 w-9 rounded-full border border-brand-gold/60 shadow shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-sans font-bold text-xs text-white truncate">
                          {user.displayName || 'Devotee'}
                        </span>
                        {user.email === 'dangebow@gmail.com' && (
                          <span className="text-[9px] bg-brand-gold text-brand-maroon px-1.5 py-0.2 rounded font-black">Admin</span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 truncate block">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 shadow active:scale-95 transition-all"
                  >
                    <LogOut className="h-3.5 w-3.5 text-red-300" />
                    <span>{lang === 'EN' ? 'Logout' : 'बाहेर पडा'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow hover:opacity-95 transition-all active:scale-95"
                >
                  <span>🔐 {lang === 'EN' ? 'Devotee / Admin Sign In with Google' : 'Google ने भक्त / विश्वस्त लॉगिन करा'}</span>
                </button>
              )}
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
                          <span className="font-sans text-sm font-bold truncate">{item.label}</span>
                          {item.id === 'darshan' && (
                            <span className="h-2 w-2 rounded-full bg-green-400 animate-ping shrink-0" />
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
