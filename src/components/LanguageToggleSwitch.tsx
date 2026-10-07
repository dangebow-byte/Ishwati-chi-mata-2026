/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Languages } from 'lucide-react';

interface LanguageToggleSwitchProps {
  lang: 'EN' | 'MR';
  onToggle: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const LanguageToggleSwitch: React.FC<LanguageToggleSwitchProps> = ({
  lang,
  onToggle,
  size = 'md',
  className = ''
}) => {
  const isEnglish = lang === 'EN';

  return (
    <div
      role="switch"
      aria-checked={isEnglish}
      aria-label={isEnglish ? 'Switch to Marathi (मराठीत बदला)' : 'Switch to English (इंग्रजीत बदला)'}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`relative inline-flex items-center rounded-full bg-black/65 border border-brand-gold/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] p-0.5 sm:p-1 cursor-pointer select-none transition-all duration-300 hover:border-brand-saffron focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold active:scale-95 shrink-0 ${
        size === 'sm' ? 'h-7 sm:h-8' : 'h-8 sm:h-9'
      } ${className}`}
      title={isEnglish ? 'मराठीमध्ये बदला (Switch to Marathi)' : 'Switch to English (इंग्रजी भाषा निवडा)'}
    >
      {/* Sliding Active Pill Background with Smooth Spring Glide Transition */}
      <div
        className={`absolute top-0.5 bottom-0.5 sm:top-1 sm:bottom-1 w-[calc(50%-2px)] sm:w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-[#D4AF37] via-[#FFB84D] to-[#D4AF37] shadow-[0_0_12px_rgba(255,153,51,0.65)] transition-all duration-300 ease-out z-0 pointer-events-none ${
          isEnglish 
            ? 'left-[calc(50%+1px)] sm:left-[calc(50%+2px)]' 
            : 'left-0.5 sm:left-1'
        }`}
      />

      {/* Option 1: Marathi (MR) */}
      <div 
        className={`relative z-10 flex items-center justify-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full font-sans text-[10px] sm:text-xs font-black transition-colors duration-300 ${
          !isEnglish 
            ? 'text-brand-maroon drop-shadow-sm font-extrabold' 
            : 'text-brand-gold/75 hover:text-white font-medium'
        }`}
      >
        <Languages 
          className={`h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-500 ${
            !isEnglish ? 'rotate-0 text-brand-maroon' : 'rotate-180 text-brand-gold/60'
          }`} 
        />
        <span>मराठी</span>
      </div>

      {/* Option 2: English (EN) */}
      <div 
        className={`relative z-10 flex items-center justify-center px-2 sm:px-2.5 py-0.5 rounded-full font-sans text-[10px] sm:text-xs font-black transition-colors duration-300 ${
          isEnglish 
            ? 'text-brand-maroon drop-shadow-sm font-extrabold' 
            : 'text-brand-gold/75 hover:text-white font-medium'
        }`}
      >
        <span>EN</span>
      </div>
    </div>
  );
};
