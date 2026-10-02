/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GALLERY_ITEMS } from '../data';
import { Image, Video, ZoomIn, ZoomOut, Share2, ChevronLeft, ChevronRight, X, ExternalLink, Sliders } from 'lucide-react';

interface MasonryGalleryProps {
  lang: 'EN' | 'MR';
}

export const MasonryGallery: React.FC<MasonryGalleryProps> = ({ lang }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<(typeof GALLERY_ITEMS)[0] | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copied, setCopied] = useState(false);

  // Gallery Categories config
  const categories = ['All', 'Mata Darshan', 'Festivals', 'Decorations', 'Community Service'];

  const filteredItems = GALLERY_ITEMS.filter(item => {
    return activeCategory === 'All' || item.category === activeCategory;
  });

  const handleOpenLightbox = (item: (typeof GALLERY_ITEMS)[0]) => {
    setSelectedItem(item);
    setZoomLevel(1);
    setCopied(false);
  };

  const handleNext = () => {
    if (!selectedItem) return;
    const currentIndex = filteredItems.findIndex(x => x.id === selectedItem.id);
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    setSelectedItem(filteredItems[nextIndex]);
    setZoomLevel(1);
    setCopied(false);
  };

  const handlePrev = () => {
    if (!selectedItem) return;
    const currentIndex = filteredItems.findIndex(x => x.id === selectedItem.id);
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedItem(filteredItems[prevIndex]);
    setZoomLevel(1);
    setCopied(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(selectedItem?.url || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-brand-maroon/20 rounded-2xl border border-brand-gold/15 p-6 md:p-8 text-white backdrop-blur-sm shadow-xl space-y-8">
      
      {/* Top section */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-brand-gold text-xs font-mono font-bold uppercase tracking-wider block mb-1">
            🖼️ Vision of Divinity
          </span>
          <h2 className="text-2xl md:text-4xl font-serif font-black text-white">
            {lang === 'EN' ? 'Shree Ishwatichi Mata Grand Album Gallery' : 'श्री ईश्वटीची माता भव्य अल्बम प्रेक्षागृह'}
          </h2>
          <p className="text-xs text-gray-300 mt-1">
            {lang === 'EN' ? 'Click on any sacred photograph to trigger high-fidelity zoom lightboxes & sharing protocols.' : 'देवींचे देखणे रूप, मंदिर सजावट आणि सामाजिक कार्याची बोलकी छायाचित्रे.'}
          </p>
        </div>

        {/* Categories selector ribbon */}
        <div className="flex flex-wrap gap-1.5 bg-black/45 p-1 rounded-lg border border-white/5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                activeCategory === cat
                  ? 'bg-brand-red text-white font-serif tracking-wide shadow border border-brand-gold/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry-Style Responsive Columns Grid */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleOpenLightbox(item)}
            className="break-inside-avoid relative group rounded-xl overflow-hidden border border-white/5 bg-brand-maroon/10 hover:border-brand-gold/45 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 block"
          >
            {/* Sacred emblem badge directly on photo */}
            <div className="absolute top-2.5 left-2.5 z-10 bg-brand-maroon/90 backdrop-blur-sm border border-brand-gold/60 text-brand-gold text-[10px] font-serif font-black px-2 py-0.5 rounded shadow flex items-center gap-1">
              <span>🌸</span>
              <span>श्री ईश्वटीची</span>
            </div>

            {/* Aspect specific tags */}
            <img 
              src={item.url} 
              alt={item.title} 
              className="w-full h-auto object-contain bg-black/40 block" 
              referrerPolicy="no-referrer"
            />
            {/* Absolute Hover details */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <span className="text-[9px] text-brand-saffron uppercase font-mono tracking-widest">{item.category} • श्री ईश्वटीची</span>
              <h4 className="text-xs sm:text-sm font-serif font-black text-white mt-1">
                {lang === 'EN' ? item.title : item.titleMarathi}
              </h4>
              <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 border-t border-white/10 pt-2">
                <span className="flex items-center gap-1">
                  <ZoomIn className="h-3 w-3 text-brand-gold" />
                  {lang === 'EN' ? 'Click to Zoom' : 'मोठे करा'}
                </span>
                <span className="flex items-center gap-1 text-brand-saffron">
                  <Share2 className="h-3 w-3" />
                  {lang === 'EN' ? 'Share' : 'शेअर करा'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simulated Devotee Video Gallery Section */}
      <div className="border-t border-white/5 pt-8 space-y-4">
        <div className="flex items-center gap-2 text-brand-gold font-serif font-bold text-lg">
          <Video className="h-5 w-5 text-brand-saffron animate-pulse" />
          <span>{lang === 'EN' ? 'Shree Ishwatichi Holy Videos & Aarti Hymns' : 'श्री ईश्वटीची भक्तीपर व्हिडिओ आणि महाआरती'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-950 border border-brand-gold/20 flex items-center justify-center">
              <div className="absolute inset-0 bg-cover bg-center brightness-[0.4]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=600')" }} />
              <button 
                onClick={() => alert('Launching high-definition livestream video loop in the above Live Darshan portal!')}
                className="h-12 w-12 rounded-full bg-brand-gold text-brand-maroon flex items-center justify-center cursor-pointer text-xl font-bold animate-pulse hover:scale-110 transition-transform z-10"
              >
                ▶
              </button>
              <span className="absolute bottom-2 right-2 bg-black/80 text-[10px] text-gray-400 px-1.5 py-0.5 rounded font-mono">11:12</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {lang === 'EN' ? 'Shree Ishwatichi Divine Swarna Maha Aarti' : 'श्री ईश्वटीची दिव्य सुवर्ण महाआरती'}
              </h4>
              <p className="text-[11px] text-gray-400 mt-1">
                {lang === 'EN' ? 'High fidelity morning Kakad aarti performed daily inside the sanctum.' : 'श्री ईश्वटीची मातेची दररोज सकाळी साजरी केली जाणारी काकड आरती विधी.'}
              </p>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-950 border border-brand-gold/20 flex items-center justify-center">
              <div className="absolute inset-0 bg-cover bg-center brightness-[0.4]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1561361513-2d000a50f0db?auto=format&fit=crop&q=80&w=600')" }} />
              <button 
                onClick={() => alert('Launching traditional Shobha Yatra video replay loop!')}
                className="h-12 w-12 rounded-full bg-brand-gold text-brand-maroon flex items-center justify-center cursor-pointer text-xl font-bold animate-pulse hover:scale-110 transition-transform z-10"
              >
                ▶
              </button>
              <span className="absolute bottom-2 right-2 bg-black/80 text-[10px] text-gray-400 px-1.5 py-0.5 rounded font-mono">35:40</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {lang === 'EN' ? 'Shree Ishwatichi Annual Rath Yatra Highlights' : 'श्री ईश्वटीची वार्षिक रथयात्रा उत्सव'}
              </h4>
              <p className="text-[11px] text-gray-400 mt-1">
                {lang === 'EN' ? 'Visual snippets showing the grand golden Rath carrying Shree Ishwatichi Mata across lines of devotees.' : 'श्री ईश्वटीची मातेची पालखी व सुवर्ण रथ मिरवणूक सोहळा.'}
              </p>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-950 border border-brand-gold/20 flex items-center justify-center">
              <div className="absolute inset-0 bg-cover bg-center brightness-[0.4]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600')" }} />
              <button 
                onClick={() => alert('Launching social impact documentary loops!')}
                className="h-12 w-12 rounded-full bg-brand-gold text-brand-maroon flex items-center justify-center cursor-pointer text-xl font-bold animate-pulse hover:scale-110 transition-transform z-10"
              >
                ▶
              </button>
              <span className="absolute bottom-2 right-2 bg-black/80 text-[10px] text-gray-400 px-1.5 py-0.5 rounded font-mono">08:15</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {lang === 'EN' ? 'Shree Ishwatichi Mandal Social Welfare Work' : 'श्री ईश्वटीची मंडळ सामाजिक सेवा कार्य'}
              </h4>
              <p className="text-[11px] text-gray-400 mt-1">
                {lang === 'EN' ? 'Footage from health campaigns, free clinics, water distributions, and education programs.' : 'श्री ईश्वटीची मंडळातर्फे आयोजित मोफत आरोग्य तपासणी, औषध व अन्नदान उपक्रम.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX MODAL WITH FULL ZOOM CONTROLS, SHARE, AND NEXT/PREV */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 md:p-6 md:pb-12 text-white animate-fade-in font-sans">
          
          {/* Lightbox Toolbar Top */}
          <div className="flex justify-between items-center bg-black/60 px-4 py-3 rounded-xl border border-white/10">
            <div className="text-left">
              <span className="text-[10px] text-brand-saffron uppercase font-mono font-bold block">{selectedItem.category}</span>
              <h3 className="text-sm md:text-base font-serif font-semibold truncate max-w-xs sm:max-w-md">
                {lang === 'EN' ? selectedItem.title : selectedItem.titleMarathi}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              {/* Zoom Controls */}
              <button 
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                className="p-2 hover:bg-white/10 rounded-lg text-brand-gold cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="font-mono text-xs text-center w-12 select-none">
                {Math.floor(zoomLevel * 100)}%
              </span>
              <button 
                onClick={() => setZoomLevel(prev => Math.min(3.0, prev + 0.25))}
                className="p-2 hover:bg-white/10 rounded-lg text-brand-gold cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>

              {/* Share Control */}
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-white/10 rounded-lg text-brand-saffron ml-2 cursor-pointer flex items-center gap-1.5"
                title="Copy Image URL directly"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">{copied ? 'Copied URL!' : 'Share'}</span>
              </button>

              {/* Close button */}
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-red-500/80 hover:text-white rounded-lg text-gray-400 font-mono text-base border border-white/5 ml-2 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Lightbox Main Presentation Altar (Center body) */}
          <div className="relative flex-1 flex items-center justify-center p-2 relative overflow-hidden">
            {/* navigation indicators left/right */}
            <button
              onClick={handlePrev}
              className="absolute left-2 md:left-6 z-20 p-3 h-12 w-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
            >
              <ChevronLeft className="h-6 w-6 text-brand-gold" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-2 md:right-6 z-20 p-3 h-12 w-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
            >
              <ChevronRight className="h-6 w-6 text-brand-gold" />
            </button>

            {/* Displaying Image with current state scale zoom zoomLevel */}
            <div className="relative max-w-[85vw] max-h-[60vh] md:max-h-[70vh] flex items-center justify-center transition-all duration-300 ease-out overflow-auto rounded-lg">
              <img 
                src={selectedItem.url} 
                alt={selectedItem.title} 
                className="object-contain max-w-full max-h-[60vh] md:max-h-[70vh] transition-transform shadow-2xl rounded"
                style={{ transform: `scale(${zoomLevel})` }}
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 bg-brand-maroon/90 backdrop-blur-md border border-brand-gold/60 px-4 py-1 rounded-full text-brand-gold text-xs font-serif font-black shadow-xl pointer-events-none select-none">
                || श्री ईश्वटीची माता प्रसन्न ||
              </div>
            </div>
          </div>

          {/* Share Links mockup Footer */}
          <div className="bg-black/60 border border-white/15 rounded-xl p-4 text-center max-w-xl mx-auto w-full space-y-2">
            <span className="text-[10px] text-gray-400 block uppercase font-mono">Sacred Share Portal</span>
            <div className="flex justify-center gap-2 text-xs font-semibold">
              <button 
                onClick={() => alert('Mock share to: WhatsApp Group! Status published.')}
                className="bg-green-600/30 text-green-300 border border-green-500/30 px-3 py-1.5 rounded hover:bg-green-600/50 cursor-pointer"
              >
                💬 WhatsApp
              </button>
              <button 
                onClick={() => alert('Mock share to: Facebook Feed! Story published with #ShreeIshwatichiMata')}
                className="bg-blue-600/30 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded hover:bg-blue-600/50 cursor-pointer"
              >
                👥 Facebook
              </button>
              <button 
                onClick={() => alert('Mock tweet sent to X network!')}
                className="bg-sky-600/30 text-sky-300 border border-sky-500/30 px-3 py-1.5 rounded hover:bg-sky-600/50 cursor-pointer"
              >
                𝕏 Twitter / X
              </button>
            </div>
          </div>

        </div>
      )}

    </section>
  );
};
