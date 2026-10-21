/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  X, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Calendar, 
  Clock, 
  MapPin, 
  Music, 
  Share2, 
  Flame,
  Eye,
  Zap
} from 'lucide-react';
import { shareToWhatsApp } from '../utils/shareUtils';

interface VisarjanMiravnukBannerProps {
  lang: 'EN' | 'MR';
  onDismiss?: () => void;
}

interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  decay: number;
  gravity: number;
  trail: { x: number; y: number }[];
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vx: number;
  vy: number;
  color: string;
  exploded: boolean;
}

interface FountainSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  decay: number;
}

export const VisarjanMiravnukBanner: React.FC<VisarjanMiravnukBannerProps> = ({ lang, onDismiss }) => {
  // 60-second dynamic flashing countdown
  const DURATION_SECONDS = 60;
  const [timeLeft, setTimeLeft] = useState<number>(DURATION_SECONDS);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Real Crackers Sound is enabled by default as preferred
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showReopenFloatingBtn, setShowReopenFloatingBtn] = useState<boolean>(false);

  // 3D tilt tracking for card perspective
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Extracted clean banner: pure authentic artwork with phone status bar & reply UI completely removed
  const bannerImgSrc = '/assets/aistudio/visarjan_banner_clean.png';

  // -------------------------------------------------------------
  // 1. Smooth Slide-Down Animation on Mount
  // -------------------------------------------------------------
  useEffect(() => {
    // Trigger smooth slide-down entrance animation
    const animTimer = setTimeout(() => {
      setHasEntered(true);
    }, 30);
    return () => clearTimeout(animTimer);
  }, []);

  // -------------------------------------------------------------
  // 2. Reverted & Restored Full Web Audio Firecrackers Synthesizer
  // -------------------------------------------------------------
  const getAudioContext = useCallback((): AudioContext | null => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      return ctx;
    } catch {
      return null;
    }
  }, []);

  // Unlock AudioContext on first user interaction gesture
  useEffect(() => {
    const handleUserGesture = () => {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        void ctx.resume();
      }
    };

    window.addEventListener('click', handleUserGesture, { passive: true });
    window.addEventListener('touchstart', handleUserGesture, { passive: true });
    window.addEventListener('keydown', handleUserGesture, { passive: true });
    window.addEventListener('pointerdown', handleUserGesture, { passive: true });

    return () => {
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
      window.removeEventListener('pointerdown', handleUserGesture);
    };
  }, [getAudioContext]);

  // Sound 1: Top-shot Rocket Whistle (Ascending frequency sweep)
  const playRocketWhistleSound = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx || ctx.state === 'suspended') return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.45);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, now);
      filter.Q.setValueAtTime(3, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.52);
    } catch {
      // Audio safely suppressed
    }
  }, [soundEnabled, getAudioContext]);

  // Sound 2: Aerial Fireworks Burst / Deep Sub-bass Boom + Noise detonation
  const playCrackerBurstSound = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx || ctx.state === 'suspended') return;

    try {
      const now = ctx.currentTime;

      // Sub-bass resonance thump
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.4);

      oscGain.gain.setValueAtTime(0.35, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);

      // Noise explosion burst
      const bufferSize = Math.floor(ctx.sampleRate * 0.45);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.38);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.005, now + 0.42);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
    } catch {
      // Audio safely suppressed
    }
  }, [soundEnabled, getAudioContext]);

  // Sound 3: Authentic Indian "Ladi" Firecrackers string (Tad-tad-tad-tad burst)
  const playLadiStringSound = useCallback((count = 6) => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx || ctx.state === 'suspended') return;

    for (let i = 0; i < count; i++) {
      const delayMs = i * (45 + Math.random() * 35);
      setTimeout(() => {
        if (!ctx || ctx.state === 'closed') return;
        try {
          const now = ctx.currentTime;
          const popOsc = ctx.createOscillator();
          const popGain = ctx.createGain();

          popOsc.type = 'triangle';
          popOsc.frequency.setValueAtTime(280 + Math.random() * 380, now);
          popOsc.frequency.exponentialRampToValueAtTime(70, now + 0.035);

          popGain.gain.setValueAtTime(0.22, now);
          popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

          popOsc.connect(popGain);
          popGain.connect(ctx.destination);

          popOsc.start(now);
          popOsc.stop(now + 0.045);
        } catch {
          // Ignore
        }
      }, delayMs);
    }
  }, [soundEnabled, getAudioContext]);

  // Sound 4: Fountain / Anar Sizzle Crackle
  const playFountainSizzleSound = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx || ctx.state === 'suspended') return;

    try {
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.16);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2800, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
    } catch {
      // Ignore
    }
  }, [soundEnabled, getAudioContext]);

  // Toggle sound with instant feedback and unlocking
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      const ctx = getAudioContext();
      if (ctx) {
        playLadiStringSound(5);
      }
    }
  };

  // -------------------------------------------------------------
  // 3. Timer Countdown: 60s Flash Period & Graceful Fade-Out
  // -------------------------------------------------------------
  const handleAutoClose = useCallback(() => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      setShowReopenFloatingBtn(true);
      onDismiss?.();
    }, 750);
  }, [onDismiss]);

  const handleManualClose = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      setShowReopenFloatingBtn(true);
      onDismiss?.();
    }, 650);
  };

  const handleReplay = () => {
    setTimeLeft(DURATION_SECONDS);
    setIsFadingOut(false);
    setHasEntered(false);
    setIsVisible(true);
    setShowReopenFloatingBtn(false);

    setTimeout(() => {
      setHasEntered(true);
      playLadiStringSound(6);
    }, 40);
  };

  useEffect(() => {
    if (!isVisible || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, isPaused, handleAutoClose]);

  // -------------------------------------------------------------
  // 4. Real Crackers Beside Banner Canvas Engine
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: FireworkParticle[] = [];
    const rockets: Rocket[] = [];
    const fountainSparks: FountainSpark[] = [];

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const festiveColors = [
      '#FFD700', // Gold
      '#FF9933', // Saffron
      '#FF3366', // Crimson Red
      '#00FFCC', // Cyan
      '#33FF66', // Green
      '#FFCC00', // Amber
      '#FFFFFF'  // Brilliant Silver
    ];

    // Spawn an aerial Top Shot Rocket specifically on left or right sides (beside banner)
    const launchRocket = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      
      const isLeft = Math.random() < 0.5;
      const x = isLeft 
        ? 30 + Math.random() * (rect.width * 0.25)
        : rect.width - (30 + Math.random() * (rect.width * 0.25));

      const targetY = 30 + Math.random() * (rect.height * 0.45);
      const color = festiveColors[Math.floor(Math.random() * festiveColors.length)];

      playRocketWhistleSound();

      rockets.push({
        x,
        y: rect.height,
        targetY,
        vx: (isLeft ? 1 : -1) * (0.5 + Math.random() * 1.5),
        vy: -(8 + Math.random() * 4),
        color,
        exploded: false
      });
    };

    // Explode a rocket into top shot fireworks burst with boom sound
    const explodeRocket = (x: number, y: number, color: string) => {
      const count = 50 + Math.floor(Math.random() * 35);
      playCrackerBurstSound();

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
        const speed = 2.5 + Math.random() * 4.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color,
          size: 2.2 + Math.random() * 2.6,
          decay: 0.015 + Math.random() * 0.015,
          gravity: 0.06,
          trail: []
        });
      }
    };

    // Spawn corner fountain sparks (Anar / Fulzadi) specifically beside the banner
    const emitFountain = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      
      // Left side anar fountain
      for (let i = 0; i < 3; i++) {
        fountainSparks.push({
          x: 25 + Math.random() * 40,
          y: rect.height - 15,
          vx: (Math.random() - 0.2) * 3.5,
          vy: -(4.5 + Math.random() * 5.5),
          alpha: 1,
          color: festiveColors[Math.floor(Math.random() * festiveColors.length)],
          size: 1.6 + Math.random() * 2,
          decay: 0.03 + Math.random() * 0.02
        });
      }

      // Right side anar fountain
      for (let i = 0; i < 3; i++) {
        fountainSparks.push({
          x: rect.width - (25 + Math.random() * 40),
          y: rect.height - 15,
          vx: (Math.random() - 0.8) * 3.5,
          vy: -(4.5 + Math.random() * 5.5),
          alpha: 1,
          color: festiveColors[Math.floor(Math.random() * festiveColors.length)],
          size: 1.6 + Math.random() * 2,
          decay: 0.03 + Math.random() * 0.02
        });
      }
    };

    let frameCount = 0;

    const render = () => {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();

      // Soft trail clearing
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.globalCompositeOperation = 'lighter';

      frameCount++;

      // Trigger rockets periodically
      if (frameCount % 50 === 0) {
        launchRocket();
      }
      if (frameCount % 85 === 0) {
        launchRocket();
      }

      // Occasional celebratory ladi firecracker burst
      if (frameCount % 240 === 0) {
        playLadiStringSound(5);
      }

      // Occasional anar sizzle
      if (frameCount % 110 === 0) {
        playFountainSizzleSound();
      }

      // Emit continuous corner fountains
      emitFountain();

      // Update & Draw Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;

        // Spark trail behind rocket
        ctx.fillStyle = '#FFE066';
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        if (r.y <= r.targetY || r.vy >= 0) {
          explodeRocket(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Update & Draw Particles (Explosions)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= 0.98;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Soft secondary brilliant core
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update & Draw Fountain Sparks
      for (let i = fountainSparks.length - 1; i >= 0; i--) {
        const s = fountainSparks[i];
        s.vy += 0.12;
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          fountainSparks.splice(i, 1);
          continue;
        }

        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [isVisible, playRocketWhistleSound, playCrackerBurstSound, playLadiStringSound, playFountainSizzleSound]);

  // -------------------------------------------------------------
  // 5. Interactive 3D Perspective Tilt on Mouse Move
  // -------------------------------------------------------------
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg
    const rotateY = ((x - centerX) / centerX) * 6; // Max 6deg
    setMousePos({ x: rotateY, y: rotateX });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleShare = () => {
    playLadiStringSound(3);
    const title = lang === 'EN'
      ? 'Shree Ishwatichi Mata 53rd Year Grand Visarjan Miravnuk (Wed 21 Oct 2026)'
      : 'श्री इश्वटीची माता ५३ वे वर्ष भव्य विसर्जन मिरवणूक (बुधवार २१ ऑक्टोबर २०२६)';
    const text = lang === 'EN'
      ? `Celebrate the Grand Visarjan Sohala of Shree Ishwatichi Mata today at 6:00 PM! Route: Ishwati Prasad Ground to Kalachowki Naka. Special attraction: Sai Musical Group Govandi.`
      : `श्री इश्वटीची माता ५३ वे वर्ष भव्य विसर्जन मिरवणूक आज सायं. ६:०० वाजता! स्थळ: इश्वटी प्रसाद पटांगण ते काळाचौकी नाका. खास आकर्षण: साई म्युझिकल ग्रुप - गोवंडी. सर्व भाविकांनी उपस्थित राहावे.`;
    
    void shareToWhatsApp({
      title,
      text,
      url: window.location.href,
      lang
    });
  };

  // Re-open Floating Badge when auto-closed
  if (!isVisible) {
    if (!showReopenFloatingBtn) return null;
    return (
      <div className="fixed bottom-20 right-4 z-40 animate-bounce">
        <button
          onClick={handleReplay}
          className="px-4 py-2 bg-gradient-to-r from-red-600 via-brand-saffron to-yellow-500 text-brand-maroon font-black text-xs sm:text-sm rounded-full border-2 border-brand-gold shadow-[0_0_25px_rgba(255,153,51,0.7)] flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all"
          title={lang === 'EN' ? 'View 53rd Visarjan Sohala Flash Banner (1 min)' : '५३ वे वर्ष विसर्जन सोहळा बॅनर पुन्हा पहा (१ मिनिट)'}
        >
          <span className="text-base animate-pulse">🎆</span>
          <span>{lang === 'EN' ? '🎉 Visarjan Sohala 2026' : '🎉 विसर्जन सोहळा २०२६'}</span>
          <RotateCcw className="w-3.5 h-3.5 text-brand-maroon" />
        </button>
      </div>
    );
  }

  const progressPercent = (timeLeft / DURATION_SECONDS) * 100;

  return (
    <>
      <section
        aria-label="53rd Year Grand Visarjan Sohala Celebratory Flash Showcase"
        className={`relative w-full z-30 select-none overflow-hidden ${
          isFadingOut 
            ? 'animate-banner-fade-out pointer-events-none' 
            : hasEntered 
              ? 'animate-banner-slide-down' 
              : 'opacity-0 -translate-y-10'
        }`}
        style={{
          background: 'linear-gradient(180deg, #160102 0%, #280204 45%, #100002 100%)',
          boxShadow: '0 16px 45px rgba(255, 60, 0, 0.45)'
        }}
      >
        {/* Dynamic Canvas for Real Fireworks, Top Shots & Fountain Crackers */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
        />

        {/* Top Celebration Running Lights Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 via-red-500 via-orange-400 to-yellow-400 bg-[length:200%_100%] animate-[gradient_3s_linear_infinite]" />

        {/* 60-Second Auto-Disappear Timer Control Header */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2.5 pb-1 flex items-center justify-between gap-3 text-xs text-brand-gold font-sans relative z-30">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-[10px] sm:text-xs tracking-wider uppercase animate-pulse flex items-center gap-1 shadow">
              <Flame className="w-3.5 h-3.5 text-yellow-300" />
              {lang === 'EN' ? 'Historic Day' : 'आजचा ऐतिहासिक सोहळा'}
            </span>
            <span className="font-bold text-amber-200 text-xs sm:text-sm flex items-center gap-1.5">
              <span>🎆</span>
              <span>
                {lang === 'EN' 
                  ? '53rd Year Grand Visarjan Miravnuk 2026' 
                  : '५३ वे वर्ष : श्री इश्वटीची माता भव्य विसर्जन सोहळा'}
              </span>
            </span>
          </div>

          {/* Controls: Sound, Fullscreen, Timer & Close */}
          <div className="flex items-center gap-2">
            {/* Real Crackers Sound Toggle with animated visualizer */}
            <button
              onClick={handleToggleSound}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 ${
                soundEnabled 
                  ? 'bg-amber-500/25 text-yellow-300 border-amber-400 shadow-[0_0_12px_rgba(255,200,0,0.5)]' 
                  : 'bg-black/60 text-gray-400 border-white/20 hover:text-white'
              }`}
              title={soundEnabled ? (lang === 'EN' ? 'Mute Firecrackers Sound' : 'फटाक्यांचा आवाज म्यूट करा') : (lang === 'EN' ? 'Enable Firecrackers Sound' : 'फटाक्यांचा पावन नाद ऐका')}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-brand-gold animate-bounce" />
                  <span className="text-[11px] font-semibold text-yellow-300 hidden sm:inline">
                    {lang === 'EN' ? 'Crackers Sound ON' : 'फटाके आवाज सुरू'}
                  </span>
                  <span className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-3 bg-yellow-400 animate-pulse" />
                    <span className="w-0.5 h-1.5 bg-yellow-400 animate-pulse delay-75" />
                    <span className="w-0.5 h-2.5 bg-yellow-400 animate-pulse delay-150" />
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[11px] hidden sm:inline text-gray-300">
                    {lang === 'EN' ? 'Sound Muted' : 'आवाज बंद'}
                  </span>
                </>
              )}
            </button>

            {/* Countdown Badge */}
            <div 
              className="bg-black/70 border border-brand-gold/50 rounded-lg px-2.5 py-1 text-[11px] font-mono font-bold text-yellow-300 flex items-center gap-1.5 shadow"
              title={lang === 'EN' ? `Auto-closing in ${timeLeft}s without disturbing page` : `वेबसाईट सुरळीत सुरू ठेवण्यासाठी ${timeLeft} सेकंदात आपोआप बंद होईल`}
            >
              <Clock className="w-3.5 h-3.5 text-brand-saffron animate-spin" />
              <span>{timeLeft}s</span>
            </div>

            {/* Close Button */}
            <button
              onClick={handleManualClose}
              className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-800 text-red-200 hover:text-white border border-red-500/50 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow"
              title={lang === 'EN' ? 'Close Visarjan banner now' : 'बॅनर आताच बंद करा'}
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{lang === 'EN' ? 'Close' : 'बंद करा'}</span>
            </button>
          </div>
        </div>

        {/* 60-Second Linear Progress Bar */}
        <div className="w-full bg-black/60 h-1 relative overflow-hidden z-30">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-red-500 transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(255,153,51,0.9)]"
            style={{ width: `${100 - progressPercent}%` }}
          />
        </div>

        {/* MAIN SHOWCASE: OCCUPIES FULL SPACE WITH CRACKERS BESIDE IT & PURE EXTRACTED BANNER */}
        <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 relative z-30 flex flex-col items-center justify-center">
          
          <div className="relative w-full flex items-center justify-center">

            {/* Left Decorative Crackers & Anar Flares (Beside Banner) */}
            <div className="hidden lg:flex flex-col items-center justify-around h-[560px] w-36 py-4 px-2 z-20 pointer-events-none select-none">
              <div className="flex flex-col items-center gap-1 animate-pulse">
                <span className="text-2xl drop-shadow-[0_0_12px_rgba(255,200,0,0.9)]">✨</span>
                <span className="text-xs font-black text-amber-300 tracking-wider">आतिशबाजी</span>
              </div>
              <div className="p-3 rounded-full bg-amber-500/10 border border-brand-gold/40 shadow-[0_0_20px_rgba(255,180,0,0.3)] animate-spin [animation-duration:12s]">
                <Sparkles className="w-8 h-8 text-yellow-300" />
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <Flame className="w-6 h-6 text-brand-saffron animate-bounce" />
                <span className="text-[10px] font-bold text-yellow-200">पावन सोहळा</span>
              </div>
            </div>

            {/* Center: The Extracted Pure Banner occupying the Full Central Space with 3D Depth */}
            <div 
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => playLadiStringSound(4)}
              className="relative rounded-2xl overflow-hidden border-2 sm:border-4 border-brand-gold/85 ring-2 ring-yellow-400/40 transition-transform duration-200 ease-out shadow-[0_25px_65px_rgba(0,0,0,0.95),0_0_45px_rgba(255,153,51,0.5)] group bg-black z-20 max-w-full cursor-pointer"
              style={{
                transform: `perspective(1200px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg) translateZ(10px)`,
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Traditional 3D Corner Temple Ornaments */}
              <div className="absolute top-2 left-2 z-20 text-brand-gold font-serif text-lg opacity-90 pointer-events-none drop-shadow">卐</div>
              <div className="absolute top-2 right-2 z-20 text-brand-gold font-serif text-lg opacity-90 pointer-events-none drop-shadow">卐</div>
              <div className="absolute bottom-2 left-2 z-20 text-brand-gold font-serif text-lg opacity-90 pointer-events-none drop-shadow">ॐ</div>
              <div className="absolute bottom-2 right-2 z-20 text-brand-gold font-serif text-lg opacity-90 pointer-events-none drop-shadow">ॐ</div>

              {/* Ambient Soft Aura Glow Behind Poster */}
              <div 
                className="absolute inset-0 w-full h-full bg-center bg-cover filter blur-2xl opacity-40 scale-110 pointer-events-none"
                style={{ backgroundImage: `url(${bannerImgSrc})` }}
              />

              {/* Pure Extracted Banner Image: 100% visible, completely occupies full height & width */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  playLadiStringSound(5);
                  setIsModalOpen(true);
                }}
                className="relative w-full flex items-center justify-center p-1.5 sm:p-2 overflow-hidden z-10"
                title={lang === 'EN' ? 'Click to view high-definition full Visarjan banner' : 'श्री इश्वटीची माता विसर्जन सोहळा संपूर्ण बॅनर पहा'}
              >
                <img 
                  src={bannerImgSrc} 
                  alt="श्री इश्वटीची माता विसर्जन सोहळा - ५३ वे वर्ष - यंग इश्वटी नवरात्रौत्सव मंडळ"
                  className="w-auto h-auto max-h-[500px] sm:max-h-[580px] md:max-h-[640px] lg:max-h-[680px] max-w-full object-contain mx-auto block rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.015]"
                  loading="eager"
                />

                {/* Shimmer Light Reflection Sweep Across 3D Surface */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                {/* Top View Fullscreen Overlay Badge */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 bg-black/85 hover:bg-brand-maroon text-brand-gold border border-brand-gold/60 text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-1.5 shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Maximize2 className="w-3.5 h-3.5 text-brand-gold" />
                  <span>{lang === 'EN' ? 'View Fullscreen' : 'मोठ्या आकारात पहा'}</span>
                </div>
              </div>

              {/* Banner Integrated Bottom Bar */}
              <div className="bg-gradient-to-r from-[#2F0205] via-[#1A0002] to-[#2F0205] px-3 sm:px-4 py-2 flex items-center justify-between gap-2 border-t border-brand-gold/40 text-xs text-amber-100 relative z-20">
                <div className="flex items-center gap-2">
                  <span className="font-black text-brand-gold flex items-center gap-1 text-[11px] sm:text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-brand-saffron" />
                    <span>{lang === 'EN' ? '53rd Year Visarjan Sohala' : '५३ वे वर्ष विसर्जन सोहळा'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare();
                    }}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-400/60 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow cursor-pointer active:scale-95"
                    title={lang === 'EN' ? 'Share Visarjan invitation on WhatsApp' : 'विसर्जन निमंत्रण व्हाट्सॲपवर शेअर करा'}
                  >
                    <Share2 className="w-3 h-3" />
                    <span>{lang === 'EN' ? 'WhatsApp' : 'शेअर'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playLadiStringSound(5);
                      setIsModalOpen(true);
                    }}
                    className="px-2.5 py-1 bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-black rounded-lg text-[11px] transition-all flex items-center gap-1 shadow cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Eye className="w-3 h-3" />
                    <span>{lang === 'EN' ? 'Open HD' : 'पोस्टर उघडा'}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Decorative Crackers & Anar Flares (Beside Banner) */}
            <div className="hidden lg:flex flex-col items-center justify-around h-[560px] w-36 py-4 px-2 z-20 pointer-events-none select-none">
              <div className="flex flex-col items-center gap-1 animate-pulse">
                <span className="text-2xl drop-shadow-[0_0_12px_rgba(255,200,0,0.9)]">🎆</span>
                <span className="text-xs font-black text-yellow-300 tracking-wider">टॉप शॉट्स</span>
              </div>
              <div className="p-3 rounded-full bg-amber-500/10 border border-brand-gold/40 shadow-[0_0_20px_rgba(255,180,0,0.3)] animate-spin [animation-duration:15s] [animation-direction:reverse]">
                <Zap className="w-8 h-8 text-amber-300" />
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <Flame className="w-6 h-6 text-red-500 animate-bounce" />
                <span className="text-[10px] font-bold text-amber-200">अनार कारंजे</span>
              </div>
            </div>

          </div>

          {/* Clean Integrated Event Info Ribbon Below Banner */}
          <div className="mt-3 w-full max-w-4xl px-3 py-2 rounded-xl bg-black/75 border border-brand-gold/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs text-amber-100 shadow-xl">
            <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
              <span className="font-bold text-yellow-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                <span>{lang === 'EN' ? 'Wed, 21 Oct 2026' : 'बुधवार, २१ ऑक्टोबर २०२६'}</span>
              </span>

              <span className="text-amber-200 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-saffron" />
                <span>{lang === 'EN' ? '6:00 PM Onwards' : 'सायंकाळी ६:०० वाजता'}</span>
              </span>

              <span className="text-gray-300 hidden sm:flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{lang === 'EN' ? 'Ishwati Prasad Ground to Kalachowki Naka' : 'इश्वटी प्रसाद पटांगण ते काळाचौकी नाका'}</span>
              </span>

              <span className="text-amber-300 hidden md:flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>{lang === 'EN' ? 'Sai Musical Group - Govandi' : 'साई म्युझिकल ग्रुप - गोवंडी'}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition-all cursor-pointer active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{lang === 'EN' ? 'Share on WhatsApp' : 'निमंत्रण शेअर करा'}</span>
              </button>

              <button
                onClick={() => {
                  playLadiStringSound(5);
                  setIsModalOpen(true);
                }}
                className="px-3 py-1 bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-black text-xs rounded-lg flex items-center gap-1 shadow hover:scale-105 transition-all cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{lang === 'EN' ? 'Fullscreen' : 'मोठे पोस्टर'}</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* FULLSCREEN IMMERSIVE 3D MODAL VIEWER */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          {/* Modal Header */}
          <div className="w-full max-w-4xl flex items-center justify-between pb-3 border-b border-brand-gold/30 text-white">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🕉️</span>
              <div>
                <h3 className="text-base sm:text-lg font-black text-brand-gold">
                  {lang === 'EN' 
                    ? 'Shree Ishwatichi Mata 53rd Year Visarjan Sohala' 
                    : 'श्री इश्वटीची माता ५३ वे वर्ष भव्य विसर्जन सोहळा'}
                </h3>
                <p className="text-xs text-amber-200/80">
                  {lang === 'EN' 
                    ? 'Wednesday, 21 Oct 2026 • 6:00 PM • Kalachowki, Mumbai' 
                    : 'बुधवार, २१ ऑक्टोबर २०२६ • सायं. ६:०० वाजता • काळाचौकी, मुंबई'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'EN' ? 'WhatsApp' : 'शेअर'}</span>
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Poster Canvas - Clean Extracted Artwork */}
          <div className="my-auto py-4 flex items-center justify-center max-h-[82vh] w-full max-w-3xl">
            <div className="relative rounded-2xl overflow-hidden border-2 sm:border-4 border-brand-gold/80 shadow-[0_0_60px_rgba(255,153,51,0.5)] bg-black max-h-[78vh]">
              <img 
                src={bannerImgSrc} 
                alt="श्री इश्वटीची माता विसर्जन सोहळा २०२६" 
                className="max-h-[76vh] w-auto object-contain mx-auto"
              />
            </div>
          </div>

          {/* Modal Footer Key Info Badges */}
          <div className="w-full max-w-4xl pt-3 border-t border-brand-gold/30 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-100">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-yellow-300 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-rose-400" />
                {lang === 'EN' ? 'Route: Ishwati Prasad Ground to Kalachowki Naka' : 'मार्ग: इश्वटी प्रसाद पटांगण ते काळाचौकी नाका'}
              </span>
              <span className="text-gray-300 flex items-center gap-1">
                <Music className="w-4 h-4 text-brand-gold" />
                {lang === 'EN' ? 'Sai Musical Group - Govandi' : 'साई म्युझिकल ग्रुप - गोवंडी'}
              </span>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2 bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-black rounded-xl text-xs shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              {lang === 'EN' ? 'Done / Back to Website' : 'दर्शन पूर्ण / मुख्य पृष्ठावर जा'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
