/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Plus, Edit2, Trash2, Clock, MapPin, 
  RotateCcw, Search, CheckCircle, AlertCircle, Sparkles, X, 
  Save, Filter, Upload, Image as ImageIcon, Users
} from 'lucide-react';
import { TempleEvent } from '../../types';
import { 
  subscribeTempleEvents,
  addTempleEvent,
  updateTempleEvent,
  deleteTempleEvent,
  resetEventsToDefault,
  getCachedEvents
} from '../../services/eventsService';
import { uploadMediaToCloudStorage } from '../../services/cloudMediaStorage';
import { formatFileSize } from '../../services/localMediaStorage';

interface UtsavEventsCrudTabProps {
  lang: 'EN' | 'MR';
}

export const UtsavEventsCrudTab: React.FC<UtsavEventsCrudTabProps> = ({ lang }) => {
  const [events, setEvents] = useState<TempleEvent[]>(getCachedEvents());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal & Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TempleEvent | null>(null);

  const [formId, setFormId] = useState('');
  const [formTitleMR, setFormTitleMR] = useState('');
  const [formTitleEN, setFormTitleEN] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formCategory, setFormCategory] = useState<string>('Festival');
  const [formDescMR, setFormDescMR] = useState('');
  const [formDescEN, setFormDescEN] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formRsvpCount, setFormRsvpCount] = useState<number>(0);

  // Device image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  // Status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsub = subscribeTempleEvents((list) => {
      setEvents(list);
    });
    return () => unsub();
  }, []);

  const clearMessages = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleOpenAdd = () => {
    clearMessages();
    setEditingEvent(null);
    setFormId(`event-${Date.now()}`);
    setFormTitleMR('');
    setFormTitleEN('');
    setFormDate('2026-10-11');
    setFormTime('सकाळी ११:०० वा.');
    setFormCategory('Festival');
    setFormDescMR('');
    setFormDescEN('');
    setFormLocation('श्री यंग इश्वटी नवरात्रौत्सव सभामंडप');
    setFormImage('');
    setFormRsvpCount(0);
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt: TempleEvent) => {
    clearMessages();
    setEditingEvent(evt);
    setFormId(evt.id);
    setFormTitleMR(evt.titleMarathi);
    setFormTitleEN(evt.title);
    setFormDate(evt.date);
    setFormTime(evt.time);
    setFormCategory(evt.category || 'Festival');
    setFormDescMR(evt.descriptionMarathi);
    setFormDescEN(evt.description);
    setFormLocation((evt as any).location || 'श्री यंग इश्वटी मुख्य सभामंडप');
    setFormImage(evt.image || '');
    setFormRsvpCount(evt.rsvpCount || 0);
    setImageFile(null);
    setImagePreview(evt.image || null);
    setIsModalOpen(true);
  };

  const handleSelectImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(
        lang === 'EN'
          ? 'Image file size exceeds 10MB limit.'
          : 'प्रतिमेचा आकार १० MB पेक्षा जास्त आहे.'
      );
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!formTitleMR.trim() || !formDate.trim()) {
      setErrorMsg(
        lang === 'EN'
          ? 'Event Marathi title and date are required.'
          : 'उत्सवाचे मराठी नाव आणि तारीख आवश्यक आहे.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = formImage.trim();

      if (imageFile) {
        setIsImageUploading(true);
        setImageUploadProgress(10);
        try {
          const res = await uploadMediaToCloudStorage(
            imageFile,
            'event_images',
            (prog) => setImageUploadProgress(prog)
          );
          finalImageUrl = res.url;
        } catch (uploadErr) {
          console.warn('Fallback to data URL for event image:', uploadErr);
          const reader = new FileReader();
          finalImageUrl = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(imageFile);
          });
        } finally {
          setIsImageUploading(false);
        }
      }

      const eventPayload: TempleEvent = {
        id: formId,
        title: formTitleEN.trim() || formTitleMR.trim(),
        titleMarathi: formTitleMR.trim(),
        date: formDate.trim(),
        time: formTime.trim(),
        category: formCategory,
        description: formDescEN.trim() || formDescMR.trim(),
        descriptionMarathi: formDescMR.trim(),
        rsvpCount: Number(formRsvpCount) || 0,
        image: finalImageUrl || undefined
      };

      if (formLocation.trim()) {
        (eventPayload as any).location = formLocation.trim();
      }

      if (editingEvent) {
        await updateTempleEvent(editingEvent.id, eventPayload);
        setSuccessMsg(
          lang === 'EN'
            ? 'Utsav Schedule event updated successfully!'
            : 'उत्सव वेळापत्रकातील कार्यक्रम यशस्वीरित्या अद्यतनित केला!'
        );
      } else {
        await addTempleEvent(eventPayload);
        setSuccessMsg(
          lang === 'EN'
            ? 'New Utsav event added to schedule!'
            : 'नवीन उत्सव कार्यक्रम यशस्वीरित्या वेळापत्रकात जोडला!'
        );
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(
      lang === 'EN'
        ? `Are you sure you want to delete event "${title}"?`
        : `तुम्हाला खात्री आहे का की "${title}" हा कार्यक्रम हटवायचा आहे?`
    )) {
      return;
    }

    clearMessages();
    try {
      await deleteTempleEvent(id);
      setSuccessMsg(lang === 'EN' ? `Event "${title}" deleted.` : `"${title}" कार्यक्रम हटविला.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete event.');
    }
  };

  const handleResetToDefault = async () => {
    if (!window.confirm(
      lang === 'EN'
        ? 'Are you sure you want to restore the authentic initial temple festival schedule?'
        : 'तुम्हाला खात्री आहे का की मूळ अधिकृत उत्सव वेळापत्रक पूर्ववत करायचे आहे?'
    )) {
      return;
    }

    clearMessages();
    try {
      await resetEventsToDefault();
      setSuccessMsg(
        lang === 'EN'
          ? 'Utsav schedule reset to authentic temple events!'
          : 'उत्सव वेळापत्रक मूळ अधिकृत कार्यक्रमांमध्ये पूर्ववत झाले!'
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset events.');
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesCat = categoryFilter === 'All' || evt.category === categoryFilter;
    if (!matchesCat) return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      evt.titleMarathi.toLowerCase().includes(q) ||
      evt.title.toLowerCase().includes(q) ||
      evt.descriptionMarathi.toLowerCase().includes(q) ||
      evt.description.toLowerCase().includes(q) ||
      evt.date.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Feedback Alerts */}
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

      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-gold" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              {lang === 'EN' ? '6. Utsav Schedule Management (CRUD)' : '६. उत्सव वेळापत्रक व्यवस्थापन (CRUD)'}
            </h3>
          </div>
          <p className="text-gray-400 mt-1 text-[11px] leading-relaxed">
            {lang === 'EN'
              ? 'Publish festival dates, cultural programs, community service drives, upload event posters, and monitor devotee RSVPs.'
              : 'उत्सव तारखा, सांस्कृतिक कार्यक्रम, सामाजिक सेवा आणि पोस्टर छायाचित्रे प्रकाशित करा व उपस्थिती व्यवस्थापित करा.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-500/40 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow"
          >
            <RotateCcw className="h-3.5 w-3.5 text-red-300" />
            <span>{lang === 'EN' ? 'Reset to Default' : 'मूळ उत्सव पूर्ववत करा'}</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-1.5 bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-bold rounded-xl hover:opacity-95 shadow flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{lang === 'EN' ? 'Add Utsav Event' : 'नवीन उत्सव जोडा'}</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'EN' ? 'Search festival or program...' : 'उत्सव किंवा कार्यक्रम शोधा...'}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
          >
            <option value="All">{lang === 'EN' ? 'All Categories' : 'सर्व वर्ग'}</option>
            <option value="Festival">Festival (धार्मिक उत्सव)</option>
            <option value="Community Service">Community Service (समाजसेवा)</option>
            <option value="Cultural Program">Cultural Program (सांस्कृतिक)</option>
          </select>
        </div>

        <div className="flex items-center justify-end text-gray-400 font-mono text-[11px]">
          <span>{lang === 'EN' ? 'Total Events' : 'एकूण कार्यक्रम'}: <strong>{events.length}</strong></span>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-zinc-900/80 border border-brand-gold/25 hover:border-brand-gold/60 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md transition-all"
          >
            <div className="space-y-2.5">
              {/* Event poster thumbnail if present */}
              {evt.image && (
                <div className="h-36 w-full rounded-xl overflow-hidden bg-black/60 border border-white/10 relative">
                  <img
                    src={evt.image}
                    alt={evt.titleMarathi}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-brand-gold font-mono font-bold">
                    {evt.category}
                  </span>
                </div>
              )}

              {/* Title & Category Row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {!evt.image && (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-brand-gold/15 text-brand-gold border border-brand-gold/30 block w-fit mb-1">
                      {evt.category}
                    </span>
                  )}
                  <h4 className="font-bold text-sm sm:text-base text-white leading-snug">
                    {lang === 'EN' ? evt.title : evt.titleMarathi}
                  </h4>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    {lang === 'EN' ? evt.titleMarathi : evt.title}
                  </span>
                </div>
              </div>

              {/* Date, Time & Location */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300 font-mono bg-black/40 p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-brand-gold shrink-0" />
                  <span className="truncate">{evt.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-brand-gold shrink-0" />
                  <span className="truncate">{evt.time}</span>
                </div>
                {(evt as any).location && (
                  <div className="col-span-2 flex items-center gap-1.5 text-gray-400">
                    <MapPin className="h-3 w-3 text-brand-saffron shrink-0" />
                    <span className="truncate">{(evt as any).location}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                {lang === 'EN' ? evt.description : evt.descriptionMarathi}
              </p>
            </div>

            {/* Bottom Row: RSVPs & Action Buttons */}
            <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
              <span className="text-[11px] text-emerald-300 font-mono flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{evt.rsvpCount || 0} Devotees Attending</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(evt)}
                  className="px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>{lang === 'EN' ? 'Edit' : 'संपादित करा'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(evt.id, evt.titleMarathi)}
                  className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>{lang === 'EN' ? 'Delete' : 'हटवा'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-2 border-brand-gold/40 rounded-2xl p-5 sm:p-6 w-full max-w-xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-gold" />
                <h4 className="font-bold text-white text-base">
                  {editingEvent 
                    ? (lang === 'EN' ? 'Edit Utsav Schedule Event' : 'उत्सव कार्यक्रम संपादित करा')
                    : (lang === 'EN' ? 'Add New Utsav Event' : 'नवीन उत्सव कार्यक्रम जोडा')}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white font-black p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              
              {/* Title Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Event Title (Marathi) *' : 'उत्सवाचे नाव (मराठी) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitleMR}
                    onChange={(e) => setFormTitleMR(e.target.value)}
                    placeholder="उदा. श्री इश्वटी घटस्थापना महोत्सव"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Event Title (English)' : 'उत्सवाचे नाव (English)'}
                  </label>
                  <input
                    type="text"
                    value={formTitleEN}
                    onChange={(e) => setFormTitleEN(e.target.value)}
                    placeholder="e.g. Shree Ishwati Ghatasthapana Mahotsav"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
                  />
                </div>
              </div>

              {/* Date, Time & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Event Date (YYYY-MM-DD) *' : 'तारीख *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Time Schedule' : 'वेळ'}
                  </label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="उदा. सकाळी ११:०० वा."
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Category' : 'वर्ग'}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
                  >
                    <option value="Festival">Festival (धार्मिक उत्सव)</option>
                    <option value="Community Service">Community Service (समाजसेवा)</option>
                    <option value="Cultural Program">Cultural Program (सांस्कृतिक)</option>
                  </select>
                </div>
              </div>

              {/* Location & RSVP count */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Location / Venue' : 'स्थळ'}
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="उदा. श्री यंग इश्वटी नवरात्रौत्सव मुख्य सभामंडप"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'RSVP Count' : 'उपस्थिती संख्या'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formRsvpCount}
                    onChange={(e) => setFormRsvpCount(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs font-mono"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">
                  {lang === 'EN' ? 'Description (Marathi) *' : 'तपशील (मराठी) *'}
                </label>
                <textarea
                  rows={2}
                  required
                  value={formDescMR}
                  onChange={(e) => setFormDescMR(e.target.value)}
                  placeholder="उदा. घटस्थापना पूजा आणि महाआरती संपन्न होणार आहे..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">
                  {lang === 'EN' ? 'Description (English)' : 'तपशील (English)'}
                </label>
                <textarea
                  rows={2}
                  value={formDescEN}
                  onChange={(e) => setFormDescEN(e.target.value)}
                  placeholder="e.g. Auspicious invocation and grand Ghatasthapana rituals..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs resize-none"
                />
              </div>

              {/* Event Poster Upload or URL */}
              <div className="space-y-2 bg-black/40 p-3 rounded-xl border border-white/10">
                <label className="text-gray-300 font-bold block">
                  {lang === 'EN' ? 'Event Poster Image (Optional)' : 'उत्सव छायाचित्र / पोस्टर (ऐच्छिक)'}
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleSelectImageFile}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-black/60 hover:bg-black/90 border border-brand-gold/40 text-brand-gold rounded-xl font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{imageFile ? imageFile.name : (lang === 'EN' ? 'Choose Image File' : 'डिव्हाइसवरून प्रतिमा निवडा')}</span>
                  </button>

                  <span className="text-gray-400 text-[10px]">or URL:</span>

                  <input
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://.../event-poster.jpg"
                    className="flex-1 w-full bg-zinc-900 border border-white/10 rounded-xl py-1.5 px-2.5 text-white text-xs font-mono"
                  />
                </div>

                {imagePreview && (
                  <div className="mt-2 h-24 w-36 rounded-lg overflow-hidden border border-brand-gold/40 bg-black">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-xl font-bold cursor-pointer"
                >
                  {lang === 'EN' ? 'Cancel' : 'रद्द करा'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isImageUploading}
                  className="px-5 py-2 bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-black rounded-xl hover:opacity-95 shadow cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting 
                    ? (lang === 'EN' ? 'Saving...' : 'जतन होत आहे...')
                    : (editingEvent ? (lang === 'EN' ? 'Update Event' : 'कार्यक्रम अद्यतन करा') : (lang === 'EN' ? 'Save Event' : 'कार्यक्रम जतन करा'))}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
