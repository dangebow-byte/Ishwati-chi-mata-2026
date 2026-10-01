/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, User, Phone, Mail, Award, CheckCircle, Flame, ShieldCheck, Heart, Users } from 'lucide-react';
import { DigitalSevaBooking } from '../types';

interface DigitalSevaSectionProps {
  lang: 'EN' | 'MR';
  onNewBooking: (booking: DigitalSevaBooking) => void;
  userStreakPlus: () => void;
}

export const DigitalSevaSection: React.FC<DigitalSevaSectionProps> = ({ lang, onNewBooking, userStreakPlus }) => {
  const [sevaType, setSevaType] = useState<'aarti' | 'pooja' | 'sankalp' | 'prasad' | 'volunteer'>('aarti');
  const [formData, setFormData] = useState({
    devoteeName: '',
    gotra: '',
    phone: '',
    email: '',
    date: '',
    subType: 'Daily Morning Aarti Seva'
  });

  const [confirmedBooking, setConfirmedBooking] = useState<DigitalSevaBooking | null>(null);

  const sevaDetails = {
    aarti: {
      title: lang === 'EN' ? 'Online Aarti Booking' : 'विशेष आरती सेवा नोंदणी',
      options: [
        'Daily Morning Aarti Seva (05:30 AM)',
        'Maha Sandhya Aarti Seva (07:30 PM)',
        'E-Aarti with Digital Projection (Distance)',
        'Special Friday Deepotsav Aarti'
      ],
      description: lang === 'EN' ? 'Attend and execute the dynamic oil lamp aarti prayers. Includes priority prasadam entry.' : 'आरती पूजेमध्ये प्रत्यक्ष सहभागी होण्याची सुवर्णसंधी. सहकुटुंब उपस्थिती शक्य. सोबत मोफत प्रसाद पाकीट.'
    },
    pooja: {
      title: lang === 'EN' ? 'Divine Pooja Booking' : 'विशेष अभिषेक पूजा नोंदणी',
      options: [
        'Maha Rudra Abhishek Puja',
        'Navratri Durga Saptashati Havan Seva',
        'Sankashti Chaturthi Ganapati Puja',
        'Satyanarayan Mahapooja (Every Amavasya)'
      ],
      description: lang === 'EN' ? 'Special archana and continuous sacred chanting performed on your family name under qualified temple priests.' : 'मंदिरातील अनुभवी शास्त्रींमार्फत तुमच्या नावावर व गोत्रावर केली जाणारी मंत्रोच्चार पूजा.'
    },
    sankalp: {
      title: lang === 'EN' ? 'Sankalp Registration' : 'संकल्प प्रार्थना नोंदणी',
      options: [
        'Health and Family Healing Resolve',
        'Educational and Career Success Resolve',
        'New Venture and Wealth Prosperity Sankalp',
        'Mata Protective Suraksha Kavach Sankalp'
      ],
      description: lang === 'EN' ? 'State your prayers. The chief priest explicitly recites your name and wish outline during holy hours.' : 'मनोकामना पूर्तीसाठी देवीचरणी संकल्प प्रार्थना. पुजारी मुख्य आरती वेळी तुमच्या नावाचे उच्चारण करून संकल्प करतील.'
    },
    prasad: {
      title: lang === 'EN' ? 'Prasad Delivery Booking' : 'पवित्र प्रसाद घरपोच सेवा',
      options: [
        'Panchkh खाद्य dry-dry Maha Prasad (Box)',
        'Pure Desi Ghee Boondi Ladoo (500 grams)',
        'Traditional Keshar Pedha and Mata Photo',
        'Special Chaitra Neem-Jaggery Wellness Churna'
      ],
      description: lang === 'EN' ? 'Purely prepared on sanctified fire, sent safely in premium airtight cardboard boxes right to your doorstep.' : 'मंदिराच्या स्वयंपाक घरात सेंद्रिय साहित्यापासून बनवलेला शुद्ध तुपातील पेढा व प्रसाद Speed Post द्वारे ४ दिवसात घरपोच.'
    },
    volunteer: {
      title: lang === 'EN' ? 'Volunteer Registration' : 'स्वयंसेवक सेवा नोंदणी',
      options: [
        'Queue and Crowd Management Team',
        'Maha Prasad Distribution (Food Hall)',
        'Social Media and Digital Website Assist',
        'Primary Health Camp Medical Help'
      ],
      description: lang === 'EN' ? 'Pledge your hours for divine selfless humanity. Includes ID card, temple scarf, and certified volunteer badges.' : 'मंदिराच्या विविध उपक्रमात निरपेक्ष भावनेने मदत करा. ओळखपत्र, पवित्र उपरणे व अधिकृत स्वयंसेवक प्रमाणपत्र मिळेल.'
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeSelect = (type: typeof sevaType) => {
    setSevaType(type);
    setFormData({
      ...formData,
      subType: sevaDetails[type].options[0]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.devoteeName || !formData.phone || !formData.date) {
      alert(lang === 'EN' ? 'Please complete all required fields.' : 'कृपया सर्व आवश्यक रकाने भरा.');
      return;
    }

    const bookingId = 'BK-' + Math.floor(100000 + Math.random() * 900000);
    const newBooking: DigitalSevaBooking = {
      id: bookingId,
      type: sevaType,
      subType: formData.subType,
      devoteeName: formData.devoteeName,
      gotra: formData.gotra || 'Kashyap / General',
      phone: formData.phone,
      email: formData.email || 'devotee@spiritual.in',
      date: formData.date,
      status: sevaType === 'volunteer' ? 'pending' : 'confirmed' 
    };

    onNewBooking(newBooking);
    userStreakPlus(); // Adds streak points for booking!
    setConfirmedBooking(newBooking);
  };

  return (
    <section className="bg-brand-maroon/20 rounded-2xl border border-brand-gold/15 p-6 md:p-8 text-white backdrop-blur-sm shadow-xl space-y-8">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-brand-gold text-xs font-mono font-bold uppercase tracking-widest bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/30">
          ✨ Digital Seva Portals
        </span>
        <h2 className="text-2xl md:text-4xl font-serif font-black text-white">
          {lang === 'EN' ? 'Online Devotional Services' : 'ऑनलाइन डिजिटल सेवा दालन'}
        </h2>
        <p className="text-xs text-gray-300">
          {lang === 'EN' 
            ? 'State-of-the-art booking engine matching ancient faith with modern secure workflow.' 
            : 'पारंपरिक भक्ती आणि आधुनिक तंत्रज्ञान यांचा मिलाफ. घरबसल्या मातेची सेवा व बुकींग करा.'}
        </p>
      </div>

      {/* Booking Types Selector Rails */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 border-b border-white/5 pb-4">
        {Object.entries(sevaDetails).map(([key, details], idx) => {
          const isSelected = sevaType === key;
          const isLastOnMobile = idx === 4;
          return (
            <button
              key={key}
              onClick={() => {
                handleTypeSelect(key as any);
                setConfirmedBooking(null);
              }}
              className={`py-2.5 sm:py-3 px-2 rounded-xl text-xs font-bold font-serif transition-all flex flex-col items-center gap-1.5 cursor-pointer border ${
                isLastOnMobile ? 'col-span-2 sm:col-span-1' : ''
              } ${
                isSelected
                  ? 'bg-brand-red text-white border-brand-gold scale-102 sm:scale-105 shadow-md shadow-brand-red/30'
                  : 'bg-black/40 text-gray-400 border-white/5 hover:border-brand-saffron/40 hover:text-white'
              }`}
            >
              <span className="text-xl">
                {key === 'aarti' && '🕯️'}
                {key === 'pooja' && '🌻'}
                {key === 'sankalp' && '📜'}
                {key === 'prasad' && '📦'}
                {key === 'volunteer' && '🤝'}
              </span>
              <span className="text-center line-clamp-1">{details.title}</span>
            </button>
          );
        })}
      </div>

      {!confirmedBooking ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
          
          {/* Seva Form Box (Left) */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-black/40 border border-brand-gold/15 rounded-xl p-5 md:p-8 space-y-4">
            <div className="flex items-center gap-2 text-brand-saffron font-serif font-bold text-lg border-b border-white/5 pb-2">
              <span>{sevaDetails[sevaType].title}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              
              {/* Select Puja/Aarti Subtype */}
              <div className="col-span-1 sm:col-span-2 space-y-1">
                <label className="text-gray-300 block font-semibold">{lang === 'EN' ? 'Select Sacred Category' : 'विशिष्ट प्रकार निवडा'}:</label>
                <select
                  name="subType"
                  value={formData.subType}
                  onChange={handleChange}
                  className="w-full bg-brand-maroon/40 border border-brand-gold/30 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-saffron font-medium"
                >
                  {sevaDetails[sevaType].options.map((opt) => (
                    <option key={opt} value={opt} className="bg-brand-maroon text-white">{opt}</option>
                  ))}
                </select>
              </div>

              {/* Devotee Name */}
              <div className="space-y-1">
                <label className="text-gray-300 block font-semibold">{lang === 'EN' ? 'Devotee Full Name' : 'भाविकाचे संपूर्ण नाव'} *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="devoteeName"
                    required
                    placeholder="Sanjay Rao..."
                    value={formData.devoteeName}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              {/* Gotra */}
              <div className="space-y-1">
                <label className="text-gray-300 block font-semibold">{lang === 'EN' ? 'Gotra (Ancestral Clan) [Optional]' : 'गोत्र (ऐच्छिक)'}</label>
                <div className="relative">
                  <Flame className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="gotra"
                    placeholder="Kashyap, Vasistha..."
                    value={formData.gotra}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1">
                <label className="text-gray-300 block font-semibold">{lang === 'EN' ? 'Phone Number *' : 'मोबाईल क्रमांक *'}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-gray-300 block font-semibold">{lang === 'EN' ? 'Email Address' : 'ईमेल पत्ता'}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="bhakt@ishwatichimata.org"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              {/* Booking Date */}
              <div className="col-span-1 sm:col-span-2 space-y-1">
                <label className="text-gray-300 block font-semibold">{lang === 'EN' ? 'Desired Seva Auspicious Date *' : 'शुभ तारीख निवडा *'}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-brand-red via-brand-saffron to-brand-gold text-brand-maroon font-bold font-serif py-3 rounded-xl hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-lg outline-none text-sm "
            >
              🕌 {lang === 'EN' ? 'Register Digital Seva Slot' : 'डिजिटल सेवा स्वनिर्णय नोंदणी करा'}
            </button>
          </form>

          {/* Guidelines block (Right) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-brand-maroon/40 to-black/60 border border-brand-gold/15 rounded-xl p-5 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-gold font-serif font-black">
                <ShieldCheck className="h-5 w-5 text-brand-saffron" />
                <span>{lang === 'EN' ? 'Devout Guidelines' : 'महत्त्वाचे नियम व अटी'}</span>
              </div>
              
              <div className="space-y-3 text-xs leading-relaxed text-gray-300 font-sans">
                <p>
                  <strong>{lang === 'EN' ? '1. Identification' : '१. आधार पडताळणी'}:</strong> 
                  {lang === 'EN' ? ' Please carry a softcopy ID proof matching the devotee name upon physical entry at temple gates.' : ' मंदिरात प्रवेशाच्या वेळी प्रत्यक्ष नावाची पडताळणी केली जाईल. सोबत आधार कार्ड असणे गरजेचे आहे.'}
                </p>
                <p>
                  <strong>{lang === 'EN' ? '2. Attire Rules' : '२. पारंपरिक पोशाख नियम'}:</strong> 
                  {lang === 'EN' ? ' Traditional attire is mandatory to enter the inner garbhagriha altar. Dhotis/Kurtas for gents and Sarees/Salwars for ladies.' : ' मुख्य गर्भगृह गाभाऱ्यात अभिषेक पूजेवेळी पुरुषांना धोतर / सोवळे आणि महिलांना पारंपरिक साडी स्वरूपातील वस्त्रे ऐच्छिक परंतु आदरणीय मानली जातात.'}
                </p>
                <p>
                  <strong>{lang === 'EN' ? '3. No Extra Costs' : '३. मोफत आरक्षण'}:</strong> 
                  {lang === 'EN' ? ' The Mandal does NOT charge any financial commission for basic slots. Prasad postage box and Abhishek requires basic speed post packaging costs only.' : ' कोणत्याही दलाल किंवा मध्यस्थाला अतिरिक्त पैसे देऊ नयेत. सर्व सेवा अधिकृत व विनामूल्य आहेत.'}
                </p>
              </div>
            </div>

            <div className="border-t border-brand-gold/15 pt-5 space-y-3">
              <div className="flex items-center gap-2 text-xs text-brand-saffron font-bold">
                <Award className="h-4 w-4 text-brand-gold animate-bounce" />
                <span>{lang === 'EN' ? 'Earn 25 Devotion Points!' : '२५ भक्ती गुण मिळवा!'}</span>
              </div>
              <p className="text-[10px] text-gray-400">
                {lang === 'EN' ? 'Applying for a holy seva boosts your devotion daily streak instantly and grants local milestones.' : 'डिजिटल सेवा स्वनिर्णय केल्यास तुमच्या भक्ती प्रोफाईलचे गुण वाढतात व नवीन पुरस्कार पातळी अनलॉक होते.'}
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* Confirmation Card Layout */
        <div className="bg-gradient-to-br from-brand-maroon/80 to-black border-2 border-brand-gold rounded-xl p-6 md:p-8 space-y-6 text-center max-w-xl mx-auto shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-red via-brand-saffron to-brand-gold" />
          
          <div className="mx-auto h-12 w-12 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold text-2xl animate-pulse">
            ✓
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-serif font-black text-brand-gold">
              {lang === 'EN' ? 'Seva Successfully Registered!' : 'सेवा नाव नोंदणी यशस्वी!'}
            </h3>
            <p className="text-xs text-brand-saffron font-mono tracking-widest uppercase">
              {confirmedBooking.subType}
            </p>
          </div>

          <div className="bg-black/55 border border-brand-gold/20 p-4 rounded-xl text-left space-y-2.5 font-sans text-xs">
            <div className="flex justify-between border-b border-white/5 pb-1 text-gray-400">
              <span>{lang === 'EN' ? 'Booking ID' : 'नोंदणी क्रमांक'}</span>
              <strong className="text-brand-gold font-mono">{confirmedBooking.id}</strong>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1 text-gray-400">
              <span>{lang === 'EN' ? 'Devotee Name' : 'भाविकाचे नाव'}</span>
              <strong className="text-white">{confirmedBooking.devoteeName}</strong>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1 text-gray-400">
              <span>{lang === 'EN' ? 'Gotra' : 'गोत्र'}</span>
              <strong className="text-white italic">{confirmedBooking.gotra}</strong>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1 text-gray-400">
              <span>{lang === 'EN' ? 'Auspicious Date' : 'नियोजनाची तारीख'}</span>
              <strong className="text-brand-saffron font-mono">{confirmedBooking.date}</strong>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>{lang === 'EN' ? 'Status' : 'स्थिती'}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${confirmedBooking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                {confirmedBooking.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="p-3 bg-brand-gold/10 border border-brand-gold/30 rounded-lg text-xs leading-relaxed text-brand-gold">
            🙏 {lang === 'EN' ? 'Congratulations! Your faith streak is boosted. The receipt has been saved to your Profile Dashboard.' : 'खूप खूप अभिनंदन! तुमची भक्ती गुण पातळी वाढली आहे. सेवा तपशील तुमच्या मुख्य प्रोफाइल डॅशबोर्डमध्ये जतन केला गेला आहे.'}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setConfirmedBooking(null)}
              className="flex-1 bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-lg text-xs font-bold font-serif cursor-pointer"
            >
              ← {lang === 'EN' ? 'Book Another Seva' : 'इतर सेवा बुक करा'}
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 bg-brand-gold text-brand-maroon hover:opacity-95 px-4 py-2.5 rounded-lg text-xs font-bold font-serif cursor-pointer"
            >
              🖨️ {lang === 'EN' ? 'Print Confirmation' : 'पावती प्रिंट करा'}
            </button>
          </div>

        </div>
      )}

    </section>
  );
};
