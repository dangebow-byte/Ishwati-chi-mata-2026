/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Menu, Plus, Edit2, Trash2, Eye, EyeOff, MoveUp, MoveDown, 
  RotateCcw, Search, CheckCircle, AlertCircle, Sparkles, X, Save
} from 'lucide-react';
import { 
  NavigationMenuItem, 
  DEFAULT_MENU_ITEMS,
  subscribeNavigationMenu,
  addNavigationMenuItem,
  updateNavigationMenuItem,
  deleteNavigationMenuItem,
  toggleNavigationItemVisibility,
  reorderNavigationItems,
  resetNavigationMenuToDefault,
  getCachedMenuItems
} from '../../services/navigationMenuService';

interface MenuItemsCrudTabProps {
  lang: 'EN' | 'MR';
}

const COMMON_DEVOTIONAL_EMOJIS = ['🏠', '🕉️', '📜', '🎥', '🕯️', '🗓️', '🖼️', '💬', '💝', '🤝', '📢', '⚙️', '🌺', '🪔', '🔔', '🚩', '👑', '✨', '🙏', '🔱'];

export const MenuItemsCrudTab: React.FC<MenuItemsCrudTabProps> = ({ lang }) => {
  const [menuItems, setMenuItems] = useState<NavigationMenuItem[]>(getCachedMenuItems());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationMenuItem | null>(null);

  // Form states
  const [formId, setFormId] = useState('');
  const [formLabelMR, setFormLabelMR] = useState('');
  const [formLabelEN, setFormLabelEN] = useState('');
  const [formIcon, setFormIcon] = useState('🌺');
  const [formDescMR, setFormDescMR] = useState('');
  const [formDescEN, setFormDescEN] = useState('');
  const [formTargetTab, setFormTargetTab] = useState('');
  const [formIsVisible, setFormIsVisible] = useState(true);
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);

  // Status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeNavigationMenu((items) => {
      setMenuItems(items);
    });
    return () => unsub();
  }, []);

  const clearMessages = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleOpenAdd = () => {
    clearMessages();
    setEditingItem(null);
    setFormId(`menu-${Date.now().toString(36)}`);
    setFormLabelMR('');
    setFormLabelEN('');
    setFormIcon('🌺');
    setFormDescMR('');
    setFormDescEN('');
    setFormTargetTab('home');
    setFormIsVisible(true);
    setFormDisplayOrder(menuItems.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NavigationMenuItem) => {
    clearMessages();
    setEditingItem(item);
    setFormId(item.id);
    setFormLabelMR(item.labelMR);
    setFormLabelEN(item.labelEN);
    setFormIcon(item.icon || '🌺');
    setFormDescMR(item.descMR || '');
    setFormDescEN(item.descEN || '');
    setFormTargetTab(item.targetTab || item.id);
    setFormIsVisible(item.isVisible !== false);
    setFormDisplayOrder(item.displayOrder || 1);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!formLabelMR.trim() || !formLabelEN.trim()) {
      setErrorMsg(
        lang === 'EN'
          ? 'Both Marathi and English labels are required.'
          : 'मराठी आणि इंग्रजी दोन्ही नावे आवश्यक आहेत.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateNavigationMenuItem(editingItem.id, {
          labelMR: formLabelMR.trim(),
          labelEN: formLabelEN.trim(),
          icon: formIcon.trim() || '🌺',
          descMR: formDescMR.trim(),
          descEN: formDescEN.trim(),
          targetTab: formTargetTab.trim() || editingItem.id,
          isVisible: formIsVisible,
          displayOrder: Number(formDisplayOrder) || 1
        });
        setSuccessMsg(
          lang === 'EN' ? 'Menu item updated successfully!' : 'मेनू पर्याय यशस्वीरित्या अद्यतनित केला!'
        );
      } else {
        await addNavigationMenuItem({
          id: formId.trim() || `menu-${Date.now()}`,
          labelMR: formLabelMR.trim(),
          labelEN: formLabelEN.trim(),
          icon: formIcon.trim() || '🌺',
          descMR: formDescMR.trim(),
          descEN: formDescEN.trim(),
          targetTab: formTargetTab.trim() || formId.trim(),
          isVisible: formIsVisible,
          displayOrder: Number(formDisplayOrder) || menuItems.length + 1
        });
        setSuccessMsg(
          lang === 'EN' ? 'New menu item added successfully!' : 'नवीन मेनू पर्याय यशस्वीरित्या जोडला!'
        );
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save menu item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!window.confirm(
      lang === 'EN'
        ? `Are you sure you want to delete "${label}"?`
        : `तुम्हाला खात्री आहे का की "${label}" मेनू पर्याय हटवायचा आहे?`
    )) {
      return;
    }

    clearMessages();
    try {
      await deleteNavigationMenuItem(id);
      setSuccessMsg(
        lang === 'EN' ? `Menu item "${label}" deleted.` : `"${label}" मेनू पर्याय हटविला.`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete menu item.');
    }
  };

  const handleToggleVisibility = async (item: NavigationMenuItem) => {
    clearMessages();
    try {
      await toggleNavigationItemVisibility(item.id, !item.isVisible);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to toggle visibility.');
    }
  };

  const handleMoveOrder = async (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= menuItems.length) return;

    clearMessages();
    const copy = [...menuItems];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;

    try {
      await reorderNavigationItems(copy);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reorder menu items.');
    }
  };

  const handleResetToDefault = async () => {
    if (!window.confirm(
      lang === 'EN'
        ? 'Are you sure you want to restore the authentic default 13 temple navigation menu items?'
        : 'तुम्हाला खात्री आहे का की मूळ अधिकृत १३ मेनू पर्याय पूर्ववत करायचे आहेत?'
    )) {
      return;
    }

    clearMessages();
    try {
      await resetNavigationMenuToDefault();
      setSuccessMsg(
        lang === 'EN'
          ? 'Navigation menu reset to authentic 13 temple portals!'
          : 'नेव्हिगेशन मेनू मूळ १३ अधिकृत दालनांमध्ये पूर्ववत झाला!'
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset navigation menu.');
    }
  };

  const filteredItems = menuItems.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      item.labelMR.toLowerCase().includes(q) ||
      item.labelEN.toLowerCase().includes(q) ||
      (item.descMR && item.descMR.toLowerCase().includes(q)) ||
      (item.descEN && item.descEN.toLowerCase().includes(q)) ||
      item.id.toLowerCase().includes(q)
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

      {/* Header & Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Menu className="h-5 w-5 text-brand-gold" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              {lang === 'EN' ? '3. Header & Mobile Menu Items Management (CRUD)' : '३. मुख्य मेनू पर्याय व्यवस्थापन (CRUD)'}
            </h3>
          </div>
          <p className="text-gray-400 mt-1 text-[11px] leading-relaxed">
            {lang === 'EN'
              ? 'Add, edit, reorder, show/hide, or delete navbar menu portals. Changes reflect immediately on desktop navbar and mobile slide drawer.'
              : 'संकेतस्थळ मेनू पर्याय जोडा, संपादित करा, क्रम बदला किंवा लपवा/दाखवा. केलेले बदल तात्काळ सक्रिय होतात.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-500/40 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
            title={lang === 'EN' ? 'Restore authentic default menu items' : 'मूळ अधिकृत मेनू पर्याय पूर्ववत करा'}
          >
            <RotateCcw className="h-3.5 w-3.5 text-red-300" />
            <span>{lang === 'EN' ? 'Reset to Default' : 'मूळ पर्याय पूर्ववत करा'}</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-1.5 bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-bold rounded-xl hover:opacity-95 transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{lang === 'EN' ? 'Add New Menu Item' : 'नवीन मेनू पर्याय जोडा'}</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Stats & Search Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-black/50 border border-brand-gold/25 rounded-xl p-3">
          <span className="text-[10px] text-gray-400 uppercase font-mono block">
            {lang === 'EN' ? 'Total Portals' : 'एकूण मेनू पर्याय'}
          </span>
          <span className="text-xl font-bold text-brand-gold mt-0.5 block">
            {menuItems.length}
          </span>
        </div>
        <div className="bg-black/50 border border-emerald-500/25 rounded-xl p-3">
          <span className="text-[10px] text-gray-400 uppercase font-mono block">
            {lang === 'EN' ? 'Active / Visible' : 'सक्रिय / दृश्यमान'}
          </span>
          <span className="text-xl font-bold text-emerald-400 mt-0.5 block">
            {menuItems.filter((i) => i.isVisible !== false).length}
          </span>
        </div>
        <div className="bg-black/50 border border-amber-500/25 rounded-xl p-3">
          <span className="text-[10px] text-gray-400 uppercase font-mono block">
            {lang === 'EN' ? 'Hidden from Public' : 'लपवलेले पर्याय'}
          </span>
          <span className="text-xl font-bold text-amber-400 mt-0.5 block">
            {menuItems.filter((i) => i.isVisible === false).length}
          </span>
        </div>
        <div className="bg-black/50 border border-white/10 rounded-xl p-3 flex items-center">
          <div className="relative w-full">
            <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'EN' ? 'Search menu...' : 'मेनू शोधा...'}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg py-1.5 pl-8 pr-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold text-xs"
            />
          </div>
        </div>
      </div>

      {/* Menu Items Table / Cards Grid */}
      <div className="space-y-2">
        {filteredItems.map((item, idx) => {
          const isVisible = item.isVisible !== false;
          return (
            <div
              key={item.id}
              className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isVisible
                  ? 'bg-zinc-900/80 border-white/10 hover:border-brand-gold/40'
                  : 'bg-black/50 border-white/5 opacity-60'
              }`}
            >
              {/* Order, Icon & Labels */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-brand-gold border border-brand-gold/30 shrink-0">
                  #{item.displayOrder || idx + 1}
                </span>

                <span className="text-xl p-2 rounded-xl bg-black/40 border border-white/10 shrink-0">
                  {item.icon || '🌺'}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-white truncate">
                      {lang === 'EN' ? item.labelEN : item.labelMR}
                    </span>
                    <span className="text-[11px] text-gray-400 truncate">
                      ({lang === 'EN' ? item.labelMR : item.labelEN})
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-zinc-800 text-brand-saffron border border-brand-gold/20">
                      tab: {item.targetTab || item.id}
                    </span>
                    {item.isCustom && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">
                    {lang === 'EN' ? (item.descEN || item.descMR) : (item.descMR || item.descEN)}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                {/* Reorder Buttons */}
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveOrder(idx, 'up')}
                  className="p-1.5 rounded-lg bg-black/40 hover:bg-black/80 text-gray-300 hover:text-white border border-white/10 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <MoveUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === menuItems.length - 1}
                  onClick={() => handleMoveOrder(idx, 'down')}
                  className="p-1.5 rounded-lg bg-black/40 hover:bg-black/80 text-gray-300 hover:text-white border border-white/10 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <MoveDown className="h-3.5 w-3.5" />
                </button>

                {/* Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(item)}
                  className={`p-1.5 rounded-lg border font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    isVisible
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                      : 'bg-zinc-800 text-gray-400 border-white/10 hover:text-white'
                  }`}
                  title={isVisible ? 'Visible • Click to hide' : 'Hidden • Click to make visible'}
                >
                  {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 rounded-lg cursor-pointer transition-all"
                  title="Edit Menu Item"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, lang === 'EN' ? item.labelEN : item.labelMR)}
                  className="p-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 rounded-lg cursor-pointer transition-all"
                  title="Delete Menu Item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="p-8 text-center bg-black/30 rounded-xl border border-white/10 text-gray-400">
            {lang === 'EN' ? 'No menu items matching search query.' : 'शोध परिणामाशी जुळणारे मेनू पर्याय आढळले नाहीत.'}
          </div>
        )}
      </div>

      {/* ADD / EDIT MENU ITEM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-2 border-brand-gold/40 rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Menu className="h-4 w-4 text-brand-gold" />
                <h4 className="font-bold text-white text-base">
                  {editingItem 
                    ? (lang === 'EN' ? 'Edit Navigation Menu Item' : 'मेनू पर्याय संपादित करा')
                    : (lang === 'EN' ? 'Add New Navigation Menu Item' : 'नवीन मेनू पर्याय जोडा')}
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

            <form onSubmit={handleSaveItem} className="space-y-4">
              
              {/* Labels Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Label (Marathi) *' : 'नाव (मराठी) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formLabelMR}
                    onChange={(e) => setFormLabelMR(e.target.value)}
                    placeholder="उदा. मुख्य दालन"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Label (English) *' : 'नाव (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formLabelEN}
                    onChange={(e) => setFormLabelEN(e.target.value)}
                    placeholder="e.g. Home"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
                  />
                </div>
              </div>

              {/* Icon Selector & Common Emojis */}
              <div className="space-y-1.5">
                <label className="text-gray-300 font-bold block">
                  {lang === 'EN' ? 'Portal Icon Emoji (चिन्ह)' : 'मेनू चिन्ह (इमोजी)'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-16 text-center text-xl bg-zinc-900 border border-white/10 rounded-xl py-1.5 text-white focus:outline-none focus:border-brand-gold"
                  />
                  <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none flex-1">
                    {COMMON_DEVOTIONAL_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormIcon(emoji)}
                        className={`text-base p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                          formIcon === emoji ? 'bg-brand-gold text-brand-maroon border-brand-gold' : 'bg-black/40 border-white/10 hover:border-brand-gold/40'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Target Tab & Order Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Target Tab Identifier' : 'संबंधित टॅब ओळख (Target Tab)'}
                  </label>
                  <input
                    type="text"
                    value={formTargetTab}
                    onChange={(e) => setFormTargetTab(e.target.value)}
                    placeholder="e.g. home, about, patrika, events"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white font-mono focus:outline-none focus:border-brand-gold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    {lang === 'EN' ? 'Display Order Number' : 'प्रदर्शन क्रम (#)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white font-mono focus:outline-none focus:border-brand-gold text-xs"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">
                  {lang === 'EN' ? 'Marathi Description' : 'मराठी माहिती'}
                </label>
                <input
                  type="text"
                  value={formDescMR}
                  onChange={(e) => setFormDescMR(e.target.value)}
                  placeholder="उदा. मंदिराचा इतिहास व देवीची आख्यायिका"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold block">
                  {lang === 'EN' ? 'English Description' : 'English Description'}
                </label>
                <input
                  type="text"
                  value={formDescEN}
                  onChange={(e) => setFormDescEN(e.target.value)}
                  placeholder="e.g. Sanctum history and holy origin"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-gold text-xs"
                />
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="formIsVisible"
                  checked={formIsVisible}
                  onChange={(e) => setFormIsVisible(e.target.checked)}
                  className="h-4 w-4 accent-brand-gold rounded cursor-pointer"
                />
                <label htmlFor="formIsVisible" className="text-gray-300 font-bold cursor-pointer select-none">
                  {lang === 'EN' ? 'Visible to public devotees immediately' : 'भक्तांना संकेतस्थळावर तात्काळ दृश्यमान ठेवा'}
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
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
                    : (editingItem ? (lang === 'EN' ? 'Update Portal' : 'अद्यतन करा') : (lang === 'EN' ? 'Save Portal' : 'मेनू जतन करा'))}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
