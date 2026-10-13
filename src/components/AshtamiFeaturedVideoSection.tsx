/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Video, 
  Upload, 
  Youtube, 
  Instagram, 
  HardDrive, 
  Sparkles, 
  RotateCcw, 
  Check, 
  X, 
  Film,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { saveLocalVideoFile, getLocalVideoBlobUrl, formatFileSize } from '../services/localMediaStorage';
import { InstagramVideoEmbed, getInstagramEmbedUrl } from './InstagramVideoEmbed';

export type AshtamiVideoSourceType = 'official' | 'youtube' | 'instagram' | 'local';

export interface AshtamiVideoConfig {
  type: AshtamiVideoSourceType;
  url: string;
  embedUrl?: string;
  title: string;
  titleMarathi: string;
  localVideoId?: string;
  fileName?: string;
  fileSize?: number;
}

const STORAGE_KEY = 'temple_ashtami_featured_video_config';

const DEFAULT_OFFICIAL_CONFIG: AshtamiVideoConfig = {
  type: 'official',
  url: 'https://youtu.be/28TJIom9GFw?si=rTrYi7hPJleZzsEG',
  embedUrl: 'https://www.youtube-nocookie.com/embed/28TJIom9GFw?enablejsapi=1&rel=0&modestbranding=1',
  title: 'Ashtami - Dharmaveer Durga Maha Aarti | Adarsh Shinde',
  titleMarathi: 'अष्टमी - धर्मवीर दुर्गा महाआरती | गायक: आदर्श शिंदे (झी म्युझिक मराठी)'
};

interface AshtamiFeaturedVideoSectionProps {
  lang: 'EN' | 'MR';
  showLyricsToggle?: boolean;
  showLyrics?: boolean;
  onToggleLyrics?: () => void;
  className?: string;
}

export const AshtamiFeaturedVideoSection: React.FC<AshtamiFeaturedVideoSectionProps> = ({
  lang,
  showLyricsToggle = false,
  showLyrics = false,
  onToggleLyrics,
  className = ''
}) => {
  const [config, setConfig] = useState<AshtamiVideoConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.type) return parsed;
      }
    } catch {}
    return DEFAULT_OFFICIAL_CONFIG;
  });

  const [resolvedLocalBlobUrl, setResolvedLocalBlobUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSourceType, setSelectedSourceType] = useState<AshtamiVideoSourceType>(config.type);
  
  // Form states for modal
  const [inputUrl, setInputUrl] = useState('');
  const [inputTitleMR, setInputTitleMR] = useState('');
  const [inputTitleEN, setInputTitleEN] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tempLocalVideo, setTempLocalVideo] = useState<{ id: string; blobUrl: string; name: string; size: number } | null>(null);

  // Restore local video blob URL from IndexedDB on initial mount if local type
  useEffect(() => {
    if (config.type === 'local' && config.localVideoId) {
      getLocalVideoBlobUrl(config.localVideoId).then((blobUrl) => {
        if (blobUrl) {
          setResolvedLocalBlobUrl(blobUrl);
        } else if (config.url && config.url.startsWith('blob:')) {
          setResolvedLocalBlobUrl(config.url);
        }
      });
    }
  }, [config.type, config.localVideoId]);

  // Handle local video file upload from device
  const handleLocalVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setErrorMsg(lang === 'EN' ? 'Please select a valid video file (MP4, WebM, etc.).' : 'कृपया वैध व्हिडिओ फाईल निवडा (MP4, WebM इत्यादी).');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const savedVideo = await saveLocalVideoFile(file);
      setTempLocalVideo(savedVideo);
      if (!inputTitleMR) {
        setInputTitleMR(`डिव्हाइस व्हिडिओ: ${file.name}`);
      }
      if (!inputTitleEN) {
        setInputTitleEN(`Device Video: ${file.name}`);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (lang === 'EN' ? 'Failed to process video file.' : 'व्हिडिओ फाईल प्रक्रिया अयशस्वी झाली.'));
    } finally {
      setIsUploading(false);
    }
  };

  // Convert raw URL to proper embed URL
  const computeEmbedUrl = (type: AshtamiVideoSourceType, rawUrl: string): string | undefined => {
    if (type === 'youtube' || type === 'official') {
      if (rawUrl.includes('youtube.com/watch?v=')) {
        const id = rawUrl.split('v=')[1]?.split('&')[0];
        if (id) return `https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1&rel=0&modestbranding=1`;
      } else if (rawUrl.includes('youtu.be/')) {
        const id = rawUrl.split('youtu.be/')[1]?.split('?')[0];
        if (id) return `https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1&rel=0&modestbranding=1`;
      } else if (rawUrl.includes('youtube.com/embed/')) {
        return rawUrl;
      }
    } else if (type === 'instagram') {
      return getInstagramEmbedUrl(rawUrl);
    }
    return undefined;
  };

  // Save new video configuration
  const handleSaveVideoConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedSourceType === 'official') {
      setConfig(DEFAULT_OFFICIAL_CONFIG);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_OFFICIAL_CONFIG));
      setIsModalOpen(false);
      return;
    }

    if (selectedSourceType === 'local') {
      if (!tempLocalVideo && !config.localVideoId) {
        setErrorMsg(lang === 'EN' ? 'Please select a video file from your device.' : 'कृपया तुमच्या डिव्हाइसवरून व्हिडिओ फाईल निवडा.');
        return;
      }

      const activeLocal = tempLocalVideo || {
        id: config.localVideoId || 'local-vid',
        blobUrl: resolvedLocalBlobUrl || config.url,
        name: config.fileName || 'Local Video',
        size: config.fileSize || 0
      };

      const newConfig: AshtamiVideoConfig = {
        type: 'local',
        url: activeLocal.blobUrl,
        localVideoId: activeLocal.id,
        fileName: activeLocal.name,
        fileSize: activeLocal.size,
        title: inputTitleEN.trim() || activeLocal.name,
        titleMarathi: inputTitleMR.trim() || activeLocal.name
      };

      setResolvedLocalBlobUrl(activeLocal.blobUrl);
      setConfig(newConfig);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      setIsModalOpen(false);
      return;
    }

    // YouTube or Instagram
    const cleanUrl = inputUrl.trim();
    if (!cleanUrl) {
      setErrorMsg(lang === 'EN' ? 'Please enter a valid video link.' : 'कृपया वैध व्हिडिओ लिंक प्रविष्ट करा.');
      return;
    }

    const embedUrl = computeEmbedUrl(selectedSourceType, cleanUrl);

    const newConfig: AshtamiVideoConfig = {
      type: selectedSourceType,
      url: cleanUrl,
      embedUrl,
      title: inputTitleEN.trim() || (selectedSourceType === 'youtube' ? 'YouTube Sacred Video' : 'Instagram Sacred Reel'),
      titleMarathi: inputTitleMR.trim() || (selectedSourceType === 'youtube' ? 'यूट्यूब पावन व्हिडिओ' : 'इन्स्टाग्राम पावन रील')
    };

    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    setIsModalOpen(false);
  };

  // Reset back to Official Aarti
  const handleResetToOfficial = () => {
    setConfig(DEFAULT_OFFICIAL_CONFIG);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_OFFICIAL_CONFIG));
    setResolvedLocalBlobUrl(null);
    setIsModalOpen(false);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      
      {/* Video Source Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-black/60 p-2 sm:p-2.5 rounded-xl border border-brand-gold/30 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
            config.type === 'official'
              ? 'bg-red-600/20 text-red-400 border border-red-500/40'
              : config.type === 'youtube'
              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
              : config.type === 'instagram'
              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {config.type === 'official' && <span>🪔 अधिकृत यूट्यूब (Official)</span>}
            {config.type === 'youtube' && <span>📺 यूट्यूब (YouTube)</span>}
            {config.type === 'instagram' && <span>📱 इन्स्टाग्राम (Instagram)</span>}
            {config.type === 'local' && <span>📁 डिव्हाइस व्हिडिओ (Local Upload)</span>}
          </span>
          <span className="text-[11px] text-gray-300 truncate hidden xs:inline max-w-[200px] sm:max-w-xs font-sans">
            {lang === 'EN' ? config.title : config.titleMarathi}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {config.type !== 'official' && (
            <button
              onClick={handleResetToOfficial}
              className="px-2 py-1 rounded-lg bg-black/50 hover:bg-black/80 text-gray-400 hover:text-brand-gold border border-white/10 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
              title={lang === 'EN' ? 'Reset to default official Ashtami Aarti' : 'मूळ अधिकृत आरतीवर परत जा'}
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">{lang === 'EN' ? 'Reset' : 'पूर्ववत'}</span>
            </button>
          )}

          <button
            onClick={() => {
              setSelectedSourceType(config.type);
              setInputUrl(config.type !== 'official' && config.type !== 'local' ? config.url : '');
              setInputTitleMR(config.titleMarathi || '');
              setInputTitleEN(config.title || '');
              setTempLocalVideo(null);
              setErrorMsg(null);
              setIsModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-sans font-black text-[11px] shadow hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
          >
            <Upload className="h-3 w-3" />
            <span>{lang === 'EN' ? 'Upload / Change Video' : 'व्हिडिओ बदला / अपलोड करा'}</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-brand-gold/60 shadow-[0_4px_25px_rgba(0,0,0,0.8)] bg-black">
        {config.type === 'local' ? (
          /* 1. Local Device Uploaded Video Player */
          resolvedLocalBlobUrl ? (
            <video
              src={resolvedLocalBlobUrl}
              controls
              playsInline
              className="w-full h-full object-contain bg-black"
            >
              Your browser does not support HTML5 video playback.
            </video>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-gray-400 gap-2 bg-zinc-950">
              <Film className="h-8 w-8 text-brand-gold animate-pulse" />
              <p className="text-xs font-bold text-white">
                {lang === 'EN' ? 'Loading local device video...' : 'स्थानिक डिव्हाइस व्हिडिओ लोड होत आहे...'}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-2 px-3 py-1 bg-brand-gold text-brand-maroon rounded-lg text-xs font-bold"
              >
                {lang === 'EN' ? 'Select Video File' : 'व्हिडिओ फाईल निवडा'}
              </button>
            </div>
          )
        ) : config.type === 'instagram' ? (
          /* 2. Embedded Instagram Video */
          <div className="w-full h-full bg-black/90 flex items-center justify-center overflow-y-auto">
            <InstagramVideoEmbed
              url={config.url}
              title={lang === 'EN' ? config.title : config.titleMarathi}
              lang={lang}
              className="w-full h-full"
            />
          </div>
        ) : (
          /* 3. YouTube Video (Official or Custom) */
          <iframe
            src={config.embedUrl || 'https://www.youtube-nocookie.com/embed/28TJIom9GFw?enablejsapi=1&rel=0&modestbranding=1'}
            title={lang === 'EN' ? config.title : config.titleMarathi}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        )}
      </div>

      {/* Sub-status Strip */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 font-sans px-1">
        <span className="flex items-center gap-1.5 text-brand-gold font-bold">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
          <span>
            {config.type === 'official'
              ? (lang === 'EN' ? 'Direct Official YouTube Stream' : 'अधिकृत यूट्यूब पावन महाआरती')
              : config.type === 'local'
              ? (lang === 'EN' ? 'Local Device Video Player' : 'डिव्हाइसवरून अपलोड केलेला व्हिडिओ')
              : config.type === 'instagram'
              ? (lang === 'EN' ? 'Devotional Instagram Reel' : 'इन्स्टाग्राम पावन रील')
              : (lang === 'EN' ? 'Custom YouTube Stream' : 'सानुकूल यूट्यूब पावन व्हिडिओ')}
          </span>
        </span>

        {showLyricsToggle && onToggleLyrics && (
          <button
            onClick={onToggleLyrics}
            className="text-brand-saffron hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>{lang === 'EN' ? 'Aarti Lyrics' : 'आरतीचे बोल'}</span>
            {showLyrics ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: UPLOAD LOCAL VIDEO, SET YOUTUBE OR INSTAGRAM VIDEO                 */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <form
            onSubmit={handleSaveVideoConfig}
            className="bg-zinc-950 border-2 border-brand-gold/60 rounded-2xl p-5 sm:p-6 w-full max-w-lg space-y-4 shadow-2xl text-xs text-left"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-brand-gold font-bold text-sm">
                <Video className="h-4 w-4 text-brand-gold" />
                <span>
                  {lang === 'EN'
                    ? 'Configure Video: Upload Local / YouTube / Instagram'
                    : 'व्हिडिओ निवडा: स्थानिक फाईल / यूट्यूब / इन्स्टाग्राम'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Source Type Selector Grid */}
            <div className="space-y-1.5">
              <label className="block text-gray-300 font-semibold">
                {lang === 'EN' ? 'Select Video Source Type *' : 'व्हिडिओ स्त्रोत प्रकार निवडा *'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSourceType('official')}
                  className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    selectedSourceType === 'official'
                      ? 'bg-red-600/30 text-white border-red-500 ring-1 ring-red-500 font-black'
                      : 'bg-black/50 text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-brand-gold" />
                  <span>{lang === 'EN' ? 'Official Aarti' : 'अधिकृत महाआरती'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSourceType('local')}
                  className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    selectedSourceType === 'local'
                      ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 ring-1 ring-emerald-500 font-black'
                      : 'bg-black/50 text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  <HardDrive className="h-4 w-4 text-emerald-400" />
                  <span>{lang === 'EN' ? 'Device Video' : 'डिव्हाइस व्हिडिओ'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSourceType('youtube')}
                  className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    selectedSourceType === 'youtube'
                      ? 'bg-red-500/20 text-red-300 border-red-500 ring-1 ring-red-500 font-black'
                      : 'bg-black/50 text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  <Youtube className="h-4 w-4 text-red-500" />
                  <span>{lang === 'EN' ? 'YouTube' : 'यूट्यूब'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSourceType('instagram')}
                  className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    selectedSourceType === 'instagram'
                      ? 'bg-pink-500/20 text-pink-300 border-pink-500 ring-1 ring-pink-500 font-black'
                      : 'bg-black/50 text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  <Instagram className="h-4 w-4 text-pink-400" />
                  <span>{lang === 'EN' ? 'Instagram' : 'इन्स्टाग्राम'}</span>
                </button>
              </div>
            </div>

            {/* Input by Source Type */}
            {selectedSourceType === 'official' && (
              <div className="p-3 bg-red-950/40 rounded-xl border border-red-500/30 text-gray-300 space-y-1">
                <span className="font-bold text-brand-gold block">
                  {lang === 'EN' ? 'Official Ashtami Dharmaveer Maha Aarti' : 'अधिकृत अष्टमी धर्मवीर दुर्गा महाआरती'}
                </span>
                <p className="text-[11px] text-gray-400">
                  {lang === 'EN'
                    ? 'Singer: Adarsh Shinde • Zee Music Marathi. Plays official streaming version.'
                    : 'गायक: आदर्श शिंदे • झी म्युझिक मराठी अधिकृत पावन संगीत.'}
                </p>
              </div>
            )}

            {selectedSourceType === 'local' && (
              <div className="space-y-2">
                <label className="block text-gray-300 font-semibold">
                  {lang === 'EN' ? 'Select Video File from Computer / Mobile *' : 'संगणक किंवा मोबाईलवरून व्हिडिओ निवडा *'}
                </label>
                <label className="border-2 border-dashed border-brand-gold/40 hover:border-brand-gold bg-black/40 hover:bg-black/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                    onChange={handleLocalVideoUpload}
                    className="hidden"
                  />
                  <div className="h-10 w-10 rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-gold">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-gold block text-xs">
                      {isUploading
                        ? (lang === 'EN' ? 'Saving video to local storage...' : 'व्हिडिओ स्थानिक साठ्यात सेव्ह होत आहे...')
                        : (lang === 'EN' ? 'Click to Browse Local Video File' : 'डिव्हाइसवरून व्हिडिओ फाईल निवडण्यासाठी क्लिक करा')}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {lang === 'EN'
                        ? 'Supports MP4, WebM, MOV • Stored securely in your browser'
                        : 'MP4, WebM, MOV समर्थित • सुरक्षित स्थानिक ब्राऊझर साठ्यात सेव्ह होईल'}
                    </span>
                  </div>
                </label>

                {(tempLocalVideo || (config.type === 'local' && config.fileName)) && (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30">
                    <Check className="h-4 w-4 shrink-0" />
                    <span className="font-mono truncate">
                      {tempLocalVideo ? tempLocalVideo.name : config.fileName}
                    </span>
                    {(tempLocalVideo?.size || config.fileSize) && (
                      <span className="text-[10px] text-gray-300 font-mono ml-auto">
                        ({formatFileSize(tempLocalVideo?.size || config.fileSize || 0)})
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {(selectedSourceType === 'youtube' || selectedSourceType === 'instagram') && (
              <div className="space-y-1.5">
                <label className="block text-gray-300 font-semibold">
                  {selectedSourceType === 'youtube'
                    ? (lang === 'EN' ? 'YouTube Video URL *' : 'यूट्यूब व्हिडिओ लिंक (YouTube URL) *')
                    : (lang === 'EN' ? 'Instagram Reel / Post URL *' : 'इन्स्टाग्राम रील किंवा पोस्ट लिंक (Instagram URL) *')}
                </label>
                <input
                  type="url"
                  placeholder={
                    selectedSourceType === 'youtube'
                      ? 'https://www.youtube.com/watch?v=28TJIom9GFw'
                      : 'https://www.instagram.com/reel/Cx0sn8AoN7l/'
                  }
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold font-mono text-xs"
                  required
                />
              </div>
            )}

            {/* Custom Titles (Optional) */}
            {selectedSourceType !== 'official' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {lang === 'EN' ? 'Custom Title (Marathi)' : 'व्हिडिओ शीर्षक (मराठी)'}
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. धर्मवीर महाआरती"
                    value={inputTitleMR}
                    onChange={(e) => setInputTitleMR(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    {lang === 'EN' ? 'Custom Title (English)' : 'व्हिडिओ शीर्षक (इंग्रजी)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sacred Maha Aarti"
                    value={inputTitleEN}
                    onChange={(e) => setInputTitleEN(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold text-xs"
                  />
                </div>
              </div>
            )}

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-bold cursor-pointer"
              >
                {lang === 'EN' ? 'Cancel' : 'रद्द करा'}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-black shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {lang === 'EN' ? 'Save & Play' : 'जतन करा व प्ले करा'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
