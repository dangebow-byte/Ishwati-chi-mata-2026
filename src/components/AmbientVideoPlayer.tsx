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
 * Solves the desktop pillarbox / black bars issue for portrait/vertical reels and square videos.
 * Keeps the entire original foreground video 100% visible and uncropped (object-contain),
 * and fills the remaining container space on left/right/top/bottom with a synchronized,
 * smoothly blurred, atmospheric ambient version of the video (object-cover + blur-2xl).
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
  onPlay,
  onPause,
  onEnded
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mainVideoRef = useRef<HTMLVideoElement | null>(null);
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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
      className={`relative w-full overflow-hidden bg-black flex items-center justify-center select-none ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : aspectRatioClass
      } ${containerClassName} ${className}`}
      title={title}
    >
      {/* 1. Synchronized Ambient Blurred Backdrop (Fills Left/Right/Top/Bottom Space with no black bars) */}
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/60 pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60 pointer-events-none z-[1]" />

      {/* 3. Original Uncropped Foreground Video (Guaranteed 100% visible from top to bottom) */}
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
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeeked}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className={`relative z-10 max-h-full max-w-full w-auto h-auto object-contain mx-auto shadow-2xl drop-shadow-[0_8px_30px_rgba(0,0,0,0.9)] ${videoClassName}`}
      >
        Your browser does not support HTML5 video playback.
      </video>

      {/* 4. Ambient Fullscreen Toggle Overlay Button */}
      {controls && (
        <button
          type="button"
          onClick={handleToggleFullscreen}
          className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-black/70 hover:bg-black/90 text-brand-gold hover:text-white border border-brand-gold/40 shadow-lg backdrop-blur-md cursor-pointer transition-all hover:scale-105 active:scale-95"
          title={isFullscreen ? 'Exit Fullscreen' : 'Ambient Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
};
