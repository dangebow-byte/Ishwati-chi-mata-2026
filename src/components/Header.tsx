/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sunset, Languages, Moon, Sun, ShieldAlert, Award, Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../data';

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

  const handleLangToggle = () => {
    setLang(lang === 'EN' ? 'MR' : 'EN');
  };

  const navItems = [
    { id: 'home', label: t.nav_home },
    { id: 'about', label: t.nav_about },
    { id: 'darshan', label: t.nav_darshan },
    { id: 'seva', label: t.nav_seva },
    { id: 'events', label: t.nav_events },
    { id: 'gallery', label: t.nav_gallery },
    { id: 'testimonials', label: t.nav_testimonials },
    { id: 'donation', label: t.nav_donation },
    { id: 'social', label: t.nav_social },
    { id: 'news', label: t.nav_news },
    { id: 'profile', label: t.nav_profile },
    { id: 'admin', label: t.nav_admin }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-gold/20 bg-brand-maroon/95 backdrop-blur-md text-white shadow-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top bar with decorative elements and language controls */}
        <div className="flex h-10 items-center justify-between border-b border-white/10 text-xs text-brand-saffron">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-brand-gold" />
            <span className="hidden sm:inline">
              {lang === 'EN' ? '|| Hail Shree Ishwatichi Mata (श्री ईश्वटीची)! Welcome to Official Digital Portal ||' : '|| श्री ईश्वटीची माता की जय! अधिकृत डिजिटल कक्षात स्वागत ||'}
            </span>
            <span className="sm:hidden">
              || श्री ईश्वटीची माता प्रसन्न ||
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Devotion Streak Indicator */}
            <button 
              onClick={() => setActiveTab('profile')} 
              className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-xs text-brand-gold border border-brand-gold/30 hover:border-brand-saffron transition-all"
              title="Your Prayer Streak counter! Click to claim rewards"
            >
              <Award className="h-3.5 w-3.5 text-brand-saffron animate-bounce" />
              <span>{lang === 'EN' ? 'Prayer Streak' : 'भक्ती सातत्य'}: <strong>{streak} 🔥</strong></span>
            </button>

             {/* Language Selection */}
            <button
              onClick={handleLangToggle}
              className="flex items-center gap-1.5 text-brand-gold bg-black/30 px-3 py-1 rounded-full border border-brand-gold/20 hover:bg-black/50 transition-all cursor-pointer"
              title={lang === 'EN' ? 'मराठीमध्ये भाषा बदला' : 'Switch to English'}
            >
              <Languages className="h-3.5 w-3.5 text-brand-gold" />
              <span className="font-bold tracking-wide text-[10px]">
                {lang === 'EN' ? 'ENGLISH (EN)' : 'मराठी (MR)'}
              </span>
            </button>

            {/* Google Authentication */}
            {user ? (
              <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1 rounded-full border border-brand-gold/20">
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&q=80'}
                  alt={user.displayName || 'Devotee'}
                  className="h-4.5 w-4.5 rounded-full border border-brand-gold/40"
                  referrerPolicy="no-referrer"
                />
                <span className="hidden sm:inline text-[9px] text-white">
                  {user.displayName?.split(' ')[0] || 'Devotee'}
                </span>
                {user.email === 'dangebow@gmail.com' && (
                  <span className="text-[8px] bg-red-600 text-white font-black px-1 rounded uppercase tracking-wider">Admin</span>
                )}
                <button
                  onClick={onLogout}
                  className="text-[8px] font-bold text-brand-saffron hover:underline cursor-pointer border-l border-white/20 pl-1.5"
                >
                  {lang === 'EN' ? 'Out' : 'बाहेर'}
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-1 bg-brand-gold hover:bg-brand-saffron text-brand-maroon px-2.5 py-1 rounded-full font-serif font-black text-[10px] shadow border border-brand-gold/50 cursor-pointer"
              >
                🔐 {lang === 'EN' ? 'Devotee Login' : 'लॉगिन करा'}
              </button>
            )}

            {/* Night usage toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1 hover:text-brand-gold transition-colors text-brand-saffron"
              title={darkMode ? 'Switch to Bright Theme' : 'Switch to Sunset Night view'}
            >
              {darkMode ? <Sun className="h-4 w-4 text-brand-gold" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Primary Navbar */}
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3 md:gap-0">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="relative rounded-full border-2 border-brand-gold bg-gradient-to-br from-amber-700 via-brand-maroon to-black h-14 w-14 sm:h-16 sm:w-16 shadow-lg flex items-center justify-center overflow-hidden group shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="श्री ईश्वटीची माता मंडळ"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Sunset className="h-8 w-8 text-brand-gold animate-pulse" />
              )}
              {/* Sacred overlay insignia */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-0.5 pointer-events-none">
                <span className="text-[8px] sm:text-[9px] font-serif font-black text-brand-gold tracking-tight leading-none bg-black/80 px-1.5 py-0.5 rounded-sm border border-brand-gold/40 shadow">
                  श्री ईश्वटीची
                </span>
              </div>
              <div className="absolute -top-0.5 -right-0.5 bg-brand-saffron text-[8px] font-black text-black px-1.5 py-0.2 rounded-full border border-brand-gold shadow">
                ५०वे
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-2xl font-black tracking-tight text-brand-gold drop-shadow-md">
                  श्री ईश्वटीची माता मंडळ
                </h1>
                <span className="text-[9px] bg-brand-red text-brand-gold border border-brand-gold/40 px-1.5 py-0.5 rounded font-serif font-bold hidden sm:inline-block">
                  देवस्थान
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-brand-saffron tracking-widest font-mono uppercase">
                {lang === 'EN' ? 'Shree Ishwatichi Mata Devasthan Trust • Estd 1976' : t.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Access Mobile Toggle Alert */}
          <div className="md:hidden flex items-center gap-2">
            <span className="text-[11px] text-brand-gold/80 italic font-medium">Select a spiritual portal:</span>
          </div>
        </div>

        {/* Categories Navigation Bar */}
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <nav className="flex items-center gap-1 min-w-max md:justify-center py-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all duration-300 pointer cursor-pointer ${
                    isActive
                      ? 'bg-brand-red text-white border-b-2 border-brand-gold shadow-lg shadow-black/30'
                      : 'hover:bg-white/10 text-white/80 hover:text-white'
                  }`}
                >
                  {item.label}
                  {item.id === 'darshan' && (
                    <span className="ml-1 inline-block h-2 w-2 rounded-full bg-green-500 animate-ping" />
                  )}
                  {item.id === 'admin' && (
                    <span className="ml-1 text-[9px] px-1 bg-brand-saffron text-brand-maroon rounded border border-brand-gold/60">
                      Pin
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
