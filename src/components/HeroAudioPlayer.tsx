/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Music, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Youtube, 
  ExternalLink, 
  Video, 
  Radio 
} from 'lucide-react';
import { aartiAudioEngine } from '../utils/aartiAudioEngine';

interface HeroAudioPlayerProps {
  lang: 'EN' | 'MR';
}

type AartiTrackId = 'ashtami' | 'traditional';

export const HeroAudioPlayer: React.FC<HeroAudioPlayerProps> = ({ lang }) => {
  // Selected Aarti Track
  const [activeTrack, setActiveTrack] = useState<AartiTrackId>('ashtami');

  // Traditional Synthesized Engine state
  const [isPlayingTraditional, setIsPlayingTraditional] = useState(() => aartiAudioEngine.getIsPlaying());
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [currentLine, setCurrentLine] = useState({ mr: '', en: '' });
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(16).fill(4));

  // YouTube Ashtami Track state
  const [isYoutubePlaying, setIsYoutubePlaying] = useState(false);
  const [youtubeViewMode, setYoutubeViewMode] = useState<'audio' | 'video'>('video');

  const animFrameRef = useRef<number | null>(null);

  // Sync state & lyric callbacks from Web Audio engine
  useEffect(() => {
    const unsubState = aartiAudioEngine.onStateChange(playing => {
      setIsPlayingTraditional(playing);
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
    if (!isPlayingTraditional && !isYoutubePlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      setVisualizerData(new Array(16).fill(3));
      return;
    }

    const updateVisualizer = () => {
      if (isPlayingTraditional) {
        const analyser = aartiAudioEngine.getAnalyser();
        if (analyser) {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray);

          const sampled: number[] = [];
          const step = Math.floor(bufferLength / 16);
          for (let i = 0; i < 16; i++) {
            const val = dataArray[i * step] || 0;
            const height = Math.max(4, Math.round((val / 255) * 28));
            sampled.push(height);
          }
          setVisualizerData(sampled);
        }
      } else if (isYoutubePlaying) {
        // High-energy rhythmic animated equalizer for YouTube track
        const sampled: number[] = [];
        const now = Date.now() / 150;
        for (let i = 0; i < 16; i++) {
          const wave = Math.sin(now + i * 0.6) * 0.5 + 0.5;
          const height = Math.max(4, Math.round(wave * 26 + (i % 3) * 2));
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
  }, [isPlayingTraditional, isYoutubePlaying]);

  const handleSelectTrack = (track: AartiTrackId) => {
    if (track === activeTrack) return;
    setActiveTrack(track);

    // Stop audio of the other track to prevent audio overlap
    if (track === 'ashtami') {
      if (isPlayingTraditional) {
        aartiAudioEngine.silence();
        setIsPlayingTraditional(false);
      }
    } else {
      if (isYoutubePlaying) {
        setIsYoutubePlaying(false);
      }
    }
  };

  const toggleTraditionalPlayback = () => {
    if (isPlayingTraditional) {
      aartiAudioEngine.silence();
      setIsPlayingTraditional(false);
    } else {
      if (isYoutubePlaying) setIsYoutubePlaying(false);
      aartiAudioEngine.playAarti();
      setIsPlayingTraditional(true);
      if (isMuted) {
        setIsMuted(false);
        aartiAudioEngine.setVolume(volume);
      }
    }
  };

  const toggleYoutubePlayback = () => {
    if (isYoutubePlaying) {
      setIsYoutubePlaying(false);
    } else {
      if (isPlayingTraditional) {
        aartiAudioEngine.silence();
        setIsPlayingTraditional(false);
      }
      setIsYoutubePlaying(true);
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

  const isCurrentPlaying = activeTrack === 'ashtami' ? isYoutubePlaying : isPlayingTraditional;

  return (
    <div className="w-full my-3 sm:my-4 transition-all duration-300 px-1 sm:px-2">
      {/* Outer audio console container with temple gold trim */}
      <div className="relative rounded-2xl bg-gradient-to-r from-brand-maroon/95 via-black/90 to-brand-maroon/95 border-2 border-brand-gold/50 shadow-2xl backdrop-blur-md p-3 sm:p-4 md:p-5">
        
        {/* Subtle decorative aura glow when playing */}
        {isCurrentPlaying && (
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-gold/30 via-brand-saffron/30 to-brand-gold/30 rounded-2xl blur-md -z-10 animate-pulse pointer-events-none" />
        )}

        {/* Track Selector Tabs: Ashtami (YouTube) vs Traditional Marathi */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-gold/25 pb-3 mb-3">
          <div className="flex items-center gap-1.5 p-1 bg-black/60 rounded-xl border border-brand-gold/30">
            {/* Tab 1: Ashtami - YouTube Audio & Video */}
            <button
              onClick={() => handleSelectTrack('ashtami')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-sans font-extrabold transition-all cursor-pointer ${
                activeTrack === 'ashtami'
                  ? 'bg-gradient-to-r from-brand-saffron to-brand-gold text-brand-maroon shadow-md scale-102 font-black'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Youtube className="h-3.5 w-3.5 text-red-600 fill-current" />
              <span>{lang === 'EN' ? 'Ashtami Maha Aarti' : 'अष्टमी महाआरती'}</span>
              <span className="text-[9px] bg-red-600 text-white font-mono px-1 rounded font-bold uppercase tracking-tight">
                HD
              </span>
            </button>

            {/* Tab 2: Traditional Sanctum Aarti */}
            <button
              onClick={() => handleSelectTrack('traditional')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                activeTrack === 'traditional'
                  ? 'bg-brand-gold text-brand-maroon shadow-md scale-102 font-black'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Radio className="h-3.5 w-3.5 text-brand-gold" />
              <span>{lang === 'EN' ? 'Sanctum Aarti (Daily)' : 'पारंपरिक गाभारा आरती'}</span>
            </button>
          </div>

          {/* Direct YouTube link button */}
          <a
            href="https://youtu.be/28TJIom9GFw?si=rTrYi7hPJleZzsEG"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-sans font-bold text-brand-saffron hover:text-brand-gold bg-black/40 hover:bg-black/70 px-2.5 py-1 rounded-lg border border-brand-gold/30 transition-all shrink-0"
            title="Open original video on YouTube"
          >
            <Youtube className="h-3.5 w-3.5 text-red-500 fill-current" />
            <span className="hidden xs:inline">YouTube Official</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* ============================================================== */}
        {/* TRACK 1: ASHTAMI (YOUTUBE AUDIO & MUSIC VIDEO: 28TJIom9GFw)    */}
        {/* ============================================================== */}
        {activeTrack === 'ashtami' && (
          <div className="space-y-3 animate-fadeIn">
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-brand-gold/20 pb-2.5">
              <div className="flex items-center gap-2.5 text-left">
                <span className="text-2xl select-none shrink-0">🪔</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-sans font-black text-sm sm:text-base text-brand-gold tracking-wide">
                      {lang === 'EN' 
                        ? 'Ashtami - Dharmaveer Durga Maha Aarti' 
                        : 'अष्टमी - धर्मवीर दुर्गा महाआरती'}
                    </h4>
                    <span className="text-[10px] font-sans font-extrabold bg-red-600/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>🎤</span>
                      <span>{lang === 'EN' ? 'Adarsh Shinde' : 'गायक: आदर्श शिंदे'}</span>
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-gray-300 font-sans mt-0.5">
                    {lang === 'EN'
                      ? 'Music: Chinar - Mahesh • Lyrics: Mangesh Kangane • Zee Music Marathi'
                      : 'संगीत: चिनार - महेश • गीत: मंगेश कांगणे • झी म्युझिक मराठी'}
                  </p>
                </div>
              </div>

              {/* View Mode Toggle: Video Mode vs Audio Mode */}
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => setYoutubeViewMode('video')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-sans font-bold cursor-pointer transition-all ${
                    youtubeViewMode === 'video'
                      ? 'bg-brand-gold text-brand-maroon font-black shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Watch Video"
                >
                  <Video className="h-3 w-3" />
                  <span>{lang === 'EN' ? 'Video View' : 'व्हिडिओ'}</span>
                </button>
                <button
                  onClick={() => setYoutubeViewMode('audio')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-sans font-bold cursor-pointer transition-all ${
                    youtubeViewMode === 'audio'
                      ? 'bg-brand-gold text-brand-maroon font-black shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Audio Focus"
                >
                  <Music className="h-3 w-3" />
                  <span>{lang === 'EN' ? 'Audio Focus' : 'केवळ संगीत'}</span>
                </button>
              </div>
            </div>

            {/* Main Interactive Playback Panel */}
            {youtubeViewMode === 'video' ? (
              /* Video Mode: Responsive HD Embedded YouTube Player */
              <div className="space-y-2">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-brand-gold/60 shadow-[0_4px_25px_rgba(0,0,0,0.8)] bg-black">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/28TJIom9GFw?enablejsapi=1&rel=0&modestbranding=1"
                    title="Ashtami - Dharmaveer Maha Aarti | Adarsh Shinde | Zee Music Marathi"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 font-sans px-1">
                  <span className="flex items-center gap-1.5 text-brand-gold font-bold">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    <span>{lang === 'EN' ? 'Direct Official YouTube Stream' : 'अधिकृत यूट्यूब पावन महाआरती'}</span>
                  </span>
                  <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    className="text-brand-saffron hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>{lang === 'EN' ? 'Aarti Lyrics' : 'आरतीचे बोल'}</span>
                    {showLyrics ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            ) : (
              /* Audio Focus Mode: Rich Devotional Player with Equalizer & Rotating Chakra */
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-black/60 rounded-xl border border-brand-gold/30">
                {/* Left: Play button + Rotating Sacred Vinyl/Chakra + Current Status */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={toggleYoutubePlayback}
                    className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 cursor-pointer shadow-xl active:scale-95 ${
                      isYoutubePlaying
                        ? 'bg-gradient-to-br from-brand-saffron via-amber-500 to-brand-gold border-white text-brand-maroon scale-105'
                        : 'bg-black/80 hover:bg-red-950 border-brand-gold text-brand-gold hover:text-white'
                    }`}
                    title={isYoutubePlaying ? 'Pause Aarti' : 'Play Ashtami Aarti'}
                  >
                    {isYoutubePlaying ? (
                      <Pause className="h-6 w-6 fill-current" />
                    ) : (
                      <Play className="h-6 w-6 fill-current ml-0.5" />
                    )}
                  </button>

                  <div className="text-left">
                    <span className="text-[10px] uppercase font-mono font-bold text-brand-gold flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${isYoutubePlaying ? 'bg-red-500 animate-ping' : 'bg-gray-500'}`} />
                      <span>{isYoutubePlaying ? 'Playing Ashtami (Adarsh Shinde)' : 'Ready to Chant'}</span>
                    </span>
                    <h5 className="font-sans font-extrabold text-white text-xs sm:text-sm">
                      दुर्गे दुर्घट भारी तुजविण संसारी...
                    </h5>
                    <p className="text-[10px] text-brand-saffron font-sans">
                      {lang === 'EN' ? 'High-energy divine beats & Adarsh Shinde vocals' : 'भव्य ढोल-ताशांचा गजर व पावन महाआरती'}
                    </p>
                  </div>
                </div>

                {/* Right: Real-time Audio Equalizer Bars & Lyrics expander */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <div className="flex items-end gap-1 h-7 px-2 py-1 bg-black/70 rounded-lg border border-brand-gold/20">
                    {visualizerData.slice(0, 10).map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${Math.min(24, Math.max(3, h))}px` }}
                        className={`w-1 rounded-t-sm transition-all duration-75 ${
                          isYoutubePlaying ? 'bg-brand-gold' : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    className="px-2.5 py-1.5 rounded-lg bg-brand-maroon/70 border border-brand-gold/40 text-brand-gold text-xs font-sans font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>{lang === 'EN' ? 'Lyrics' : 'आरतीचे बोल'}</span>
                    {showLyrics ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Hidden Audio Player iframe when in Audio Mode */}
                {isYoutubePlaying && (
                  <div className="hidden">
                    <iframe
                      src="https://www.youtube-nocookie.com/embed/28TJIom9GFw?autoplay=1&enablejsapi=1&rel=0"
                      title="Ashtami Audio Background"
                      allow="autoplay"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TRACK 2: TRADITIONAL SANCTUM AARTI (SYNTHESIZED RAGA BHUPALI)  */}
        {/* ============================================================== */}
        {activeTrack === 'traditional' && (
          <div className="space-y-3 animate-fadeIn">
            {/* Top Control Bar: Title & Voice Badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-brand-gold/20 pb-2.5">
              <div className="flex items-center gap-2.5 text-left">
                <span className="text-2xl select-none shrink-0">🔔</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-sans font-black text-sm sm:text-base text-brand-gold tracking-wide">
                      {lang === 'EN' ? 'Shree Ishwatichi Mata Aarti (Traditional)' : 'श्री इश्वटीची माता आरती (पारंपरिक)'}
                    </h4>
                    <span className="text-[10px] font-sans font-bold bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded-full border border-brand-gold/40 flex items-center gap-1">
                      <span>👩</span>
                      <span>{lang === 'EN' ? 'Female Voice' : 'स्त्री स्वर गायन'}</span>
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-gray-300 font-sans mt-0.5">
                    {lang === 'EN' 
                      ? 'Traditional Sanctum melody in Raga Bhupali with bells and cymbals' 
                      : 'पारंपरिक राग भूप, पावन नाद व टाळ-मृदंग ताल'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-brand-saffron font-sans font-medium bg-black/40 px-2.5 py-1 rounded-full border border-white/10 shrink-0 self-end sm:self-auto">
                <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span>{lang === 'EN' ? 'Sanctum Chimes' : 'गाभारा नित्य आरती'}</span>
              </div>
            </div>

            {/* Transport Controls */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 w-full lg:flex-1 min-w-0">
                <button
                  onClick={toggleTraditionalPlayback}
                  className={`h-11 w-11 sm:h-13 sm:w-13 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${
                    isPlayingTraditional
                      ? 'bg-gradient-to-br from-brand-saffron via-amber-500 to-brand-gold border-white text-brand-maroon scale-105'
                      : 'bg-black/60 hover:bg-brand-red/40 border-brand-gold/60 text-brand-gold hover:text-white'
                  }`}
                  title={isPlayingTraditional ? 'Silence Aarti' : 'Play Traditional Aarti'}
                >
                  {isPlayingTraditional ? (
                    <Pause className="h-5 w-5 sm:h-6 sm:w-6 fill-current animate-pulse" />
                  ) : (
                    <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current ml-0.5" />
                  )}
                </button>

                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                      isPlayingTraditional 
                        ? 'bg-green-950/80 text-green-300 border-green-500/40 animate-pulse'
                        : 'bg-black/50 text-gray-400 border-white/10'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isPlayingTraditional ? 'bg-green-400' : 'bg-gray-500'}`} />
                      {isPlayingTraditional 
                        ? (lang === 'EN' ? 'Aarti Playing' : 'आरती सुरू आहे')
                        : (lang === 'EN' ? 'Ready to Play' : 'सुरू करण्यासाठी दाबा')}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-brand-saffron font-bold truncate mt-1">
                    {isPlayingTraditional ? (
                      <div className="flex items-center gap-1.5 animate-pulse min-w-0">
                        <Music className="h-3.5 w-3.5 shrink-0 text-brand-gold" />
                        <span className="font-sans font-bold text-white tracking-wide truncate">
                          {currentLine.mr || 'जय देवी जय देवी जय इश्वटी माते...'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs font-normal truncate block">
                        {lang === 'EN' 
                          ? 'Click play to start Marathi Aarti with sacred melodies' 
                          : 'पावन मराठी आरती ऐकण्यासाठी प्ले बटण दाबा'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Visualizer & Volume */}
              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full lg:w-auto border-t lg:border-t-0 border-white/10 pt-2 sm:pt-0">
                <div className="flex items-end gap-0.5 sm:gap-1 h-7 sm:h-8 px-1.5 sm:px-2 py-1 bg-black/60 rounded-lg border border-brand-gold/20 shrink-0">
                  {visualizerData.slice(0, 12).map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${Math.min(24, Math.max(3, h))}px` }}
                      className={`w-0.5 sm:w-1 rounded-t-sm transition-all duration-75 ${
                        isPlayingTraditional ? 'bg-brand-gold' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <button
                    onClick={toggleMute}
                    className="p-1 sm:p-1.5 text-gray-300 hover:text-brand-gold rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
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
                    className="w-14 sm:w-20 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-gold"
                    title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                    aria-label="Volume slider"
                  />
                </div>

                <button
                  onClick={() => setShowLyrics(!showLyrics)}
                  className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-black/50 hover:bg-brand-red/30 border border-brand-gold/30 text-brand-gold text-[11px] sm:text-xs font-sans font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <span>{lang === 'EN' ? 'Lyrics' : 'संपूर्ण आरती'}</span>
                  {showLyrics ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* COLLAPSIBLE FULL LYRICS SHEET (FOR BOTH ASHTAMI & TRADITIONAL) */}
        {/* ============================================================== */}
        {showLyrics && (
          <div className="mt-4 pt-3.5 border-t border-brand-gold/25 text-left font-sans space-y-3 animate-fadeIn bg-black/75 p-4 sm:p-5 rounded-xl border border-brand-gold/20">
            {activeTrack === 'ashtami' ? (
              /* Lyrics for Ashtami (Adarsh Shinde - Dharmaveer) */
              <>
                <div className="flex items-center justify-between border-b border-brand-gold/15 pb-2">
                  <h5 className="text-sm font-bold uppercase tracking-wider text-brand-gold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-gold" />
                    <span>॥ श्री दुर्गा महाआरती - अष्टमी (धर्मवीर) ॥</span>
                  </h5>
                  <span className="text-[10px] text-brand-saffron bg-brand-maroon px-2 py-0.5 rounded border border-brand-gold/30">
                    Zee Music Marathi • आदर्श शिंदे
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-gray-100 leading-relaxed font-sans space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="bg-brand-maroon/50 p-2.5 rounded-lg border-l-2 border-brand-gold">
                    <p className="font-black text-brand-gold">
                      दुर्गे दुर्घट भारी तुजविण संसारी ।<br />
                      अनाथनाथे अंबे करुणा विस्तारी ॥ धृ. ॥
                    </p>
                  </div>

                  <div>
                    <p>
                      वारि वारि जन्ममरणाते वारि ।<br />
                      हारी पडलो आता संकट निवारी ॥ १ ॥<br />
                      <span className="text-brand-saffron text-xs italic font-bold">
                        जय देवी जय देवी जय महिषासुरमर्दिनी ।<br />
                        सुरवरईश्वरवरदे तारक संजिवनी ॥ जय देवी जय देवी...
                      </span>
                    </p>
                  </div>

                  <div>
                    <p>
                      प्रसन्न वदने प्रसन्न होसी निजदासां ।<br />
                      क्लेशांपासुनि सोडी तोडी भवपाशां ।<br />
                      अंबे दुर्गे जगदंबे, आदिशक्तीचा उदो उदो ।<br />
                      आई राजा उदो उदो... अष्टमीचा गजर भारी ॥ २ ॥
                    </p>
                  </div>

                  <div className="bg-black/60 p-2 rounded-lg border border-brand-gold/20">
                    <p className="text-brand-gold text-xs">
                      "सर्वमंगल मांगल्ये शिवे सर्वार्थ साधिके । शरण्ये त्र्यंबके गौरी नारायणि नमोऽस्तु ते ॥"
                    </p>
                  </div>

                  <p className="text-gray-400 text-[11px] pt-1 border-t border-white/10 font-sans">
                    {lang === 'EN'
                      ? 'Full official soundtrack from the movie Dharmaveer, sung with supreme devotion by Adarsh Shinde.'
                      : 'चित्रपट धर्मवीर मधील अत्यंत लोकप्रिय व भक्तीमय महाआरती गीत.'}
                  </p>
                </div>
              </>
            ) : (
              /* Lyrics for Traditional Shree Ishwatichi Mata Aarti */
              <>
                <div className="flex items-center justify-between border-b border-brand-gold/15 pb-2">
                  <h5 className="text-sm font-bold uppercase tracking-wider text-brand-gold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-gold" />
                    <span>॥ श्री इश्वटीची माता आरती (पारंपरिक) ॥</span>
                  </h5>
                  <span className="text-[10px] text-gray-300 font-sans bg-brand-maroon px-2 py-0.5 rounded border border-brand-gold/30">
                    {lang === 'EN' ? 'Traditional Marathi Aarti' : 'पारंपरिक मराठी रचना'}
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-gray-100 leading-relaxed font-sans space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="bg-brand-maroon/40 p-2.5 rounded-lg border-l-2 border-brand-gold">
                    <p className="font-bold text-brand-gold">
                      जय देवी जय देवी जय इश्वटी माते ।<br />
                      प्रसन्न होऊनि पावे भक्तांच्या हाके ॥ धृ. ॥
                    </p>
                  </div>

                  <div>
                    <p>
                      स्वयंभू पाषाणी प्रगटली पावन मूर्ती ।<br />
                      भक्तजन धावती कराया तव आरती ।<br />
                      कष्ट निवारुनी देई सुख समृद्धी ।<br />
                      हात जोडुनी चरणी नमितो आदिशक्ती ॥ १ ॥
                    </p>
                  </div>

                  <div>
                    <p>
                      सिंदूर चर्चित भाळ शोभतो भारी ।<br />
                      अखंड ज्योती तेवे मातेच्या द्वारी ।<br />
                      अन्नछत्र चालती दयाळू तुझी करुणा ।<br />
                      संकट हरुनी रक्षी आमुच्या जीवना ॥ २ ॥
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default HeroAudioPlayer;
