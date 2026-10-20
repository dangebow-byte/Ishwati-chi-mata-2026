/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Image as ImageIcon, RotateCcw, Save, CheckCircle, AlertCircle, 
  Sparkles, Globe, HardDrive, RefreshCw, Eye, Sliders, Type, Tag
} from 'lucide-react';
import { 
  SiteBrandingConfig, 
  HeaderTitleConfig, 
  DEFAULT_BRANDING_CONFIG, 
  DEFAULT_HEADER_CONFIG,
  subscribeBranding,
  subscribeHeaderConfig,
  saveBranding,
  saveHeaderConfig,
  resetBrandingToDefault,
  resetHeaderConfigToDefault,
  getCachedBranding,
  getCachedHeaderConfig
} from '../../services/brandingService';
import { uploadMediaToCloudStorage } from '../../services/cloudMediaStorage';
import { formatFileSize } from '../../services/localMediaStorage';
import { SiteLogo } from '../SiteLogo';

interface LogoAndHeaderCrudTabProps {
  lang: 'EN' | 'MR';
}

export const LogoAndHeaderCrudTab: React.FC<LogoAndHeaderCrudTabProps> = ({ lang }) => {
  // Real-time branding and header states
  const [branding, setBranding] = useState<SiteBrandingConfig>(getCachedBranding());
  const [headerConfig, setHeaderConfig] = useState<HeaderTitleConfig>(getCachedHeaderConfig());

  // Form states for Logo
  const [logoSource, setLogoSource] = useState<'upload' | 'url'>('upload');
  const [logoUrlInput, setLogoUrlInput] = useState(branding.logoUrl || '');
  const [logoAltMR, setLogoAltMR] = useState(branding.logoAltMR || '');
  const [logoAltEN, setLogoAltEN] = useState(branding.logoAltEN || '');
  const [logoWidth, setLogoWidth] = useState<number>(branding.logoWidth || 80);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoFilePreview, setLogoFilePreview] = useState<string | null>(null);
  const [isLogoDragging, setIsLogoDragging] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [logoUploadProgress, setLogoUploadProgress] = useState(0);

  // Form states for Header
  const [titleMR, setTitleMR] = useState(headerConfig.titleMR || '');
  const [titleEN, setTitleEN] = useState(headerConfig.titleEN || '');
  const [badgeMR, setBadgeMR] = useState(headerConfig.badgeMR || '');
  const [badgeEN, setBadgeEN] = useState(headerConfig.badgeEN || '');
  const [subtitleMR, setSubtitleMR] = useState(headerConfig.subtitleMR || '');
  const [subtitleEN, setSubtitleEN] = useState(headerConfig.subtitleEN || '');
  const [invocationMR, setInvocationMR] = useState(headerConfig.invocationMR || '');
  const [invocationEN, setInvocationEN] = useState(headerConfig.invocationEN || '');

  // Operation status feedback
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [isSavingHeader, setIsSavingHeader] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Subscribe to real-time changes
  useEffect(() => {
    const unsubBranding = subscribeBranding((config) => {
      setBranding(config);
      setLogoUrlInput(config.logoUrl || '');
      setLogoAltMR(config.logoAltMR || '');
      setLogoAltEN(config.logoAltEN || '');
      setLogoWidth(config.logoWidth || 80);
    });

    const unsubHeader = subscribeHeaderConfig((config) => {
      setHeaderConfig(config);
      setTitleMR(config.titleMR || '');
      setTitleEN(config.titleEN || '');
      setBadgeMR(config.badgeMR || '');
      setBadgeEN(config.badgeEN || '');
      setSubtitleMR(config.subtitleMR || '');
      setSubtitleEN(config.subtitleEN || '');
      setInvocationMR(config.invocationMR || '');
      setInvocationEN(config.invocationEN || '');
    });

    return () => {
      unsubBranding();
      unsubHeader();
    };
  }, []);

  const clearMessages = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleProcessLogoFile = (file: File) => {
    if (!file) return;

    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isImage = file.type.startsWith('image/') || (ext && ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext));

    if (!isImage) {
      setErrorMsg(
        lang === 'EN'
          ? 'Unsupported file type. Please upload a PNG, JPG, WebP, or SVG logo.'
          : 'अवैध फाइल स्वरूप. कृपया PNG, JPG, WebP किंवा SVG बोधचिन्ह अपलोड करा.'
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(
        lang === 'EN'
          ? 'File size exceeds 10MB. Please upload a smaller logo image.'
          : 'फाइलचा आकार १० MB पेक्षा जास्त आहे. कृपया लहान आकाराची प्रतिमा निवडा.'
      );
      return;
    }

    setSelectedLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLogoFilePreview(objectUrl);
    setErrorMsg(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessLogoFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsLogoDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsLogoDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsLogoDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessLogoFile(file);
  };

  const handleSaveLogo = async () => {
    clearMessages();
    setIsSavingBranding(true);

    try {
      let finalUrl = branding.logoUrl;
      let finalStoragePath = branding.storagePath || '';
      let isCustom = branding.isCustomLogo;

      if (logoSource === 'upload' && selectedLogoFile) {
        setIsLogoUploading(true);
        setLogoUploadProgress(10);
        try {
          const uploadRes = await uploadMediaToCloudStorage(
            selectedLogoFile,
            'site_branding',
            (progress) => setLogoUploadProgress(progress)
          );
          finalUrl = uploadRes.url;
          finalStoragePath = uploadRes.storagePath;
          isCustom = true;
        } catch (uploadErr) {
          console.warn('Storage upload error, using local data URL fallback:', uploadErr);
          // Fallback to Data URL
          const reader = new FileReader();
          finalUrl = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(selectedLogoFile);
          });
          isCustom = true;
        } finally {
          setIsLogoUploading(false);
        }
      } else if (logoSource === 'url' && logoUrlInput.trim()) {
        finalUrl = logoUrlInput.trim();
        isCustom = true;
      }

      await saveBranding({
        logoUrl: finalUrl,
        logoAltMR: logoAltMR.trim() || DEFAULT_BRANDING_CONFIG.logoAltMR,
        logoAltEN: logoAltEN.trim() || DEFAULT_BRANDING_CONFIG.logoAltEN,
        logoWidth: Number(logoWidth) || 80,
        storagePath: finalStoragePath,
        isCustomLogo: isCustom
      });

      setSelectedLogoFile(null);
      setLogoFilePreview(null);
      setSuccessMsg(
        lang === 'EN'
          ? 'Official Mandal Logo branding updated successfully!'
          : 'मंडळाचे अधिकृत बोधचिन्ह यशस्वीरित्या अद्यतनित केले गेले!'
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update logo branding.');
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleResetLogo = async () => {
    if (!window.confirm(
      lang === 'EN'
        ? 'Are you sure you want to restore the authentic default Mandal logo?'
        : 'तुम्हाला खात्री आहे का की मंडळाचे मूळ अधिकृत बोधचिन्ह पुनर्संचयित करायचे आहे?'
    )) {
      return;
    }

    clearMessages();
    setIsSavingBranding(true);
    try {
      await resetBrandingToDefault();
      setSelectedLogoFile(null);
      setLogoFilePreview(null);
      setSuccessMsg(
        lang === 'EN'
          ? 'Mandal Logo reset to authentic official design!'
          : 'बोधचिन्ह मूळ अधिकृत स्वरूपात पुनर्संचयित करण्यात आले!'
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset logo.');
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleSaveHeader = async () => {
    clearMessages();
    setIsSavingHeader(true);

    try {
      await saveHeaderConfig({
        titleMR: titleMR.trim() || DEFAULT_HEADER_CONFIG.titleMR,
        titleEN: titleEN.trim() || DEFAULT_HEADER_CONFIG.titleEN,
        badgeMR: badgeMR.trim() || DEFAULT_HEADER_CONFIG.badgeMR,
        badgeEN: badgeEN.trim() || DEFAULT_HEADER_CONFIG.badgeEN,
        subtitleMR: subtitleMR.trim() || DEFAULT_HEADER_CONFIG.subtitleMR,
        subtitleEN: subtitleEN.trim() || DEFAULT_HEADER_CONFIG.subtitleEN,
        invocationMR: invocationMR.trim() || DEFAULT_HEADER_CONFIG.invocationMR,
        invocationEN: invocationEN.trim() || DEFAULT_HEADER_CONFIG.invocationEN
      });

      setSuccessMsg(
        lang === 'EN'
          ? 'Header Titles, Invocations, and Trust Badges updated live!'
          : 'शीर्षक, पावन आवाहन आणि देवस्थान टॅग थेट अद्यतनित केले गेले!'
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update header configuration.');
    } finally {
      setIsSavingHeader(false);
    }
  };

  const handleResetHeader = async () => {
    if (!window.confirm(
      lang === 'EN'
        ? 'Reset Header titles to authentic defaults?'
        : 'शीर्षक आणि आवाहन मूळ अधिकृत स्वरूपात पुनर्संचयित करायचे का?'
    )) {
      return;
    }

    clearMessages();
    setIsSavingHeader(true);
    try {
      await resetHeaderConfigToDefault();
      setSuccessMsg(
        lang === 'EN'
          ? 'Header titles reset to authentic defaults!'
          : 'शीर्षक मूळ अधिकृत स्वरूपात पुनर्संचयित झाले!'
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset header configuration.');
    } finally {
      setIsSavingHeader(false);
    }
  };

  const currentDisplayLogo = logoFilePreview || (logoSource === 'url' && logoUrlInput ? logoUrlInput : branding.logoUrl);

  return (
    <div className="space-y-8 text-xs font-sans">
      
      {/* Header Feedback Alerts */}
      {successMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 p-3.5 rounded-xl flex items-center justify-between gap-2 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white font-black">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-950/80 border border-red-500/50 text-red-200 p-3.5 rounded-xl flex items-center justify-between gap-2 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span className="font-bold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white font-black">✕</button>
        </div>
      )}

      {/* SECTION 1: OFFICIAL MANDAL LOGO (CRUD) */}
      <div className="bg-black/40 border border-brand-gold/30 rounded-2xl p-5 md:p-6 space-y-6">
        
        {/* Title & Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-brand-gold" />
              <h3 className="text-base sm:text-lg font-bold text-white">
                {lang === 'EN' ? '1. Official Mandal Logo Management (CRUD)' : '१. मंडळाचे अधिकृत बोधचिन्ह व्यवस्थापन (CRUD)'}
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                branding.isCustomLogo 
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/40' 
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
              }`}>
                {branding.isCustomLogo ? (lang === 'EN' ? 'Custom Logo Active' : 'कस्टम लोगो सक्रिय') : (lang === 'EN' ? 'Authentic Default' : 'मूळ अधिकृत बोधचिन्ह')}
              </span>
            </div>
            <p className="text-gray-400 mt-1 text-[11px] leading-relaxed">
              {lang === 'EN'
                ? 'Upload official transparent PNG/SVG logo from your device, configure dimensions, update accessible alt descriptions, or reset back to authentic emblem.'
                : 'डिव्हाइसवरून नवीन पारदर्शक PNG/SVG लोगो अपलोड करा, आकार नियंत्रित करा, किंवा मूळ अधिकृत बोधचिन्ह पूर्ववत करा.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetLogo}
              disabled={isSavingBranding}
              className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-500/40 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow disabled:opacity-50"
              title={lang === 'EN' ? 'Restore authentic default Mandal logo' : 'मूळ अधिकृत लोगो पूर्ववत करा'}
            >
              <RotateCcw className="h-3.5 w-3.5 text-red-300" />
              <span>{lang === 'EN' ? 'Reset to Default' : 'मूळ लोगो पूर्ववत करा'}</span>
            </button>
            <button
              type="button"
              onClick={handleSaveLogo}
              disabled={isSavingBranding || isLogoUploading}
              className="px-4 py-1.5 bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-bold rounded-xl hover:opacity-95 transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSavingBranding ? (lang === 'EN' ? 'Saving...' : 'जतन करत आहे...') : (lang === 'EN' ? 'Save Logo' : 'लोगो जतन करा')}</span>
            </button>
          </div>
        </div>

        {/* Live Logo Preview Box */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Logo Visual Preview Box */}
          <div className="bg-zinc-950/90 border-2 border-brand-gold/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
            <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider font-bold">
              {lang === 'EN' ? 'Live Logo Preview' : 'थेट बोधचिन्ह पूर्वावलोकन'}
            </span>
            
            {/* Checkerboard transparency grid background */}
            <div 
              className="p-4 rounded-xl border border-white/10 flex items-center justify-center min-h-[140px] w-full"
              style={{
                backgroundImage: 'linear-gradient(45deg, #18181b 25%, transparent 25%), linear-gradient(-45deg, #18181b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #18181b 75%), linear-gradient(-45deg, transparent 75%, #18181b 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                backgroundColor: '#09090b'
              }}
            >
              <img
                src={currentDisplayLogo}
                alt={logoAltMR || 'Mandal Logo'}
                className="object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] transition-all duration-300"
                style={{ width: `${logoWidth}px`, maxHeight: '120px' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_BRANDING_CONFIG.logoUrl;
                }}
              />
            </div>

            <div className="text-[11px] text-brand-gold font-mono">
              <span>{lang === 'EN' ? 'Width' : 'रुंदी'}: <strong>{logoWidth}px</strong></span>
            </div>
          </div>

          {/* Logo Upload & Controls Inputs */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Source Mode Toggle */}
            <div className="flex items-center gap-2 p-1 bg-black/60 rounded-xl border border-white/10 w-fit">
              <button
                type="button"
                onClick={() => setLogoSource('upload')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  logoSource === 'upload' ? 'bg-brand-gold text-brand-maroon shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <HardDrive className="h-3.5 w-3.5" />
                <span>{lang === 'EN' ? 'Upload from Device' : 'डिव्हाइसवरून अपलोड करा'}</span>
              </button>
              <button
                type="button"
                onClick={() => setLogoSource('url')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  logoSource === 'url' ? 'bg-brand-gold text-brand-maroon shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{lang === 'EN' ? 'Direct Image Web URL' : 'थेट वेब URL वापरा'}</span>
              </button>
            </div>

            {/* Upload Area */}
            {logoSource === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                    isLogoDragging
                      ? 'border-brand-gold bg-brand-gold/15 scale-[1.01]'
                      : 'border-white/20 hover:border-brand-gold/60 bg-black/40 hover:bg-black/60'
                  }`}
                >
                  <Upload className={`h-6 w-6 ${isLogoDragging ? 'text-brand-gold animate-bounce' : 'text-gray-400'}`} />
                  <div>
                    <span className="font-bold text-white text-xs block">
                      {selectedLogoFile ? selectedLogoFile.name : (lang === 'EN' ? 'Click or Drag & Drop new Logo from Device' : 'डिव्हाइसवरून नवीन लोगो निवडण्यासाठी क्लिक किंवा ड्रॅग करा')}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {selectedLogoFile 
                        ? `${formatFileSize(selectedLogoFile.size)} • Ready to Save` 
                        : (lang === 'EN' ? 'Recommended: Transparent PNG, SVG or WebP • Max 10MB' : 'शिफारस: पारदर्शक PNG, SVG किंवा WebP • कमाल १० MB')}
                    </span>
                  </div>
                </div>

                {isLogoUploading && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[10px] text-brand-gold">
                      <span>{lang === 'EN' ? 'Uploading Logo...' : 'बोधचिन्ह अपलोड होत आहे...'}</span>
                      <span>{logoUploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-brand-gold/30">
                      <div className="h-full bg-brand-gold transition-all duration-300" style={{ width: `${logoUploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-gray-300 font-bold block">
                  {lang === 'EN' ? 'Public Logo Web URL' : 'बोधचिन्ह थेट वेब लिंक (URL)'}
                </label>
                <input
                  type="url"
                  value={logoUrlInput}
                  onChange={(e) => setLogoUrlInput(e.target.value)}
                  placeholder="https://.../mandal-logo.png"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold font-mono text-xs"
                />
              </div>
            )}

            {/* Logo Settings Row: Width Slider & Alt Texts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-gray-300 font-bold flex items-center justify-between">
                  <span>{lang === 'EN' ? 'Logo Display Width' : 'बोधचिन्ह रुंदी (पिक्सेल)'}</span>
                  <span className="text-brand-gold font-mono">{logoWidth}px</span>
                </label>
                <input
                  type="range"
                  min="40"
                  max="140"
                  step="2"
                  value={logoWidth}
                  onChange={(e) => setLogoWidth(Number(e.target.value))}
                  className="w-full accent-brand-gold cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 font-bold block">
                  {lang === 'EN' ? 'Marathi Alt Text (बोधचिन्ह वर्णन)' : 'मराठी बोधचिन्ह वर्णन (Alt Text)'}
                </label>
                <input
                  type="text"
                  value={logoAltMR}
                  onChange={(e) => setLogoAltMR(e.target.value)}
                  placeholder="श्री यंग ईश्वटी नवरात्रौत्सव मंडळ - अधिकृत बोधचिन्ह"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-300 font-bold block">
                {lang === 'EN' ? 'English Alt Text (Accessible Image Label)' : 'इंग्रजी बोधचिन्ह वर्णन (English Alt Text)'}
              </label>
              <input
                type="text"
                value={logoAltEN}
                onChange={(e) => setLogoAltEN(e.target.value)}
                placeholder="Shree Young Ishwati Navratrotsav Mandal Official Logo"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
              />
            </div>

          </div>
        </div>

      </div>

      {/* SECTION 2: HEADER TITLE, BADGE, SUBTITLE & INVOCATIONS (CRUD) */}
      <div className="bg-black/40 border border-brand-gold/30 rounded-2xl p-5 md:p-6 space-y-6">
        
        {/* Title & Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5 text-brand-gold" />
              <h3 className="text-base sm:text-lg font-bold text-white">
                {lang === 'EN' ? '2. Header Title, Badges & Invocations (CRUD)' : '२. मुख्य शीर्षक, देवस्थान टॅग व पावन आवाहन (CRUD)'}
              </h3>
            </div>
            <p className="text-gray-400 mt-1 text-[11px] leading-relaxed">
              {lang === 'EN'
                ? 'Update portal banner title in Marathi and English, sanctum trust badge (देवस्थान), establishment tagline, and the top sacred chant greeting.'
                : 'संकेतस्थळाचे मुख्य नाव, देवस्थान टॅग, ब्रीदवाक्य आणि वरील पावन मंत्र आवाहन थेट संपादित करा.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetHeader}
              disabled={isSavingHeader}
              className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-500/40 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow disabled:opacity-50"
              title={lang === 'EN' ? 'Restore authentic default Header titles' : 'मूळ अधिकृत शीर्षक पूर्ववत करा'}
            >
              <RotateCcw className="h-3.5 w-3.5 text-red-300" />
              <span>{lang === 'EN' ? 'Reset to Default' : 'मूळ मजकूर पूर्ववत करा'}</span>
            </button>
            <button
              type="button"
              onClick={handleSaveHeader}
              disabled={isSavingHeader}
              className="px-4 py-1.5 bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-bold rounded-xl hover:opacity-95 transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSavingHeader ? (lang === 'EN' ? 'Saving...' : 'जतन करत आहे...') : (lang === 'EN' ? 'Save Header' : 'शीर्षक जतन करा')}</span>
            </button>
          </div>
        </div>

        {/* Live Simulation Card */}
        <div className="bg-brand-maroon/80 border-2 border-brand-gold/40 rounded-2xl p-4 md:p-5 shadow-xl space-y-2 select-none">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[10px] text-brand-saffron">
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles className="h-3 w-3 text-brand-gold animate-pulse" />
              <span className="truncate">{invocationMR || '|| श्री इश्वटीची माता की जय! ||'}</span>
            </div>
            <span className="text-gray-300 font-mono">Live Preview</span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="w-12 h-12 rounded-xl bg-black/40 border border-brand-gold/30 flex items-center justify-center shrink-0">
              <img src={currentDisplayLogo} alt="Preview" className="h-9 w-9 object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base sm:text-xl font-black text-brand-gold drop-shadow leading-tight">
                  {titleMR || 'श्री यंग इश्वटी नवरात्रौत्सव मंडळ'}
                </span>
                <span className="text-[9px] bg-brand-red text-brand-gold border border-brand-gold/40 px-1.5 py-0.2 rounded font-bold">
                  {badgeMR || 'देवस्थान'}
                </span>
              </div>
              <p className="text-[11px] text-brand-saffron font-medium truncate mt-0.5">
                {subtitleMR || 'श्रद्धा • भक्ती • परंपरा • सेवा'}
              </p>
            </div>
          </div>
        </div>

        {/* Header Editable Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Marathi Title & English Title */}
          <div className="space-y-1.5">
            <label className="text-gray-300 font-bold block">
              {lang === 'EN' ? 'Mandal Title (Marathi) *' : 'मंडळाचे अधिकृत नाव (मराठी) *'}
            </label>
            <input
              type="text"
              value={titleMR}
              onChange={(e) => setTitleMR(e.target.value)}
              placeholder="श्री यंग इश्वटी नवरात्रौत्सव मंडळ"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold font-bold text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-300 font-bold block">
              {lang === 'EN' ? 'Mandal Title (English) *' : 'मंडळाचे नाव (English) *'}
            </label>
            <input
              type="text"
              value={titleEN}
              onChange={(e) => setTitleEN(e.target.value)}
              placeholder="Shree Young Ishwati Navratrotsav Mandal"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold font-bold text-sm"
            />
          </div>

          {/* Badge MR & EN */}
          <div className="space-y-1.5">
            <label className="text-gray-300 font-bold block">
              {lang === 'EN' ? 'Trust Badge Tag (Marathi)' : 'देवस्थान टॅग (मराठी)'}
            </label>
            <input
              type="text"
              value={badgeMR}
              onChange={(e) => setBadgeMR(e.target.value)}
              placeholder="देवस्थान"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-300 font-bold block">
              {lang === 'EN' ? 'Trust Badge Tag (English)' : 'Devasthan Badge (English)'}
            </label>
            <input
              type="text"
              value={badgeEN}
              onChange={(e) => setBadgeEN(e.target.value)}
              placeholder="Devasthan"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
            />
          </div>

          {/* Subtitle MR & EN */}
          <div className="space-y-1.5">
            <label className="text-gray-300 font-bold block">
              {lang === 'EN' ? 'Tagline / Subtitle (Marathi)' : 'ब्रीदवाक्य / उपशीर्षक (मराठी)'}
            </label>
            <input
              type="text"
              value={subtitleMR}
              onChange={(e) => setSubtitleMR(e.target.value)}
              placeholder="श्रद्धा • भक्ती • परंपरा • सेवा"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-300 font-bold block">
              {lang === 'EN' ? 'Tagline / Subtitle (English)' : 'Tagline / Subtitle (English)'}
            </label>
            <input
              type="text"
              value={subtitleEN}
              onChange={(e) => setSubtitleEN(e.target.value)}
              placeholder="Shree Ishwatichi Mata Devasthan Trust • Estd 1974"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
            />
          </div>

          {/* Invocation Chant Greeting MR & EN */}
          <div className="space-y-1.5">
            <label className="text-gray-300 font-bold block">
              {lang === 'EN' ? 'Top Sacred Chant Greeting (Marathi)' : 'वरील पावन मंत्र आवाहन (मराठी)'}
            </label>
            <input
              type="text"
              value={invocationMR}
              onChange={(e) => setInvocationMR(e.target.value)}
              placeholder="|| श्री इश्वटीची माता की जय! अधिकृत डिजिटल कक्षात स्वागत ||"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-300 font-bold block">
              {lang === 'EN' ? 'Top Sacred Chant Greeting (English)' : 'वरील पावन मंत्र आवाहन (English)'}
            </label>
            <input
              type="text"
              value={invocationEN}
              onChange={(e) => setInvocationEN(e.target.value)}
              placeholder="|| Hail Shree Ishwatichi Mata! Welcome to Official Digital Portal ||"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs font-mono"
            />
          </div>

        </div>

      </div>

    </div>
  );
};
