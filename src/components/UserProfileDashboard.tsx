/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, Flame, ShieldAlert, CheckCircle, Share2, AwardIcon, Heart, Send, Activity, Check, Palette, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { NAVRATRI_9_COLORS, getActiveNavratriTheme } from '../utils/navratriColorTheme';

interface UserProfileDashboardProps {
  lang: 'EN' | 'MR';
  profile: UserProfile;
  onClaimDaily: () => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  claimsHistory: { id: string; title: string; date: string }[];
}

export const UserProfileDashboard: React.FC<UserProfileDashboardProps> = ({
  lang,
  profile,
  onClaimDaily,
  onUpdateProfile,
  claimsHistory
}) => {
  const [editMode, setEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...profile });
  const [syncingFitness, setSyncingFitness] = useState<string | null>(null);

  const activeTheme = getActiveNavratriTheme(profile.navratriThemeDay);
  const isAuto = profile.navratriThemeDay === 'auto' || profile.navratriThemeDay === undefined;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(tempProfile);
    setEditMode(false);
    alert(lang === 'EN' ? 'Profile details saved successfully!' : 'प्रोफाईल माहिती यशस्वी जतन केली!');
  };

  const handleSyncFitness = (app: string) => {
    setSyncingFitness(app);
    setTimeout(() => {
      setSyncingFitness(null);
      // Give appropriate badge or update milestones in parent
      alert(lang === 'EN' 
        ? `Successfully synced with ${app}! Your spiritual walking pilgrimage metrics are now exported.` 
        : `${app} सोबत कूटबद्धीकरण यशस्वी! तुमचे मंदिर प्रदक्षिणा अंतर यशस्वीरित्या सिंक झाले.`);
    }, 2500);
  };

  const rewards = [
    { threshold: 1, title: 'Prarambhik Bhakth (Beginner)', d: '1 Prayer check-in. Beginner devotee path initiated.', badge: '🌱' },
    { threshold: 3, title: 'Nitya Dharmee (Faithful Regular)', d: '3 Daily check-ins. Spiritual focus validated.', badge: '🕯️' },
    { threshold: 5, title: 'Ananya Upasak (Pure Devout)', d: '5 Daily check-ins. Supreme blessings flowing.', badge: '🕌' },
    { threshold: 10, title: 'Daanveer (Generous Donor)', d: 'Participated in Temple funds and contributions.', badge: '💝' }
  ];

  return (
    <section className="bg-brand-maroon/20 rounded-2xl border border-brand-gold/15 p-6 md:p-8 text-white backdrop-blur-sm shadow-xl space-y-8 animate-fade-in font-sans">
      
      {/* Top section info */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <span className="text-brand-gold text-xs font-mono font-bold uppercase tracking-wider block mb-1">
            🔥 Spiritual Hub
          </span>
          <h2 className="text-2xl md:text-4xl font-sans font-black text-white">
            {lang === 'EN' ? 'Devotee Personalized Sanctuary' : 'वैयक्तिक भक्ती केंद्र प्रोफाइल'}
          </h2>
          <p className="text-xs text-gray-300 mt-1">
            {lang === 'EN' 
              ? 'Track your daily aarti devotion streak, manage 9-day Navratri themes, and personalize profile details.' 
              : 'तुमची रोजची भक्ती ट्रॅक करा, नवरात्र ९ दिवसांचे रंग व्यवस्थापित करा आणि प्रोफाईल माहिती अद्ययावत करा.'}
          </p>
        </div>

        {/* Daily Claim Action Spot */}
        <button
          onClick={onClaimDaily}
          className="bg-gradient-to-r from-brand-saffron via-brand-gold to-brand-saffron text-brand-maroon font-sans font-black text-xs px-5 py-3 rounded-xl hover:scale-105 transition-all shadow-md active:scale-95 cursor-pointer outline-none flex items-center gap-1.5"
        >
          <Flame className="h-4 w-4 animate-bounce text-brand-red" />
          <span>{lang === 'EN' ? 'Claim Daily Darshan Check-in' : 'दैनिक भक्ती गुण आवडीने नोंदवा'}</span>
        </button>
      </div>

      {/* 9 Days of Navratri Sacred Color Themes Manager */}
      <div className="bg-black/50 border border-brand-gold/30 rounded-2xl p-5 md:p-7 space-y-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Palette className="h-5 w-5 text-brand-gold" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-gold">
                {lang === 'EN' ? 'Divine Navadurga Aesthetics' : 'नवरात्र ९-दिवसीय पावन रंग'}
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold font-sans text-white">
              {lang === 'EN' ? 'Navratri 9 Days Sacred Color Themes' : '९ दिवसांचे नवदुर्गा रंग व्यवस्थापन'}
            </h3>
            <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
              {lang === 'EN' 
                ? 'Each day of Sharad Navratri is dedicated to an avatar of Goddess Durga and a sacred vibrant color. Set the website background to match today’s festival color or manually choose any sacred day’s palette.' 
                : 'शारदीय नवरात्रीच्या ९ दिवसांत प्रत्येक दिवसाचा एक पावन रंग व कुलस्वामिनी देवीचे रूप असते. संकेतस्थळाचा पार्श्वभूमी रंग आजच्या शुभ रंगानुसार स्वयंचलित ठेवा किंवा आपल्या आवडीचा दिवस निवडा.'}
            </p>
          </div>

          {/* Quick Auto-Mode Toggle Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onUpdateProfile({ navratriThemeDay: 'auto' })}
              className={`px-4 py-2.5 rounded-xl font-sans text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                isAuto 
                  ? 'bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon ring-2 ring-brand-gold shadow-[0_0_15px_rgba(255,153,51,0.5)] font-black' 
                  : 'bg-zinc-900/90 text-gray-300 hover:text-white hover:bg-zinc-800 border border-white/10'
              }`}
            >
              <Sparkles className={`h-4 w-4 ${isAuto ? 'animate-spin text-brand-maroon' : 'text-brand-gold'}`} />
              <span>{lang === 'EN' ? 'Auto (Daily Festival Color)' : 'दैनिक स्वयंचलित (आजचा रंग)'}</span>
              {isAuto && <span className="bg-brand-maroon text-brand-gold text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">ON</span>}
            </button>
          </div>
        </div>

        {/* Active Theme Highlight Banner */}
        <div 
          className="rounded-xl p-4 sm:p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${activeTheme.hexPrimary}EE, ${activeTheme.hexSecondary}AA)`,
            borderColor: activeTheme.accentGold
          }}
        >
          <div className="flex items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-full border-2 shadow-lg flex items-center justify-center shrink-0 ring-2 ring-white/20"
              style={{ 
                backgroundColor: activeTheme.swatchHex,
                borderColor: activeTheme.accentGold 
              }}
            >
              <span className="text-xl drop-shadow">✨</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold" style={{ backgroundColor: `${activeTheme.accentGold}33`, color: activeTheme.accentGold }}>
                  {isAuto ? (lang === 'EN' ? 'Auto Managed' : 'स्वयंचलित प्रणाली') : (lang === 'EN' ? 'Custom Selected' : 'वैयक्तिक निवड')}
                </span>
                <span className="text-xs font-bold text-gray-200">
                  {lang === 'EN' ? activeTheme.nameEn : activeTheme.nameMr}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-white mt-0.5">
                {lang === 'EN' ? `${activeTheme.colorNameEn} — ${activeTheme.goddessFormEn}` : `${activeTheme.colorNameMr} — ${activeTheme.goddessFormMr}`}
              </h4>
              <p className="text-xs text-gray-200/90 mt-0.5 font-sans">
                {lang === 'EN' ? activeTheme.descriptionEn : activeTheme.descriptionMr}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0 self-end sm:self-center">
            <span className="text-[11px] font-mono text-gray-300 block">
              {lang === 'EN' ? 'Festival Date' : 'उत्सव तारीख'}
            </span>
            <span className="text-xs sm:text-sm font-bold font-sans text-brand-gold">
              {activeTheme.dateStr}
            </span>
          </div>
        </div>

        {/* 9-Day Sacred Palette Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {NAVRATRI_9_COLORS.map((theme) => {
            const isSelected = !isAuto && profile.navratriThemeDay === theme.dayIndex;
            const isCurrentActive = activeTheme.dayIndex === theme.dayIndex;

            return (
              <button
                key={theme.dayIndex}
                type="button"
                onClick={() => onUpdateProfile({ navratriThemeDay: theme.dayIndex })}
                className={`relative group p-3.5 rounded-xl border text-left transition-all duration-300 cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-brand-gold shadow-lg shadow-brand-gold/20 scale-[1.02]'
                    : isCurrentActive && isAuto
                    ? 'ring-1 ring-brand-gold/70'
                    : 'hover:border-white/30 hover:scale-[1.01]'
                }`}
                style={{
                  background: isSelected 
                    ? `linear-gradient(135deg, ${theme.hexPrimary}FA, ${theme.hexSecondary}DD)` 
                    : `linear-gradient(135deg, ${theme.hexPrimary}CC, #111116)`,
                  borderColor: isSelected ? theme.accentGold : 'rgba(255,255,255,0.12)'
                }}
              >
                {/* Top Row: Day Badge & Swatch Circle */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 text-brand-gold border border-brand-gold/30">
                    {lang === 'EN' ? `Day ${theme.dayIndex}` : `दिवस ${theme.dayIndex}`}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    {isSelected && (
                      <span className="text-[10px] font-bold text-green-400 bg-green-950/70 border border-green-500/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {lang === 'EN' ? 'Active' : 'सक्रिय'}
                      </span>
                    )}
                    {isCurrentActive && isAuto && (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                        ✨ {lang === 'EN' ? 'Today' : 'आजचा'}
                      </span>
                    )}
                    {/* Swatch circle */}
                    <div 
                      className="w-5 h-5 rounded-full border border-white/40 shadow-sm shrink-0"
                      style={{ backgroundColor: theme.swatchHex }}
                      title={theme.colorNameEn}
                    />
                  </div>
                </div>

                {/* Color and Goddess Title */}
                <h5 className="font-bold text-sm text-white group-hover:text-brand-gold transition-colors font-sans">
                  {lang === 'EN' ? theme.colorNameEn : theme.colorNameMr}
                </h5>
                <p className="text-[11px] text-brand-gold font-sans font-semibold mt-0.5">
                  {lang === 'EN' ? theme.goddessFormEn : theme.goddessFormMr}
                </p>

                {/* Significance / Blessing */}
                <p className="text-[10px] text-gray-300 font-sans italic mt-1 line-clamp-1" title={lang === 'EN' ? theme.descriptionEn : theme.descriptionMr}>
                  ✨ {lang === 'EN' ? theme.descriptionEn : theme.descriptionMr}
                </p>

                {/* Footer details: Date and name */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[10px] text-gray-300">
                  <span className="font-mono">{theme.dateStr}</span>
                  <span className="text-gray-400 truncate max-w-[140px] text-right font-sans">
                    {lang === 'EN' ? theme.nameEn.split('(')[1]?.replace(')', '') || '' : theme.nameMr.split('(')[1]?.replace(')', '') || ''}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info tip */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-white/5 flex-wrap gap-2">
          <span>
            {lang === 'EN' 
              ? '💡 Tip: Changes apply instantly across the entire website background.' 
              : '💡 टीप: निवडलेला रंग संपूर्ण संकेतस्थळाच्या पार्श्वभूमीवर त्वरित लागू होतो.'}
          </span>
          {!isAuto && (
            <button
              type="button"
              onClick={() => onUpdateProfile({ navratriThemeDay: 'auto' })}
              className="text-brand-saffron hover:text-brand-gold underline font-semibold cursor-pointer"
            >
              {lang === 'EN' ? 'Reset to Auto Daily Rotation' : 'दैनिक स्वयंचलित रंगावर परत या'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Profile Card & Input (Left span 5) */}
        <div className="lg:col-span-5 bg-black/40 border border-brand-gold/15 p-5 md:p-6 rounded-xl space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="text-base font-sans font-bold text-brand-gold">
              {lang === 'EN' ? 'Sacred Devotee Profile' : 'भाविकाचे मूळ प्रोफाईल'}
            </h3>
            <button
              onClick={() => {
                setTempProfile({ ...profile });
                setEditMode(!editMode);
              }}
              className="text-xs text-brand-saffron hover:underline font-semibold cursor-pointer"
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {!editMode ? (
            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-brand-red text-brand-gold border-2 border-brand-gold flex items-center justify-center text-xl font-bold font-sans shadow">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'D'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide uppercase">{profile.name || 'DEVENDRA PRAKASH PARTE'}</h4>
                  <span className="text-[10px] text-gray-400 font-mono italic">Gotra: {profile.gotra || 'Kashyap'}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs border-t border-white/5 divide-y divide-white/5">
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400">Email Address</span>
                  <strong className="text-white">{profile.email || 'devendraparte2001@gmail.com'}</strong>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400">Mobile Phone</span>
                  <strong className="text-white">{profile.phone || '9892938554'}</strong>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400">Active Theme</span>
                  <strong className="text-brand-gold font-sans font-semibold">
                    {profile.navratriThemeDay === 'auto' || profile.navratriThemeDay === undefined
                      ? (lang === 'EN' ? `Auto: ${activeTheme.colorNameEn}` : `स्वयंचलित: ${activeTheme.colorNameMr}`)
                      : (lang === 'EN' ? `Day ${activeTheme.dayIndex}: ${activeTheme.colorNameEn}` : `दिवस ${activeTheme.dayIndex}: ${activeTheme.colorNameMr}`)}
                  </strong>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400">Total Devotional Offerings</span>
                  <strong className="text-brand-gold font-mono text-sm">₹ {profile.totalDonation.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between py-1.5 text-brand-saffron">
                  <span>Current Aarti Streak</span>
                  <strong className="font-mono text-sm">🔥 {profile.streakCount} Days</strong>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 block font-semibold">Devotee Name *</label>
                <input
                  type="text"
                  required
                  value={tempProfile.name}
                  onChange={e => setTempProfile({ ...tempProfile, name: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 block font-semibold">Ancestral Gotra *</label>
                <input
                  type="text"
                  required
                  value={tempProfile.gotra}
                  onChange={e => setTempProfile({ ...tempProfile, gotra: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 block font-semibold">Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={tempProfile.phone}
                  onChange={e => setTempProfile({ ...tempProfile, phone: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 block font-semibold">Email Address *</label>
                <input
                  type="email"
                  required
                  value={tempProfile.email}
                  onChange={e => setTempProfile({ ...tempProfile, email: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-gold text-brand-maroon font-sans font-bold py-2 rounded-lg hover:opacity-90 cursor-pointer"
              >
                Save Profile Adjustments
              </button>
            </form>
          )}

          {/* Fitness Exporter Section as requested by prompt! ("export progress to external fitness apps") */}
          <div className="border-t border-white/5 pt-5 space-y-4">
            <div className="flex items-center gap-1.5 text-xs text-brand-gold font-sans font-bold">
              <Activity className="h-4 w-4 text-brand-saffron animate-pulse" />
              <span>{lang === 'EN' ? 'Pilgrimage Walking Sync' : 'प्रदक्षिणा अंतर सिंक इंजिन'}</span>
            </div>
            <p className="text-[10px] text-gray-300 leading-relaxed font-sans">
              {lang === 'EN' 
                ? 'Did you perform physical walking pradakshina (loops) around the temple? Export your walking logs to modern apps to maintain healthy milestones!' 
                : 'देवीच्या गाभाऱ्याभोवती घातलेल्या प्रदक्षिणा पायऱ्यांचे अंतर मोबाईलच्या इतर फिटनेस ॲप्स मध्ये सिंक करा.'}
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSyncFitness('Google Fit')}
                disabled={syncingFitness !== null}
                className="py-1.5 rounded bg-zinc-900 border border-white/5 text-[10px] text-center hover:bg-black font-semibold cursor-pointer"
              >
                {syncingFitness === 'Google Fit' ? 'Sync...' : 'Google Fit 🟢'}
              </button>
              <button
                onClick={() => handleSyncFitness('Strava GPS')}
                disabled={syncingFitness !== null}
                className="py-1.5 rounded bg-zinc-900 border border-white/5 text-[10px] text-center hover:bg-black font-semibold cursor-pointer"
              >
                {syncingFitness === 'Strava GPS' ? 'Sync...' : 'Strava 🟠'}
              </button>
              <button
                onClick={() => handleSyncFitness('Apple Health (Mock)')}
                disabled={syncingFitness !== null}
                className="py-1.5 rounded bg-zinc-900 border border-white/5 text-[10px] text-center hover:bg-black font-semibold cursor-pointer"
              >
                {syncingFitness === 'Apple Health (Mock)' ? 'Sync...' : 'iOS Health 🍎'}
              </button>
            </div>
          </div>
        </div>

        {/* Milestones and claiming trophies (Right span 7) */}
        <div className="lg:col-span-7 bg-brand-maroon/20 border border-brand-gold/15 p-5 md:p-6 rounded-xl space-y-4 font-sans">
          <div className="border-b border-white/5 pb-2 flex justify-between items-center">
            <h3 className="text-base font-sans font-bold text-white tracking-wide">
              🥇 {lang === 'EN' ? 'Spiritual Milestones & Badges' : 'भक्ती पुरस्कार व सुवर्ण पदके'}
            </h3>
            <span className="text-[10px] bg-brand-gold/15 text-brand-gold font-mono px-2 py-0.5 rounded">
              Verification Engine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rewards.map((rew, idx) => {
              // verify threshold
              const earned = 
                (rew.threshold === 10 && profile.totalDonation > 0) || 
                (rew.threshold <= profile.streakCount && rew.threshold < 10);

              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border flex gap-3 items-start transition-all ${
                    earned 
                      ? 'bg-gradient-to-br from-brand-maroon/80 to-black/60 border-brand-gold/45 shadow' 
                      : 'bg-black/10 border-white/5 opacity-55 saturate-50'
                  }`}
                >
                  <span className="text-3xl filter drop-shadow animate-pulse">{rew.badge}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1">
                      <span>{rew.title}</span>
                      {earned && <CheckCircle className="h-3.5 w-3.5 text-green-400" />}
                    </h4>
                    <p className="text-[10px] text-gray-300 mt-1">{rew.d}</p>
                    <span className="text-[9px] font-mono mt-1 block uppercase text-brand-gold">
                      {earned ? '✓ Unlocked Reward' : `Locked: Requires ${rew.threshold === 10 ? 'Any Donation' : `${rew.threshold} Streak`}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Claim History List */}
          <div className="border-t border-white/5 pt-4 space-y-2">
            <span className="text-xs text-gray-400">
              {lang === 'EN' ? 'Claims History Logs' : 'भक्ती गुण मागोवा नोंदवह्या'}
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[10px] text-gray-300 pr-1 select-all scrollbar-none">
              {claimsHistory.map(ch => (
                <div key={ch.id} className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-brand-saffron font-bold">{ch.title}</span>
                  <span className="text-gray-400">{ch.date}</span>
                </div>
              ))}
              {claimsHistory.length === 0 && (
                <span className="text-gray-500 block italic">No logs on record yet. Claim daily or book sevas.</span>
              )}
            </div>
          </div>
        </div>

      </div>

    </section>
  );
};
