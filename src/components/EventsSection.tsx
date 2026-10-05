/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Search, MapPin, Users, Check, Clock, Heart, Award } from 'lucide-react';
import { TempleEvent } from '../types';

interface EventsSectionProps {
  lang: 'EN' | 'MR';
  events: TempleEvent[];
  onRsvp: (eventId: string, devoteeName: string) => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({ lang, events, onRsvp }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [rsvpName, setRsvpName] = useState('');
  const [popupEvent, setPopupEvent] = useState<TempleEvent | null>(null);
  const [userRsvped, setUserRsvped] = useState<string[]>([]); // holds eventIds

  const categories = ['All', 'Festival', 'Community Service', 'Cultural Program'];

  const filteredEvents = events.filter(evt => {
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          evt.titleMarathi.includes(searchQuery) ||
                          evt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenRsvpPopup = (evt: TempleEvent) => {
    if (userRsvped.includes(evt.id)) return;
    setPopupEvent(evt);
  };

  const handleConfirmRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;

    if (popupEvent) {
      onRsvp(popupEvent.id, rsvpName);
      setUserRsvped([...userRsvped, popupEvent.id]);
      setPopupEvent(null);
      setRsvpName('');
    }
  };

  return (
    <section className="bg-brand-maroon/20 rounded-2xl border border-brand-gold/15 p-6 md:p-8 text-white backdrop-blur-sm shadow-xl space-y-8">
      
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-brand-gold text-xs font-mono font-bold uppercase tracking-wider block mb-1">
            🗓️ Utsav Schedule
          </span>
          <h2 className="text-2xl md:text-4xl font-sans font-black text-white">
            {lang === 'EN' ? 'Shree Ishwatichi Festivals & Cultural Events' : 'श्री इश्वटीची आगामी उत्सव व सांस्कृतिक कार्यक्रम'}
          </h2>
          <p className="text-xs text-gray-300 mt-1">
            {lang === 'EN' 
              ? 'Participate physically or online in Shree Ishwatichi celebrations. Register your presence to assist with food dining planning.' 
              : 'श्री इश्वटीची मातेच्या चालू वर्षातील विविध उत्सव व सांस्कृतिक कार्यक्रम. महाप्रसाद भोजनाच्या नियोजनासाठी कृपया नोंदणी करावी.'}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={lang === 'EN' ? 'Search dynamic events...' : 'कार्यक्रमाचे नाव शोधा...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-brand-saffron"
          />
        </div>
      </div>

      {/* Categories Filter Pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-gray-400 mr-2">{lang === 'EN' ? 'Filter Category' : 'श्रेणीनुसार शोधा'}:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer border ${
              selectedCategory === cat
                ? 'bg-brand-gold text-brand-maroon border-brand-gold shadow'
                : 'bg-black/30 text-gray-300 border-white/5 hover:border-brand-saffron/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {filteredEvents.map((evt) => {
          const isRegistered = userRsvped.includes(evt.id);
          return (
            <div 
              key={evt.id} 
              className="bg-black/40 border border-brand-gold/15 rounded-xl overflow-hidden hover:border-brand-saffron/50 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Event Image */}
              <div className="h-44 w-full relative">
                <img 
                  src={evt.image || 'https://picsum.photos/seed/temple/400/220'} 
                  alt={evt.title} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <span className="absolute top-3 right-3 bg-brand-maroon text-brand-gold border border-brand-gold text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded">
                  {evt.category}
                </span>

                <div className="absolute bottom-3 left-3 right-3 text-xs flex justify-between items-center text-white">
                  <span className="flex items-center gap-1.5 font-bold text-brand-saffron bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                    <Calendar className="h-3.5 w-3.5" />
                    {evt.date}
                  </span>
                </div>
              </div>

              {/* Event Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-sans font-bold text-white tracking-wide">
                    {lang === 'EN' ? evt.title : evt.titleMarathi}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-brand-gold" />
                      {evt.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-brand-saffron animate-pulse" />
                      {lang === 'EN' ? 'RSVPs' : 'नोंदणी केलेले'}: <strong className="text-white">{evt.rsvpCount}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed pt-1 line-clamp-3">
                    {lang === 'EN' ? evt.description : evt.descriptionMarathi}
                  </p>
                </div>

                {/* RSVP action area */}
                <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 italic">
                    {lang === 'EN' ? '* Venue: Temple Dining Hall' : '* ठिकाण: मुख्य मंदिर दरबार'}
                  </span>

                  <button
                    onClick={() => handleOpenRsvpPopup(evt)}
                    disabled={isRegistered}
                    className={`px-4 py-2 rounded-lg text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer ${
                      isRegistered
                        ? 'bg-green-600/30 text-green-300 border border-green-500/30 cursor-default'
                        : 'bg-brand-red text-white hover:bg-brand-saffron hover:text-brand-maroon border border-brand-gold/30'
                    }`}
                  >
                    {isRegistered ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Registered RSVP</span>
                      </>
                    ) : (
                      <span>Register Presence / RSVP</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            {lang === 'EN' ? 'No events match your current filters.' : 'या प्रवर्गातील कोणतेही कार्यक्रम आढळले नाहीत.'}
          </div>
        )}
      </div>

      {/* RSVP Modal Popup Box */}
      {popupEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-brand-maroon border-2 border-brand-gold rounded-xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl relative">
            
            <button 
              onClick={() => setPopupEvent(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white font-mono text-lg cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <Award className="h-10 w-10 text-brand-gold mx-auto animate-bounce" />
              <h3 className="text-xl font-sans font-black text-white">Event RSVP Register</h3>
              <p className="text-xs text-brand-saffron font-bold">
                {lang === 'EN' ? popupEvent.title : popupEvent.titleMarathi}
              </p>
            </div>

            <form onSubmit={handleConfirmRsvp} className="space-y-4 pt-2">
              <div className="space-y-1.5 text-xs text-left">
                <label className="text-gray-300 block font-bold">Enter Devotee Name *</label>
                <input
                  type="text"
                  required
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="Rahul Deshpande..."
                  className="w-full bg-black/60 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-gold"
                />
                <span className="text-[10px] text-gray-400 italic block mt-1">
                  * Helps the kitchen committee estimate Maha Prasad rice quantities.
                </span>
              </div>

              <div className="flex gap-2 text-xs font-sans font-bold pt-2">
                <button
                  type="button"
                  onClick={() => setPopupEvent(null)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-gold text-brand-maroon hover:opacity-95 rounded-lg cursor-pointer"
                >
                  Confirm Joining Presence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
