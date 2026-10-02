/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { aartiAudioEngine } from '../utils/aartiAudioEngine';

export interface TempleBellProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'deep' | 'high';
  className?: string;
  showChain?: boolean;
  withSoundwave?: boolean;
  label?: string;
  onClick?: () => void;
}

export const TempleBell: React.FC<TempleBellProps> = ({
  size = 'md',
  variant = 'deep',
  className = '',
  showChain = true,
  withSoundwave = true,
  label,
  onClick,
}) => {
  const [isRinging, setIsRinging] = useState(false);
  const [ringCount, setRingCount] = useState(0);

  const handleRing = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    // Trigger authentic acoustic temple bell sound
    const bellVariant: 'deep' | 'high' = variant === 'high' ? 'high' : 'deep';
    aartiAudioEngine.ringSacredTempleBell(bellVariant);

    // Subtle tactile vibration feedback on supported mobile devices
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([35, 45, 25]);
      } catch (err) {
        // Silently continue if vibration is blocked
      }
    }

    // Trigger visual swinging and soundwave feedback
    setIsRinging(true);
    setRingCount(prev => prev + 1);

    setTimeout(() => {
      setIsRinging(false);
    }, 1200);

    if (onClick) {
      onClick();
    }
  }, [variant, onClick]);

  const sizeDimensions = {
    xs: { width: 22, height: showChain ? 32 : 24 },
    sm: { width: 28, height: showChain ? 42 : 30 },
    md: { width: 36, height: showChain ? 54 : 38 },
    lg: { width: 48, height: showChain ? 72 : 50 },
  }[size];

  return (
    <button
      type="button"
      onClick={handleRing}
      aria-label={label || 'Ring Temple Bell (पवित्र मंदिर घंटानाद)'}
      title={label || 'Click to ring sacred temple bell • पवित्र घंटानाद करा'}
      className={`relative group inline-flex flex-col items-center justify-start cursor-pointer focus:outline-none transition-transform active:scale-95 select-none ${className}`}
    >
      {/* Sound-effect-like Visual Resonance Waves (Pulsing concentric golden aura) */}
      {withSoundwave && isRinging && (
        <>
          <span 
            key={`wave-1-${ringCount}`}
            className="absolute inset-x-0 bottom-1 mx-auto w-8 h-8 rounded-full border-2 border-brand-gold/80 bg-brand-gold/15 pointer-events-none animate-bell-soundwave z-0" 
          />
          <span 
            key={`wave-2-${ringCount}`}
            style={{ animationDelay: '0.15s' }}
            className="absolute inset-x-0 bottom-1 mx-auto w-10 h-10 rounded-full border border-brand-saffron/70 bg-brand-saffron/10 pointer-events-none animate-bell-soundwave z-0" 
          />
          {/* Subtle divine sound spark */}
          <span 
            key={`sparkle-${ringCount}`}
            className="absolute -top-1 -right-2 text-xs text-brand-gold animate-bounce pointer-events-none select-none drop-shadow"
          >
            🔔
          </span>
        </>
      )}

      {/* The Authentic Temple Brass Bell SVG */}
      <div 
        className={`relative z-10 transition-transform ${
          isRinging ? 'animate-bell-ring-active' : 'animate-bell-swing group-hover:scale-110'
        }`}
        style={{ transformOrigin: 'top center' }}
      >
        <svg
          width={sizeDimensions.width}
          height={sizeDimensions.height}
          viewBox="0 0 48 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(255,215,0,0.85)] transition-all"
        >
          <defs>
            {/* Polished Temple Brass Linear Gradient */}
            <linearGradient id={`brassGrad-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7A4B00" />
              <stop offset="25%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#FFF2A3" />
              <stop offset="75%" stopColor="#E5A823" />
              <stop offset="100%" stopColor="#663A00" />
            </linearGradient>

            {/* Brass Clapper Radial Gradient */}
            <radialGradient id={`clapperGrad-${variant}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFF3B0" />
              <stop offset="55%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#4A2600" />
            </radialGradient>

            {/* Sacred Golden Highlight */}
            <linearGradient id={`goldHighlight-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Hanging Brass Chain Links */}
          {showChain && (
            <g id="hanging-chain" stroke={`url(#brassGrad-${variant})`} strokeWidth="2.5" fill="none">
              {/* Top ceiling ring */}
              <ellipse cx="24" cy="4" rx="4.5" ry="3" />
              <line x1="24" y1="7" x2="24" y2="13" strokeWidth="3" strokeLinecap="round" />
              {/* Linked oval chain rings */}
              <ellipse cx="24" cy="14" rx="3.5" ry="2.5" />
              <line x1="24" y1="16.5" x2="24" y2="21" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}

          {/* Top Hanging Loop on Bell Crown */}
          <ellipse 
            cx="24" 
            cy={showChain ? "23" : "7"} 
            rx="5" 
            ry="4" 
            stroke={`url(#brassGrad-${variant})`} 
            strokeWidth="3.2" 
            fill="none" 
          />

          {/* Bell Body Group */}
          <g transform={showChain ? "translate(0, 20)" : "translate(0, 4)"}>
            {/* Clapper / Tongue (visible hanging slightly beneath bell lip) */}
            <g className={isRinging ? 'origin-top animate-bounce' : ''}>
              <line 
                x1="24" 
                y1="22" 
                x2={isRinging ? "21" : "24"} 
                y2="44" 
                stroke="#663A00" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />
              <circle 
                cx={isRinging ? "21" : "24"} 
                cy="44" 
                r="4.2" 
                fill={`url(#clapperGrad-${variant})`} 
                stroke="#4A2600" 
                strokeWidth="1" 
              />
            </g>

            {/* Crown / Top Dome Cap */}
            <path 
              d="M18 8 C18 4, 30 4, 30 8 L32 10 L16 10 Z" 
              fill={`url(#brassGrad-${variant})`} 
            />

            {/* Sacred Ornamental Brass Ring on Upper Dome */}
            <rect 
              x="17" 
              y="10" 
              width="14" 
              height="2.5" 
              rx="1.2" 
              fill={`url(#brassGrad-${variant})`} 
              stroke="#5C3B00" 
              strokeWidth="0.5" 
            />

            {/* Main Bell Body - Authentic Traditional Hindu Temple Ghanta Curved Profile */}
            <path 
              d="M19 12.5 C19 16, 21 21, 16 27 C12 31.5, 9 34, 7 37 C6 38.5, 7.5 40, 10 40 L38 40 C40.5 40, 42 38.5, 41 37 C39 34, 36 31.5, 32 27 C27 21, 29 16, 29 12.5 Z" 
              fill={`url(#brassGrad-${variant})`} 
              stroke="#4A2600" 
              strokeWidth="0.8" 
            />

            {/* Polished Center Specular Highlight Line */}
            <path 
              d="M23 13 C23 18, 24 23, 22 28 C20 32, 19 35, 18 38 L20 38 C21 35, 23 32, 25 28 C27 23, 25 18, 25 13 Z" 
              fill={`url(#goldHighlight-${variant})`} 
              opacity="0.65" 
            />

            {/* Beaded Ornamental Waist Band */}
            <path 
              d="M15 28 C20 30, 28 30, 33 28" 
              stroke="#4A2600" 
              strokeWidth="1.2" 
              fill="none" 
            />

            {/* Lower Flared Heavy Rim Lip */}
            <rect 
              x="7" 
              y="38.5" 
              width="34" 
              height="3.5" 
              rx="1.7" 
              fill={`url(#brassGrad-${variant})`} 
              stroke="#4A2600" 
              strokeWidth="0.8" 
            />
          </g>
        </svg>
      </div>

      {label && (
        <span className="text-[10px] font-serif font-bold text-brand-gold mt-1 group-hover:text-white transition-colors">
          {label}
        </span>
      )}
    </button>
  );
};
export default TempleBell;
