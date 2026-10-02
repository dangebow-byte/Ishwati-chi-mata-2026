/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import deviMainWebp from '../assets/devotional/devi-mata-main.webp';
import deviMobileWebp from '../assets/devotional/devi-mata-main-mobile.webp';
import deviMainJpg from '../assets/devotional/devi-mata-main.jpg';

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
  onClick?: () => void;
  src?: string;
}

export const DeviImage: React.FC<DeviImageProps> = ({
  alt = 'श्री ईश्वटीची माता अधिकृत दिव्य दर्शन मूर्ती (Shree Ishwatichi Mata Official Sacred Idol)',
  className = '',
  imageClassName = '',
  aspectRatio = 'portrait',
  priority = false,
  withAura = false,
  withFrame = false,
  objectFit = 'cover',
  onClick,
  src,
}) => {
  const aspectClass =
    aspectRatio === 'portrait'
      ? 'aspect-[854/1280] h-full'
      : aspectRatio === 'square'
      ? 'aspect-square h-full'
      : aspectRatio === 'hero'
      ? 'aspect-[16/9] md:aspect-[21/9]'
      : 'h-full w-full';

  const frameClass = withFrame
    ? 'rounded-2xl border-4 border-brand-gold/60 ring-2 ring-brand-gold/25 shadow-2xl p-1 bg-black/60'
    : '';

  const auraClass = withAura
    ? 'drop-shadow-[0_0_25px_rgba(255,153,51,0.65)]'
    : '';

  // Select optimal source
  const activeImage = src || deviMainJpg;
  const activeWebp = src || deviMainWebp;
  const activeMobileWebp = src || deviMobileWebp;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden flex items-center justify-center bg-black/40 ${aspectClass} ${frameClass} ${auraClass} ${
        onClick ? 'cursor-pointer hover:scale-[1.01] transition-transform' : ''
      } ${className}`}
    >
      <picture className="w-full h-full block overflow-hidden relative z-[1]">
        {/* Mobile optimized WebP */}
        <source
          media="(max-width: 640px)"
          srcSet={activeMobileWebp}
          type="image/webp"
        />
        {/* High-res WebP for tablets & desktops */}
        <source
          srcSet={activeWebp}
          type="image/webp"
        />
        {/* Universal Fallback Image */}
        <img
          src={activeImage}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`w-full h-full object-${objectFit} ${
            objectFit === 'cover' ? 'object-center sm:object-[center_18%]' : 'object-center'
          } transition-all duration-500 ${imageClassName}`}
          style={{ objectFit: objectFit || 'cover' }}
          referrerPolicy="no-referrer"
        />
      </picture>
    </div>
  );
};

export default DeviImage;
