/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { aartiAudioEngine } from '../utils/aartiAudioEngine';

interface HeroAudioPlayerProps {
  lang: 'EN' | 'MR';
}

export const HeroAudioPlayer: React.FC<HeroAudioPlayerProps> = ({ lang }) => {
  const [isPlaying, setIsPlaying] = useState(() => aartiAudioEngine.getIsPlaying());
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [currentLine, setCurrentLine] = useState({ mr: '', en: '' });
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(16).fill(4));
  
  const animFrameRef = useRef<number | null>(null);

  // Sync state & lyric callbacks from Web Audio engine
  useEffect(() => {
    const unsubState = aartiAudioEngine.onStateChange(playing => {
      setIsPlaying(playing);
    });

    const unsubLyric = aartiAudioEngine.onLyricChange((mr, en) => {
      setCurrentLine({ mr, en });
    });

    return () => {
      unsubState();
      unsubLyric();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Visualizer loop reading from Web Audio API AnalyserNode
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      setVisualizerData(new Array(16).fill(3));
      return;
    }

    const updateVisualizer = () => {
      const analyser = aartiAudioEngine.getAnalyser();
      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // Sample 16 frequency bands
        const sampled: number[] = [];
        const step = Math.floor(bufferLength / 16);
        for (let i = 0; i < 16; i++) {
          const val = dataArray[i * step] || 0;
          const height = Math.max(4, Math.round((val / 255) * 28));
          sampled.push(height);
        }
        setVisualizerData(sampled);
      }
      animFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    animFrameRef.current = requestAnimationFrame(updateVisualizer);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlayback = () => {
    if (isPlaying) {
      aartiAudioEngine.silence();
      setIsPlaying(false);
    } else {
      aartiAudioEngine.playAarti();
      setIsPlaying(true);
      if (isMuted) {
        setIsMuted(false);
        aartiAudioEngine.setVolume(volume);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
    aartiAudioEngine.setVolume(val);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      aartiAudioEngine.setVolume(volume || 0.8);
    } else {
      setIsMuted(true);
      aartiAudioEngine.setVolume(0);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-4 transition-all duration-300">
      {/* Outer audio console container with temple gold trim */}
      <div className="relative rounded-2xl bg-gradient-to-r from-brand-maroon/95 via-black/90 to-brand-maroon/95 border-2 border-brand-gold/40 shadow-2xl backdrop-blur-md p-4 sm:p-5">
        
        {/* Subtle decorative aura glow when playing */}
        {isPlaying && (
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-gold/25 via-brand-saffron/25 to-brand-gold/25 rounded-2xl blur-md -z-10 animate-pulse pointer-events-none" />
        )}

        {/* Top Control Bar: Title & Voice Badge */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-brand-gold/20 pb-3 mb-3">
          
          {/* Aarti Title & Devotional Vocal Indicator */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto text-left">
            <span className="text-2xl select-none">🪔</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-serif font-black text-sm sm:text-base text-brand-gold tracking-wide">
                  {lang === 'EN' ? 'Shree Ishwatichi Mata Aarti (Marathi)' : 'श्री ईश्वटीची माता आरती (मराठी)'}
                </h4>
                <span className="text-[10px] font-serif font-bold bg-brand-gold/15 text-brand-gold px-2.5 py-0.5 rounded-full border border-brand-gold/40 flex items-center gap-1 shadow-sm">
                  <span>👩</span>
                  <span>{lang === 'EN' ? 'Female Devotional Voice' : 'स्त्री स्वर गायन'}</span>
                </span>
              </div>
              <p className="text-[11px] text-gray-300 font-sans mt-0.5">
                {lang === 'EN' ? 'Authentic devotional rhythm in Raga Bhupali with sacred melodies' : 'पारंपरिक राग भूप, पावन नाद व टाळ-मृदंग ताल'}
              </p>
            </div>
          </div>

          {/* Quick status pill */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-brand-saffron font-serif font-medium bg-black/40 px-3 py-1 rounded-full border border-white/10">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span>{lang === 'EN' ? 'Temple Sanctum Audio' : 'मंदिरातील पवित्र महाआरती'}</span>
          </div>

        </div>

        {/* Main Audio Transport Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Left section: Play/Pause Button & Current Line ticker */}
          <div className="flex items-center gap-3.5 w-full sm:w-auto min-w-0">
            {/* Master Aarti Toggle Button */}
            <button
              onClick={togglePlayback}
              className={`relative h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${
                isPlaying
                  ? 'bg-gradient-to-br from-brand-saffron via-amber-500 to-brand-gold border-white text-brand-maroon shadow-brand-gold/40 scale-105'
                  : 'bg-black/60 hover:bg-brand-red/40 border-brand-gold/60 text-brand-gold hover:text-white'
              }`}
              title={isPlaying ? (lang === 'EN' ? 'Silence Aarti' : 'आरती शांत करा') : (lang === 'EN' ? "Play Marathi Aarti" : "मराठी आरती सुरू करा")}
              aria-label={isPlaying ? 'Silence Audio' : "Play Marathi Aarti"}
            >
              {isPlaying ? (
                <div className="flex items-center justify-center">
                  <Pause className="h-6 w-6 fill-current animate-pulse" />
                </div>
              ) : (
                <div className="flex items-center justify-center ml-0.5">
                  <Play className="h-6 w-6 fill-current" />
                </div>
              )}

              {/* Pulsing ring indicator when playing */}
              {isPlaying && (
                <span className="absolute -inset-1 rounded-full border border-brand-gold animate-ping opacity-60 pointer-events-none" />
              )}
            </button>

            {/* Current Chanting Line Display */}
            <div className="text-left flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                  isPlaying 
                    ? 'bg-green-950/80 text-green-300 border-green-500/40 animate-pulse'
                    : 'bg-black/50 text-gray-400 border-white/10'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isPlaying ? 'bg-green-400' : 'bg-gray-500'}`} />
                  {isPlaying 
                    ? (lang === 'EN' ? 'Aarti Playing' : 'आरती सुरू आहे')
                    : (lang === 'EN' ? 'Ready to Play' : 'सुरू करण्यासाठी दाबा')}
                </span>

                <span className="text-[10px] text-brand-gold/80 font-mono hidden md:inline">
                  • 👩 स्त्री स्वर
                </span>
              </div>

              {/* Real-time Singing Lyric Ticker in Marathi */}
              <div className="text-xs sm:text-sm text-brand-saffron font-bold truncate mt-1">
                {isPlaying ? (
                  <div className="flex items-center gap-1.5 animate-pulse">
                    <Music className="h-3.5 w-3.5 shrink-0 text-brand-gold" />
                    <span className="font-serif text-white tracking-wide">
                      {currentLine.mr || 'जय देवी जय देवी जय ईश्वटी माते...'}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-300 text-xs font-normal">
                    {lang === 'EN' 
                      ? 'Click play to start Marathi Aarti in female voice with sacred melodies' 
                      : 'स्त्री स्वरात पावन मराठी आरती ऐकण्यासाठी प्ले बटण दाबा'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right section: Visualizer bars + Volume control + Lyrics modal toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-white/10 pt-2.5 sm:pt-0">
            
            {/* Realtime Audio Equalizer Bars */}
            <div 
              className="flex items-end gap-1 h-8 px-2 py-1 bg-black/60 rounded-lg border border-brand-gold/20"
              title={isPlaying ? 'Live Audio Frequency Visualizer' : 'Silence'}
            >
              {visualizerData.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}px` }}
                  className={`w-1 rounded-t-sm transition-all duration-75 ${
                    isPlaying
                      ? i % 3 === 0
                        ? 'bg-brand-gold'
                        : i % 2 === 0
                        ? 'bg-brand-saffron'
                        : 'bg-amber-300'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            {/* Volume & Mute control */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="p-1.5 text-gray-300 hover:text-brand-gold rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-gray-400" />
                ) : (
                  <Volume2 className="h-4 w-4 text-brand-gold" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-gold"
                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                aria-label="Volume slider"
              />
            </div>

            {/* Full lyrics expander toggle */}
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className="px-2.5 py-1.5 rounded-lg bg-black/50 hover:bg-brand-red/30 border border-brand-gold/30 text-brand-gold text-xs font-serif font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title={showLyrics ? 'Hide Lyrics' : 'View Full Marathi Aarti Lyrics'}
            >
              <span>{lang === 'EN' ? 'Lyrics' : 'संपूर्ण आरती'}</span>
              {showLyrics ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

        </div>

        {/* Collapsible Full Marathi Aarti Lyrics Sheet */}
        {showLyrics && (
          <div className="mt-4 pt-3.5 border-t border-brand-gold/25 text-left font-serif space-y-3 animate-fade-in bg-black/60 p-4 sm:p-5 rounded-xl border border-brand-gold/20">
            <div className="flex items-center justify-between border-b border-brand-gold/15 pb-2">
              <h5 className="text-sm font-bold uppercase tracking-wider text-brand-gold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-gold" />
                <span>॥ श्री ईश्वटीची माता आरती (मराठी) ॥</span>
              </h5>
              <span className="text-[10px] text-gray-300 font-sans bg-brand-maroon px-2 py-0.5 rounded border border-brand-gold/30">
                {lang === 'EN' ? 'Traditional Marathi Aarti' : 'पारंपरिक मराठी रचना'}
              </span>
            </div>

            <div className="text-xs sm:text-sm text-gray-100 leading-relaxed font-serif space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
              <div className="bg-brand-maroon/40 p-2.5 rounded-lg border-l-2 border-brand-gold">
                <p className="font-bold text-brand-gold">
                  जय देवी जय देवी जय ईश्वटी माते ।<br />
                  प्रसन्न होऊनि पावे भक्तांच्या हाके ॥ धृ. ॥
                </p>
              </div>

              <div>
                <p>
                  स्वयंभू पाषाणी प्रगटली पावन मूर्ती ।<br />
                  भक्तजन धावती कराया तव आरती ।<br />
                  कष्ट निवारुनी देई सुख समृद्धी ।<br />
                  हात जोडुनी चरणी नमितो आदिशक्ती ॥ १ ॥<br />
                  <span className="text-brand-saffron text-xs italic">जय देवी जय देवी जय ईश्वटी माते...</span>
                </p>
              </div>

              <div>
                <p>
                  सिंदूर चर्चित भाळ शोभतो भारी ।<br />
                  अखंड ज्योती तेवे मातेच्या द्वारी ।<br />
                  अन्नछत्र चालती दयाळू तुझी करुणा ।<br />
                  संकट हरुनी रक्षी आमुच्या जीवना ॥ २ ॥<br />
                  <span className="text-brand-saffron text-xs italic">जय देवी जय देवी जय ईश्वटी माते...</span>
                </p>
              </div>

              <div>
                <p>
                  कर्पूर आरती दीप ओवाळू प्रेमे ।<br />
                  अखंड जयघोष करू मंगल नेमे ।<br />
                  ईश्वटी माते तूच आमुची तारक ।<br />
                  कृपाछत्र असू दे अखंड रक्षक ॥ ३ ॥<br />
                  <span className="font-bold text-brand-gold">
                    जय देवी जय देवी जय ईश्वटी माते ।<br />
                    प्रसन्न होऊनि पावे भक्तांच्या हाके ॥
                  </span>
                </p>
              </div>

              <p className="text-brand-saffron text-xs pt-1 border-t border-white/10 font-sans">
                {lang === 'EN'
                  ? 'Devotees reciting this sacred Marathi Aarti receive peace, protection, and boundless divine grace from Shree Ishwatichi Mata.'
                  : 'या पावन मराठी आरतीच्या श्रवणाने व पठणाने सर्व संकटांचे निवारण होऊन घरात सुख, समृद्धी व शांती नांदते.'}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HeroAudioPlayer;
