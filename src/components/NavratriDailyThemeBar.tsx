/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Palette, ChevronDown, ChevronUp, RotateCcw, Info } from 'lucide-react';
import {
  NavratriDayTheme,
  detectCurrentNavratriDay,
  applyNavratriTheme,
  getAllNavratriThemes,
  getNavratriThemeForDay
} from '../services/navratriThemeService';

interface NavratriDailyThemeBarProps {
  lang: 'EN' | 'MR';
  className?: string;
}

export const NavratriDailyThemeBar: React.FC<NavratriDailyThemeBarProps> = ({
  lang,
  className = ''
}) => {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [currentTheme, setCurrentTheme] = useState<NavratriDayTheme>(getNavratriThemeForDay(1));
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showSignificance, setShowSignificance] = useState<boolean>(false);

  const allThemes = getAllNavratriThemes();

  // Initialize and apply automated daily theme rotation on mount
  useEffect(() => {
    const day = detectCurrentNavratriDay();
    setActiveDay(day);
    const theme = applyNavratriTheme(day);
    setCurrentTheme(theme);

    // Listen to custom theme change events
    const handleThemeChange = (e: any) => {
      if (e.detail?.theme) {
        setCurrentTheme(e.detail.theme);
        setActiveDay(e.detail.theme.dayNumber);
      }
    };
    window.addEventListener('navratriThemeChanged', handleThemeChange);
    return () => window.removeEventListener('navratriThemeChanged', handleThemeChange);
  }, []);

  const handleSelectDay = (dayNum: number) => {
    setActiveDay(dayNum);
    const theme = applyNavratriTheme(dayNum);
    setCurrentTheme(theme);
  };

  const handleResetToAuto = () => {
    try {
      localStorage.removeItem('ishwatichi_navratri_active_theme_day');
    } catch {}
    const autoDay = detectCurrentNavratriDay();
    setActiveDay(autoDay);
    const theme = applyNavratriTheme(autoDay);
    setCurrentTheme(theme);
  };

  return (
    <div className={`w-full transition-all duration-300 font-sans ${className}`}>
      <div className="bg-gradient-to-r from-black/85 via-zinc-950/90 to-black/85 backdrop-blur-md border-y border-brand-gold/30 px-3 py-1.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          
          {/* Active Sacred Day and Color Badge */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-3.5 w-3.5 items-center justify-center shrink-0">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: currentTheme.colorHex }}
              />
              <span
                className="relative inline-flex rounded-full h-3 w-3 border border-white/60 shadow-sm"
                style={{ backgroundColor: currentTheme.colorHex }}
              />
            </span>

            <div className="flex items-center gap-1.5 truncate">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-gold px-1.5 py-0.5 rounded bg-brand-gold/15 border border-brand-gold/30">
                {lang === 'EN' ? 'Daily Sacred Color' : 'आजचा पावन रंग'}
              </span>

              <span className="font-bold text-white text-xs truncate">
                {lang === 'EN' ? currentTheme.tithiEnglish : currentTheme.tithiMarathi}:
              </span>

              <span
                className="font-black text-xs px-2 py-0.5 rounded-full border shadow-sm truncate"
                style={{
                  backgroundColor: `${currentTheme.colorHex}25`,
                  borderColor: currentTheme.colorHex,
                  color: currentTheme.colorHex === '#F8FAFC' ? '#FBBF24' : currentTheme.colorHex
                }}
              >
                {lang === 'EN' ? currentTheme.colorNameEnglish : currentTheme.colorNameMarathi}
              </span>

              <span className="text-gray-400 text-[11px] hidden md:inline truncate">
                • {lang === 'EN' ? currentTheme.goddessEnglish : currentTheme.goddessMarathi}
              </span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            {/* Significance Info Toggle */}
            <button
              type="button"
              onClick={() => setShowSignificance(!showSignificance)}
              className="p-1 rounded-md text-gray-400 hover:text-brand-gold hover:bg-white/5 cursor-pointer transition-colors"
              title={lang === 'EN' ? 'Sacred Color Significance' : 'रंगाचे धार्मिक महत्त्व'}
              aria-label="Info"
            >
              <Info className="h-3.5 w-3.5" />
            </button>

            {/* Quick Reset to Today */}
            <button
              type="button"
              onClick={handleResetToAuto}
              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-300 hover:text-brand-gold border border-white/10 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
              title={lang === 'EN' ? 'Reset to Today’s Automated Theme' : 'आजच्या तारखेनुसार थीम स्वयंचलित करा'}
            >
              <RotateCcw className="h-2.5 w-2.5" />
              <span className="hidden sm:inline">{lang === 'EN' ? 'Auto Today' : 'आजचा दिवस'}</span>
            </button>

            {/* Day 1-9 Theme Selector Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-brand-gold/20 to-brand-saffron/20 hover:from-brand-gold/30 hover:to-brand-saffron/30 text-brand-gold border border-brand-gold/40 text-[11px] font-black flex items-center gap-1 shadow-sm cursor-pointer transition-all"
            >
              <Palette className="h-3 w-3 text-brand-saffron" />
              <span>{lang === 'EN' ? 'Day 1-9 Palette' : '१ ते ९ रंग छटा'}</span>
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Significance Dropdown Card */}
        {showSignificance && (
          <div className="max-w-7xl mx-auto mt-2 p-2.5 rounded-xl bg-black/80 border border-brand-gold/40 text-xs text-gray-200 flex items-start gap-2 animate-fadeIn">
            <Sparkles className="h-4 w-4 text-brand-gold shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-brand-gold">
                {lang === 'EN' ? `${currentTheme.tithiEnglish} (${currentTheme.colorNameEnglish})` : `${currentTheme.tithiMarathi} (${currentTheme.colorNameMarathi})`}:
              </span>
              <p className="text-[11px] text-gray-300">
                {lang === 'EN' ? currentTheme.significanceEnglish : currentTheme.significanceMarathi}
              </p>
            </div>
          </div>
        )}

        {/* Day 1 to 9 (and 10) Interactive Theme Palette Picker Bar */}
        {isExpanded && (
          <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-white/10 animate-fadeIn">
            <div className="flex items-center justify-between mb-1.5 text-[11px]">
              <span className="text-gray-300 font-bold">
                {lang === 'EN'
                  ? 'Select any Navratri Day to preview dynamic CSS theme rotation:'
                  : 'दिवस निवडा आणि संपूर्ण संकेतस्थळाची रंगछटा थेट बदला:'}
              </span>
              <span className="text-[10px] text-brand-gold font-mono">
                {lang === 'EN' ? '9 Sacred Colors Tradition' : '९ दिवसांची पारंपरिक रंगछटा'}
              </span>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-1.5">
              {allThemes.map((th) => {
                const isSelected = th.dayNumber === activeDay;
                return (
                  <button
                    key={th.dayNumber}
                    type="button"
                    onClick={() => handleSelectDay(th.dayNumber)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 relative overflow-hidden group ${
                      isSelected
                        ? 'border-brand-gold bg-white/15 ring-2 ring-brand-gold shadow-lg scale-102'
                        : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/30'
                    }`}
                  >
                    {/* Top color dot + day badge */}
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className="h-3 w-3 rounded-full border border-white/50 shrink-0 shadow-sm"
                        style={{ backgroundColor: th.colorHex }}
                      />
                      <span className="text-[9px] font-mono font-bold text-gray-400 group-hover:text-white">
                        D{th.dayNumber}
                      </span>
                    </div>

                    {/* Color name */}
                    <div className="min-w-0">
                      <span className="text-[10px] font-black block truncate text-white">
                        {lang === 'EN' ? th.colorNameEnglish.split(' ')[0] : th.colorNameMarathi.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-gray-400 block truncate">
                        {lang === 'EN' ? th.goddessEnglish.replace('Maa ', '') : th.goddessMarathi.replace('मां ', '')}
                      </span>
                    </div>

                    {isSelected && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-1"
                        style={{ backgroundColor: th.colorHex }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
