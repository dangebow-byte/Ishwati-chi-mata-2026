/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Move, 
  Sparkles, 
  Eye, 
  Crown, 
  Flower2 
} from 'lucide-react';
import { DeviImage } from './DeviImage';

interface SacredDarshanZoomViewerProps {
  src?: string;
  alt?: string;
  lang?: 'EN' | 'MR';
  className?: string;
}

export const SacredDarshanZoomViewer: React.FC<SacredDarshanZoomViewerProps> = ({
  src,
  alt = 'श्री इश्वटीची माता संपूर्ण पावन दर्शन (Shree Ishwatichi Mata)',
  lang = 'MR',
  className = ''
}) => {
  // Zoom & Pan state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [activeFocalPoint, setActiveFocalPoint] = useState<string | null>(null);
  const [highlightOverlay, setHighlightOverlay] = useState(false);

  // References for tracking interactions
  const containerRef = useRef<HTMLDivElement>(null);
  const startDragRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });
  const initialPinchDistRef = useRef<number | null>(null);
  const initialPinchScaleRef = useRef<number>(1);
  const lastTapRef = useRef<number>(0);

  // Bounds limit based on current scale
  const clampPosition = useCallback((x: number, y: number, currentScale: number) => {
    if (currentScale <= 1) return { x: 0, y: 0 };
    // Maximum pan boundary proportional to scale expansion
    const maxPanX = (currentScale - 1) * 160;
    const maxPanY = (currentScale - 1) * 240;
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, y))
    };
  }, []);

  // Quick Focal Points (Crown, Divine Face, Lotus Feet, Full View)
  const setFocalTarget = (target: 'crown' | 'face' | 'feet' | 'full') => {
    setActiveFocalPoint(target);
    setHighlightOverlay(true);
    setTimeout(() => setHighlightOverlay(false), 900);

    if (target === 'crown') {
      setScale(2.4);
      setPosition({ x: 0, y: 160 });
    } else if (target === 'face') {
      setScale(2.6);
      setPosition({ x: 0, y: 80 });
    } else if (target === 'feet') {
      setScale(2.3);
      setPosition({ x: 0, y: -170 });
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleZoomIn = () => {
    setActiveFocalPoint(null);
    setScale(prev => {
      const next = Math.min(4.0, prev + 0.5);
      setPosition(pos => clampPosition(pos.x, pos.y, next));
      return next;
    });
  };

  const handleZoomOut = () => {
    setActiveFocalPoint(null);
    setScale(prev => {
      const next = Math.max(1.0, prev - 0.5);
      if (next === 1.0) {
        setPosition({ x: 0, y: 0 });
      } else {
        setPosition(pos => clampPosition(pos.x, pos.y, next));
      }
      return next;
    });
  };

  const handleReset = () => {
    setActiveFocalPoint(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Double-click / Double-tap zoom toggle
  const handleDoubleTap = (clientX: number, clientY: number) => {
    setActiveFocalPoint(null);
    if (scale > 1) {
      handleReset();
    } else {
      setScale(2.5);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const offsetX = (clientX - (rect.left + rect.width / 2)) * -1;
        const offsetY = (clientY - (rect.top + rect.height / 2)) * -1;
        setPosition(clampPosition(offsetX, offsetY, 2.5));
      }
    }
  };

  // Touch Gesture Handlers (Pinch & Pan)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 2 fingers = pinch
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistRef.current = dist;
      initialPinchScaleRef.current = scale;
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      // 1 finger = pan or double-tap check
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        handleDoubleTap(e.touches[0].clientX, e.touches[0].clientY);
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      if (scale > 1) {
        setIsDragging(true);
        startDragRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        startPosRef.current = { ...position };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
      // Pinch scaling
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / initialPinchDistRef.current;
      const nextScale = Math.max(1.0, Math.min(4.0, initialPinchScaleRef.current * factor));
      setScale(nextScale);
      setPosition(pos => clampPosition(pos.x, pos.y, nextScale));
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Pan movement
      const deltaX = e.touches[0].clientX - startDragRef.current.x;
      const deltaY = e.touches[0].clientY - startDragRef.current.y;
      const newPos = clampPosition(
        startPosRef.current.x + deltaX,
        startPosRef.current.y + deltaY,
        scale
      );
      setPosition(newPos);
    }
  };

  const handleTouchEnd = () => {
    initialPinchDistRef.current = null;
    setIsDragging(false);
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1 && e.button === 0) {
      setIsDragging(true);
      startDragRef.current = { x: e.clientX, y: e.clientY };
      startPosRef.current = { ...position };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      const deltaX = e.clientX - startDragRef.current.x;
      const deltaY = e.clientY - startDragRef.current.y;
      const newPos = clampPosition(
        startPosRef.current.x + deltaX,
        startPosRef.current.y + deltaY,
        scale
      );
      setPosition(newPos);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className={`relative flex flex-col items-center justify-center w-full select-none ${className}`}>
      
      {/* Quick Focal Shortcuts Toolbar (Above Idol) */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-2 z-30">
        <span className="text-[10px] sm:text-xs text-brand-saffron font-bold font-sans mr-1 hidden sm:inline">
          {lang === 'EN' ? 'Quick Focus:' : 'सूक्ष्म दर्शन:'}
        </span>
        
        <button
          onClick={() => setFocalTarget('crown')}
          className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-sans font-bold flex items-center gap-1 transition-all cursor-pointer border ${
            activeFocalPoint === 'crown'
              ? 'bg-brand-gold text-brand-maroon border-brand-gold shadow-md'
              : 'bg-black/60 text-brand-gold border-brand-gold/40 hover:bg-brand-gold/20'
          }`}
          title={lang === 'EN' ? 'Zoom to Crown (Mukut)' : 'मुकुट व छत्र दर्शन'}
        >
          <Crown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-saffron" />
          <span>{lang === 'EN' ? 'Crown (मुकुट)' : 'मुकुट'}</span>
        </button>

        <button
          onClick={() => setFocalTarget('face')}
          className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-sans font-bold flex items-center gap-1 transition-all cursor-pointer border ${
            activeFocalPoint === 'face'
              ? 'bg-brand-gold text-brand-maroon border-brand-gold shadow-md'
              : 'bg-black/60 text-brand-gold border-brand-gold/40 hover:bg-brand-gold/20'
          }`}
          title={lang === 'EN' ? 'Zoom to Divine Eyes & Face' : 'नेत्र व मुखकमल दर्शन'}
        >
          <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-saffron" />
          <span>{lang === 'EN' ? 'Divine Face (मुखकमल)' : 'मुखकमल'}</span>
        </button>

        <button
          onClick={() => setFocalTarget('feet')}
          className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-sans font-bold flex items-center gap-1 transition-all cursor-pointer border ${
            activeFocalPoint === 'feet'
              ? 'bg-brand-gold text-brand-maroon border-brand-gold shadow-md'
              : 'bg-black/60 text-brand-gold border-brand-gold/40 hover:bg-brand-gold/20'
          }`}
          title={lang === 'EN' ? 'Zoom to Holy Lotus Feet' : 'चरणकमल व पूजा थाळी'}
        >
          <Flower2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-saffron" />
          <span>{lang === 'EN' ? 'Lotus Feet (चरणकमल)' : 'चरणकमल'}</span>
        </button>

        <button
          onClick={() => setFocalTarget('full')}
          className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-sans font-bold flex items-center gap-1 transition-all cursor-pointer border ${
            scale === 1 && !activeFocalPoint
              ? 'bg-brand-maroon text-brand-gold border-brand-gold/60 shadow-md'
              : 'bg-black/60 text-gray-300 border-white/20 hover:text-white'
          }`}
          title={lang === 'EN' ? 'Reset to Complete View' : 'संपूर्ण मूर्ती दर्शन'}
        >
          <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-gold" />
          <span>{lang === 'EN' ? 'Fit All (संपूर्ण)' : 'संपूर्ण'}</span>
        </button>
      </div>

      {/* Main Interactive Zoomable Container */}
      <div 
        ref={containerRef}
        onDoubleClick={(e) => handleDoubleTap(e.clientX, e.clientY)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full max-w-2xl max-h-[66vh] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#380202] via-black to-[#250101] border-2 sm:border-4 border-brand-gold shadow-[0_0_50px_rgba(255,153,51,0.6)] ${
          scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* Animated Golden Focal Ring Highlight during Focal Point switch */}
        {highlightOverlay && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center animate-ping">
            <div className="w-32 h-32 rounded-full border-4 border-brand-gold/80 shadow-[0_0_30px_rgba(255,153,51,0.9)]" />
          </div>
        )}

        {/* Scalable and Pannable Image Wrapper */}
        <div 
          className="relative w-full h-full flex items-center justify-center transition-transform duration-200 ease-out will-change-transform"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: 'center center'
          }}
        >
          <DeviImage 
            src={src}
            alt={alt}
            aspectRatio="auto"
            objectFit="contain"
            objectPosition="center center"
            priority
            className="max-h-[64vh] w-auto flex items-center justify-center p-2"
            imageClassName="max-h-[64vh] w-auto object-contain mx-auto drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]"
          />
        </div>

        {/* Diya (🪔) pinned at bottom corner outside the scale transform */}
        <div className="absolute bottom-3 right-4 pointer-events-none animate-diya-flicker text-3xl select-none drop-shadow-[0_0_15px_rgba(255,153,51,0.9)] z-20">
          🪔
        </div>

        {/* Helper Guide Badge when Zoomed In */}
        {scale > 1 && (
          <div className="absolute top-3 left-3 z-30 bg-black/80 text-brand-gold border border-brand-gold/50 px-2.5 py-1 rounded-md text-[10px] font-sans font-bold flex items-center gap-1.5 shadow-md pointer-events-none animate-fadeIn">
            <Move className="h-3 w-3 text-brand-saffron animate-pulse" />
            <span>{lang === 'EN' ? 'Drag to pan details' : 'ड्रॅग करून सूक्ष्म दर्शन घ्या'}</span>
          </div>
        )}

        {/* Floating Zoom Controls Bar (Bottom Center) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-black/85 backdrop-blur-md border border-brand-gold/60 p-1 rounded-full shadow-2xl">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="p-1.5 sm:p-2 rounded-full text-brand-gold hover:text-white hover:bg-brand-maroon/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            aria-label="Zoom Out"
            title={lang === 'EN' ? 'Zoom Out (-)' : 'आकार कमी करा'}
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <span className="text-[11px] font-mono font-bold text-white px-2 min-w-[48px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={scale >= 4}
            className="p-1.5 sm:p-2 rounded-full text-brand-gold hover:text-white hover:bg-brand-maroon/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            aria-label="Zoom In"
            title={lang === 'EN' ? 'Zoom In (+)' : 'मोठा आकार (+)'}
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          {scale > 1 && (
            <button
              onClick={handleReset}
              className="p-1.5 sm:p-2 rounded-full text-brand-saffron hover:text-white hover:bg-brand-maroon/80 transition-all cursor-pointer border-l border-brand-gold/30 ml-0.5"
              aria-label="Reset Zoom"
              title={lang === 'EN' ? 'Reset (100%)' : 'मूळ आकार (१००%)'}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Devotee Instruction Hint */}
      <p className="text-[11px] text-gray-400 font-sans mt-2 text-center">
        {lang === 'EN'
          ? '💡 Double-click or pinch with two fingers to zoom • Drag to explore crown, eyes & lotus feet.'
          : '💡 दोन बोटांनी पिंच करा किंवा डबल-टॅप करा • मुकुट, नेत्र व चरणकमलाचे सूक्ष्म दर्शन घेण्यासाठी ड्रॅग करा.'}
      </p>

    </div>
  );
};
