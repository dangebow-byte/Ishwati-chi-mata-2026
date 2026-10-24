/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Film, 
  Share2, 
  ExternalLink, 
  X, 
  Flame, 
  Music, 
  CalendarDays, 
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { OFFICIAL_FESTIVAL_VIDEOS, FestivalVideoItem } from '../data';
import { subscribeGalleryMedia, GalleryMediaItem } from '../services/galleryMediaService';
import { shareToWhatsApp } from '../utils/shareUtils';

interface HomeRotatingVideoSliderProps {
  lang: 'EN' | 'MR';
  onNavigateToGallery?: () => void;
  className?: string;
  autoRotateInterval?: number; // default 5000ms (5s)
}

interface ParsedVideoDetails {
  type: 'youtube' | 'instagram' | 'direct';
  videoId?: string;
  embedUrl: string;
  thumbnailUrl: string;
  fallbackThumbnailUrl?: string;
}

/**
 * Extracts video platform metadata, thumbnail, and responsive embed URL
 */
function parseVideoDetails(rawUrl: string, existingEmbed?: string): ParsedVideoDetails {
  const url = (rawUrl || '').trim();

  // YouTube match
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      fallbackThumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    };
  }

  // Instagram match
  if (url.includes('instagram.com/reel/') || url.includes('instagram.com/p/')) {
    const cleanUrl = url.split('?')[0].replace(/\/+$/, '');
    return {
      type: 'instagram',
      embedUrl: `${cleanUrl}/embed`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=1200'
    };
  }

  return {
    type: 'direct',
    embedUrl: existingEmbed || url,
    thumbnailUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=1200'
  };
}

export const HomeRotatingVideoSlider: React.FC<HomeRotatingVideoSliderProps> = ({
  lang,
  onNavigateToGallery,
  className = '',
  autoRotateInterval = 6000
}) => {
  const [liveMediaVideos, setLiveMediaVideos] = useState<GalleryMediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [activeModalVideo, setActiveModalVideo] = useState<{
    titleMR: string;
    titleEN: string;
    url: string;
    category?: string;
    descriptionMR?: string;
    descriptionEN?: string;
  } | null>(null);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to real-time gallery media to pull admin-added festival videos
  useEffect(() => {
    const unsub = subscribeGalleryMedia((items) => {
      const vids = items.filter(i => i.type === 'video' || i.type === 'instagram');
      setLiveMediaVideos(vids);
    });
    return () => unsub();
  }, []);

  // Merge official festival videos with live Firestore videos, strictly deduplicating by YouTube videoId or URL
  const slides = useMemo(() => {
    const seen = new Set<string>();
    const combined: Array<{
      id: string;
      titleMR: string;
      titleEN: string;
      category: string;
      year: string;
      descriptionMR?: string;
      descriptionEN?: string;
      url: string;
      date?: string;
    }> = [];

    // 1. First add official curated festival videos (includes 'Lakha Lakha Chandri' & Ashtami Aarti)
    OFFICIAL_FESTIVAL_VIDEOS.forEach((vid) => {
      const parsed = parseVideoDetails(vid.url);
      const key = parsed.videoId ? `yt:${parsed.videoId}` : vid.url.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        combined.push({
          id: vid.id,
          titleMR: vid.titleMR,
          titleEN: vid.titleEN,
          category: vid.category,
          year: vid.year,
          descriptionMR: vid.descriptionMR,
          descriptionEN: vid.descriptionEN,
          url: vid.url,
          date: vid.date
        });
      }
    });

    // 2. Add any newly added videos from Firestore
    liveMediaVideos.forEach((item) => {
      const parsed = parseVideoDetails(item.url, item.embedUrl);
      const key = parsed.videoId ? `yt:${parsed.videoId}` : item.url.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        combined.push({
          id: item.id,
          titleMR: item.titleMR,
          titleEN: item.titleEN,
          category: item.category || 'Special Events',
          year: item.year || '2026',
          descriptionMR: item.descriptionMR,
          descriptionEN: item.descriptionEN,
          url: item.url
        });
      }
    });

    return combined;
  }, [liveMediaVideos]);

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex(prev => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Auto-rotation effect: runs every `autoRotateInterval` unless paused or modal is open
  useEffect(() => {
    if (totalSlides <= 1 || !isAutoPlaying || isHovered || activeModalVideo !== null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, autoRotateInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalSlides, isAutoPlaying, isHovered, activeModalVideo, autoRotateInterval, nextSlide]);

  // Touch Swipe Handlers for mobile devotees
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const diff = touchStartX - touchEndX;
    const swipeThreshold = 50; // min distance
    if (diff > swipeThreshold) {
      nextSlide();
    } else if (diff < -swipeThreshold) {
      prevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  if (totalSlides === 0) return null;

  const currentSlide = slides[currentIndex] || slides[0];
  const parsedCurrent = parseVideoDetails(currentSlide.url);

  // Category Icon & Styling Helper
  const getCategoryBadge = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('aarti') || cat.includes('आरती')) {
      return {
        label: lang === 'EN' ? 'Maha Aarti' : 'महाआरती',
        icon: Flame,
        colorClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      };
    }
    if (cat.includes('procession') || cat.includes('मिरवणूक') || cat.includes('visarjan')) {
      return {
        label: lang === 'EN' ? 'Visarjan Miravnuk' : 'विसर्जन मिरवणूक',
        icon: Music,
        colorClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40'
      };
    }
    return {
      label: lang === 'EN' ? 'Special Event' : 'विशेष सोहळा',
      icon: CalendarDays,
      colorClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    };
  };

  const catBadge = getCategoryBadge(currentSlide.category);
  const CatIcon = catBadge.icon;

  return (
    <section 
      aria-label="Festival Rotating Video Gallery"
      className={`w-full max-w-5xl mx-auto space-y-4 ${className}`}
    >
      {/* Sleek, Non-Cluttering Devotional Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 px-1">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-brand-saffron animate-pulse" />
            <span>{lang === 'EN' ? 'Rotating Video Gallery' : 'महोत्सव व्हिडिओ दर्शन (फिरती दालन)'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{lang === 'EN' ? 'Festival Video Highlights' : 'पावन उत्सव क्षणचित्रे व महाआरती'}</span>
          </h3>
          <p className="text-xs sm:text-sm text-gray-300">
            {lang === 'EN'
              ? 'Watch sacred Aarti hymns, grand Visarjan procession, and golden jubilee festival videos.'
              : 'लख लख चंदेरी तेजाची न्यारी दुनिया, ५३ वे वर्ष महाआरती व मिरवणूक व्हिडिओ दर्शन.'}
          </p>
        </div>

        {/* Action Controls & Navigation to Full Gallery */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {/* Pause / Play Auto-Rotation Button */}
          <button
            type="button"
            onClick={() => setIsAutoPlaying(prev => !prev)}
            title={isAutoPlaying ? (lang === 'EN' ? 'Pause auto-slider' : 'स्लायडर थांबवा') : (lang === 'EN' ? 'Resume auto-slider' : 'स्लायडर सुरू करा')}
            className="p-2 rounded-xl bg-black/60 border border-brand-gold/30 text-brand-gold hover:bg-brand-gold hover:text-brand-maroon transition-all text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span className="hidden md:inline">{isAutoPlaying ? (lang === 'EN' ? 'Pause' : 'थांबवा') : (lang === 'EN' ? 'Auto-Play' : 'सुरू करा')}</span>
          </button>

          {/* Quick Jump to Dedicated Gallery Tab */}
          {onNavigateToGallery && (
            <button
              type="button"
              onClick={onNavigateToGallery}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-maroon via-brand-red to-brand-maroon border border-brand-gold/50 text-brand-gold hover:text-white hover:border-brand-gold text-xs font-bold transition-all flex items-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>{lang === 'EN' ? 'View All Gallery Media' : 'संपूर्ण गॅलरी पहा'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Rotating Video Slider Card */}
      <div 
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-brand-gold/30 bg-gradient-to-b from-stone-900/95 via-black to-stone-950 shadow-2xl shadow-brand-gold/10 group select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Animated Slide Progress Bar for Auto-Rotation */}
        {isAutoPlaying && !isHovered && activeModalVideo === null && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30 overflow-hidden">
            <div 
              key={currentIndex} 
              className="h-full bg-gradient-to-r from-brand-gold via-brand-saffron to-amber-300 animate-[progress_6s_linear]" 
              style={{ animationDuration: `${autoRotateInterval}ms` }}
            />
          </div>
        )}

        {/* Main Slide Presentation Aspect Ratio Container (16:9 on Desktop, 4:3 on Mobile) */}
        <div className="relative w-full aspect-video min-h-[260px] sm:min-h-[380px] md:min-h-[440px] flex items-center justify-center overflow-hidden">
          {/* Background Video Thumbnail with Smooth Transition */}
          <img
            src={parsedCurrent.thumbnailUrl}
            alt={lang === 'EN' ? currentSlide.titleEN : currentSlide.titleMR}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out transform group-hover:scale-105"
            onError={(e) => {
              if (parsedCurrent.fallbackThumbnailUrl) {
                (e.target as HTMLImageElement).src = parsedCurrent.fallbackThumbnailUrl;
              }
            }}
          />

          {/* Cinematic Vignette & Readability Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30 pointer-events-none" />

          {/* Top Badges Strip */}
          <div className="absolute top-3 sm:top-5 left-3 sm:left-6 right-3 sm:right-6 flex items-center justify-between z-20 pointer-events-none">
            {/* Category Pill */}
            <div className={`px-2.5 sm:px-3 py-1 rounded-full border text-[11px] sm:text-xs font-bold tracking-wide backdrop-blur-md flex items-center gap-1.5 shadow-lg ${catBadge.colorClass}`}>
              <CatIcon className="w-3.5 h-3.5" />
              <span>{catBadge.label}</span>
            </div>

            {/* Slide Index / Year Indicator */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-black/60 border border-brand-gold/30 text-brand-gold text-[11px] sm:text-xs font-mono font-bold backdrop-blur-md shadow-md">
                {currentIndex + 1} / {totalSlides}
              </span>
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-black/60 border border-white/20 text-gray-200 text-[11px] sm:text-xs font-mono font-bold backdrop-blur-md">
                {currentSlide.year}
              </span>
            </div>
          </div>

          {/* Center Pulsing Play Button */}
          <button
            type="button"
            onClick={() => setActiveModalVideo(currentSlide)}
            aria-label={`Play ${lang === 'EN' ? currentSlide.titleEN : currentSlide.titleMR}`}
            className="group/btn relative z-20 flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95"
          >
            <div className="relative flex items-center justify-center">
              {/* Pulsing Aura Rings */}
              <div className="absolute -inset-3 rounded-full bg-brand-gold/30 blur-md animate-ping opacity-60" />
              <div className="absolute -inset-1.5 rounded-full bg-brand-saffron/40 blur-sm" />
              {/* Play Icon Circle */}
              <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-brand-maroon via-brand-red to-brand-saffron border-2 sm:border-3 border-brand-gold flex items-center justify-center text-white shadow-2xl">
                <Play className="w-6 h-6 sm:w-9 sm:h-9 fill-white text-white translate-x-0.5" />
              </div>
            </div>

            <div className="px-3 py-1 rounded-full bg-black/80 border border-brand-gold/50 backdrop-blur-md text-[11px] sm:text-xs font-bold text-brand-gold shadow-lg tracking-wide group-hover/btn:bg-brand-gold group-hover/btn:text-brand-maroon transition-colors">
              {lang === 'EN' ? '▶ Play Video' : '▶ व्हिडिओ पहा'}
            </div>
          </button>

          {/* Left Arrow Navigation Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Previous Video Slide"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/70 hover:bg-brand-gold text-brand-gold hover:text-brand-maroon border border-brand-gold/40 flex items-center justify-center transition-all shadow-xl backdrop-blur-md cursor-pointer hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* Right Arrow Navigation Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Next Video Slide"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/70 hover:bg-brand-gold text-brand-gold hover:text-brand-maroon border border-brand-gold/40 flex items-center justify-center transition-all shadow-xl backdrop-blur-md cursor-pointer hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* Bottom Slide Info Overlay Panel */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 sm:pb-5 z-20 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1 max-w-2xl">
              <h4 className="text-base sm:text-xl md:text-2xl font-black text-white drop-shadow-md leading-snug line-clamp-2">
                {lang === 'EN' ? currentSlide.titleEN : currentSlide.titleMR}
              </h4>
              <p className="text-xs sm:text-sm text-gray-300 line-clamp-1 sm:line-clamp-2 drop-shadow">
                {lang === 'EN' ? (currentSlide.descriptionEN || currentSlide.titleEN) : (currentSlide.descriptionMR || currentSlide.titleMR)}
              </p>
            </div>

            {/* Quick Actions (Share to WhatsApp & Direct Play) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  shareToWhatsApp({
                    title: lang === 'EN' ? currentSlide.titleEN : currentSlide.titleMR,
                    text: `श्री इश्वटीची माता पावन उत्सव व्हिडिओ: ${lang === 'EN' ? currentSlide.titleEN : currentSlide.titleMR}`,
                    url: currentSlide.url
                  });
                }}
                title={lang === 'EN' ? 'Share to WhatsApp' : 'व्हॉट्सॲपवर शेअर करा'}
                className="p-2 sm:p-2.5 rounded-xl bg-green-950/80 hover:bg-green-600 text-green-300 hover:text-white border border-green-500/40 transition-all text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">{lang === 'EN' ? 'Share' : 'शेअर'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalVideo(currentSlide)}
                className="px-4 py-2 rounded-xl bg-brand-gold hover:bg-amber-400 text-brand-maroon font-black text-xs sm:text-sm transition-all shadow-lg flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'EN' ? 'Watch Now' : 'पहा'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Slider Bottom Pagination Dots and Thumbnail Strip */}
        <div className="py-2.5 px-4 bg-stone-950 border-t border-brand-gold/20 flex items-center justify-between gap-3">
          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
            {slides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id || idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isActive 
                      ? 'w-8 sm:w-10 h-2 bg-gradient-to-r from-brand-gold to-brand-saffron shadow-[0_0_8px_rgba(212,175,55,0.8)]' 
                      : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                  }`}
                  title={lang === 'EN' ? slide.titleEN : slide.titleMR}
                />
              );
            })}
          </div>

          {/* Quick Title Preview of the Active Slide */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-brand-gold/80 font-medium truncate max-w-xs">
            <Film className="w-3.5 h-3.5 shrink-0 text-brand-saffron" />
            <span className="truncate">{lang === 'EN' ? currentSlide.titleEN : currentSlide.titleMR}</span>
          </div>

          {/* Auto Rotation Status Pill */}
          <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1 shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${isAutoPlaying && !isHovered ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
            <span>{isAutoPlaying && !isHovered ? (lang === 'EN' ? 'Auto-rotating' : 'फिरते आहे') : (lang === 'EN' ? 'Paused' : 'स्थिर')}</span>
          </div>
        </div>
      </div>

      {/* High-Definition Devotional Theater Modal for Video Playback */}
      {activeModalVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveModalVideo(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative w-full max-w-4xl bg-stone-950 border-2 border-brand-gold rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3 sm:p-4 bg-brand-maroon/90 border-b border-brand-gold/30 flex items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-2 truncate">
                <Sparkles className="w-4 h-4 text-brand-gold shrink-0" />
                <h4 className="font-sans font-bold text-sm sm:text-base text-brand-gold truncate">
                  {lang === 'EN' ? activeModalVideo.titleEN : activeModalVideo.titleMR}
                </h4>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activeModalVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-black/40 hover:bg-brand-gold hover:text-brand-maroon text-gray-300 transition-colors"
                  title={lang === 'EN' ? 'Open in YouTube/Instagram' : 'मूळ लिंकवर उघडा'}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveModalVideo(null)}
                  className="p-1.5 rounded-lg bg-black/40 hover:bg-red-600 text-gray-300 hover:text-white transition-colors cursor-pointer"
                  title={lang === 'EN' ? 'Close' : 'बंद करा'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Player Frame Container */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              {(() => {
                const modalParsed = parseVideoDetails(activeModalVideo.url);
                if (modalParsed.type === 'youtube') {
                  return (
                    <iframe
                      src={modalParsed.embedUrl}
                      title={lang === 'EN' ? activeModalVideo.titleEN : activeModalVideo.titleMR}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                }
                if (modalParsed.type === 'instagram') {
                  return (
                    <iframe
                      src={modalParsed.embedUrl}
                      title={lang === 'EN' ? activeModalVideo.titleEN : activeModalVideo.titleMR}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  );
                }
                return (
                  <video
                    src={modalParsed.embedUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                );
              })()}
            </div>

            {/* Modal Footer with Video Details and Share */}
            <div className="p-3 sm:p-4 bg-stone-900 border-t border-brand-gold/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-300">
              <div className="space-y-0.5">
                <p className="text-white font-medium line-clamp-1">
                  {lang === 'EN' ? activeModalVideo.titleEN : activeModalVideo.titleMR}
                </p>
                <p className="text-gray-400 line-clamp-1 text-[11px]">
                  {lang === 'EN' ? (activeModalVideo.descriptionEN || 'Official Temple Navratri Festival Video') : (activeModalVideo.descriptionMR || 'श्री इश्वटीची माता नवरात्रौत्सव अधिकृत पावन व्हिडिओ')}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    shareToWhatsApp({
                      title: lang === 'EN' ? activeModalVideo.titleEN : activeModalVideo.titleMR,
                      text: `श्री इश्वटीची माता व्हिडिओ: ${lang === 'EN' ? activeModalVideo.titleEN : activeModalVideo.titleMR}`,
                      url: activeModalVideo.url
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-green-700 hover:bg-green-600 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{lang === 'EN' ? 'Share' : 'शेअर करा'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalVideo(null)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-gray-200 font-bold transition-colors cursor-pointer"
                >
                  {lang === 'EN' ? 'Close' : 'बंद करा'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
