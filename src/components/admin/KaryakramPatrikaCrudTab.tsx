/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ScrollText, Plus, Edit2, Trash2, Calendar, Clock, 
  RotateCcw, Search, CheckCircle, AlertCircle, Sparkles, X, 
  Save, Filter, MapPin, Tag, Palette, FileText
} from 'lucide-react';
import { 
  NavratriPatrikaDay, 
  PatrikaSubEvent, 
  PatrikaMetadata,
  NAVRATRI_PATRIKA_2026, 
  MANDAL_PATRIKA_METADATA,
  subscribeKaryakramPatrika,
  saveKaryakramPatrika,
  addPatrikaDay,
  updatePatrikaDay,
  deletePatrikaDay,
  updatePatrikaMetadata,
  resetPatrikaToDefault,
  getCachedPatrikaDays,
  getCachedPatrikaMetadata
} from '../../services/karyakramPatrikaService';

interface KaryakramPatrikaCrudTabProps {
  lang: 'EN' | 'MR';
}

export const KaryakramPatrikaCrudTab: React.FC<KaryakramPatrikaCrudTabProps> = ({ lang }) => {
  const [days, setDays] = useState<NavratriPatrikaDay[]>(getCachedPatrikaDays());
  const [metadata, setMetadata] = useState<PatrikaMetadata>(getCachedPatrikaMetadata());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Day Form Modal States
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<NavratriPatrikaDay | null>(null);

  // Day Form inputs
  const [formDayId, setFormDayId] = useState('');
  const [formDayIndex, setFormDayIndex] = useState<number>(1);
  const [formDayNameMR, setFormDayNameMR] = useState('');
  const [formDayNameEN, setFormDayNameEN] = useState('');
  const [formDateStrMR, setFormDateStrMR] = useState('');
  const [formDateStrEN, setFormDateStrEN] = useState('');
  const [formDateIso, setFormDateIso] = useState('');
  const [formDefaultTimeMR, setFormDefaultTimeMR] = useState('');
  const [formDefaultTimeEN, setFormDefaultTimeEN] = useState('');
  const [formCategory, setFormCategory] = useState<'pooja' | 'devotional' | 'cultural' | 'havan' | 'visarjan' | 'auction' | 'general'>('pooja');
  const [formDeviRoopMR, setFormDeviRoopMR] = useState('');
  const [formDeviRoopEN, setFormDeviRoopEN] = useState('');
  const [formColorNameMR, setFormColorNameMR] = useState('');
  const [formColorNameEN, setFormColorNameEN] = useState('');
  const [formColorHex, setFormColorHex] = useState('#D4AF37');
  const [formEvents, setFormEvents] = useState<PatrikaSubEvent[]>([]);

  // Sub-event input inside Day modal
  const [subTime, setSubTime] = useState('');
  const [subTitleMR, setSubTitleMR] = useState('');
  const [subTitleEN, setSubTitleEN] = useState('');
  const [subDescMR, setSubDescMR] = useState('');
  const [subDescEN, setSubDescEN] = useState('');
  const [subVenueMR, setSubVenueMR] = useState('');
  const [subVenueEN, setSubVenueEN] = useState('');

  // Metadata Edit Modal
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [metaYearMR, setMetaYearMR] = useState(metadata.yearLabelMr || '');
  const [metaYearEN, setMetaYearEN] = useState(metadata.yearLabelEn || '');
  const [metaMandalMR, setMetaMandalMR] = useState(metadata.mandalNameMr || '');
  const [metaMandalEN, setMetaMandalEN] = useState(metadata.mandalNameEn || '');
  const [metaInvocationMR, setMetaInvocationMR] = useState(metadata.invocationMr || '');
  const [metaInvocationEN, setMetaInvocationEN] = useState(metadata.invocationEn || '');
  const [metaNoticeMR, setMetaNoticeMR] = useState(metadata.specialNoticeMr || '');
  const [metaNoticeEN, setMetaNoticeEN] = useState(metadata.specialNoticeEn || '');

  // Status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeKaryakramPatrika(
      (newDays) => setDays(newDays),
      (newMeta) => {
        setMetadata(newMeta);
        setMetaYearMR(newMeta.yearLabelMr);
        setMetaYearEN(newMeta.yearLabelEn);
        setMetaMandalMR(newMeta.mandalNameMr);
        setMetaMandalEN(newMeta.mandalNameEn);
        setMetaInvocationMR(newMeta.invocationMr);
        setMetaInvocationEN(newMeta.invocationEn);
        setMetaNoticeMR(newMeta.specialNoticeMr);
        setMetaNoticeEN(newMeta.specialNoticeEn);
      }
    );
    return () => unsub();
  }, []);

  const clearMessages = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleOpenAddDay = () => {
    clearMessages();
    setEditingDay(null);
    setFormDayId(`patrika-day-${Date.now()}`);
    setFormDayIndex(days.length + 1);
    setFormDayNameMR('शनिवार');
    setFormDayNameEN('Saturday');
    setFormDateStrMR('१०/१०/२०२६');
    setFormDateStrEN('10/10/2026');
    setFormDateIso('2026-10-10');
    setFormDefaultTimeMR('संध्याकाळी ०५:०० वाजता');
    setFormDefaultTimeEN('05:00 PM onwards');
    setFormCategory('pooja');
    setFormDeviRoopMR('शैलपुत्री');
    setFormDeviRoopEN('Shailaputri');
    setFormColorNameMR('पिवळा');
    setFormColorNameEN('Yellow');
    setFormColorHex('#EAB308');
    setFormEvents([]);
    setIsDayModalOpen(true);
  };

  const handleOpenEditDay = (day: NavratriPatrikaDay) => {
    clearMessages();
    setEditingDay(day);
    setFormDayId(day.id);
    setFormDayIndex(day.dayIndex || 1);
    setFormDayNameMR(day.dayNameMr);
    setFormDayNameEN(day.dayNameEn);
    setFormDateStrMR(day.dateStrMr);
    setFormDateStrEN(day.dateStrEn);
    setFormDateIso(day.dateIso);
    setFormDefaultTimeMR(day.defaultTimeMr || '');
    setFormDefaultTimeEN(day.defaultTimeEn || '');
    setFormCategory((day.category as any) || 'pooja');
    setFormDeviRoopMR(day.deviRoopMr || '');
    setFormDeviRoopEN(day.deviRoopEn || '');
    setFormColorNameMR(day.colorNameMr || '');
    setFormColorNameEN(day.colorNameEn || '');
    setFormColorHex(day.colorHex || '#D4AF37');
    setFormEvents(day.events || []);
    setIsDayModalOpen(true);
  };

  const handleAddSubEvent = () => {
    if (!subTitleMR.trim() && !subTitleEN.trim()) return;

    const newSub: PatrikaSubEvent = {
      id: `sub-${Date.now()}`,
      time: subTime.trim() || 'वेळ',
      titleMr: subTitleMR.trim() || subTitleEN.trim(),
      titleEn: subTitleEN.trim() || subTitleMR.trim(),
      descriptionMr: subDescMR.trim(),
      descriptionEn: subDescEN.trim(),
      venueMr: subVenueMR.trim(),
      venueEn: subVenueEN.trim()
    };

    setFormEvents([...formEvents, newSub]);
    setSubTime('');
    setSubTitleMR('');
    setSubTitleEN('');
    setSubDescMR('');
    setSubDescEN('');
    setSubVenueMR('');
    setSubVenueEN('');
  };

  const handleRemoveSubEvent = (index: number) => {
    setFormEvents(formEvents.filter((_, i) => i !== index));
  };

  const handleSaveDay = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!formDayNameMR.trim() || !formDateStrMR.trim()) {
      setErrorMsg(lang === 'EN' ? 'Day name and date are required.' : 'दिवसाचे नाव आणि तारीख आवश्यक आहे.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: NavratriPatrikaDay = {
        id: formDayId,
        dayIndex: Number(formDayIndex) || 1,
        dayNameMr: formDayNameMR.trim(),
        dayNameEn: formDayNameEN.trim() || formDayNameMR.trim(),
        dateStrMr: formDateStrMR.trim(),
        dateStrEn: formDateStrEN.trim() || formDateStrMR.trim(),
        dateIso: formDateIso.trim() || '2026-10-10',
        defaultTimeMr: formDefaultTimeMR.trim(),
        defaultTimeEn: formDefaultTimeEN.trim(),
        category: formCategory,
        categoryLabelMr: formCategory === 'pooja' ? 'विशेष पूजा' : formCategory === 'cultural' ? 'सांस्कृतिक कार्यक्रम' : formCategory === 'devotional' ? 'भक्ती संगीत' : formCategory === 'havan' ? 'हवन' : formCategory === 'visarjan' ? 'विसर्जन' : formCategory === 'auction' ? 'लिलाव' : 'उत्सव',
        categoryLabelEn: formCategory === 'pooja' ? 'Special Pooja' : formCategory === 'cultural' ? 'Cultural Events' : formCategory === 'devotional' ? 'Devotional Music' : formCategory === 'havan' ? 'Havan' : formCategory === 'visarjan' ? 'Immersion' : formCategory === 'auction' ? 'Auction' : 'Celebrations',
        deviRoopMr: formDeviRoopMR.trim() || undefined,
        deviRoopEn: formDeviRoopEN.trim() || undefined,
        colorNameMr: formColorNameMR.trim() || undefined,
        colorNameEn: formColorNameEN.trim() || undefined,
        colorHex: formColorHex || undefined,
        events: formEvents
      };

      if (editingDay) {
        await updatePatrikaDay(editingDay.id, payload);
        setSuccessMsg(lang === 'EN' ? 'Patrika Day updated successfully!' : 'पत्रिका दिवस यशस्वीरित्या अद्यतनित केला!');
      } else {
        await addPatrikaDay(payload);
        setSuccessMsg(lang === 'EN' ? 'New Patrika Day added successfully!' : 'नवीन पत्रिका दिवस जोडला गेला!');
      }
      setIsDayModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save Patrika day.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDay = async (id: string, name: string) => {
    if (!window.confirm(
      lang === 'EN'
        ? `Are you sure you want to delete "${name}" from Patrika?`
        : `तुम्हाला खात्री आहे का की "${name}" दिवस पत्रिकेतून हटवायचा आहे?`
    )) {
      return;
    }

    clearMessages();
    try {
      await deletePatrikaDay(id);
      setSuccessMsg(lang === 'EN' ? `Patrika day "${name}" deleted.` : `"${name}" पत्रिका दिवस हटविला गेला.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete day.');
    }
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);
    try {
      await updatePatrikaMetadata({
        yearLabelMr: metaYearMR.trim(),
        yearLabelEn: metaYearEN.trim(),
        mandalNameMr: metaMandalMR.trim(),
        mandalNameEn: metaMandalEN.trim(),
        invocationMr: metaInvocationMR.trim(),
        invocationEn: metaInvocationEN.trim(),
        specialNoticeMr: metaNoticeMR.trim(),
        specialNoticeEn: metaNoticeEN.trim()
      });
      setSuccessMsg(lang === 'EN' ? 'Patrika metadata and banners updated!' : 'पत्रिका शीर्षक व फलक अद्यतनित केले!');
      setIsMetaModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update metadata.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPatrika = async () => {
    if (!window.confirm(
      lang === 'EN'
        ? 'Are you sure you want to restore the authentic official 2026 13-day festival program?'
        : 'तुम्हाला खात्री आहे का की मूळ अधिकृत २०२६ चे १३-दिवसीय कार्यक्रम वेळापत्रक पुनर्संचयित करायचे आहे?'
    )) {
      return;
    }

    clearMessages();
    try {
      await resetPatrikaToDefault();
      setSuccessMsg(
        lang === 'EN'
          ? 'Karyakram Patrika reset to authentic 2026 printed schedule!'
          : 'कार्यक्रम पत्रिका मूळ अधिकृत मुद्रित पत्रिकेनुसार पूर्ववत झाली!'
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset Patrika.');
    }
  };

  const filteredDays = days.filter((day) => {
    const matchesCategory = selectedCategory === 'all' || day.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      day.dayNameMr.toLowerCase().includes(q) ||
      day.dayNameEn.toLowerCase().includes(q) ||
      day.dateStrMr.toLowerCase().includes(q) ||
      day.dateStrEn.toLowerCase().includes(q) ||
      (day.deviRoopMr && day.deviRoopMr.toLowerCase().includes(q)) ||
      day.events?.some((e) => e.titleMr.toLowerCase().includes(q) || e.titleEn.toLowerCase().includes(q))
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
            <ScrollText className="h-5 w-5 text-brand-gold" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              {lang === 'EN' ? '4. Karyakram Patrika Management (CRUD)' : '४. कार्यक्रम पत्रिका व्यवस्थापन (CRUD)'}
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40">
              {metadata.yearLabelMr || '५३ वे वर्ष'}
            </span>
          </div>
          <p className="text-gray-400 mt-1 text-[11px] leading-relaxed">
            {lang === 'EN'
              ? 'Manage all 13 official festival days, daily Devi avatars, sacred color codes, pooja schedules, cultural events, and executive notices.'
              : 'अधिकृत १३ उत्सव दिवस, देवीची रूपे, पवित्र रंग, पूजा व सांस्कृतिक कार्यक्रम आणि विशेष सूचना व्यवस्थापित करा.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => setIsMetaModalOpen(true)}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-brand-gold border border-brand-gold/30 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{lang === 'EN' ? 'Edit Patrika Banner' : 'पत्रिका फलक संपादन'}</span>
          </button>
          <button
            type="button"
            onClick={handleResetPatrika}
            className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-500/40 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow"
          >
            <RotateCcw className="h-3.5 w-3.5 text-red-300" />
            <span>{lang === 'EN' ? 'Reset to Default' : 'मूळ पत्रिका पूर्ववत करा'}</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddDay}
            className="px-4 py-1.5 bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-bold rounded-xl hover:opacity-95 shadow flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{lang === 'EN' ? 'Add Patrika Day' : 'नवीन दिवस जोडा'}</span>
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
            placeholder={lang === 'EN' ? 'Search by date, day, or event...' : 'तारीख, दिवस किंवा कार्यक्रमाने शोधा...'}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
          >
            <option value="all">{lang === 'EN' ? 'All Categories (सर्व वर्ग)' : 'सर्व वर्ग'}</option>
            <option value="pooja">Pooja / घटस्थापना</option>
            <option value="devotional">Devotional / भजन-गोंधळ</option>
            <option value="cultural">Cultural / सांस्कृतिक-खेळ</option>
            <option value="havan">Havan / महाप्रसाद</option>
            <option value="visarjan">Visarjan / विसर्जन मिरवणूक</option>
            <option value="auction">Auction / लिलाव</option>
          </select>
        </div>

        <div className="flex items-center justify-end text-gray-400 font-mono text-[11px]">
          <span>{lang === 'EN' ? 'Total Days' : 'एकूण दिवस'}: <strong>{days.length}</strong></span>
        </div>
      </div>

      {/* Days List Grid */}
      <div className="space-y-3">
        {filteredDays.map((day) => (
          <div
            key={day.id}
            className="p-4 rounded-2xl bg-zinc-900/80 border border-brand-gold/20 hover:border-brand-gold/50 transition-all space-y-3 shadow-md"
          >
            {/* Top Row: Day index, Name, Date, Devi Roop & Color */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-brand-red text-white border border-brand-gold/40">
                  {lang === 'EN' ? `Day ${day.dayIndex}` : `दिवस ${day.dayIndex}`}
                </span>

                <span className="font-bold text-sm text-brand-gold">
                  {lang === 'EN' ? `${day.dayNameEn}, ${day.dateStrEn}` : `${day.dayNameMr}, ${day.dateStrMr}`}
                </span>

                <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-black/60 text-gray-300 border border-white/10">
                  {day.category}
                </span>

                {day.colorHex && (
                  <span 
                    className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 text-white"
                    style={{ backgroundColor: day.colorHex }}
                  >
                    <span>{lang === 'EN' ? day.colorNameEn : day.colorNameMr}</span>
                  </span>
                )}

                {day.deviRoopMr && (
                  <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold">
                    देवी रूप: {lang === 'EN' ? day.deviRoopEn : day.deviRoopMr}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEditDay(day)}
                  className="px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>{lang === 'EN' ? 'Edit' : 'संपादित करा'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDay(day.id, day.dayNameMr)}
                  className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>{lang === 'EN' ? 'Delete' : 'हटवा'}</span>
                </button>
              </div>
            </div>

            {/* Sub-Events List */}
            <div className="space-y-1.5 pl-1 sm:pl-2">
              {day.events && day.events.length > 0 ? (
                day.events.map((evt, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <span className="text-brand-saffron font-bold font-mono shrink-0 min-w-[70px]">
                      {evt.time || '•'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-white">
                        {lang === 'EN' ? evt.titleEn : evt.titleMr}
                      </span>
                      {evt.venueMr && (
                        <span className="text-[10px] text-gray-400 ml-2">
                          📍 {lang === 'EN' ? evt.venueEn : evt.venueMr}
                        </span>
                      )}
                      {(evt.descriptionMr || evt.descriptionEn) && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {lang === 'EN' ? (evt.descriptionEn || evt.descriptionMr) : (evt.descriptionMr || evt.descriptionEn)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-[11px] text-gray-500 italic">
                  {lang === 'EN' ? 'No sub-events listed for this day.' : 'या दिवसासाठी उप-कार्यक्रम नोंदवलेले नाहीत.'}
                </span>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* ADD / EDIT PATRIKA DAY MODAL */}
      {isDayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-2 border-brand-gold/40 rounded-2xl p-5 sm:p-6 w-full max-w-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-brand-gold" />
                <h4 className="font-bold text-white text-base">
                  {editingDay 
                    ? (lang === 'EN' ? `Edit Patrika Day ${formDayIndex}` : `पत्रिका दिवस ${formDayIndex} संपादित करा`)
                    : (lang === 'EN' ? 'Add New Patrika Day' : 'नवीन पत्रिका दिवस जोडा')}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsDayModalOpen(false)}
                className="text-gray-400 hover:text-white font-black p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDay} className="space-y-4">
              
              {/* Day Index & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Day Index Number *' : 'दिवस क्रमांक (#) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={formDayIndex}
                    onChange={(e) => setFormDayIndex(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Event Category *' : 'उत्सव वर्ग *'}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
                  >
                    <option value="pooja">Pooja / घटस्थापना</option>
                    <option value="devotional">Devotional / भजन-गोंधळ</option>
                    <option value="cultural">Cultural / सांस्कृतिक-खेळ</option>
                    <option value="havan">Havan / महाप्रसाद</option>
                    <option value="visarjan">Visarjan / विसर्जन मिरवणूक</option>
                    <option value="auction">Auction / लिलाव</option>
                    <option value="general">General / सर्वसाधारण</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Date ISO (YYYY-MM-DD)' : 'कॅलेंडर तारीख (ISO)'}
                  </label>
                  <input
                    type="date"
                    value={formDateIso}
                    onChange={(e) => setFormDateIso(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs font-mono"
                  />
                </div>
              </div>

              {/* Day Name MR & EN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Day Name (Marathi) *' : 'वार / दिवस नाव (मराठी) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formDayNameMR}
                    onChange={(e) => setFormDayNameMR(e.target.value)}
                    placeholder="उदा. शनिवार"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Day Name (English) *' : 'वार नाव (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formDayNameEN}
                    onChange={(e) => setFormDayNameEN(e.target.value)}
                    placeholder="e.g. Saturday"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
                  />
                </div>
              </div>

              {/* Date String MR & EN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Date Text (Marathi) *' : 'तारीख मजकूर (मराठी) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formDateStrMR}
                    onChange={(e) => setFormDateStrMR(e.target.value)}
                    placeholder="उदा. १०/१०/२०२६"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Date Text (English) *' : 'तारीख मजकूर (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formDateStrEN}
                    onChange={(e) => setFormDateStrEN(e.target.value)}
                    placeholder="e.g. 10/10/2026"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
                  />
                </div>
              </div>

              {/* Devi Avatar & Sacred Color */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black/40 p-3 rounded-xl border border-white/10">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Devi Avatar (देवी रूप)' : 'देवी रूप (मराठी)'}
                  </label>
                  <input
                    type="text"
                    value={formDeviRoopMR}
                    onChange={(e) => setFormDeviRoopMR(e.target.value)}
                    placeholder="उदा. शैलपुत्री"
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg py-1.5 px-2.5 text-white focus:outline-none focus:border-brand-gold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Color Name (रंग)' : 'पवित्र रंग नाव'}
                  </label>
                  <input
                    type="text"
                    value={formColorNameMR}
                    onChange={(e) => setFormColorNameMR(e.target.value)}
                    placeholder="उदा. पिवळा"
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg py-1.5 px-2.5 text-white focus:outline-none focus:border-brand-gold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Color Swatch Hex' : 'रंग कोड (Hex)'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formColorHex}
                      onChange={(e) => setFormColorHex(e.target.value)}
                      className="h-8 w-10 bg-transparent cursor-pointer rounded"
                    />
                    <input
                      type="text"
                      value={formColorHex}
                      onChange={(e) => setFormColorHex(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg py-1.5 px-2 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Sub-Events Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-brand-gold font-bold text-xs uppercase tracking-wider block">
                    {lang === 'EN' ? 'Daily Program Events (त्या दिवसाचे कार्यक्रम)' : 'त्या दिवसाचे कार्यक्रम व वेळापत्रक'} ({formEvents.length})
                  </label>
                </div>

                {/* Sub-Events List */}
                <div className="space-y-2">
                  {formEvents.map((evt, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-brand-saffron font-bold font-mono text-xs">{evt.time}</span>
                          <span className="font-bold text-white text-xs">{evt.titleMr}</span>
                          {evt.venueMr && <span className="text-[10px] text-gray-400">📍 {evt.venueMr}</span>}
                        </div>
                        {evt.descriptionMr && <p className="text-[10px] text-gray-400 mt-0.5">{evt.descriptionMr}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubEvent(idx)}
                        className="text-red-400 hover:text-red-200 p-1"
                        title="Remove Sub-event"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Sub-Event Input Block */}
                <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-2">
                  <span className="text-[10px] font-bold text-gray-300 uppercase block">
                    {lang === 'EN' ? '+ Add Program to this Day' : '+ या दिवसासाठी कार्यक्रम जोडा'}
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={subTime}
                      onChange={(e) => setSubTime(e.target.value)}
                      placeholder="वेळ (उदा. सायं. ०६:०० वा.)"
                      className="bg-zinc-900 border border-white/10 rounded-lg py-1.5 px-2.5 text-white text-xs"
                    />
                    <input
                      type="text"
                      value={subTitleMR}
                      onChange={(e) => setSubTitleMR(e.target.value)}
                      placeholder="कार्यक्रमाचे नाव (मराठी) *"
                      className="bg-zinc-900 border border-white/10 rounded-lg py-1.5 px-2.5 text-white text-xs sm:col-span-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={subDescMR}
                      onChange={(e) => setSubDescMR(e.target.value)}
                      placeholder="तपशील (उदा. जीवन विद्या मिशन - उपासना यज्ञ)"
                      className="bg-zinc-900 border border-white/10 rounded-lg py-1.5 px-2.5 text-white text-xs"
                    />
                    <input
                      type="text"
                      value={subVenueMR}
                      onChange={(e) => setSubVenueMR(e.target.value)}
                      placeholder="स्थळ (उदा. उदय खातू कारखाना मैदान)"
                      className="bg-zinc-900 border border-white/10 rounded-lg py-1.5 px-2.5 text-white text-xs"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddSubEvent}
                      className="px-3 py-1 bg-brand-gold text-brand-maroon font-bold rounded-lg text-xs hover:opacity-90 cursor-pointer"
                    >
                      + {lang === 'EN' ? 'Add Event' : 'कार्यक्रम जोडा'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsDayModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-xl font-bold cursor-pointer"
                >
                  {lang === 'EN' ? 'Cancel' : 'रद्द करा'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-black rounded-xl hover:opacity-95 shadow cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting 
                    ? (lang === 'EN' ? 'Saving...' : 'जतन होत आहे...')
                    : (editingDay ? (lang === 'EN' ? 'Update Day' : 'दिवस अद्यतनित करा') : (lang === 'EN' ? 'Save Day' : 'दिवस जतन करा'))}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* EDIT METADATA MODAL */}
      {isMetaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-2 border-brand-gold/40 rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-gold" />
                <h4 className="font-bold text-white text-base">
                  {lang === 'EN' ? 'Edit Patrika Banner & Invocations' : 'पत्रिका फलक व आवाहन संपादन'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsMetaModalOpen(false)}
                className="text-gray-400 hover:text-white font-black p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMetadata} className="space-y-3">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">Year Label (मराठी)</label>
                  <input
                    type="text"
                    value={metaYearMR}
                    onChange={(e) => setMetaYearMR(e.target.value)}
                    placeholder="५३ वे वर्ष"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">Year Label (English)</label>
                  <input
                    type="text"
                    value={metaYearEN}
                    onChange={(e) => setMetaYearEN(e.target.value)}
                    placeholder="53rd Year"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">Mandal Name (मराठी)</label>
                <input
                  type="text"
                  value={metaMandalMR}
                  onChange={(e) => setMetaMandalMR(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">Invocation (पावन आवाहन)</label>
                <input
                  type="text"
                  value={metaInvocationMR}
                  onChange={(e) => setMetaInvocationMR(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">Special Notice (विशेष सूचना)</label>
                <textarea
                  rows={3}
                  value={metaNoticeMR}
                  onChange={(e) => setMetaNoticeMR(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsMetaModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-xl font-bold cursor-pointer"
                >
                  {lang === 'EN' ? 'Cancel' : 'रद्द करा'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-gold text-brand-maroon font-black rounded-xl hover:opacity-95 shadow cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (lang === 'EN' ? 'Saving...' : 'जतन होत आहे...') : (lang === 'EN' ? 'Save Metadata' : 'माहिती जतन करा')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
