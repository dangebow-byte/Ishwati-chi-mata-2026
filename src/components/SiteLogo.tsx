/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import logoTransparentPng from '../assets/branding/ishwati-mata-mandal-logo-transparent.png';
import logoFullPng from '../assets/branding/ishwati-mata-mandal-logo.png';
import logoWhitePng from '../assets/branding/ishwati-mata-mandal-logo-white.png';
import logoIconPng from '../assets/branding/ishwati-mata-mandal-icon.png';
import logoSvg from '../assets/branding/ishwati-mata-mandal-logo.svg';
import logoTransparentSvg from '../assets/branding/ishwati-mata-mandal-logo-transparent.svg';
import logoWhiteSvg from '../assets/branding/ishwati-mata-mandal-logo-white.svg';

export type LogoVariant = 'transparent' | 'full' | 'white' | 'icon' | 'vector';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';

export interface SiteLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  compact?: boolean;
  format?: 'svg' | 'png';
  alt?: string;
  className?: string;
  withBorder?: boolean;
  withGlow?: boolean;
  priority?: boolean;
  onClick?: () => void;
}

const SIZE_MAP: Record<LogoSize, string> = {
  xs: 'h-8 w-8',
  sm: 'h-10 w-10 sm:h-12 sm:w-12',
  md: 'h-14 w-14 sm:h-16 sm:w-16',
  lg: 'h-20 w-20 sm:h-24 sm:w-24',
  xl: 'h-28 w-28 sm:h-32 sm:w-32',
  custom: '',
};

export const SiteLogo: React.FC<SiteLogoProps> = ({
  variant = 'transparent',
  size = 'md',
  compact = false,
  format = 'svg',
  alt = 'श्री ईश्वटीची माता मंडळ अधिकृत बोधचिन्ह',
  className = '',
  withBorder = false,
  withGlow = false,
  priority = false,
  onClick,
}) => {
  // Select source image based on variant, compact flag, and preferred format
  const isSvg = format === 'svg';

  let src = isSvg ? logoTransparentSvg : logoTransparentPng;
  if (compact || variant === 'icon') {
    src = logoIconPng;
  } else if (variant === 'white') {
    src = isSvg ? logoWhiteSvg : logoWhitePng;
  } else if (variant === 'full') {
    src = isSvg ? logoSvg : logoFullPng;
  } else if (variant === 'vector') {
    src = logoTransparentSvg;
  }

  const sizeClasses = SIZE_MAP[size];
  const borderClasses = withBorder
    ? 'rounded-full border-2 border-brand-gold ring-2 ring-brand-gold/30 shadow-lg'
    : '';
  const glowClasses = withGlow ? 'drop-shadow-[0_0_12px_rgba(212,175,55,0.6)]' : '';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center shrink-0 select-none ${
        onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''
      } ${className}`}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`${sizeClasses} aspect-square object-contain ${borderClasses} ${glowClasses} transition-all duration-300`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default SiteLogo;
