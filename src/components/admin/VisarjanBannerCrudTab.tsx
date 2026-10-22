/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  Save, 
  RotateCcw, 
  Upload, 
  Image as ImageIcon, 
  Clock, 
  Volume2, 
  VolumeX, 
  Calendar, 
  MapPin, 
  Music, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Flame,
  Zap
} from 'lucide-react';
import { 
  VisarjanBannerConfig, 
  DEFAULT_VISARJAN_BANNER_CONFIG, 
  subscribeVisarjanBannerConfig, 
  saveVisarjanBannerConfig, 
  toggleVisarjanBannerVisibility, 
  resetVisarjanBannerConfig 
} from '../../services/visarjanBannerService';
import { uploadMediaToCloudStorage } from '../../services/cloudMediaStorage';

interface VisarjanBannerCrudTabProps {
  lang: 'EN' | 'MR';
  userEmail?: string | null;
}

export const VisarjanBannerCrudTab: React.FC<VisarjanBannerCrudTabProps> = ({ lang, userEmail }) => {
  const [config, setConfig] = useState<VisarjanBannerConfig>(DEFAULT_VISARJAN_BANNER_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Image upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form field states
  const [isVisible, setIsVisible] = useState(true);
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [titleMr, setTitleMr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [subtitleMr, setSubtitleMr] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [dateMr, setDateMr] = useState('');
  const [dateEn, setDateEn] = useState('');
  const [timeMr, setTimeMr] = useState('');
  const [timeEn, setTimeEn] = useState('');
  const [routeMr, setRouteMr] = useState('');
  const [routeEn, setRouteEn] = useState('');
  const [attractionMr, setAttractionMr] = useState('');
  const [attractionEn, setAttractionEn] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(60);
  const [soundEnabledByDefault, setSoundEnabledByDefault] = useState(true);
  const [showDecorations, setShowDecorations] = useState(true);

  // Subscribe to real-time banner config
  useEffect(() => {
    const unsub = subscribeVisarjanBannerConfig((data) => {
      setConfig(data);
      setIsVisible(data.isVisible ?? true);
      setBannerImageUrl(data.bannerImageUrl || DEFAULT_VISARJAN_BANNER_CONFIG.bannerImageUrl);
      setTitleMr(data.titleMr || DEFAULT_VISARJAN_BANNER_CONFIG.titleMr);
      setTitleEn(data.titleEn || DEFAULT_VISARJAN_BANNER_CONFIG.titleEn);
      setSubtitleMr(data.subtitleMr || DEFAULT_VISARJAN_BANNER_CONFIG.subtitleMr);
      setSubtitleEn(data.subtitleEn || DEFAULT_VISARJAN_BANNER_CONFIG.subtitleEn);
      setDateMr(data.dateMr || DEFAULT_VISARJAN_BANNER_CONFIG.dateMr);
      setDateEn(data.dateEn || DEFAULT_VISARJAN_BANNER_CONFIG.dateEn);
      setTimeMr(data.timeMr || DEFAULT_VISARJAN_BANNER_CONFIG.timeMr);
      setTimeEn(data.timeEn || DEFAULT_VISARJAN_BANNER_CONFIG.timeEn);
      setRouteMr(data.routeMr || DEFAULT_VISARJAN_BANNER_CONFIG.routeMr);
      setRouteEn(data.routeEn || DEFAULT_VISARJAN_BANNER_CONFIG.routeEn);
      setAttractionMr(data.specialAttractionMr || DEFAULT_VISARJAN_BANNER_CONFIG.specialAttractionMr);
      setAttractionEn(data.specialAttractionEn || DEFAULT_VISARJAN_BANNER_CONFIG.specialAttractionEn);
      setDurationSeconds(data.durationSeconds || 60);
      setSoundEnabledByDefault(data.soundEnabledByDefault ?? true);
      setShowDecorations(data.showDecorations ?? true);
    });

    return () => unsub();
  }, []);

  // Quick toggle visibility (Show / Hide)
  const handleToggleVisibility = async () => {
    const nextState = !isVisible;
    setIsVisible(nextState);
    try {
      await toggleVisarjanBannerVisibility(nextState, userEmail || undefined);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setErrorMessage(lang === 'EN' ? 'Failed to update visibility.' : 'दृश्यमानता अपडेट करण्यात त्रुटी.');
    }
  };

  // Handle local image file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(lang === 'EN' ? 'Please select a valid image file.' : 'कृपया वैध छायाचित्र निवडा.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);

    try {
      const cloudResult = await uploadMediaToCloudStorage(file, 'visarjan_banners', (progress) => {
        setUploadProgress(progress);
      });

      if (cloudResult && cloudResult.url) {
        setBannerImageUrl(cloudResult.url);
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      // Fallback: convert to base64 data URL if cloud storage fails
      try {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const result = uploadEvent.target?.result as string;
          if (result) {
            setBannerImageUrl(result);
          }
        };
        reader.readAsDataURL(file);
      } catch {
        setErrorMessage(lang === 'EN' ? 'Upload failed. You can paste an image URL instead.' : 'अपलोड अयशस्वी. आपण इमेज URL पेस्ट करू शकता.');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Save all form changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const updatedConfig: Partial<VisarjanBannerConfig> = {
        isVisible,
        bannerImageUrl: bannerImageUrl.trim() || DEFAULT_VISARJAN_BANNER_CONFIG.bannerImageUrl,
        titleMr: titleMr.trim(),
        titleEn: titleEn.trim(),
        subtitleMr: subtitleMr.trim(),
        subtitleEn: subtitleEn.trim(),
        dateMr: dateMr.trim(),
        dateEn: dateEn.trim(),
        timeMr: timeMr.trim(),
        timeEn: timeEn.trim(),
        routeMr: routeMr.trim(),
        routeEn: routeEn.trim(),
        specialAttractionMr: attractionMr.trim(),
        specialAttractionEn: attractionEn.trim(),
        durationSeconds: Math.max(10, Math.min(600, durationSeconds)),
        soundEnabledByDefault,
        showDecorations
      };

      await saveVisarjanBannerConfig(updatedConfig, userEmail || undefined);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      console.error('Error saving Visarjan banner config:', err);
      setErrorMessage(lang === 'EN' ? 'Failed to save configuration.' : 'बदल जतन करण्यात त्रुटी आली.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to original authentic 53rd year festival defaults
  const handleReset = async () => {
    const confirmMsg = lang === 'EN'
      ? 'Are you sure you want to reset all Visarjan banner settings to the authentic 53rd Year defaults?'
      : 'तुम्हाला नक्की विसर्जन बॅनरची सर्व माहिती मूळ ५३ व्या वर्षाच्या स्वरूपात पूर्ववत करायची आहे का?';
    
    if (!window.confirm(confirmMsg)) return;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      const res = await resetVisarjanBannerConfig(userEmail || undefined);
      setConfig(res);
      setIsVisible(res.isVisible);
      setBannerImageUrl(res.bannerImageUrl);
      setTitleMr(res.titleMr);
      setTitleEn(res.titleEn);
      setSubtitleMr(res.subtitleMr);
      setSubtitleEn(res.subtitleEn);
      setDateMr(res.dateMr);
      setDateEn(res.dateEn);
      setTimeMr(res.timeMr);
      setTimeEn(res.timeEn);
      setRouteMr(res.routeMr);
      setRouteEn(res.routeEn);
      setAttractionMr(res.specialAttractionMr);
      setAttractionEn(res.specialAttractionEn);
      setDurationSeconds(res.durationSeconds);
      setSoundEnabledByDefault(res.soundEnabledByDefault);
      setShowDecorations(res.showDecorations);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setErrorMessage(lang === 'EN' ? 'Failed to reset configuration.' : 'पूर्ववत करण्यात त्रुटी.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Banner & Instant Visibility (Show/Hide) Switch     */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-brand-maroon via-amber-950 to-brand-maroon p-5 sm:p-6 rounded-2xl border-2 border-brand-gold/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎆</span>
            <h3 className="text-lg sm:text-xl font-sans font-black text-brand-gold">
              {lang === 'EN' ? 'Visarjan Miravnuk Banner Management (CRUD & Show/Hide)' : 'विसर्जन मिरवणूक बॅनर व्यवस्थापन (CRUD व Show/Hide)'}
            </h3>
          </div>
          <p className="text-xs text-amber-200 mt-1 max-w-2xl leading-relaxed">
            {lang === 'EN'
              ? 'Control the dynamic 3D Visarjan flash banner on the home page. Devotees can view authentic posters, hear real crackers sound, and share invitations.'
              : 'मुख्य पृष्ठावर १ मिनिटासाठी झळकणाऱ्या ३D विसर्जन बॅनरचे संपूर्ण व्यवस्थापन. येथे आपण बॅनर दर्शवणे/लपवणे, फोटो, वेळ, मार्ग व फटाके आवाज नियंत्रित करू शकता.'}
          </p>
        </div>

        {/* Prominent Instant Show / Hide Toggle Button */}
        <div className="flex items-center gap-3 bg-black/60 p-2 sm:p-2.5 rounded-xl border border-brand-gold/50 shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-gray-400 font-mono">
              {lang === 'EN' ? 'Public Visibility' : 'दर्शनीय स्थिती'}
            </span>
            <span className={`text-xs font-bold flex items-center gap-1 ${isVisible ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span className={`h-2 w-2 rounded-full ${isVisible ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
              {isVisible 
                ? (lang === 'EN' ? 'Active / Visible' : 'सुरू (प्रदर्शित)') 
                : (lang === 'EN' ? 'Hidden / Offline' : 'लपवले (बंद)')}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleVisibility}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg cursor-pointer active:scale-95 ${
              isVisible 
                ? 'bg-rose-700 hover:bg-rose-600 text-white border border-rose-400/50' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50 animate-pulse'
            }`}
            title={isVisible ? (lang === 'EN' ? 'Click to hide banner from home page' : 'मुख्य पृष्ठावरून बॅनर लपवण्यासाठी क्लिक करा') : (lang === 'EN' ? 'Click to activate banner on home page' : 'मुख्य पृष्ठावर बॅनर सुरू करण्यासाठी क्लिक करा')}
          >
            {isVisible ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>{lang === 'EN' ? 'Hide Banner' : 'बॅनर लपवा'}</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>{lang === 'EN' ? 'Show Banner' : 'बॅनर दाखवा'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in shadow">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {lang === 'EN' 
              ? 'Visarjan Miravnuk banner configuration updated successfully!' 
              : 'विसर्जन मिरवणूक बॅनर माहिती यशस्वीरित्या अपडेट करण्यात आली!'}
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-bold flex items-center gap-2 animate-fade-in shadow">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. Side-by-Side: Live Preview (Left) + Edit Form (Right)       */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: LIVE VISUAL PREVIEW */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-black/60 p-4 rounded-2xl border border-brand-gold/30 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-brand-gold/20 pb-2">
              <span className="text-xs font-bold text-brand-gold flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-brand-saffron" />
                {lang === 'EN' ? 'Live Banner Preview' : 'थेट बॅनर पूर्वावलोकन'}
              </span>
              <span className="text-[10px] font-mono bg-amber-500/20 text-yellow-300 px-2 py-0.5 rounded border border-amber-500/40">
                {durationSeconds}s Timer
              </span>
            </div>

            {/* Simulated Banner Card */}
            <div className="relative rounded-xl overflow-hidden border-2 border-brand-gold/70 bg-gradient-to-b from-[#2A0202] to-black shadow-2xl">
              {/* Header bar */}
              <div className="bg-brand-maroon/90 px-3 py-1.5 flex items-center justify-between text-[11px] border-b border-brand-gold/30">
                <span className="font-bold text-yellow-300 truncate">
                  {lang === 'EN' ? (titleEn || config.titleEn) : (titleMr || config.titleMr)}
                </span>
                <span className="text-[10px] bg-black/60 text-brand-gold px-1.5 py-0.5 rounded font-mono font-bold">
                  {durationSeconds}s
                </span>
              </div>

              {/* Main Image Container */}
              <div className="p-2 flex items-center justify-center bg-black/80 min-h-[220px]">
                <img
                  src={bannerImageUrl || DEFAULT_VISARJAN_BANNER_CONFIG.bannerImageUrl}
                  alt="Preview"
                  className="max-h-[260px] w-auto max-w-full object-contain rounded-lg shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_VISARJAN_BANNER_CONFIG.bannerImageUrl;
                  }}
                />
              </div>

              {/* Event details ticker */}
              <div className="p-2.5 bg-black/90 border-t border-brand-gold/30 space-y-1 text-[11px] text-gray-200">
                <div className="flex items-center gap-1.5 text-yellow-300 font-bold">
                  <Calendar className="w-3 h-3 text-brand-saffron" />
                  <span>{lang === 'EN' ? (dateEn || config.dateEn) : (dateMr || config.dateMr)}</span>
                  <span className="text-gray-400">•</span>
                  <Clock className="w-3 h-3 text-brand-gold" />
                  <span>{lang === 'EN' ? (timeEn || config.timeEn) : (timeMr || config.timeMr)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-300 text-[10px]">
                  <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="truncate">{lang === 'EN' ? (routeEn || config.routeEn) : (routeMr || config.routeMr)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-300 text-[10px]">
                  <Music className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">{lang === 'EN' ? (attractionEn || config.specialAttractionEn) : (attractionMr || config.specialAttractionMr)}</span>
                </div>
              </div>
            </div>

            {/* Quick helper note */}
            <p className="text-[11px] text-gray-400 leading-relaxed italic">
              {lang === 'EN'
                ? '* This preview reflects how devotees see the banner below the top menu bar upon landing on the home page.'
                : '* भाविक जेव्हा मुख्य पृष्ठावर येतात, तेव्हा मेनू बारच्या खाली त्यांना हे बॅनर अशा स्वरूपात दिसेल.'}
            </p>
          </div>

          {/* Quick presets & action badges */}
          <div className="bg-black/40 p-3.5 rounded-xl border border-brand-gold/20 space-y-2 text-xs">
            <span className="font-bold text-brand-gold block">
              {lang === 'EN' ? 'Timer Duration Presets:' : 'वेळ मर्यादा जलद पर्याय:'}
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[30, 60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setDurationSeconds(sec)}
                  className={`py-1.5 px-2 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer ${
                    durationSeconds === sec 
                      ? 'bg-brand-gold text-brand-maroon shadow font-black scale-105' 
                      : 'bg-black/60 text-gray-300 hover:text-white border border-white/10'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FULL CRUD EDIT FORM */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSave} className="bg-black/60 p-5 sm:p-6 rounded-2xl border border-brand-gold/30 shadow-xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-brand-gold/20 pb-3">
              <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <span>📝</span>
                <span>{lang === 'EN' ? 'Edit Visarjan Banner Details' : 'विसर्जन बॅनर तपशील संपादित करा'}</span>
              </h4>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-amber-300 hover:text-white flex items-center gap-1 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-all cursor-pointer"
                title="Reset to 53rd Year defaults"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{lang === 'EN' ? 'Reset Defaults' : 'मूळ माहिती'}</span>
              </button>
            </div>

            {/* 1. Banner Image Source */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-gold flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-brand-saffron" />
                <span>{lang === 'EN' ? 'Banner Image URL or Upload:' : 'बॅनर फोटो URL किंवा डिव्हाइसमधून अपलोड:'}</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  placeholder="https://... or /assets/aistudio/visarjan_banner_clean.png"
                  className="flex-1 bg-black/80 border border-brand-gold/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold font-mono"
                />
                
                {/* File upload button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-amber-800 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{uploadProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{lang === 'EN' ? 'Upload' : 'अपलोड'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Reset image button */}
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>
                  {lang === 'EN' ? 'Default Clean Artwork:' : 'मूळ स्वच्छ बॅनर:'}{' '}
                  <code className="text-brand-gold">/assets/aistudio/visarjan_banner_clean.png</code>
                </span>
                <button
                  type="button"
                  onClick={() => setBannerImageUrl(DEFAULT_VISARJAN_BANNER_CONFIG.bannerImageUrl)}
                  className="text-amber-300 hover:underline cursor-pointer"
                >
                  {lang === 'EN' ? 'Use Default Artwork' : 'मूळ बॅनर वापरा'}
                </button>
              </div>
            </div>

            {/* 2. Titles (Marathi & English) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">
                  {lang === 'EN' ? 'Title (Marathi)' : 'शीर्षक (मराठी)'}
                </label>
                <input
                  type="text"
                  value={titleMr}
                  onChange={(e) => setTitleMr(e.target.value)}
                  className="w-full bg-black/80 border border-brand-gold/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">
                  {lang === 'EN' ? 'Title (English)' : 'शीर्षक (English)'}
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full bg-black/80 border border-brand-gold/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            {/* 3. Subtitles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">
                  {lang === 'EN' ? 'Subtitle (Marathi)' : 'उपशीर्षक (मराठी)'}
                </label>
                <input
                  type="text"
                  value={subtitleMr}
                  onChange={(e) => setSubtitleMr(e.target.value)}
                  className="w-full bg-black/80 border border-brand-gold/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">
                  {lang === 'EN' ? 'Subtitle (English)' : 'उपशीर्षक (English)'}
                </label>
                <input
                  type="text"
                  value={subtitleEn}
                  onChange={(e) => setSubtitleEn(e.target.value)}
                  className="w-full bg-black/80 border border-brand-gold/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            {/* 4. Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-brand-gold" />
                  <span>{lang === 'EN' ? 'Date (Marathi)' : 'दिनांक (मराठी)'}</span>
                </label>
                <input
                  type="text"
                  value={dateMr}
                  onChange={(e) => setDateMr(e.target.value)}
                  placeholder="बुधवार, २१ ऑक्टोबर २०२६"
                  className="w-full bg-black/80 border border-brand-gold/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-brand-saffron" />
                  <span>{lang === 'EN' ? 'Time (Marathi)' : 'वेळ (मराठी)'}</span>
                </label>
                <input
                  type="text"
                  value={timeMr}
                  onChange={(e) => setTimeMr(e.target.value)}
                  placeholder="सायंकाळी ६:०० वाजता"
                  className="w-full bg-black/80 border border-brand-gold/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">
                  {lang === 'EN' ? 'Date (English)' : 'दिनांक (English)'}
                </label>
                <input
                  type="text"
                  value={dateEn}
                  onChange={(e) => setDateEn(e.target.value)}
                  placeholder="Wed, 21 Oct 2026"
                  className="w-full bg-black/80 border border-brand-gold/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">
                  {lang === 'EN' ? 'Time (English)' : 'वेळ (English)'}
                </label>
                <input
                  type="text"
                  value={timeEn}
                  onChange={(e) => setTimeEn(e.target.value)}
                  placeholder="6:00 PM Onwards"
                  className="w-full bg-black/80 border border-brand-gold/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            {/* 5. Procession Route & Musical Troupe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span>{lang === 'EN' ? 'Miravnuk Route (Marathi)' : 'मिरवणूक मार्ग (मराठी)'}</span>
                </label>
                <input
                  type="text"
                  value={routeMr}
                  onChange={(e) => setRouteMr(e.target.value)}
                  placeholder="इश्वटी प्रसाद पटांगण ते काळाचौकी नाका"
                  className="w-full bg-black/80 border border-brand-gold/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1">
                  <Music className="w-3 h-3 text-amber-400" />
                  <span>{lang === 'EN' ? 'Special Band / Group (Marathi)' : 'वाद्यवृंद / आकर्षण (मराठी)'}</span>
                </label>
                <input
                  type="text"
                  value={attractionMr}
                  onChange={(e) => setAttractionMr(e.target.value)}
                  placeholder="साई म्युझिकल ग्रुप - गोवंडी"
                  className="w-full bg-black/80 border border-brand-gold/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">
                  {lang === 'EN' ? 'Miravnuk Route (English)' : 'मिरवणूक मार्ग (English)'}
                </label>
                <input
                  type="text"
                  value={routeEn}
                  onChange={(e) => setRouteEn(e.target.value)}
                  placeholder="Ishwati Prasad Ground to Kalachowki Naka"
                  className="w-full bg-black/80 border border-brand-gold/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">
                  {lang === 'EN' ? 'Special Band / Group (English)' : 'वाद्यवृंद / आकर्षण (English)'}
                </label>
                <input
                  type="text"
                  value={attractionEn}
                  onChange={(e) => setAttractionEn(e.target.value)}
                  placeholder="Sai Musical Group - Govandi"
                  className="w-full bg-black/80 border border-brand-gold/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            {/* 6. Settings: Timer Duration Slider, Sound Defaults & Side Flares */}
            <div className="bg-black/40 p-4 rounded-xl border border-brand-gold/20 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-brand-gold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-saffron" />
                    <span>{lang === 'EN' ? 'Banner Flash Timer Duration:' : 'बॅनर झळकण्याचा कालावधी (Timer):'}</span>
                  </label>
                  <span className="font-mono font-bold text-yellow-300 bg-black/60 px-2 py-0.5 rounded border border-brand-gold/40">
                    {durationSeconds} {lang === 'EN' ? 'seconds' : 'सेकंद'}
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="300"
                  step="5"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>15s (Quick)</span>
                  <span>60s (Default)</span>
                  <span>180s (3m)</span>
                  <span>300s (5m)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                {/* Sound enabled toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={soundEnabledByDefault}
                    onChange={(e) => setSoundEnabledByDefault(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-xs text-gray-200 flex items-center gap-1">
                    {soundEnabledByDefault ? <Volume2 className="w-3.5 h-3.5 text-brand-gold" /> : <VolumeX className="w-3.5 h-3.5 text-gray-400" />}
                    <span>{lang === 'EN' ? 'Crackers sound ON by default' : 'फटाके आवाज सुरुवातीस सुरू ठेवा'}</span>
                  </span>
                </label>

                {/* Side decorations toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showDecorations}
                    onChange={(e) => setShowDecorations(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-xs text-gray-200 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>{lang === 'EN' ? 'Display side crackers & fireworks' : 'बाजूचे फटाके व आतिशबाजी दाखवा'}</span>
                  </span>
                </label>
              </div>
            </div>

            {/* 7. Save Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-gray-400">
                {lang === 'EN' ? 'Changes are published immediately.' : 'बदल लगेचच मुख्य पृष्ठावर लागू होतील.'}
              </span>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-bold text-xs sm:text-sm rounded-xl hover:opacity-95 transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === 'EN' ? 'Saving...' : 'जतन होत आहे...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{lang === 'EN' ? 'Save & Apply Changes' : 'बदल जतन करा व लागू करा'}</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};
