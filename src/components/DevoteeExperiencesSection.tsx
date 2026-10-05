/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, MessageSquareCode, ShieldCheck, Heart, User, MapPin, Award } from 'lucide-react';
import { DevoteeExperience } from '../types';

interface DevoteeExperiencesSectionProps {
  lang: 'EN' | 'MR';
  experiences: DevoteeExperience[];
  onAddExperience: (exp: DevoteeExperience) => void;
}

export const DevoteeExperiencesSection: React.FC<DevoteeExperiencesSectionProps> = ({
  lang,
  experiences,
  onAddExperience
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [story, setStory] = useState('');
  const [rating, setRating] = useState(5);
  const [tempSubmitted, setTempSubmitted] = useState(false);

  const approvedExperiences = experiences.filter(exp => exp.approved);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !story.trim()) {
      alert(lang === 'EN' ? 'Name and Story are required.' : 'नाव आणि आलेला सविस्तर अनुभव आवश्यक आहे.');
      return;
    }

    const newExp: DevoteeExperience = {
      id: 'EXP-' + Math.floor(1000 + Math.random() * 9000),
      name,
      location: location || (lang === 'EN' ? 'Unknown Devotee' : 'अनामित भाविक'),
      story,
      rating,
      approved: false, // Sent to Admin Review!
      date: new Date().toISOString().split('T')[0],
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?auto=format&fit=crop&q=80&w=150`
    };

    onAddExperience(newExp);
    setTempSubmitted(true);
    setName('');
    setLocation('');
    setStory('');
  };

  return (
    <section className="bg-brand-maroon/20 rounded-2xl border border-brand-gold/15 p-6 md:p-8 text-white backdrop-blur-sm shadow-xl space-y-8 animate-fade-in font-sans">
      
      {/* Visual Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-brand-gold text-xs font-mono font-bold uppercase tracking-wider bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/30">
          🌸 Holy Testimonials
        </span>
        <h2 className="text-2xl md:text-4xl font-sans font-black text-white">
          {lang === 'EN' ? 'Devotee Miracle Experiences' : 'भाविकांचे दैवी आलेले प्रचिती अनुभव'}
        </h2>
        <p className="text-xs text-gray-300">
          {lang === 'EN' 
            ? 'Read heartwarming chronicles of wishes fulfilled, divine interventions, and recovery blessed by Shree Ishwatichi Mata.' 
            : 'देवीच्या कृपेने कठीण काळातून सुटका झालेल्या, नवस पूर्ण झालेल्या भाविकांच्या शब्दांकित यशोगाथा.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Approved Testimonial Carousel/List Cards (Left span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-sm font-bold text-brand-gold font-sans">
              🛡️ {lang === 'EN' ? 'Verified Miracle Tales' : 'प्रमाणित सत्य अनुभव'}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              Count: {approvedExperiences.length} Approved
            </span>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-none">
            {approvedExperiences.map((exp) => (
              <div 
                key={exp.id} 
                className="bg-black/30 border border-brand-gold/15 p-5 rounded-xl space-y-3 shadow hover:border-brand-saffron/30 transition-all font-sans relative"
              >
                {/* Gold corner accent icon */}
                <div className="absolute top-4 right-4 flex text-brand-gold gap-0.5">
                  {Array.from({ length: exp.rating || 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current text-brand-gold" />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <img 
                    src={exp.avatarUrl || 'https://picsum.photos/seed/bhakt/150/150'} 
                    alt={exp.name} 
                    className="h-10 w-10 rounded-full border border-brand-gold/40 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide uppercase">{exp.name}</h4>
                    <span className="text-[10px] text-brand-saffron flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-brand-gold" />
                      {exp.location} • {exp.date}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed italic">
                  "{exp.story}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Submit experience Form Block (Right span 5) */}
        <div className="lg:col-span-5">
          {!tempSubmitted ? (
            <form onSubmit={handleSubmit} className="bg-gradient-to-b from-brand-maroon/60 to-black/80 border border-brand-gold/25 p-5 md:p-6 rounded-xl space-y-4 shadow-2xl">
              
              <div className="flex items-center gap-2 text-brand-gold font-sans font-bold text-base border-b border-white/5 pb-2">
                <MessageSquareCode className="h-5 w-5 text-brand-saffron animate-pulse" />
                <span>{lang === 'EN' ? 'Share Your Miracle Story' : 'तुम्हाला आलेला अनुभव लिहा'}</span>
              </div>

              <div className="space-y-3 text-xs">
                
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-gray-300 block font-bold">{lang === 'EN' ? 'Your Name *' : 'नाव *'}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Aniket Sawant..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-gray-300 block font-bold">{lang === 'EN' ? 'Your Location (City/State)' : 'गाव किंवा शहर/राज्य'}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Dombivli, Thane..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                {/* Devotional Rating */}
                <div className="space-y-1">
                  <label className="text-gray-300 block font-bold">{lang === 'EN' ? 'Express Devotion Level (1 to 5 Stars)' : 'शारदा भक्ती श्रेणी (१ ते ५ तारे)'}</label>
                  <div className="flex gap-1.5 items-center">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starVal = i + 1;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRating(starVal)}
                          className="text-lg cursor-pointer transition-transform hover:scale-125"
                        >
                          <Star className={`h-5 w-5 ${rating >= starVal ? 'fill-current text-brand-gold' : 'text-zinc-600'}`} />
                        </button>
                      );
                    })}
                    <span className="text-mono text-brand-gold text-xs font-bold ml-2">({rating}/5 Rating)</span>
                  </div>
                </div>

                {/* Story text */}
                <div className="space-y-1">
                  <label className="text-gray-300 block font-bold">{lang === 'EN' ? 'Mata Miracle Story / Prayer Description *' : 'आलेला अनुभव सविस्तर वर्णन लिहा *'}</label>
                  <textarea
                    required
                    rows={4}
                    placeholder={lang === 'EN' ? 'Write clearly how Mata blessed you...' : 'मातेने दिलेल्या आशीर्वादाचा प्रत्यक्ष अनुभव कृतज्ञतेने लिहा...'}
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-brand-gold outline-none"
                  />
                </div>

              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-gold text-brand-maroon font-bold font-sans text-xs rounded-lg hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer shadow"
              >
                ✍️ {lang === 'EN' ? 'Submit to Temple Review Board' : 'मंडळाच्या स्वीकृत समितीकडे पाठवा'}
              </button>
            </form>
          ) : (
            /* Submitted review status block */
            <div className="bg-gradient-to-br from-brand-maroon/50 to-black border-2 border-brand-gold/40 p-6 rounded-xl space-y-4 text-center">
              <ShieldCheck className="h-10 w-10 text-brand-gold mx-auto animate-bounce" />
              <h4 className="text-lg font-sans font-black text-white">
                {lang === 'EN' ? 'Experience Under Review!' : 'अनुभव पडताळणी प्रक्रियेत आहे!'}
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                {lang === 'EN' 
                  ? 'Your sacred testimony was successfully transmitted to the admin panel. Approved experiences are parsed instantly into physical displays.' 
                  : 'तुमचा अनुभव यशस्वीरित्या पाठवला गेला आहे. मंदिराची तज्ञ समिती लवकरच या अनुभवाची खातरजमा करून मुख्य पानावर प्रसिद्ध करेल.'}
              </p>
              
              <div className="bg-brand-gold/15 p-3 rounded text-[11px] text-brand-gold leading-normal font-sans border border-brand-gold/25 block">
                ⭐ <strong>Testing Tip:</strong> You can switch directly to the <strong>Admin Station</strong> tab and approve your submitted experience instantly to see it on this screen!
              </div>

              <button
                onClick={() => setTempSubmitted(false)}
                className="w-full py-2 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-bold cursor-pointer font-sans"
              >
                Write Another Story
              </button>
            </div>
          )}
        </div>

      </div>

    </section>
  );
};
