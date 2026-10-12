/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { InstagramVideoEmbed, extractInstagramShortcode, getInstagramEmbedUrl } from './InstagramVideoEmbed';
import { 
  subscribeGalleryMedia, 
  addGalleryMedia, 
  updateGalleryMedia, 
  deleteGalleryMedia, 
  GalleryMediaItem, 
  GalleryMediaType,
  getCachedGalleryMedia,
  INITIAL_GALLERY_MEDIA
} from '../services/galleryMediaService';
import { 
  Instagram, 
  Video, 
  ZoomIn, 
  ZoomOut, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Plus, 
  Sparkles, 
  Volume2, 
  Film,
  Calendar,
  Loader2,
  Pencil,
  Trash2,
  AlertTriangle,
  Play,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

interface MasonryGalleryProps {
  lang: 'EN' | 'MR';
}

type MediaTypeFilter = 'all' | 'photos' | 'videos' | 'instagram';

export const MasonryGallery: React.FC<MasonryGalleryProps> = ({ lang }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>('all');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryMediaItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [showFeaturedAltar, setShowFeaturedAltar] = useState<boolean>(true);

  // Unified Gallery Media Items (Photos, Videos, Instagram Reels)
  const [mediaItems, setMediaItems] = useState<GalleryMediaItem[]>(() => getCachedGalleryMedia());

  // Active Featured Reel for Top Showcase Altar
  const [activeFeaturedId, setActiveFeaturedId] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Media Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addForm, setAddForm] = useState<{
    type: GalleryMediaType;
    url: string;
    titleMR: string;
    titleEN: string;
    category: string;
    year: string;
    descriptionMR: string;
    descriptionEN: string;
    authorHandle: string;
  }>({
    type: 'photo',
    url: '',
    titleMR: '',
    titleEN: '',
    category: 'Mata Darshan',
    year: '2026',
    descriptionMR: '',
    descriptionEN: '',
    authorHandle: '@ishwatichi_mata'
  });

  // Edit Media Modal State
  const [editingItem, setEditingItem] = useState<GalleryMediaItem | null>(null);
  const [editForm, setEditForm] = useState<{
    type: GalleryMediaType;
    url: string;
    titleMR: string;
    titleEN: string;
    category: string;
    year: string;
    descriptionMR: string;
    descriptionEN: string;
    authorHandle: string;
  }>({
    type: 'photo',
    url: '',
    titleMR: '',
    titleEN: '',
    category: 'Mata Darshan',
    year: '2026',
    descriptionMR: '',
    descriptionEN: '',
    authorHandle: '@ishwatichi_mata'
  });

  // Delete Confirmation State
  const [deletingItem, setDeletingItem] = useState<GalleryMediaItem | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusError, setStatusError] = useState<string>('');
  const [statusSuccess, setStatusSuccess] = useState<string>('');

  // Subscribe to real-time updates from Firestore 'gallery_media'
  useEffect(() => {
    const unsubscribe = subscribeGalleryMedia((items) => {
      if (items && items.length > 0) {
        setMediaItems(items);
        if (!activeFeaturedId) {
          const firstReel = items.find(x => x.type === 'instagram') || items[0];
          if (firstReel) setActiveFeaturedId(firstReel.id);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Compute available distinct years dynamically
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>(['2026', '2025', '2024', '1974']);
    mediaItems.forEach(item => {
      if (item.year && item.year.trim()) {
        yearsSet.add(item.year.trim());
      }
    });
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [mediaItems]);

  // Category Configuration
  const categories = [
    { id: 'All', labelMR: 'सर्व विभाग', labelEN: 'All Categories' },
    { id: 'Mata Darshan', labelMR: 'माता दर्शन', labelEN: 'Mata Darshan' },
    { id: 'Videos & Reels', labelMR: 'व्हिडिओ व रील', labelEN: 'Videos & Reels' },
    { id: 'Festivals', labelMR: 'उत्सव', labelEN: 'Festivals' },
    { id: 'Decorations', labelMR: 'मंदिर सजावट', labelEN: 'Decorations' },
    { id: 'Community Service', labelMR: 'सामाजिक सेवा', labelEN: 'Community Service' }
  ];

  // Instagram Reels list for top altar showcase
  const reelsList = useMemo(() => {
    return mediaItems.filter(item => item.type === 'instagram' || item.type === 'video');
  }, [mediaItems]);

  const activeFeaturedReel = useMemo(() => {
    return reelsList.find(r => r.id === activeFeaturedId) || reelsList[0] || mediaItems[0];
  }, [reelsList, activeFeaturedId, mediaItems]);

  // Filtered Media Items (By Year, Media Type, and Category)
  const filteredItems = useMemo(() => {
    return mediaItems.filter(item => {
      // 1. Filter by Year
      if (selectedYear !== 'All' && item.year !== selectedYear) {
        return false;
      }

      // 2. Filter by Media Type
      if (mediaTypeFilter === 'photos' && item.type !== 'photo') {
        return false;
      }
      if (mediaTypeFilter === 'videos' && item.type !== 'video') {
        return false;
      }
      if (mediaTypeFilter === 'instagram' && item.type !== 'instagram') {
        return false;
      }

      // 3. Filter by Category
      if (activeCategory !== 'All') {
        if (activeCategory === 'Videos & Reels') {
          return item.type === 'video' || item.type === 'instagram' || item.category === 'Videos & Reels';
        }
        return item.category === activeCategory;
      }

      return true;
    });
  }, [mediaItems, selectedYear, mediaTypeFilter, activeCategory]);

  // Lightbox Handlers
  const handleOpenLightbox = (item: GalleryMediaItem) => {
    if (item.type === 'photo') {
      setSelectedPhoto(item);
      setZoomLevel(1);
      setCopied(false);
    }
  };

  const photoList = useMemo(() => {
    return filteredItems.filter(i => i.type === 'photo');
  }, [filteredItems]);

  const handleNextPhoto = () => {
    if (!selectedPhoto || photoList.length === 0) return;
    const currentIndex = photoList.findIndex(x => x.id === selectedPhoto.id);
    const nextIndex = (currentIndex + 1) % photoList.length;
    setSelectedPhoto(photoList[nextIndex]);
    setZoomLevel(1);
    setCopied(false);
  };

  const handlePrevPhoto = () => {
    if (!selectedPhoto || photoList.length === 0) return;
    const currentIndex = photoList.findIndex(x => x.id === selectedPhoto.id);
    const prevIndex = (currentIndex - 1 + photoList.length) % photoList.length;
    setSelectedPhoto(photoList[prevIndex]);
    setZoomLevel(1);
    setCopied(false);
  };

  const handleCopyLink = (url: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyReelLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleShareWhatsApp = (item: GalleryMediaItem) => {
    const text = lang === 'EN' 
      ? `|| Shree Ishwatichi Mata Prasanna || ${item.titleEN || item.titleMR} (${item.year}): ${item.url}`
      : `|| श्री इश्वटीची माता प्रसन्न || ${item.titleMR || item.titleEN} (${item.year}): ${item.url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  // Open Edit Modal
  const handleOpenEdit = (item: GalleryMediaItem) => {
    setEditingItem(item);
    setEditForm({
      type: item.type,
      url: item.url,
      titleMR: item.titleMR,
      titleEN: item.titleEN,
      category: item.category || 'Mata Darshan',
      year: item.year || '2026',
      descriptionMR: item.descriptionMR || '',
      descriptionEN: item.descriptionEN || '',
      authorHandle: item.authorHandle || '@ishwatichi_mata'
    });
    setStatusError('');
    setStatusSuccess('');
  };

  // Open Delete Confirmation
  const handleOpenDelete = (item: GalleryMediaItem) => {
    setDeletingItem(item);
    setStatusError('');
    setStatusSuccess('');
  };

  // Submit Add Media
  const handleAddMediaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusError('');
    setStatusSuccess('');

    const cleanUrl = addForm.url.trim();
    if (!cleanUrl) {
      setStatusError(lang === 'EN' ? 'Please enter a valid URL.' : 'कृपया वैध लिंक प्रविष्ट करा.');
      return;
    }

    try {
      setIsSubmitting(true);

      let embedUrl = undefined;
      if (addForm.type === 'instagram') {
        embedUrl = getInstagramEmbedUrl(cleanUrl);
      } else if (addForm.type === 'video' && cleanUrl.includes('youtube.com/watch?v=')) {
        const vidId = cleanUrl.split('v=')[1]?.split('&')[0];
        if (vidId) embedUrl = `https://www.youtube.com/embed/${vidId}`;
      } else if (addForm.type === 'video' && cleanUrl.includes('youtu.be/')) {
        const vidId = cleanUrl.split('youtu.be/')[1]?.split('?')[0];
        if (vidId) embedUrl = `https://www.youtube.com/embed/${vidId}`;
      }

      const newItem = await addGalleryMedia({
        type: addForm.type,
        url: cleanUrl,
        embedUrl,
        titleMR: addForm.titleMR.trim() || 'श्री ईश्वटीची माता पावन दर्शन',
        titleEN: addForm.titleEN.trim() || 'Shree Ishwatichi Mata Sacred Darshan',
        category: addForm.category,
        year: addForm.year.trim() || '2026',
        descriptionMR: addForm.descriptionMR.trim(),
        descriptionEN: addForm.descriptionEN.trim(),
        authorHandle: addForm.authorHandle.trim() || '@ishwatichi_mata'
      });

      setMediaItems(prev => [newItem, ...prev]);
      setStatusSuccess(lang === 'EN' ? 'Media added successfully!' : 'माध्यम यशस्वीरित्या गॅलरीमध्ये जोडले गेले!');

      setAddForm({
        type: 'photo',
        url: '',
        titleMR: '',
        titleEN: '',
        category: 'Mata Darshan',
        year: '2026',
        descriptionMR: '',
        descriptionEN: '',
        authorHandle: '@ishwatichi_mata'
      });

      setTimeout(() => {
        setShowAddModal(false);
        setStatusSuccess('');
      }, 1500);
    } catch (err: any) {
      setStatusError(err.message || 'Error saving media.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Media
  const handleEditMediaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setStatusError('');
    setStatusSuccess('');

    try {
      setIsSubmitting(true);

      let embedUrl = editingItem.embedUrl;
      if (editForm.type === 'instagram') {
        embedUrl = getInstagramEmbedUrl(editForm.url.trim());
      }

      await updateGalleryMedia(editingItem.id, {
        type: editForm.type,
        url: editForm.url.trim(),
        embedUrl,
        titleMR: editForm.titleMR.trim() || editingItem.titleMR,
        titleEN: editForm.titleEN.trim() || editingItem.titleEN,
        category: editForm.category,
        year: editForm.year.trim() || editingItem.year,
        descriptionMR: editForm.descriptionMR.trim(),
        descriptionEN: editForm.descriptionEN.trim(),
        authorHandle: editForm.authorHandle.trim()
      });

      setMediaItems(prev => prev.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            type: editForm.type,
            url: editForm.url.trim(),
            embedUrl,
            titleMR: editForm.titleMR.trim() || item.titleMR,
            titleEN: editForm.titleEN.trim() || item.titleEN,
            category: editForm.category,
            year: editForm.year.trim() || item.year,
            descriptionMR: editForm.descriptionMR.trim(),
            descriptionEN: editForm.descriptionEN.trim(),
            authorHandle: editForm.authorHandle.trim()
          };
        }
        return item;
      }));

      setStatusSuccess(lang === 'EN' ? 'Updated successfully!' : 'यशस्वीरित्या अद्ययावत झाले!');
      setTimeout(() => {
        setEditingItem(null);
        setStatusSuccess('');
      }, 1500);
    } catch (err: any) {
      setStatusError(err.message || 'Error updating media.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete Media
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      setIsSubmitting(true);
      await deleteGalleryMedia(deletingItem.id);
      setMediaItems(prev => prev.filter(item => item.id !== deletingItem.id));
      setStatusSuccess(lang === 'EN' ? 'Item deleted successfully!' : 'माध्यम यशस्वीरित्या हटवले!');
      setTimeout(() => {
        setDeletingItem(null);
        setStatusSuccess('');
      }, 1200);
    } catch (err: any) {
      setStatusError(err.message || 'Error deleting item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-brand-maroon/20 rounded-2xl border border-brand-gold/20 p-5 sm:p-7 md:p-8 text-white backdrop-blur-sm shadow-2xl space-y-8 font-sans">
      
      {/* ========================================================================= */}
      {/* 1. GALLERY HEADER, FILTER CONTROLS & ADD MEDIA BUTTON                     */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-5 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-brand-gold text-xs font-mono font-bold uppercase tracking-wider">
              🖼️ Sacred Visual & Video Archives • स्थापना १९७४
            </span>
            <span className="bg-brand-gold/15 text-brand-gold text-[10px] font-mono px-2 py-0.5 rounded-full border border-brand-gold/30">
              ५३ वे वर्ष
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-black text-white">
            {lang === 'EN' ? 'Shree Ishwatichi Mata Grand Gallery & Video Vault' : 'श्री इश्वटीची माता भव्य छायाचित्र व व्हिडिओ दालन'}
          </h2>

          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-3xl leading-relaxed">
            {lang === 'EN' 
              ? 'Explore sacred sanctum darshans, festival celebrations, and Instagram video reels categorized by Year and Media Type.' 
              : 'देवींचे मूळ सुवर्ण रूप, गर्भगृह राजसिंहासन, वर्षनिहाय उत्सव मिरवणुका आणि अधिकृत इन्स्टाग्राम व्हिडिओ रीलचे एकात्मिक दर्शन.'}
          </p>
        </div>

        {/* Action Toolbar: Add Media + Toggle Featured Altar */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0 flex-wrap">
          {reelsList.length > 0 && (
            <button
              onClick={() => setShowFeaturedAltar(!showFeaturedAltar)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                showFeaturedAltar 
                  ? 'bg-purple-900/60 text-purple-200 border-purple-500/40 shadow'
                  : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
              }`}
              title={lang === 'EN' ? 'Toggle Featured Video Altar' : 'विशेष व्हिडिओ मंच चालू/बंद करा'}
            >
              <Film className="h-3.5 w-3.5 text-brand-gold" />
              <span>{showFeaturedAltar ? (lang === 'EN' ? 'Hide Altar' : 'मंच लपवा') : (lang === 'EN' ? 'Featured Altar' : 'विशेष मंच')}</span>
            </button>
          )}

          <button
            onClick={() => {
              setStatusError('');
              setStatusSuccess('');
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/90 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-brand-maroon px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg hover:shadow-brand-gold/30 border border-brand-gold"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{lang === 'EN' ? 'Add Photo / Video / Reel' : 'नवीन फोटो / व्हिडिओ / रील जोडा'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. YEAR SELECTION RIBBON (DISPLAY BY YEAR)                                */}
      {/* ========================================================================= */}
      <div className="bg-black/50 p-3 rounded-xl border border-brand-gold/30 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-brand-gold font-bold uppercase tracking-wider">
            <Calendar className="h-4 w-4 text-brand-saffron" />
            <span>{lang === 'EN' ? 'Filter by Festival Year:' : 'उत्सव वर्षानुसार पहा (Filter by Year):'}</span>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">
            {lang === 'EN' ? `Showing ${filteredItems.length} media items` : `एकूण ${filteredItems.length} साहित्य उपलब्ध`}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin py-1">
          <button
            onClick={() => setSelectedYear('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all border ${
              selectedYear === 'All'
                ? 'bg-brand-gold text-brand-maroon border-brand-gold shadow-md font-black scale-105'
                : 'bg-black/60 text-gray-300 border-white/10 hover:border-brand-gold/40'
            }`}
          >
            {lang === 'EN' ? '🌟 All Years' : '🌟 सर्व वर्षे'}
          </button>

          {availableYears.map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all border flex items-center gap-1 ${
                selectedYear === yr
                  ? 'bg-brand-red text-white border-brand-gold shadow-md font-black scale-105'
                  : 'bg-black/60 text-gray-300 border-white/10 hover:border-brand-gold/40'
              }`}
            >
              <span>📅</span>
              <span>{yr === '1974' ? (lang === 'EN' ? '1974 (Est.)' : '१९७४ (स्थापना)') : yr}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MEDIA TYPE SWITCHER & CATEGORY FILTER BAR                              */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-black/40 p-2.5 rounded-xl border border-white/10">
        
        {/* Media Type Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-white/5 flex-wrap">
          <button
            onClick={() => { setMediaTypeFilter('all'); setActiveCategory('All'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              mediaTypeFilter === 'all' && activeCategory === 'All'
                ? 'bg-brand-gold text-brand-maroon shadow font-black'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{lang === 'EN' ? 'All Content' : 'सर्व'}</span>
          </button>

          <button
            onClick={() => { setMediaTypeFilter('photos'); if (activeCategory === 'Videos & Reels') setActiveCategory('All'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              mediaTypeFilter === 'photos'
                ? 'bg-brand-gold text-brand-maroon shadow font-black'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>{lang === 'EN' ? 'Photos Only' : 'छायाचित्रे'}</span>
          </button>

          <button
            onClick={() => { setMediaTypeFilter('videos'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              mediaTypeFilter === 'videos'
                ? 'bg-blue-600 text-white shadow font-black'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Video className="h-3.5 w-3.5 text-blue-300" />
            <span>{lang === 'EN' ? 'Videos' : 'व्हिडिओ'}</span>
          </button>

          <button
            onClick={() => { setMediaTypeFilter('instagram'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              mediaTypeFilter === 'instagram'
                ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow font-black'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Instagram className="h-3.5 w-3.5 text-pink-300" />
            <span>{lang === 'EN' ? 'Instagram Reels' : 'इन्स्टाग्राम रील'}</span>
          </button>
        </div>

        {/* Category Pills Ribbon */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-thin py-1 sm:py-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                if (cat.id === 'Videos & Reels') {
                  setMediaTypeFilter('videos');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all border ${
                activeCategory === cat.id
                  ? 'bg-brand-red text-white border-brand-gold/60 shadow-md'
                  : 'bg-black/30 text-gray-400 border-white/5 hover:text-white hover:border-white/20'
              }`}
            >
              {lang === 'EN' ? cat.labelEN : cat.labelMR}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FEATURED INSTAGRAM REEL ALTAR (EXPANDABLE SACRED SHOWCASE)             */}
      {/* ========================================================================= */}
      {showFeaturedAltar && reelsList.length > 0 && activeFeaturedReel && (
        <div className="bg-gradient-to-b from-[#2E0202]/90 via-black/85 to-[#1E0101]/95 border-2 border-brand-gold/45 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-5">
          
          {/* Altar Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-gold/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-yellow-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow">
                <Play className="h-4 w-4 fill-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-sans font-black text-brand-gold">
                  {lang === 'EN' ? 'Featured Devotional Video & Reel Altar' : 'विशेष पावन व्हिडिओ व रील महादर्शन'}
                </h3>
                <span className="text-[10px] text-gray-300 font-mono">
                  {activeFeaturedReel.authorHandle} • वर्ष: {activeFeaturedReel.year || '२०२६'}
                </span>
              </div>
            </div>

            {/* Reel Selector Pill Ribbon */}
            {reelsList.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin py-0.5">
                {reelsList.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setActiveFeaturedId(r.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1 ${
                      activeFeaturedId === r.id
                        ? 'bg-brand-red text-white border-brand-gold shadow'
                        : 'bg-black/50 text-gray-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <Film className="h-3 w-3 text-brand-gold" />
                    <span className="truncate max-w-[120px] sm:max-w-[150px]">
                      {lang === 'EN' ? (r.titleEN || r.titleMR) : r.titleMR}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Two-Column Responsive Interactive Player Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Column: Responsive Playable Embed */}
            <div className="lg:col-span-5 xl:col-span-5 flex justify-center w-full">
              {activeFeaturedReel.type === 'instagram' ? (
                <InstagramVideoEmbed
                  url={activeFeaturedReel.url}
                  title={lang === 'EN' ? activeFeaturedReel.titleEN : activeFeaturedReel.titleMR}
                  caption={lang === 'EN' ? activeFeaturedReel.descriptionEN : activeFeaturedReel.descriptionMR}
                  authorHandle={activeFeaturedReel.authorHandle}
                  establishedYear={activeFeaturedReel.year || '१९७४'}
                  lang={lang}
                  className="w-full max-w-[380px] sm:max-w-[420px]"
                />
              ) : activeFeaturedReel.embedUrl ? (
                <div className="w-full max-w-[420px] aspect-video rounded-xl overflow-hidden border border-brand-gold/40 shadow-xl bg-black">
                  <iframe
                    src={activeFeaturedReel.embedUrl}
                    title={activeFeaturedReel.titleMR}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="w-full max-w-[380px] aspect-[4/5] rounded-xl overflow-hidden border border-brand-gold/40 shadow-xl bg-black flex items-center justify-center p-2">
                  <img
                    src={activeFeaturedReel.url}
                    alt={activeFeaturedReel.titleMR}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* Right Column: Profile, Metadata & Devotee Action Matrix */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-4 text-left">
              
              {/* Account Profile Header */}
              <div className="bg-black/60 p-4 rounded-xl border border-brand-gold/25 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full p-0.5 bg-gradient-to-tr from-yellow-500 via-rose-500 to-purple-600 shadow-md shrink-0">
                    <div className="h-full w-full rounded-full bg-brand-maroon flex items-center justify-center font-bold text-brand-gold text-base">
                      ॐ
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm">
                        {activeFeaturedReel.authorHandle}
                      </span>
                      <span className="text-sky-400 text-xs" title="Verified Mandal">✓</span>
                    </div>
                    <span className="text-[11px] text-brand-gold font-mono block">
                      श्री यंग ईश्वटी नवरात्रौत्सव मंडळ (वर्ष: {activeFeaturedReel.year || '२०२६'})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(activeFeaturedReel)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-brand-gold transition-colors cursor-pointer"
                    title={lang === 'EN' ? 'Edit Details' : 'माहिती बदला'}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(activeFeaturedReel)}
                    className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 transition-colors cursor-pointer"
                    title={lang === 'EN' ? 'Delete' : 'हटवा'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-brand-gold/20 text-brand-gold text-[10px] font-mono px-2 py-0.5 rounded border border-brand-gold/40">
                    {activeFeaturedReel.category || 'Mata Darshan'}
                  </span>
                  <span className="bg-purple-900/40 text-purple-200 text-[10px] font-mono px-2 py-0.5 rounded border border-purple-500/30">
                    वर्ष {activeFeaturedReel.year}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white">
                  {lang === 'EN' ? (activeFeaturedReel.titleEN || activeFeaturedReel.titleMR) : activeFeaturedReel.titleMR}
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {lang === 'EN' 
                    ? (activeFeaturedReel.descriptionEN || activeFeaturedReel.descriptionMR) 
                    : activeFeaturedReel.descriptionMR}
                </p>
              </div>

              {/* Devotee Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={() => handleShareWhatsApp(activeFeaturedReel)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <span>💬 WhatsApp</span>
                </button>
                <button
                  onClick={() => handleCopyReelLink(activeFeaturedReel.url, activeFeaturedReel.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copiedId === activeFeaturedReel.id ? (lang === 'EN' ? 'Copied Link!' : 'लिंक कॉपी झाली!') : (lang === 'EN' ? 'Copy Link' : 'लिंक कॉपी करा')}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. RESPONSIVE GRID LAYOUT FOR PHOTOS, VIDEOS & REELS (BY YEAR)            */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-brand-gold uppercase tracking-wider">
              {lang === 'EN' ? 'Gallery Showcase Grid' : 'पावन प्रदर्शन दालन'}
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              ({filteredItems.length} {lang === 'EN' ? 'items' : 'साहित्य'} {selectedYear !== 'All' ? `• वर्ष: ${selectedYear}` : ''})
            </span>
          </div>

          <div className="text-[11px] text-gray-400 hidden sm:block font-mono">
            {lang === 'EN' ? 'Tap photo to zoom • Tap video to watch' : 'मोठ्या दर्शनासाठी चित्रावर क्लिक करा • रील प्ले करा'}
          </div>
        </div>

        {/* The Core Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {filteredItems.map((item) => {
            const isPhoto = item.type === 'photo';
            const isInstagram = item.type === 'instagram';
            const isVideo = item.type === 'video';

            return (
              <div
                key={item.id}
                className="flex flex-col rounded-2xl overflow-hidden border border-brand-gold/30 bg-gradient-to-b from-brand-maroon/20 via-black/60 to-black/90 shadow-xl hover:shadow-2xl hover:border-brand-gold/80 transition-all duration-300 group text-left relative"
              >
                {/* Top Badge Strip (Type, Year, Actions) */}
                <div className="bg-black/80 px-3 py-2 border-b border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isPhoto 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : isVideo
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                    }`}>
                      {isPhoto ? '📷 फोटो' : isVideo ? '🎥 व्हिडिओ' : '📱 रील'}
                    </span>
                    <span className="bg-brand-gold/20 text-brand-gold text-[10px] font-mono font-black px-2 py-0.5 rounded border border-brand-gold/30">
                      📅 {item.year}
                    </span>
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(item);
                      }}
                      className="p-1 rounded text-gray-400 hover:text-brand-gold transition-colors cursor-pointer"
                      title={lang === 'EN' ? 'Edit item' : 'संपादित करा'}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDelete(item);
                      }}
                      className="p-1 rounded text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                      title={lang === 'EN' ? 'Delete item' : 'हटवा'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Media Preview Container */}
                {isInstagram ? (
                  <div className="p-3 bg-black/90 flex justify-center">
                    <InstagramVideoEmbed
                      url={item.url}
                      title={lang === 'EN' ? item.titleEN : item.titleMR}
                      caption={lang === 'EN' ? item.descriptionEN : item.descriptionMR}
                      authorHandle={item.authorHandle}
                      establishedYear={item.year}
                      lang={lang}
                      className="w-full"
                    />
                  </div>
                ) : isVideo && item.embedUrl ? (
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      src={item.embedUrl}
                      title={item.titleMR}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div 
                    onClick={() => handleOpenLightbox(item)}
                    className="relative w-full aspect-[4/5] overflow-hidden bg-black/90 flex items-center justify-center cursor-pointer"
                  >
                    <img
                      src={item.url}
                      alt={item.titleMR}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />

                    {/* Sacred Emblem Corner Badge */}
                    <div className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-md border border-brand-gold/60 text-brand-gold text-[10px] font-sans font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 pointer-events-none">
                      <span>🌸</span>
                      <span>श्री इश्वटीची • {item.year}</span>
                    </div>

                    {/* Hover Overlay with Zoom Prompt */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <div className="flex items-center justify-between text-xs text-white">
                        <span className="flex items-center gap-1.5 text-brand-gold font-bold">
                          <ZoomIn className="h-4 w-4" />
                          <span>{lang === 'EN' ? 'Click to View Full HD' : 'मोठ्या आकारात पहा'}</span>
                        </span>
                        <span className="flex items-center gap-1 text-brand-saffron">
                          <Share2 className="h-3.5 w-3.5" />
                          <span>{lang === 'EN' ? 'Share' : 'शेअर'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Bottom Meta */}
                <div className="p-3.5 text-left border-t border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                    <span>{item.category}</span>
                    <span className="text-brand-gold font-bold">वर्ष: {item.year}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-sans font-black text-white group-hover:text-brand-gold transition-colors line-clamp-2">
                    {lang === 'EN' ? (item.titleEN || item.titleMR) : item.titleMR}
                  </h4>
                  {item.descriptionMR && (
                    <p className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed">
                      {lang === 'EN' ? (item.descriptionEN || item.descriptionMR) : item.descriptionMR}
                    </p>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="p-12 text-center bg-black/40 border border-white/10 rounded-2xl space-y-2">
            <span className="text-3xl block">🖼️</span>
            <h4 className="font-bold text-white text-base">
              {lang === 'EN' ? 'No items found for the selected year/filters' : 'निवडलेल्या वर्षामध्ये कोणतेही माध्यम उपलब्ध नाही'}
            </h4>
            <p className="text-xs text-gray-400">
              {lang === 'EN' ? 'Try selecting "All Years" or click "Add Photo / Video / Reel" to upload.' : '"सर्व वर्षे" निवडा किंवा वरील बटणावर क्लिक करून नवीन फोटो/व्हिडिओ जोडा.'}
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. UNIVERSAL ADD MEDIA MODAL (PHOTO, VIDEO, INSTAGRAM BY YEAR)            */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <form 
            onSubmit={handleAddMediaSubmit}
            className="bg-zinc-950 border-2 border-brand-gold/60 rounded-2xl p-5 sm:p-6 w-full max-w-xl space-y-4 shadow-2xl text-xs text-left"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-brand-gold font-bold text-sm">
                <Plus className="h-4 w-4 text-brand-gold" />
                <span>{lang === 'EN' ? 'Add Photo, Video or Instagram Reel by Year' : 'वर्षनिहाय फोटो, व्हिडिओ किंवा इन्स्टाग्राम रील जोडा'}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Media Type Selector */}
            <div className="space-y-1.5">
              <label className="block text-gray-300 font-semibold">
                {lang === 'EN' ? 'Select Media Type *' : 'माध्यम प्रकार निवडा *'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAddForm(prev => ({ ...prev, type: 'photo' }))}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    addForm.type === 'photo'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-md ring-1 ring-amber-500'
                      : 'bg-black/50 text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>{lang === 'EN' ? 'Photo / Image' : 'छायाचित्र (Photo)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAddForm(prev => ({ ...prev, type: 'video' }))}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    addForm.type === 'video'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500 shadow-md ring-1 ring-blue-500'
                      : 'bg-black/50 text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  <Video className="h-4 w-4" />
                  <span>{lang === 'EN' ? 'Video / YouTube' : 'व्हिडिओ (Video)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAddForm(prev => ({ ...prev, type: 'instagram' }))}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    addForm.type === 'instagram'
                      ? 'bg-pink-500/20 text-pink-300 border-pink-500 shadow-md ring-1 ring-pink-500'
                      : 'bg-black/50 text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  <Instagram className="h-4 w-4" />
                  <span>{lang === 'EN' ? 'Instagram Reel' : 'इन्स्टाग्राम रील'}</span>
                </button>
              </div>
            </div>

            {/* Year & Category Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {lang === 'EN' ? 'Festival Year *' : 'उत्सव वर्ष (Year) *'}
                </label>
                <input
                  type="text"
                  placeholder="उदा. 2026, 2025, 2024, 1974"
                  value={addForm.year}
                  onChange={(e) => setAddForm(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {lang === 'EN' ? 'Category *' : 'वर्ग / विभाग *'}
                </label>
                <select
                  value={addForm.category}
                  onChange={(e) => setAddForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-gold text-xs"
                >
                  <option value="Mata Darshan">माता दर्शन (Mata Darshan)</option>
                  <option value="Festivals">उत्सव (Festivals)</option>
                  <option value="Decorations">मंदिर सजावट (Decorations)</option>
                  <option value="Community Service">सामाजिक सेवा (Community Service)</option>
                  <option value="Videos & Reels">व्हिडिओ व रील (Videos & Reels)</option>
                </select>
              </div>
            </div>

            {/* URL Input */}
            <div>
              <label className="block text-gray-300 font-semibold mb-1">
                {addForm.type === 'photo' 
                  ? (lang === 'EN' ? 'Photo Direct URL *' : 'फोटो लिंक (Image Direct URL) *')
                  : addForm.type === 'video'
                  ? (lang === 'EN' ? 'Video / YouTube URL *' : 'व्हिडिओ किंवा YouTube लिंक *')
                  : (lang === 'EN' ? 'Instagram Reel URL *' : 'इन्स्टाग्राम रील किंवा पोस्ट लिंक *')}
              </label>
              <input
                type="url"
                placeholder={
                  addForm.type === 'photo' 
                    ? 'https://example.com/festival-photo.jpg'
                    : addForm.type === 'video'
                    ? 'https://www.youtube.com/watch?v=...'
                    : 'https://www.instagram.com/reel/Cx0sn8AoN7l/...'
                }
                value={addForm.url}
                onChange={(e) => setAddForm(prev => ({ ...prev, url: e.target.value }))}
                className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold font-mono text-xs"
                required
              />
            </div>

            {/* Titles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {lang === 'EN' ? 'Title (Marathi) *' : 'शीर्षक (मराठी) *'}
                </label>
                <input
                  type="text"
                  placeholder="उदा. शारदीय नवरात्रौत्सव भव्य मिरवणूक"
                  value={addForm.titleMR}
                  onChange={(e) => setAddForm(prev => ({ ...prev, titleMR: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {lang === 'EN' ? 'Title (English)' : 'शीर्षक (इंग्रजी)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Navratri Festival Grand Procession"
                  value={addForm.titleEN}
                  onChange={(e) => setAddForm(prev => ({ ...prev, titleEN: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            {/* Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {lang === 'EN' ? 'Description (Marathi)' : 'तपशील / वर्णन (मराठी)'}
                </label>
                <textarea
                  rows={2}
                  placeholder="उदा. नवरात्र उत्सवातील भक्तिमय दर्शन आणि महाआरती."
                  value={addForm.descriptionMR}
                  onChange={(e) => setAddForm(prev => ({ ...prev, descriptionMR: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {lang === 'EN' ? 'Description (English)' : 'तपशील / वर्णन (इंग्रजी)'}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Sacred festival celebrations and grand maha aarti."
                  value={addForm.descriptionEN}
                  onChange={(e) => setAddForm(prev => ({ ...prev, descriptionEN: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold resize-none"
                />
              </div>
            </div>

            {statusError && (
              <p className="text-red-400 font-medium text-[11px] bg-red-950/40 p-2 rounded border border-red-500/30">{statusError}</p>
            )}

            {statusSuccess && (
              <p className="text-green-400 font-medium text-[11px] flex items-center gap-1.5 bg-green-950/40 p-2 rounded border border-green-500/30">
                <Check className="h-3.5 w-3.5" />
                <span>{statusSuccess}</span>
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 cursor-pointer disabled:opacity-50"
              >
                {lang === 'EN' ? 'Cancel' : 'रद्द करा'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-brand-gold text-brand-maroon font-bold hover:bg-yellow-400 cursor-pointer shadow disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{lang === 'EN' ? 'Saving...' : 'जतन होत आहे...'}</span>
                  </>
                ) : (
                  <span>{lang === 'EN' ? 'Save to Gallery' : 'गॅलरीमध्ये जोडा व जतन करा'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. UNIVERSAL EDIT MEDIA MODAL                                             */}
      {/* ========================================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <form 
            onSubmit={handleEditMediaSubmit}
            className="bg-zinc-950 border-2 border-brand-gold/60 rounded-2xl p-5 sm:p-6 w-full max-w-xl space-y-4 shadow-2xl text-xs text-left"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-brand-gold font-bold text-sm">
                <Pencil className="h-4 w-4 text-brand-gold" />
                <span>{lang === 'EN' ? 'Edit Gallery Media Details' : 'माध्यम माहिती संपादन करा'}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {lang === 'EN' ? 'Media Type' : 'माध्यम प्रकार'}
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value as GalleryMediaType }))}
                  className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-gold text-xs"
                >
                  <option value="photo">छायाचित्र (Photo)</option>
                  <option value="video">व्हिडिओ (Video)</option>
                  <option value="instagram">इन्स्टाग्राम रील (Instagram)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {lang === 'EN' ? 'Festival Year *' : 'उत्सव वर्ष (Year) *'}
                </label>
                <input
                  type="text"
                  value={editForm.year}
                  onChange={(e) => setEditForm(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold font-mono text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">
                {lang === 'EN' ? 'Media URL *' : 'वेब लिंक (URL) *'}
              </label>
              <input
                type="url"
                value={editForm.url}
                onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold font-mono text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {lang === 'EN' ? 'Title (Marathi) *' : 'शीर्षक (मराठी) *'}
                </label>
                <input
                  type="text"
                  value={editForm.titleMR}
                  onChange={(e) => setEditForm(prev => ({ ...prev, titleMR: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {lang === 'EN' ? 'Title (English)' : 'शीर्षक (इंग्रजी)'}
                </label>
                <input
                  type="text"
                  value={editForm.titleEN}
                  onChange={(e) => setEditForm(prev => ({ ...prev, titleEN: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">
                {lang === 'EN' ? 'Category' : 'वर्ग'}
              </label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-gold text-xs"
              >
                <option value="Mata Darshan">माता दर्शन (Mata Darshan)</option>
                <option value="Festivals">उत्सव (Festivals)</option>
                <option value="Decorations">मंदिर सजावट (Decorations)</option>
                <option value="Community Service">सामाजिक सेवा (Community Service)</option>
                <option value="Videos & Reels">व्हिडिओ व रील (Videos & Reels)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {lang === 'EN' ? 'Description (Marathi)' : 'तपशील (मराठी)'}
                </label>
                <textarea
                  rows={2}
                  value={editForm.descriptionMR}
                  onChange={(e) => setEditForm(prev => ({ ...prev, descriptionMR: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {lang === 'EN' ? 'Description (English)' : 'तपशील (इंग्रजी)'}
                </label>
                <textarea
                  rows={2}
                  value={editForm.descriptionEN}
                  onChange={(e) => setEditForm(prev => ({ ...prev, descriptionEN: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold resize-none"
                />
              </div>
            </div>

            {statusError && (
              <p className="text-red-400 font-medium text-[11px] bg-red-950/40 p-2 rounded border border-red-500/30">{statusError}</p>
            )}

            {statusSuccess && (
              <p className="text-green-400 font-medium text-[11px] flex items-center gap-1.5 bg-green-950/40 p-2 rounded border border-green-500/30">
                <Check className="h-3.5 w-3.5" />
                <span>{statusSuccess}</span>
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 cursor-pointer disabled:opacity-50"
              >
                {lang === 'EN' ? 'Cancel' : 'रद्द करा'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-brand-gold text-brand-maroon font-bold hover:bg-yellow-400 cursor-pointer shadow disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{lang === 'EN' ? 'Saving...' : 'जतन होत आहे...'}</span>
                  </>
                ) : (
                  <span>{lang === 'EN' ? 'Update Media' : 'माहिती अद्ययावत करा'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. UNIVERSAL DELETE CONFIRMATION MODAL                                    */}
      {/* ========================================================================= */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-950 border-2 border-red-500/40 rounded-2xl p-5 sm:p-6 w-full max-w-md space-y-4 shadow-2xl text-left">
            <div className="flex items-center gap-3 text-red-400">
              <div className="h-10 w-10 rounded-full bg-red-950/80 border border-red-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">
                  {lang === 'EN' ? 'Delete Gallery Media?' : 'गॅलरीमधील साहित्य हटवायचे आहे का?'}
                </h3>
                <span className="text-[11px] text-gray-400 font-mono">
                  {deletingItem.category} • वर्ष {deletingItem.year}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {lang === 'EN' 
                ? `Are you sure you want to delete "${deletingItem.titleEN || deletingItem.titleMR}"? This action will remove it from the gallery.`
                : `आपणास खात्री आहे का की "${deletingItem.titleMR || deletingItem.titleEN}" हे साहित्य गॅलरीमधून कायमचे काढून टाकायचे आहे?`}
            </p>

            {statusError && (
              <p className="text-red-400 font-medium text-[11px] bg-red-950/40 p-2 rounded border border-red-500/30">{statusError}</p>
            )}

            {statusSuccess && (
              <p className="text-green-400 font-medium text-[11px] flex items-center gap-1.5 bg-green-950/40 p-2 rounded border border-green-500/30">
                <Check className="h-3.5 w-3.5" />
                <span>{statusSuccess}</span>
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 cursor-pointer text-xs"
              >
                {lang === 'EN' ? 'Close' : 'बंद करा'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer shadow disabled:opacity-50 flex items-center gap-1.5 text-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{lang === 'EN' ? 'Deleting...' : 'काढत आहे...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{lang === 'EN' ? 'Yes, Delete' : 'होय, काढून टाका'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. HIGH-RES PHOTO LIGHTBOX MODAL                                          */}
      {/* ========================================================================= */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 md:p-6 md:pb-12 text-white animate-fade-in font-sans">
          
          {/* Lightbox Toolbar Top */}
          <div className="flex justify-between items-center bg-black/60 px-4 py-3 rounded-xl border border-white/10">
            <div className="text-left">
              <span className="text-[10px] text-brand-saffron uppercase font-mono font-bold block">
                {selectedPhoto.category} • वर्ष {selectedPhoto.year}
              </span>
              <h3 className="text-sm md:text-base font-sans font-semibold truncate max-w-xs sm:max-w-md">
                {lang === 'EN' ? (selectedPhoto.titleEN || selectedPhoto.titleMR) : selectedPhoto.titleMR}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              <button 
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                className="p-2 hover:bg-white/10 rounded-lg text-brand-gold cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="font-mono text-xs text-center w-12 select-none">
                {Math.floor(zoomLevel * 100)}%
              </span>
              <button 
                onClick={() => setZoomLevel(prev => Math.min(3.0, prev + 0.25))}
                className="p-2 hover:bg-white/10 rounded-lg text-brand-gold cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleCopyLink(selectedPhoto.url)}
                className="p-2 hover:bg-white/10 rounded-lg text-brand-saffron ml-2 cursor-pointer flex items-center gap-1.5"
                title="Copy Image URL directly"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">{copied ? (lang === 'EN' ? 'Copied URL!' : 'कॉपी झाले!') : (lang === 'EN' ? 'Share' : 'शेअर करा')}</span>
              </button>

              <button 
                onClick={() => setSelectedPhoto(null)}
                className="p-2 hover:bg-red-500/80 hover:text-white rounded-lg text-gray-400 font-mono text-base border border-white/5 ml-2 cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Lightbox Main Presentation Altar */}
          <div className="relative flex-1 flex items-center justify-center p-2 overflow-hidden">
            <button
              onClick={handlePrevPhoto}
              className="absolute left-2 md:left-6 z-20 p-3 h-12 w-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6 text-brand-gold" />
            </button>

            <button
              onClick={handleNextPhoto}
              className="absolute right-2 md:right-6 z-20 p-3 h-12 w-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6 text-brand-gold" />
            </button>

            <div className="relative max-w-[85vw] max-h-[60vh] md:max-h-[70vh] flex items-center justify-center transition-all duration-300 ease-out overflow-auto rounded-lg">
              <img 
                src={selectedPhoto.url} 
                alt={selectedPhoto.titleMR} 
                className="object-contain max-w-full max-h-[60vh] md:max-h-[70vh] transition-transform shadow-2xl rounded"
                style={{ transform: `scale(${zoomLevel})` }}
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 bg-brand-maroon/90 backdrop-blur-md border border-brand-gold/60 px-4 py-1 rounded-full text-brand-gold text-xs font-sans font-black shadow-xl pointer-events-none select-none">
                || श्री इश्वटीची माता प्रसन्न • वर्ष {selectedPhoto.year} ||
              </div>
            </div>
          </div>

          {/* Share Links Portal */}
          <div className="bg-black/60 border border-white/15 rounded-xl p-4 text-center max-w-xl mx-auto w-full space-y-2">
            <span className="text-[10px] text-gray-400 block uppercase font-mono">
              {lang === 'EN' ? 'Sacred Devotional Share' : 'पवित्र दर्शन शेअर करा'}
            </span>
            <div className="flex justify-center gap-2 text-xs font-semibold">
              <button 
                onClick={() => {
                  const shareText = `|| श्री इश्वटीची माता प्रसन्न || पावन दर्शन (${selectedPhoto.year}): ${selectedPhoto.titleMR} - ${selectedPhoto.url}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
                }}
                className="bg-green-600/30 text-green-300 border border-green-500/30 px-3 py-1.5 rounded hover:bg-green-600/50 cursor-pointer"
              >
                💬 WhatsApp
              </button>
              <button 
                onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selectedPhoto.url)}`, '_blank', 'noopener,noreferrer');
                }}
                className="bg-blue-600/30 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded hover:bg-blue-600/50 cursor-pointer"
              >
                👥 Facebook
              </button>
              <button 
                onClick={() => {
                  const tweetText = `|| श्री इश्वटीची माता प्रसन्न || ${selectedPhoto.titleMR} (${selectedPhoto.year})`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(selectedPhoto.url)}`, '_blank', 'noopener,noreferrer');
                }}
                className="bg-sky-600/30 text-sky-300 border border-sky-500/30 px-3 py-1.5 rounded hover:bg-sky-600/50 cursor-pointer"
              >
                𝕏 Twitter / X
              </button>
            </div>
          </div>

        </div>
      )}

    </section>
  );
};

export default MasonryGallery;
