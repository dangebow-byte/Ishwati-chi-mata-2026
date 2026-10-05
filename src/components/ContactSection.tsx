/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Send, MapPin, Sparkles, Navigation } from 'lucide-react';

interface ContactSectionProps {
  lang: 'EN' | 'MR';
  siteContent?: {
    addressEN: string;
    addressMR: string;
    phone: string;
    email: string;
    hoursEN: string;
    hoursMR: string;
  };
}

export const ContactSection: React.FC<ContactSectionProps> = ({ lang, siteContent }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.message) {
      alert(lang === 'EN' ? 'Please complete all required fields.' : 'कृपया सर्व आवश्यक रकाने पूर्ण करा.');
      return;
    }
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="bg-brand-maroon/20 rounded-2xl border border-brand-gold/15 p-6 md:p-8 text-white backdrop-blur-sm shadow-xl space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-brand-gold text-xs font-mono font-bold uppercase tracking-wider bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/30">
          📍 Address & Location
        </span>
        <h2 className="text-2xl md:text-4xl font-sans font-black text-white">
          {lang === 'EN' ? 'Contact Shree Young Ishwati Navratrotsav Mandal' : 'श्री यंग इश्वटी नवरात्रौत्सव मंडळाशी संपर्क साधा'}
        </h2>
        <p className="text-xs text-gray-300">
          {lang === 'EN' ? 'Reach out for inquiries, donation credentials verification, or volunteer rosters.' : 'पूजा बुकिंग, देणगी पावत्या आणि स्वयंसेवक उपक्रमांविषयी चौकशीसाठी खालील माध्यमांतून संपर्क साधा.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Contact Form Left span 7 */}
        <div className="lg:col-span-7 bg-black/40 border border-brand-gold/15 p-5 md:p-8 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-brand-gold font-sans font-bold text-base border-b border-white/5 pb-2">
            <Send className="h-4.5 w-4.5 text-brand-saffron animate-pulse" />
            <span>{lang === 'EN' ? 'Send Devotional Query Message' : 'थेट चौकशी संदेश पाठवा'}</span>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-300 block font-bold">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Sameer Patil..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 block font-bold">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="+91 98200 12345"
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 block font-bold">Email Address [Optional]</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="sameer@company.in"
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 block font-bold">Your Query / Message Details *</label>
                <textarea
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder={lang === 'EN' ? 'State your query details concisely...' : 'पूजा, देणगी वा स्वयंसेवक उपक्रमांविषयी माहिती लिहा...'}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-gold text-brand-maroon font-sans font-black text-xs rounded-lg hover:opacity-95 cursor-pointer shadow"
              >
                🚀 {lang === 'EN' ? 'Transmit Sacred Enquiry' : 'संदेश मंडळाकडे सुपूर्द करा'}
              </button>
            </form>
          ) : (
            <div className="bg-brand-gold/10 border border-brand-gold p-6 rounded-xl text-center space-y-3">
              <span className="text-3xl text-brand-gold">🙏</span>
              <h4 className="text-sm font-bold text-white uppercase">{lang === 'EN' ? 'Message Sent Successfully!' : 'चौकशी यशस्वी जमा झाली!'}</h4>
              <p className="text-xs text-gray-300">
                {lang === 'EN' 
                  ? 'Thank you for reaching out. The Mandal executive secretariat will respond over mobile or WhatsApp within 24 business hours.' 
                  : 'मंडळाचे स्वयंसेवक लवकरच दिलेल्या मोबाईवर वा व्हाट्सॲपवर संपर्क साधतील.'}
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', mobile: '', email: '', message: '' });
                }}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/15 rounded text-xs text-white cursor-pointer font-sans font-bold"
              >
                Send Another Message
              </button>
            </div>
          )}
        </div>

        {/* Info & Map display on the Right span 5 */}
        <div className="lg:col-span-5 bg-gradient-to-b from-brand-maroon/40 to-black/60 border border-brand-gold/15 p-5 md:p-6 rounded-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4 text-xs font-sans">
            
            <div className="flex items-center gap-2 text-brand-gold font-sans font-black">
              <MapPin className="h-5 w-5 text-brand-saffron" />
              <span>Temple Office Coordinates</span>
            </div>

            <div className="space-y-3 font-sans">
              <p className="leading-relaxed">
                <strong>🗺️ Address:</strong>
                <br />
                {lang === 'EN'
                  ? (siteContent?.addressEN || 'Shree Ishwatichi Mata Mandir Court, Sector-4, Traditional Lane 5, Dombivli East, Thane. Near Shivaji Garden, Maharashtra 421201')
                  : (siteContent?.addressMR || 'श्री इश्वटीची माता मंदिर चौक, सेक्टर-४, पारंपरिक गल्ली क्र ५, डोंबिवली पूर्व, ठाणे. जवळ शिवाजी उद्यान, महाराष्ट्र ४२१२०१')}
              </p>

              <p>
                <strong>📞 Desk Helpline:</strong> {siteContent?.phone || '+91 94825 00000'}
              </p>

              <p>
                <strong>📧 Holy Email:</strong> {siteContent?.email || 'dsanjay@spiritual.in'}
              </p>
            </div>

            {/* Simulated Live Chat Button */}
            <button
              onClick={() => alert('Redirecting to WhatsApp instant chat support at +91 94825 00000')}
              className="w-full bg-emerald-600/35 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <span>{lang === 'EN' ? 'Initiate Direct WhatsApp Help Desk' : 'थेट चौकशी व्हाट्सॲप करा'}</span>
            </button>
          </div>

          {/* Styled Graphical Map Representation */}
          <div className="relative h-44 rounded-lg bg-zinc-950 border border-brand-gold/20 overflow-hidden flex flex-col justify-between p-3 select-none">
            
            {/* Custom SVG Drawing resembling Map Roads */}
            <svg className="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              {/* Roads lines */}
              <line x1="0" y1="50" x2="200" y2="50" stroke="#FFFFFF" strokeWidth="4" />
              <line x1="45" y1="0" x2="45" y2="180" stroke="#FFFFFF" strokeWidth="4" />
              <line x1="120" y1="0" x2="120" y2="150" stroke="#FFFFFF" strokeWidth="4" />
              <line x1="0" y1="120" x2="300" y2="120" stroke="#FFFFFF" strokeWidth="4" />
              {/* Garden */}
              <rect x="10" y="60" width="30" height="50" fill="#22C55E" opacity="0.3" />
            </svg>

            <div className="font-mono text-[9px] text-gray-500 flex justify-between z-10 uppercase">
              <span>Map view bounds</span>
              <span>GPS: 19.2182° N, 73.0864° E</span>
            </div>

            {/* Glowing gold dot pinpointing temple */}
            <div className="absolute top-[45%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 transition-transform hover:scale-110">
              <span className="relative flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-brand-gold items-center justify-center border-2 border-brand-maroon">
                  <span className="text-[7px]">🕌</span>
                </span>
              </span>
              <span className="bg-brand-maroon/90 text-brand-gold border border-brand-gold text-[8px] font-bold px-1 py-0.5 rounded shadow mt-1 whitespace-nowrap">
                {lang === 'EN' ? 'SHREE ISHWATICHI MATA MANDIR' : 'श्री इश्वटीची मंदिर'}
              </span>
            </div>

            <div className="flex justify-between items-center z-10 pt-1 border-t border-white/5 text-[9px]">
              <span className="text-gray-400 italic">Dombivli Sector-4 Map</span>
              <button 
                onClick={() => alert('Launching GPS routing simulation on coordinates 19.2182, 73.0864!')}
                className="bg-brand-gold text-brand-maroon px-2 py-0.5 rounded font-bold font-sans flex items-center gap-0.5 cursor-pointer"
              >
                <Navigation className="h-2.5 w-2.5" />
                <span>Get Routes</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
