/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import mandalLogo from '../assets/branding/Mandal logo Maroon Transparent BG.png';

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
  srcOverride?: string;
  onClick?: () => void;
}

const SIZE_MAP: Record<LogoSize, string> = {
  xs: 'h-8 w-8',
  sm: 'h-10 w-10 sm:h-12 sm:w-12',
  md: 'h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-18 lg:w-18',
  lg: 'h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28',
  xl: 'h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-36 lg:w-36',
  custom: '',
};

export const SiteLogo: React.FC<SiteLogoProps> = ({
  size = 'md',
  alt = 'श्री यंग ईश्वटी नवरात्रौत्सव मंडळ - अधिकृत बोधचिन्ह (Mandal logo Maroon Transparent BG)',
  className = '',
  withBorder = false,
  withGlow = false,
  priority = false,
  srcOverride,
  onClick,
}) => {
  // Use exact image Mandal logo Maroon Transparent BG.png as requested with no modification
  const imageSource = srcOverride || mandalLogo;

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
        src={imageSource}
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
