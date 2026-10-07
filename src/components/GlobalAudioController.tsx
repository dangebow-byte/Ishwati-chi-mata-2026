/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, Sparkles, X, Disc } from 'lucide-react';
import { templeSoundboardEngine, SACRED_MANTRAS, SoundboardState } from '../utils/templeSoundboardEngine';

interface GlobalAudioControllerProps {
  lang: 'EN' | 'MR';
  onNavigateToDarshan?: () => void;
}

export const GlobalAudioController: React.FC<GlobalAudioControllerProps> = ({
  lang,
  onNavigateToDarshan
}) => {
  const [state, setState] = useState<SoundboardState>(() => templeSoundboardEngine.getState());

  useEffect(() => {
    const unsub = templeSoundboardEngine.onStateChange(nextState => {
      setState(nextState);
    });
    return unsub;
  }, []);

  const isActive = state.isMantraPlaying || state.isShankhPlaying || state.isBackgroundAmbiance;

  if (!isActive) return null;

  const currentMantra = SACRED_MANTRAS.find(m => m.id === state.activeMantraId) || SACRED_MANTRAS[0];

  const handleTogglePlayPause = () => {
    if (state.isMantraPlaying) {
      templeSoundboardEngine.stopMantraChant();
    } else {
      templeSoundboardEngine.startMantraChant(state.activeMantraId);
    }
  };

  const handleStopAll = () => {
    templeSoundboardEngine.stopMantraChant();
    if (state.isBackgroundAmbiance) {
      templeSoundboardEngine.toggleBackgroundAmbiance();
    }
  };

  return (
    <aside 
      className="fixed bottom-16 sm:bottom-4 right-2 sm:right-6 z-40 max-w-[calc(100vw-16px)] sm:max-w-md w-full bg-gradient-to-r from-[#2a0101]/95 via-black/95 to-[#240101]/95 backdrop-blur-xl border-2 border-brand-gold/70 rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_20px_rgba(255,153,51,0.35)] animate-slide-up"
      role="region"
      aria-label="High-Fidelity Temple Audio Controller"
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left: Animated Icon & Track Info */}
        <div 
          onClick={onNavigateToDarshan}
          className="flex items-center gap-2 min-w-0 cursor-pointer flex-1 group"
          title={lang === 'EN' ? 'View Live Darshan Soundboard' : 'थेट दर्शन दालन पहा'}
        >
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-brand-gold to-brand-saffron p-0.5 shrink-0 shadow-md">
            <div className="h-full w-full rounded-[10px] bg-brand-maroon flex items-center justify-center text-sm">
              {state.isShankhPlaying ? '📯' : '🕉️'}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="text-[9px] font-mono font-bold uppercase text-brand-gold truncate">
                {state.isShankhPlaying
                  ? (lang === 'EN' ? 'Resonant Shankhnaad' : 'पवित्र शंखनाद')
                  : state.isMantraPlaying
                  ? (lang === 'EN' ? 'Vocal Vedic Mantra' : 'स्वरयुक्त मंत्र जप')
                  : (lang === 'EN' ? 'Akhand Soundscape' : 'अखंड ध्यान ध्वनी')}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-sans font-bold text-white truncate group-hover:text-brand-gold transition-colors">
              {state.isShankhPlaying 
                ? (lang === 'EN' ? 'Authentic 432Hz Conch Blast' : '४३२Hz पावन शंख प्रतिध्वनी')
                : (lang === 'EN' ? currentMantra.nameEN : currentMantra.nameMR)}
            </p>
          </div>
        </div>

        {/* Center/Right: Play/Pause, Volume, Mute & Close Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Play/Pause Button */}
          {!state.isShankhPlaying && (
            <button
              onClick={handleTogglePlayPause}
              className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 border border-brand-gold/40 text-brand-gold hover:text-white transition-all cursor-pointer"
              title={state.isMantraPlaying ? 'Pause' : 'Play'}
              aria-label="Play or pause mantra"
            >
              {state.isMantraPlaying ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5 text-green-400" />
              )}
            </button>
          )}

          {/* Quick Mute Toggle */}
          <button
            onClick={() => templeSoundboardEngine.toggleMute()}
            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 border border-brand-gold/40 text-brand-gold hover:text-white transition-all cursor-pointer"
            title={state.isMuted ? 'Unmute' : 'Mute'}
            aria-label="Toggle mute"
          >
            {state.isMuted || state.volume === 0 ? (
              <VolumeX className="h-3.5 w-3.5 text-red-400" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-brand-saffron" />
            )}
          </button>

          {/* Accessible Volume Slider (Desktop & Tablet) */}
          <div className="hidden xs:flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-lg border border-white/10">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={state.isMuted ? 0 : state.volume}
              onChange={(e) => templeSoundboardEngine.setVolume(parseFloat(e.target.value))}
              className="w-14 sm:w-18 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-gold"
              aria-label="Global Volume Control"
            />
            <span className="font-mono text-[9px] text-brand-gold w-6 text-right">
              {state.isMuted ? '0%' : `${Math.round(state.volume * 100)}%`}
            </span>
          </div>

          {/* Stop and dismiss */}
          <button
            onClick={handleStopAll}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all cursor-pointer ml-0.5"
            title={lang === 'EN' ? 'Stop audio' : 'ध्वनी थांबवा'}
            aria-label="Stop audio"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
