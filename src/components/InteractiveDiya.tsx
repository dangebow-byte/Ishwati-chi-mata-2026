import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface InteractiveDiyaProps {
  lang: 'EN' | 'MR';
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onAddHistoryLog: (log: { id: string; title: string; date: string }) => void;
  variant?: 'sanctum-floating' | 'action-card';
}

/**
 * Interactive 'Light a Diya' component
 * Allows devotees to light a digital sacred lamp (🪔) in front of Shree Ishwatichi Mata,
 * triggering an authentic glowing flame animation, golden particle burst, sacred temple chime,
 * and incrementing their daily devotee streak & check-in milestone.
 */
export const InteractiveDiya: React.FC<InteractiveDiyaProps> = ({
  lang,
  userProfile,
  onUpdateProfile,
  onAddHistoryLog,
  variant = 'sanctum-floating'
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [isLit, setIsLit] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showGlowBurst, setShowGlowBurst] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check if devotee has already lit a diya today
  useEffect(() => {
    const lastDiyaDate = localStorage.getItem('ishwatichi_last_diya_date');
    if (lastDiyaDate === todayStr || userProfile.lastPrayerDate === todayStr) {
      setIsLit(true);
    }
  }, [todayStr, userProfile.lastPrayerDate]);

  // Sacred temple chime sound via Web Audio API (gentle, peaceful bronze temple bell harmonic)
  const playSacredTempleChime = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.setValueAtTime(0.3, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

      // Harmonious bell frequencies: Fundamental + Third + Fifth overtone
      const frequencies = [880, 1174.66, 1760, 2637];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(idx === 0 ? 0.35 : 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (3.0 - idx * 0.4));

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 3.2);
      });
    } catch {
      // Audio autoplay gracefully handled
    }
  };

  const handleLightDiya = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Trigger subtle sacred animation
    setIsAnimating(true);
    setShowGlowBurst(true);
    playSacredTempleChime();

    setTimeout(() => {
      setShowGlowBurst(false);
    }, 1800);

    setTimeout(() => {
      setIsAnimating(false);
    }, 1200);

    // Save persistent diya status
    setIsLit(true);
    try {
      localStorage.setItem('ishwatichi_last_diya_date', todayStr);
    } catch {}

    const alreadyCheckedInToday = userProfile.lastPrayerDate === todayStr;

    if (!alreadyCheckedInToday) {
      const newStreak = userProfile.streakCount + 1;
      const milestones = [...userProfile.milestonesReached];

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

      onUpdateProfile({
        streakCount: newStreak,
        lastPrayerDate: todayStr,
        milestonesReached: milestones
      });

      onAddHistoryLog({
        id: 'diya-' + Date.now(),
        title: `🪔 Lit Divine Sanctum Lamp (Devotee Streak Day ${newStreak})`,
        date: todayStr
      });

      setToastMessage(
        lang === 'EN'
          ? `✨ Divine Lamp Lit! Your devotion streak is now 🔥 ${newStreak} Days!`
          : `✨ दीप प्रज्वलित झाला! आपले भक्ती गुण सातत्य आता 🔥 ${newStreak} दिवस झाले!`
      );
    } else {
      setToastMessage(
        lang === 'EN'
          ? `🪔 May Goddess Shree Ishwatichi Mata bless you with peace and auspiciousness! (Streak: 🔥 ${userProfile.streakCount} Days)`
          : `🪔 श्री इश्वटीची मातेचा कृपाप्रसाद आपल्या पाठीशी सदैव राहो! (भक्ती सातत्य: 🔥 ${userProfile.streakCount} दिवस)`
      );
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // 1. Sanctum Floating Diya Variant (Pinned on the sacred idol frame)
  if (variant === 'sanctum-floating') {
    return (
      <>
        <div 
          onClick={handleLightDiya}
          className="absolute bottom-2 right-2 z-30 flex items-center group cursor-pointer select-none"
          title={
            lang === 'EN' 
              ? (isLit ? 'Sanctum Lamp Lit • Click to offer prayer and renew flame' : 'Click to Light the Sacred Diya and update devotion streak') 
              : (isLit ? 'पवित्र दीप प्रज्वलित आहे • प्रार्थना अर्पण करण्यासाठी पुन्हा क्लिक करा' : 'पवित्र दीप प्रज्वलित करा व भक्ती सातत्य वाढवा')
          }
        >
          {/* Subtle tooltip pill on hover */}
          <div className="hidden sm:flex items-center gap-1 absolute right-full mr-2 px-2.5 py-1 rounded-full bg-black/85 text-[10px] font-sans font-bold text-brand-gold border border-brand-gold/40 shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-sm">
            <Flame className="w-3 h-3 text-brand-saffron animate-pulse" />
            <span>{isLit ? (lang === 'EN' ? 'Lamp Lit • Pray' : 'दीप प्रज्वलित') : (lang === 'EN' ? 'Light Diya' : 'दीप लावा')}</span>
          </div>

          {/* Diya visual container with subtle glow and pulsation */}
          <div className={`relative flex items-center justify-center p-2 rounded-full transition-all duration-300 ${
            isLit 
              ? 'bg-[#3b0909]/80 border border-brand-gold/60 shadow-[0_0_25px_rgba(255,153,51,0.85)] ring-2 ring-brand-gold/30 hover:scale-110 active:scale-95' 
              : 'bg-black/75 border border-brand-gold/40 shadow-md hover:scale-105 active:scale-95 hover:border-brand-gold'
          } ${isAnimating ? 'scale-125 ring-4 ring-amber-400' : ''}`}>

            {/* Radiant glowing rings when animating */}
            {showGlowBurst && (
              <span className="absolute inset-0 rounded-full animate-ping bg-amber-400/50 pointer-events-none" />
            )}

            {/* Lamp Icon / Emoji with realistic flame flicker */}
            <span className={`text-2xl sm:text-3xl leading-none transition-transform duration-300 ${
              isLit ? 'animate-diya-flicker drop-shadow-[0_0_15px_rgba(255,153,51,1)]' : 'opacity-85 grayscale-[30%] hover:grayscale-0'
            }`}>
              🪔
            </span>

            {/* Golden spark overlay */}
            {isLit && (
              <span className="absolute -top-1 -right-1 text-[11px] animate-pulse text-amber-300 select-none pointer-events-none">
                ✨
              </span>
            )}
          </div>
        </div>

        {/* Subtle Bottom Toast Alert for Devotee Streak Feedback */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-maroon via-[#2b0204] to-brand-maroon border-2 border-brand-gold text-white shadow-[0_10px_35px_rgba(0,0,0,0.85)] flex items-center gap-2.5 text-xs sm:text-sm font-sans font-bold animate-slide-up backdrop-blur-md">
            <span className="text-xl shrink-0 animate-bounce">🪔</span>
            <span className="flex-1 text-brand-gold">{toastMessage}</span>
            <span className="text-amber-300 font-mono text-xs shrink-0">🔥 {userProfile.streakCount}D</span>
          </div>
        )}
      </>
    );
  }

  // 2. Action Card Variant (for placement in the Hero Action matrix)
  return (
    <>
      <div 
        onClick={handleLightDiya}
        className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 p-2.5 sm:p-3 cursor-pointer select-none flex items-center justify-between gap-3 shadow-md ${
          isLit
            ? 'bg-gradient-to-r from-[#4A0404]/90 via-[#330203] to-[#4A0404]/90 border-brand-gold/75 shadow-[0_0_20px_rgba(255,153,51,0.35)] hover:border-brand-gold'
            : 'bg-gradient-to-r from-black/70 via-[#260303]/80 to-black/70 border-brand-gold/40 hover:border-brand-gold hover:scale-[1.015]'
        }`}
      >
        {/* Subtle radiant background pulse */}
        <div className="absolute inset-0 bg-radial from-brand-gold/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-2xl shrink-0 transition-transform duration-300 ${
            isLit 
              ? 'bg-brand-maroon border border-brand-gold/70 shadow-[0_0_15px_rgba(255,153,51,0.6)]' 
              : 'bg-black/60 border border-brand-gold/30'
          } ${isAnimating ? 'scale-115' : 'group-hover:scale-105'}`}>
            <span className={isLit ? 'animate-diya-flicker drop-shadow-[0_0_10px_rgba(255,153,51,0.9)]' : 'opacity-80'}>
              🪔
            </span>
            {showGlowBurst && (
              <span className="absolute inset-0 rounded-lg animate-ping bg-amber-400/40 pointer-events-none" />
            )}
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-sans font-bold text-white group-hover:text-brand-gold transition-colors">
                {lang === 'EN' ? 'Light a Diya (दीप प्रज्वलन)' : 'दीप प्रज्वलन करा (Light Diya)'}
              </span>
              {isLit && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-gray-300 line-clamp-1">
              {lang === 'EN'
                ? (isLit ? `Lamp lit today • Streak: 🔥 ${userProfile.streakCount} Days` : 'Click to offer daily light & boost devotion streak')
                : (isLit ? `आजचा दीप प्रज्वलित आहे • भक्ती सातत्य: 🔥 ${userProfile.streakCount} दिवस` : 'मातेसमोर दीप लावा व भक्ती गुण मिळवा')}
            </p>
          </div>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            type="button"
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1 transition-all ${
              isLit
                ? 'bg-amber-500/20 text-brand-gold border border-brand-gold/50 hover:bg-amber-500/30'
                : 'bg-gradient-to-r from-brand-saffron to-brand-gold text-brand-maroon hover:opacity-95 shadow-md active:scale-95'
            }`}
          >
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>{isLit ? (lang === 'EN' ? 'Lit' : 'प्रज्वलित') : (lang === 'EN' ? 'Light' : 'लावा')}</span>
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-maroon via-[#2b0204] to-brand-maroon border-2 border-brand-gold text-white shadow-[0_10px_35px_rgba(0,0,0,0.85)] flex items-center gap-2.5 text-xs sm:text-sm font-sans font-bold animate-slide-up backdrop-blur-md">
          <span className="text-xl shrink-0 animate-bounce">🪔</span>
          <span className="flex-1 text-brand-gold">{toastMessage}</span>
          <span className="text-amber-300 font-mono text-xs shrink-0">🔥 {userProfile.streakCount}D</span>
        </div>
      )}
    </>
  );
};
