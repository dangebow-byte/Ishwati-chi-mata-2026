/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Image as ImageIcon, 
  Calendar, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Upload,
  HardDrive,
  Globe
} from 'lucide-react';
import { 
  DeviMataImageItem, 
  addDeviMataImage, 
  updateDeviMataImage, 
  deleteDeviMataImage,
  DEFAULT_DEVI_IMAGE
} from '../services/deviImagesService';
import { compressAndReadImageFile, formatFileSize } from '../services/localMediaStorage';

interface DeviMataImageManagerModalProps {
  lang: 'EN' | 'MR';
  isOpen: boolean;
  onClose: () => void;
  images: DeviMataImageItem[];
  activeImageId?: string;
  onSelectActiveImage: (image: DeviMataImageItem) => void;
  onImagesChanged: (updatedImages: DeviMataImageItem[]) => void;
}

export const DeviMataImageManagerModal: React.FC<DeviMataImageManagerModalProps> = ({
  lang,
  isOpen,
  onClose,
  images,
  activeImageId,
  onSelectActiveImage,
  onImagesChanged
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formUrl, setFormUrl] = useState('');
  const [uploadSource, setUploadSource] = useState<'device' | 'url'>('device');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(null);
  const [formTitleMR, setFormTitleMR] = useState('');
  const [formTitleEN, setFormTitleEN] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formYear, setFormYear] = useState('2026');
  const [formDescMR, setFormDescMR] = useState('');
  const [formDescEN, setFormDescEN] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormUrl('');
    setUploadSource('device');
    setIsProcessingFile(false);
    setUploadedFileName('');
    setUploadedFileSize(null);
    setFormTitleMR('');
    setFormTitleEN('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormYear('2026');
    setFormDescMR('');
    setFormDescEN('');
    setFormIsActive(true);
    setIsAdding(false);
    setEditingId(null);
    setErrorMsg(null);
  };

  const startEdit = (img: DeviMataImageItem) => {
    setEditingId(img.id);
    setFormUrl(img.url);
    setUploadSource(img.url.startsWith('data:') ? 'device' : 'url');
    setUploadedFileName(img.url.startsWith('data:') ? 'uploaded-image' : '');
    setUploadedFileSize(null);
    setFormTitleMR(img.titleMR);
    setFormTitleEN(img.titleEN);
    setFormDate(img.dateStr);
    setFormYear(img.year || '2026');
    setFormDescMR(img.descriptionMR || '');
    setFormDescEN(img.descriptionEN || '');
    setFormIsActive(img.id === activeImageId || Boolean(img.isHeroDefault));
    setIsAdding(false);
    setErrorMsg(null);
  };

  const handleDeviceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setErrorMsg(null);
    try {
      const result = await compressAndReadImageFile(file, 960, 0.72);
      setFormUrl(result.dataUrl);
      setUploadedFileName(result.name);
      setUploadedFileSize(result.size);
      if (!formTitleMR.trim()) {
        setFormTitleMR('श्री इश्वटीची माता पावन दर्शन (नवीन छायाचित्र)');
      }
      if (!formTitleEN.trim()) {
        setFormTitleEN('Shree Ishwatichi Mata Sacred Darshan (New Photo)');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (lang === 'EN' ? 'Failed to process image file.' : 'फोटो फाईल प्रक्रिया अयशस्वी झाली.'));
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUrl.trim() && editingId !== DEFAULT_DEVI_IMAGE.id) {
      setErrorMsg(lang === 'EN' ? 'Please upload an image from your device or enter a valid URL.' : 'कृपया तुमच्या डिव्हाइसवरून फोटो निवडा किंवा वैध URL टाका.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (editingId) {
        // Update existing
        await updateDeviMataImage(editingId, {
          url: formUrl.trim(),
          titleMR: formTitleMR.trim() || 'श्री इश्वटीची माता पावन दर्शन',
          titleEN: formTitleEN.trim() || 'Shree Ishwatichi Mata Sacred Darshan',
          descriptionMR: formDescMR.trim(),
          descriptionEN: formDescEN.trim(),
          dateStr: formDate,
          year: formYear,
          isHeroDefault: formIsActive
        });

        const updated = images.map(img => {
          if (img.id === editingId) {
            const upd = {
              ...img,
              url: formUrl.trim(),
              titleMR: formTitleMR.trim() || img.titleMR,
              titleEN: formTitleEN.trim() || img.titleEN,
              descriptionMR: formDescMR.trim(),
              descriptionEN: formDescEN.trim(),
              dateStr: formDate,
              year: formYear,
              isHeroDefault: formIsActive
            };
            if (formIsActive) {
              onSelectActiveImage(upd);
            }
            return upd;
          }
          if (formIsActive) {
            return { ...img, isHeroDefault: false };
          }
          return img;
        });

        onImagesChanged(updated);
        setSuccessMsg(lang === 'EN' ? 'Image details updated successfully!' : 'प्रतिमा माहिती यशस्वीरित्या अद्ययावत झाली!');
      } else {
        // Add new
        const newItem = await addDeviMataImage({
          url: formUrl.trim(),
          titleMR: formTitleMR.trim() || 'श्री इश्वटीची माता दैनिक दर्शन',
          titleEN: formTitleEN.trim() || 'Shree Ishwatichi Mata Daily Darshan',
          descriptionMR: formDescMR.trim(),
          descriptionEN: formDescEN.trim(),
          dateStr: formDate,
          year: formYear,
          isHeroDefault: formIsActive
        });

        let updated = [newItem, ...images];
        if (formIsActive) {
          updated = updated.map(img => ({
            ...img,
            isHeroDefault: img.id === newItem.id
          }));
          onSelectActiveImage(newItem);
        }

        onImagesChanged(updated);
        setSuccessMsg(lang === 'EN' ? 'New Devi Mata image added successfully!' : 'नवीन देवीमाता प्रतिमा यशस्वीरित्या जोडली गेली!');
      }

      resetForm();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || (lang === 'EN' ? 'Error saving image.' : 'प्रतिमा जतन करताना त्रुटी आली.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === DEFAULT_DEVI_IMAGE.id) {
      alert(lang === 'EN' ? 'Default sanctum idol cannot be deleted.' : 'मूळ गाभारा मूर्ती हटवता येत नाही.');
      return;
    }

    const confirmMsg = lang === 'EN' 
      ? 'Are you sure you want to delete this Devi Mata image?' 
      : 'तुम्हाला खात्री आहे की ही देवीमाता दर्शन प्रतिमा हटवायची आहे?';

    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteDeviMataImage(id);
      const remaining = images.filter(img => img.id !== id);
      onImagesChanged(remaining);

      // If active image was deleted, fallback to default
      if (activeImageId === id) {
        onSelectActiveImage(remaining[0] || DEFAULT_DEVI_IMAGE);
      }
      setSuccessMsg(lang === 'EN' ? 'Image deleted successfully.' : 'प्रतिमा यशस्वीरित्या हटवली.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error deleting image.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#2e0404] via-[#1a0202] to-black border-2 border-brand-gold/60 rounded-2xl shadow-2xl text-white overflow-hidden my-auto max-h-[92vh] flex flex-col font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-brand-gold/30 bg-black/40">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🌺</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-brand-gold tracking-wide">
                {lang === 'EN' ? 'Devi Mata Daily Darshan Manager' : 'श्री इश्वटीची माता दैनिक दर्शन व्यवस्थापन'}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-300">
                {lang === 'EN' 
                  ? 'Add, update or delete daily sanctum images to keep website darshan fresh daily' 
                  : 'वेबसाईटवरील दैनिक दर्शन अद्ययावत ठेवण्यासाठी फोटो जोडा, संपादित करा किंवा हटवा'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mx-4 mt-3 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mx-4 mt-3 p-3 rounded-lg bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* Action Header / Add Button */}
          {!isAdding && !editingId && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-brand-maroon/30 p-3.5 rounded-xl border border-brand-gold/25">
              <div>
                <span className="font-bold text-brand-gold block">
                  {lang === 'EN' ? 'Daily Darshan Showcase' : 'दैनिक दर्शन संग्रह'}
                </span>
                <span className="text-[11px] text-gray-300">
                  {lang === 'EN'
                    ? `${images.length} sanctum photos available. Select active or add today's photo.`
                    : `एकूण ${images.length} दर्शन छायाचित्रे उपलब्ध आहेत.`}
                </span>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setIsAdding(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-brand-gold hover:bg-brand-saffron text-brand-maroon font-bold text-xs flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                <span>{lang === 'EN' ? 'Add Today’s Photo' : 'आजचा नवीन फोटो जोडा'}</span>
              </button>
            </div>
          )}

          {/* Form for Add / Edit */}
          {(isAdding || editingId) && (
            <form onSubmit={handleSave} noValidate className="bg-black/60 p-4 sm:p-5 rounded-xl border border-brand-gold/40 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-bold text-brand-gold text-sm flex items-center gap-1.5">
                  <Edit3 className="h-4 w-4" />
                  <span>
                    {editingId
                      ? (lang === 'EN' ? 'Edit Devi Mata Image' : 'देवीमाता दर्शन प्रतिमा संपादित करा')
                      : (lang === 'EN' ? 'Add New Daily Darshan Image' : 'आजचे नवीन दर्शन छायाचित्र जोडा')}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-gray-400 hover:text-white cursor-pointer"
                >
                  {lang === 'EN' ? 'Cancel' : 'रद्द करा'}
                </button>
              </div>

              {/* Image Source Mode Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                  {lang === 'EN' ? 'Photo Source *' : 'फोटो स्त्रोत (Photo Source) *'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadSource('device')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      uploadSource === 'device'
                        ? 'bg-brand-gold text-brand-maroon border-brand-gold shadow-md font-black'
                        : 'bg-black/50 text-gray-300 border-white/10 hover:text-white'
                    }`}
                  >
                    <HardDrive className="h-4 w-4" />
                    <span>{lang === 'EN' ? 'Upload from Device' : 'डिव्हाइसवरून निवडा (Upload)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadSource('url')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      uploadSource === 'url'
                        ? 'bg-brand-gold text-brand-maroon border-brand-gold shadow-md font-black'
                        : 'bg-black/50 text-gray-300 border-white/10 hover:text-white'
                    }`}
                  >
                    <Globe className="h-4 w-4" />
                    <span>{lang === 'EN' ? 'Web Image URL' : 'वेब लिंक (Web URL)'}</span>
                  </button>
                </div>
              </div>

              {/* Mode A: Device File Upload */}
              {uploadSource === 'device' ? (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                    {lang === 'EN' ? 'Choose Image File from Computer / Mobile *' : 'तुमच्या संगणक किंवा मोबाईलवरून फोटो निवडा *'}
                  </label>
                  
                  <label className="border-2 border-dashed border-brand-gold/40 hover:border-brand-gold bg-black/40 hover:bg-black/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handleDeviceImageUpload}
                      className="hidden"
                    />
                    <div className="h-10 w-10 rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-gold">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-bold text-brand-gold block text-xs">
                        {isProcessingFile 
                          ? (lang === 'EN' ? 'Optimizing Image...' : 'फोटो अनुकूलित होत आहे...') 
                          : (lang === 'EN' ? 'Click to Browse or Drag Photo Here' : 'फोटो निवडण्यासाठी येथे क्लिक करा')}
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        {lang === 'EN' 
                          ? 'Supports JPG, PNG, WEBP • Automatically optimized for high resolution'
                          : 'सर्व फोटो फॉरमॅट समर्थित (JPG, PNG, WEBP) • आपोआप ऑप्टिमाइझ केले जाईल'}
                      </span>
                    </div>
                  </label>

                  {uploadedFileName && (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span className="font-mono truncate">{uploadedFileName}</span>
                      {uploadedFileSize !== null && (
                        <span className="text-[10px] text-gray-300 font-mono ml-auto">
                          ({formatFileSize(uploadedFileSize)})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Mode B: Web Direct URL */
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                    {lang === 'EN' ? 'Image Direct URL *' : 'प्रतिमा वेब लिंक (Image URL) *'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/devi-mata-darshan-today.jpg"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    className="w-full bg-black/70 border border-brand-gold/30 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-gold"
                  />
                  <span className="text-[10px] text-gray-400 block">
                    {lang === 'EN' 
                      ? 'Tip: Paste any hosted image URL (Unsplash, Google Drive link, Imgur, Cloudinary, etc.)'
                      : 'टीप: कोणत्याही ऑनलाइन फोटोची थेट लिंक येथे टाका'}
                  </span>
                </div>
              )}

              {/* Image Preview */}
              {formUrl && (
                <div className="p-2.5 bg-black/50 rounded-xl border border-brand-gold/40 flex items-center gap-3">
                  <img
                    src={formUrl}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-brand-gold shadow-md shrink-0 bg-black"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="text-[11px] text-gray-300 min-w-0">
                    <span className="text-brand-gold font-bold flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-brand-saffron" />
                      <span>{lang === 'EN' ? 'Live Sacred Preview' : 'थेट पावन दर्शन पूर्वावलोकन'}</span>
                    </span>
                    <span className="text-[10px] text-gray-400 truncate block mt-0.5">
                      {formUrl.startsWith('data:') 
                        ? (lang === 'EN' ? 'Local Device Converted Image' : 'डिव्हाइसवरून निवडलेला फोटो') 
                        : formUrl}
                    </span>
                  </div>
                </div>
              )}

              {/* Title Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-300">
                    {lang === 'EN' ? 'Title (Marathi)' : 'शीर्षक (मराठी)'}
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. श्री इश्वटीची माता पावन दर्शन (दिवस २)"
                    value={formTitleMR}
                    onChange={(e) => setFormTitleMR(e.target.value)}
                    className="w-full bg-black/70 border border-brand-gold/30 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-300">
                    {lang === 'EN' ? 'Title (English)' : 'शीर्षक (इंग्रजी)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shree Ishwatichi Mata Sacred Darshan (Day 2)"
                    value={formTitleEN}
                    onChange={(e) => setFormTitleEN(e.target.value)}
                    className="w-full bg-black/70 border border-brand-gold/30 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              {/* Date & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-300">
                    {lang === 'EN' ? 'Date (YYYY-MM-DD)' : 'तारीख'}
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => {
                      setFormDate(e.target.value);
                      if (e.target.value) {
                        setFormYear(e.target.value.split('-')[0]);
                      }
                    }}
                    className="w-full bg-black/70 border border-brand-gold/30 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-300">
                    {lang === 'EN' ? 'Festival Year' : 'वर्ष'}
                  </label>
                  <input
                    type="text"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full bg-black/70 border border-brand-gold/30 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300">
                  {lang === 'EN' ? 'Description (Optional)' : 'तपशील / वर्णन (पर्यायी)'}
                </label>
                <textarea
                  rows={2}
                  placeholder="उदा. नवरात्र उत्सव २०२६ निमित्त देवीचा विशेष सुवर्ण अलंकार व पुष्प शृंगार."
                  value={formDescMR}
                  onChange={(e) => setFormDescMR(e.target.value)}
                  className="w-full bg-black/70 border border-brand-gold/30 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-gold"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-brand-gold text-brand-gold focus:ring-brand-gold"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-bold text-brand-gold cursor-pointer select-none">
                  {lang === 'EN' 
                    ? 'Set as Today’s Active Darshan Image across the whole website' 
                    : 'ही प्रतिमा संपूर्ण वेबसाईटवर आजचे मुख्य दर्शन म्हणून प्रदर्शित करा'}
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-xs cursor-pointer"
                >
                  {lang === 'EN' ? 'Cancel' : 'रद्द करा'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-brand-gold text-brand-maroon font-bold text-xs hover:opacity-95 cursor-pointer disabled:opacity-50 shadow"
                >
                  {isSubmitting 
                    ? (lang === 'EN' ? 'Saving...' : 'जतन करत आहे...') 
                    : (lang === 'EN' ? 'Save Image' : 'प्रतिमा जतन करा')}
                </button>
              </div>
            </form>
          )}

          {/* List of Devi Mata Images */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold border-b border-white/10 pb-1">
              <span>{lang === 'EN' ? 'Available Sanctum Photos' : 'उपलब्ध दर्शन छायाचित्रे'}</span>
              <span>{lang === 'EN' ? 'Click "Set Active" to display' : 'प्रदर्शित करण्यासाठी "सुरू करा" निवडा'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {images.map((img) => {
                const isActive = img.id === activeImageId || Boolean(img.isHeroDefault);

                return (
                  <div
                    key={img.id}
                    className={`relative p-3 rounded-xl border transition-all flex gap-3 ${
                      isActive
                        ? 'bg-gradient-to-br from-brand-maroon/70 to-black/80 border-brand-gold shadow-lg ring-1 ring-brand-gold/50'
                        : 'bg-black/50 border-white/10 hover:border-brand-gold/40'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden bg-black/80 border border-brand-gold/30 shrink-0 relative flex items-center justify-center">
                      {img.url ? (
                        <img
                          src={img.url}
                          alt={img.titleMR}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-2xl">🕉️</span>
                      )}
                      {isActive && (
                        <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-white text-xs truncate">
                            {lang === 'EN' ? img.titleEN : img.titleMR}
                          </h4>
                          <span className="text-[10px] font-mono text-brand-gold shrink-0">
                            {img.year}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{img.dateStr}</span>
                        </p>
                        {img.descriptionMR && (
                          <p className="text-[10px] text-gray-300 mt-1 line-clamp-1">
                            {lang === 'EN' ? (img.descriptionEN || img.descriptionMR) : img.descriptionMR}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-1 pt-2 border-t border-white/5 mt-1">
                        {isActive ? (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            <span>{lang === 'EN' ? 'Currently Active' : 'सध्या मुख्य दर्शन'}</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectActiveImage(img);
                              updateDeviMataImage(img.id, { isHeroDefault: true });
                              const updated = images.map(item => ({
                                ...item,
                                isHeroDefault: item.id === img.id
                              }));
                              onImagesChanged(updated);
                            }}
                            className="text-[10px] text-brand-gold hover:text-white font-bold bg-brand-gold/15 hover:bg-brand-gold/30 px-2 py-0.5 rounded cursor-pointer transition-colors"
                          >
                            {lang === 'EN' ? 'Set as Active' : 'मुख्य दर्शन म्हणून निवडा'}
                          </button>
                        )}

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => startEdit(img)}
                            className="p-1 rounded text-gray-400 hover:text-brand-gold transition-colors cursor-pointer"
                            title={lang === 'EN' ? 'Edit' : 'संपादित करा'}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          {img.id !== DEFAULT_DEVI_IMAGE.id && (
                            <button
                              onClick={() => handleDelete(img.id)}
                              className="p-1 rounded text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                              title={lang === 'EN' ? 'Delete' : 'हटवा'}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-black/60 border-t border-brand-gold/20 flex items-center justify-between text-xs">
          <span className="text-[11px] text-gray-400">
            {lang === 'EN' 
              ? 'Changes instantly update across Hero, Live Darshan & Sanctum sections.' 
              : 'येथील बदल मुख्य पान, लाईव्ह दर्शन व गाभारा विभागात तत्काळ लागू होतात.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-brand-gold text-brand-maroon font-bold text-xs hover:opacity-90 cursor-pointer"
          >
            {lang === 'EN' ? 'Done' : 'पूर्ण झाले'}
          </button>
        </div>

      </div>
    </div>
  );
};
