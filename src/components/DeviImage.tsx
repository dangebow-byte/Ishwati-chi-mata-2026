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
}

export const DeviImage: React.FC<DeviImageProps> = ({
  alt = 'श्री ईश्वटीची माता अधिकृत दिव्य दर्शन मूर्ती',
  className = '',
  imageClassName = '',
  aspectRatio = 'portrait',
  priority = false,
  withAura = false,
  withFrame = false,
  objectFit = 'cover',
  onClick,
}) => {
  const aspectClass =
    aspectRatio === 'portrait'
      ? 'aspect-[3/4]'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'hero'
      ? 'aspect-[16/9] md:aspect-[21/9]'
      : '';

  const frameClass = withFrame
    ? 'rounded-2xl border-4 border-brand-gold/60 ring-2 ring-brand-gold/25 shadow-2xl p-1 bg-black/40'
    : '';

  const auraClass = withAura
    ? 'drop-shadow-[0_0_25px_rgba(255,153,51,0.65)]'
    : '';

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden inline-block ${aspectClass} ${frameClass} ${auraClass} ${
        onClick ? 'cursor-pointer hover:scale-[1.01] transition-transform' : ''
      } ${className}`}
    >
      <picture className="w-full h-full block">
        {/* Mobile optimized WebP */}
        <source
          media="(max-width: 640px)"
          srcSet={deviMobileWebp}
          type="image/webp"
        />
        {/* High-res WebP for tablets & desktops */}
        <source
          srcSet={deviMainWebp}
          type="image/webp"
        />
        {/* Universal Fallback Image */}
        <img
          src={deviMainJpg}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`w-full h-full object-${objectFit} object-center transition-all duration-500 ${imageClassName}`}
          referrerPolicy="no-referrer"
        />
      </picture>
    </div>
  );
};

export default DeviImage;
