/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Moon, 
  Flame, 
  Share2, 
  Calendar, 
  Clock, 
  Coffee, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  ChevronRight,
  HeartHandshake
} from 'lucide-react';
import deviMainJpg from '../assets/devotional/devi-mata-main.jpeg';
import { shareToWhatsApp } from '../utils/shareUtils';

interface KojagiriPournimaBannerProps {
  lang: 'EN' | 'MR';
  deviImageUrl?: string;
  onNavigateToSeva?: () => void;
  onNavigateToDarshan?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const KojagiriPournimaBanner: React.FC<KojagiriPournimaBannerProps> = ({
  lang,
  deviImageUrl,
  onNavigateToSeva,
  onNavigateToDarshan,
  onDismiss,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [showFloatingPill, setShowFloatingPill] = useState(false);

  // Time remaining to Kojagiri Pournima Aarti & Prasad (targeted to 2026-10-24 19:30:00 IST)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 12,
    minutes: 45,
    seconds: 30
  });

  const bannerRef = useRef<HTMLDivElement | null>(null);

  // Fallback to original sacred Devi Mata image
  const resolvedDeviImage = deviImageUrl && deviImageUrl.trim().length > 5 
    ? deviImageUrl 
    : deviMainJpg;

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Play auspicious celestial temple bell chime on interaction
  const handlePlayChime = () => {
    if (isSoundMuted || typeof window === 'undefined') return;
    try {
      // @ts-ignore
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // Sacred bell (A5)
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, ctx.currentTime); // Lower overtone (A4)

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc2.start();
      osc.stop(ctx.currentTime + 1.4);
      osc2.stop(ctx.currentTime + 1.4);
    } catch {
      // Silent AudioContext fallback
    }
  };

  const handleDismiss = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      setShowFloatingPill(true);
      if (onDismiss) onDismiss();
    }, 350);
  };

  const handleReopen = () => {
    setShowFloatingPill(false);
    setIsVisible(true);
    setIsFadingOut(false);
    handlePlayChime();
    setTimeout(() => {
      bannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleShare = () => {
    const shareTitle = lang === 'EN'
      ? 'Shree Ishwatichi Mata 53rd Year - Sacred Kojagiri Pournima Mahotsav 2026'
      : 'श्री इश्वटीची माता ५३ वा शारदीय महोत्सव • पावन कोजागरी पौर्णिमा सोहळा २०२६';
    
    const shareText = lang === 'EN'
      ? '🌕 Wishing you and your family blessed Kojagiri Pournima! Experience divine full moon darshan of Shree Ishwatichi Mata, Evening Maha Aarti, and sacred Saffron Masala Milk Prasad distribution.'
      : '🌕 आपणास व आपल्या परिवारास कोजागरी पौर्णिमेच्या मंगलमय शुभेच्छा! श्री इश्वटीची मातेचे पावन चंद्रदर्शन, महाआरती आणि केशरयुक्त मसाला दूध महाप्रसाद सोहळा.';

    shareToWhatsApp({
      title: shareTitle,
      text: shareText,
      url: window.location.origin
    });
  };

  return (
    <>
      {/* Floating Reopen Pill when Dismissed */}
      {showFloatingPill && (
        <aside
          aria-label="Kojagiri Pournima Banner Reopen Button"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 animate-bounce"
        >
          <button
            type="button"
            onClick={handleReopen}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-950 via-brand-maroon to-amber-900 border-2 border-brand-gold text-brand-gold hover:text-white hover:scale-105 shadow-[0_0_25px_rgba(212,175,55,0.8)] backdrop-blur-md transition-all text-xs sm:text-sm font-black cursor-pointer"
          >
            <Moon className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
            <span>{lang === 'EN' ? '🌕 Kojagiri Pournima Banner' : '🌕 कोजागरी पौर्णिमा उत्सव'}</span>
          </button>
        </aside>
      )}

      {/* Main Flashing Kojagiri Banner */}
      {isVisible && (
        <section
          ref={bannerRef}
          aria-label="Kojagiri Pournima Sacred Festival Banner"
          className={`w-full max-w-7xl mx-auto px-2 sm:px-4 pt-3 pb-2 transition-all duration-300 ${
            isFadingOut ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
          } ${className}`}
        >
          <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-3 border-brand-gold animate-banner-flash shadow-[0_0_40px_rgba(212,175,55,0.55)] bg-gradient-to-r from-[#1e0734] via-[#3b0626] to-[#140428] text-white select-none">
            
            {/* Top Flashing Beacon Bar */}
            <div className="w-full bg-gradient-to-r from-amber-600 via-brand-gold to-amber-600 py-1 px-3 sm:px-6 flex items-center justify-between text-brand-maroon font-black text-[11px] sm:text-xs tracking-wider shadow-inner">
              <div className="flex items-center gap-2 truncate">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-700"></span>
                </span>
                <span className="truncate">
                  {lang === 'EN'
                    ? '🔴 LIVE FESTIVAL SPECIAL • SACRED KOJAGIRI POURNIMA MAHOTSAV 2026'
                    : '🔴 थेट पावन उत्सव • श्री इश्वटीची माता कोजागरी पौर्णिमा महोत्सव २०२६'}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSoundMuted(prev => !prev)}
                  title={isSoundMuted ? (lang === 'EN' ? 'Unmute bell chime' : 'घंटा नाद सुरू करा') : (lang === 'EN' ? 'Mute bell chime' : 'घंटा नाद म्यूट करा')}
                  className="p-1 rounded hover:bg-black/20 text-brand-maroon transition-colors"
                >
                  {isSoundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  title={lang === 'EN' ? 'Dismiss banner' : 'बॅनर बंद करा'}
                  className="p-1 rounded hover:bg-black/20 text-brand-maroon font-black transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Ambient Background Moonlight and Saffron Glow */}
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Main Content Grid: Original Devi Mata Idol (Left) + Sacred Kojagiri Details & Actions (Right) */}
            <div className="relative z-10 p-4 sm:p-6 lg:p-7 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
              
              {/* ORIGINAL DEVI MATA IMAGE DISPLAY - Sacred Arch Frame */}
              <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center justify-center">
                <div 
                  onClick={() => {
                    handlePlayChime();
                    setIsFullViewOpen(true);
                  }}
                  className="group relative cursor-pointer rounded-2xl p-2 bg-gradient-to-b from-brand-maroon via-black/85 to-stone-950 border-2 sm:border-3 border-brand-gold ring-2 ring-brand-gold/40 shadow-[0_0_25px_rgba(255,215,0,0.5)] transition-transform duration-300 hover:scale-105 active:scale-95"
                  title={lang === 'EN' ? 'Click to view Original Devi Mata Sacred Idol in HD' : 'श्री इश्वटीची मातेचे मूळ दिव्य दर्शन मोठ्या आकारात पाहण्यासाठी क्लिक करा'}
                >
                  {/* Sacred Top Arch with Crown Motif */}
                  <div className="px-2 py-1 mb-1.5 rounded-lg bg-black/60 border border-brand-gold/40 text-center flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-brand-gold animate-pulse" />
                    <span className="text-[10px] sm:text-[11px] font-black text-brand-gold tracking-wide uppercase">
                      {lang === 'EN' ? 'Original Devi Idol' : 'मूळ स्वयंभू दर्शन मूर्ती'}
                    </span>
                    <Sparkles className="w-3 h-3 text-brand-gold animate-pulse" />
                  </div>

                  {/* Original Image Container with Golden Halo Glow */}
                  <div className="relative w-36 h-48 sm:w-44 sm:h-60 md:w-48 md:h-64 rounded-xl overflow-hidden bg-black/80 flex items-center justify-center shadow-inner">
                    <img
                      src={resolvedDeviImage}
                      alt="Shree Ishwatichi Mata Original Sacred Idol"
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient Overlay at Bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

                    {/* Flickering Diya in Corner */}
                    <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 border border-brand-gold/60 text-[10px] font-bold text-amber-300 backdrop-blur-sm">
                      <Flame className="w-3 h-3 text-orange-400 animate-pulse fill-orange-400" />
                      <span>{lang === 'EN' ? 'Darshan' : 'दर्शन'}</span>
                    </div>

                    {/* Click Zoom Icon Overlay */}
                    <div className="absolute top-2 right-2 z-20 p-1 rounded-md bg-black/70 border border-brand-gold/50 text-brand-gold opacity-90 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Sacred Temple Year Badge */}
                  <div className="mt-1.5 text-center text-[10px] sm:text-[11px] font-bold text-brand-gold flex items-center justify-center gap-1">
                    <span>स्थापना १९७४ • ५३ वे वर्ष</span>
                  </div>
                </div>
              </div>

              {/* KOJAGIRI POURNIMA DETAILS & ACTION MATRIX */}
              <div className="md:col-span-8 lg:col-span-9 space-y-3.5 sm:space-y-4 text-center md:text-left">
                
                {/* Header Tag and Moon Icon */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black shadow-md">
                    <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
                    <span>{lang === 'EN' ? 'Ashwin Shuddha Pournima' : 'आश्विन शुद्ध पौर्णिमा • कोजागरी सोहळा'}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/50 text-purple-200 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                    <span>{lang === 'EN' ? '53rd Year Mahotsav 2026' : '५३ वा शारदीय नवरात्रौत्सव २०२६'}</span>
                  </div>
                </div>

                {/* Main Titles */}
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-brand-gold tracking-tight drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)]">
                    {lang === 'EN'
                      ? 'Shree Ishwatichi Mata Kojagiri Pournima Mahotsav'
                      : 'श्री इश्वटीची माता पावन कोजागरी पौर्णिमा महोत्सव'}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-200 font-medium leading-relaxed">
                    {lang === 'EN'
                      ? '॥ Ko Jagarti? Experience divine full moon darshan of Shree Ishwatichi Mata, Evening Maha Aarti, and sacred Saffron Masala Milk distribution under open moonlight. ॥'
                      : '॥ को जागर्ति? अमृतमय चंद्रकिरणांत श्री इश्वटीची मातेचे सुवर्ण दर्शन, संध्या महाआरती व रात्री केशरयुक्त मसाला दूध महाप्रसाद सोहळा. ॥'}
                  </p>
                </div>

                {/* Event Schedule Highlights (3 Responsive Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  {/* Evening Maha Aarti */}
                  <div className="p-2.5 rounded-xl bg-black/45 border border-brand-gold/30 flex items-center gap-2.5 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                      <Flame className="w-4 h-4 fill-current" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-brand-gold">{lang === 'EN' ? 'Maha Aarti' : 'संध्या महाआरती'}</div>
                      <div className="text-gray-300 text-[11px]">{lang === 'EN' ? '07:30 PM Onwards' : 'सायंकाळी ०७:३० वाजता'}</div>
                    </div>
                  </div>

                  {/* Saffron Masala Milk Prasad */}
                  <div className="p-2.5 rounded-xl bg-black/45 border border-brand-gold/30 flex items-center gap-2.5 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-300 shrink-0">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-brand-gold">{lang === 'EN' ? 'Masala Milk Prasad' : 'मसाला दूध महाप्रसाद'}</div>
                      <div className="text-gray-300 text-[11px]">{lang === 'EN' ? '10:00 PM to 12:00 AM' : 'रात्रौ १०:०० ते १२:००'}</div>
                    </div>
                  </div>

                  {/* Jagran & Devotional Chants */}
                  <div className="p-2.5 rounded-xl bg-black/45 border border-brand-gold/30 flex items-center gap-2.5 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                      <Moon className="w-4 h-4 fill-current" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-brand-gold">{lang === 'EN' ? 'Kojagiri Jagran' : 'कोजागरी जागरण'}</div>
                      <div className="text-gray-300 text-[11px]">{lang === 'EN' ? 'Devotional Bhajans' : 'अखंड भजन व नामस्मरण'}</div>
                    </div>
                  </div>
                </div>

                {/* Quick Action Matrix Buttons */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2">
                  {/* Book Seva & Prasad Button */}
                  {onNavigateToSeva && (
                    <button
                      type="button"
                      onClick={() => {
                        handlePlayChime();
                        onNavigateToSeva();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-maroon via-brand-red to-brand-maroon border-2 border-brand-gold text-brand-gold hover:text-white hover:border-white transition-all text-xs sm:text-sm font-black shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Coffee className="w-4 h-4 text-brand-gold" />
                      <span>{lang === 'EN' ? 'Book Prasad / Seva' : 'मसाला दूध / पूजा सेवा नोंदवा'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Live Darshan Button */}
                  {onNavigateToDarshan && (
                    <button
                      type="button"
                      onClick={() => {
                        handlePlayChime();
                        onNavigateToDarshan();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-black/60 hover:bg-black/90 border border-brand-gold/60 text-white hover:text-brand-gold transition-all text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Flame className="w-4 h-4 text-brand-saffron" />
                      <span>{lang === 'EN' ? 'Live Darshan' : 'थेट दर्शन'}</span>
                    </button>
                  )}

                  {/* WhatsApp Share Button */}
                  <button
                    type="button"
                    onClick={handleShare}
                    className="px-3.5 py-2.5 rounded-xl bg-green-950/80 hover:bg-green-600 text-green-300 hover:text-white border border-green-500/50 transition-all text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer"
                    title={lang === 'EN' ? 'Share Kojagiri Wishes on WhatsApp' : 'व्हॉट्सॲपवर कोजागरी शुभेच्छा पाठवा'}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{lang === 'EN' ? 'Share Wishes' : 'शुभेच्छा शेअर करा'}</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        </section>
      )}

      {/* High-Definition Sanctum Idol Zoom Modal */}
      {isFullViewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md animate-fade-in"
          onClick={() => setIsFullViewOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-2xl bg-stone-950 border-3 border-brand-gold rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3 sm:p-4 bg-brand-maroon border-b border-brand-gold/30 flex items-center justify-between text-brand-gold">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-saffron animate-pulse" />
                <h4 className="font-black text-sm sm:text-base">
                  {lang === 'EN'
                    ? 'Shree Ishwatichi Mata Consecrated Sanctum Idol'
                    : 'श्री इश्वटीची माता अधिकृत स्वयंभू दर्शन मूर्ती (स्थापना १९७४)'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsFullViewOpen(false)}
                className="p-1 rounded-lg bg-black/40 hover:bg-red-600 text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Display */}
            <div className="relative w-full overflow-auto p-2 bg-black flex items-center justify-center">
              <img
                src={resolvedDeviImage}
                alt="Shree Ishwatichi Mata Sanctum Idol"
                className="w-auto h-auto max-h-[75vh] object-contain rounded-xl drop-shadow-[0_0_35px_rgba(255,215,0,0.5)]"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-stone-900 border-t border-brand-gold/20 flex items-center justify-between text-xs text-gray-300">
              <span className="text-brand-gold font-bold">
                {lang === 'EN' ? '॥ जय देवी जय देवी जय ईश्वटी माते ॥' : '॥ जय देवी जय देवी जय ईश्वटी माते ॥'}
              </span>
              <button
                type="button"
                onClick={() => setIsFullViewOpen(false)}
                className="px-3 py-1 rounded-lg bg-brand-gold text-brand-maroon font-bold hover:bg-amber-400 transition-colors"
              >
                {lang === 'EN' ? 'Close' : 'बंद करा'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
