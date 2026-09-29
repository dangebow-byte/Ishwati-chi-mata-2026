/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Users, Flame, Bell, PhoneCall, Music, Clock, AlertTriangle, Disc } from 'lucide-react';
import { TRANSLATIONS } from '../data';

interface LiveDarshanSectionProps {
  lang: 'EN' | 'MR';
  heroImagePath: string;
}

export const LiveDarshanSection: React.FC<LiveDarshanSectionProps> = ({ lang, heroImagePath }) => {
  const t = TRANSLATIONS[lang];
  const [activeCam, setActiveCam] = useState<'sanctum' | 'arch' | 'food' | 'courtyard'>('sanctum');
  const [viewers, setViewers] = useState(4821);
  const [countdownText, setCountdownText] = useState('127d 14h 55m 20s');
  
  // Web Audio state
  const [isPlayingChant, setIsPlayingChant] = useState(false);
  const [oscillatorPlaying, setOscillatorPlaying] = useState<string | null>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<number | null>(null);

  // Fluctuating live viewers
  useEffect(() => {
    const viewerInterval = setInterval(() => {
      setViewers(prev => {
        const delta = Math.floor(Math.random() * 30) - 15;
        // Keep in bounds 4500 to 5200
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

      // Principal bell tone ~900Hz and harmonics
      const mainOsc = ctx.createOscillator();
      mainOsc.type = 'sine';
      mainOsc.frequency.value = 880; // A5
      mainOsc.connect(gain);

      const ringOsc = ctx.createOscillator();
      ringOsc.type = 'triangle';
      ringOsc.frequency.value = 1174.66; // D6
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

      // Deep natural resonance drone
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = 150; // Deep rumble
      
      // Detuned oscillator for thick choral output
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(151, ctx.currentTime);
      osc2.frequency.linearRampToValueAtTime(155, ctx.currentTime + 2); // gradual pitch bend

      // Low pass filter to make it warmer
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
        // Stop chant
        if (audioIntervalRef.current) {
          window.clearInterval(audioIntervalRef.current);
          audioIntervalRef.current = null;
        }
        setIsPlayingChant(false);
        return;
      }

      setIsPlayingChant(true);

      // Function to trigger a rhythmic divine drone beat
      const playChantBeat = () => {
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.4);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

        const oscNode = ctx.createOscillator();
        oscNode.type = 'sine';
        oscNode.frequency.value = 136.1; // OM Frequency in Hertz

        const overtone = ctx.createOscillator();
        overtone.type = 'sine';
        overtone.frequency.value = 272.2; // First harmonic octave

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

      // Play instantly, then once every 2 seconds
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
    <section className="bg-brand-maroon/20 rounded-2xl border border-brand-gold/15 p-6 md:p-8 text-white backdrop-blur-sm shadow-xl space-y-10">
      
      {/* Alert Ribbon */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-red-950/70 text-red-100 border border-brand-red/30 p-4 rounded-xl text-xs">
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl md:text-4xl font-serif font-black flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            {t.live_darshan_stream}
          </h2>
          <p className="text-xs text-brand-saffron/90 mt-1 font-mono">
            {videoFeeds[activeCam].name}
          </p>
        </div>

        {/* Live Counters & Countdown block */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Live Viewers counter */}
          <div className="flex items-center gap-2 bg-black/40 border border-green-500/30 px-3 py-1.5 rounded-lg text-xs">
            <Users className="h-4 w-4 text-green-400 animate-pulse" />
            <span>
              {lang === 'EN' ? 'Active Worshipers Online' : 'सध्या ऑनलाईन भाविक'}: 
              <strong className="text-green-400 ml-1 font-mono text-sm">{viewers}</strong>
            </span>
          </div>

          {/* Countdown timer */}
          <div className="flex items-center gap-2 bg-black/40 border border-brand-gold/30 px-3 py-1.5 rounded-lg text-xs">
            <Flame className="h-4 w-4 text-brand-saffron animate-bounce" />
            <div>
              <span className="text-[10px] text-gray-400 block -mb-1">{t.countdown_festival}</span>
              <span className="text-brand-gold font-mono font-bold tracking-wider">{countdownText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Stream Viewfinder and Interactive Sound Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cam Screen (Left) */}
        <div className="col-span-1 lg:col-span-8 space-y-4">
          <div className="relative aspect-video rounded-xl overflow-hidden border border-brand-gold/25 bg-black group shadow-2xl">
            {/* Overlay indicators */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-red-700 text-white font-mono font-bold text-[10px] uppercase px-2.5 py-1 rounded shadow">
              <span className="h-1.5 w-1.5 bg-white rounded-full animate-ping" />
              LIVE HD
            </div>

            <div className="absolute top-3 right-3 z-10 bg-black/75 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono text-brand-gold flex items-center gap-1 border border-brand-gold/20">
              <Clock className="h-3.5 w-3.5 animate-spin" />
              {new Date().toLocaleTimeString()}
            </div>

            {/* Video or Image source */}
            {videoFeeds[activeCam].isLive ? (
              <div className="h-full w-full relative">
                {/* Visualizer effect to look like scanning or video feed */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-brand-gold/20 animate-pulse pointer-events-none" />
                
                {/* Sacred watermark badge */}
                <div className="absolute top-3 left-24 z-10 bg-brand-maroon/90 backdrop-blur-sm border border-brand-gold/60 text-brand-gold text-[10px] font-serif font-black px-2.5 py-1 rounded shadow flex items-center gap-1.5">
                  <span>🌸</span>
                  <span>श्री ईश्वटीची थेट दर्शन</span>
                </div>

                {/* High fidelity background image generated with prompt */}
                <img 
                  src={heroImagePath} 
                  alt="Shree Ishwatichi Mata Darshan Chamber Live" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="bg-black/80 px-3 py-1.5 rounded-md backdrop-blur border border-white/10 text-xs">
                    <span className="text-gray-400">{lang === 'EN' ? 'Feed' : 'प्रसारण'}</span>: <strong className="text-brand-gold">{videoFeeds[activeCam].name}</strong>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 bg-black/80 hover:bg-brand-red rounded-lg text-brand-saffron cursor-pointer" title="Refresh Feed">
                      🔄
                    </button>
                    <button className="p-1.5 bg-black/80 hover:bg-brand-red rounded-lg text-brand-saffron cursor-pointer animate-pulse" title="High Quality Toggle">
                      4K 💎
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
                  className={`py-2 px-3 rounded-lg border text-left flex flex-col justify-between cursor-pointer transition-all ${
                    active 
                      ? 'bg-brand-gold/15 text-brand-gold border-brand-gold shadow-lg font-bold' 
                      : 'bg-black/30 text-gray-200 border-white/5 hover:border-brand-saffron/50'
                  }`}
                >
                  <span className="text-[9px] text-gray-400 uppercase tracking-widest font-mono">Camera {key.toUpperCase()}</span>
                  <span className="truncate mt-1 text-xs">{key === 'sanctum' ? 'Inner Sanctum' : key === 'arch' ? 'Holy Arch' : key === 'food' ? 'Maha Prasad' : 'Outer Walkway'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Temple Soundboard & Aarti Schedules (Right - Col span 4) */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          
          {/* Audio Chants Generator Card */}
          <div className="bg-gradient-to-br from-brand-maroon/65 to-black border-2 border-brand-gold/30 rounded-xl p-5 shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/10 rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center gap-2">
              <Disc className={`h-5 w-5 text-brand-gold ${oscillatorPlaying || isPlayingChant ? 'animate-spin' : ''}`} />
              <h3 className="text-lg font-serif font-bold text-white">
                {lang === 'EN' ? 'Divine Soundboard' : 'पवित्र ध्वनी आणि घंटानाद'}
              </h3>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
              {lang === 'EN' 
                ? 'Synthesize authentic temple ambiance inside your room using real browser acoustic waves. Perfect for personal meditation.' 
                : 'देवीच्या पूजेचा अनुभव घरात मिळवण्यासाठी थेट घंटी, शंख आणि ॐकार जप ध्वनी निर्मिती करा.'}
            </p>

            {/* Simulated Synthesizer buttons */}
            <div className="space-y-2 pt-1 font-sans">
              
              {/* Bell Sound */}
              <button
                onClick={playTempleBell}
                className={`w-full py-2.5 px-3 rounded-lg border flex items-center justify-between text-xs font-bold transition-all ${
                  oscillatorPlaying === 'bell'
                    ? 'bg-brand-gold text-brand-maroon border-brand-gold'
                    : 'bg-black/40 text-brand-gold border-brand-gold/30 hover:bg-brand-gold/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bell className={`h-4 w-4 ${oscillatorPlaying === 'bell' ? 'animate-bounce' : ''}`} />
                  <span>{lang === 'EN' ? 'Ring Temple Brass Bells' : 'मंदिर पीतळ घंटी वाजवा'}</span>
                </div>
                <span className="text-[10px] opacity-75 font-mono">{lang === 'EN' ? 'Tap' : 'क्लिक'}</span>
              </button>

              {/* Shankh Sound */}
              <button
                onClick={playShankhnaad}
                className={`w-full py-2.5 px-3 rounded-lg border flex items-center justify-between text-xs font-bold transition-all ${
                  oscillatorPlaying === 'shankh'
                    ? 'bg-brand-saffron text-brand-maroon border-brand-saffron'
                    : 'bg-black/40 text-brand-saffron border-brand-saffron/30 hover:bg-brand-saffron/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Volume2 className={`h-4 w-4 ${oscillatorPlaying === 'shankh' ? 'animate-pulse' : ''}`} />
                  <span>{lang === 'EN' ? 'Blow Sacrosanct Shankh' : 'पवित्र शंखनाद करा'}</span>
                </div>
                <span className="text-[10px] opacity-75 font-mono">3.5s 📯</span>
              </button>

              {/* OM Chant Loop */}
              <button
                onClick={toggleOMChantLoop}
                className={`w-full py-2.5 px-3 rounded-lg border flex items-center justify-between text-xs font-bold transition-all ${
                  isPlayingChant
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-black/40 text-green-400 border-green-500/30 hover:bg-green-500/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isPlayingChant ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-green-400 animate-pulse" />}
                  <span>{lang === 'EN' ? 'Continuous OM Dhuni Loop' : 'मंत्र: अखंड ॐकार जप सुरू करा'}</span>
                </div>
                <span className="text-[10px] opacity-75 font-mono">136Hz 🧘</span>
              </button>

            </div>

            {/* Bouncing visual wave bars when audio is playing */}
            {(isPlayingChant || oscillatorPlaying) && (
              <div className="flex items-end justify-center gap-1 h-6 pt-1 animate-pulse">
                <span className="inline-block w-1.5 rounded-t bg-brand-gold h-4 animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="inline-block w-1.5 rounded-t bg-brand-saffron h-6 animate-bounce" style={{ animationDelay: '0.3s' }} />
                <span className="inline-block w-1.5 rounded-t bg-green-400 h-2 animate-bounce" style={{ animationDelay: '0.5s' }} />
                <span className="inline-block w-1.5 rounded-t bg-brand-saffron h-5 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="inline-block w-1.5 rounded-t bg-brand-gold h-3 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>

          {/* Aarti Schedule Timings card */}
          <div className="bg-black/40 border border-brand-gold/15 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-brand-gold border-b border-white/5 pb-2">
              <Clock className="h-4 w-4 text-brand-saffron" />
              <h4 className="text-sm font-bold font-serif uppercase tracking-wider">{t.aarti_timings}</h4>
            </div>

            <div className="divide-y divide-white/5 text-xs">
              <div className="flex justify-between py-2 text-gray-300">
                <span>{lang === 'EN' ? 'Pratah Puja (Kakad Aarti)' : 'काकड आरती आणि शुद्ध पूजा'}</span>
                <strong className="text-white font-mono">05:30 AM</strong>
              </div>
              <div className="flex justify-between py-2 text-gray-300">
                <span>{lang === 'EN' ? 'Maha Naivedya Abhishek' : 'महानैवेद्य व मुख्य पूजा'}</span>
                <strong className="text-white font-mono">12:30 PM</strong>
              </div>
              <div className="flex justify-between py-2 text-gray-300">
                <span>{lang === 'EN' ? 'Sandhya Mandir Aarti' : 'संध्याकालीन मुख्य आरती'}</span>
                <strong className="text-white font-mono">07:30 PM</strong>
              </div>
              <div className="flex justify-between py-2 text-gray-300">
                <span>{lang === 'EN' ? 'Shej Aarti (Deities Rest)' : 'शेजारती (मंदिर कवाडे बंद)'}</span>
                <strong className="text-white font-mono">09:30 PM</strong>
              </div>
            </div>

            <div className="bg-brand-red/10 border border-brand-gold/25 p-2.5 rounded text-[10px] text-gray-300 font-medium">
              🚨 <strong>{lang === 'EN' ? 'E-Seva' : 'ई-सेवा'}:</strong> {lang === 'EN' ? 'Sankalp-based prayers read during 07:30 PM evening Sandhya Aarti daily.' : 'दररोज संध्याकाळी ७:३० वाजताच्या मुख्य आरतीमध्ये ई-सेवा संकल्प नावांचे पठण केले जाते.'}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
