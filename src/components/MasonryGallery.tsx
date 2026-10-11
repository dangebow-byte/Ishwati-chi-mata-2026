/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { GALLERY_ITEMS, OFFICIAL_INSTAGRAM_REELS, GalleryVideoReel } from '../data';
import { InstagramVideoEmbed } from './InstagramVideoEmbed';
import { 
  subscribeGalleryVideos, 
  saveGalleryVideoToFirestore, 
  updateGalleryVideoInFirestore,
  deleteGalleryVideoFromFirestore,
  DEFAULT_OFFICIAL_REEL, 
  GalleryVideoDoc 
} from '../services/galleryVideosService';
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

type MediaTypeFilter = 'all' | 'photos' | 'videos';

export const MasonryGallery: React.FC<MasonryGalleryProps> = ({ lang }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>('all');
  const [selectedItem, setSelectedItem] = useState<(typeof GALLERY_ITEMS)[0] | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [showFeaturedAltar, setShowFeaturedAltar] = useState<boolean>(true);

  // Instagram Video Reels State
  const [reels, setReels] = useState<GalleryVideoReel[]>(() => {
    try {
      const stored = localStorage.getItem('temple_gallery_custom_reels');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingUrls = new Set(OFFICIAL_INSTAGRAM_REELS.map(r => r.reelUrl));
          const customReels = parsed.filter((r: GalleryVideoReel) => !existingUrls.has(r.reelUrl));
          return [...OFFICIAL_INSTAGRAM_REELS, ...customReels];
        }
      }
    } catch {
      // Fallback
    }
    return OFFICIAL_INSTAGRAM_REELS;
  });

  const [activeReelId, setActiveReelId] = useState<string>(OFFICIAL_INSTAGRAM_REELS[0].id);
  const [copiedReelId, setCopiedReelId] = useState<string | null>(null);

  // Add Reel Modal & Form State
  const [showAddReelModal, setShowAddReelModal] = useState<boolean>(false);
  const [addForm, setAddForm] = useState({
    url: '',
    titleMR: '',
    titleEN: '',
    descriptionMR: '',
    descriptionEN: '',
    authorHandle: '@ishwatichi_mata',
    establishedYear: '१९७४'
  });

  // Edit Reel Modal & Form State
  const [editingReel, setEditingReel] = useState<GalleryVideoReel | null>(null);
  const [editForm, setEditForm] = useState({
    url: '',
    titleMR: '',
    titleEN: '',
    descriptionMR: '',
    descriptionEN: '',
    authorHandle: '@ishwatichi_mata',
    establishedYear: '१९७४'
  });

  // Delete Reel State
  const [deletingReel, setDeletingReel] = useState<GalleryVideoReel | null>(null);

  const [isSubmittingReel, setIsSubmittingReel] = useState<boolean>(false);
  const [reelError, setReelError] = useState<string>('');
  const [reelSuccessMessage, setReelSuccessMessage] = useState<string>('');

  // Subscribe to real-time updates from Firestore 'gallery_videos' collection
  useEffect(() => {
    const unsubscribe = subscribeGalleryVideos((docs) => {
      if (docs && docs.length > 0) {
        const mapped: GalleryVideoReel[] = docs.map((docItem: GalleryVideoDoc) => ({
          id: docItem.id,
          reelUrl: docItem.reelUrl,
          embedUrl: docItem.embedUrl,
          titleEN: docItem.titleEN,
          titleMR: docItem.titleMR,
          descriptionEN: docItem.descriptionEN,
          descriptionMR: docItem.descriptionMR,
          authorHandle: docItem.authorHandle || '@ishwatichi_mata',
          establishedYear: docItem.establishedYear || '१९७४'
        }));
        setReels(mapped);
        setActiveReelId((currentId) => {
          return mapped.some(m => m.id === currentId) ? currentId : mapped[0].id;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Category Configuration
  const categories = [
    { id: 'All', labelMR: 'सर्व', labelEN: 'All Media' },
    { id: 'Mata Darshan', labelMR: 'माता दर्शन', labelEN: 'Mata Darshan' },
    { id: 'Videos & Reels', labelMR: 'व्हिडिओ व रील', labelEN: 'Videos & Reels' },
    { id: 'Festivals', labelMR: 'उत्सव', labelEN: 'Festivals' },
    { id: 'Decorations', labelMR: 'मंदिर सजावट', labelEN: 'Decorations' },
    { id: 'Community Service', labelMR: 'सामाजिक सेवा', labelEN: 'Community Service' }
  ];

  // Active Featured Reel
  const activeReel = useMemo(() => {
    return reels.find(r => r.id === activeReelId) || reels[0] || DEFAULT_OFFICIAL_REEL;
  }, [reels, activeReelId]);

  // Combined Mixed Media Grid Content
  const mixedGridItems = useMemo(() => {
    type MixedGridItem = 
      | { type: 'image'; id: string; category: string; item: (typeof GALLERY_ITEMS)[0] }
      | { type: 'video'; id: string; category: string; reel: GalleryVideoReel };

    const items: MixedGridItem[] = [];

    // Filter images
    const matchingImages = GALLERY_ITEMS.filter(img => {
      if (mediaTypeFilter === 'videos') return false;
      if (activeCategory === 'All') return true;
      if (activeCategory === 'Videos & Reels') return false;
      return img.category === activeCategory;
    });

    // Filter videos
    const matchingVideos = reels.filter(() => {
      if (mediaTypeFilter === 'photos') return false;
      if (activeCategory === 'All' || activeCategory === 'Videos & Reels') return true;
      return false;
    });

    if (activeCategory === 'Videos & Reels' || mediaTypeFilter === 'videos') {
      // Videos only
      matchingVideos.forEach(v => items.push({ type: 'video', id: `video-${v.id}`, category: 'Videos & Reels', reel: v }));
    } else if (mediaTypeFilter === 'photos') {
      // Photos only
      matchingImages.forEach(img => items.push({ type: 'image', id: img.id, category: img.category, item: img }));
    } else if (activeCategory === 'All') {
      // Mixed mode: interleave images with video cards seamlessly
      let imgIdx = 0;
      let vidIdx = 0;

      // First insert 1-2 hero images, then a video card, then continue
      while (imgIdx < matchingImages.length || vidIdx < matchingVideos.length) {
        if (imgIdx < matchingImages.length) {
          items.push({ type: 'image', id: matchingImages[imgIdx].id, category: matchingImages[imgIdx].category, item: matchingImages[imgIdx] });
          imgIdx++;
        }
        if (imgIdx < matchingImages.length && (imgIdx % 2 === 0) && vidIdx < matchingVideos.length) {
          items.push({ type: 'video', id: `video-${matchingVideos[vidIdx].id}`, category: 'Videos & Reels', reel: matchingVideos[vidIdx] });
          vidIdx++;
        }
      }
      // Any remaining videos
      while (vidIdx < matchingVideos.length) {
        items.push({ type: 'video', id: `video-${matchingVideos[vidIdx].id}`, category: 'Videos & Reels', reel: matchingVideos[vidIdx] });
        vidIdx++;
      }
    } else {
      // Specific non-video category (e.g., Mata Darshan)
      matchingImages.forEach(img => items.push({ type: 'image', id: img.id, category: img.category, item: img }));
    }

    return items;
  }, [activeCategory, mediaTypeFilter, reels]);

  // Lightbox Handlers
  const handleOpenLightbox = (item: (typeof GALLERY_ITEMS)[0]) => {
    setSelectedItem(item);
    setZoomLevel(1);
    setCopied(false);
  };

  const handleNext = () => {
    if (!selectedItem) return;
    const matchingImages = GALLERY_ITEMS.filter(img => activeCategory === 'All' || img.category === activeCategory);
    const currentIndex = matchingImages.findIndex(x => x.id === selectedItem.id);
    const nextIndex = (currentIndex + 1) % matchingImages.length;
    setSelectedItem(matchingImages[nextIndex]);
    setZoomLevel(1);
    setCopied(false);
  };

  const handlePrev = () => {
    if (!selectedItem) return;
    const matchingImages = GALLERY_ITEMS.filter(img => activeCategory === 'All' || img.category === activeCategory);
    const currentIndex = matchingImages.findIndex(x => x.id === selectedItem.id);
    const prevIndex = (currentIndex - 1 + matchingImages.length) % matchingImages.length;
    setSelectedItem(matchingImages[prevIndex]);
    setZoomLevel(1);
    setCopied(false);
  };

  const handleCopyLink = () => {
    if (!selectedItem?.url) return;
    navigator.clipboard.writeText(selectedItem.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyReelLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedReelId(id);
    setTimeout(() => setCopiedReelId(null), 2500);
  };

  const handleShareReelWhatsApp = (reel: GalleryVideoReel) => {
    const text = lang === 'EN' 
      ? `Jai Mata Di! Watch the official Shree Ishwatichi Mata video reel (${reel.authorHandle}): ${reel.reelUrl}`
      : `|| श्री इश्वटीची माता प्रसन्न || मंडळाचा अधिकृत नवरात्रौत्सव व्हिडिओ रील नक्की पहा (${reel.authorHandle}): ${reel.reelUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  // Open Edit Modal with selected reel details
  const handleOpenEdit = (reel: GalleryVideoReel) => {
    setEditingReel(reel);
    setEditForm({
      url: reel.reelUrl,
      titleMR: reel.titleMR,
      titleEN: reel.titleEN,
      descriptionMR: reel.descriptionMR,
      descriptionEN: reel.descriptionEN,
      authorHandle: reel.authorHandle || '@ishwatichi_mata',
      establishedYear: reel.establishedYear || '१९७४'
    });
    setReelError('');
    setReelSuccessMessage('');
  };

  // Open Delete Confirmation
  const handleOpenDelete = (reel: GalleryVideoReel) => {
    setDeletingReel(reel);
    setReelError('');
    setReelSuccessMessage('');
  };

  // Submit Add Reel to Firestore
  const handleAddCustomReel = async (e: React.FormEvent) => {
    e.preventDefault();
    setReelError('');
    setReelSuccessMessage('');

    const cleanInput = addForm.url.trim();
    if (!cleanInput) {
      setReelError(lang === 'EN' ? 'Please enter an Instagram reel URL.' : 'कृपया इंस्टाग्राम रील लिंक प्रविष्ट करा.');
      return;
    }

    try {
      setIsSubmittingReel(true);

      const savedDoc = await saveGalleryVideoToFirestore({
        url: cleanInput,
        titleMR: addForm.titleMR.trim() || 'श्री ईश्वटीची माता पावन दर्शन व्हिडिओ',
        titleEN: addForm.titleEN.trim() || 'Shree Ishwatichi Mata Devotional Video Reel',
        descriptionMR: addForm.descriptionMR.trim() || 'मंडळाचा अधिकृत व्हिडिओ रील गॅलरीमध्ये समाविष्ट करण्यात आला आहे.',
        descriptionEN: addForm.descriptionEN.trim() || 'Official devotional video published to the sacred gallery.',
        authorHandle: addForm.authorHandle.trim() || '@ishwatichi_mata',
        establishedYear: addForm.establishedYear.trim() || '१९७४'
      });

      const newReel: GalleryVideoReel = {
        id: savedDoc.id,
        reelUrl: savedDoc.reelUrl,
        embedUrl: savedDoc.embedUrl,
        titleEN: savedDoc.titleEN,
        titleMR: savedDoc.titleMR,
        descriptionEN: savedDoc.descriptionEN,
        descriptionMR: savedDoc.descriptionMR,
        authorHandle: savedDoc.authorHandle,
        establishedYear: savedDoc.establishedYear,
        date: new Date().toLocaleDateString()
      };

      setReels(prev => [newReel, ...prev.filter(r => r.id !== newReel.id)]);
      setActiveReelId(newReel.id);

      try {
        localStorage.setItem('temple_gallery_custom_reels', JSON.stringify([newReel, ...reels.filter(r => r.id !== DEFAULT_OFFICIAL_REEL.id)]));
      } catch {
        // Ignore storage error
      }

      setAddForm({
        url: '',
        titleMR: '',
        titleEN: '',
        descriptionMR: '',
        descriptionEN: '',
        authorHandle: '@ishwatichi_mata',
        establishedYear: '१९७४'
      });
      setReelSuccessMessage(lang === 'EN' ? 'Video added successfully to gallery!' : 'व्हिडिओ गॅलरीमध्ये यशस्वीरित्या समाविष्ट करण्यात आला!');
      setTimeout(() => {
        setShowAddReelModal(false);
        setReelSuccessMessage('');
      }, 1500);
    } catch (err: any) {
      setReelError(err.message || (lang === 'EN' ? 'Failed to save video. Please check URL.' : 'व्हिडिओ जतन करता आला नाही. कृपया लिंक तपासा.'));
    } finally {
      setIsSubmittingReel(false);
    }
  };

  // Submit Edit Reel to Firestore
  const handleSaveEditReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReel) return;
    setReelError('');
    setReelSuccessMessage('');

    try {
      setIsSubmittingReel(true);
      await updateGalleryVideoInFirestore(editingReel.id, {
        reelUrl: editForm.url.trim(),
        titleMR: editForm.titleMR.trim(),
        titleEN: editForm.titleEN.trim(),
        descriptionMR: editForm.descriptionMR.trim(),
        descriptionEN: editForm.descriptionEN.trim(),
        authorHandle: editForm.authorHandle.trim(),
        establishedYear: editForm.establishedYear.trim()
      });

      setReels(prev => prev.map(r => {
        if (r.id === editingReel.id) {
          const shortcodeMatch = editForm.url.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/i);
          const sc = shortcodeMatch ? shortcodeMatch[1] : '';
          return {
            ...r,
            reelUrl: sc ? `https://www.instagram.com/reel/${sc}/` : editForm.url,
            embedUrl: sc ? `https://www.instagram.com/reel/${sc}/embed` : r.embedUrl,
            titleMR: editForm.titleMR.trim() || r.titleMR,
            titleEN: editForm.titleEN.trim() || r.titleEN,
            descriptionMR: editForm.descriptionMR.trim() || r.descriptionMR,
            descriptionEN: editForm.descriptionEN.trim() || r.descriptionEN,
            authorHandle: editForm.authorHandle.trim() || r.authorHandle,
            establishedYear: editForm.establishedYear.trim() || r.establishedYear
          };
        }
        return r;
      }));

      setReelSuccessMessage(lang === 'EN' ? 'Video details updated successfully!' : 'व्हिडिओ माहिती यशस्वीरित्या अद्यतनित झाली!');
      setTimeout(() => {
        setEditingReel(null);
        setReelSuccessMessage('');
      }, 1400);
    } catch (err: any) {
      setReelError(err.message || (lang === 'EN' ? 'Failed to update video.' : 'व्हिडिओ अद्यतनित करता आला नाही.'));
    } finally {
      setIsSubmittingReel(false);
    }
  };

  // Confirm Delete Reel from Firestore
  const handleConfirmDelete = async () => {
    if (!deletingReel) return;
    setReelError('');
    setReelSuccessMessage('');

    if (deletingReel.id === DEFAULT_OFFICIAL_REEL.id) {
      setReelError(lang === 'EN' ? 'Official Mandal reel (Est. 1974) is protected and cannot be deleted.' : 'मंडळाचा अधिकृत रील (स्थापना १९७४) संरक्षित असून तो हटवता येत नाही.');
      return;
    }

    try {
      setIsSubmittingReel(true);
      await deleteGalleryVideoFromFirestore(deletingReel.id);

      const remaining = reels.filter(r => r.id !== deletingReel.id);
      setReels(remaining.length > 0 ? remaining : [DEFAULT_OFFICIAL_REEL]);
      setActiveReelId(remaining.length > 0 ? remaining[0].id : DEFAULT_OFFICIAL_REEL.id);

      try {
        localStorage.setItem('temple_gallery_custom_reels', JSON.stringify(remaining.filter(r => r.id !== DEFAULT_OFFICIAL_REEL.id)));
      } catch {}

      setReelSuccessMessage(lang === 'EN' ? 'Video deleted successfully from gallery.' : 'व्हिडिओ गॅलरीमधून यशस्वीरित्या काढण्यात आला.');
      setTimeout(() => {
        setDeletingReel(null);
        setReelSuccessMessage('');
      }, 1400);
    } catch (err: any) {
      setReelError(err.message || (lang === 'EN' ? 'Failed to delete video.' : 'व्हिडिओ काढता आला नाही.'));
    } finally {
      setIsSubmittingReel(false);
    }
  };

  return (
    <section className="bg-brand-maroon/20 rounded-2xl border border-brand-gold/20 p-5 sm:p-7 md:p-8 text-white backdrop-blur-sm shadow-2xl space-y-8">
      
      {/* ========================================================================= */}
      {/* 1. GALLERY HEADER, FILTER CONTROLS & ADD REEL BUTTON                      */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-5 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-brand-gold text-xs font-mono font-bold uppercase tracking-wider">
              🖼️ Sacred Visual & Video Treasury • स्थापना १९७४
            </span>
            <span className="bg-brand-gold/15 text-brand-gold text-[10px] font-mono px-2 py-0.5 rounded-full border border-brand-gold/30">
              ५३ वे वर्ष
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-black text-white">
            {lang === 'EN' ? 'Shree Ishwatichi Mata Grand Gallery & Reels' : 'श्री इश्वटीची माता भव्य छायाचित्र व व्हिडिओ दालन'}
          </h2>

          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-3xl leading-relaxed">
            {lang === 'EN' 
              ? 'Immerse in authentic sacred darshans, royal sanctum altars, festive celebrations, and playable high-definition official Instagram video reels.' 
              : 'देवींचे मूळ सुवर्ण रूप, गर्भगृह राजसिंहासन, उत्सव मिरवणुका आणि अधिकृत इन्स्टाग्राम व्हिडिओ रीलचे एकात्मिक दर्शन.'}
          </p>
        </div>

        {/* Action Toolbar: Add Reel + Toggle Featured Altar */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0 flex-wrap">
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

          <button
            onClick={() => setShowAddReelModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/90 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-brand-maroon px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg hover:shadow-brand-gold/30 border border-brand-gold"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{lang === 'EN' ? 'Add Instagram Reel' : 'नवीन रील जोडा'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MEDIA TYPE SWITCHER & CATEGORY FILTER BAR                              */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-black/40 p-2.5 rounded-xl border border-white/10">
        
        {/* Media Type Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-white/5">
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
            onClick={() => { setMediaTypeFilter('videos'); setActiveCategory('Videos & Reels'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              mediaTypeFilter === 'videos' || activeCategory === 'Videos & Reels'
                ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow font-black'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Instagram className="h-3.5 w-3.5 text-pink-300" />
            <span>{lang === 'EN' ? 'Reels & Videos' : 'व्हिडिओ व रील'}</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-brand-gold font-mono">
              {reels.length}
            </span>
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
                } else if (mediaTypeFilter === 'videos') {
                  setMediaTypeFilter('all');
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
      {/* 3. FEATURED INSTAGRAM REEL ALTAR (EXPANDABLE SACRED SHOWCASE)             */}
      {/* ========================================================================= */}
      {showFeaturedAltar && reels.length > 0 && (
        <div className="bg-gradient-to-b from-[#2E0202]/90 via-black/85 to-[#1E0101]/95 border-2 border-brand-gold/45 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-5">
          
          {/* Altar Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-gold/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-yellow-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow">
                <Play className="h-4 w-4 fill-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-sans font-black text-brand-gold">
                  {lang === 'EN' ? 'Featured Devotional Instagram Reel Altar' : 'विशेष पावन इन्स्टाग्राम रील महादर्शन'}
                </h3>
                <span className="text-[10px] text-gray-300 font-mono">
                  {activeReel.authorHandle} • स्थापना १९७४
                </span>
              </div>
            </div>

            {/* Reel Selector Pill Ribbon */}
            {reels.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin py-0.5">
                {reels.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setActiveReelId(r.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1 ${
                      activeReelId === r.id
                        ? 'bg-brand-red text-white border-brand-gold shadow'
                        : 'bg-black/50 text-gray-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <Film className="h-3 w-3 text-brand-gold" />
                    <span className="truncate max-w-[120px] sm:max-w-[150px]">
                      {lang === 'EN' ? r.titleEN : r.titleMR}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Two-Column Responsive Interactive Player Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Column: Responsive Playable Instagram Embed */}
            <div className="lg:col-span-5 xl:col-span-5 flex justify-center w-full">
              <InstagramVideoEmbed
                url={activeReel.reelUrl}
                title={lang === 'EN' ? activeReel.titleEN : activeReel.titleMR}
                caption={lang === 'EN' ? activeReel.descriptionEN : activeReel.descriptionMR}
                authorHandle={activeReel.authorHandle}
                establishedYear={activeReel.establishedYear}
                lang={lang}
                date={activeReel.date}
                className="w-full max-w-[380px] sm:max-w-[420px]"
              />
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
                        {activeReel.authorHandle}
                      </span>
                      <span className="text-sky-400 text-xs" title="Verified Mandal">✓</span>
                    </div>
                    <span className="text-[11px] text-brand-gold font-mono block">
                      श्री यंग ईश्वटी नवरात्रौत्सव मंडळ (स्थापना: {activeReel.establishedYear})
                    </span>
                  </div>
                </div>

                <a
                  href="https://www.instagram.com/ishwatichi_mata/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/20 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Instagram className="h-3.5 w-3.5 text-pink-400" />
                  <span>{lang === 'EN' ? 'Follow' : 'फॉलो करा'}</span>
                </a>
              </div>

              {/* Title & Description Details */}
              <div className="space-y-2 bg-black/40 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="bg-brand-red/80 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-brand-gold/30">
                    {activeReel.id === DEFAULT_OFFICIAL_REEL.id ? (lang === 'EN' ? 'OFFICIAL MANDAL REEL' : 'मंडळाचा अधिकृत रील') : (lang === 'EN' ? 'DEVOTIONAL REEL' : 'भक्तिमय रील')}
                  </span>
                  
                  {/* Inline Edit & Delete triggers */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(activeReel)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-brand-gold text-[10px] font-bold border border-brand-gold/30 cursor-pointer transition-all"
                      title={lang === 'EN' ? 'Edit Reel Details' : 'रील संपादन करा'}
                    >
                      <Pencil className="h-3 w-3" />
                      <span>{lang === 'EN' ? 'Edit' : 'संपादित करा'}</span>
                    </button>
                    {activeReel.id !== DEFAULT_OFFICIAL_REEL.id && (
                      <button
                        onClick={() => handleOpenDelete(activeReel)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-[10px] font-bold border border-red-500/30 cursor-pointer transition-all"
                        title={lang === 'EN' ? 'Delete Reel' : 'काढून टाका'}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>{lang === 'EN' ? 'Delete' : 'काढून टाका'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <h4 className="text-base sm:text-lg font-sans font-black text-white leading-snug">
                  {lang === 'EN' ? activeReel.titleEN : activeReel.titleMR}
                </h4>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {lang === 'EN' ? activeReel.descriptionEN : activeReel.descriptionMR}
                </p>
              </div>

              {/* Devotee Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <a
                  href={activeReel.reelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-700 via-rose-600 to-amber-600 text-white font-bold text-xs shadow hover:brightness-110 transition-all cursor-pointer text-center"
                >
                  <Instagram className="h-3.5 w-3.5" />
                  <span>{lang === 'EN' ? 'Watch on Instagram' : 'थेट इन्स्टाग्रामवर पहा'}</span>
                  <ExternalLink className="h-3 w-3 opacity-80" />
                </a>

                <button
                  onClick={() => handleCopyReelLink(activeReel.reelUrl, activeReel.id)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-black/60 hover:bg-black/90 text-brand-gold border border-brand-gold/40 font-bold text-xs transition-all cursor-pointer"
                >
                  {copiedReelId === activeReel.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-400" />
                      <span className="text-green-300">{lang === 'EN' ? 'Copied!' : 'कॉपी झाले!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>{lang === 'EN' ? 'Copy Link' : 'लिंक कॉपी करा'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleShareReelWhatsApp(activeReel)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-green-700/80 hover:bg-green-600 text-white font-bold text-xs transition-all cursor-pointer shadow"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>{lang === 'EN' ? 'Share on WhatsApp' : 'व्हाट्सॲपवर शेअर करा'}</span>
                </button>
              </div>

              {/* Audio Controls Guidance */}
              <div className="bg-brand-gold/10 border border-brand-gold/25 rounded-xl p-3 text-[11px] text-brand-gold/90 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-brand-gold shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-white">
                    {lang === 'EN' ? 'Devotional Audio Playback Tip:' : 'व्हिडिओ व ऑडिओ नियंत्रण माहिती:'}
                  </p>
                  <p className="text-gray-300 leading-normal">
                    {lang === 'EN'
                      ? 'Reels play interactively inside the frame. Tap the video to start, then click the speaker icon in the player to unmute full devotional music.'
                      : 'व्हिडिओ सुरू करण्यासाठी प्ले करा आणि महाआरती व भक्तिसंगीताचा आनंद घेण्यासाठी व्हिडिओमधील स्पीकर चिन्हावर क्लिक करा.'}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RESPONSIVE GRID LAYOUT FOR MIXED HIGH-RES IMAGES & VIDEO CONTENT       */}
      {/* Specifically designed for mixed media with equal proportions & no cutoff */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-brand-gold uppercase tracking-wider">
              {lang === 'EN' ? 'Gallery Showcase Grid' : 'पावन प्रदर्शन दालन'}
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              ({mixedGridItems.length} {lang === 'EN' ? 'items' : 'साहित्य'})
            </span>
          </div>

          <div className="text-[11px] text-gray-400 hidden sm:block font-mono">
            {lang === 'EN' ? 'Tap images for HD zoom • Tap reels to play' : 'मोठ्या दर्शनासाठी चित्रावर क्लिक करा • रील प्ले करा'}
          </div>
        </div>

        {/* The Core Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {mixedGridItems.map((gridItem) => {
            if (gridItem.type === 'image') {
              const item = gridItem.item;
              return (
                <div
                  key={gridItem.id}
                  onClick={() => handleOpenLightbox(item)}
                  className="flex flex-col rounded-2xl overflow-hidden border border-brand-gold/30 bg-gradient-to-b from-brand-maroon/20 via-black/60 to-black/90 shadow-xl hover:shadow-2xl hover:border-brand-gold/80 transition-all duration-300 group cursor-pointer"
                >
                  {/* Photo / Banner Container with responsive aspect ratio preserving full graphics */}
                  <div className={`relative w-full overflow-hidden bg-black/90 flex items-center justify-center ${
                    item.id === 'gal-agaman-banner-2026' ? 'aspect-[16/10] sm:aspect-[16/9]' : 'aspect-[4/5]'
                  }`}>
                    <img
                      src={item.url}
                      alt={item.title}
                      className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${
                        item.id === 'gal-agaman-banner-2026' ? 'object-contain object-center' : 'object-cover object-center'
                      }`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />

                    {/* Sacred Emblem Corner Badge */}
                    <div className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur-md border border-brand-gold/60 text-brand-gold text-[10px] font-sans font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 pointer-events-none">
                      <span>🌸</span>
                      <span>श्री इश्वटीची • १९७४</span>
                    </div>

                    {/* Category Pill Tag */}
                    <div className="absolute top-3 right-3 z-10 bg-brand-maroon/90 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shadow">
                      {item.category}
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

                  {/* Image Card Bottom Meta Banner */}
                  <div className="p-3.5 text-left border-t border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span>{item.category}</span>
                      <span className="text-brand-gold font-bold">स्थापना १९७४</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-sans font-black text-white group-hover:text-brand-gold transition-colors line-clamp-2">
                      {lang === 'EN' ? item.title : item.titleMarathi}
                    </h4>
                  </div>
                </div>
              );
            }

            // Video Reel Grid Item (Properly sized and interactive)
            const reel = gridItem.reel;
            return (
              <div
                key={gridItem.id}
                className="w-full max-w-[420px] mx-auto flex flex-col rounded-2xl bg-zinc-950/95 border-2 border-brand-gold/45 shadow-2xl overflow-hidden hover:border-brand-gold transition-all duration-300"
              >
                {/* Video Card Top Header with Management Triggers */}
                <div className="bg-gradient-to-r from-purple-950/80 via-brand-maroon/70 to-black/90 p-3 border-b border-brand-gold/25 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-full shadow">
                      🎬 REEL
                    </span>
                    <span className="text-[11px] font-bold text-white truncate max-w-[140px]">
                      {reel.authorHandle}
                    </span>
                  </div>

                  {/* Inline Edit & Delete triggers directly on video card */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(reel)}
                      className="p-1.5 hover:bg-white/15 rounded-lg text-brand-gold transition-all cursor-pointer"
                      title={lang === 'EN' ? 'Edit Reel' : 'रील संपादन करा'}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {reel.id !== DEFAULT_OFFICIAL_REEL.id && (
                      <button
                        onClick={() => handleOpenDelete(reel)}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-300 transition-all cursor-pointer"
                        title={lang === 'EN' ? 'Delete Reel' : 'काढून टाका'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* The Responsive, Interactive Instagram Player Embed */}
                <InstagramVideoEmbed
                  url={reel.reelUrl}
                  title={lang === 'EN' ? reel.titleEN : reel.titleMR}
                  caption={lang === 'EN' ? reel.descriptionEN : reel.descriptionMR}
                  authorHandle={reel.authorHandle}
                  establishedYear={reel.establishedYear}
                  date={reel.date}
                  lang={lang}
                  className="border-0 rounded-none shadow-none"
                />

                {/* Devotee Quick Action Footer on Card */}
                <div className="p-2.5 bg-black/90 border-t border-brand-gold/20 flex items-center justify-between gap-2 text-[11px]">
                  <button
                    onClick={() => { setActiveReelId(reel.id); setShowFeaturedAltar(true); }}
                    className="flex items-center gap-1 text-brand-gold hover:text-yellow-300 font-bold cursor-pointer"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>{lang === 'EN' ? 'Focus in Altar' : 'मंचावर पहा'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyReelLink(reel.reelUrl, reel.id)}
                      className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white cursor-pointer"
                      title={lang === 'EN' ? 'Copy Link' : 'लिंक कॉपी करा'}
                    >
                      {copiedReelId === reel.id ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>

                    <button
                      onClick={() => handleShareReelWhatsApp(reel)}
                      className="p-1.5 hover:bg-green-600/20 rounded text-green-400 cursor-pointer"
                      title={lang === 'EN' ? 'Share WhatsApp' : 'व्हाट्सॲप'}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {mixedGridItems.length === 0 && (
          <div className="text-center py-16 bg-black/40 rounded-2xl border border-white/10 space-y-3">
            <span className="text-4xl">🕉️</span>
            <h4 className="text-lg font-bold text-brand-gold">
              {lang === 'EN' ? 'No items found in this category' : 'या श्रेणीत कोणतेही साहित्य उपलब्ध नाही'}
            </h4>
            <p className="text-xs text-gray-400">
              {lang === 'EN' ? 'Please select another category or tab.' : 'कृपया इतर श्रेणी निवडा किंवा नवीन रील जोडा.'}
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. ADD INSTAGRAM REEL MODAL                                               */}
      {/* ========================================================================= */}
      {showAddReelModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <form 
            onSubmit={handleAddCustomReel}
            className="bg-zinc-950 border-2 border-brand-gold/60 rounded-2xl p-5 sm:p-6 w-full max-w-xl space-y-4 shadow-2xl text-xs text-left"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-brand-gold font-bold text-sm">
                <Instagram className="h-4 w-4 text-rose-400" />
                <span>{lang === 'EN' ? 'Add Instagram Video Reel to Gallery' : 'गॅलरीमध्ये नवीन इंस्टाग्राम रील जोडा'}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddReelModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {lang === 'EN' ? 'Instagram Reel / Post URL *' : 'इन्स्टाग्राम रील किंवा पोस्ट लिंक *'}
                </label>
                <input
                  type="url"
                  placeholder="https://www.instagram.com/reel/Cx0sn8AoN7l/..."
                  value={addForm.url}
                  onChange={(e) => setAddForm(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold font-mono text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {lang === 'EN' ? 'Video Title (Marathi) *' : 'व्हिडिओ शीर्षक (मराठी) *'}
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. श्री ईश्वटीची माता पावन दर्शन व्हिडिओ"
                    value={addForm.titleMR}
                    onChange={(e) => setAddForm(prev => ({ ...prev, titleMR: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {lang === 'EN' ? 'Video Title (English)' : 'व्हिडिओ शीर्षक (इंग्रजी)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shree Ishwatichi Mata Devotional Reel"
                    value={addForm.titleEN}
                    onChange={(e) => setAddForm(prev => ({ ...prev, titleEN: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {lang === 'EN' ? 'Description (Marathi)' : 'माहिती / कॅप्शन (मराठी)'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="उदा. नवरात्र उत्सवातील भक्तिमय क्षण आणि आरती दर्शन."
                    value={addForm.descriptionMR}
                    onChange={(e) => setAddForm(prev => ({ ...prev, descriptionMR: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {lang === 'EN' ? 'Description (English)' : 'माहिती / कॅप्शन (इंग्रजी)'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Divine darshan and festival celebration reel."
                    value={addForm.descriptionEN}
                    onChange={(e) => setAddForm(prev => ({ ...prev, descriptionEN: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {lang === 'EN' ? 'Author Handle' : 'इन्स्टाग्राम हँडल'}
                  </label>
                  <input
                    type="text"
                    placeholder="@ishwatichi_mata"
                    value={addForm.authorHandle}
                    onChange={(e) => setAddForm(prev => ({ ...prev, authorHandle: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {lang === 'EN' ? 'Mandal Established Year' : 'स्थापना वर्ष'}
                  </label>
                  <input
                    type="text"
                    placeholder="१९७४"
                    value={addForm.establishedYear}
                    onChange={(e) => setAddForm(prev => ({ ...prev, establishedYear: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>
            </div>

            {reelError && (
              <p className="text-red-400 font-medium text-[11px] bg-red-950/40 p-2 rounded border border-red-500/30">{reelError}</p>
            )}

            {reelSuccessMessage && (
              <p className="text-green-400 font-medium text-[11px] flex items-center gap-1.5 bg-green-950/40 p-2 rounded border border-green-500/30">
                <Check className="h-3.5 w-3.5" />
                <span>{reelSuccessMessage}</span>
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddReelModal(false)}
                disabled={isSubmittingReel}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 cursor-pointer disabled:opacity-50"
              >
                {lang === 'EN' ? 'Cancel' : 'रद्द करा'}
              </button>
              <button
                type="submit"
                disabled={isSubmittingReel}
                className="px-5 py-2 rounded-lg bg-brand-gold text-brand-maroon font-bold hover:bg-yellow-400 cursor-pointer shadow disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmittingReel ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{lang === 'EN' ? 'Saving...' : 'जतन होत आहे...'}</span>
                  </>
                ) : (
                  <span>{lang === 'EN' ? 'Save & Embed Reel' : 'व्हिडिओ जोडा व जतन करा'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. EDIT INSTAGRAM REEL MODAL                                              */}
      {/* ========================================================================= */}
      {editingReel && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <form 
            onSubmit={handleSaveEditReel}
            className="bg-zinc-950 border-2 border-brand-gold/60 rounded-2xl p-5 sm:p-6 w-full max-w-xl space-y-4 shadow-2xl text-xs text-left"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-brand-gold font-bold text-sm">
                <Pencil className="h-4 w-4 text-brand-gold" />
                <span>{lang === 'EN' ? 'Edit Video Reel Details' : 'व्हिडिओ रील माहिती संपादन करा'}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingReel(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {lang === 'EN' ? 'Instagram Reel URL *' : 'इन्स्टाग्राम रील लिंक *'}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {lang === 'EN' ? 'Description (Marathi)' : 'माहिती / कॅप्शन (मराठी)'}
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
                    {lang === 'EN' ? 'Description (English)' : 'माहिती / कॅप्शन (इंग्रजी)'}
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.descriptionEN}
                    onChange={(e) => setEditForm(prev => ({ ...prev, descriptionEN: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {lang === 'EN' ? 'Author Handle' : 'हँडल'}
                  </label>
                  <input
                    type="text"
                    value={editForm.authorHandle}
                    onChange={(e) => setEditForm(prev => ({ ...prev, authorHandle: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {lang === 'EN' ? 'Established Year' : 'स्थापना वर्ष'}
                  </label>
                  <input
                    type="text"
                    value={editForm.establishedYear}
                    onChange={(e) => setEditForm(prev => ({ ...prev, establishedYear: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>
            </div>

            {reelError && (
              <p className="text-red-400 font-medium text-[11px] bg-red-950/40 p-2 rounded border border-red-500/30">{reelError}</p>
            )}

            {reelSuccessMessage && (
              <p className="text-green-400 font-medium text-[11px] flex items-center gap-1.5 bg-green-950/40 p-2 rounded border border-green-500/30">
                <Check className="h-3.5 w-3.5" />
                <span>{reelSuccessMessage}</span>
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingReel(null)}
                disabled={isSubmittingReel}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 cursor-pointer disabled:opacity-50"
              >
                {lang === 'EN' ? 'Cancel' : 'रद्द करा'}
              </button>
              <button
                type="submit"
                disabled={isSubmittingReel}
                className="px-5 py-2 rounded-lg bg-brand-gold text-brand-maroon font-bold hover:bg-yellow-400 cursor-pointer shadow disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmittingReel ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{lang === 'EN' ? 'Updating...' : 'अद्यतनित होत आहे...'}</span>
                  </>
                ) : (
                  <span>{lang === 'EN' ? 'Save Changes' : 'बदल जतन करा'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. DELETE CONFIRMATION MODAL                                              */}
      {/* ========================================================================= */}
      {deletingReel && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-950 border-2 border-red-500/40 rounded-2xl p-5 sm:p-6 w-full max-w-md space-y-4 shadow-2xl text-left">
            <div className="flex items-center gap-3 text-red-400">
              <div className="h-10 w-10 rounded-full bg-red-950/80 border border-red-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">
                  {lang === 'EN' ? 'Delete Video Reel?' : 'व्हिडिओ रील काढून टाकायचा आहे का?'}
                </h3>
                <span className="text-[11px] text-gray-400 font-mono">
                  {deletingReel.authorHandle}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {lang === 'EN' 
                ? `Are you sure you want to delete "${deletingReel.titleEN || deletingReel.titleMR}"? This action will remove the reel from the gallery and database.`
                : `आपणास खात्री आहे का की "${deletingReel.titleMR || deletingReel.titleEN}" हा व्हिडिओ गॅलरी आणि डेटाबेसमधून कायमचा काढून टाकायचा आहे?`}
            </p>

            {reelError && (
              <p className="text-red-400 font-medium text-[11px] bg-red-950/40 p-2 rounded border border-red-500/30">{reelError}</p>
            )}

            {reelSuccessMessage && (
              <p className="text-green-400 font-medium text-[11px] flex items-center gap-1.5 bg-green-950/40 p-2 rounded border border-green-500/30">
                <Check className="h-3.5 w-3.5" />
                <span>{reelSuccessMessage}</span>
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeletingReel(null)}
                disabled={isSubmittingReel}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 cursor-pointer text-xs"
              >
                {lang === 'EN' ? 'Close' : 'बंद करा'}
              </button>
              {deletingReel.id !== DEFAULT_OFFICIAL_REEL.id && (
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isSubmittingReel}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer shadow disabled:opacity-50 flex items-center gap-1.5 text-xs"
                >
                  {isSubmittingReel ? (
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. HIGH-RES PHOTO LIGHTBOX MODAL                                          */}
      {/* ========================================================================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 md:p-6 md:pb-12 text-white animate-fade-in font-sans">
          
          {/* Lightbox Toolbar Top */}
          <div className="flex justify-between items-center bg-black/60 px-4 py-3 rounded-xl border border-white/10">
            <div className="text-left">
              <span className="text-[10px] text-brand-saffron uppercase font-mono font-bold block">
                {selectedItem.category} • स्थापना १९७४
              </span>
              <h3 className="text-sm md:text-base font-sans font-semibold truncate max-w-xs sm:max-w-md">
                {lang === 'EN' ? selectedItem.title : selectedItem.titleMarathi}
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
                onClick={handleCopyLink}
                className="p-2 hover:bg-white/10 rounded-lg text-brand-saffron ml-2 cursor-pointer flex items-center gap-1.5"
                title="Copy Image URL directly"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">{copied ? (lang === 'EN' ? 'Copied URL!' : 'कॉपी झाले!') : (lang === 'EN' ? 'Share' : 'शेअर करा')}</span>
              </button>

              <button 
                onClick={() => setSelectedItem(null)}
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
              onClick={handlePrev}
              className="absolute left-2 md:left-6 z-20 p-3 h-12 w-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6 text-brand-gold" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-2 md:right-6 z-20 p-3 h-12 w-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6 text-brand-gold" />
            </button>

            <div className="relative max-w-[85vw] max-h-[60vh] md:max-h-[70vh] flex items-center justify-center transition-all duration-300 ease-out overflow-auto rounded-lg">
              <img 
                src={selectedItem.url} 
                alt={selectedItem.title} 
                className="object-contain max-w-full max-h-[60vh] md:max-h-[70vh] transition-transform shadow-2xl rounded"
                style={{ transform: `scale(${zoomLevel})` }}
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 bg-brand-maroon/90 backdrop-blur-md border border-brand-gold/60 px-4 py-1 rounded-full text-brand-gold text-xs font-sans font-black shadow-xl pointer-events-none select-none">
                || श्री इश्वटीची माता प्रसन्न (स्थापना १९७४) ||
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
                  const shareText = `|| श्री इश्वटीची माता प्रसन्न || पावन दर्शन: ${selectedItem.titleMarathi} - ${selectedItem.url}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
                }}
                className="bg-green-600/30 text-green-300 border border-green-500/30 px-3 py-1.5 rounded hover:bg-green-600/50 cursor-pointer"
              >
                💬 WhatsApp
              </button>
              <button 
                onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selectedItem.url)}`, '_blank', 'noopener,noreferrer');
                }}
                className="bg-blue-600/30 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded hover:bg-blue-600/50 cursor-pointer"
              >
                👥 Facebook
              </button>
              <button 
                onClick={() => {
                  const tweetText = `|| श्री इश्वटीची माता प्रसन्न || ${selectedItem.titleMarathi}`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(selectedItem.url)}`, '_blank', 'noopener,noreferrer');
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
