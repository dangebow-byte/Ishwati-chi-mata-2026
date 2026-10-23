/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { Maximize2, Minimize2, Volume2, VolumeX, Play, Pause } from 'lucide-react';

export interface AmbientVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  preload?: string;
  className?: string;
  videoClassName?: string;
  containerClassName?: string;
  aspectRatioClass?: string;
  fitMode?: 'cover' | 'contain' | 'fill';
  onVideoRatioChange?: (info: { isPortrait: boolean; ratio: number; width: number; height: number }) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

/**
 * Pauses all other video and audio elements on the document
 * ensuring only the latest started media continues playback (Requirement 4).
 */
export function pauseAllOtherMedia(activeMediaElement?: HTMLMediaElement | null) {
  try {
    const mediaElements = document.querySelectorAll<HTMLMediaElement>('video, audio');
    mediaElements.forEach((el) => {
      if (el !== activeMediaElement && !el.paused && !el.classList.contains('ambient-backdrop-video')) {
        el.pause();
      }
    });
  } catch (err) {
    console.warn('Could not pause other media:', err);
  }
}

// Global capture-phase listener to ensure when ANY video/reel plays anywhere in the app,
// all other previously playing videos or audios immediately stop.
if (typeof window !== 'undefined') {
  window.addEventListener(
    'play',
    (event: Event) => {
      const target = event.target as HTMLMediaElement;
      if (target && (target.tagName === 'VIDEO' || target.tagName === 'AUDIO')) {
        if (!target.classList.contains('ambient-backdrop-video')) {
          pauseAllOtherMedia(target);
        }
      }
    },
    true
  );
}

/**
 * AmbientVideoPlayer:
 * Centralized, responsive video player that solves pillarbox / black bars issue.
 * Supports 'cover' (fills full component window edge-to-edge) and 'contain' (fit uncropped)
 * with synchronized atmospheric ambient glow filling surrounding space.
 */
export const AmbientVideoPlayer: React.FC<AmbientVideoPlayerProps> = ({
  src,
  poster,
  title,
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
  className = '',
  videoClassName = '',
  containerClassName = '',
  aspectRatioClass = 'aspect-video',
  playsInline = true,
  preload = 'metadata',
  fitMode = 'cover',
  onVideoRatioChange,
  onPlay,
  onPause,
  onEnded
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mainVideoRef = useRef<HTMLVideoElement | null>(null);
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFitMode, setActiveFitMode] = useState<'cover' | 'contain' | 'fill'>(fitMode);

  // Keep activeFitMode synced if external prop changes
  useEffect(() => {
    setActiveFitMode(fitMode);
  }, [fitMode]);

  // Synchronize playback between main video and ambient blurred backdrop video
  const handlePlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const main = mainVideoRef.current;
    const bg = bgVideoRef.current;

    // 1. Pause any other media playing in the application (Requirement 4)
    pauseAllOtherMedia(main);

    // 2. Sync background video position and play
    if (main && bg) {
      if (Math.abs(bg.currentTime - main.currentTime) > 0.3) {
        bg.currentTime = main.currentTime;
      }
      void bg.play().catch(() => {});
    }

    setIsPlaying(true);
    onPlay?.();
  };

  const handlePause = () => {
    const bg = bgVideoRef.current;
    if (bg && !bg.paused) {
      bg.pause();
    }
    setIsPlaying(false);
    onPause?.();
  };

  const handleSeeked = () => {
    const main = mainVideoRef.current;
    const bg = bgVideoRef.current;
    if (main && bg) {
      bg.currentTime = main.currentTime;
    }
  };

  const handleTimeUpdate = () => {
    const main = mainVideoRef.current;
    const bg = bgVideoRef.current;
    if (main && bg) {
      // Keep background video drift under 0.4 seconds
      if (Math.abs(bg.currentTime - main.currentTime) > 0.4) {
        bg.currentTime = main.currentTime;
      }
    }
  };

  const handleEnded = () => {
    const bg = bgVideoRef.current;
    if (bg) {
      bg.pause();
      bg.currentTime = 0;
    }
    setIsPlaying(false);
    onEnded?.();
  };

  // Inspect video natural resolution and orientation
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.videoWidth && video.videoHeight) {
      const isPortrait = video.videoHeight > video.videoWidth;
      const ratio = video.videoWidth / video.videoHeight;
      onVideoRatioChange?.({
        isPortrait,
        ratio,
        width: video.videoWidth,
        height: video.videoHeight
      });
    }
  };

  // Toggle container fullscreen so the blurred ambient backdrop expands with it
  const handleToggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen request error:', err);
    }
  };

  // Toggle between filling the entire component window vs fitting original aspect ratio
  const handleToggleFitMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveFitMode(prev => (prev === 'cover' ? 'contain' : 'cover'));
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement === containerRef.current));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-black flex items-center justify-center select-none ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : aspectRatioClass
      } ${containerClassName} ${className}`}
      title={title}
    >
      {/* 1. Synchronized Ambient Blurred Backdrop (Fills Left/Right/Top/Bottom Space seamlessly) */}
      <video
        ref={bgVideoRef}
        src={src}
        poster={poster}
        muted
        playsInline
        loop={loop}
        aria-hidden="true"
        tabIndex={-1}
        className="ambient-backdrop-video absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-60 scale-110 pointer-events-none select-none transition-opacity duration-500 -z-0"
      />

      {/* 2. Soft Dark Vignette Overlay for High-Contrast Viewing */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/60 pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-radial from-transparent via-black/15 to-black/50 pointer-events-none z-[1]" />

      {/* 3. Centralized Foreground Video (Occupies Full Component Window when activeFitMode === 'cover') */}
      <video
        ref={mainVideoRef}
        src={src}
        poster={poster}
        controls={controls}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        preload={preload}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeeked}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className={`relative z-10 mx-auto transition-all duration-300 ${
          activeFitMode === 'cover'
            ? 'w-full h-full object-cover object-center'
            : 'max-h-full max-w-full w-auto h-auto object-contain object-center shadow-2xl drop-shadow-[0_8px_30px_rgba(0,0,0,0.9)]'
        } ${videoClassName}`}
      >
        Your browser does not support HTML5 video playback.
      </video>

      {/* 4. Action Overlay: Fit Mode Toggle & Ambient Fullscreen Controls */}
      {controls && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 pointer-events-auto">
          {/* Fit Mode Toggle Button: Occupy Full Component Window vs Fit Original Aspect */}
          <button
            type="button"
            onClick={handleToggleFitMode}
            className="px-2.5 py-1 rounded-xl bg-black/75 hover:bg-black/95 text-brand-gold hover:text-white border border-brand-gold/40 shadow-lg backdrop-blur-md cursor-pointer transition-all hover:scale-105 active:scale-95 text-[11px] font-bold flex items-center gap-1"
            title={activeFitMode === 'cover' ? 'Switch to Fit Original Aspect (मूळ आकार)' : 'Occupy Full Component Window (पूर्ण जागा भरा)'}
          >
            <span>{activeFitMode === 'cover' ? '⛶ पूर्ण जागा (Fill)' : '🔲 मूळ आकार (Fit)'}</span>
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-black/75 hover:bg-black/95 text-brand-gold hover:text-white border border-brand-gold/40 shadow-lg backdrop-blur-md cursor-pointer transition-all hover:scale-105 active:scale-95"
            title={isFullscreen ? 'Exit Fullscreen' : 'Ambient Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
};

