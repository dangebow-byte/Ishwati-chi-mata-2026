/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, 
  Film, 
  Sparkles, 
  Search, 
  Plus, 
  X, 
  Share2, 
  Trash2, 
  Calendar, 
  Check, 
  AlertCircle, 
  Video, 
  ExternalLink,
  Maximize2,
  Tv
} from 'lucide-react';
import { 
  GalleryMediaItem, 
  subscribeGalleryMedia, 
  addGalleryMedia, 
  deleteGalleryMedia 
} from '../services/galleryMediaService';
import { shareToWhatsApp } from '../utils/shareUtils';
import { isAdminEmail } from '../constants/adminConstants';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface VideoGallerySectionProps {
  lang: 'EN' | 'MR';
  className?: string;
}

/**
 * Parses video URL to detect YouTube, Instagram, or direct video streams
 */
function parseVideoSource(rawUrl: string, existingEmbed?: string) {
  const url = (rawUrl || '').trim();
  if (existingEmbed && existingEmbed.length > 5) {
    return {
      type: 'embed',
      embedUrl: existingEmbed,
      thumbnailUrl: ''
    };
  }

  // YouTube detection
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };
  }

  // Instagram Reel detection
  if (url.includes('instagram.com/reel/') || url.includes('instagram.com/p/')) {
    const cleanUrl = url.split('?')[0].replace(/\/+$/, '');
    return {
      type: 'instagram',
      embedUrl: `${cleanUrl}/embed`,
      thumbnailUrl: ''
    };
  }

  // Direct video or Fallback
  return {
    type: 'direct',
    embedUrl: url,
    thumbnailUrl: ''
  };
}

export const VideoGallerySection: React.FC<VideoGallerySectionProps> = ({
  lang,
  className = ''
}) => {
  const [mediaItems, setMediaItems] = useState<GalleryMediaItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Playback Modal State (Centralized and occupying full space)
  const [activeVideo, setActiveVideo] = useState<GalleryMediaItem | null>(null);

  // Add Video URL to Firebase Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [inputTitleMR, setInputTitleMR] = useState('');
  const [inputTitleEN, setInputTitleEN] = useState('');
  const [inputCategory, setInputCategory] = useState('Maha Aarti');
  const [inputYear, setInputYear] = useState('2026');
  const [inputDescMR, setInputDescMR] = useState('');
  const [inputDescEN, setInputDescEN] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Subscribe to real-time gallery media from Firebase
  useEffect(() => {
    const unsub = subscribeGalleryMedia((items) => {
      // Filter only video or instagram items
      const videoItems = items.filter(
        item => item.type === 'video' || item.type === 'instagram'
      );
      setMediaItems(videoItems);
    });
    return () => unsub();
  }, []);

  // Check Admin Status
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      const admin = Boolean(currentUser && isAdminEmail(currentUser.email) && currentUser.emailVerified);
      setIsAdminUser(admin);
    });
    return () => unsubAuth();
  }, []);

  // Filter categories
  const categories = useMemo(() => [
    { id: 'all', nameMR: 'सर्व व्हिडिओ', nameEN: 'All Videos' },
    { id: 'aarti', nameMR: 'महाआरती व स्तुती', nameEN: 'Maha Aarti' },
    { id: 'visarjan', nameMR: 'विसर्जन सोहळा', nameEN: 'Visarjan Sohala' },
    { id: 'miravnuk', nameMR: 'मिरवणूक सोहळा', nameEN: 'Grand Procession' },
    { id: 'darshan', nameMR: 'थेट गर्भगृह दर्शन', nameEN: 'Sanctum Darshan' },
    { id: 'reels', nameMR: 'भक्तिमय रील्स', nameEN: 'Devotional Reels' },
  ], []);

  // Filtered and searched video items
  const filteredVideos = useMemo(() => {
    return mediaItems.filter(item => {
      // Category filter
      if (activeCategory !== 'all') {
        const catLower = (item.category || '').toLowerCase();
        const titleLower = `${item.titleMR} ${item.titleEN}`.toLowerCase();
        if (activeCategory === 'aarti' && !catLower.includes('aarti') && !titleLower.includes('आरती') && !titleLower.includes('aarti')) return false;
        if (activeCategory === 'visarjan' && !catLower.includes('visarjan') && !titleLower.includes('विसर्जन')) return false;
        if (activeCategory === 'miravnuk' && !catLower.includes('miravnuk') && !titleLower.includes('मिरवणूक') && !titleLower.includes('procession')) return false;
        if (activeCategory === 'darshan' && !catLower.includes('darshan') && !titleLower.includes('दर्शन') && !titleLower.includes('sanctum')) return false;
        if (activeCategory === 'reels' && item.type !== 'instagram' && !catLower.includes('reels') && !titleLower.includes('reel')) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesMR = (item.titleMR || '').toLowerCase().includes(q) || (item.descriptionMR || '').toLowerCase().includes(q);
        const matchesEN = (item.titleEN || '').toLowerCase().includes(q) || (item.descriptionEN || '').toLowerCase().includes(q);
        const matchesCat = (item.category || '').toLowerCase().includes(q);
        return matchesMR || matchesEN || matchesCat;
      }

      return true;
    });
  }, [mediaItems, activeCategory, searchQuery]);

  // Handle storing video URL into Firebase Backend
  const handleSaveVideoUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      setErrorMessage(lang === 'EN' ? 'Please enter a valid video URL.' : 'कृपया वैध व्हिडिओ लिंक प्रविष्ट करा.');
      return;
    }
    if (!inputTitleMR.trim()) {
      setErrorMessage(lang === 'EN' ? 'Please provide a title in Marathi.' : 'कृपया मराठीमध्ये व्हिडिओचे शीर्षक लिहा.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const parsed = parseVideoSource(inputUrl);
      const isInsta = parsed.type === 'instagram';

      await addGalleryMedia({
        type: isInsta ? 'instagram' : 'video',
        url: inputUrl.trim(),
        embedUrl: parsed.embedUrl,
        titleMR: inputTitleMR.trim(),
        titleEN: inputTitleEN.trim() || inputTitleMR.trim(),
        category: inputCategory,
        year: inputYear || '2026',
        descriptionMR: inputDescMR.trim(),
        descriptionEN: inputDescEN.trim() || inputDescMR.trim(),
        authorHandle: isInsta ? '@ishwatichi_mata' : undefined
      });

      setSuccessMessage(lang === 'EN' ? 'Festival video URL stored successfully in Firebase!' : 'उत्सव व्हिडिओ लिंक फायरबेसमध्ये यशस्वीरीत्या जतन झाली!');
      setTimeout(() => {
        setIsAddModalOpen(false);
        setInputUrl('');
        setInputTitleMR('');
        setInputTitleEN('');
        setInputDescMR('');
        setInputDescEN('');
        setSuccessMessage(null);
      }, 1200);
    } catch (err: any) {
      console.error('Error saving festival video URL to Firebase:', err);
      setErrorMessage(err?.message || (lang === 'EN' ? 'Could not store video URL in Firebase. Check permissions.' : 'फायरबेसमध्ये व्हिडिओ जतन करताना त्रुटी आली. कृपया परवानगी तपासा.'));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle deleting video from Firebase
  const handleDeleteVideo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      lang === 'EN' 
        ? 'Are you sure you want to delete this festival video from the database?' 
        : 'तुम्हाला खात्री आहे की हा उत्सव व्हिडिओ डेटाबेसमधून हटवायचा आहे?'
    );
    if (!confirmed) return;

    try {
      await deleteGalleryMedia(id);
      if (activeVideo?.id === id) {
        setActiveVideo(null);
      }
    } catch (err: any) {
      alert(err?.message || 'Could not delete video');
    }
  };

  return (
    <section 
      id="temple-festival-video-gallery"
      className={`relative w-full py-8 sm:py-12 bg-gradient-to-b from-black/60 via-brand-maroon/20 to-black/70 rounded-3xl border border-brand-gold/30 shadow-2xl overflow-hidden ${className}`}
    >
      {/* Decorative Traditional Indian Glow & Background Motifs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-saffron/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.06)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Header Block with Title, Subtitle, and Admin Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-brand-gold/25 pb-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/15 border border-brand-gold/35 text-brand-gold text-xs font-bold tracking-wider uppercase">
              <Film className="w-3.5 h-3.5 text-brand-saffron animate-pulse" />
              <span>{lang === 'EN' ? 'Official Video Archive' : 'अधिकृत उत्सव व्हिडिओ दालन'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-2.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              <span>{lang === 'EN' ? 'Temple Festival & Sacred Video Gallery' : 'श्री मंदिर उत्सव व भक्तिमय व्हिडिओ दालन'}</span>
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 max-w-3xl leading-relaxed">
              {lang === 'EN'
                ? 'Immerse in the 53rd year festival memories, divine Maha Aartis, grand visarjan processions, and devotional beats preserved in real-time.'
                : 'श्री इश्वटी मातेचा ५३ वा शारदीय नवरात्रौत्सव, भव्य विसर्जन मिरवणूक, पावन महाआरती व नादब्रह्म ढोल-ताशा वादनाचे संस्मरण दालन.'}
            </p>
          </div>

          {/* Action Row: Admin "Add Video URL" & Total Count */}
          <div className="flex items-center gap-3 shrink-0">
            {isAdminUser && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-gold via-amber-400 to-brand-gold text-brand-maroon font-bold text-xs sm:text-sm shadow-lg hover:shadow-brand-gold/40 hover:scale-[1.02] active:scale-98 transition-all flex items-center gap-2 cursor-pointer border border-amber-300"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{lang === 'EN' ? 'Add Video URL' : 'नवीन व्हिडिओ जोडा'}</span>
              </button>
            )}

            <div className="px-3.5 py-2 rounded-xl bg-black/60 border border-brand-gold/30 text-xs font-mono font-bold text-brand-gold flex items-center gap-1.5 shadow-inner">
              <Tv className="w-3.5 h-3.5 text-brand-saffron" />
              <span>{filteredVideos.length} {lang === 'EN' ? 'Videos' : 'व्हिडिओ'}</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Controls Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3.5">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-maroon to-brand-red text-brand-gold border border-brand-gold/80 shadow-[0_0_15px_rgba(255,153,51,0.35)]'
                      : 'bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white border border-brand-gold/20'
                  }`}
                >
                  {lang === 'EN' ? cat.nameEN : cat.nameMR}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'EN' ? 'Search festival videos...' : 'व्हिडिओ शोधा...'}
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-black/50 border border-brand-gold/30 rounded-xl text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Responsive Grid of Temple Festival Videos */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-16 px-4 bg-black/35 rounded-2xl border border-dashed border-brand-gold/30 space-y-3">
            <Film className="w-12 h-12 text-brand-gold/40 mx-auto" />
            <h3 className="text-base sm:text-lg font-bold text-gray-200">
              {lang === 'EN' ? 'No festival videos match your filter' : 'निवडलेल्या निकषानुसार व्हिडिओ आढळले नाहीत'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
              {lang === 'EN'
                ? 'Try selecting a different category or search term, or click "Add Video URL" to add a new video.'
                : 'कृपया दुसरा प्रकार निवडा किंवा प्रशासक असाल तर नवीन व्हिडिओची लिंक जोडा.'}
            </p>
            {isAdminUser && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="mt-2 px-4 py-2 bg-brand-gold text-brand-maroon font-bold text-xs rounded-xl shadow hover:opacity-90 cursor-pointer"
              >
                {lang === 'EN' ? 'Add Video URL Now' : 'व्हिडिओ लिंक आता जोडा'}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredVideos.map((video) => {
              const parsed = parseVideoSource(video.url, video.embedUrl);
              const thumbUrl = parsed.thumbnailUrl || (video.type === 'instagram' ? '/assets/branding/Mandal logo Maroon Transparent BG.png' : '');

              return (
                <div
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className="group relative flex flex-col bg-gradient-to-b from-[#2a0404]/85 via-black/80 to-[#180202]/90 border border-brand-gold/40 hover:border-brand-gold rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(255,153,51,0.35)] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  {/* Video Thumbnail / Preview Container (16:9 ratio) */}
                  <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={lang === 'EN' ? video.titleEN : video.titleMR}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-brand-maroon to-black flex flex-col items-center justify-center p-4 text-center">
                        <Film className="w-10 h-10 text-brand-gold/60 mb-2" />
                        <span className="text-xs font-bold text-brand-gold">
                          {video.type === 'instagram' ? 'Instagram Reel' : 'Temple Video'}
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 group-hover:via-black/10 transition-colors" />

                    {/* Big Glowing Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-brand-gold/90 text-brand-maroon group-hover:bg-brand-saffron group-hover:text-white flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.8)] transform group-hover:scale-110 transition-all duration-300">
                        <Play className="w-6 h-6 fill-current ml-1" />
                      </div>
                    </div>

                    {/* Top Badges: Category & Year */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10">
                      <span className="px-2.5 py-1 rounded-md bg-black/80 border border-brand-gold/40 text-[10px] sm:text-xs font-bold text-brand-gold backdrop-blur-sm">
                        {video.category || 'Festival'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-brand-maroon/90 border border-brand-gold/40 text-[10px] font-mono font-bold text-amber-200 backdrop-blur-sm">
                        {video.year || '2026'}
                      </span>
                    </div>

                    {/* Bottom Status: Click to Play */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-gray-300 font-bold z-10">
                      <span className="flex items-center gap-1 text-brand-gold">
                        <Sparkles className="w-3 h-3 text-brand-saffron" />
                        <span>{lang === 'EN' ? 'Click to Play' : 'पाहण्यासाठी क्लिक करा'}</span>
                      </span>
                      <Maximize2 className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Card Content & Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <h3 className="font-sans font-bold text-sm sm:text-base text-white group-hover:text-brand-gold transition-colors line-clamp-2 leading-snug">
                        {lang === 'EN' ? (video.titleEN || video.titleMR) : video.titleMR}
                      </h3>
                      
                      {((lang === 'EN' ? video.descriptionEN : video.descriptionMR) || video.descriptionMR) && (
                        <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                          {lang === 'EN' ? (video.descriptionEN || video.descriptionMR) : video.descriptionMR}
                        </p>
                      )}
                    </div>

                    {/* Bottom Card Actions: Share & Admin Delete */}
                    <div className="pt-2 border-t border-brand-gold/20 flex items-center justify-between gap-2 text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          shareToWhatsApp({
                            title: lang === 'EN' ? (video.titleEN || video.titleMR) : video.titleMR,
                            text: `${lang === 'EN' ? video.titleEN : video.titleMR} - Shree Ishwati Chi Mata Festival Video`,
                            url: video.url
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title={lang === 'EN' ? 'Share to WhatsApp' : 'व्हॉट्सॲपवर शेअर करा'}
                      >
                        <Share2 className="w-3 h-3" />
                        <span>{lang === 'EN' ? 'Share' : 'शेअर'}</span>
                      </button>

                      {isAdminUser && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteVideo(video.id, e)}
                          className="px-2 py-1 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-500/40 text-red-300 hover:text-white font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title={lang === 'EN' ? 'Delete video from database' : 'डेटाबेसमधून व्हिडिओ हटवा'}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{lang === 'EN' ? 'Delete' : 'हटवा'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL CENTRALIZED THEATER PLAYBACK MODAL (Occupies full space of modal gracefully) */}
      {activeVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setActiveVideo(null)}
        >
          <div 
            className="relative w-full max-w-5xl max-h-[95vh] bg-gradient-to-b from-[#350404] via-black to-[#200202] border-2 border-brand-gold/80 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(255,153,51,0.5)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-black/60 border-b border-brand-gold/30">
              <div className="flex items-center gap-2 overflow-hidden pr-2">
                <span className="text-brand-saffron animate-pulse shrink-0">✨</span>
                <h3 className="text-xs sm:text-base font-bold text-brand-gold truncate">
                  {lang === 'EN' ? (activeVideo.titleEN || activeVideo.titleMR) : activeVideo.titleMR}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-full bg-brand-gold/20 hover:bg-brand-gold text-brand-gold hover:text-brand-maroon flex items-center justify-center transition-all cursor-pointer shrink-0 border border-brand-gold/40"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Video Player Window - Centralized and Occupies 100% of Available Container */}
            <div className="relative w-full bg-black flex items-center justify-center overflow-hidden aspect-video max-h-[65vh]">
              {(() => {
                const parsed = parseVideoSource(activeVideo.url, activeVideo.embedUrl);

                if (parsed.type === 'youtube') {
                  return (
                    <iframe
                      src={parsed.embedUrl}
                      title={activeVideo.titleEN || activeVideo.titleMR}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                }

                if (parsed.type === 'instagram') {
                  return (
                    <iframe
                      src={parsed.embedUrl}
                      title={activeVideo.titleEN || activeVideo.titleMR}
                      className="w-full h-full border-0"
                      allowTransparency
                      allowFullScreen
                    />
                  );
                }

                // Direct video fallback
                return (
                  <video
                    src={activeVideo.url}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support video playback.
                  </video>
                );
              })()}
            </div>

            {/* Modal Details Footer */}
            <div className="p-4 sm:p-5 bg-black/75 border-t border-brand-gold/25 space-y-3 overflow-y-auto max-h-[30vh]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-brand-maroon border border-brand-gold/50 text-xs font-bold text-brand-gold">
                    {activeVideo.category || 'Festival'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-black/60 border border-brand-gold/30 text-xs font-mono font-bold text-gray-300">
                    {activeVideo.year || '2026'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      shareToWhatsApp({
                        title: lang === 'EN' ? (activeVideo.titleEN || activeVideo.titleMR) : activeVideo.titleMR,
                        text: `${lang === 'EN' ? activeVideo.titleEN : activeVideo.titleMR} - Shree Ishwati Chi Mata Festival Video`,
                        url: activeVideo.url
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{lang === 'EN' ? 'Share to WhatsApp' : 'व्हॉट्सॲपवर पाठवा'}</span>
                  </button>

                  <a
                    href={activeVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-brand-maroon hover:bg-brand-red text-brand-gold hover:text-white border border-brand-gold/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{lang === 'EN' ? 'Open Original' : 'मूळ लिंक उघडा'}</span>
                  </a>
                </div>
              </div>

              {((lang === 'EN' ? activeVideo.descriptionEN : activeVideo.descriptionMR) || activeVideo.descriptionMR) && (
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {lang === 'EN' ? (activeVideo.descriptionEN || activeVideo.descriptionMR) : activeVideo.descriptionMR}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN MODAL: STORE FESTIVAL VIDEO URL IN FIREBASE */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => !isSaving && setIsAddModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-xl bg-gradient-to-b from-[#400404] via-black to-[#250202] border-2 border-brand-gold rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden flex flex-col space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-brand-gold/30 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-brand-gold" />
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {lang === 'EN' ? 'Store Festival Video URL in Firebase' : 'उत्सव व्हिडिओ लिंक फायरबेसमध्ये जतन करा'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !isSaving && setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveVideoUrl} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  {lang === 'EN' ? 'Video URL (YouTube / Instagram / MP4) *' : 'व्हिडिओ लिंक (YouTube / Instagram / MP4) *'}
                </label>
                <input
                  type="url"
                  required
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="w-full px-3 py-2 bg-black/60 border border-brand-gold/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    {lang === 'EN' ? 'Marathi Title *' : 'मराठी शीर्षक *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={inputTitleMR}
                    onChange={(e) => setInputTitleMR(e.target.value)}
                    placeholder="उदा. अष्टमी महाआरती सोहळा"
                    className="w-full px-3 py-2 bg-black/60 border border-brand-gold/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    {lang === 'EN' ? 'English Title' : 'इंग्रजी शीर्षक'}
                  </label>
                  <input
                    type="text"
                    value={inputTitleEN}
                    onChange={(e) => setInputTitleEN(e.target.value)}
                    placeholder="e.g. Ashtami Maha Aarti Celebration"
                    className="w-full px-3 py-2 bg-black/60 border border-brand-gold/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    {lang === 'EN' ? 'Category' : 'विभाग'}
                  </label>
                  <select
                    value={inputCategory}
                    onChange={(e) => setInputCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border border-brand-gold/40 rounded-xl text-white focus:outline-none focus:border-brand-gold"
                  >
                    <option value="Maha Aarti">Maha Aarti (महाआरती)</option>
                    <option value="Visarjan Sohala">Visarjan Sohala (विसर्जन सोहळा)</option>
                    <option value="Miravnuk">Miravnuk Procession (मिरवणूक)</option>
                    <option value="Live Darshan">Live Sanctum Darshan (थेट दर्शन)</option>
                    <option value="Navratri Mahotsav">Navratri Mahotsav (नवरात्रौत्सव)</option>
                    <option value="Videos & Reels">Devotional Reels (रील्स)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">
                    {lang === 'EN' ? 'Year' : 'वर्ष'}
                  </label>
                  <input
                    type="text"
                    value={inputYear}
                    onChange={(e) => setInputYear(e.target.value)}
                    placeholder="2026"
                    className="w-full px-3 py-2 bg-black/60 border border-brand-gold/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  {lang === 'EN' ? 'Marathi Description' : 'मराठी वर्णन'}
                </label>
                <textarea
                  rows={2}
                  value={inputDescMR}
                  onChange={(e) => setInputDescMR(e.target.value)}
                  placeholder="व्हिडिओचे संक्षिप्त वर्णन..."
                  className="w-full px-3 py-2 bg-black/60 border border-brand-gold/40 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold resize-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-brand-gold/20">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-gray-300 font-bold cursor-pointer"
                >
                  {lang === 'EN' ? 'Cancel' : 'रद्द करा'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-gold via-amber-400 to-brand-gold text-brand-maroon font-bold shadow-lg hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <span>{lang === 'EN' ? 'Saving to Firebase...' : 'जतन होत आहे...'}</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>{lang === 'EN' ? 'Save Video URL' : 'व्हिडिओ लिंक जतन करा'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
