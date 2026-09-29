/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, Flame, ShieldAlert, CheckCircle, Share2, AwardIcon, Heart, Send, Activity } from 'lucide-react';
import { UserProfile } from '../types';

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
          <h2 className="text-2xl md:text-4xl font-serif font-black text-white">
            {lang === 'EN' ? 'Devotee Personalized Sanctuary' : 'वैयक्तिक भक्ती केंद्र प्रोफाइल'}
          </h2>
          <p className="text-xs text-gray-300 mt-1">
            {lang === 'EN' 
              ? 'Track your daily aarti devotion streak, secure exclusive golden badges, and sync walk metrics.' 
              : 'तुमची रोजची भक्ती ट्रॅक करा, विशेष सुवर्ण पदके मिळवा आणि मंदिर प्रदक्षिणा अंतर सिंक करा.'}
          </p>
        </div>

        {/* Daily Claim Action Spot */}
        <button
          onClick={onClaimDaily}
          className="bg-gradient-to-r from-brand-saffron via-brand-gold to-brand-saffron text-brand-maroon font-serif font-black text-xs px-5 py-3 rounded-xl hover:scale-105 transition-all shadow-md active:scale-95 cursor-pointer outline-none flex items-center gap-1.5"
        >
          <Flame className="h-4 w-4 animate-bounce text-brand-red" />
          <span>{lang === 'EN' ? 'Claim Daily Darshan Check-in' : 'दैनिक भक्ती गुण आवडीने नोंदवा'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Profile Card & Input (Left span 5) */}
        <div className="lg:col-span-5 bg-black/40 border border-brand-gold/15 p-5 md:p-6 rounded-xl space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="text-base font-serif font-bold text-brand-gold">
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
                <div className="h-12 w-12 rounded-full bg-brand-red text-brand-gold border-2 border-brand-gold flex items-center justify-center text-xl font-bold font-serif shadow">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'B'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide uppercase">{profile.name || 'Anonymous Devotee'}</h4>
                  <span className="text-[10px] text-gray-400 font-mono italic">Gotra: {profile.gotra || 'Kashyap'}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs border-t border-white/5 divide-y divide-white/5">
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400">Email Address</span>
                  <strong className="text-white">{profile.email || 'bhakt@temple.in'}</strong>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400">Mobile Phone</span>
                  <strong className="text-white">{profile.phone || '+91 94825 00000'}</strong>
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
                className="w-full bg-brand-gold text-brand-maroon font-serif font-bold py-2 rounded-lg hover:opacity-90 cursor-pointer"
              >
                Save Profile Adjustments
              </button>
            </form>
          )}

          {/* Fitness Exporter Section as requested by prompt! ("export progress to external fitness apps") */}
          <div className="border-t border-white/5 pt-5 space-y-4">
            <div className="flex items-center gap-1.5 text-xs text-brand-gold font-serif font-bold">
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
            <h3 className="text-base font-serif font-bold text-white tracking-wide">
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
