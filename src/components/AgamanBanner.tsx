import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Sparkles, X, ChevronRight, Eye } from 'lucide-react';
import agamanBannerImg from '../assets/images/agaman_banner_initial_with_real_devi_1791626201136.jpg';

interface AgamanBannerProps {
  lang: 'EN' | 'MR';
  onViewDetails?: () => void;
}

export const AgamanBanner: React.FC<AgamanBannerProps> = ({ lang, onViewDetails }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isDismissed) return null;

  return (
    <>
      {/* Sacred Agaman Sohala Celebration Banner - Positioned right below Menu Bar & above Hero Idol */}
      <section className="relative w-full z-30 bg-gradient-to-r from-[#2A0204] via-[#4A0407] to-[#2A0204] border-b-2 border-brand-gold/60 shadow-[0_4px_25px_rgba(255,153,51,0.25)]">
        {/* Subtle Top Gold Highlight Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-gold/30 via-brand-gold to-brand-gold/30 animate-pulse" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
          <div className="relative overflow-hidden rounded-2xl border border-brand-gold/50 bg-black/60 shadow-2xl backdrop-blur-md">
            
            {/* Clickable Banner Image Container */}
            <div 
              onClick={() => setIsModalOpen(true)}
              className="group relative cursor-pointer overflow-hidden w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/9] max-h-[360px] flex items-center justify-center bg-black/80"
              title={lang === 'EN' ? 'Click to view full 53rd Year Agaman Sohala Banner' : 'श्री इश्वटीची माता ५३ वे वर्ष आगमन सोहळा संपूर्ण बॅनर पहा'}
            >
              <img 
                src={agamanBannerImg} 
                alt="श्री इश्वटीची माता आगमन सोहळा - ५३ वे वर्ष - यंग इश्वटी नवरात्रोत्सव मंडळ"
                className="w-full h-full object-cover sm:object-contain object-center transition-transform duration-700 group-hover:scale-[1.02]"
                loading="eager"
              />

              {/* Gentle gradient overlay on image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {/* Hover Full Screen Badge */}
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/80 hover:bg-brand-maroon text-brand-gold border border-brand-gold/60 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1 shadow-lg transition-all duration-300">
                <Eye className="w-3.5 h-3.5 text-brand-gold" />
                <span>{lang === 'EN' ? 'View Full Banner' : 'मोठ्या आकारात पहा'}</span>
              </div>

              {/* Event Badge on Bottom Left */}
              <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-4 z-10 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="bg-brand-saffron text-brand-maroon font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  {lang === 'EN' ? 'Today Special' : 'आजचा विशेष सोहळा'}
                </span>
                <span className="bg-red-950/90 text-white font-bold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full border border-red-500/50 shadow-md">
                  {lang === 'EN' ? 'Sat 10 Oct • 6:00 PM' : 'शनिवार १० ऑक्टोबर • सायं. ६:००'}
                </span>
                <span className="hidden md:inline-flex bg-black/75 text-amber-200 text-xs px-2.5 py-0.5 rounded-full border border-brand-gold/40">
                  {lang === 'EN' ? 'Bhalchandra Ground, Lalbaug' : 'भालचंद्र मैदान, उदय खातू कारखाना, लालबाग'}
                </span>
              </div>
            </div>

            {/* Quick Action Info Bar beneath the banner graphic */}
            <div className="bg-gradient-to-r from-[#380205] via-[#240101] to-[#380205] px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-t border-brand-gold/30 text-xs text-amber-100">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-bold text-brand-gold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-saffron" />
                  {lang === 'EN' ? '53rd Year Agaman Festival' : '५३ वे वर्ष भव्य आगमन सोहळा'}
                </span>
                <span className="text-gray-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-gold" />
                  {lang === 'EN' ? '6:00 PM Onwards' : 'सायंकाळी ६.०० वाजता'}
                </span>
                <span className="text-gray-300 hidden sm:flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {lang === 'EN' ? 'Lalbaug, Mumbai - 400012' : 'लालबाग, मुंबई - ४०००१२'}
                </span>
                <span className="text-brand-saffron font-semibold hidden lg:inline">
                  {lang === 'EN' ? 'Special Attraction: Fire Beats Musical Group' : 'खास आकर्षण : फायर बिट्स म्युझिकल ग्रुप'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-2.5 py-1 bg-brand-gold/20 hover:bg-brand-gold/30 text-brand-gold border border-brand-gold/50 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>{lang === 'EN' ? 'Event Details' : 'तपशील पहा'}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setIsDismissed(true)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                  title={lang === 'EN' ? 'Hide banner' : 'बॅनर बंद करा'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* High-Definition Fullscreen Modal for Agaman Sohala Banner */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Modal Header */}
          <div 
            className="w-full max-w-5xl flex items-center justify-between py-2 px-3 sm:px-4 bg-brand-maroon/90 border border-brand-gold/40 rounded-t-xl text-white select-none shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg text-brand-gold animate-pulse">✨</span>
              <h3 className="font-bold text-xs sm:text-sm md:text-base text-brand-gold">
                {lang === 'EN'
                  ? 'Young Ishwati Navratrotsav Mandal • 53rd Year Agaman Sohala'
                  : 'यंग इश्वटी नवरात्रोत्सव मंडळ • ५३ वे वर्ष आगमन सोहळा'}
              </h3>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-1 text-gray-300 hover:text-white bg-black/50 hover:bg-black/80 rounded-lg border border-brand-gold/30 transition-all cursor-pointer"
              title={lang === 'EN' ? 'Close' : 'बंद करा'}
            >
              <X className="w-5 h-5 text-brand-gold" />
            </button>
          </div>

          {/* Modal Banner Graphic Body */}
          <div 
            className="w-full max-w-5xl bg-black rounded-b-xl border-x border-b border-brand-gold/40 overflow-hidden shadow-2xl relative flex items-center justify-center max-h-[82vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={agamanBannerImg} 
              alt="Shree Ishwatichi Mata Agaman Sohala Banner"
              className="w-full h-auto max-h-[80vh] object-contain mx-auto"
            />
          </div>

          {/* Modal Action Footer */}
          <div 
            className="w-full max-w-5xl mt-2 flex flex-wrap items-center justify-between text-xs text-amber-200 px-3 py-1.5 bg-black/75 rounded-lg border border-brand-gold/30"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[11px] sm:text-xs">
              {lang === 'EN'
                ? '📍 Bhalchandra Ground, Uday Khatu Karkhana, Lalbaug, Mumbai - 400012 | 6:00 PM'
                : '📍 स्थळ : भालचंद्र मैदान, उदय खातू कारखाना, लालबाग मुंबई - ४०००१२ | सायं. ६:०० वाजता'}
            </span>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-[11px] px-3 py-0.5 bg-brand-gold text-brand-maroon font-bold rounded hover:bg-yellow-400 transition-colors cursor-pointer"
            >
              {lang === 'EN' ? 'Close' : 'बंद करा'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
