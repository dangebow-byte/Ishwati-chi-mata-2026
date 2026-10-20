/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Eye, 
  EyeOff, 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Filter, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { 
  AppModuleKey, 
  APP_MODULE_DEFINITIONS, 
  ModuleConfigDefinition,
  subscribeModuleVisibility, 
  toggleModuleVisibility, 
  updateAllModuleVisibility,
  resetModuleVisibilityToDefault,
  getCachedModuleVisibility
} from '../../services/moduleVisibilityService';

interface ModuleVisibilityCrudTabProps {
  lang: 'EN' | 'MR';
}

export const ModuleVisibilityCrudTab: React.FC<ModuleVisibilityCrudTabProps> = ({ lang }) => {
  const [visibilityMap, setVisibilityMap] = useState<Record<AppModuleKey, boolean>>(() => getCachedModuleVisibility());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const unsub = subscribeModuleVisibility((map) => {
      setVisibilityMap(map);
    });
    return () => unsub();
  }, []);

  const clearMessages = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleToggle = async (key: AppModuleKey, currentVal: boolean) => {
    clearMessages();
    const nextVal = !currentVal;
    
    // Optimistic UI update
    setVisibilityMap(prev => ({ ...prev, [key]: nextVal }));

    try {
      await toggleModuleVisibility(key, nextVal);
      const mod = APP_MODULE_DEFINITIONS.find(m => m.key === key);
      const modName = lang === 'EN' ? mod?.nameEN : mod?.nameMR;
      setSuccessMsg(
        lang === 'EN'
          ? `Module "${modName}" is now ${nextVal ? 'VISIBLE' : 'HIDDEN'} across the application.`
          : `"${modName}" घटक आता संपूर्ण ॲप्लिकेशनमध्ये ${nextVal ? 'सक्रिय' : 'अप्रकाशित / लपवलेला'} आहे.`
      );
    } catch (err: any) {
      // Revert optimistic update
      setVisibilityMap(prev => ({ ...prev, [key]: currentVal }));
      setErrorMsg(err?.message || (lang === 'EN' ? 'Failed to update visibility.' : 'स्थिती बदलण्यात अयशस्वी.'));
    }
  };

  const handleShowAll = async () => {
    clearMessages();
    setIsUpdating(true);
    try {
      const allTrue = APP_MODULE_DEFINITIONS.reduce((acc, item) => {
        acc[item.key] = true;
        return acc;
      }, {} as Record<AppModuleKey, boolean>);

      setVisibilityMap(allTrue);
      await updateAllModuleVisibility(allTrue);
      setSuccessMsg(lang === 'EN' ? 'All modules are now visible!' : 'सर्व घटक आता दृश्यमान आहेत!');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update modules.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm(lang === 'EN' ? 'Reset all module visibility settings to defaults?' : 'सर्व घटकांची दृश्यमानता पूर्ववत करावी का?')) {
      return;
    }
    clearMessages();
    setIsUpdating(true);
    try {
      await resetModuleVisibilityToDefault();
      setSuccessMsg(lang === 'EN' ? 'Module visibility reset to defaults.' : 'सर्व घटक मूळ स्थितीत पूर्ववत केले गेले.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to reset modules.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Filtered modules
  const filteredModules = useMemo(() => {
    return APP_MODULE_DEFINITIONS.filter(mod => {
      // 1. Category filter
      if (selectedCategory !== 'all' && mod.category !== selectedCategory) {
        return false;
      }

      const isVis = visibilityMap[mod.key] !== false;

      // 2. Status filter
      if (statusFilter === 'visible' && !isVis) return false;
      if (statusFilter === 'hidden' && isVis) return false;

      // 3. Search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesMr = mod.nameMR.toLowerCase().includes(q) || mod.descriptionMR.toLowerCase().includes(q);
        const matchesEn = mod.nameEN.toLowerCase().includes(q) || mod.descriptionEN.toLowerCase().includes(q);
        const matchesKey = mod.key.toLowerCase().includes(q);
        if (!matchesMr && !matchesEn && !matchesKey) return false;
      }

      return true;
    });
  }, [visibilityMap, selectedCategory, statusFilter, searchTerm]);

  const totalCount = APP_MODULE_DEFINITIONS.length;
  const visibleCount = APP_MODULE_DEFINITIONS.filter(m => visibilityMap[m.key] !== false).length;
  const hiddenCount = totalCount - visibleCount;

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Top Banner & Description */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-brand-gold animate-pulse" />
            <h3 className="text-lg font-bold text-white font-sans">
              {lang === 'EN' ? 'Application Module & Component Visibility (Show / Hide)' : 'घटक व विभाग नियंत्रण (Show / Hide व्यवस्थापन)'}
            </h3>
          </div>
          <p className="text-gray-400 mt-1 max-w-2xl text-[11px] leading-relaxed">
            {lang === 'EN'
              ? 'Control which components, banners, video sections, and devotional portals are visible to devotees across the overall website. Changes reflect instantly in real-time.'
              : 'वेबसाईटवरील मुख्य बॅनर, व्हिडिओ, थेट दर्शन, आरत्या, देणगी व इतर सर्व घटक तात्पुरते लपवा किंवा प्रदर्शित करा. बदल सर्व भाविकांसाठी तत्काळ लागू होतात.'}
          </p>
        </div>

        {/* Global Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleShowAll}
            disabled={isUpdating}
            className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{lang === 'EN' ? 'Show All' : 'सर्व दाखवा'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isUpdating}
            className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 text-gray-300 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{lang === 'EN' ? 'Reset Defaults' : 'मूळ स्थिती'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-2 animate-fade-in shadow">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white text-xs font-bold cursor-pointer">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center justify-between gap-2 animate-fade-in shadow">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white text-xs font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Quick Statistics KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-black/50 border border-brand-gold/25 rounded-xl p-3">
          <span className="text-[10px] text-gray-400 uppercase font-mono block">
            {lang === 'EN' ? 'Total Modules' : 'एकूण घटक'}
          </span>
          <span className="text-xl font-bold font-sans text-brand-gold mt-0.5 block">
            {totalCount}
          </span>
        </div>
        <div className="bg-black/50 border border-emerald-500/25 rounded-xl p-3">
          <span className="text-[10px] text-gray-400 uppercase font-mono block">
            {lang === 'EN' ? 'Active / Visible' : 'सक्रिय (दृश्यमान)'}
          </span>
          <span className="text-xl font-bold font-sans text-emerald-400 mt-0.5 block">
            {visibleCount}
          </span>
        </div>
        <div className="bg-black/50 border border-red-500/25 rounded-xl p-3">
          <span className="text-[10px] text-gray-400 uppercase font-mono block">
            {lang === 'EN' ? 'Hidden / Disabled' : 'अप्रकाशित (लपवलेले)'}
          </span>
          <span className="text-xl font-bold font-sans text-red-400 mt-0.5 block">
            {hiddenCount}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/40 p-3 rounded-2xl border border-white/10">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder={lang === 'EN' ? 'Search components or modules...' : 'घटक किंवा विभाग शोधा...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-brand-gold"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {[
            { id: 'all', mr: 'सर्व', en: 'All' },
            { id: 'home', mr: 'मुख्य पृष्ठ', en: 'Home' },
            { id: 'sanctum', mr: 'दर्शन व माध्यमे', en: 'Sanctum' },
            { id: 'devotion', mr: 'भक्ती दालने', en: 'Devotion' },
            { id: 'trust', mr: 'इतिहास व कार्य', en: 'Trust' },
            { id: 'system', mr: 'रचना व तळटीप', en: 'System' }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-brand-gold text-brand-maroon shadow'
                  : 'bg-zinc-900 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              {lang === 'EN' ? cat.en : cat.mr}
            </button>
          ))}
        </div>

        {/* Status Filter (All / Visible / Hidden) */}
        <div className="flex items-center gap-1 shrink-0 bg-zinc-900 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
              statusFilter === 'all' ? 'bg-zinc-800 text-brand-gold' : 'text-gray-400 hover:text-white'
            }`}
          >
            {lang === 'EN' ? 'All' : 'सर्व'}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('visible')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
              statusFilter === 'visible' ? 'bg-emerald-950 text-emerald-300' : 'text-gray-400 hover:text-white'
            }`}
          >
            {lang === 'EN' ? 'Visible' : 'दृश्यमान'}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('hidden')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
              statusFilter === 'hidden' ? 'bg-red-950 text-red-300' : 'text-gray-400 hover:text-white'
            }`}
          >
            {lang === 'EN' ? 'Hidden' : 'लपवलेले'}
          </button>
        </div>
      </div>

      {/* Grid of Component Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3.5">
        {filteredModules.map((mod) => {
          const isVisible = visibilityMap[mod.key] !== false;

          return (
            <div
              key={mod.key}
              className={`p-4 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between gap-3 shadow-md ${
                isVisible
                  ? 'bg-black/60 border-brand-gold/30 hover:border-brand-gold/60'
                  : 'bg-zinc-950/70 border-red-500/25 opacity-70 hover:opacity-100'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-2xl p-2 rounded-xl bg-zinc-900 border border-white/10 shrink-0">
                    {mod.icon}
                  </span>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 text-brand-gold border border-brand-gold/30">
                        {lang === 'EN' ? mod.categoryLabelEN : mod.categoryLabelMR}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">
                        {mod.key}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white font-sans truncate">
                      {lang === 'EN' ? mod.nameEN : mod.nameMR}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-sans line-clamp-2 leading-relaxed">
                      {lang === 'EN' ? mod.descriptionEN : mod.descriptionMR}
                    </p>
                  </div>
                </div>

                {/* Big Toggle Switch */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggle(mod.key, isVisible)}
                    className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                      isVisible
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : 'bg-zinc-800 border-zinc-700'
                    }`}
                    role="switch"
                    aria-checked={isVisible}
                    title={lang === 'EN' ? 'Click to toggle visibility' : 'दृश्यमानता बदला'}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center text-[11px] ${
                        isVisible ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    >
                      {isVisible ? '✓' : '✕'}
                    </span>
                  </button>

                  <span className={`text-[10px] font-mono font-bold ${isVisible ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {isVisible ? (lang === 'EN' ? 'Visible' : 'सक्रिय') : (lang === 'EN' ? 'Hidden' : 'लपवले')}
                  </span>
                </div>
              </div>

              {/* Bottom Quick Indicator */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-gray-400 flex items-center gap-1.5">
                  {isVisible ? (
                    <>
                      <Eye className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">
                        {lang === 'EN' ? 'Live on Website' : 'वेबसाईटवर भाविकांना दिसते'}
                      </span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-red-400" />
                      <span className="text-red-300 font-medium">
                        {lang === 'EN' ? 'Hidden from Devotees' : 'वेबसाईटवर भाविकांसाठी लपवले आहे'}
                      </span>
                    </>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggle(mod.key, isVisible)}
                  className="text-brand-gold hover:underline text-[11px] font-bold cursor-pointer"
                >
                  {isVisible ? (lang === 'EN' ? 'Hide Module' : 'लपवा') : (lang === 'EN' ? 'Show Module' : 'दाखवा')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="p-8 text-center bg-black/40 rounded-2xl border border-white/10 text-gray-400 space-y-2">
          <Layers className="h-8 w-8 mx-auto text-gray-600" />
          <p className="text-sm font-bold">
            {lang === 'EN' ? 'No modules match the filter criteria.' : 'कोणतेही घटक सापडले नाहीत.'}
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setStatusFilter('all'); }}
            className="px-3 py-1 bg-brand-gold text-brand-maroon rounded-lg text-xs font-bold cursor-pointer"
          >
            {lang === 'EN' ? 'Clear Filters' : 'फिल्टर साफ करा'}
          </button>
        </div>
      )}

    </div>
  );
};
