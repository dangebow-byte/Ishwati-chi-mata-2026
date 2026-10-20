/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Milestone, Plus, Edit2, Trash2, MoveUp, MoveDown, 
  RotateCcw, CheckCircle, AlertCircle, Sparkles, X, Save, History, Star
} from 'lucide-react';
import { 
  HistoricalMilestone, 
  DEFAULT_MILESTONES,
  subscribeMilestones,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  saveMilestones,
  resetMilestonesToDefault,
  getCachedMilestones
} from '../../services/milestonesService';

interface HistoricalMilestonesCrudTabProps {
  lang: 'EN' | 'MR';
}

export const HistoricalMilestonesCrudTab: React.FC<HistoricalMilestonesCrudTabProps> = ({ lang }) => {
  const [milestones, setMilestones] = useState<HistoricalMilestone[]>(getCachedMilestones());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<HistoricalMilestone | null>(null);

  // Form states
  const [formId, setFormId] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formTitleMR, setFormTitleMR] = useState('');
  const [formTitleEN, setFormTitleEN] = useState('');
  const [formDescMR, setFormDescMR] = useState('');
  const [formDescEN, setFormDescEN] = useState('');
  const [formBadgeMR, setFormBadgeMR] = useState('महत्त्वाचा टप्पा');
  const [formBadgeEN, setFormBadgeEN] = useState('Verified Milestone');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);

  // Status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeMilestones((items) => {
      setMilestones(items);
    });
    return () => unsub();
  }, []);

  const clearMessages = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleOpenAdd = () => {
    clearMessages();
    setEditingMilestone(null);
    setFormId(`milestone-${Date.now()}`);
    setFormYear('२०२६');
    setFormTitleMR('');
    setFormTitleEN('');
    setFormDescMR('');
    setFormDescEN('');
    setFormBadgeMR('महत्त्वाचा टप्पा');
    setFormBadgeEN('Verified Milestone');
    setFormDisplayOrder(milestones.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: HistoricalMilestone) => {
    clearMessages();
    setEditingMilestone(item);
    setFormId(item.id);
    setFormYear(item.year);
    setFormTitleMR(item.titleMarathi);
    setFormTitleEN(item.title);
    setFormDescMR(item.descriptionMarathi);
    setFormDescEN(item.description);
    setFormBadgeMR(item.badgeMR || 'महत्त्वाचा टप्पा');
    setFormBadgeEN(item.badgeEN || 'Verified Milestone');
    setFormDisplayOrder(item.displayOrder || 1);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!formYear.trim() || !formTitleMR.trim()) {
      setErrorMsg(lang === 'EN' ? 'Year and Marathi title are required.' : 'वर्ष आणि मराठी शीर्षक आवश्यक आहे.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: HistoricalMilestone = {
        id: formId,
        year: formYear.trim(),
        title: formTitleEN.trim() || formTitleMR.trim(),
        titleMarathi: formTitleMR.trim(),
        description: formDescEN.trim() || formDescMR.trim(),
        descriptionMarathi: formDescMR.trim(),
        badgeMR: formBadgeMR.trim() || 'महत्त्वाचा टप्पा',
        badgeEN: formBadgeEN.trim() || 'Verified Milestone',
        displayOrder: Number(formDisplayOrder) || 1
      };

      if (editingMilestone) {
        await updateMilestone(editingMilestone.id, payload);
        setSuccessMsg(lang === 'EN' ? 'Milestone updated successfully!' : 'ऐतिहासिक टप्पा यशस्वीरित्या अद्यतनित केला!');
      } else {
        await addMilestone(payload);
        setSuccessMsg(lang === 'EN' ? 'New milestone added to chronicle!' : 'नवीन ऐतिहासिक टप्पा यशस्वीरित्या जोडला!');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save milestone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, year: string) => {
    if (!window.confirm(
      lang === 'EN'
        ? `Are you sure you want to delete milestone year "${year}"?`
        : `तुम्हाला खात्री आहे का की "${year}" चा ऐतिहासिक टप्पा हटवायचा आहे?`
    )) {
      return;
    }

    clearMessages();
    try {
      await deleteMilestone(id);
      setSuccessMsg(lang === 'EN' ? `Milestone ${year} deleted.` : `${year} चा टप्पा हटविला गेला.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete milestone.');
    }
  };

  const handleMoveOrder = async (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= milestones.length) return;

    clearMessages();
    const copy = [...milestones];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;

    const reindexed = copy.map((item, i) => ({
      ...item,
      displayOrder: i + 1
    }));

    try {
      await saveMilestones(reindexed);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reorder milestones.');
    }
  };

  const handleResetToDefault = async () => {
    if (!window.confirm(
      lang === 'EN'
        ? 'Are you sure you want to restore the authentic official chronicle milestones (1974 to 2026)?'
        : 'तुम्हाला खात्री आहे का की मूळ अधिकृत ऐतिहासिक प्रवास आलेख (१९७४ ते २०२६) पूर्ववत करायचा आहे?'
    )) {
      return;
    }

    clearMessages();
    try {
      await resetMilestonesToDefault();
      setSuccessMsg(
        lang === 'EN'
          ? 'Historical chronicle milestones reset to authentic timeline!'
          : 'ऐतिहासिक प्रवास आलेख मूळ अधिकृत कालरेषेनुसार पूर्ववत झाला!'
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset milestones.');
    }
  };

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

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-brand-gold" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              {lang === 'EN' ? '5. ऐतिहासिक प्रवास आलेख (Historical Journey Timeline CRUD)' : '५. ऐतिहासिक प्रवास आलेख व्यवस्थापन (CRUD)'}
            </h3>
          </div>
          <p className="text-gray-400 mt-1 text-[11px] leading-relaxed">
            {lang === 'EN'
              ? 'Manage the interactive timeline milestones shown in the About Sanctum section from foundation in 1974 to the modern era.'
              : 'मंदिराच्या इतिहास विभागातील १९७४ पासूनच्या स्थापनेचे सुवर्ण टप्पे जोडा, संपादित करा, किंवा क्रम बदला.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-500/40 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow"
          >
            <RotateCcw className="h-3.5 w-3.5 text-red-300" />
            <span>{lang === 'EN' ? 'Reset to Default' : 'मूळ आलेख पूर्ववत करा'}</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-1.5 bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-bold rounded-xl hover:opacity-95 shadow flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{lang === 'EN' ? 'Add Milestone' : 'नवीन टप्पा जोडा'}</span>
          </button>
        </div>
      </div>

      {/* Milestones Timeline Grid */}
      <div className="space-y-3">
        {milestones.map((item, idx) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-zinc-900/80 border border-brand-gold/25 hover:border-brand-gold/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md"
          >
            {/* Year & Details */}
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-black/60 border border-brand-gold/40 shrink-0 min-w-[70px]">
                <Star className="h-4 w-4 text-brand-gold mb-1" />
                <span className="text-base sm:text-lg font-black text-brand-saffron font-mono tracking-tight">
                  {item.year}
                </span>
                <span className="text-[9px] text-gray-400 font-mono">#{item.displayOrder || idx + 1}</span>
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm sm:text-base text-white">
                    {lang === 'EN' ? item.title : item.titleMarathi}
                  </h4>
                  <span className="text-[10px] px-2 py-0.2 rounded font-bold bg-brand-gold/15 text-brand-gold border border-brand-gold/30">
                    {lang === 'EN' ? (item.badgeEN || 'Verified Milestone') : (item.badgeMR || 'महत्त्वाचा टप्पा')}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  {lang === 'EN' ? item.description : item.descriptionMarathi}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => handleMoveOrder(idx, 'up')}
                className="p-1.5 rounded-lg bg-black/40 hover:bg-black/80 text-gray-300 hover:text-white border border-white/10 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                title="Move Earlier in Timeline"
              >
                <MoveUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={idx === milestones.length - 1}
                onClick={() => handleMoveOrder(idx, 'down')}
                className="p-1.5 rounded-lg bg-black/40 hover:bg-black/80 text-gray-300 hover:text-white border border-white/10 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                title="Move Later in Timeline"
              >
                <MoveDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 rounded-lg cursor-pointer transition-all"
                title="Edit Milestone"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id, item.year)}
                className="p-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 rounded-lg cursor-pointer transition-all"
                title="Delete Milestone"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-2 border-brand-gold/40 rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-brand-gold" />
                <h4 className="font-bold text-white text-base">
                  {editingMilestone 
                    ? (lang === 'EN' ? `Edit Milestone (${formYear})` : `ऐतिहासिक टप्पा संपादित करा (${formYear})`)
                    : (lang === 'EN' ? 'Add New Milestone to Chronicle' : 'नवीन ऐतिहासिक टप्पा जोडा')}
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

            <form onSubmit={handleSave} className="space-y-3">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Milestone Year *' : 'वर्ष (मराठी/इंग्रजी) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    placeholder="उदा. १९७४ किंवा 2026"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Display Order (#)' : 'प्रदर्शन क्रम (#)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">
                  {lang === 'EN' ? 'Title (Marathi) *' : 'शीर्षक (मराठी) *'}
                </label>
                <input
                  type="text"
                  required
                  value={formTitleMR}
                  onChange={(e) => setFormTitleMR(e.target.value)}
                  placeholder="उदा. श्री यंग इश्वटी नवरात्रौत्सव मंडळाची स्थापना"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">
                  {lang === 'EN' ? 'Title (English)' : 'शीर्षक (English)'}
                </label>
                <input
                  type="text"
                  value={formTitleEN}
                  onChange={(e) => setFormTitleEN(e.target.value)}
                  placeholder="e.g. Foundation of Shree Young Ishwati Mandal"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">
                  {lang === 'EN' ? 'Description (Marathi) *' : 'सविस्तर वृत्तांत (मराठी) *'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescMR}
                  onChange={(e) => setFormDescMR(e.target.value)}
                  placeholder="उदा. स्थानिक तरुणांद्वारे छोट्या लाकडी देव्हाऱ्यात अत्यंत साधेपणाने श्री इश्वटीची मातेची स्थापना..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">
                  {lang === 'EN' ? 'Description (English)' : 'वृत्तांत (English)'}
                </label>
                <textarea
                  rows={3}
                  value={formDescEN}
                  onChange={(e) => setFormDescEN(e.target.value)}
                  placeholder="e.g. Simple wooden altar introduced by energetic local youth..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">Badge (मराठी)</label>
                  <input
                    type="text"
                    value={formBadgeMR}
                    onChange={(e) => setFormBadgeMR(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-1.5 px-3 text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">Badge (English)</label>
                  <input
                    type="text"
                    value={formBadgeEN}
                    onChange={(e) => setFormBadgeEN(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-1.5 px-3 text-white text-xs"
                  />
                </div>
              </div>

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
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-black rounded-xl hover:opacity-95 shadow cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting 
                    ? (lang === 'EN' ? 'Saving...' : 'जतन होत आहे...')
                    : (editingMilestone ? (lang === 'EN' ? 'Update Milestone' : 'टप्पा अद्यतनित करा') : (lang === 'EN' ? 'Save Milestone' : 'टप्पा जतन करा'))}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
