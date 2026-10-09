/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, 
  Calendar, 
  Clock, 
  Users, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  ArrowRight,
  Heart
} from 'lucide-react';
import { TempleEvent } from '../types';

interface UpcomingFestivalCountdownProps {
  lang: 'EN' | 'MR';
  events: TempleEvent[];
  onNavigateToEvents?: () => void;
  onNavigateToSeva?: () => void;
  onNavigateToPatrika?: () => void;
  onRsvp?: (eventId: string, devoteeName: string) => void;
}

// Sacred 2026 Navratri Festival Milestones in Indian Standard Time (IST • UTC+05:30)
export const NAVRATRI_2026_SCHEDULE = {
  // 10 October 2026 05:00 PM IST (Devi Agaman Sohala)
  DEVI_AGAMAN_IST: '2026-10-10T17:00:00+05:30',
  // 11 October 2026 12:00 AM IST (Midnight - Ghatasthapana auspicious period start)
  GHATASTHAPANA_MIDNIGHT_IST: '2026-10-11T00:00:00+05:30',
  // 11 October 2026 11:00 AM IST (Ghatasthapana Mahapooja)
  GHATASTHAPANA_POOJA_IST: '2026-10-11T11:00:00+05:30',
  // 25 October 2026 23:59:59 IST (Kojagiri & Saree Auction Mahotsav conclusion)
  FESTIVAL_END_IST: '2026-10-25T23:59:59+05:30',
};

export const UpcomingFestivalCountdown: React.FC<UpcomingFestivalCountdownProps> = ({
  lang,
  events,
  onNavigateToEvents,
  onNavigateToSeva,
  onNavigateToPatrika,
  onRsvp,
}) => {
  // Current time state updating every second
  const [now, setNow] = useState<Date>(() => new Date());
  const [selectedFestivalIndex, setSelectedFestivalIndex] = useState<number>(0);
  const [milestoneTarget, setMilestoneTarget] = useState<'ghatasthapana' | 'agaman'>('ghatasthapana');
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter and sort festivals dynamically
  const upcomingFestivals = useMemo(() => {
    if (!events || events.length === 0) return [];

    const currentTimeMs = now.getTime();

    // Prioritize upcoming festival events
    const sorted = [...events].sort((a, b) => {
      const timeA = new Date(a.date + 'T00:00:00').getTime();
      const timeB = new Date(b.date + 'T00:00:00').getTime();
      return timeA - timeB;
    });

    // Future or ongoing festivals
    const futureOrCurrent = sorted.filter(evt => {
      const evtEndTime = new Date(evt.date + 'T23:59:59').getTime();
      return evtEndTime >= currentTimeMs;
    });

    // If there are future festivals, return those (preferring category 'उत्सव')
    if (futureOrCurrent.length > 0) {
      // Sort festivals to the front
      return futureOrCurrent.sort((a, b) => {
        if (a.category === 'उत्सव' && b.category !== 'उत्सव') return -1;
        if (b.category === 'उत्सव' && a.category !== 'उत्सव') return 1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    }

    // Fallback if all dates in DB have passed: return all sorted so user can still see the upcoming annual celebration
    return sorted;
  }, [events, now]);

  const currentFestival = upcomingFestivals[selectedFestivalIndex] || upcomingFestivals[0] || null;

  const isNavratriFestival = useMemo(() => {
    if (!currentFestival) return false;
    return currentFestival.id === 'ev-2' || (currentFestival.title && currentFestival.title.includes('नवरात्र'));
  }, [currentFestival]);

  // Calculate live countdown to festival
  const countdown = useMemo(() => {
    if (!currentFestival) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false, hasPassed: false };
    }

    let festivalStart: number;
    let festivalEnd: number;

    if (isNavratriFestival) {
      // 11 October 2026 12:00 AM IST for Ghatasthapana (Default)
      // 10 October 2026 05:00 PM IST for Devi Agaman Sohala
      festivalStart = milestoneTarget === 'ghatasthapana'
        ? new Date(NAVRATRI_2026_SCHEDULE.GHATASTHAPANA_MIDNIGHT_IST).getTime()
        : new Date(NAVRATRI_2026_SCHEDULE.DEVI_AGAMAN_IST).getTime();
      festivalEnd = new Date(NAVRATRI_2026_SCHEDULE.FESTIVAL_END_IST).getTime();
    } else {
      festivalStart = new Date(currentFestival.date + 'T04:00:00+05:30').getTime();
      festivalEnd = new Date(currentFestival.date + 'T23:59:59+05:30').getTime();
    }

    const currentMs = now.getTime();

    // Check if festival is ongoing today
    if (currentMs >= festivalStart && currentMs <= festivalEnd) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true, hasPassed: false };
    }

    const diff = festivalStart - currentMs;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false, hasPassed: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isLive: false, hasPassed: false };
  }, [currentFestival, isNavratriFestival, milestoneTarget, now]);

  // Format festival date nicely in Marathi & English
  const formattedDate = useMemo(() => {
    if (!currentFestival) return { en: '', mr: '' };
    if (isNavratriFestival) {
      return {
        en: '10 Oct Devi Agaman (05:00 PM) • 11 Oct Ghatasthapana (12:00 AM IST) to 25 Oct 2026',
        mr: '१० ऑक्टोबर आगमन (सायं ०५:००) • ११ ऑक्टोबर घटस्थापना (१२:०० AM IST) ते २५ ऑक्टोबर २०२६'
      };
    }
    try {
      const d = new Date(currentFestival.date + 'T00:00:00');
      const en = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
      
      const monthsMR = [
        'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
        'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
      ];
      const daysMR = ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
      
      const dayNum = d.getDate();
      const monthStr = monthsMR[d.getMonth()];
      const yearNum = d.getFullYear();
      const weekdayStr = daysMR[d.getDay()];

      return {
        en,
        mr: `${weekdayStr}, ${dayNum} ${monthStr} ${yearNum}`
      };
    } catch {
      return { en: currentFestival.date, mr: currentFestival.date };
    }
  }, [currentFestival, isNavratriFestival]);

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim() || !currentFestival) return;

    if (onRsvp) {
      onRsvp(currentFestival.id, `${rsvpName.trim()} (${rsvpPhone || 'Devotee'})`);
    }

    setRsvpSuccess(true);
    setTimeout(() => {
      setRsvpSuccess(false);
      setIsRsvpModalOpen(false);
      setRsvpName('');
      setRsvpPhone('');
    }, 2000);
  };

  if (!currentFestival) {
    return null;
  }

  return (
    <div className="w-full my-6 sm:my-8 transition-all duration-300">
      
      {/* Outer Card with Royal Maroon & Gold Trim */}
      <div className="relative rounded-3xl bg-gradient-to-br from-brand-maroon/95 via-black/90 to-brand-maroon/95 border-2 border-brand-gold/40 shadow-2xl backdrop-blur-md overflow-hidden p-5 sm:p-7 md:p-8">
        
        {/* Subtle Decorative Golden Aura Background Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-gold/20 via-brand-saffron/20 to-brand-gold/20 rounded-3xl blur-xl -z-10 animate-pulse pointer-events-none" />

        {/* Ambient Top Pattern */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-brand-gold/10 via-brand-saffron/5 to-transparent rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-brand-red/15 via-transparent to-transparent rounded-tr-full pointer-events-none" />

        {/* Header Tag & Multi-Festival Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-brand-gold/20 pb-4 mb-6">
          
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-gold"></span>
            </span>

            <span className="text-xs sm:text-sm font-sans font-black uppercase tracking-wider text-brand-gold flex items-center gap-1.5 bg-brand-gold/15 px-3 py-1 rounded-full border border-brand-gold/40 shadow-sm">
              <Flame className="h-3.5 w-3.5 text-brand-saffron animate-bounce" />
              <span>{lang === 'EN' ? 'Upcoming Major Temple Festival' : 'आगामी प्रमुख पावन महोत्सव'}</span>
            </span>

            {currentFestival.category && (
              <span className="text-[10px] font-mono uppercase bg-black/60 text-brand-saffron px-2.5 py-0.5 rounded-full border border-white/10">
                {currentFestival.category}
              </span>
            )}
          </div>

          {/* Festival Switcher if multiple upcoming */}
          {upcomingFestivals.length > 1 && (
            <div className="flex items-center gap-2 self-end sm:self-auto bg-black/50 px-2.5 py-1 rounded-xl border border-brand-gold/20 text-xs">
              <span className="text-[11px] text-gray-300 font-sans hidden sm:inline">
                {selectedFestivalIndex + 1} / {upcomingFestivals.length}
              </span>
              <button
                onClick={() => setSelectedFestivalIndex((prev) => (prev > 0 ? prev - 1 : upcomingFestivals.length - 1))}
                className="p-1 text-brand-gold hover:text-white hover:bg-white/10 rounded cursor-pointer transition-colors"
                title="Previous Festival"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSelectedFestivalIndex((prev) => (prev < upcomingFestivals.length - 1 ? prev + 1 : 0))}
                className="p-1 text-brand-gold hover:text-white hover:bg-white/10 rounded cursor-pointer transition-colors"
                title="Next Festival"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>

        {/* Festival Main Information & Live Countdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Festival Identity, Timing, Highlights (Span 7) */}
          <div className="col-span-1 lg:col-span-7 space-y-4 text-left">
            
            <div>
              <h3 className="font-sans font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white tracking-normal leading-tight drop-shadow-md">
                {lang === 'EN' ? currentFestival.title : currentFestival.titleMarathi}
              </h3>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2.5 text-xs sm:text-sm text-brand-saffron font-medium">
                <span className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-brand-gold/20">
                  <Calendar className="h-3.5 w-3.5 text-brand-gold" />
                  <span className="font-sans text-white">{lang === 'EN' ? formattedDate.en : formattedDate.mr}</span>
                </span>
                
                {currentFestival.time && (
                  <span className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-brand-gold/20">
                    <Clock className="h-3.5 w-3.5 text-brand-gold" />
                    <span className="font-mono text-gray-200">{currentFestival.time}</span>
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans max-w-2xl line-clamp-3">
              {lang === 'EN' ? currentFestival.description : currentFestival.descriptionMarathi}
            </p>

            {/* Sacred Milestones Interactive Strip for Navratri (Ghatasthapana & Devi Agaman) */}
            {isNavratriFestival && (
              <div className="bg-black/60 border border-brand-gold/35 rounded-2xl p-3 sm:p-4 space-y-2.5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] sm:text-xs font-sans font-black text-brand-gold uppercase tracking-wider flex items-center gap-1.5">
                    <span>🪔</span>
                    <span>{lang === 'EN' ? 'Sacred Navratri Milestones (IST Time)' : 'पावन नवरात्र पर्वकाळ व आगमन सोहळा (IST वेळ)'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-brand-saffron bg-brand-maroon/70 px-2.5 py-0.5 rounded-full border border-brand-gold/30">
                    IST • UTC+05:30
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Milestone 1: Ghatasthapana (Default Target - 11 Oct 12:00 AM IST) */}
                  <button
                    type="button"
                    onClick={() => setMilestoneTarget('ghatasthapana')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      milestoneTarget === 'ghatasthapana'
                        ? 'bg-gradient-to-r from-brand-maroon via-[#5a0505] to-[#3a0202] border-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] ring-1 ring-brand-gold/50'
                        : 'bg-black/40 border-white/10 hover:border-brand-gold/40 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-gold flex items-center gap-1.5">
                        <span>🪔</span>
                        <span>{lang === 'EN' ? 'Ghatasthapana' : 'घटस्थापना (पर्वकाळ)'}</span>
                      </span>
                      {milestoneTarget === 'ghatasthapana' ? (
                        <span className="text-[9px] bg-brand-gold text-brand-maroon px-2 py-0.5 rounded-full font-black uppercase shadow">
                          {lang === 'EN' ? 'Active Timer' : 'उलटी गणना सुरू'}
                        </span>
                      ) : (
                        <span className="text-[9px] text-gray-400 hover:text-white">
                          {lang === 'EN' ? 'Click to view' : 'पाहण्यासाठी क्लिक करा'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-sans font-bold text-white mt-1">
                      {lang === 'EN' ? 'Sunday, 11 Oct • 12:00 AM IST' : 'रविवार, ११ ऑक्टोबर • १२:०० AM IST'}
                    </div>
                    <div className="text-[10px] text-gray-300 leading-tight mt-0.5">
                      {lang === 'EN' ? 'Midnight auspicious start & 11:00 AM Pooja' : 'मध्यरात्र पर्वकाळ प्रारंभ व स. ११:०० वा. पूजा'}
                    </div>
                  </button>

                  {/* Milestone 2: Devi Agaman Sohala (10 Oct 05:00 PM IST) */}
                  <button
                    type="button"
                    onClick={() => setMilestoneTarget('agaman')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      milestoneTarget === 'agaman'
                        ? 'bg-gradient-to-r from-brand-maroon via-[#5a0505] to-[#3a0202] border-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] ring-1 ring-brand-gold/50'
                        : 'bg-black/40 border-white/10 hover:border-brand-gold/40 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-saffron flex items-center gap-1.5">
                        <span>🌺</span>
                        <span>{lang === 'EN' ? 'Devi Agaman Sohala' : 'श्री देवी आगमन सोहळा'}</span>
                      </span>
                      {milestoneTarget === 'agaman' ? (
                        <span className="text-[9px] bg-brand-saffron text-brand-maroon px-2 py-0.5 rounded-full font-black uppercase shadow">
                          {lang === 'EN' ? 'Active Timer' : 'उलटी गणना सुरू'}
                        </span>
                      ) : (
                        <span className="text-[9px] text-gray-400 hover:text-white">
                          {lang === 'EN' ? 'Click to view' : 'पाहण्यासाठी क्लिक करा'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-sans font-bold text-white mt-1">
                      {lang === 'EN' ? 'Saturday, 10 Oct • 05:00 PM IST' : 'शनिवार, १० ऑक्टोबर • सायं ०५:०० PM IST'}
                    </div>
                    <div className="text-[10px] text-gray-300 leading-tight mt-0.5">
                      {lang === 'EN' ? 'Uday Khatu Karkhana (Bhalchandra Maidan)' : 'उदय खातू कारखाना (भालचंद्र मैदान)'}
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Devotees RSVP counter & Live badges */}
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <div className="flex items-center gap-2 bg-black/60 border border-green-500/30 px-3 py-1.5 rounded-xl text-xs">
                <Users className="h-3.5 w-3.5 text-green-400" />
                <span className="text-gray-300">
                  {lang === 'EN' ? 'Registered Devotees:' : 'उपस्थिती नोंद:'}
                </span>
                <strong className="text-green-400 font-mono text-xs sm:text-sm font-bold">
                  {(currentFestival.rsvpCount || 0).toLocaleString()}+
                </strong>
              </div>

              <span className="text-[11px] text-brand-gold/90 font-sans italic flex items-center gap-1">
                <span>🪔</span>
                <span>{lang === 'EN' ? 'Free Mahaprasad Dining Included' : 'सर्व भाविकांसाठी महाप्रसाद भोजन व्यवस्था'}</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsRsvpModalOpen(true)}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-red to-red-700 hover:from-red-700 hover:to-brand-red text-white font-sans font-bold text-xs sm:text-sm border border-brand-gold/50 shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>✋</span>
                <span>{lang === 'EN' ? 'Confirm Your Attendance' : 'उपस्थिती नोंदवा (RSVP)'}</span>
              </button>

              {onNavigateToPatrika && (
                <button
                  onClick={onNavigateToPatrika}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-brand-gold hover:opacity-95 text-brand-maroon font-sans font-bold text-xs sm:text-sm border border-brand-gold shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>📜</span>
                  <span>{lang === 'EN' ? 'Navratri Patrika 2026' : 'कार्यक्रम पत्रिका २०२६'}</span>
                </button>
              )}

              {onNavigateToSeva && (
                <button
                  onClick={onNavigateToSeva}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-brand-maroon hover:bg-brand-maroon/80 text-brand-gold font-sans font-bold text-xs sm:text-sm border border-brand-gold/40 shadow hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>📿</span>
                  <span>{lang === 'EN' ? 'Pre-Book Special Seva' : 'विशेष पूजा व सेवा नोंदणी'}</span>
                </button>
              )}

              {onNavigateToEvents && (
                <button
                  onClick={onNavigateToEvents}
                  className="px-3.5 py-2.5 rounded-xl bg-black/40 hover:bg-black/70 text-gray-300 hover:text-white font-sans font-semibold text-xs border border-white/15 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>{lang === 'EN' ? 'All Events' : 'सर्व उत्सव'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* Right Column: Live Countdown Boxes (Span 5) */}
          <div className="col-span-1 lg:col-span-5 flex flex-col items-center justify-center">
            
            {countdown.isLive ? (
              /* Live Celebration Banner when today is the festival */
              <div className="w-full bg-gradient-to-br from-red-950/90 via-brand-maroon to-black border-2 border-red-500/70 p-6 rounded-2xl text-center space-y-3 shadow-2xl animate-pulse">
                <span className="text-4xl animate-bounce inline-block">🎉</span>
                <h4 className="font-sans font-black text-xl sm:text-2xl text-brand-gold tracking-wide">
                  {lang === 'EN' ? 'FESTIVAL IS LIVE TODAY!' : 'पावन महोत्सव आज सुरू आहे!'}
                </h4>
                <p className="text-xs text-gray-200 font-sans leading-relaxed">
                  {lang === 'EN' 
                    ? 'Temple doors are open with grand celebrations, continuous chanting and live mahaprasad.'
                    : 'मंदिरात अखंड दीप प्रज्वलन, महाआरती, गरबा नृत्य व महाप्रसाद वाटप सुरू आहे. त्वरित दर्शन घ्या.'}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600 text-white font-mono font-bold text-xs uppercase shadow-md">
                    <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                    <span>LIVE DARSHAN AVAILABLE</span>
                  </span>
                </div>
              </div>
            ) : (
              /* High-Impact 4-Digit Countdown Display */
              <div className="w-full bg-black/60 border-2 border-brand-gold/30 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5 text-center relative overflow-hidden">
                
                <div className="flex items-center justify-center gap-1.5 text-brand-saffron text-xs font-sans font-bold uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-brand-gold animate-spin" />
                  <span>
                    {isNavratriFestival ? (
                      milestoneTarget === 'ghatasthapana'
                        ? (lang === 'EN' ? 'Countdown to Ghatasthapana (11 Oct, 12:00 AM IST)' : 'घटस्थापना उलटी गणना (११ ऑक्टोबर, १२:०० AM IST)')
                        : (lang === 'EN' ? 'Countdown to Devi Agaman (10 Oct, 05:00 PM IST)' : 'देवी आगमन सोहळा उलटी गणना (१० ऑक्टोबर, सायं ०५:०० IST)')
                    ) : (
                      lang === 'EN' ? 'Countdown to Auspicious Day' : 'महोत्सव शुभारंभ उलटी गणना'
                    )}
                  </span>
                </div>

                {/* 4 Counter Boxes: Days, Hours, Minutes, Seconds */}
                <div className="grid grid-cols-4 gap-1.5 xs:gap-2 sm:gap-3">
                  
                  {/* Days */}
                  <div className="bg-gradient-to-b from-[#2d0505] to-[#140101] border-2 border-brand-gold/40 rounded-xl p-1.5 xs:p-2 sm:p-3 text-center shadow-lg relative group hover:border-brand-gold transition-colors">
                    <div className="font-mono text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)]">
                      {String(countdown.days).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] xs:text-[10px] sm:text-xs font-sans font-bold text-brand-gold mt-1 uppercase tracking-wider">
                      {lang === 'EN' ? 'Days' : 'दिवस'}
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="bg-gradient-to-b from-[#2d0505] to-[#140101] border-2 border-brand-gold/40 rounded-xl p-1.5 xs:p-2 sm:p-3 text-center shadow-lg relative group hover:border-brand-gold transition-colors">
                    <div className="font-mono text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)]">
                      {String(countdown.hours).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] xs:text-[10px] sm:text-xs font-sans font-bold text-brand-gold mt-1 uppercase tracking-wider">
                      {lang === 'EN' ? 'Hours' : 'तास'}
                    </div>
                  </div>

                  {/* Minutes */}
                  <div className="bg-gradient-to-b from-[#2d0505] to-[#140101] border-2 border-brand-gold/40 rounded-xl p-1.5 xs:p-2 sm:p-3 text-center shadow-lg relative group hover:border-brand-gold transition-colors">
                    <div className="font-mono text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)]">
                      {String(countdown.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] xs:text-[10px] sm:text-xs font-sans font-bold text-brand-gold mt-1 uppercase tracking-wider">
                      {lang === 'EN' ? 'Mins' : 'मिनिटे'}
                    </div>
                  </div>

                  {/* Seconds */}
                  <div className="bg-gradient-to-b from-[#2d0505] to-[#140101] border-2 border-brand-gold/40 rounded-xl p-1.5 xs:p-2 sm:p-3 text-center shadow-lg relative group hover:border-brand-gold transition-colors">
                    <div className="font-mono text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black text-brand-saffron animate-pulse drop-shadow-[0_2px_10px_rgba(255,153,51,0.6)]">
                      {String(countdown.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] xs:text-[10px] sm:text-xs font-sans font-bold text-brand-saffron mt-1 uppercase tracking-wider">
                      {lang === 'EN' ? 'Secs' : 'सेकंद'}
                    </div>
                  </div>

                </div>

                {/* Subtitle helper */}
                <div className="text-[11px] text-gray-300 font-sans flex items-center justify-center gap-1.5 pt-1 text-center">
                  <span>🚩</span>
                  <span>
                    {isNavratriFestival
                      ? (lang === 'EN'
                          ? 'Synchronized with Indian Standard Time (IST • UTC+05:30): 11 October 12:00 AM Midnight (Ghatasthapana)'
                          : 'भारतीय प्रमाणवेळ (IST • UTC+05:30) अचूक वेळ: ११ ऑक्टोबर मध्यरात्र १२:०० AM (घटस्थापना पर्वकाळ)')
                      : (lang === 'EN'
                          ? 'Live countdown synchronized with Indian Standard Time (IST • UTC+05:30)'
                          : 'भारतीय प्रमाणवेळेनुसार (IST) थेट उलटी गणना अद्ययावत')}
                  </span>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* Quick Attendance / RSVP Modal Dialog */}
      {isRsvpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-[#240303] via-black to-[#1c0202] border-2 border-brand-gold/60 rounded-2xl p-6 max-w-md w-full shadow-2xl text-left space-y-4 relative">
            
            <div className="flex items-center justify-between border-b border-brand-gold/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">✋</span>
                <h4 className="font-sans font-black text-lg text-brand-gold">
                  {lang === 'EN' ? 'Festival Attendance Registration' : 'महोत्सव उपस्थिती नोंदणी'}
                </h4>
              </div>
              <button
                onClick={() => setIsRsvpModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {rsvpSuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto animate-bounce" />
                <h5 className="font-sans font-bold text-lg text-white">
                  {lang === 'EN' ? 'Attendance Confirmed! 🙏' : 'उपस्थिती यशस्वी नोंदली गेली! 🙏'}
                </h5>
                <p className="text-xs text-gray-300">
                  {lang === 'EN'
                    ? 'Thank you for registering. May Shree Ishwatichi Mata bless you and your family.'
                    : 'नोंदणी केल्याबद्दल धन्यवाद. श्री इश्वटीची मातेची कृपा आपल्यावर सदैव राहो.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-3.5">
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  {lang === 'EN'
                    ? `Register your presence for ${currentFestival.title} to help us arrange adequate seating and mahaprasad dining.`
                    : `${currentFestival.titleMarathi} उत्सवासाठी आपल्या उपस्थितीची आगाऊ नोंद करा, जेणेकरून बैठक व महाप्रसाद भोजनाचे योग्य नियोजन करता येईल.`}
                </p>

                <div>
                  <label className="block text-xs font-sans font-bold text-brand-gold mb-1">
                    {lang === 'EN' ? 'Devotee / Family Head Name *' : 'भाविक / कुटुंब प्रमुखाचे नाव *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    placeholder={lang === 'EN' ? 'e.g. Ramesh Kulkarni' : 'उदा. रमेश कुलकर्णी'}
                    className="w-full bg-black/60 border border-brand-gold/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-saffron"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold text-brand-gold mb-1">
                    {lang === 'EN' ? 'Mobile Number (for SMS Darshan Pass)' : 'मोबाईल क्रमांक (दर्शन सूचना SMS साठी)'}
                  </label>
                  <input
                    type="tel"
                    value={rsvpPhone}
                    onChange={(e) => setRsvpPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full bg-black/60 border border-brand-gold/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-saffron font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRsvpModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-black/40 text-gray-300 hover:text-white text-xs font-sans cursor-pointer border border-white/10"
                  >
                    {lang === 'EN' ? 'Cancel' : 'रद्द करा'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-red to-red-700 text-white font-sans font-bold text-xs shadow-lg hover:scale-105 transition-all cursor-pointer border border-brand-gold/40"
                  >
                    {lang === 'EN' ? 'Confirm Attendance' : 'उपस्थिती निश्चित करा'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default UpcomingFestivalCountdown;
