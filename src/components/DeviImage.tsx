/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import deviMainPng from '../assets/devotional/devi-mata-main-Day4-I1-20261014.png';
import deviMainWebp from '../assets/devotional/devi-mata-main-Day4-I1-20261014.webp';
import deviMobileWebp from '../assets/devotional/devi-mata-main-mobile.webp';
import deviMainJpg from '../assets/devotional/devi-mata-main.jpeg';

export type DeviAspectRatio = 'portrait' | 'square' | 'hero' | 'auto';

export interface DeviImageProps {
  alt?: string;
  className?: string;
  imageClassName?: string;
  aspectRatio?: DeviAspectRatio;
  priority?: boolean;
  withAura?: boolean;
  withFrame?: boolean;
  objectFit?: 'cover' | 'contain';
  objectPosition?: string;
  onClick?: () => void;
  onManageClick?: () => void;
  showManageButton?: boolean;
  src?: string;
}

export const DeviImage: React.FC<DeviImageProps> = ({
  alt = 'श्री इश्वटीची माता अधिकृत दिव्य दर्शन मूर्ती (Shree Ishwatichi Mata Official Sacred Idol)',
  className = '',
  imageClassName = '',
  aspectRatio = 'portrait',
  priority = false,
  withAura = false,
  withFrame = false,
  objectFit = 'cover',
  objectPosition,
  onClick,
  onManageClick,
  showManageButton = false,
  src,
}) => {
  const aspectClass =
    aspectRatio === 'portrait'
      ? 'aspect-[854/1280]'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'hero'
      ? 'aspect-[16/9] md:aspect-[21/9]'
      : 'w-full h-full';

  const frameClass = withFrame
    ? 'rounded-2xl border-2 sm:border-4 border-brand-gold/70 ring-2 ring-brand-gold/30 shadow-2xl p-1 bg-black/60'
    : '';

  const auraClass = withAura
    ? 'drop-shadow-[0_0_30px_rgba(255,153,51,0.7)]'
    : '';

  // Select optimal source
  const [imageError, setImageError] = useState(false);

  // Reset error state whenever src prop updates (e.g. user adds or updates idol image)
  React.useEffect(() => {
    setImageError(false);
  }, [src]);

  // If a specific src prop is passed (e.g. heroImagePath), prioritize it;
  // Fall back to bundled Day 4 sacred idol assets only if src fails or is empty
  const activeImage = (!imageError && src) ? src : (deviMainWebp || deviMainPng || deviMainJpg);
  const activeWebp = src ? src : deviMainWebp;
  const activeMobileWebp = src ? src : deviMobileWebp;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden flex items-center justify-center ${aspectClass} ${frameClass} ${auraClass} ${
        onClick ? 'cursor-pointer hover:scale-[1.01] transition-transform' : ''
      } ${className}`}
    >
      <picture className="w-full h-full flex items-center justify-center overflow-hidden relative z-[1]">
        {/* Mobile optimized WebP if not explicitly overridden by custom src */}
        {!src && (
          <source
            media="(max-width: 640px)"
            srcSet={activeMobileWebp}
            type="image/webp"
          />
        )}
        {/* High-res WebP for tablets & desktops if not explicitly overridden */}
        {!src && (
          <source
            srcSet={activeWebp}
            type="image/webp"
          />
        )}
        {/* Universal Fallback Image */}
        <img
          src={activeImage}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => {
            if (!imageError) {
              setImageError(true);
            }
          }}
          className={`transition-all duration-500 ${imageClassName}`}
          style={{ 
            objectFit: objectFit || 'cover',
            objectPosition: objectPosition || (objectFit === 'cover' ? 'center 15%' : 'center center'),
            maxWidth: '100%',
            maxHeight: '100%'
          }}
          referrerPolicy="no-referrer"
        />
      </picture>

      {/* Daily Devi Mata Image Management Button */}
      {(onManageClick || showManageButton) && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onManageClick) onManageClick();
          }}
          className="absolute top-2 left-2 z-20 bg-black/80 hover:bg-brand-maroon text-brand-gold hover:text-white border border-brand-gold/60 text-[10px] font-sans font-bold px-2 py-1 rounded-md shadow-lg backdrop-blur-md flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
          title="दैनिक दर्शन फोटो जोडा / बदला (Add/Edit Daily Image)"
        >
          <span>📸</span>
          <span>फोटो बदला / जोडा</span>
        </button>
      )}
    </div>
  );
};

export default DeviImage;
