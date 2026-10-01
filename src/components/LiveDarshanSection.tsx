/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Users, 
  Flame, 
  Bell, 
  Music, 
  Clock, 
  AlertTriangle, 
  Disc, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Timer,
  ChevronRight,
  Filter
} from 'lucide-react';
import { TRANSLATIONS } from '../data';
import { aartiAudioEngine } from '../utils/aartiAudioEngine';

interface LiveDarshanSectionProps {
  lang: 'EN' | 'MR';
  heroImagePath: string;
}

export interface DailyAartiItem {
  id: string;
  time24: string; // "05:30", "08:30", etc.
  timeEn: string;
  timeMr: string;
  titleMr: string;
  titleEn: string;
  period: 'morning' | 'afternoon' | 'evening';
  periodLabelMr: string;
  periodLabelEn: string;
  descriptionMr: string;
  descriptionEn: string;
  significanceMr: string;
  significanceEn: string;
}

export const DAILY_AARTI_SCHEDULE: DailyAartiItem[] = [
  {
    id: 'kakad',
    time24: '05:30',
    timeEn: '05:30 AM',
    timeMr: 'पहाटे ०५:३०',
    titleMr: 'काकड आरती व भूपाळी',
    titleEn: 'Kakad Aarti & Bhupali',
    period: 'morning',
    periodLabelMr: 'पहाट व सकाळ',
    periodLabelEn: 'Morning Dawn',
    descriptionMr: 'मातेला जागृत करणारी मंगल प्रभात आरती, सुमधुर भूपाळी गायन व सुगंधी जलस्नान विधी.',
    descriptionEn: 'Dawn awakening hymns invoking blessings for peace, health and prosperity with holy bath rituals.',
    significanceMr: 'चित्तशुद्धी व दिवसाची मंगल सुरुवात',
    significanceEn: 'Mental tranquility & divine morning initiation',
  },
  {
    id: 'abhishek',
    time24: '08:30',
    timeEn: '08:30 AM',
    timeMr: 'सकाळी ०८:३०',
    titleMr: 'पंचामृत महाअभिषेक व अलंकार पूजा',
    titleEn: 'Panchamrit Maha Abhishek & Alankar Puja',
    period: 'morning',
    periodLabelMr: 'सकाळ',
    periodLabelEn: 'Morning',
    descriptionMr: 'दूध, दही, मध, तूप व साखरेने महाअभिषेक आणि मातेचे सुवर्ण अलंकार दर्शन.',
    descriptionEn: 'Sacred five-nectar holy bath ritual followed by royal alankar and fresh flower decoration.',
    significanceMr: 'आरोग्य, भरभराट व ऐश्वर्य प्राप्ती',
    significanceEn: 'Health, abundance & spiritual elevation',
  },
  {
    id: 'madhyanha',
    time24: '12:30',
    timeEn: '12:30 PM',
    timeMr: 'दुपारी १२:३०',
    titleMr: 'मध्यान्ह महाआरती व महाप्रसाद नैवेद्य',
    titleEn: 'Madhyanha Maha Aarti & Food Offering',
    period: 'afternoon',
    periodLabelMr: 'दुपार',
    periodLabelEn: 'Afternoon',
    descriptionMr: 'दुपारची मुख्य महाआरती, षोडशोपचार पूजा व महाप्रसाद अन्नछत्र नैवेद्य समर्पण.',
    descriptionEn: 'Midday grand temple aarti with traditional anna prasad offering for all visiting devotees.',
    significanceMr: 'अन्नपूर्णा कृपा व अखंड सुख-समाधान',
    significanceEn: 'Grace of Annapurna & fulfillment',
  },
  {
    id: 'dhoop',
    time24: '16:30',
    timeEn: '04:30 PM',
    timeMr: 'संध्याकाळी ०४:३०',
    titleMr: 'संध्या धूप आरती व दीप पूजन',
    titleEn: 'Dhoop Aarti & Evening Incense Puja',
    period: 'evening',
    periodLabelMr: 'सायंकाळ',
    periodLabelEn: 'Evening',
    descriptionMr: 'गुग्गूळ, कापूर व सुगंधी धूप प्रज्वलन. गर्भगृहाचे पावन वातावरणीकरण व शांत ध्यान विधी.',
    descriptionEn: 'Purification ritual with pure fragrant herbal dhoop, camphor lamps, and quiet meditation.',
    significanceMr: 'वास्तू शुद्धी व नकारात्मक ऊर्जा निवारण',
    significanceEn: 'Aura purification & removal of negativity',
  },
  {
    id: 'sandhya',
    time24: '19:30',
    timeEn: '07:30 PM',
    timeMr: 'संध्याकाळी ०७:३०',
    titleMr: 'संध्याकालीन मुख्य महाआरती व दीपमाळ',
    titleEn: 'Sandhya Maha Aarti & Deepotsav',
    period: 'evening',
    periodLabelMr: 'संध्याकाळ',
    periodLabelEn: 'Night Vigil',
    descriptionMr: 'दिवसभरातील सर्वात मोठी दीप महाआरती, घंटानाद, वाद्यघोष व ई-सेवा संकल्प पठण.',
    descriptionEn: 'Grandest congregation aarti of the day with bells, cymbals, chimes, and online e-seva sankalpas.',
    significanceMr: 'सर्व मनोकामना पूर्ती व ई-संकल्प फळ',
    significanceEn: 'Fulfillment of heartfelt prayers & e-sankalp fruit',
  },
  {
    id: 'shej',
    time24: '21:30',
    timeEn: '09:30 PM',
    timeMr: 'रात्री ०९:३०',
    titleMr: 'शेजारती व मंदिर शयन विधी',
    titleEn: 'Shej Aarti & Temple Resting Ritual',
    period: 'evening',
    periodLabelMr: 'रात्र',
    periodLabelEn: 'Night',
    descriptionMr: 'दिवसाची सांगता करणारी शांत शेजारती, अंगाई स्तोत्र व रात्री मंदिर कवाडे बंद.',
    descriptionEn: 'Night lullaby prayer for the Divine Mother before temple sanctum doors close for resting.',
    significanceMr: 'शांत निद्रा, मानसिक शांती व रक्षण',
    significanceEn: 'Peaceful sleep, spiritual solace & divine protection',
  },
];

export const LiveDarshanSection: React.FC<LiveDarshanSectionProps> = ({ lang, heroImagePath }) => {
  const t = TRANSLATIONS[lang];
  const [activeCam, setActiveCam] = useState<'sanctum' | 'arch' | 'food' | 'courtyard'>('sanctum');
  const [viewers, setViewers] = useState(4821);
  const [countdownText, setCountdownText] = useState('127d 14h 55m 20s');
  
  // Real-time dynamic clock for Aarti timings
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Web Audio state
  const [isPlayingChant, setIsPlayingChant] = useState(false);
  const [oscillatorPlaying, setOscillatorPlaying] = useState<string | null>(null);
  const [isAartiAudioActive, setIsAartiAudioActive] = useState(() => aartiAudioEngine.getIsPlaying());
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<number | null>(null);

  // Sync with global Aarti audio engine
  useEffect(() => {
    const unsub = aartiAudioEngine.onStateChange(playing => {
      setIsAartiAudioActive(playing);
    });
    return () => unsub();
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fluctuating live viewers
  useEffect(() => {
    const viewerInterval = setInterval(() => {
      setViewers(prev => {
        const delta = Math.floor(Math.random() * 30) - 15;
        const updated = prev + delta;
        return updated < 4500 ? 4500 : updated > 5200 ? 5200 : updated;
      });
    }, 4000);

    return () => clearInterval(viewerInterval);
  }, []);

  // Real-time calculation for Navratri Countdown (using fixed future date 2026-10-12)
  useEffect(() => {
    const festivalDate = new Date('2026-10-12T00:00:00Z').getTime();

    const timeInterval = setInterval(() => {
      const now = new Date().getTime();
      const difference = festivalDate - now;

      if (difference <= 0) {
        setCountdownText('FESTIVAL IS LIVE! 🙏');
        clearInterval(timeInterval);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdownText(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Synth generators for local interactive audio
  const initAudio = () => {
    if (!audioCtxRef.current) {
      // @ts-ignore
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTempleBell = () => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

      const mainOsc = ctx.createOscillator();
      mainOsc.type = 'sine';
      mainOsc.frequency.value = 880;
      mainOsc.connect(gain);

      const ringOsc = ctx.createOscillator();
      ringOsc.type = 'triangle';
      ringOsc.frequency.value = 1174.66;
      ringOsc.connect(gain);

      mainOsc.start();
      ringOsc.start();

      mainOsc.stop(ctx.currentTime + 2.5);
      ringOsc.stop(ctx.currentTime + 2.5);

      setOscillatorPlaying('bell');
      setTimeout(() => setOscillatorPlaying(null), 1000);
    } catch (e) {
      console.warn('Audio Context unsupported or restricted', e);
    }
  };

  const playShankhnaad = () => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.0);

      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = 150;
      
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(151, ctx.currentTime);
      osc2.frequency.linearRampToValueAtTime(155, ctx.currentTime + 2);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450;

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);

      osc1.start();
      osc2.start();

      osc1.stop(ctx.currentTime + 4.0);
      osc2.stop(ctx.currentTime + 4.0);

      setOscillatorPlaying('shankh');
      setTimeout(() => setOscillatorPlaying(null), 3500);
    } catch (e) {
      console.warn(e);
    }
  };

  const toggleOMChantLoop = () => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      if (isPlayingChant) {
        if (audioIntervalRef.current) {
          window.clearInterval(audioIntervalRef.current);
          audioIntervalRef.current = null;
        }
        setIsPlayingChant(false);
        return;
      }

      setIsPlayingChant(true);

      const playChantBeat = () => {
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.4);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

        const oscNode = ctx.createOscillator();
        oscNode.type = 'sine';
        oscNode.frequency.value = 136.1;

        const overtone = ctx.createOscillator();
        overtone.type = 'sine';
        overtone.frequency.value = 272.2;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 200;

        oscNode.connect(bandpass);
        overtone.connect(bandpass);
        bandpass.connect(gainNode);

        oscNode.start();
        overtone.start();

        oscNode.stop(ctx.currentTime + 1.8);
        overtone.stop(ctx.currentTime + 1.8);
      };

      playChantBeat();
      const interval = window.setInterval(playChantBeat, 2000);
      audioIntervalRef.current = interval;

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    };
  }, []);

  // Compute status and timings dynamically based on client clock
  const aartiStatusList = useMemo(() => {
    const curHours = currentDate.getHours();
    const curMinutes = currentDate.getMinutes();
    const currentTotalMinutes = curHours * 60 + curMinutes;

    // Find all minutes
    const listWithMinutes = DAILY_AARTI_SCHEDULE.map(item => {
      const [h, m] = item.time24.split(':').map(Number);
      const totalMins = h * 60 + m;
      return {
        ...item,
        totalMins
      };
    });

    // Check which one is Live (within -3 min to +20 min)
    const liveItem = listWithMinutes.find(
      i => currentTotalMinutes >= i.totalMins - 3 && currentTotalMinutes <= i.totalMins + 20
    );

    // Find next upcoming
    let nextItem = listWithMinutes.find(i => i.totalMins > currentTotalMinutes + 2);
    let nextIsTomorrow = false;
    if (!nextItem) {
      // Past all today's Aartis, next is tomorrow morning's first Aarti
      nextItem = listWithMinutes[0];
      nextIsTomorrow = true;
    }

    return listWithMinutes.map(item => {
      const isLive = liveItem?.id === item.id;
      const isNext = !liveItem && nextItem?.id === item.id;
      const isCompleted = currentTotalMinutes > item.totalMins + 20;

      let statusType: 'live' | 'next' | 'completed' | 'scheduled' = 'scheduled';
      if (isLive) statusType = 'live';
      else if (isNext) statusType = 'next';
      else if (isCompleted) statusType = 'completed';

      let diffMinutes = 0;
      if (isNext) {
        if (nextIsTomorrow) {
          diffMinutes = (24 * 60 - currentTotalMinutes) + item.totalMins;
        } else {
          diffMinutes = item.totalMins - currentTotalMinutes;
        }
      }

      return {
        ...item,
        isLive,
        isNext,
        isCompleted,
        statusType,
        diffMinutes
      };
    });
  }, [currentDate]);

  // Next up summary banner calculation
  const nextAartiSummary = useMemo(() => {
    const live = aartiStatusList.find(i => i.isLive);
    if (live) {
      return {
        isLive: true,
        item: live,
        textMr: `सध्या सुरू आहे: ${live.titleMr} (${live.timeMr})`,
        textEn: `Ongoing Live Now: ${live.titleEn} (${live.timeEn})`,
      };
    }
    const next = aartiStatusList.find(i => i.isNext);
    if (next) {
      const hrs = Math.floor(next.diffMinutes / 60);
      const mins = next.diffMinutes % 60;
      const timeStrMr = hrs > 0 ? `${hrs} तास ${mins} मिनिटांत` : `${mins} मिनिटांत`;
      const timeStrEn = hrs > 0 ? `in ${hrs}h ${mins}m` : `in ${mins}m`;
      return {
        isLive: false,
        item: next,
        textMr: `पुढील आरती: ${next.titleMr} (${next.timeMr}) • आणखी ${timeStrMr}`,
        textEn: `Next Aarti: ${next.titleEn} (${next.timeEn}) • ${timeStrEn}`,
      };
    }
    return null;
  }, [aartiStatusList]);

  // Filtered Aartis
  const filteredAartis = useMemo(() => {
    if (selectedFilter === 'all') return aartiStatusList;
    return aartiStatusList.filter(item => item.period === selectedFilter);
  }, [aartiStatusList, selectedFilter]);

  const videoFeeds = {
    sanctum: {
      name: lang === 'EN' ? 'Garbhagriha (Main Sanctum) - UHD [60 FPS]' : 'मुख्य गर्भगृह गाभारा कॅमेरा',
      isLive: true
    },
    arch: {
      name: lang === 'EN' ? 'Maha Dwar (Holy Arch Entry)' : 'महाद्वार प्रवेश रांग कॅमेरा',
      isLive: true
    },
    food: {
      name: lang === 'EN' ? 'Anna Chhatra (Charitable Kitchen)' : 'अन्नछत्र - महाप्रसाद वितरण कक्ष',
      isLive: false,
      message: lang === 'EN' ? 'Offline - Restarts during lunch (11:30 AM)' : 'प्रसारण बंद - सकाळी ११:३० पासून महाप्रसाद वितरण'
    },
    courtyard: {
      name: lang === 'EN' ? 'Outer Compound Pradakshina Path' : 'मंदिर बाह्य प्रांगण प्रदक्षिणा मार्ग',
      isLive: true
    }
  };

  return (
    <section className="bg-brand-maroon/20 rounded-2xl border border-brand-gold/20 p-4 sm:p-6 md:p-8 text-white backdrop-blur-sm shadow-2xl space-y-8 sm:space-y-10">
      
      {/* Alert Ribbon */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-red-950/70 text-red-100 border border-brand-red/30 p-3.5 sm:p-4 rounded-xl text-xs shadow-md">
        <AlertTriangle className="h-5 w-5 text-brand-saffron shrink-0 animate-bounce" />
        <div>
          <span className="font-bold underline uppercase tracking-wide mr-1.5">
            {lang === 'EN' ? 'Notice:' : 'महामहत्त्वाची सूचना:'}
          </span>
          {lang === 'EN' 
            ? 'Due to heavy Friday evening queue, wait times for walk-in physical darshan are around 2.5 hours. Please utilize this high-fidelity digital portal.' 
            : 'आज शुक्रवार असल्याने मंदिरात भाविकांची प्रचंड गर्दी आहे. मुख दर्शनासाठी अंदाजे २.५ तास वेळ लागू शकतो. भाविकांनी थेट ऑनलाइन प्रक्षेपणाचा आनंद घ्यावा.'}
        </div>
      </div>

      {/* Main Header visual */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-brand-gold/20">
        <div>
          <h2 className="text-2xl md:text-4xl font-serif font-black flex items-center gap-2.5 text-white">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500"></span>
            </span>
            <span>{t.live_darshan_stream}</span>
          </h2>
          <p className="text-xs sm:text-sm text-brand-saffron/90 mt-1 font-mono flex items-center gap-1.5">
            <span>🎥</span>
            <span>{videoFeeds[activeCam].name}</span>
          </p>
        </div>

        {/* Live Counters & Countdown block */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Live Viewers counter */}
          <div className="flex items-center gap-2 bg-black/60 border border-green-500/40 px-3.5 py-2 rounded-xl text-xs shadow-inner">
            <Users className="h-4 w-4 text-green-400 animate-pulse" />
            <span>
              {lang === 'EN' ? 'Active Worshipers Online' : 'सध्या ऑनलाईन भाविक'}: 
              <strong className="text-green-400 ml-1 font-mono text-sm">{viewers.toLocaleString()}</strong>
            </span>
          </div>

          {/* Countdown timer */}
          <div className="flex items-center gap-2 bg-black/60 border border-brand-gold/40 px-3.5 py-2 rounded-xl text-xs shadow-inner">
            <Flame className="h-4 w-4 text-brand-saffron animate-bounce" />
            <div>
              <span className="text-[10px] text-gray-400 block -mb-1">{t.countdown_festival}</span>
              <span className="text-brand-gold font-mono font-bold tracking-wider">{countdownText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Stream Viewfinder and Interactive Sound Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Cam Screen (Left) */}
        <div className="col-span-1 lg:col-span-8 space-y-4">
          <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-brand-gold/30 bg-black group shadow-2xl">
            {/* Overlay indicators */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-red-700 text-white font-mono font-bold text-[10px] uppercase px-2.5 py-1 rounded-md shadow-md">
              <span className="h-1.5 w-1.5 bg-white rounded-full animate-ping" />
              LIVE HD
            </div>

            <div className="absolute top-3 right-3 z-10 bg-black/80 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-mono text-brand-gold flex items-center gap-1.5 border border-brand-gold/30 shadow-md">
              <Clock className="h-3.5 w-3.5 text-brand-saffron animate-spin" />
              <span>{currentDate.toLocaleTimeString()}</span>
            </div>

            {/* Video or Image source */}
            {videoFeeds[activeCam].isLive ? (
              <div className="h-full w-full relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-brand-gold/30 animate-pulse pointer-events-none" />
                
                {/* Sacred watermark badge */}
                <div className="absolute top-3 left-24 z-10 bg-brand-maroon/90 backdrop-blur-sm border border-brand-gold/60 text-brand-gold text-[10px] font-serif font-black px-2.5 py-1 rounded shadow flex items-center gap-1.5">
                  <span>🌸</span>
                  <span>श्री ईश्वटीची थेट दर्शन</span>
                </div>

                {/* High fidelity image source */}
                <img 
                  src={heroImagePath} 
                  alt="Shree Ishwatichi Mata Darshan Chamber Live" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="bg-black/85 px-3 py-1.5 rounded-lg backdrop-blur border border-white/10 text-xs shadow-md">
                    <span className="text-gray-400">{lang === 'EN' ? 'Feed' : 'प्रसारण'}</span>: <strong className="text-brand-gold">{videoFeeds[activeCam].name}</strong>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => playTempleBell()}
                      className="p-2 bg-black/85 hover:bg-brand-red rounded-lg text-brand-saffron cursor-pointer border border-brand-gold/30 transition-all hover:scale-105 shadow-md flex items-center gap-1 text-xs" 
                      title={lang === 'EN' ? 'Ring Temple Bell' : 'घंटी वाजवा'}
                    >
                      <Bell className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      className="px-2.5 py-1.5 bg-black/85 hover:bg-brand-red rounded-lg text-brand-gold cursor-pointer border border-brand-gold/30 text-xs font-mono font-bold shadow-md animate-pulse" 
                      title="High Quality Stream"
                    >
                      4K UHD 💎
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-950 p-6 text-center text-gray-500">
                <Music className="h-12 w-12 text-gray-700 mb-3 animate-bounce" />
                <p className="text-sm font-semibold">{videoFeeds[activeCam].message}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {lang === 'EN' ? 'Select Sanctum Camera or Entry Arch for live worship feed' : 'थेट दर्शन सुरू असलेल्या इतर गाभाऱ्याच्या कॅमेऱ्यावर स्विच करा'}
                </p>
              </div>
            )}
          </div>

          {/* Camera switcher buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {(Object.keys(videoFeeds) as Array<keyof typeof videoFeeds>).map((key) => {
              const active = activeCam === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCam(key)}
                  className={`py-2 px-3 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition-all ${
                    active 
                      ? 'bg-brand-gold/20 text-brand-gold border-brand-gold shadow-lg font-bold scale-[1.02]' 
                      : 'bg-black/40 text-gray-200 border-brand-gold/15 hover:border-brand-saffron/50 hover:bg-black/60'
                  }`}
                >
                  <span className="text-[9px] text-gray-400 uppercase tracking-widest font-mono">
                    {lang === 'EN' ? `Camera ${key.toUpperCase()}` : `कॅमेरा ${key.toUpperCase()}`}
                  </span>
                  <span className="truncate mt-1 text-xs font-medium">
                    {key === 'sanctum' 
                      ? (lang === 'EN' ? 'Inner Sanctum' : 'गाभारा मुख्य दर्शन') 
                      : key === 'arch' 
                      ? (lang === 'EN' ? 'Holy Arch' : 'प्रवेश द्वार व कमान') 
                      : key === 'food' 
                      ? (lang === 'EN' ? 'Maha Prasad' : 'महाप्रसाद अन्नछत्र') 
                      : (lang === 'EN' ? 'Outer Walkway' : 'प्रदक्षिणा परिसर')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Temple Soundboard & Fast Aarti Control (Right - Col span 4) */}
        <div className="col-span-1 lg:col-span-4 space-y-4">
          
          {/* Audio Chants Generator Card */}
          <div className="bg-gradient-to-br from-brand-maroon/80 via-black to-brand-maroon/90 border-2 border-brand-gold/30 rounded-2xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/10 rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Disc className={`h-5 w-5 text-brand-gold ${oscillatorPlaying || isPlayingChant ? 'animate-spin' : ''}`} />
                <h3 className="text-base sm:text-lg font-serif font-black text-brand-gold">
                  {lang === 'EN' ? 'Temple Soundboard' : 'पवित्र ध्वनी व घंटानाद'}
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-black/60 text-brand-saffron px-2 py-0.5 rounded border border-brand-gold/20">
                Acoustic
              </span>
            </div>

            <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
              {lang === 'EN' 
                ? 'Synthesize authentic brass bells, conch shell (Shankh), and 136Hz Omkar resonance in your home.' 
                : 'देवीच्या पूजेचा अनुभव घरात मिळवण्यासाठी थेट घंटी, शंख आणि ॐकार जप ध्वनी निर्मिती करा.'}
            </p>

            {/* Synthesizer buttons */}
            <div className="space-y-2 pt-1 font-sans">
              
              {/* Bell Sound */}
              <button
                onClick={playTempleBell}
                className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 ${
                  oscillatorPlaying === 'bell'
                    ? 'bg-brand-gold text-brand-maroon border-brand-gold scale-102'
                    : 'bg-black/50 text-brand-gold border-brand-gold/30 hover:bg-brand-gold/15'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bell className={`h-4 w-4 ${oscillatorPlaying === 'bell' ? 'animate-bounce text-brand-maroon' : 'text-brand-saffron'}`} />
                  <span>{lang === 'EN' ? 'Ring Temple Brass Bells' : 'मंदिर पीतळ घंटी वाजवा'}</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono">{lang === 'EN' ? 'Tap' : 'क्लिक'}</span>
              </button>

              {/* Shankh Sound */}
              <button
                onClick={playShankhnaad}
                className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 ${
                  oscillatorPlaying === 'shankh'
                    ? 'bg-brand-saffron text-brand-maroon border-brand-saffron scale-102'
                    : 'bg-black/50 text-brand-saffron border-brand-saffron/30 hover:bg-brand-saffron/15'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Volume2 className={`h-4 w-4 ${oscillatorPlaying === 'shankh' ? 'animate-pulse text-brand-maroon' : 'text-brand-gold'}`} />
                  <span>{lang === 'EN' ? 'Blow Sacrosanct Shankh' : 'पवित्र शंखनाद करा'}</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono">3.5s 📯</span>
              </button>

              {/* OM Chant Loop */}
              <button
                onClick={toggleOMChantLoop}
                className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 ${
                  isPlayingChant
                    ? 'bg-green-600 text-white border-green-500 shadow-green-900/50'
                    : 'bg-black/50 text-green-400 border-green-500/30 hover:bg-green-500/15'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isPlayingChant ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-green-400 animate-pulse" />}
                  <span>{lang === 'EN' ? 'Continuous OM Dhuni Loop' : 'मंत्र: अखंड ॐकार जप सुरू करा'}</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono">136Hz 🧘</span>
              </button>

            </div>

            {/* Bouncing visual wave bars when audio is playing */}
            {(isPlayingChant || oscillatorPlaying) && (
              <div className="flex items-end justify-center gap-1.5 h-6 pt-1 animate-pulse">
                <span className="inline-block w-1.5 rounded-t bg-brand-gold h-4 animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="inline-block w-1.5 rounded-t bg-brand-saffron h-6 animate-bounce" style={{ animationDelay: '0.3s' }} />
                <span className="inline-block w-1.5 rounded-t bg-green-400 h-2 animate-bounce" style={{ animationDelay: '0.5s' }} />
                <span className="inline-block w-1.5 rounded-t bg-brand-saffron h-5 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="inline-block w-1.5 rounded-t bg-brand-gold h-3 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>

          {/* Live Aarti Highlight Banner in Sidebar */}
          {nextAartiSummary && (
            <div className={`p-4 rounded-2xl border transition-all duration-300 shadow-xl ${
              nextAartiSummary.isLive
                ? 'bg-gradient-to-r from-red-950 via-brand-maroon to-black border-red-500/60 animate-pulse'
                : 'bg-gradient-to-r from-brand-maroon/60 to-black border-brand-gold/30'
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${nextAartiSummary.isLive ? 'bg-red-500 animate-ping' : 'bg-brand-gold animate-bounce'}`} />
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-brand-gold">
                  {nextAartiSummary.isLive 
                    ? (lang === 'EN' ? 'Live Aarti Status' : 'थेट आरती चालू') 
                    : (lang === 'EN' ? 'Next Up Ceremony' : 'पुढील नियोजित आरती')}
                </span>
              </div>
              <h5 className="font-serif font-black text-sm text-white">
                {lang === 'EN' ? nextAartiSummary.item.titleEn : nextAartiSummary.item.titleMr}
              </h5>
              <div className="flex items-center justify-between text-xs text-brand-saffron font-mono mt-1 pt-1 border-t border-white/10">
                <span>{lang === 'EN' ? nextAartiSummary.item.timeEn : nextAartiSummary.item.timeMr}</span>
                <span className="text-[11px] font-sans text-gray-300">
                  {lang === 'EN' ? nextAartiSummary.textEn.split('•')[1] : nextAartiSummary.textMr.split('•')[1]}
                </span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Dynamic, Scrollable Vertical Table for Daily Aarti Timings in Marathi & English */}
      <div className="bg-gradient-to-b from-[#1f0202] via-black to-[#1a0101] rounded-2xl border-2 border-brand-gold/30 p-4 sm:p-6 shadow-2xl space-y-5">
        
        {/* Table Title, Real-Time Clock & Dynamic Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-brand-gold/20 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl select-none">🪔</span>
              <h3 className="font-serif font-black text-lg sm:text-2xl text-brand-gold tracking-wide">
                {lang === 'EN' ? 'Daily Aarti Timings & Sacred Schedule' : 'दैनिक आरती वेळापत्रक व पूजा विधी'}
              </h3>
              <span className="text-[10px] font-mono bg-brand-gold text-brand-maroon font-bold px-2 py-0.5 rounded shadow-sm">
                {lang === 'EN' ? 'Bilingual MR & EN' : 'मराठी व इंग्रजी'}
              </span>
            </div>
            <p className="text-xs text-gray-300 font-sans mt-1">
              {lang === 'EN'
                ? 'Dynamic real-time liturgical schedule. Scroll vertically to view all sacred rituals and timings.'
                : 'मंदिर गर्भगृहातील दैनंदिन आरत्यांचे अद्ययावत वेळापत्रक. सर्व आरत्या पाहण्यासाठी खाली स्क्रोल करा.'}
            </p>
          </div>

          {/* Right Status Block: Current Clock & Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            {/* Live Clock Indicator */}
            <div className="flex items-center gap-2 bg-black/60 border border-brand-gold/30 px-3 py-1.5 rounded-xl text-xs font-mono text-brand-gold shadow-inner">
              <Clock className="h-3.5 w-3.5 text-brand-saffron animate-spin" />
              <span>{lang === 'EN' ? 'Temple Time:' : 'मंदिर वेळ:'}</span>
              <strong className="text-white text-sm">{currentDate.toLocaleTimeString()}</strong>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-brand-gold/20 text-xs overflow-x-auto max-w-full">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-serif transition-all cursor-pointer text-[11px] whitespace-nowrap ${
                  selectedFilter === 'all'
                    ? 'bg-brand-gold text-brand-maroon font-bold shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {lang === 'EN' ? 'All (6)' : 'सर्व (६)'}
              </button>
              <button
                onClick={() => setSelectedFilter('morning')}
                className={`px-2.5 py-1 rounded-lg font-serif transition-all cursor-pointer text-[11px] whitespace-nowrap ${
                  selectedFilter === 'morning'
                    ? 'bg-brand-gold text-brand-maroon font-bold shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {lang === 'EN' ? 'Morning' : 'सकाळ'}
              </button>
              <button
                onClick={() => setSelectedFilter('afternoon')}
                className={`px-2.5 py-1 rounded-lg font-serif transition-all cursor-pointer text-[11px] whitespace-nowrap ${
                  selectedFilter === 'afternoon'
                    ? 'bg-brand-gold text-brand-maroon font-bold shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {lang === 'EN' ? 'Afternoon' : 'दुपार'}
              </button>
              <button
                onClick={() => setSelectedFilter('evening')}
                className={`px-2.5 py-1 rounded-lg font-serif transition-all cursor-pointer text-[11px] whitespace-nowrap ${
                  selectedFilter === 'evening'
                    ? 'bg-brand-gold text-brand-maroon font-bold shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {lang === 'EN' ? 'Evening & Night' : 'संध्याकाळ व रात्र'}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Next/Live Aarti Callout Banner */}
        {nextAartiSummary && (
          <div className={`p-3 sm:p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg ${
            nextAartiSummary.isLive 
              ? 'bg-gradient-to-r from-red-950/90 via-brand-maroon to-black border-red-500/70'
              : 'bg-gradient-to-r from-brand-maroon/70 via-black to-brand-maroon/70 border-brand-gold/40'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border ${
                nextAartiSummary.isLive
                  ? 'bg-red-600 border-white text-white animate-pulse'
                  : 'bg-brand-gold/20 border-brand-gold text-brand-gold'
              }`}>
                {nextAartiSummary.isLive ? '🔥' : '⏱️'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                    nextAartiSummary.isLive 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-brand-gold text-brand-maroon'
                  }`}>
                    {nextAartiSummary.isLive ? 'LIVE NOW' : 'NEXT UP'}
                  </span>
                  <span className="text-xs font-serif font-black text-brand-gold">
                    {nextAartiSummary.item.titleMr} / {nextAartiSummary.item.titleEn}
                  </span>
                </div>
                <p className="text-xs text-gray-200 mt-0.5">
                  {lang === 'EN' ? nextAartiSummary.textEn : nextAartiSummary.textMr}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => {
                  aartiAudioEngine.playAarti();
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-gold to-amber-500 text-brand-maroon font-serif font-bold text-xs hover:scale-105 transition-all shadow cursor-pointer flex items-center gap-1.5"
              >
                <span>🪔</span>
                <span>{lang === 'EN' ? 'Play Vocal Aarti' : 'मराठी आरती ऐका'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Vertical Table Container */}
        <div className="relative rounded-xl border border-brand-gold/25 overflow-hidden shadow-2xl bg-black/60">
          <div className="max-h-[380px] overflow-y-auto overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px]">
              
              {/* Sticky Table Header */}
              <thead className="sticky top-0 bg-[#240303] text-brand-gold border-b-2 border-brand-gold/40 z-10 font-serif text-xs uppercase tracking-wider shadow-md">
                <tr>
                  <th className="py-3 px-4 w-[16%]">
                    <div className="flex flex-col">
                      <span>वेळ</span>
                      <span className="text-[10px] text-gray-400 lowercase font-sans">scheduled time</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 w-[28%]">
                    <div className="flex flex-col">
                      <span>आरती व विधी नाव</span>
                      <span className="text-[10px] text-gray-400 lowercase font-sans">aarti & sacred ritual</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 w-[34%]">
                    <div className="flex flex-col">
                      <span>विवरण व धार्मिक महत्त्व</span>
                      <span className="text-[10px] text-gray-400 lowercase font-sans">significance & rituals</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 w-[12%] text-center">
                    <div className="flex flex-col items-center">
                      <span>स्थिती</span>
                      <span className="text-[10px] text-gray-400 lowercase font-sans">live status</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 w-[10%] text-center">
                    <div className="flex flex-col items-center">
                      <span>श्रवण</span>
                      <span className="text-[10px] text-gray-400 lowercase font-sans">action</span>
                    </div>
                  </th>
                </tr>
              </thead>

              {/* Table Body with Dynamic Row Highlights */}
              <tbody className="divide-y divide-white/10 text-xs font-sans">
                {filteredAartis.map((aarti, idx) => {
                  const isSelected = selectedRowId === aarti.id;
                  
                  // Row styling based on live/next status
                  let rowClasses = 'transition-colors ';
                  if (aarti.isLive) {
                    rowClasses += 'bg-red-950/40 hover:bg-red-900/50 border-l-4 border-l-red-500 ';
                  } else if (aarti.isNext) {
                    rowClasses += 'bg-brand-gold/15 hover:bg-brand-gold/20 border-l-4 border-l-brand-gold ';
                  } else if (idx % 2 === 0) {
                    rowClasses += 'bg-black/40 hover:bg-brand-maroon/30 ';
                  } else {
                    rowClasses += 'bg-brand-maroon/15 hover:bg-brand-maroon/35 ';
                  }

                  return (
                    <tr 
                      key={aarti.id}
                      onClick={() => setSelectedRowId(isSelected ? null : aarti.id)}
                      className={`${rowClasses} cursor-pointer group`}
                    >
                      {/* Column 1: Time in Marathi & English */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-sm sm:text-base font-black text-white group-hover:text-brand-gold transition-colors">
                            {aarti.timeEn}
                          </span>
                          <span className="text-[11px] font-serif font-bold text-brand-saffron">
                            {aarti.timeMr}
                          </span>
                          <span className="text-[9px] text-gray-400 font-mono">
                            {aarti.periodLabelMr} • {aarti.periodLabelEn}
                          </span>
                        </div>
                      </td>

                      {/* Column 2: Aarti & Ritual Name in Marathi & English */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-serif font-black text-sm text-brand-gold group-hover:underline">
                              {aarti.titleMr}
                            </span>
                            {aarti.isLive && (
                              <span className="text-[8px] bg-red-600 text-white uppercase font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                                Live
                              </span>
                            )}
                            {aarti.isNext && (
                              <span className="text-[8px] bg-brand-gold text-brand-maroon uppercase font-bold px-1.5 py-0.5 rounded-full">
                                Next
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-300 font-medium">
                            {aarti.titleEn}
                          </div>
                          <div className="text-[10px] text-brand-saffron italic">
                            {aarti.significanceMr}
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Significance & Description in Marathi & English */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1 text-gray-200">
                          <p className="text-xs leading-relaxed font-serif">
                            {aarti.descriptionMr}
                          </p>
                          <p className="text-[11px] text-gray-400 leading-normal font-sans">
                            {aarti.descriptionEn}
                          </p>
                        </div>
                      </td>

                      {/* Column 4: Dynamic Live Status Badge */}
                      <td className="py-3.5 px-4 align-top text-center">
                        {aarti.isLive ? (
                          <div className="inline-flex flex-col items-center gap-0.5 bg-red-950/80 border border-red-500/60 px-2.5 py-1 rounded-lg text-red-200 shadow-md animate-pulse">
                            <div className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                              <span className="font-bold text-[10px] font-mono">LIVE NOW</span>
                            </div>
                            <span className="text-[9px] font-serif font-bold text-red-300">चालू आहे</span>
                          </div>
                        ) : aarti.isNext ? (
                          <div className="inline-flex flex-col items-center gap-0.5 bg-brand-gold/20 border border-brand-gold/60 px-2.5 py-1 rounded-lg text-brand-gold shadow-md">
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3 text-brand-gold animate-bounce" />
                              <span className="font-bold text-[10px] font-mono">NEXT UP</span>
                            </div>
                            <span className="text-[9px] font-serif font-bold text-amber-200">
                              पुढील आरती
                            </span>
                          </div>
                        ) : aarti.isCompleted ? (
                          <div className="inline-flex flex-col items-center gap-0.5 bg-black/40 border border-white/10 px-2 py-1 rounded-lg text-gray-400">
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-400/80" />
                              <span className="text-[10px] font-mono">DONE</span>
                            </div>
                            <span className="text-[9px] font-serif">आज संपन्न</span>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center gap-0.5 bg-black/40 border border-white/10 px-2 py-1 rounded-lg text-gray-300">
                            <span className="text-[10px] font-mono text-brand-saffron">UPCOMING</span>
                            <span className="text-[9px] font-serif">नियोजित</span>
                          </div>
                        )}
                      </td>

                      {/* Column 5: Audio Action */}
                      <td className="py-3.5 px-4 align-top text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAartiAudioActive) {
                              aartiAudioEngine.silence();
                            } else {
                              aartiAudioEngine.playAarti();
                            }
                          }}
                          className={`p-2 rounded-lg border transition-all cursor-pointer shadow-md inline-flex items-center justify-center ${
                            isAartiAudioActive
                              ? 'bg-brand-gold text-brand-maroon border-brand-gold animate-pulse'
                              : 'bg-black/60 hover:bg-brand-red/40 border-brand-gold/30 text-brand-gold hover:text-white'
                          }`}
                          title={isAartiAudioActive ? (lang === 'EN' ? 'Silence Aarti' : 'आरती शांत करा') : (lang === 'EN' ? 'Play Sacred Aarti' : 'पावन आरती सुरू करा')}
                        >
                          {isAartiAudioActive ? (
                            <Pause className="h-3.5 w-3.5 fill-current" />
                          ) : (
                            <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>

          {/* Table Bottom Indicator & Quick Scroll Note */}
          <div className="bg-[#1f0202] border-t border-brand-gold/20 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-300 font-sans gap-2">
            <div className="flex items-center gap-2">
              <span className="text-brand-saffron">📜</span>
              <span>
                {lang === 'EN'
                  ? 'Total 6 sacred daily aartis scheduled at Shree Ishwatichi Mata Devasthan.'
                  : 'श्री ईश्वटीची माता देवस्थानात दररोज ६ प्रमुख आरत्या व नैवेद्य विधी संपन्न होतात.'}
              </span>
            </div>
            <div className="text-[10px] text-brand-gold font-mono flex items-center gap-1.5">
              <span>↕️ {lang === 'EN' ? 'Scroll up/down to explore all timings' : 'वेळा पाहण्यासाठी वर/खाली स्क्रोल करा'}</span>
            </div>
          </div>
        </div>

        {/* E-Seva Sankalp Notification Banner */}
        <div className="bg-brand-maroon/30 border border-brand-gold/30 rounded-xl p-3.5 sm:p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-gray-200">
            <span className="text-xl">📿</span>
            <div>
              <strong className="text-brand-gold mr-1">
                {lang === 'EN' ? 'E-Seva Sankalp Recitation:' : 'ई-सेवा संकल्प पठण सूचना:'}
              </strong>
              <span>
                {lang === 'EN'
                  ? 'Devotees booking online sevas receive special sankalp recitation during the 07:30 PM evening Sandhya Aarti.'
                  : 'ऑनलाईन पूजा व सेवा नोंदणी केलेल्या भाविकांच्या नावांचा संकल्प दररोज संध्याकाळी ०७:३० वाजताच्या मुख्य महाआरतीमध्ये केला जातो.'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-brand-saffron bg-black/60 px-2.5 py-1 rounded-md border border-brand-gold/20 shrink-0">
            {lang === 'EN' ? 'Daily 07:30 PM IST' : 'दररोज सायं. ०७:३०'}
          </span>
        </div>

      </div>

    </section>
  );
};

export default LiveDarshanSection;
