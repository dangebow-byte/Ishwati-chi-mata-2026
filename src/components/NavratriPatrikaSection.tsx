/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  Printer, 
  Search, 
  Flame, 
  Award, 
  Users, 
  CheckCircle2, 
  MapPin,
  ChevronRight,
  Filter
} from 'lucide-react';
import { 
  NAVRATRI_PATRIKA_2026, 
  MANDAL_PATRIKA_METADATA, 
  NavratriPatrikaDay 
} from '../data/navratriPatrika2026';
import { NAVRATRI_9_COLORS, getActiveNavratriTheme } from '../utils/navratriColorTheme';
import { PatrikaMetadata } from '../services/karyakramPatrikaService';

interface NavratriPatrikaSectionProps {
  lang: 'EN' | 'MR';
  patrikaDays?: NavratriPatrikaDay[];
  metadata?: PatrikaMetadata;
}

export const NavratriPatrikaSection: React.FC<NavratriPatrikaSectionProps> = ({ 
  lang,
  patrikaDays,
  metadata
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showColorChart, setShowColorChart] = useState<boolean>(true);

  const currentDays = patrikaDays && patrikaDays.length > 0 ? patrikaDays : NAVRATRI_PATRIKA_2026;
  const currentMeta = metadata || MANDAL_PATRIKA_METADATA;

  // Current date in YYYY-MM-DD (both local and UTC for reliable worldwide and IST timezone matching)
  const { todayLocal, todayUtc } = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return {
      todayLocal: `${y}-${m}-${d}`,
      todayUtc: now.toISOString().split('T')[0]
    };
  }, []);

  // Active daily festival color theme (matching My Profile dashboard)
  const activeColorTheme = useMemo(() => {
    return getActiveNavratriTheme('auto');
  }, []);

  const filteredDays = useMemo(() => {
    return currentDays.filter((day) => {
      const matchesFilter = 
        activeFilter === 'all' || 
        day.category === activeFilter;

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        day.dayNameMr.toLowerCase().includes(q) ||
        day.dayNameEn.toLowerCase().includes(q) ||
        day.dateStrMr.toLowerCase().includes(q) ||
        day.dateStrEn.toLowerCase().includes(q) ||
        day.events.some(e => 
          e.titleMr.toLowerCase().includes(q) || 
          e.titleEn.toLowerCase().includes(q) ||
          (e.venueMr && e.venueMr.toLowerCase().includes(q))
        );

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchTerm]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <section 
      id="navratri-patrika-2026"
      className="w-full bg-gradient-to-b from-[#2a0303]/95 via-black/90 to-[#220202]/95 border-2 border-brand-gold/40 rounded-3xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-300"
    >
      {/* Decorative Traditional Temple Background Glows */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-radial from-brand-gold/15 via-transparent to-transparent pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-radial from-brand-red/20 via-transparent to-transparent pointer-events-none -z-0" />

      {/* Top Header Card mimicking the Authentic Published Patrika */}
      <div className="relative z-10 border-b-2 border-brand-gold/30 pb-6 mb-6 text-center space-y-3.5">
        
        {/* Top Badges Bar: Year 53, Est. 1974 & Holy Invocation */}
        <div className="flex flex-wrap items-center justify-between gap-2 max-w-4xl mx-auto px-1 sm:px-4">
          
          {/* 53rd Year Emblem Badge */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-900 to-indigo-950 border-2 border-blue-400 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-lg">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-blue-200">
              {lang === 'EN' ? 'Year' : 'वर्ष'}
            </span>
            <span className="font-sans font-black text-sm sm:text-base text-yellow-300">
              {lang === 'EN' ? currentMeta.yearLabelEn : currentMeta.yearLabelMr}
            </span>
          </div>

          {/* Sacred Devasthan Invocation */}
          <div className="flex items-center justify-center gap-2 select-none">
            <span className="text-sm sm:text-lg text-brand-gold animate-pulse">🔱</span>
            <span className="font-sans font-black text-brand-gold text-xs sm:text-base tracking-widest drop-shadow-[0_0_10px_rgba(212,175,55,0.7)]">
              {lang === 'EN' ? currentMeta.invocationEn : currentMeta.invocationMr}
            </span>
            <span className="text-sm sm:text-lg text-brand-gold animate-pulse">🔱</span>
          </div>

          {/* Establishment Year 1974 Badge */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-red-950 to-brand-maroon border border-brand-gold/40 text-brand-gold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow">
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
              {lang === 'EN' ? 'Est.' : 'स्थापना'}
            </span>
            <span className="font-sans font-bold text-xs sm:text-sm text-brand-gold">
              {lang === 'EN' ? currentMeta.establishmentYearEn : currentMeta.establishmentYearMr}
            </span>
          </div>

        </div>

        {/* Official Mandal Title */}
        <div className="space-y-1 pt-1">
          <h2 className="font-sans font-black text-2xl sm:text-4xl lg:text-5xl text-white tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
            {lang === 'EN' ? currentMeta.mandalNameEn : currentMeta.mandalNameMr}
          </h2>
          <div className="h-0.5 w-32 sm:w-48 mx-auto bg-gradient-to-r from-transparent via-brand-gold to-transparent" />
        </div>

        {/* Traditional Ornamental Ribbon Title */}
        <div className="pt-1 flex justify-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 rounded-2xl bg-gradient-to-r from-brand-maroon via-red-900 to-brand-maroon border-2 border-brand-gold shadow-[0_0_24px_rgba(212,175,55,0.6)]">
            <span className="text-base sm:text-xl">🪔</span>
            <h3 className="font-sans font-black text-sm sm:text-xl md:text-2xl text-yellow-300 uppercase tracking-wider drop-shadow-sm">
              {lang === 'EN' ? currentMeta.titleEn : currentMeta.titleMr}
            </h3>
            <span className="text-base sm:text-xl">🪔</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-200 font-medium max-w-3xl mx-auto pt-1 font-sans">
          {lang === 'EN'
            ? 'Official Festival Calendar for Shardiya Navratri 2026 • 10 October to 25 October 2026'
            : 'शारदीय नवरात्रौत्सव २०२६ चे अधिकृत सविस्तर कार्यक्रम वेळापत्रक • १० ऑक्टोबर ते २५ ऑक्टोबर २०२६'}
        </p>

        {/* Navratri 2026 – 9 Days, 9 Colours, 9 Blessings Feature Showcase */}
        <div className="pt-3">
          <div className="bg-gradient-to-r from-[#3D0A0A] via-[#1A0303] to-[#3D0A0A] border-2 border-brand-gold/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-brand-gold/25 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🪷</span>
                <div className="text-left">
                  <h4 className="font-sans font-black text-sm sm:text-base md:text-lg text-yellow-300 tracking-wide">
                    {lang === 'EN' ? 'Navratri 2026 – 9 Days, 9 Colours, 9 Blessings' : 'नवरात्र २०२६ – ९ दिवस, ९ पावन रंग, ९ वरदान'}
                  </h4>
                  <p className="text-[11px] text-gray-300 font-sans">
                    {lang === 'EN' 
                      ? 'Official Sharad Navratri 2026 color palette with Goddess forms and spiritual significance' 
                      : 'शारदीय नवरात्र २०२६ अधिकृत रंग, कुलस्वामिनी देवीचे रूप आणि आध्यात्मिक महत्त्व'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowColorChart(!showColorChart)}
                className="px-3 py-1 rounded-xl bg-black/60 hover:bg-black/90 text-brand-gold border border-brand-gold/40 text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                {showColorChart 
                  ? (lang === 'EN' ? 'Hide Chart ✕' : 'तक्ता लपवा ✕') 
                  : (lang === 'EN' ? 'View 9 Colors Chart ▼' : '९ रंग तक्ता पहा ▼')}
              </button>
            </div>

            {showColorChart && (
              <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5 pt-1">
                {NAVRATRI_9_COLORS.map((col) => {
                  const isTodayColor = col.dateStr === todayLocal || col.dateStr === todayUtc || col.dayIndex === activeColorTheme.dayIndex;
                  return (
                    <div
                      key={col.dayIndex}
                      className={`p-2.5 rounded-xl border flex flex-col items-center text-center space-y-1.5 transition-all shadow-md relative ${
                        isTodayColor
                          ? 'ring-2 ring-brand-gold shadow-[0_0_20px_rgba(255,215,0,0.6)] scale-105 border-brand-gold z-10'
                          : 'hover:scale-105 opacity-90 hover:opacity-100'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${col.hexPrimary}EE, ${col.hexSecondary}88)`,
                        borderColor: isTodayColor ? '#FFD700' : col.accentGold
                      }}
                    >
                      <div className="flex items-center gap-1 flex-wrap justify-center">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-black/70 text-brand-gold">
                          Day {col.dayIndex}
                        </span>
                        {isTodayColor && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-brand-gold text-brand-maroon shadow font-sans animate-pulse">
                            ✨ {lang === 'EN' ? 'Today' : 'आजचा'}
                          </span>
                        )}
                      </div>

                      {/* Swatch circle */}
                      <div
                        className={`w-6 h-6 rounded-full border-2 border-white/60 shadow-md shrink-0 flex items-center justify-center ${
                          isTodayColor ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-black' : ''
                        }`}
                        style={{ backgroundColor: col.swatchHex }}
                        title={col.colorNameEn}
                      />

                      <strong className="text-xs font-bold text-white font-sans leading-tight">
                        {lang === 'EN' ? col.colorNameEn : col.colorNameMr.split(' ')[0]}
                      </strong>

                      <span className="text-[10px] text-brand-gold font-sans font-semibold leading-tight">
                        {lang === 'EN' ? col.goddessFormEn : col.goddessFormMr}
                      </span>

                      <span className="text-[9px] text-gray-300 font-sans italic leading-tight line-clamp-2 pt-0.5">
                        {lang === 'EN' ? col.descriptionEn : col.descriptionMr.split('(')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action Bar: Filters, Search, Print */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-brand-gold text-brand-maroon shadow-md border border-brand-gold'
                  : 'bg-black/50 text-gray-300 hover:text-white border border-white/10'
              }`}
            >
              {lang === 'EN' ? 'All (13 Events)' : 'सर्व (१३ दिवस)'}
            </button>
            <button
              onClick={() => setActiveFilter('pooja')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === 'pooja'
                  ? 'bg-brand-gold text-brand-maroon shadow-md border border-brand-gold'
                  : 'bg-black/50 text-gray-300 hover:text-white border border-white/10'
              }`}
            >
              {lang === 'EN' ? 'Aagman & Pooja' : 'आगमन व पूजा'}
            </button>
            <button
              onClick={() => setActiveFilter('devotional')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === 'devotional'
                  ? 'bg-brand-gold text-brand-maroon shadow-md border border-brand-gold'
                  : 'bg-black/50 text-gray-300 hover:text-white border border-white/10'
              }`}
            >
              {lang === 'EN' ? 'Bhajan, Aarti & Gondhal' : 'भजन, आरती व गोंधळ'}
            </button>
            <button
              onClick={() => setActiveFilter('cultural')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === 'cultural'
                  ? 'bg-brand-gold text-brand-maroon shadow-md border border-brand-gold'
                  : 'bg-black/50 text-gray-300 hover:text-white border border-white/10'
              }`}
            >
              {lang === 'EN' ? 'Cultural & Contests' : 'सांस्कृतिक व स्पर्धा'}
            </button>
            <button
              onClick={() => setActiveFilter('havan')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === 'havan'
                  ? 'bg-brand-gold text-brand-maroon shadow-md border border-brand-gold'
                  : 'bg-black/50 text-gray-300 hover:text-white border border-white/10'
              }`}
            >
              {lang === 'EN' ? 'Hom-Havan & Bhandara' : 'होमहवन व महाप्रसाद'}
            </button>
            <button
              onClick={() => setActiveFilter('visarjan')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === 'visarjan'
                  ? 'bg-brand-gold text-brand-maroon shadow-md border border-brand-gold'
                  : 'bg-black/50 text-gray-300 hover:text-white border border-white/10'
              }`}
            >
              {lang === 'EN' ? 'Visarjan Procession' : 'विसर्जन मिरवणूक'}
            </button>
            <button
              onClick={() => setActiveFilter('auction')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === 'auction'
                  ? 'bg-brand-gold text-brand-maroon shadow-md border border-brand-gold'
                  : 'bg-black/50 text-gray-300 hover:text-white border border-white/10'
              }`}
            >
              {lang === 'EN' ? 'Saree Auction' : 'साडी लिलाव'}
            </button>
          </div>

          {/* Search + Print Button */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div className="relative flex-1 md:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={lang === 'EN' ? 'Search event, date...' : 'कार्यक्रम किंवा दिनांक शोधा...'}
                className="w-full pl-8 pr-3 py-1.5 bg-black/60 border border-brand-gold/30 rounded-xl text-white text-xs placeholder-gray-400 focus:outline-none focus:border-brand-saffron"
              />
            </div>
            
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-brand-maroon hover:bg-brand-red text-brand-gold border border-brand-gold/40 flex items-center gap-1.5 font-sans font-bold text-xs shadow transition-all cursor-pointer shrink-0 active:scale-95"
              title={lang === 'EN' ? 'Print or Save Patrika' : 'पत्रिका प्रिंट करा / सेव्ह करा'}
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{lang === 'EN' ? 'Print Patrika' : 'पत्रिका प्रिंट करा'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* DESKTOP & TABLET VIEW: Authentic Traditional Patrika Table matching Pamphlet layout */}
      <div className="hidden md:block w-full overflow-x-auto rounded-2xl border-2 border-brand-gold/40 shadow-2xl bg-black/70">
        <table className="w-full text-left border-collapse min-w-[760px]">
          
          {/* Table Header: वार | दिनांक | वेळ | कार्यक्रम */}
          <thead className="bg-[#1b4488] text-white border-b-2 border-brand-gold/50 font-sans text-sm uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4 w-[14%] border-r border-white/15 text-center font-black">
                {lang === 'EN' ? 'Day (वार)' : 'वार'}
              </th>
              <th className="py-3.5 px-4 w-[16%] border-r border-white/15 text-center font-black">
                {lang === 'EN' ? 'Date (दिनांक)' : 'दिनांक'}
              </th>
              <th className="py-3.5 px-4 w-[24%] border-r border-white/15 text-center font-black">
                {lang === 'EN' ? 'Time (वेळ)' : 'वेळ'}
              </th>
              <th className="py-3.5 px-5 w-[46%] font-black">
                {lang === 'EN' ? 'Sacred Program (कार्यक्रम)' : 'कार्यक्रम'}
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-white/10 text-xs font-sans">
            {filteredDays.map((day, idx) => {
              const isToday = day.dateIso === todayLocal || day.dateIso === todayUtc;
              const matchingColor = NAVRATRI_9_COLORS.find(c => c.dateStr === day.dateIso);
              const isColorActiveToday = matchingColor && (
                matchingColor.dateStr === todayLocal ||
                matchingColor.dateStr === todayUtc ||
                matchingColor.dayIndex === activeColorTheme.dayIndex
              );

              let rowClass = 'transition-colors ';
              if (isToday || isColorActiveToday) {
                rowClass += 'bg-red-950/70 border-l-4 border-l-brand-gold ';
              } else if (idx % 2 === 0) {
                rowClass += 'bg-black/50 hover:bg-brand-maroon/25 ';
              } else {
                rowClass += 'bg-brand-maroon/15 hover:bg-brand-maroon/30 ';
              }

              return (
                <tr key={day.id} className={rowClass}>
                  
                  {/* Column 1: वार (Day) */}
                  <td className="py-3.5 px-4 border-r border-white/10 text-center align-middle font-sans">
                    <span className="font-bold text-sm text-white block">
                      {lang === 'EN' ? day.dayNameEn : day.dayNameMr}
                    </span>
                    <span className="text-[10px] text-brand-gold font-mono uppercase">
                      Day {day.dayIndex}
                    </span>
                  </td>

                  {/* Column 2: दिनांक (Date) & Sacred Color */}
                  <td className="py-3.5 px-4 border-r border-white/10 text-center align-middle font-sans">
                    <span className="text-sm font-bold text-brand-saffron block">
                      {lang === 'EN' ? day.dateStrEn : day.dateStrMr}
                    </span>
                    {matchingColor && (
                      <div 
                        className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 border border-brand-gold/30 text-[10px]"
                        title={lang === 'EN' ? `${matchingColor.colorNameEn} (${matchingColor.goddessFormEn}): ${matchingColor.descriptionEn}` : `${matchingColor.colorNameMr} (${matchingColor.goddessFormMr}): ${matchingColor.descriptionMr}`}
                      >
                        <span 
                          className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm shrink-0" 
                          style={{ backgroundColor: matchingColor.swatchHex }} 
                        />
                        <span className="font-bold text-yellow-300 font-sans">
                          {lang === 'EN' ? matchingColor.colorNameEn : matchingColor.colorNameMr.split(' ')[0]}
                        </span>
                      </div>
                    )}
                    {isToday && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-red-600 text-white font-mono text-[9px] font-bold animate-pulse">
                        TODAY LIVE
                      </span>
                    )}
                  </td>

                  {/* Column 3: वेळ (Time) */}
                  <td className="py-3.5 px-4 border-r border-white/10 text-center align-middle font-sans">
                    {day.events.length > 1 ? (
                      <div className="space-y-1.5">
                        {day.events.map((evt, eIdx) => (
                          <div key={eIdx} className="text-xs font-semibold text-gray-200">
                            <span className="font-mono text-brand-gold bg-black/50 px-2 py-0.5 rounded border border-white/10 inline-block">
                              {lang === 'EN' ? (evt.timeEn || day.defaultTimeEn) : (evt.timeMr || day.defaultTimeMr)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="font-mono text-xs font-bold text-brand-gold bg-black/50 px-2.5 py-1 rounded border border-brand-gold/25 inline-block">
                        {lang === 'EN' ? day.defaultTimeEn : day.defaultTimeMr}
                      </span>
                    )}
                  </td>

                  {/* Column 4: कार्यक्रम (Program Details) */}
                  <td className="py-3.5 px-5 align-middle font-sans">
                    <div className="space-y-2">
                      {day.events.map((evt, eIdx) => (
                        <div key={eIdx} className="flex items-start gap-2">
                          <span className="text-brand-gold mt-0.5 text-xs">🪔</span>
                          <div className="flex-1 space-y-0.5">
                            <span className={`text-xs sm:text-sm font-bold leading-snug block ${
                              evt.highlight ? 'text-brand-gold drop-shadow-sm' : 'text-white'
                            }`}>
                              {lang === 'EN' ? evt.titleEn : evt.titleMr}
                            </span>
                            {evt.venueMr && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-brand-saffron bg-black/60 px-2 py-0.5 rounded border border-brand-gold/30">
                                <MapPin className="h-3 w-3 text-brand-gold shrink-0" />
                                <span>{lang === 'EN' ? (evt.venueEn || evt.venueMr) : evt.venueMr}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      {/* MOBILE CARD VIEW: Responsive Elegant Cards for Small Screens */}
      <div className="md:hidden space-y-3.5">
        {filteredDays.map((day) => {
          const isToday = day.dateIso === todayLocal || day.dateIso === todayUtc;
          const matchingColor = NAVRATRI_9_COLORS.find(c => c.dateStr === day.dateIso);
          const isColorActiveToday = matchingColor && (
            matchingColor.dateStr === todayLocal ||
            matchingColor.dateStr === todayUtc ||
            matchingColor.dayIndex === activeColorTheme.dayIndex
          );

          return (
            <div 
              key={day.id}
              className={`rounded-2xl border-2 p-3.5 sm:p-4 space-y-3 transition-all ${
                isToday || isColorActiveToday
                  ? 'bg-gradient-to-r from-red-950 via-brand-maroon to-black border-brand-gold shadow-xl ring-1 ring-brand-gold/50'
                  : 'bg-black/65 border-brand-gold/30 hover:border-brand-gold/60 shadow-lg'
              }`}
            >
              {/* Card Header: Day, Date, Tag */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`h-7 w-7 rounded-full flex items-center justify-center font-sans font-black text-xs ${
                    isToday || isColorActiveToday
                      ? 'bg-brand-gold text-brand-maroon ring-2 ring-brand-gold/60 shadow'
                      : 'bg-brand-gold/15 text-brand-gold border border-brand-gold/40'
                  }`}>
                    {day.dayIndex}
                  </span>
                  <div>
                    <h4 className="font-sans font-bold text-white text-sm">
                      {lang === 'EN' ? day.dayNameEn : day.dayNameMr}
                    </h4>
                    <span className="text-[11px] font-sans font-medium text-brand-saffron block">
                      {lang === 'EN' ? day.dateStrEn : day.dateStrMr}
                    </span>
                    {matchingColor && (
                      <div className={`mt-1 flex items-center gap-1.5 ${
                        isColorActiveToday
                          ? 'bg-brand-gold/20 border border-brand-gold/60 px-2 py-0.5 rounded-lg ring-1 ring-brand-gold/40 inline-flex'
                          : ''
                      }`}>
                        <span 
                          className="w-2.5 h-2.5 rounded-full border border-white/60 shadow-sm shrink-0" 
                          style={{ backgroundColor: matchingColor.swatchHex }} 
                        />
                        <span className="text-[10px] font-bold text-yellow-300 font-sans">
                          {lang === 'EN' ? `${matchingColor.colorNameEn} (${matchingColor.goddessFormEn})` : `${matchingColor.colorNameMr.split(' ')[0]} (${matchingColor.goddessFormMr})`}
                        </span>
                        {isColorActiveToday && (
                          <span className="text-[9px] bg-brand-gold text-brand-maroon font-black px-1.5 py-0.2 rounded font-mono ml-1 shadow">
                            ✨ {lang === 'EN' ? 'TODAY COLOR' : 'आजचा पावन रंग'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-brand-maroon/70 text-brand-gold border border-brand-gold/30">
                    {lang === 'EN' ? day.categoryLabelEn : day.categoryLabelMr}
                  </span>
                  {(isToday || isColorActiveToday) && (
                    <span className="block mt-1 text-[9px] font-mono font-bold text-yellow-300 animate-pulse">
                      ● LIVE TODAY
                    </span>
                  )}
                </div>
              </div>

              {/* Events in Day */}
              <div className="space-y-2.5 font-sans pt-0.5">
                {day.events.map((evt, eIdx) => (
                  <div key={eIdx} className="bg-brand-maroon/20 p-2.5 rounded-xl border border-brand-gold/15 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-brand-gold font-bold">
                      <Clock className="h-3 w-3 text-brand-saffron shrink-0" />
                      <span>{lang === 'EN' ? (evt.timeEn || day.defaultTimeEn) : (evt.timeMr || day.defaultTimeMr)}</span>
                    </div>
                    <p className={`text-xs font-bold leading-relaxed ${
                      evt.highlight ? 'text-brand-gold' : 'text-white'
                    }`}>
                      {lang === 'EN' ? evt.titleEn : evt.titleMr}
                    </p>
                    {evt.venueMr && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-brand-saffron bg-black/60 px-2 py-0.5 rounded border border-brand-gold/30 mt-1">
                        <MapPin className="h-3 w-3 text-brand-gold shrink-0" />
                        <span>{lang === 'EN' ? (evt.venueEn || evt.venueMr) : evt.venueMr}</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* Special Notice Banner (विशेष सूचना) from Authentic Printed Pamphlet */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-brand-maroon/80 via-black to-brand-maroon/80 border-2 border-brand-gold/40 shadow-xl space-y-1.5 text-center font-sans">
        <h4 className="font-bold text-brand-gold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2">
          <span>🔔</span>
          <span>{lang === 'EN' ? 'Special Notice' : 'विशेष सूचना'}</span>
          <span>🔔</span>
        </h4>
        <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-4xl mx-auto">
          {lang === 'EN' ? currentMeta.specialNoticeEn : currentMeta.specialNoticeMr}
        </p>
      </div>

      {/* Executive Committee Officers Desk (कार्यकारी मंडळ पदाधिकारी) */}
      <div className="mt-6 pt-5 border-t border-brand-gold/25 font-sans">
        <h5 className="text-xs text-brand-gold uppercase tracking-widest text-center font-bold mb-4">
          ॥ {lang === 'EN' ? 'Executive Committee Officers' : 'कार्यकारी मंडळ पदाधिकारी'} ॥
        </h5>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
          {currentMeta.officers.map((officer, idx) => (
            <div 
              key={idx} 
              className="bg-black/50 border border-brand-gold/20 rounded-xl p-3 sm:p-3.5 space-y-1 hover:border-brand-gold/60 transition-colors shadow-sm"
            >
              <span className="text-[10px] text-brand-saffron uppercase font-mono tracking-wider font-bold block">
                {lang === 'EN' ? officer.titleEn : officer.titleMr}
              </span>
              <p className="text-xs sm:text-sm font-bold text-white truncate">
                {lang === 'EN' ? officer.nameEn : officer.nameMr}
              </p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
