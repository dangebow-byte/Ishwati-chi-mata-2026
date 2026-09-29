/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Bell, Radio, FileText, Newspaper, Megaphone } from 'lucide-react';
import { Announcement } from '../types';

interface NewsSectionProps {
  lang: 'EN' | 'MR';
  announcements: Announcement[];
}

export const NewsSection: React.FC<NewsSectionProps> = ({ lang, announcements }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [notifEnabled, setNotifEnabled] = useState(false);

  const categories = ['All', 'Notice', 'Festival', 'Press'];

  const filtered = announcements.filter(ann => {
    const matchesSearch = ann.title.toLowerCase().includes(search.toLowerCase()) || 
                          ann.titleMarathi.includes(search) ||
                          ann.content.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'All' || ann.category === category;
    return matchesSearch && matchesCat;
  });

  const handleToggleNotifications = () => {
    setNotifEnabled(!notifEnabled);
    if (!notifEnabled) {
      alert(lang === 'EN' ? '🔔 Real-time alerts enabled! You will receive daily prayer schedules and festival warning push notifications.' : '🔔 थेट सूचना (Push Notifications) चालू केल्या आहेत! तुम्हाला दैनिक आरती आणि उत्सव वेळापत्रक सूचना मिळतील.');
    }
  };

  return (
    <section className="bg-brand-maroon/20 rounded-2xl border border-brand-gold/15 p-6 md:p-8 text-white backdrop-blur-sm shadow-xl space-y-8 animate-fade-in font-sans">
      
      {/* Top Banner News */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-brand-gold text-xs font-mono font-bold uppercase tracking-wider block mb-1">
            📢 Bulletins & updates
          </span>
          <h2 className="text-2xl md:text-4xl font-serif font-black text-white">
            {lang === 'EN' ? 'Official News & Holy Notices' : 'अधिकृत घोषणा व ताज्या घडामोडी'}
          </h2>
          <p className="text-xs text-gray-300 mt-1">
            {lang === 'EN' ? 'Stay connected to official circulars issued by Shree Ishwatichi Mata Mandal Trustees.' : 'श्री ईश्वटीची मंडळाने घेतलेले महत्त्वपूर्ण निर्णय, प्रसिद्धीपत्रके व महत्त्वाच्या धार्मिक नियमांची एकत्रित माहिती.'}
          </p>
        </div>

        {/* Real-time Push Notification Simulator Toggle Card */}
        <div className="bg-black/50 border border-brand-gold/25 p-3.5 rounded-xl flex items-center gap-3 w-full md:w-auto">
          <div className="h-9 w-9 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
            <Bell className={`h-4 w-4 ${notifEnabled ? 'animate-bounce text-brand-saffron' : ''}`} />
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-gray-400 block font-mono">PUSH SERVICES</span>
            <span className="text-xs font-bold text-white block">
              {lang === 'EN' ? 'Daily Prayer Alerts' : 'दैनिक आरती वेळापत्रक सूचना'}
            </span>
          </div>
          <button
            onClick={handleToggleNotifications}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              notifEnabled 
                ? 'bg-green-600 text-white' 
                : 'bg-brand-red text-white hover:bg-brand-saffron'
            }`}
          >
            {notifEnabled ? '✓ Enabled' : 'Enable'}
          </button>
        </div>
      </div>

      {/* Filter and Search rail */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/35 p-3 rounded-xl border border-white/5">
        <div className="flex flex-wrap gap-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                category === cat
                  ? 'bg-brand-saffron text-brand-maroon font-serif text-xs font-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search news bulletin..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-xs w-full sm:w-60 focus:outline-none focus:border-brand-gold"
          />
        </div>
      </div>

      {/* Bulletins grid list */}
      <div className="space-y-4">
        {filtered.map(item => (
          <div 
            key={item.id} 
            className="bg-black/40 border border-brand-gold/10 p-5 rounded-xl space-y-3 hover:border-brand-saffron/35 transition-all flex gap-4"
          >
            {/* Category Icon indicator */}
            <div className="hidden sm:flex h-11 w-11 rounded-lg bg-brand-maroon/50 border border-brand-gold/25 items-center justify-center shrink-0">
              {item.category === 'Notice' && <Megaphone className="h-5 w-5 text-brand-gold" />}
              {item.category === 'Festival' && <Radio className="h-5 w-5 text-brand-saffron animate-pulse" />}
              {item.category === 'Press' && <Newspaper className="h-5 w-5 text-sky-400" />}
              {item.category === 'Event' && <FileText className="h-5 w-5 text-emerald-400" />}
            </div>

            <div className="space-y-1.5 flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-brand-saffron font-bold uppercase tracking-wider bg-brand-gold/10 py-0.5 px-2 rounded font-mono border border-brand-gold/20">
                  {item.category}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">{item.date}</span>
              </div>
              <h3 className="text-sm md:text-base font-serif font-bold text-white tracking-wide">
                {lang === 'EN' ? item.title : item.titleMarathi}
              </h3>
              <p className="text-gray-300 leading-relaxed pt-1 text-xs">
                {lang === 'EN' ? item.content : item.contentMarathi}
              </p>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-xs">
            No notices match your keywords. Please try adjusting your filter.
          </div>
        )}
      </div>

    </section>
  );
};
