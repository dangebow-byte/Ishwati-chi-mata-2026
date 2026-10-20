/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { InstagramVideoEmbed, extractInstagramShortcode, getInstagramEmbedUrl } from './InstagramVideoEmbed';
import { 
  subscribeGalleryMedia, 
  addGalleryMedia, 
  updateGalleryMedia, 
  deleteGalleryMedia, 
  reorderGalleryMedia,
  applyReorderToMasterList,
  GalleryMediaItem, 
  GalleryMediaType,
  getCachedGalleryMedia,
  setCachedGalleryMedia
} from '../services/galleryMediaService';
import { shareToWhatsApp } from '../utils/shareUtils';
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
  Image as ImageIcon,
  Upload,
  HardDrive,
  Globe,
  GripVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { compressAndReadImageFile, formatFileSize } from '../services/localMediaStorage';
import { deleteCloudMediaObject, uploadMediaToCloudStorage } from '../services/cloudMediaStorage';
import { AmbientVideoPlayer, pauseAllOtherMedia } from './AmbientVideoPlayer';

interface MasonryGalleryProps {
  lang: 'EN' | 'MR';
  canManageMedia: boolean;
  signedInEmail: string | null;
  authMessage: string | null;
}

type MediaTypeFilter = 'all' | 'photos' | 'videos' | 'instagram';

function getYouTubeEmbedUrl(rawUrl: string): string | undefined {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();
    let videoId = '';
    if (host === 'youtu.be') videoId = parsed.pathname.split('/').filter(Boolean)[0] || '';
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
      videoId = parsed.searchParams.get('v') || parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] || '';
    } else return undefined;
    return /^[A-Za-z0-9_-]{11}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
      : undefined;
  } catch {
    return undefined;
  }
}

function isYoutubeUrl(rawUrl: string): boolean {
  try {
    return ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com', 'youtu.be']
      .includes(new URL(rawUrl).hostname.toLowerCase());
  } catch {
    return false;
  }
}

export const MasonryGallery: React.FC<MasonryGalleryProps> = ({ lang, canManageMedia, signedInEmail, authMessage }) => {
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

  // Drag-and-Drop Reordering States (All Sections & Filters)
  const [isReorderMode, setIsReorderMode] = useState<boolean>(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState<boolean>(false);
  const [saveOrderSuccess, setSaveOrderSuccess] = useState<boolean>(false);
  const [originalOrderSnapshot, setOriginalOrderSnapshot] = useState<GalleryMediaItem[] | null>(null);

  // Dedicated Instagram Reel Lightbox Modal State
  const [selectedReel, setSelectedReel] = useState<GalleryMediaItem | null>(null);

  // Progressive Lazy Loading State (12 items per batch for clean 3-col rows)
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const ITEMS_PER_BATCH = 12;

  useEffect(() => {
    if (!canManageMedia) setIsReorderMode(false);
  }, [canManageMedia]);

  // Requirement 4: When any video or reel plays, stop all other videos and reels across the gallery
  useEffect(() => {
    const handleGlobalMediaPlay = (e: Event) => {
      const activeEl = e.target as HTMLMediaElement;
      if (!activeEl || !(activeEl instanceof HTMLMediaElement)) return;
      if (activeEl.classList?.contains('ambient-backdrop-video')) return;
      pauseAllOtherMedia(activeEl);
    };

    window.addEventListener('play', handleGlobalMediaPlay, true);
    return () => {
      window.removeEventListener('play', handleGlobalMediaPlay, true);
    };
  }, []);

  // Add Media Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addForm, setAddForm] = useState<{
    type: GalleryMediaType;
    url: string;
    localVideoId?: string | null;
    storagePath?: string | null;
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
    localVideoId?: string | null;
    storagePath?: string | null;
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

  // Device Upload States
  const [addUploadSource, setAddUploadSource] = useState<'device' | 'url'>('device');
  const [editUploadSource, setEditUploadSource] = useState<'device' | 'url'>('url');
  const [isProcessingMediaFile, setIsProcessingMediaFile] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedMediaFileName, setUploadedMediaFileName] = useState<string>('');
  const [uploadedMediaFileSize, setUploadedMediaFileSize] = useState<number | null>(null);
  const [resolvedVideoUrls, setResolvedVideoUrls] = useState<Record<string, string>>({});

  // File input refs for complete clean resets
  const addFileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  // File Upload Handler for Photo & Video
  const handleDeviceMediaUpload = async (
    file: File | undefined, 
    type: GalleryMediaType, 
    isEdit: boolean
  ) => {
    if (!file) return;

    setIsProcessingMediaFile(true);
    setUploadProgress(null);
    setStatusError('');
    try {
      if (type === 'photo') {
        const result = await compressAndReadImageFile(file, 960, 0.72);
        if (isEdit) {
          setEditForm(prev => ({
            ...prev,
            url: result.dataUrl,
            titleMR: prev.titleMR || `श्री इश्वटीची माता पावन दर्शन (${file.name})`,
            titleEN: prev.titleEN || `Shree Ishwatichi Mata Darshan (${file.name})`
          }));
        } else {
          setAddForm(prev => ({
            ...prev,
            url: result.dataUrl,
            titleMR: prev.titleMR || `श्री इश्वटीची माता पावन दर्शन (${file.name})`,
            titleEN: prev.titleEN || `Shree Ishwatichi Mata Darshan (${file.name})`
          }));
        }
        setUploadedMediaFileName(result.name);
        setUploadedMediaFileSize(result.size);
      } else if (type === 'video') {
        setUploadProgress(0);
        let videoUrl = '';
        let storagePath: string | undefined;

        try {
          const cloudResult = await uploadMediaToCloudStorage(file, 'gallery_videos', (pct) => {
            setUploadProgress(pct);
          });
          videoUrl = cloudResult.url;
          storagePath = cloudResult.storagePath;
        } catch (cloudErr: any) {
          throw new Error(cloudErr?.message || (lang === 'EN'
            ? 'Video upload failed. Check your connection and Firebase Storage permissions, then try again.'
            : 'व्हिडिओ अपलोड अयशस्वी झाले. कनेक्शन आणि Firebase Storage परवानग्या तपासून पुन्हा प्रयत्न करा.'));
        }

        if (isEdit) {
          setEditForm(prev => ({
            ...prev,
            url: videoUrl,
            storagePath,
            localVideoId: null,
            titleMR: prev.titleMR || `महोत्सव व्हिडिओ: ${file.name}`,
            titleEN: prev.titleEN || `Festival Video: ${file.name}`
          }));
        } else {
          setAddForm(prev => ({
            ...prev,
            url: videoUrl,
            storagePath,
            localVideoId: null,
            titleMR: prev.titleMR || `महोत्सव व्हिडिओ: ${file.name}`,
            titleEN: prev.titleEN || `Festival Video: ${file.name}`
          }));
        }
        setUploadedMediaFileName(file.name);
        setUploadedMediaFileSize(file.size);
        if (videoUrl) {
          setResolvedVideoUrls(prev => ({
            ...prev,
            [videoUrl]: videoUrl,
            ...(storagePath ? { [storagePath]: videoUrl } : {})
          }));
        }
      }
    } catch (err: any) {
      setStatusError(err?.message || (lang === 'EN' ? 'Failed to process selected file.' : 'निवडलेली फाईल प्रक्रिया अयशस्वी झाली.'));
    } finally {
      setIsProcessingMediaFile(false);
      setTimeout(() => setUploadProgress(null), 1000);
    }
  };

  // Delete Confirmation State
  const [deletingItem, setDeletingItem] = useState<GalleryMediaItem | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusError, setStatusError] = useState<string>('');
  const [statusSuccess, setStatusSuccess] = useState<string>('');

  // Modal container refs for immediate top-focus
  const addModalContainerRef = React.useRef<HTMLDivElement>(null);
  const editModalContainerRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll modal container to top, reset scroll, and focus modal when opened
  useEffect(() => {
    if (showAddModal) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        if (addModalContainerRef.current) {
          addModalContainerRef.current.scrollTop = 0;
          addModalContainerRef.current.focus();
        }
      }, 40);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else if (editingItem) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        if (editModalContainerRef.current) {
          editModalContainerRef.current.scrollTop = 0;
          editModalContainerRef.current.focus();
        }
      }, 40);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else if (deletingItem) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [showAddModal, editingItem, deletingItem]);

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

  // Instagram Reels list for Instagram tab showcase (filtered strictly by selected year)
  const reelsList = useMemo(() => {
    return mediaItems.filter(item => {
      if (item.type !== 'instagram') return false;
      if (selectedYear !== 'All' && item.year !== selectedYear) return false;
      return true;
    });
  }, [mediaItems, selectedYear]);

  const activeFeaturedReel = useMemo(() => {
    if (reelsList.length === 0) return null;
    return reelsList.find(r => r.id === activeFeaturedId) || reelsList[0];
  }, [reelsList, activeFeaturedId]);

  // Total count of videos/reels across all years for clear user feedback
  const totalVideosCount = useMemo(() => {
    return mediaItems.filter(i => i.type === 'video' || i.type === 'instagram' || i.category === 'Videos & Reels').length;
  }, [mediaItems]);

  // Priority ordering helper: Photos first, then direct Videos, then YouTube videos, then Instagram reels
  const getMediaTypePriority = (item: GalleryMediaItem): number => {
    if (item.type === 'photo') return 1;
    if (item.type === 'video') {
      const isYoutube = (item.url && (item.url.includes('youtube.com') || item.url.includes('youtu.be'))) || 
                        (item.embedUrl && item.embedUrl.includes('youtube.com'));
      return isYoutube ? 3 : 2;
    }
    if (item.type === 'instagram') return 4;
    return 5;
  };

  // Helper to normalize media URL input without protocol issues
  const normalizeMediaUrl = (raw: string, type: GalleryMediaType): string => {
    let url = raw.trim();
    if (!url) return '';
    if (url.startsWith('blob:') || (type === 'video' && url.startsWith('data:'))) return '';
    if (url.startsWith('data:') || (url.startsWith('/') && !url.startsWith('//') && !url.includes('..'))) {
      return url;
    }
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    return url;
  };

  // Filtered Media Items (By Year, Media Type, and Category with Images First ordering)
  const filteredItems = useMemo(() => {
    const list = mediaItems.filter(item => {
      // 1. Filter by Year
      if (selectedYear !== 'All' && item.year !== selectedYear) {
        return false;
      }

      // 2. Filter by Media Type
      if (mediaTypeFilter === 'photos' && item.type !== 'photo') {
        return false;
      }
      if (mediaTypeFilter === 'videos') {
        const isVid = item.type === 'video' || item.type === 'instagram' || item.category === 'Videos & Reels';
        if (!isVid) return false;
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

    // When reorder mode is active, strictly follow current dragged displayOrder
    if (isReorderMode) {
      return [...list].sort((a, b) => {
        const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 999999;
        const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 999999;
        return orderA - orderB;
      });
    }

    // Default Section Display: Photos first, then Videos, then YouTube/Instagram Reels
    return [...list].sort((a, b) => {
      const prioA = getMediaTypePriority(a);
      const prioB = getMediaTypePriority(b);
      if (prioA !== prioB) return prioA - prioB;

      const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 999999;
      const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 999999;
      if (orderA !== orderB) return orderA - orderB;

      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
  }, [mediaItems, selectedYear, mediaTypeFilter, activeCategory, isReorderMode]);

  // Reset lazy load counter when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [selectedYear, mediaTypeFilter, activeCategory]);

  // Paginated/Lazy slice of items to display
  const displayedItems = useMemo(() => {
    if (isReorderMode) return filteredItems;
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount, isReorderMode]);

  const hasMore = !isReorderMode && visibleCount < filteredItems.length;

  // Auto-load next batch as user scrolls down
  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + ITEMS_PER_BATCH, filteredItems.length));
        }
      },
      { rootMargin: '300px' }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) observer.unobserve(sentinel);
      observer.disconnect();
    };
  }, [hasMore, filteredItems.length]);

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
    const itemTitle = lang === 'EN' ? (item.titleEN || item.titleMR) : (item.titleMR || item.titleEN);
    const textMsg = lang === 'EN' 
      ? `Devotional Media (${item.year}): ${itemTitle}`
      : `पावन दर्शन उत्सव (${item.year}): ${itemTitle}`;
    
    void shareToWhatsApp({
      title: itemTitle,
      text: textMsg,
      url: item.url,
      lang,
    });
  };

  const discardPendingAddUpload = (storagePath?: string | null) => {
    if (storagePath) {
      void deleteCloudMediaObject(storagePath).catch((error) => {
        console.warn('Could not clean up an abandoned gallery upload:', error);
      });
    }
  };

  // Complete reset helper for Add Media Modal to clear all previously uploaded files, titles, and paths
  const resetAddForm = (preferredType: GalleryMediaType = 'photo', cleanupPendingUpload = true) => {
    if (cleanupPendingUpload && addForm.storagePath) {
      discardPendingAddUpload(addForm.storagePath);
    }
    if (addFileInputRef.current) {
      addFileInputRef.current.value = '';
    }
    setAddForm({
      type: preferredType,
      url: '',
      localVideoId: undefined,
      storagePath: undefined,
      titleMR: '',
      titleEN: '',
      category: preferredType === 'video' || preferredType === 'instagram' ? 'Videos & Reels' : 'Mata Darshan',
      year: selectedYear !== 'All' ? selectedYear : '2026',
      descriptionMR: '',
      descriptionEN: '',
      authorHandle: '@ishwatichi_mata'
    });
    setAddUploadSource('device');
    setUploadedMediaFileName('');
    setUploadedMediaFileSize(null);
    setIsProcessingMediaFile(false);
    setUploadProgress(null);
    setStatusError('');
    setStatusSuccess('');
  };

  // Switch Media Type inside Add Modal with clean slate
  const handleSwitchAddType = (newType: GalleryMediaType) => {
    if (addForm.storagePath) {
      discardPendingAddUpload(addForm.storagePath);
    }
    if (addFileInputRef.current) {
      addFileInputRef.current.value = '';
    }
    setUploadedMediaFileName('');
    setUploadedMediaFileSize(null);
    setIsProcessingMediaFile(false);
    setUploadProgress(null);
    setStatusError('');
    setAddForm(prev => ({
      ...prev,
      type: newType,
      url: '',
      storagePath: undefined,
      localVideoId: undefined,
      titleMR: '',
      titleEN: '',
      category: newType === 'video' || newType === 'instagram' 
        ? 'Videos & Reels' 
        : (prev.category === 'Videos & Reels' ? 'Mata Darshan' : prev.category)
    }));
  };

  // Clear currently selected device upload in Add Modal
  const handleClearSelectedAddFile = () => {
    if (addForm.storagePath) {
      discardPendingAddUpload(addForm.storagePath);
    }
    if (addFileInputRef.current) {
      addFileInputRef.current.value = '';
    }
    setUploadedMediaFileName('');
    setUploadedMediaFileSize(null);
    setIsProcessingMediaFile(false);
    setUploadProgress(null);
    setAddForm(prev => ({
      ...prev,
      url: '',
      storagePath: undefined,
      localVideoId: undefined
    }));
  };

  // Clear currently selected device upload in Edit Modal
  const handleClearSelectedEditFile = () => {
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
    setUploadedMediaFileName('');
    setUploadedMediaFileSize(null);
    setIsProcessingMediaFile(false);
    setUploadProgress(null);
    setEditForm(prev => ({
      ...prev,
      url: '',
      storagePath: null,
      localVideoId: null
    }));
  };

  const handleOpenAddModal = (preferredType?: GalleryMediaType) => {
    const initialType = preferredType || (mediaTypeFilter === 'videos' ? 'video' : mediaTypeFilter === 'instagram' ? 'instagram' : 'photo');
    resetAddForm(initialType);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    resetAddForm('photo');
  };

  // Open Edit Modal
  const handleOpenEdit = (item: GalleryMediaItem) => {
    setEditingItem(item);
    setEditUploadSource(item.url.startsWith('data:') || item.url.startsWith('blob:') ? 'device' : 'url');
    setUploadedMediaFileName(item.url.startsWith('data:') || item.url.startsWith('blob:') ? 'uploaded-file' : '');
    setUploadedMediaFileSize(null);
    setEditForm({
      type: item.type,
      url: item.url,
      localVideoId: item.localVideoId,
      storagePath: item.storagePath,
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

  // =========================================================================
  // REORDERING & DRAG-AND-DROP HANDLERS (ALL SECTIONS & FILTERS)
  // =========================================================================
  const handleToggleReorderMode = () => {
    if (!isReorderMode) {
      setOriginalOrderSnapshot([...mediaItems]);
      setIsReorderMode(true);
      setSaveOrderSuccess(false);
      setStatusError('');
      setStatusSuccess('');
    } else {
      setIsReorderMode(false);
      setDraggedItemIndex(null);
      setDragOverIndex(null);
      setOriginalOrderSnapshot(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    setDraggedItemIndex(index);
    setSaveOrderSuccess(false);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent, index: number) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === dropIndex) {
      setDraggedItemIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updatedMaster = applyReorderToMasterList(
      mediaItems,
      filteredItems,
      draggedItemIndex,
      dropIndex
    );
    setMediaItems(updatedMaster);
    setCachedGalleryMedia(updatedMaster);
    setDraggedItemIndex(null);
    setDragOverIndex(null);
    setSaveOrderSuccess(false);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
    setDragOverIndex(null);
  };

  // Quick move buttons for touch & mobile devices
  const handleMoveItem = (filteredIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? filteredIndex - 1 : filteredIndex + 1;
    if (targetIndex < 0 || targetIndex >= filteredItems.length) return;

    const updatedMaster = applyReorderToMasterList(
      mediaItems,
      filteredItems,
      filteredIndex,
      targetIndex
    );
    setMediaItems(updatedMaster);
    setCachedGalleryMedia(updatedMaster);
    setSaveOrderSuccess(false);
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    setStatusError('');
    try {
      await reorderGalleryMedia(mediaItems);
      setSaveOrderSuccess(true);
      setOriginalOrderSnapshot([...mediaItems]);
      setTimeout(() => setSaveOrderSuccess(false), 3000);
    } catch (err: any) {
      setStatusError(err?.message || (lang === 'EN' ? 'Failed to save new order.' : 'नवीन क्रम जतन करणे अयशस्वी झाले.'));
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleResetOrder = () => {
    if (originalOrderSnapshot) {
      setMediaItems(originalOrderSnapshot);
      setCachedGalleryMedia(originalOrderSnapshot);
      setSaveOrderSuccess(false);
    }
  };

  // Submit Add Media
  const handleAddMediaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusError('');
    setStatusSuccess('');

    const cleanUrl = normalizeMediaUrl(addForm.url, addForm.type);
    if (!cleanUrl) {
      setStatusError(lang === 'EN' ? 'Please provide a photo/video file or valid web link.' : 'कृपया फोटो/व्हिडिओ फाईल निवडा किंवा वैध लिंक प्रविष्ट करा.');
      return;
    }

    try {
      setIsSubmitting(true);

      let embedUrl: string | undefined = undefined;
      if (addForm.type === 'instagram') {
        if (!extractInstagramShortcode(cleanUrl)) throw new Error(lang === 'EN' ? 'Enter a valid Instagram Reel or post URL.' : 'वैध Instagram Reel किंवा पोस्ट लिंक प्रविष्ट करा.');
        embedUrl = getInstagramEmbedUrl(cleanUrl);
      } else if (addForm.type === 'video' && isYoutubeUrl(cleanUrl)) {
        embedUrl = getYouTubeEmbedUrl(cleanUrl);
        if (!embedUrl) throw new Error(lang === 'EN' ? 'Enter a valid YouTube video URL.' : 'वैध YouTube व्हिडिओ लिंक प्रविष्ट करा.');
      }

      const newItem = await addGalleryMedia({
        type: addForm.type,
        url: cleanUrl,
        ...(embedUrl ? { embedUrl } : {}),
        ...(addForm.localVideoId ? { localVideoId: addForm.localVideoId } : {}),
        ...(addForm.storagePath ? { storagePath: addForm.storagePath } : {}),
        titleMR: addForm.titleMR.trim() || 'श्री ईश्वटीची माता पावन दर्शन',
        titleEN: addForm.titleEN.trim() || 'Shree Ishwatichi Mata Sacred Darshan',
        category: addForm.category,
        year: addForm.year.trim() || '2026',
        descriptionMR: addForm.descriptionMR.trim(),
        descriptionEN: addForm.descriptionEN.trim(),
        authorHandle: addForm.authorHandle.trim() || '@ishwatichi_mata'
      });

      if (addForm.type === 'video' && addForm.url) {
        setResolvedVideoUrls(prev => ({
          ...prev,
          [newItem.id]: addForm.url,
          ...(newItem.localVideoId ? { [newItem.localVideoId]: addForm.url } : {})
        }));
      }

      setMediaItems(prev => [newItem, ...prev]);
      setStatusSuccess(lang === 'EN' ? 'Media added successfully!' : 'माध्यम यशस्वीरित्या गॅलरीमध्ये जोडले गेले!');

      resetAddForm('photo', false);

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

      let cleanEditUrl = normalizeMediaUrl(editForm.url, editForm.type);
      if (!cleanEditUrl) {
        if (editingItem.url.startsWith('blob:')) {
          throw new Error(lang === 'EN'
            ? 'This video exists only in a previous browser. Upload the original file again to save it in cloud storage.'
            : 'हा व्हिडिओ फक्त जुन्या ब्राउजरमध्ये आहे. क्लाउडमध्ये जतन करण्यासाठी मूळ फाईल पुन्हा अपलोड करा.');
        }
        cleanEditUrl = editingItem.url;
      }

      let embedUrl: string | undefined;
      if (editForm.type === 'instagram') {
        if (!extractInstagramShortcode(cleanEditUrl)) throw new Error(lang === 'EN' ? 'Enter a valid Instagram Reel or post URL.' : 'वैध Instagram Reel किंवा पोस्ट लिंक प्रविष्ट करा.');
        embedUrl = getInstagramEmbedUrl(cleanEditUrl);
      } else if (editForm.type === 'video' && isYoutubeUrl(cleanEditUrl)) {
        embedUrl = getYouTubeEmbedUrl(cleanEditUrl);
        if (!embedUrl) throw new Error(lang === 'EN' ? 'Enter a valid YouTube video URL.' : 'वैध YouTube व्हिडिओ लिंक प्रविष्ट करा.');
      }

      const activeLocalVidId = editForm.localVideoId === null ? null : (editForm.localVideoId || editingItem.localVideoId);
      const activeStoragePath = editForm.storagePath === null ? null : (editForm.storagePath || editingItem.storagePath);

      await updateGalleryMedia(editingItem.id, {
        type: editForm.type,
        url: cleanEditUrl,
        embedUrl: embedUrl || '',
        localVideoId: activeLocalVidId,
        storagePath: activeStoragePath,
        titleMR: editForm.titleMR.trim() || editingItem.titleMR,
        titleEN: editForm.titleEN.trim() || editingItem.titleEN,
        category: editForm.category,
        year: editForm.year.trim() || editingItem.year,
        descriptionMR: editForm.descriptionMR.trim(),
        descriptionEN: editForm.descriptionEN.trim(),
        authorHandle: editForm.authorHandle.trim()
      });

      if (editForm.type === 'video' && editForm.url) {
        setResolvedVideoUrls(prev => ({
          ...prev,
          [editingItem.id]: editForm.url,
          ...(activeLocalVidId ? { [activeLocalVidId]: editForm.url } : {})
        }));
      }

      setMediaItems(prev => prev.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            type: editForm.type,
            url: cleanEditUrl,
            embedUrl: embedUrl || '',
            localVideoId: activeLocalVidId || undefined,
            storagePath: activeStoragePath || undefined,
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

        {/* Action Toolbar: Add Media + Reorder + Toggle Featured Altar */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0 flex-wrap">
          {mediaTypeFilter === 'instagram' && reelsList.length > 0 && (
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

          {/* Reorder Mode Toggle Button */}
          {canManageMedia && <button
            onClick={handleToggleReorderMode}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isReorderMode
                ? 'bg-amber-400 text-brand-maroon border-brand-gold shadow-lg font-black ring-2 ring-amber-400/50'
                : 'bg-black/50 text-gray-300 border-brand-gold/40 hover:border-brand-gold hover:text-white hover:bg-black/70'
            }`}
            title={lang === 'EN' ? 'Drag and drop to reorder gallery items' : 'गॅलरीतील साहित्यांचा क्रम बदलण्यासाठी ड्रॅग करा'}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>
              {isReorderMode 
                ? (lang === 'EN' ? 'Exit Reorder' : 'क्रम पूर्ण') 
                : (lang === 'EN' ? 'Reorder Items' : 'क्रम बदला (Reorder)')}
            </span>
          </button>}

          {canManageMedia && <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/90 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-brand-maroon px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg hover:shadow-brand-gold/30 border border-brand-gold"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{lang === 'EN' ? 'Add Photo / Video / Reel' : 'नवीन फोटो / व्हिडिओ / रील जोडा'}</span>
          </button>}
          {!canManageMedia && (
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs font-bold text-brand-gold">
                {lang === 'EN' ? 'Gallery management is controlled from Admin Console.' : 'गॅलरी व्यवस्थापन Admin Console मधून नियंत्रित केले जाते.'}
              </span>
              <span className="text-[10px] text-gray-400">
                {signedInEmail
                  ? `Signed in as ${signedInEmail}; verified dangebow@gmail.com access is required.`
                  : 'Sign in from Admin Console with the verified dangebow@gmail.com account.'}
              </span>
              {authMessage && <span role="alert" className="text-[10px] text-red-300">{authMessage}</span>}
            </div>
          )}
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
            onClick={() => { 
              setMediaTypeFilter('videos'); 
              setActiveCategory('All'); 
            }}
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
            onClick={() => { 
              setMediaTypeFilter('instagram'); 
              setActiveCategory('All'); 
            }}
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
      {/* 4. FEATURED INSTAGRAM REEL ALTAR (ONLY IN INSTAGRAM REELS TAB ACCORDING TO YEAR) */}
      {/* ========================================================================= */}
      {mediaTypeFilter === 'instagram' && activeCategory === 'All' && showFeaturedAltar && reelsList.length > 0 && activeFeaturedReel && (
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
                  className="w-full max-w-[420px] sm:max-w-[460px]"
                />
              ) : activeFeaturedReel.embedUrl ? (
                <div className="w-full max-w-[560px] min-h-[360px] sm:min-h-[440px] md:min-h-[480px] aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden border-2 border-brand-gold/60 shadow-2xl bg-black">
                  <iframe
                    src={activeFeaturedReel.embedUrl}
                    title={activeFeaturedReel.titleMR}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="w-full max-w-[480px] min-h-[460px] sm:min-h-[540px] aspect-[3/4] sm:aspect-[4/5] rounded-2xl overflow-hidden border-2 border-brand-gold/60 shadow-2xl bg-black relative flex items-center justify-center p-3 group">
                  {/* Atmospheric blurred ambient glow matching sacred idol colors */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-40 scale-110 pointer-events-none"
                    style={{ backgroundImage: `url(${activeFeaturedReel.url})` }}
                  />
                  <img
                    src={activeFeaturedReel.url}
                    alt={activeFeaturedReel.titleMR}
                    className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.95)] transition-transform duration-500 group-hover:scale-[1.03]"
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

                {canManageMedia && <div className="flex items-center gap-2">
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
                </div>}
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
        {/* Reordering Control Banner (Active across All Sections & Filters) */}
        {isReorderMode && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#2a0e05] via-[#1a0505] to-[#2a0e05] border-2 border-brand-gold shadow-2xl space-y-3 animate-fade-in text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-brand-gold/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-brand-maroon shadow-lg shrink-0">
                  <ArrowUpDown className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-brand-gold flex items-center gap-2">
                    <span>{lang === 'EN' ? 'Reordering Mode Active' : 'गॅलरी साहित्य क्रम बदलणे सक्रिय'}</span>
                    <span className="text-[10px] bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded font-mono border border-brand-gold/40">
                      {filteredItems.length} {lang === 'EN' ? 'items' : 'साहित्य'}
                    </span>
                  </h4>
                  <p className="text-xs text-amber-200/90 mt-0.5">
                    {lang === 'EN' 
                      ? 'Drag and drop any card to reorder, or tap the ⬆️ ⬇️ buttons on each card. Click "Save Order" when finished.' 
                      : 'कोणतेही कार्ड धरून इच्छित जागी ड्रॅग करा किंवा कार्डवरील ⬆️ ⬇️ बटनांचा वापर करा. बदल झाल्यावर "क्रम जतन करा" वर क्लिक करा.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={handleSaveOrder}
                  disabled={isSavingOrder}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg hover:shadow-green-500/30 disabled:opacity-50"
                >
                  {isSavingOrder ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{lang === 'EN' ? 'Saving...' : 'जतन होत आहे...'}</span>
                    </>
                  ) : saveOrderSuccess ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                      <span>{lang === 'EN' ? 'Order Saved!' : 'क्रम जतन झाला!'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{lang === 'EN' ? 'Save Order' : 'क्रम जतन करा'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetOrder}
                  disabled={isSavingOrder}
                  className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-200 px-3 py-2 rounded-xl text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                  title={lang === 'EN' ? 'Reset to initial order' : 'मूळ क्रम पूर्ववत करा'}
                >
                  <RotateCcw className="h-3.5 w-3.5 text-gray-400" />
                  <span>{lang === 'EN' ? 'Reset' : 'पूर्ववत करा'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleReorderMode}
                  className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>{lang === 'EN' ? 'Done' : 'पूर्ण'}</span>
                </button>
              </div>
            </div>

            {/* Reorder Status Feedback Messages */}
            {saveOrderSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  {lang === 'EN' 
                    ? '✓ Gallery order successfully updated and saved!' 
                    : '✓ गॅलरीचा क्रम यशस्वीरित्या अद्यतनित व जतन करण्यात आला आहे!'}
                </span>
              </div>
            )}
            {statusError && (
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                <span>{statusError}</span>
              </div>
            )}
          </div>
        )}

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
            {isReorderMode
              ? (lang === 'EN' ? 'Reordering active • Drag to reorder' : 'क्रम बदल मोड चालू • ड्रॅग करून क्रम बदला')
              : (lang === 'EN' ? 'Tap photo to zoom • Tap video to watch' : 'मोठ्या दर्शनासाठी चित्रावर क्लिक करा • रील प्ले करा')}
          </div>
        </div>

        {/* Video Filter Assistant Banner when year filter restricts video results */}
        {mediaTypeFilter === 'videos' && selectedYear !== 'All' && totalVideosCount > filteredItems.length && (
          <div className="mb-5 p-3 rounded-xl bg-blue-950/70 border border-blue-500/40 text-xs text-blue-200 flex items-center justify-between gap-3 flex-wrap shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-base">🎥</span>
              <span>
                {lang === 'EN'
                  ? `Showing ${filteredItems.length} videos from festival year ${selectedYear}. Total ${totalVideosCount} videos uploaded across all years.`
                  : `वर्ष ${selectedYear} मधील ${filteredItems.length} व्हिडिओ दिसत आहेत. सर्व वर्षे मिळून एकूण ${totalVideosCount} व्हिडिओ उपलब्ध आहेत.`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedYear('All')}
              className="px-3 py-1.5 bg-brand-gold hover:bg-yellow-400 text-brand-maroon font-bold text-xs rounded-lg cursor-pointer shadow transition-all active:scale-95"
            >
              {lang === 'EN' ? `Show All ${totalVideosCount} Videos` : `सर्व ${totalVideosCount} व्हिडिओ पहा`}
            </button>
          </div>
        )}

        {/* The Core Responsive Grid - Uniform width & height across photos, videos, and reels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {displayedItems.map((item, index) => {
            const isPhoto = item.type === 'photo';
            const isInstagram = item.type === 'instagram';
            const isVideo = item.type === 'video';

            const isBeingDragged = draggedItemIndex === index;
            const isDropTarget = dragOverIndex === index && draggedItemIndex !== index;

            return (
              <div
                key={item.id}
                draggable={isReorderMode}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={(e) => handleDragLeave(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex flex-col h-full rounded-2xl overflow-hidden border transition-all duration-300 group text-left relative ${
                  isBeingDragged
                    ? 'opacity-40 scale-[0.97] border-dashed border-2 border-brand-gold ring-2 ring-brand-gold/50 shadow-2xl bg-amber-950/40'
                    : isDropTarget
                    ? 'border-amber-400 ring-4 ring-amber-400/60 scale-[1.02] shadow-2xl shadow-amber-500/40 bg-zinc-900 z-20'
                    : isReorderMode
                    ? 'border-brand-gold/60 bg-gradient-to-b from-[#250d05] via-black/80 to-black cursor-grab active:cursor-grabbing hover:border-brand-gold shadow-lg hover:shadow-brand-gold/20'
                    : 'border-brand-gold/30 bg-gradient-to-b from-brand-maroon/20 via-black/60 to-black/90 shadow-xl hover:shadow-2xl hover:border-brand-gold/80'
                }`}
              >
                {/* Top Badge Strip (Type, Year, Actions, Reorder Controls) */}
                <div className="bg-black/80 px-3 py-2 border-b border-white/10 flex items-center justify-between text-xs shrink-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Reorder Position Badge & Drag Handle */}
                    {isReorderMode && (
                      <div 
                        className="flex items-center gap-1 bg-amber-500 text-brand-maroon px-2 py-0.5 rounded font-black text-[11px] shadow cursor-grab"
                        title={lang === 'EN' ? 'Drag handle' : 'क्रम बदलण्यासाठी येथे धरा'}
                      >
                        <GripVertical className="h-3.5 w-3.5" />
                        <span>#{index + 1}</span>
                      </div>
                    )}

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

                  {/* Reorder Buttons OR Edit/Delete Action Buttons */}
                  {canManageMedia && <div className="flex items-center gap-1">
                    {isReorderMode ? (
                      <div className="flex items-center gap-1 bg-black/70 px-1 py-0.5 rounded-lg border border-brand-gold/40">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveItem(index, 'up');
                          }}
                          disabled={index === 0}
                          className="p-1 rounded text-gray-300 hover:text-amber-300 disabled:opacity-30 disabled:hover:text-gray-300 transition-colors cursor-pointer"
                          title={lang === 'EN' ? 'Move Up' : 'वर हलवा'}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveItem(index, 'down');
                          }}
                          disabled={index === filteredItems.length - 1}
                          className="p-1 rounded text-gray-300 hover:text-amber-300 disabled:opacity-30 disabled:hover:text-gray-300 transition-colors cursor-pointer"
                          title={lang === 'EN' ? 'Move Down' : 'खाली हलवा'}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>}
                </div>

                {/* Responsive Media Viewport with Elevated Height for Authentic Full Aspect Ratio */}
                {isInstagram ? (
                  <div className="relative w-full min-h-[500px] sm:min-h-[560px] md:min-h-[600px] aspect-[9/16] sm:aspect-[4/5] bg-gradient-to-tr from-[#2b0818] via-black to-[#1a0510] overflow-hidden flex items-center justify-center shrink-0">
                    {item.embedUrl ? (
                      <iframe
                        src={item.embedUrl}
                        title={item.titleMR || 'Instagram Reel'}
                        className="w-full h-full border-0 object-cover"
                        scrolling="no"
                        allowFullScreen
                        loading="lazy"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-gradient-to-b from-[#3a0920]/80 via-black to-black">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-yellow-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-xl ring-2 ring-brand-gold/40">
                          <Instagram className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-black text-white line-clamp-2">{item.titleMR}</span>
                          <span className="text-xs text-brand-gold font-mono block">{item.authorHandle || '@ishwatichi_mata'}</span>
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-1.5 rounded-full bg-brand-gold text-brand-maroon font-bold text-xs shadow hover:bg-yellow-400 transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Play className="h-3.5 w-3.5" />
                          <span>{lang === 'EN' ? 'Watch Full Reel' : 'संपूर्ण रील पहा'}</span>
                        </a>
                      </div>
                    )}
                    {isReorderMode && (
                      <div className="absolute inset-0 z-10 bg-black/40 pointer-events-none flex items-center justify-center">
                        <span className="bg-black/90 text-brand-gold text-[10px] font-bold px-2.5 py-1 rounded-full border border-brand-gold/40 shadow">
                          {lang === 'EN' ? 'Drag Card to Reorder' : 'क्रम बदलण्यासाठी ड्रॅग करा'}
                        </span>
                      </div>
                    )}
                  </div>
                ) : isVideo && item.embedUrl ? (
                  <div className="relative w-full min-h-[340px] sm:min-h-[400px] md:min-h-[440px] aspect-[16/10] sm:aspect-[4/3] bg-black overflow-hidden flex items-center justify-center shrink-0">
                    <iframe
                      src={item.embedUrl}
                      title={item.titleMR}
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                    {isReorderMode && (
                      <div className="absolute inset-0 z-10 bg-black/40 pointer-events-none flex items-center justify-center">
                        <span className="bg-black/90 text-brand-gold text-[10px] font-bold px-2.5 py-1 rounded-full border border-brand-gold/40 shadow">
                          {lang === 'EN' ? 'Drag Card to Reorder' : 'क्रम बदलण्यासाठी ड्रॅग करा'}
                        </span>
                      </div>
                    )}
                  </div>
                ) : isVideo ? (
                  <div className="relative w-full min-h-[340px] sm:min-h-[400px] md:min-h-[440px] aspect-[16/10] sm:aspect-[4/3] bg-black overflow-hidden flex items-center justify-center shrink-0">
                    {item.url.startsWith('blob:') ? (
                      <p className="p-3 text-center text-xs text-amber-200">
                        {lang === 'EN'
                          ? 'This video was saved only in the browser that uploaded it. An admin must upload the original file again.'
                          : 'हा व्हिडिओ फक्त अपलोड केलेल्या ब्राउजरमध्ये जतन झाला होता. प्रशासकाने मूळ फाईल पुन्हा अपलोड करणे आवश्यक आहे.'}
                      </p>
                    ) : (
                      <AmbientVideoPlayer
                        src={resolvedVideoUrls[item.id] || item.url}
                        title={lang === 'EN' ? (item.titleEN || item.titleMR) : item.titleMR}
                        controls={!isReorderMode}
                        playsInline
                        containerClassName="w-full h-full"
                        aspectRatioClass="h-full w-full"
                      />
                    )}
                    {isReorderMode && (
                      <div className="absolute inset-0 z-10 bg-black/40 pointer-events-none flex items-center justify-center">
                        <span className="bg-black/90 text-brand-gold text-[10px] font-bold px-2.5 py-1 rounded-full border border-brand-gold/40 shadow">
                          {lang === 'EN' ? 'Drag Card to Reorder' : 'क्रम बदलण्यासाठी ड्रॅग करा'}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    onClick={() => {
                      if (!isReorderMode) handleOpenLightbox(item);
                    }}
                    className={`relative w-full min-h-[460px] sm:min-h-[520px] md:min-h-[560px] aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-gradient-to-b from-[#180603] via-black to-[#0e0302] flex items-center justify-center shrink-0 ${
                      isReorderMode ? 'cursor-grab' : 'cursor-pointer'
                    }`}
                  >
                    {/* Atmospheric ambient blurred backdrop matching image color palette */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-40 scale-110 pointer-events-none transition-transform duration-700 group-hover:scale-125"
                      style={{ backgroundImage: `url(${item.url})` }}
                    />

                    {/* Full uncropped sacred image with object-contain ensuring Devi Mata is 100% visible from Crown to Lotus Feet */}
                    <img
                      src={item.url}
                      alt={item.titleMR}
                      className="relative z-10 max-w-full max-h-full w-auto h-auto object-contain object-center transition-transform duration-700 group-hover:scale-[1.03] drop-shadow-[0_12px_28px_rgba(0,0,0,0.95)] p-2.5"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />

                    {/* Sacred Emblem Corner Badge */}
                    <div className="absolute top-2.5 left-2.5 z-20 bg-black/80 backdrop-blur-md border border-brand-gold/60 text-brand-gold text-[10px] font-sans font-black px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 pointer-events-none">
                      <span>🌸</span>
                      <span>श्री इश्वटीची • {item.year}</span>
                    </div>

                    {/* Hover Overlay with Zoom Prompt */}
                    {!isReorderMode && (
                      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3 pointer-events-none">
                        <span className="flex items-center gap-1 text-brand-gold font-bold text-xs bg-black/60 px-2.5 py-1 rounded-full border border-brand-gold/40 backdrop-blur-sm">
                          <ZoomIn className="h-3.5 w-3.5" />
                          <span>{lang === 'EN' ? 'Full HD Darshan' : 'संपूर्ण दिव्य दर्शन'}</span>
                        </span>
                      </div>
                    )}

                    {isReorderMode && (
                      <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/90 text-brand-gold border border-brand-gold px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xl">
                          <GripVertical className="h-3.5 w-3.5" />
                          <span>{lang === 'EN' ? 'Drag to Reorder' : 'क्रम बदलण्यासाठी ड्रॅग करा'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Card Bottom Meta - Uniform Flexbox Layout for aligned row heights */}
                <div className="p-3.5 text-left border-t border-white/10 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono mb-1">
                      <span className="truncate max-w-[150px]">{item.category}</span>
                      <span className="text-brand-gold font-bold shrink-0">वर्ष: {item.year}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-sans font-black text-white group-hover:text-brand-gold transition-colors line-clamp-2">
                      {lang === 'EN' ? (item.titleEN || item.titleMR) : item.titleMR}
                    </h4>
                    {item.descriptionMR && (
                      <p className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed mt-1">
                        {lang === 'EN' ? (item.descriptionEN || item.descriptionMR) : item.descriptionMR}
                      </p>
                    )}
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <button
                      onClick={() => handleShareWhatsApp(item)}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <span>💬 WhatsApp</span>
                    </button>
                    <button
                      onClick={() => handleCopyLink(item.url)}
                      className="text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{lang === 'EN' ? 'Copy Link' : 'लिंक'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Lazy Loading Sentinel & Progressive Loader */}
        <div ref={sentinelRef} className="w-full py-6 flex flex-col items-center justify-center gap-2">
          {hasMore ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-brand-gold text-xs font-mono">
                <Loader2 className="h-4 w-4 animate-spin text-brand-gold" />
                <span>
                  {lang === 'EN'
                    ? `Loading more sacred media (${displayedItems.length} of ${filteredItems.length})...`
                    : `अधिक पावन दर्शन लोड होत आहे (${displayedItems.length} पैकी ${filteredItems.length})...`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setVisibleCount(prev => Math.min(prev + 12, filteredItems.length))}
                className="px-4 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 border border-brand-gold/40 text-brand-gold text-xs font-bold transition-all cursor-pointer shadow hover:scale-105"
              >
                {lang === 'EN' ? 'Load Next Batch' : 'पुढील छायाचित्रे व व्हिडिओ दाखवा'}
              </button>
            </div>
          ) : filteredItems.length > 12 ? (
            <span className="text-[11px] text-gray-500 font-mono">
              {lang === 'EN'
                ? `✓ All ${filteredItems.length} media items loaded`
                : `✓ सर्व ${filteredItems.length} साहित्य प्रदर्शित झाले आहेत`}
            </span>
          ) : null}
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
      {showAddModal && typeof document !== 'undefined' && createPortal(
        <div 
          ref={addModalContainerRef}
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in flex items-center justify-center p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (!isSubmitting && e.target === addModalContainerRef.current) handleCloseAddModal();
          }}
        >
          <form 
            onSubmit={handleAddMediaSubmit}
            className="bg-zinc-950 border-2 border-brand-gold/60 rounded-2xl p-5 sm:p-6 w-full max-w-xl space-y-4 shadow-2xl text-xs text-left max-h-[92vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-brand-gold font-bold text-sm">
                <Plus className="h-4 w-4 text-brand-gold" />
                <span>{lang === 'EN' ? 'Add Photo, Video or Instagram Reel by Year' : 'वर्षनिहाय फोटो, व्हिडिओ किंवा इन्स्टाग्राम रील जोडा'}</span>
              </div>
              <button 
                type="button" 
                onClick={handleCloseAddModal}
                disabled={isSubmitting}
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
                  onClick={() => handleSwitchAddType('photo')}
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
                  onClick={() => handleSwitchAddType('video')}
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
                  onClick={() => handleSwitchAddType('instagram')}
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

            {/* Media Source & URL/File Input */}
            {addForm.type === 'instagram' ? (
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {lang === 'EN' ? 'Instagram Reel URL *' : 'इन्स्टाग्राम रील किंवा पोस्ट लिंक *'}
                </label>
                <input
                  type="text"
                  inputMode="url"
                  placeholder="https://www.instagram.com/reel/Cx0sn8AoN7l/..."
                  value={addForm.url}
                      onChange={(e) => { discardPendingAddUpload(addForm.storagePath); setAddForm(prev => ({ ...prev, url: e.target.value, storagePath: undefined, localVideoId: undefined })); }}
                  className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold font-mono text-xs"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                {/* Mode Selector */}
                <div className="flex items-center justify-between">
                  <label className="block text-gray-300 font-semibold">
                    {addForm.type === 'photo'
                      ? (lang === 'EN' ? 'Photo Upload Source *' : 'फोटो निवडण्याचा प्रकार *')
                      : (lang === 'EN' ? 'Video Upload Source *' : 'व्हिडिओ निवडण्याचा प्रकार *')}
                  </label>
                  <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-white/10">
                    <button
                      type="button"
                      onClick={() => setAddUploadSource('device')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        addUploadSource === 'device'
                          ? 'bg-brand-gold text-brand-maroon font-black shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <HardDrive className="h-3 w-3" />
                      <span>{lang === 'EN' ? 'From Device' : 'डिव्हाइसवरून'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddUploadSource('url')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        addUploadSource === 'url'
                          ? 'bg-brand-gold text-brand-maroon font-black shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Globe className="h-3 w-3" />
                      <span>{lang === 'EN' ? 'Web Link / URL' : 'वेब लिंक'}</span>
                    </button>
                  </div>
                </div>

                {/* Sub-mode A: Local Device File Upload */}
                {addUploadSource === 'device' ? (
                  <div className="space-y-2">
                    <label className="border-2 border-dashed border-brand-gold/40 hover:border-brand-gold bg-black/40 hover:bg-black/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                      <input
                        ref={addFileInputRef}
                        type="file"
                        accept={addForm.type === 'photo' ? 'image/png,image/jpeg,image/webp,image/jpg' : 'video/mp4,video/webm,video/ogg,video/quicktime,video/*'}
                        onChange={(e) => handleDeviceMediaUpload(e.target.files?.[0], addForm.type, false)}
                        className="hidden"
                      />
                      <div className="h-10 w-10 rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-gold">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-bold text-brand-gold block text-xs">
                          {isProcessingMediaFile
                            ? (uploadProgress !== null
                                ? `${lang === 'EN' ? 'Uploading to Cloud Storage...' : 'क्लाउडवर व्हिडिओ अपलोड होत आहे...'} ${uploadProgress}%`
                                : (lang === 'EN' ? 'Processing File...' : 'फाईल प्रक्रिया होत आहे...'))
                            : addForm.type === 'photo'
                            ? (lang === 'EN' ? 'Click to Browse Photo from Device' : 'डिव्हाइसवरून फोटो निवडण्यासाठी येथे क्लिक करा')
                            : (lang === 'EN' ? 'Click to Browse Video from Device' : 'डिव्हाइसवरून व्हिडिओ फाईल निवडण्यासाठी येथे क्लिक करा')}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {addForm.type === 'photo'
                            ? (lang === 'EN' ? 'Supports JPG, PNG, WEBP' : 'JPG, PNG, WEBP फोटो फॉरमॅट')
                            : (lang === 'EN' ? 'Supports MP4, WebM, MOV • Uploads to Cloud Storage (Global)' : 'MP4, WebM, MOV • क्लाउड स्टोरेजवर सेव्ह होईल (सर्वांसाठी उपलब्ध)')}
                        </span>
                      </div>
                    </label>

                    {/* Cloud Upload Progress Bar */}
                    {isProcessingMediaFile && uploadProgress !== null && (
                      <div className="space-y-1 bg-black/60 p-2.5 rounded-xl border border-brand-gold/40">
                        <div className="flex justify-between text-[11px] text-brand-gold font-bold">
                          <span>{lang === 'EN' ? 'Uploading Video...' : 'व्हिडिओ अपलोड सुरू आहे...'}</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-brand-gold to-brand-saffron h-full transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {uploadedMediaFileName && (
                      <div className="text-[11px] text-emerald-400 flex items-center justify-between gap-1.5 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                          <span className="font-mono truncate">{uploadedMediaFileName}</span>
                          {uploadedMediaFileSize !== null && (
                            <span className="text-[10px] text-gray-300 font-mono ml-auto">
                              ({formatFileSize(uploadedMediaFileSize)})
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleClearSelectedAddFile}
                          className="text-red-400 hover:text-red-300 text-[10px] px-1.5 py-0.5 rounded border border-red-500/30 hover:bg-red-950/60 cursor-pointer shrink-0 transition-colors"
                        >
                          {lang === 'EN' ? '✕ Remove' : '✕ काढा'}
                        </button>
                      </div>
                    )}

                    {/* Instant Media Preview */}
                    {addForm.url && (
                      <div className="p-2.5 bg-black/60 rounded-xl border border-brand-gold/30">
                        {addForm.type === 'photo' ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={addForm.url}
                              alt="Preview"
                              className="w-20 h-28 object-contain rounded-lg border border-brand-gold shadow bg-black shrink-0 p-1"
                            />
                            <div className="text-[11px] text-gray-300 min-w-0">
                              <span className="text-brand-gold font-bold block">✓ Photo Ready</span>
                              <span className="text-[10px] text-gray-400 truncate block">{uploadedMediaFileName || 'Selected photo'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-brand-gold font-bold block text-[11px]">✓ Video Preview</span>
                            <div className="min-h-[260px] sm:min-h-[320px] max-h-[400px] w-full rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
                              <AmbientVideoPlayer
                                src={addForm.url}
                                controls
                                playsInline
                                containerClassName="w-full h-full"
                                aspectRatioClass="h-full w-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Sub-mode B: Web URL Input */
                  <div>
                    <input
                      type="text"
                      inputMode="url"
                      placeholder={
                        addForm.type === 'photo'
                          ? 'https://example.com/festival-photo.jpg'
                          : 'https://www.youtube.com/watch?v=...'
                      }
                      value={addForm.url}
                      onChange={(e) => setAddForm(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold font-mono text-xs"
                      required
                    />
                    <span className="text-[10px] text-gray-400 block mt-1">
                      {addForm.type === 'photo'
                        ? (lang === 'EN' ? 'Paste any direct image link' : 'कोणत्याही ऑनलाइन फोटोची थेट वेब लिंक टाका')
                        : (lang === 'EN' ? 'Paste YouTube watch link or direct MP4 URL' : 'यूट्यूब लिंक किंवा थेट व्हिडिओ URL टाका')}
                    </span>
                  </div>
                )}
              </div>
            )}

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
                onClick={handleCloseAddModal}
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
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 7. UNIVERSAL EDIT MEDIA MODAL                                             */}
      {/* ========================================================================= */}
      {editingItem && typeof document !== 'undefined' && createPortal(
        <div 
          ref={editModalContainerRef}
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in flex items-center justify-center p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === editModalContainerRef.current) setEditingItem(null);
          }}
        >
          <form 
            onSubmit={handleEditMediaSubmit}
            className="bg-zinc-950 border-2 border-brand-gold/60 rounded-2xl p-5 sm:p-6 w-full max-w-xl space-y-4 shadow-2xl text-xs text-left max-h-[92vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
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
                  onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value as GalleryMediaType, storagePath: null, localVideoId: null }))}
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

            {/* Media Source & URL/File Input for Edit */}
            {editForm.type === 'instagram' ? (
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  {lang === 'EN' ? 'Instagram Reel URL *' : 'इन्स्टाग्राम रील किंवा पोस्ट लिंक *'}
                </label>
                <input
                  type="text"
                  inputMode="url"
                  placeholder="https://www.instagram.com/reel/..."
                  value={editForm.url}
                  onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold font-mono text-xs"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-gray-300 font-semibold">
                    {editForm.type === 'photo'
                      ? (lang === 'EN' ? 'Photo Upload Source *' : 'फोटो निवडण्याचा प्रकार *')
                      : (lang === 'EN' ? 'Video Upload Source *' : 'व्हिडिओ निवडण्याचा प्रकार *')}
                  </label>
                  <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-white/10">
                    <button
                      type="button"
                      onClick={() => setEditUploadSource('device')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        editUploadSource === 'device'
                          ? 'bg-brand-gold text-brand-maroon font-black shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <HardDrive className="h-3 w-3" />
                      <span>{lang === 'EN' ? 'From Device' : 'डिव्हाइसवरून'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditUploadSource('url')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        editUploadSource === 'url'
                          ? 'bg-brand-gold text-brand-maroon font-black shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Globe className="h-3 w-3" />
                      <span>{lang === 'EN' ? 'Web Link / URL' : 'वेब लिंक'}</span>
                    </button>
                  </div>
                </div>

                {editUploadSource === 'device' ? (
                  <div className="space-y-2">
                    <label className="border-2 border-dashed border-brand-gold/40 hover:border-brand-gold bg-black/40 hover:bg-black/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept={editForm.type === 'photo' ? 'image/png,image/jpeg,image/webp,image/jpg' : 'video/mp4,video/webm,video/ogg,video/quicktime,video/*'}
                        onChange={(e) => handleDeviceMediaUpload(e.target.files?.[0], editForm.type, true)}
                        className="hidden"
                      />
                      <div className="h-10 w-10 rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-gold">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-bold text-brand-gold block text-xs">
                          {isProcessingMediaFile
                            ? (uploadProgress !== null
                                ? `${lang === 'EN' ? 'Uploading to Cloud Storage...' : 'क्लाउडवर व्हिडिओ अपलोड होत आहे...'} ${uploadProgress}%`
                                : (lang === 'EN' ? 'Processing File...' : 'नवीन फाईल प्रक्रिया होत आहे...'))
                            : (lang === 'EN' ? 'Click to Browse Replacement File from Device' : 'डिव्हाइसवरून नवीन फाईल बदलण्यासाठी येथे क्लिक करा')}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {editForm.type === 'photo' 
                            ? 'JPG, PNG, WEBP फोटो' 
                            : (lang === 'EN' ? 'MP4, WebM, MOV • Uploads to Cloud Storage (Global)' : 'MP4, WebM, MOV • क्लाउड स्टोरेजवर सेव्ह होईल (सर्वांसाठी उपलब्ध)')}
                        </span>
                      </div>
                    </label>

                    {/* Cloud Upload Progress Bar */}
                    {isProcessingMediaFile && uploadProgress !== null && (
                      <div className="space-y-1 bg-black/60 p-2.5 rounded-xl border border-brand-gold/40">
                        <div className="flex justify-between text-[11px] text-brand-gold font-bold">
                          <span>{lang === 'EN' ? 'Uploading Video...' : 'व्हिडिओ अपलोड सुरू आहे...'}</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-brand-gold to-brand-saffron h-full transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Instant Edit Preview */}
                    {editForm.url && (
                      <div className="p-2.5 bg-black/60 rounded-xl border border-brand-gold/30">
                        {editForm.type === 'photo' ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={editForm.url}
                              alt="Preview"
                              className="w-20 h-28 object-contain rounded-lg border border-brand-gold shadow bg-black shrink-0 p-1"
                            />
                            <div className="text-[11px] text-gray-300 min-w-0">
                              <span className="text-brand-gold font-bold block">✓ Photo Preview</span>
                              <span className="text-[10px] text-gray-400 truncate block">{uploadedMediaFileName || 'Current photo'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-brand-gold font-bold block text-[11px]">✓ Video Preview</span>
                            <div className="min-h-[260px] sm:min-h-[320px] max-h-[400px] w-full rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
                              <AmbientVideoPlayer
                                src={editForm.url}
                                controls
                                playsInline
                                containerClassName="w-full h-full"
                                aspectRatioClass="h-full w-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      inputMode="url"
                      placeholder={
                        editForm.type === 'photo'
                          ? 'https://example.com/festival-photo.jpg'
                          : 'https://www.youtube.com/watch?v=...'
                      }
                      value={editForm.url}
                      onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value, storagePath: null, localVideoId: null }))}
                      className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold font-mono text-xs"
                      required
                    />
                  </div>
                )}
              </div>
            )}

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
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 8. UNIVERSAL DELETE CONFIRMATION MODAL                                    */}
      {/* ========================================================================= */}
      {deletingItem && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            if (!isSubmitting) setDeletingItem(null);
          }}
        >
          <div 
            className="bg-zinc-950 border-2 border-red-500/40 rounded-2xl p-5 sm:p-6 w-full max-w-md space-y-4 shadow-2xl text-left my-auto"
            onClick={(e) => e.stopPropagation()}
          >
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
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 9. HIGH-RES PHOTO LIGHTBOX MODAL                                          */}
      {/* ========================================================================= */}
      {selectedPhoto && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col justify-between p-4 md:p-6 md:pb-12 text-white animate-fade-in font-sans">
          
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

            <div className="relative max-w-[95vw] max-h-[82vh] md:max-h-[88vh] flex items-center justify-center transition-all duration-300 ease-out overflow-auto rounded-lg p-2">
              <img 
                src={selectedPhoto.url} 
                alt={selectedPhoto.titleMR} 
                className="object-contain max-w-full max-h-[82vh] md:max-h-[88vh] transition-transform shadow-2xl rounded drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)]"
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
                  const modalTitle = lang === 'EN' 
                    ? (selectedPhoto.titleEN || selectedPhoto.titleMR || 'Shree Ishwatichi Mata Darshan')
                    : (selectedPhoto.titleMR || selectedPhoto.titleEN || 'श्री इश्वटीची माता पावन दर्शन');
                  void shareToWhatsApp({
                    title: `${modalTitle} (${selectedPhoto.year})`,
                    text: lang === 'EN' ? `Sacred Darshan - Year ${selectedPhoto.year}` : `पावन दर्शन - वर्ष ${selectedPhoto.year}`,
                    url: selectedPhoto.url,
                    lang,
                  });
                }}
                className="bg-green-600/30 text-green-300 border border-green-500/30 px-3 py-1.5 rounded hover:bg-green-600/50 cursor-pointer active:scale-95 transition-all"
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

        </div>,
        document.body
      )}

    </section>
  );
};

export default MasonryGallery;
