/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Instagram, ExternalLink, Copy, Check, Share2, Volume2, Sparkles } from 'lucide-react';
import { shareToWhatsApp } from '../utils/shareUtils';

export interface InstagramVideoEmbedProps {
  url: string;
  title?: string;
  caption?: string;
  authorHandle?: string;
  establishedYear?: string;
  lang?: 'EN' | 'MR';
  className?: string;
  date?: string;
}

/**
 * Extracts the canonical Instagram shortcode/ID from any post or reel URL.
 * Handles formats:
 * - https://www.instagram.com/reel/Cx0sn8AoN7l/
 * - https://www.instagram.com/reel/Cx0sn8AoN7l/?stkn=MTAzcXJldTZpdm15ag==
 * - https://www.instagram.com/p/Cx0sn8AoN7l/
 * - https://www.instagram.com/tv/Cx0sn8AoN7l/
 */
export function extractInstagramShortcode(rawUrl: string): string | null {
  if (!rawUrl) return null;
  const match = rawUrl.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/i);
  return match && match[1] ? match[1] : null;
}

/**
 * Converts any Instagram URL to a clean embed iframe URL.
 */
export function getInstagramEmbedUrl(rawUrl: string): string {
  const code = extractInstagramShortcode(rawUrl);
  if (code) {
    return `https://www.instagram.com/reel/${code}/embed`;
  }
  return rawUrl.includes('/embed') ? rawUrl : `${rawUrl.replace(/\/?$/, '')}/embed`;
}

export const InstagramVideoEmbed: React.FC<InstagramVideoEmbedProps> = ({
  url,
  title,
  caption,
  authorHandle = '@ishwatichi_mata',
  establishedYear = '१९७४',
  lang = 'MR',
  className = '',
  date
}) => {
  const [copied, setCopied] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const embedUrl = getInstagramEmbedUrl(url);
  const shortcode = extractInstagramShortcode(url);
  const canonicalUrl = shortcode ? `https://www.instagram.com/reel/${shortcode}/` : url;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(canonicalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const videoTitle = title || authorHandle || 'Devotional Instagram Reel';
    const textDesc = lang === 'EN'
      ? `Watch official Navratri video reel: ${videoTitle}`
      : `मंडळाचा अधिकृत नवरात्रौत्सव व्हिडिओ रील नक्की पहा: ${videoTitle}`;
    
    void shareToWhatsApp({
      title: videoTitle,
      text: textDesc,
      url: canonicalUrl,
      lang,
    });
  };

  return (
    <div className={`flex flex-col bg-zinc-950 border border-brand-gold/40 rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      
      {/* Top Header Card with Official Instagram Badge */}
      <div className="bg-gradient-to-r from-brand-maroon/70 via-black/80 to-purple-950/60 p-3.5 border-b border-brand-gold/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-full p-0.5 bg-gradient-to-tr from-yellow-500 via-rose-500 to-purple-600 shrink-0 shadow-md">
            <div className="h-full w-full rounded-full bg-brand-maroon flex items-center justify-center text-brand-gold font-bold text-xs">
              ॐ
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-bold text-white text-xs truncate">
                {authorHandle}
              </span>
              <span className="text-sky-400 text-[10px]" title="Verified Mandal">✓</span>
            </div>
            <span className="text-[10px] text-brand-gold/90 font-mono block truncate">
              श्री यंग ईश्वटी नवरात्रौत्सव मंडळ • स्थापना {establishedYear}
            </span>
          </div>
        </div>

        <a
          href={canonicalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/20 transition-all flex items-center gap-1 cursor-pointer"
        >
          <Instagram className="h-3 w-3 text-pink-400" />
          <span>{lang === 'EN' ? 'View' : 'पहा'}</span>
          <ExternalLink className="h-2.5 w-2.5 opacity-70" />
        </a>
      </div>

      {/* Main Responsive Iframe Player Container */}
      <div className="relative w-full aspect-[9/16] min-h-[520px] sm:min-h-[580px] max-h-[680px] bg-black flex items-center justify-center overflow-hidden">
        
        {/* Loading placeholder skeleton */}
        {!hasLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 z-0 animate-pulse bg-zinc-900">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-yellow-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
              <Instagram className="h-6 w-6" />
            </div>
            <p className="text-xs text-brand-gold font-medium">
              {lang === 'EN' ? 'Loading Official Instagram Video Reel...' : 'अधिकृत इंस्टाग्राम व्हिडिओ रील लोड होत आहे...'}
            </p>
          </div>
        )}

        <iframe
          src={embedUrl}
          onLoad={() => setHasLoaded(true)}
          className="w-full h-full bg-black border-0 block z-10"
          frameBorder="0"
          scrolling="no"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          title={title || 'Instagram Video Reel'}
        />
      </div>

      {/* Audio Tip Hint Bar */}
      <div className="bg-black/90 border-t border-brand-gold/20 px-3 py-1.5 text-[10px] text-gray-300 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-brand-gold font-mono">
          <Volume2 className="h-3 w-3 shrink-0" />
          <span>{lang === 'EN' ? 'Tap video & unmute speaker icon' : 'व्हिडिओ सुरू करून स्पीकर चिन्हावर क्लिक करा'}</span>
        </span>
        {date && <span className="text-gray-400 font-mono text-[9px]">{date}</span>}
      </div>

      {/* Title & Caption Summary (if provided) */}
      {(title || caption) && (
        <div className="p-3 bg-brand-maroon/20 border-t border-white/5 space-y-1 text-left">
          {title && (
            <h4 className="text-xs font-bold text-white line-clamp-2">
              {title}
            </h4>
          )}
          {caption && (
            <p className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed">
              {caption}
            </p>
          )}
        </div>
      )}

      {/* Quick Action Footer Controls */}
      <div className="p-2.5 bg-black/80 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] font-bold">
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-brand-gold border border-brand-gold/30 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-300">{lang === 'EN' ? 'Copied' : 'कॉपी झाले'}</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>{lang === 'EN' ? 'Copy Link' : 'लिंक कॉपी'}</span>
            </>
          )}
        </button>

        <button
          onClick={handleShareWhatsApp}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-green-700/80 hover:bg-green-600 text-white transition-all cursor-pointer shadow"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>{lang === 'EN' ? 'WhatsApp' : 'शेअर करा'}</span>
        </button>
      </div>

    </div>
  );
};
