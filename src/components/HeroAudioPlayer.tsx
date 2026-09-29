/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Sparkles, Sliders, ChevronDown, ChevronUp, Bell, Heart } from 'lucide-react';
import { aartiAudioEngine } from '../utils/aartiAudioEngine';

interface HeroAudioPlayerProps {
  lang: 'EN' | 'MR';
}

export const HeroAudioPlayer: React.FC<HeroAudioPlayerProps> = ({ lang }) => {
  const [isPlaying, setIsPlaying] = useState(() => aartiAudioEngine.getIsPlaying());
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [currentWord, setCurrentWord] = useState({ mr: '', en: '' });
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(16).fill(4));
  
  const animFrameRef = useRef<number | null>(null);

  // Sync state & lyric callbacks from Web Audio engine
  useEffect(() => {
    const unsubState = aartiAudioEngine.onStateChange(playing => {
      setIsPlaying(playing);
    });

    const unsubLyric = aartiAudioEngine.onLyricChange((mr, en) => {
      setCurrentWord({ mr, en });
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
          // Normalize to pixel height between 4 and 28
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
    <div className="w-full max-w-2xl mx-auto my-4 transition-all duration-300">
      {/* Outer audio console container with temple gold trim */}
      <div className="relative rounded-2xl bg-gradient-to-r from-brand-maroon/90 via-black/85 to-brand-maroon/90 border border-brand-gold/40 shadow-2xl backdrop-blur-md p-3.5 sm:p-5">
        
        {/* Subtle decorative aura glow when playing */}
        {isPlaying && (
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-gold/20 via-brand-saffron/20 to-brand-gold/20 rounded-2xl blur-md -z-10 animate-pulse pointer-events-none" />
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Left section: Play/Silence toggle & Title */}
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            {/* Master Aarti / Silence Toggle Button */}
            <button
              onClick={togglePlayback}
              className={`relative h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${
                isPlaying
                  ? 'bg-gradient-to-br from-brand-saffron via-amber-500 to-brand-gold border-white text-brand-maroon shadow-brand-gold/40 scale-105'
                  : 'bg-black/60 hover:bg-brand-red/40 border-brand-gold/60 text-brand-gold hover:text-white'
              }`}
              title={isPlaying ? (lang === 'EN' ? 'Silence Aarti' : 'आरती शांत करा (Silence)') : (lang === 'EN' ? "Play 'Om Jai Ishwati Mata' Aarti" : "आरती सुरू करा")}
              aria-label={isPlaying ? 'Silence Audio' : "Play 'Om Jai Ishwati Mata' Aarti"}
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

            {/* Aarti info & current status */}
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
                    : (lang === 'EN' ? 'Silence' : 'शांतता (Silence)')}
                </span>

                <span className="text-[10px] text-brand-gold/80 font-mono hidden md:inline">
                  • Web Audio API
                </span>
              </div>

              <h4 className="font-serif font-bold text-sm sm:text-base text-white tracking-wide truncate mt-0.5">
                {lang === 'EN' ? "'Om Jai Ishwati Mata' Aarti" : 'ॐ जय ईश्वटी माता आरती'}
              </h4>

              {/* Real-time chanting lyric ticker or status line */}
              <div className="text-xs text-brand-saffron/90 font-medium truncate flex items-center gap-1.5">
                {isPlaying ? (
                  <>
                    <Music className="h-3 w-3 shrink-0 animate-bounce" />
                    <span className="italic font-serif">
                      {currentWord.mr ? `"${currentWord.mr}"` : (lang === 'EN' ? 'Sacred Devotional Chants...' : 'पवित्र नामघोष व घंटानाद...')}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400 text-[11px]">
                    {lang === 'EN' ? 'Click to toggle Aarti on/off' : 'आरती ऐकण्यासाठी किंवा शांततेसाठी दाबा'}
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
            <div className="flex items-center gap-2">
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
              className="px-2.5 py-1.5 rounded-lg bg-black/40 hover:bg-brand-red/30 border border-brand-gold/25 text-brand-gold text-[11px] font-serif font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title={showLyrics ? 'Hide Lyrics' : 'View Full Aarti Lyrics'}
            >
              <span>{lang === 'EN' ? 'Lyrics' : 'आरती संग्रह'}</span>
              {showLyrics ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

        </div>

        {/* Collapsible Full Aarti Lyrics Sheet */}
        {showLyrics && (
          <div className="mt-4 pt-3.5 border-t border-brand-gold/20 text-left font-serif space-y-2.5 animate-fade-in bg-black/40 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-brand-saffron" />
                {lang === 'EN' ? 'Complete Aarti Stotra' : 'श्री ईश्वटीची माता संपूर्ण आरती'}
              </h5>
              <span className="text-[10px] text-gray-400 font-mono">
                {lang === 'EN' ? 'Sung in Raga Bhupali / Bilawal' : 'राग भूप / बिलावल'}
              </span>
            </div>

            <div className="text-xs sm:text-sm text-gray-200 leading-relaxed font-serif space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              <p>
                ॐ जय ईश्वटी माता, मैया जय ईश्वटी माता ।<br />
                जो ध्यावे फल पावे, दुःख बिनसे मन का ॥ ॐ जय... ॥
              </p>
              <p>
                सुख संपत्ती घर आवे, कष्ट मिटे तन का ।<br />
                मात-पिता तुम मेरे, शरण गहूँ किसकी ॥ ॐ जय... ॥
              </p>
              <p>
                तुम पूरण परमात्मा, तुम अंतर्यामी ।<br />
                पारब्रह्म परमेश्वर, तुम सबके स्वामी ॥ ॐ जय... ॥
              </p>
              <p className="text-brand-saffron text-xs italic">
                {lang === 'EN'
                  ? 'Devotees chanting this Aarti experience boundless peace, inner strength, and prosperity under the shelter of Shree Ishwatichi Mata.'
                  : 'या पावन आरतीच्या श्रवणाने व पठणाने सर्व मनोकामना पूर्ण होऊन घरात सुख-शांती नांदते.'}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HeroAudioPlayer;
