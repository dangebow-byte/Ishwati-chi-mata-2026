/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, ShieldCheck, Star, Sparkles, Building, Briefcase, Award, ArrowUpRight } from 'lucide-react';

interface SocialWorkSectionProps {
  lang: 'EN' | 'MR';
}

export const SocialWorkSection: React.FC<SocialWorkSectionProps> = ({ lang }) => {
  
  const stats = [
    { label: lang === 'EN' ? 'Patients Treated Free' : 'मोफत उपचार मिळालेले रुग्ण', value: '18,500 +', color: 'text-brand-saffron' },
    { label: lang === 'EN' ? 'Daily Meals Served (Anna Prasad)' : 'रोजचे महाप्रसाद भोजन वितरण', value: '450,000 +', color: 'text-brand-gold' },
    { label: lang === 'EN' ? 'Blood Bottles Donated' : 'शिबिरातून गोळा झालेल्या रक्त पिशव्या', value: '3,800 +', color: 'text-emerald-400' },
    { label: lang === 'EN' ? 'Child Education Scholarships' : 'गरीब विद्यार्थ्यांना शैक्षणिक शिष्यवृत्ती', value: '₹12 Lakhs+', color: 'text-sky-400' }
  ];

  const activities = [
    {
      title: lang === 'EN' ? 'Free Health & Eye Diagnostic Camps' : 'मोफत वैद्यकीय व नेत्र तपासणी शिबीर',
      desc: lang === 'EN' ? 'Organizing monthly high-speciality clinics inviting doctors from Mumbai. Offering free medicines, spectacles, and catering for major cataract surgeries.' : 'मुंबई आणि ठाण्यातील निष्णात डॉक्टरांच्या उपस्थितीत दरमहा भव्य तपासणी. मोफत चष्मे वाटप आणि मोतीबिंदू शस्त्रक्रिया साहाय्य.',
      img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: lang === 'EN' ? 'Evening Classes & Slum Education Support' : 'गरीब व गरजू पाल्यांसाठी संध्याकाळचा मोफत अभ्यास वर्ग',
      desc: lang === 'EN' ? 'Providing notebooks, uniform accessories, and inviting professional tutors to guide secondary students of municipal schools in tribal sectors.' : 'महानगरपालिका तसेच दुर्गम भागातील मुलांना मोफत वह्या-पुस्तके, गणवेश वाटप आणि सायंकाळच्या विशेष अभ्यास वर्गांचे यशा आयोजन.',
      img: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: lang === 'EN' ? 'Eco-Safe Tree Planting Campaigns' : 'पर्यावरण रक्षण व वृक्ष संवर्धन मोहीम',
      desc: lang === 'EN' ? 'Encouraging environmental accountability. Distributed over 5,000 neem and tulsi water saplings to devotees as divine offerings.' : 'पर्यावरणाचे रक्षण करण्यासाठी दरवर्षी आषाढी एकादशीला भाविकांना मोफत कडुनिंब व तुळशीच्या रोपांचे वाटप केले जाते.',
      img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: lang === 'EN' ? 'Emergency Relief & Flood Aid Division' : 'आपत्ती निवारण व पूरग्रस्त सहाय्यता पथक',
      desc: lang === 'EN' ? 'Deploying local volunteer lines carrying food packs, hygiene goods, and certified fresh waters during monsoon coastal floods.' : 'कोकणातील पूरग्रस्त किंवा आपत्ती प्रसंगी मंडळाचे स्वयंसेवक अन्नधान्य आणि अत्यावश्यक किट्स घेऊन वेळेत मदत पोहचवतात.',
      img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600'
    }
  ];

  return (
    <section className="bg-brand-maroon/20 rounded-2xl border border-brand-gold/15 p-6 md:p-8 text-white backdrop-blur-sm shadow-xl space-y-10">
      
      {/* Upper header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-brand-gold text-xs font-mono font-bold uppercase tracking-wider bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/30">
          🤝 Devotion in Action
        </span>
        <h2 className="text-2xl md:text-4xl font-serif font-black text-white">
          {lang === 'EN' ? 'Shree Young Ishwati Navratrotsav Mandal Social Activities' : 'श्री यंग ईश्वटी नवरात्रौत्सव मंडळ: सामाजिक सेवा आणि लोककल्याणकारी कार्ये'}
        </h2>
        <p className="text-xs text-gray-300">
          {lang === 'EN' 
            ? 'Translating spiritual faith directly into human service. We stand devoted to health, green forests, and quality school resources.' 
            : 'श्री ईश्वटीची मातेच्या भक्तीचे संचित समाजोपयोगी सेवेत परावर्तित करतो. शिक्षण, आरोग्य आणि पर्यावरण कार्यात आमचे योगदान.'}
        </p>
      </div>

      {/* Numeric stats count display style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, i) => (
          <div key={i} className="bg-black/40 border border-white/5 rounded-xl p-4 text-center space-y-1 shadow-lg hover:border-brand-gold/25 transition-all">
            <span className={`text-2xl md:text-3xl font-mono font-black ${st.color} tracking-tight block`}>
              {st.value}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-300 font-sans block leading-snug">
              {st.label}
            </span>
          </div>
        ))}
      </div>

      {/* Social Action Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {activities.map((act, i) => (
          <div 
            key={i} 
            className="bg-gradient-to-r from-brand-maroon/40 to-black/50 border border-brand-gold/10 rounded-xl overflow-hidden hover:border-brand-saffron/45 transition-all duration-300 grid grid-cols-1 sm:grid-cols-12"
          >
            {/* Image card block */}
            <div className="sm:col-span-4 h-40 sm:h-auto relative">
              <img 
                src={act.img} 
                alt={act.title} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Content card details */}
            <div className="sm:col-span-8 p-5 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <h4 className="text-sm font-serif font-black text-brand-gold tracking-wide">
                  {act.title}
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  {act.desc}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-white/5 pt-2">
                <span className="flex items-center gap-1 font-mono text-[9px] uppercase">
                  ⭐ Impact Verified
                </span>
                <button
                  onClick={() => alert(`Launching photo-archive containing detailed statistics for campaign: "${act.title}"`)}
                  className="text-brand-saffron font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>{lang === 'EN' ? 'View Impact Report' : 'कामाचा अहवाल पहा'}</span>
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};
