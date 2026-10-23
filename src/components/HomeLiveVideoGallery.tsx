/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Upload, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sparkles, 
  Film, 
  Heart, 
  Eye, 
  Share2, 
  Trash2, 
  Plus, 
  RotateCcw, 
  Check, 
  Youtube, 
  Instagram, 
  AlertCircle,
  Video
} from 'lucide-react';
import { 
  HomeLiveVideo, 
  subscribeHomeLiveVideos, 
  addMultipleHomeLiveVideos, 
  deleteHomeLiveVideo, 
  resetHomeLiveVideos 
} from '../services/homeLiveVideoService';
import { uploadMediaToCloudStorage } from '../services/cloudMediaStorage';
import { AmbientVideoPlayer } from './AmbientVideoPlayer';
import { InstagramVideoEmbed, extractInstagramShortcode, getInstagramEmbedUrl } from './InstagramVideoEmbed';
import { shareToWhatsApp } from '../utils/shareUtils';
import { isAdminEmail } from '../constants/adminConstants';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface HomeLiveVideoGalleryProps {
  lang: 'EN' | 'MR';
  className?: string;
}

export const HomeLiveVideoGallery: React.FC<HomeLiveVideoGalleryProps> = ({
  lang,
  className = ''
}) => {
  const [videos, setVideos] = useState<HomeLiveVideo[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [canManage, setCanManage] = useState(false);

  // Active Theater Playback Modal State
  const [theaterVideo, setTheaterVideo] = useState<HomeLiveVideo | null>(null);

  // Multiple Video Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'files' | 'link'>('files');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgressMap, setUploadProgressMap] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Link Upload Form State
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitleMR, setLinkTitleMR] = useState('');
  const [linkTitleEN, setLinkTitleEN] = useState('');
  const [linkCategory, setLinkCategory] = useState<'aarti' | 'miravnuk' | 'visarjan' | 'darshan' | 'reels'>('aarti');

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Subscribe to real-time videos
  useEffect(() => {
    const unsub = subscribeHomeLiveVideos((vids) => {
      setVideos(vids);
    });
    return () => unsub();
  }, []);

  // Check admin privileges
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCanManage(Boolean(isAdminEmail(user?.email) && user.emailVerified));
    });
    return () => unsubAuth();
  }, []);

  // Filtered list
  const filteredVideos = videos.filter((vid) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'reels') return vid.aspectRatio === 'portrait' || vid.sourceType === 'instagram';
    if (activeCategory === 'cloud') return vid.sourceType === 'cloud';
    return vid.category === activeCategory;
  });

  // Google-style horizontal smooth scrolling controls
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  // Multiple File Selection Handler
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const validVideoFiles = files.filter(f => f.type.startsWith('video/'));
    if (validVideoFiles.length === 0) {
      setUploadError(lang === 'EN' ? 'Please select valid video files (MP4, WebM, MOV).' : 'कृपया वैध व्हिडिओ फाईल निवडा (MP4, WebM, MOV).');
      return;
    }
    setSelectedFiles(prev => [...prev, ...validVideoFiles]);
    setUploadError(null);
  };

  // Perform Multiple Video Upload to Firebase Storage
  const handleUploadMultipleFiles = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    const newVideoEntries: Omit<HomeLiveVideo, 'orderIndex'>[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const progressKey = `${file.name}_${i}`;

        const uploadResult = await uploadMediaToCloudStorage(
          file,
          'home_videos',
          (pct) => {
            setUploadProgressMap(prev => ({ ...prev, [progressKey]: pct }));
          }
        );

        const cleanBaseName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');

        newVideoEntries.push({
          id: `hlv_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
          titleMR: `श्री ईश्वटीची माता - ${cleanBaseName}`,
          titleEN: `Shree Ishwati Mata - ${cleanBaseName}`,
          descriptionMR: '५३ वे वर्ष नवरात्रौत्सव पावन क्षणचित्रे व थेट व्हिडिओ.',
          descriptionEN: '53rd Year Navratri celebration live moments and videos.',
          sourceType: 'cloud',
          url: uploadResult.url,
          storagePath: uploadResult.storagePath,
          duration: 'Video',
          aspectRatio: 'portrait', // Default mobile reel, dynamically adapts
          category: 'miravnuk',
          createdAt: new Date().toISOString(),
          viewsCount: 1,
          likesCount: 1
        });
      }

      await addMultipleHomeLiveVideos(newVideoEntries);
      setSelectedFiles([]);
      setUploadProgressMap({});
      setIsUploadModalOpen(false);
    } catch (err: any) {
      setUploadError(err?.message || (lang === 'EN' ? 'Upload failed. Check connection and permissions.' : 'अपलोड अयशस्वी झाले. इंटरनेट व परवानग्या तपासा.'));
    } finally {
      setIsUploading(false);
    }
  };

  // Add YouTube or Instagram Video via Link
  const handleAddLinkVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    let clean = linkUrl.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }

    const isInsta = clean.includes('instagram.com');
    const isYt = clean.includes('youtu.be') || clean.includes('youtube.com');

    if (!isInsta && !isYt) {
      setUploadError(lang === 'EN' ? 'Please enter a valid YouTube or Instagram link.' : 'कृपया वैध यूट्यूब किंवा इन्स्टाग्राम लिंक प्रविष्ट करा.');
      return;
    }

    let embedUrl: string | undefined = undefined;
    if (isYt) {
      try {
        const parsed = new URL(clean);
        let id = '';
        if (parsed.hostname.includes('youtu.be')) id = parsed.pathname.split('/').filter(Boolean)[0] || '';
        else id = parsed.searchParams.get('v') || parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] || '';
        if (id) {
          embedUrl = `https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1&rel=0&modestbranding=1`;
        }
      } catch {}
    } else if (isInsta) {
      embedUrl = getInstagramEmbedUrl(clean);
    }

    const newEntry: Omit<HomeLiveVideo, 'orderIndex'> = {
      id: `hlv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      titleMR: linkTitleMR.trim() || (isInsta ? 'इन्स्टाग्राम पावन रील' : 'यूट्यूब पावन व्हिडिओ'),
      titleEN: linkTitleEN.trim() || (isInsta ? 'Instagram Devotional Reel' : 'YouTube Sacred Video'),
      descriptionMR: 'श्री यंग ईश्वटी नवरात्रौत्सव मंडळ अधिकृत व्हिडिओ.',
      descriptionEN: 'Shree Young Ishwati Navratrotsav Mandal Official Video.',
      sourceType: isInsta ? 'instagram' : 'youtube',
      url: clean,
      embedUrl,
      aspectRatio: isInsta || clean.includes('/shorts/') ? 'portrait' : 'landscape',
      category: linkCategory,
      createdAt: new Date().toISOString(),
      viewsCount: 1,
      likesCount: 1
    };

    try {
      await addMultipleHomeLiveVideos([newEntry]);
      setLinkUrl('');
      setLinkTitleMR('');
      setLinkTitleEN('');
      setIsUploadModalOpen(false);
      setUploadError(null);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to save video link.');
    }
  };

  // Delete Video
  const handleDeleteVideo = async (vid: HomeLiveVideo, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(lang === 'EN' ? 'Are you sure you want to delete this video?' : 'तुम्हाला हा व्हिडिओ काढून टाकायचा आहे का?')) {
      return;
    }
    try {
      await deleteHomeLiveVideo(vid.id, vid.storagePath);
      if (theaterVideo?.id === vid.id) {
        setTheaterVideo(null);
      }
    } catch (err) {
      console.warn('Delete error:', err);
    }
  };

  return (
    <section className={`w-full relative space-y-4 font-sans ${className}`}>
      
      {/* 1. Google-Style Section Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-brand-gold/20 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-brand-gold">
              {lang === 'EN' ? 'Google-Style Live Video Feed • 53rd Year' : 'थेट व्हिडिओ व रील दालन • ५३ वे वर्ष'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{lang === 'EN' ? 'Shree Ishwati Mata Live Video Gallery' : 'श्री ईश्वटीची माता पावन व्हिडिओ व रील दालन'}</span>
            <Sparkles className="h-5 w-5 text-brand-saffron shrink-0" />
          </h2>
          <p className="text-xs text-gray-300">
            {lang === 'EN'
              ? 'Scroll horizontally through daily aartis, grand visarjan procession, and devotee reels like Google Photos.'
              : 'महाआरती, विसर्जन मिरवणूक आणि भाविकांच्या पावन रील्सचे गुगल प्रमाणे स्क्रोल करता येणारे थेट दालन.'}
          </p>
        </div>

        {/* Action Controls & Navigation Arrows */}
        <div className="flex items-center gap-2 shrink-0">
          {canManage && (
            <button
              type="button"
              onClick={() => {
                setIsUploadModalOpen(true);
                setUploadError(null);
              }}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{lang === 'EN' ? 'Multiple Upload' : 'एकाधिक व्हिडिओ अपलोड'}</span>
            </button>
          )}

          {canManage && (
            <button
              type="button"
              onClick={() => resetHomeLiveVideos()}
              className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-gray-400 hover:text-brand-gold border border-white/10 text-xs transition-colors cursor-pointer"
              title={lang === 'EN' ? 'Reset to festival default videos' : 'मूळ ५३ व्या वर्षाचे व्हिडिओ पूर्ववत करा'}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}

          {/* Google Material Circular Navigation Arrows */}
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-full border border-brand-gold/30">
            <button
              type="button"
              onClick={scrollLeft}
              className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
              title={lang === 'EN' ? 'Scroll Left' : 'डावीकडे स्क्रोल करा'}
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
              title={lang === 'EN' ? 'Scroll Right' : 'उजवीकडे स्क्रोल करा'}
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Google-Style Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-xs">
        {[
          { id: 'all', labelMR: 'सर्व व्हिडिओ (All)', labelEN: 'All Videos' },
          { id: 'reels', labelMR: '📱 रील्स व शॉर्ट्स (Reels)', labelEN: '📱 Reels & Shorts' },
          { id: 'aarti', labelMR: '🪔 महाआरती (Maha Aarti)', labelEN: '🪔 Maha Aarti' },
          { id: 'visarjan', labelMR: '🚩 विसर्जन मिरवणूक (Visarjan)', labelEN: '🚩 Visarjan Miravnuk' },
          { id: 'darshan', labelMR: '🌸 गर्भगृह दर्शन (Darshan)', labelEN: '🌸 Sanctum Darshan' },
          { id: 'cloud', labelMR: '☁️ अपलोड केलेले (Uploads)', labelEN: '☁️ Device Uploads' }
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer text-xs ${
              activeCategory === cat.id
                ? 'bg-brand-gold text-brand-maroon shadow-md font-black ring-1 ring-white/40'
                : 'bg-black/50 text-gray-300 hover:text-white border border-white/10 hover:border-white/30'
            }`}
          >
            {lang === 'EN' ? cat.labelEN : cat.labelMR}
          </button>
        ))}
      </div>

      {/* 3. Google-Style Horizontal Scrollable Carousel Feed */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 px-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {filteredVideos.map((vid, idx) => {
          const isReel = vid.aspectRatio === 'portrait' || vid.sourceType === 'instagram';
          return (
            <div
              key={vid.id}
              onClick={() => setTheaterVideo(vid)}
              className={`group shrink-0 snap-start relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl bg-zinc-950 flex flex-col justify-between ${
                isReel
                  ? 'w-[220px] sm:w-[260px] aspect-[9/16]'
                  : 'w-[280px] sm:w-[340px] aspect-video'
              } border-brand-gold/40 hover:border-brand-gold`}
            >
              {/* Media Preview / Thumbnail Background */}
              <div className="absolute inset-0 bg-black overflow-hidden">
                {vid.sourceType === 'cloud' ? (
                  vid.url.endsWith('.png') || vid.url.endsWith('.jpg') || vid.url.endsWith('.jpeg') ? (
                    <img 
                      src={vid.url} 
                      alt={lang === 'EN' ? vid.titleEN : vid.titleMR}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <video
                      src={vid.url}
                      muted
                      playsInline
                      loop
                      preload="metadata"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  )
                ) : vid.thumbnailUrl ? (
                  <img
                    src={vid.thumbnailUrl}
                    alt={lang === 'EN' ? vid.titleEN : vid.titleMR}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-maroon via-black to-zinc-900 flex items-center justify-center">
                    <Film className="h-10 w-10 text-brand-gold/50" />
                  </div>
                )}

                {/* Dark Vignette Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 group-hover:via-black/20 transition-colors" />
              </div>

              {/* Top Card Badges */}
              <div className="relative z-10 p-3 flex items-center justify-between gap-2">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md ${
                  vid.isLive
                    ? 'bg-red-600 text-white animate-pulse'
                    : vid.sourceType === 'instagram'
                    ? 'bg-pink-600/80 text-white'
                    : 'bg-black/70 text-brand-gold border border-brand-gold/40'
                }`}>
                  {vid.isLive ? '🔴 LIVE' : vid.sourceType === 'instagram' ? '📱 REEL' : '✨ VIDEO'}
                </span>

                {canManage && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteVideo(vid, e)}
                    className="p-1 rounded-full bg-black/80 hover:bg-red-600 text-gray-300 hover:text-white transition-colors cursor-pointer"
                    title={lang === 'EN' ? 'Delete Video' : 'व्हिडिओ हटवा'}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Center Floating Play Button */}
              <div className="relative z-10 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-brand-gold/90 text-brand-maroon flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-brand-saffron transition-transform">
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </div>
              </div>

              {/* Bottom Info Strip */}
              <div className="relative z-10 p-3 space-y-1">
                <h4 className="text-white font-bold text-xs line-clamp-2 drop-shadow-md group-hover:text-brand-gold transition-colors">
                  {lang === 'EN' ? vid.titleEN : vid.titleMR}
                </h4>

                <div className="flex items-center justify-between text-[10px] text-gray-300 font-mono pt-1">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3 text-brand-gold" />
                    <span>{vid.viewsCount?.toLocaleString() || '1.2k'}</span>
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <Heart className="h-3 w-3 fill-current" />
                    <span>{vid.likesCount?.toLocaleString() || '340'}</span>
                  </span>
                  <span className="bg-black/60 px-1.5 py-0.5 rounded text-gray-400 border border-white/10">
                    {vid.duration || '0:30'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 4. GOOGLE-STYLE IMMERSIVE THEATER LIGHTBOX MODAL                         */}
      {/* ========================================================================= */}
      {theaterVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#2a0101] via-black to-zinc-950 border-2 border-brand-gold/70 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 my-auto flex flex-col items-center">
            
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setTheaterVideo(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 bg-brand-maroon text-brand-gold hover:text-white border border-brand-gold/50 p-2 rounded-full cursor-pointer hover:scale-110 transition-transform"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Theater Video Header */}
            <div className="w-full flex items-center gap-3 border-b border-brand-gold/30 pb-3 pr-10">
              <span className="text-2xl">🪔</span>
              <div className="min-w-0">
                <h3 className="font-sans font-black text-base sm:text-xl text-brand-gold truncate">
                  {lang === 'EN' ? theaterVideo.titleEN : theaterVideo.titleMR}
                </h3>
                <p className="text-xs text-brand-saffron truncate">
                  {lang === 'EN' ? theaterVideo.descriptionEN : theaterVideo.descriptionMR}
                </p>
              </div>
            </div>

            {/* Centralized Full-Space Video Player */}
            <div className={`relative w-full ${
              theaterVideo.aspectRatio === 'portrait' || theaterVideo.sourceType === 'instagram'
                ? 'max-w-md aspect-[9/16] min-h-[480px] sm:min-h-[580px] max-h-[720px]'
                : 'aspect-video min-h-[300px] sm:min-h-[440px]'
            } mx-auto rounded-xl overflow-hidden border-2 border-brand-gold/60 shadow-2xl bg-black flex items-center justify-center`}>
              {theaterVideo.sourceType === 'cloud' ? (
                <AmbientVideoPlayer
                  src={theaterVideo.url}
                  title={lang === 'EN' ? theaterVideo.titleEN : theaterVideo.titleMR}
                  controls
                  playsInline
                  autoPlay
                  fitMode="cover"
                  containerClassName="w-full h-full"
                  aspectRatioClass="h-full w-full"
                />
              ) : theaterVideo.sourceType === 'instagram' ? (
                <InstagramVideoEmbed
                  url={theaterVideo.url}
                  title={lang === 'EN' ? theaterVideo.titleEN : theaterVideo.titleMR}
                  lang={lang}
                  className="w-full h-full"
                />
              ) : (
                <iframe
                  src={theaterVideo.embedUrl || 'https://www.youtube-nocookie.com/embed/28TJIom9GFw?autoplay=1&enablejsapi=1&rel=0'}
                  title={lang === 'EN' ? theaterVideo.titleEN : theaterVideo.titleMR}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              )}
            </div>

            {/* Theater Action Footer */}
            <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs">
              <span className="text-brand-gold font-sans italic">
                "॥ श्री ईश्वटीची माता प्रसन्न ॥ ५३ वे वर्ष नवरात्रौत्सव"
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const title = lang === 'EN' ? theaterVideo.titleEN : theaterVideo.titleMR;
                    void shareToWhatsApp({
                      title,
                      text: lang === 'EN'
                        ? `Watch Shree Ishwati Mata Video: ${title}`
                        : `श्री ईश्वटीची माता पावन व्हिडिओ नक्की पहा: ${title}`,
                      url: theaterVideo.url,
                      lang
                    });
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>{lang === 'EN' ? 'WhatsApp Share' : 'व्हाट्सॲप शेअर'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheaterVideo(null)}
                  className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
                >
                  {lang === 'EN' ? 'Close' : 'बंद करा'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MULTIPLE VIDEO UPLOAD MODAL (ADMIN ONLY)                               */}
      {/* ========================================================================= */}
      {canManage && isUploadModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-zinc-950 border-2 border-brand-gold/60 rounded-2xl p-5 sm:p-6 shadow-2xl text-xs space-y-4 my-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-brand-gold font-bold text-sm">
                <Video className="h-4 w-4 text-brand-gold" />
                <span>
                  {lang === 'EN' ? 'Multiple Video Upload (Google Live Gallery)' : 'एकाधिक व्हिडिओ अपलोड (थेट दालन)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Upload Method Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-black/60 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setUploadMode('files')}
                className={`py-2 rounded-lg font-bold text-center transition-all cursor-pointer ${
                  uploadMode === 'files'
                    ? 'bg-brand-gold text-brand-maroon font-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📁 {lang === 'EN' ? 'Multiple Device Files' : 'डिव्हाइसमधून एकाधिक फाईल्स'}
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('link')}
                className={`py-2 rounded-lg font-bold text-center transition-all cursor-pointer ${
                  uploadMode === 'link'
                    ? 'bg-brand-gold text-brand-maroon font-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🔗 {lang === 'EN' ? 'YouTube / Reel Link' : 'यूट्यूब / रील लिंक'}
              </button>
            </div>

            {/* Sub-mode 1: Multiple Device Files Upload */}
            {uploadMode === 'files' && (
              <div className="space-y-3">
                <label className="border-2 border-dashed border-brand-gold/40 hover:border-brand-gold bg-black/40 hover:bg-black/60 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                    onChange={handleFilesSelected}
                    className="hidden"
                  />
                  <div className="h-12 w-12 rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-gold">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-gold block text-sm">
                      {lang === 'EN' ? 'Click to select Multiple Videos' : 'एकाधिक व्हिडिओ निवडण्यासाठी येथे क्लिक करा'}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {lang === 'EN'
                        ? 'Select 1 or more MP4, WebM, MOV videos • Uploads to Cloud Storage'
                        : '१ किंवा अधिक व्हिडिओ एकाच वेळी निवडा • क्लाउडवर सुरक्षित साठवले जाईल'}
                    </span>
                  </div>
                </label>

                {/* Selected Files Queue */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-black/60 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between text-[11px] text-brand-gold font-bold">
                      <span>{lang === 'EN' ? `Selected (${selectedFiles.length} videos)` : `निवडलेले (${selectedFiles.length} व्हिडिओ)`}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles([])}
                        className="text-red-400 hover:text-red-300 text-[10px]"
                      >
                        {lang === 'EN' ? 'Clear all' : 'सर्व काढा'}
                      </button>
                    </div>

                    {selectedFiles.map((file, idx) => {
                      const progressKey = `${file.name}_${idx}`;
                      const progress = uploadProgressMap[progressKey];
                      return (
                        <div key={idx} className="p-2 bg-zinc-900 rounded-lg space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-gray-300">
                            <span className="truncate max-w-[200px] font-mono">{file.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </span>
                          </div>
                          {isUploading && progress !== undefined && (
                            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-brand-gold to-brand-saffron h-full transition-all duration-150"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-gray-300 hover:bg-zinc-700 font-bold"
                  >
                    {lang === 'EN' ? 'Cancel' : 'रद्द करा'}
                  </button>
                  <button
                    type="button"
                    disabled={selectedFiles.length === 0 || isUploading}
                    onClick={handleUploadMultipleFiles}
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-black shadow hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUploading
                      ? (lang === 'EN' ? 'Uploading...' : 'अपलोड सुरू आहे...')
                      : (lang === 'EN' ? `Upload ${selectedFiles.length} Videos` : `${selectedFiles.length} व्हिडिओ अपलोड करा`)}
                  </button>
                </div>
              </div>
            )}

            {/* Sub-mode 2: YouTube / Reel Link Upload */}
            {uploadMode === 'link' && (
              <form onSubmit={handleAddLinkVideo} className="space-y-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {lang === 'EN' ? 'Video or Reel URL *' : 'व्हिडिओ किंवा रील लिंक *'}
                  </label>
                  <input
                    type="text"
                    inputMode="url"
                    required
                    placeholder="https://youtu.be/... or https://www.instagram.com/reel/..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">
                      {lang === 'EN' ? 'Title (Marathi)' : 'शीर्षक (मराठी)'}
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. पावन आरती"
                      value={linkTitleMR}
                      onChange={(e) => setLinkTitleMR(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">
                      {lang === 'EN' ? 'Title (English)' : 'शीर्षक (इंग्रजी)'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sacred Aarti"
                      value={linkTitleEN}
                      onChange={(e) => setLinkTitleEN(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {lang === 'EN' ? 'Category' : 'श्रेणी'}
                  </label>
                  <select
                    value={linkCategory}
                    onChange={(e: any) => setLinkCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-gold"
                  >
                    <option value="aarti">🪔 महाआरती (Maha Aarti)</option>
                    <option value="visarjan">🚩 विसर्जन सोहळा (Visarjan)</option>
                    <option value="miravnuk">🥁 मिरवणूक व वादन (Procession)</option>
                    <option value="darshan">🌸 गर्भगृह दर्शन (Darshan)</option>
                    <option value="reels">📱 रील व शॉर्ट्स (Reels)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-gray-300 hover:bg-zinc-700 font-bold"
                  >
                    {lang === 'EN' ? 'Cancel' : 'रद्द करा'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-black shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    {lang === 'EN' ? 'Add Video' : 'व्हिडिओ जोडा'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </section>
  );
};
