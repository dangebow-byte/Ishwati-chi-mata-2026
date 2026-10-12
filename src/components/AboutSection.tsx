/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TIMELINE_MILESTONES } from '../data';
import { BookOpen, MapPin, Milestone, Sparkles, Star, History } from 'lucide-react';
import { SiteLogo } from './SiteLogo';
import { DeviImage } from './DeviImage';

interface AboutSectionProps {
  lang: 'EN' | 'MR';
  onManageDeviImage?: () => void;
  siteContent?: {
    headerDescEN: string;
    headerDescMR: string;
    originTitleEN: string;
    originTitleMR: string;
    originTextEN: string;
    originTextMR: string;
    missionTitleEN: string;
    missionTitleMR: string;
    mission1_titleEN: string;
    mission1_titleMR: string;
    mission1_descEN: string;
    mission1_descMR: string;
    mission2_titleEN: string;
    mission2_titleMR: string;
    mission2_descEN: string;
    mission2_descMR: string;
    mission3_titleEN: string;
    mission3_titleMR: string;
    mission3_descEN: string;
    mission3_descMR: string;
    quoteEN: string;
    quoteMR: string;
  };
  milestones?: {
    year: string;
    title: string;
    titleMarathi: string;
    description: string;
    descriptionMarathi: string;
  }[];
}

export const AboutSection: React.FC<AboutSectionProps> = ({ lang, onManageDeviImage, siteContent, milestones }) => {
  const finalMilestones = milestones || TIMELINE_MILESTONES;
  const [selectedMilestone, setSelectedMilestone] = useState(finalMilestones[0] || TIMELINE_MILESTONES[0]);

  React.useEffect(() => {
    if (finalMilestones && finalMilestones.length > 0) {
      setSelectedMilestone(finalMilestones[0]);
    }
  }, [milestones]);

  return (
    <section className="bg-brand-maroon/20 rounded-2xl border border-brand-gold/15 p-6 md:p-10 text-white backdrop-blur-sm shadow-2xl space-y-12">
      {/* Upper header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/40 text-brand-gold text-xs uppercase tracking-widest font-mono">
          <BookOpen className="h-3.5 w-3.5" />
          <span>{lang === 'EN' ? 'Divine Heritage' : 'दैवी इतिहास आणि महात्म्य'}</span>
        </div>
        <h2 className="font-sans text-3xl md:text-5xl font-extrabold text-white">
          {lang === 'EN' ? 'About Shree Ishwatichi Mata' : 'श्री इश्वटीची मातेविषयी सविस्तर माहिती'}
        </h2>
        <div className="h-0.5 w-36 mx-auto bg-gradient-to-r from-transparent via-brand-gold to-transparent" />
        <p className="text-sm md:text-base text-gray-300 leading-relaxed font-sans">
          {lang === 'EN'
            ? (siteContent?.headerDescEN || 'Deeply rooted in ancient traditional heritage, Shree Ishwatichi Mata reigns as the supreme protectress of the region, blessing millions of devotees who experience physical healing and inner peace upon entering her presence.')
            : (siteContent?.headerDescMR || 'अनादी काळापासून भक्तांचे श्रद्धास्थान असलेल्या श्री इश्वटीची देवीच्या स्थापनेपासूनचा देदीप्यमान इतिहास, भक्तांना आलेले दैवी अनुभव आणि समाजोपयोगी कार्याची यशोगाथा.')}
        </p>
      </div>

      {/* Divine Visual Showcase Banner */}
      <div className="bg-gradient-to-r from-brand-maroon/70 via-black/80 to-brand-maroon/70 border border-brand-gold/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 flex-1 text-center sm:text-left">
          <div className="overflow-hidden rounded-2xl shrink-0 p-0.5 h-48 sm:h-56 md:h-64 w-auto flex items-center justify-center">
            <DeviImage
              aspectRatio="portrait"
              withFrame
              withAura
              objectFit="contain"
              onManageClick={onManageDeviImage}
              showManageButton={Boolean(onManageDeviImage)}
              className="h-full w-auto aspect-[1023/1537] overflow-hidden bg-black/60"
              imageClassName="w-auto h-full max-h-full object-contain object-center drop-shadow-md"
            />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-brand-gold font-bold">
              {lang === 'EN' ? 'Official Sanctum Sanctorum' : 'अधिकृत गाभारा व राजमुद्रा'}
            </span>
            <h3 className="font-sans text-xl sm:text-2xl font-black text-white">
              {lang === 'EN' ? 'Shree Ishwatichi Mata & Mandal Insignia' : 'श्री इश्वटीची माता आणि अधिकृत बोधचिन्ह'}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {lang === 'EN'
                ? 'Original consecrated idol venerated continuously since 1974 under the spiritual guardianship of Shree Ishwatichi Mata Mandal.'
                : '१९७४ पासून भक्तांच्या अखंड सेवेत असलेली श्री इश्वटीची मातेची स्वयंभू पाषाण मूर्ती आणि अधिकृत बोधचिन्ह.'}
            </p>
          </div>
        </div>
        <SiteLogo variant="transparent" size="lg" withGlow className="drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]" />
      </div>

      {/* Grid containing History and Journey */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="bg-black/40 border border-brand-gold/10 rounded-xl p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-saffron">
              <History className="h-5 w-5" />
              <h3 className="text-xl font-sans font-bold tracking-wide">
                {lang === 'EN' ? (siteContent?.originTitleEN || 'The Goddess & Origin') : (siteContent?.originTitleMR || 'देवीची उत्पत्ती व आख्यायिका')}
              </h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed space-y-3">
              {lang === 'EN' ? (
                siteContent?.originTextEN || 'The holy origin story of Shree Ishwatichi Mata stems from deep community devotion...'
              ) : (
                siteContent?.originTextMR || 'श्री इश्वटीची मातेच्या मूळ मंदिराचा उगम अत्यंत पवित्र आहे...'
              )}
            </p>
          </div>

          <div className="border-t border-white/5 pt-4 flex flex-wrap gap-4 text-xs font-semibold text-brand-gold">
            <span className="bg-brand-red/30 px-3 py-1.5 rounded-md border border-brand-gold/20">
              ⚡ {lang === 'EN' ? 'Self-Manifested Idol' : 'स्वयंभू मूर्ती'}
            </span>
            <span className="bg-brand-red/30 px-3 py-1.5 rounded-md border border-brand-gold/20">
              🌸 {lang === 'EN' ? 'Eco-Safe Traditions' : 'पर्यावरणपूरक उत्सव'}
            </span>
          </div>
        </div>

        {/* Mission and Vision details with bullet callouts */}
        <div className="bg-black/40 border border-brand-gold/10 rounded-xl p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-saffron">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-xl font-sans font-bold tracking-wide">
                {lang === 'EN' ? (siteContent?.missionTitleEN || 'Shree Young Ishwati Navratrotsav Mandal Mission & Community Vision') : (siteContent?.missionTitleMR || 'श्री यंग इश्वटी नवरात्रौत्सव मंडळाचा संकल्प आणि उद्दिष्टे')}
              </h3>
            </div>
            
            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex gap-3">
                <div className="h-5 w-5 shrink-0 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs">✓</div>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider">
                    {lang === 'EN' ? (siteContent?.mission1_titleEN || 'Preserve Spiritual Architecture') : (siteContent?.mission1_titleMR || 'भक्ती संस्कारांचे संवर्धन')}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === 'EN' ? (siteContent?.mission1_descEN || 'Ensuring thousands of devotees secure safe daily darshan, keeping temple clean, dry, and pure.') : (siteContent?.mission1_descMR || 'परंपरा आणि संस्कृती पिढ्यानपिढ्या जपणूक करून नवीन तंत्रज्ञानाद्वारे जागतिक पातळीवर पोहचवणे.')}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-5 w-5 shrink-0 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs">✓</div>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider">
                    {lang === 'EN' ? (siteContent?.mission2_titleEN || 'Serve Humanity (Seva)') : (siteContent?.mission2_titleMR || 'अखंड मानव सेवा (अन्न आणि औषध वाटप)')}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === 'EN' ? (siteContent?.mission2_descEN || 'Transforming devotional offerings directly into food distribution programs, free healthcare clinics, and tribal education centers.') : (siteContent?.mission2_descMR || 'भक्तांच्या देणगीचा योग्य विनियोग करून दररोज मोफत भोजन आणि गरीब रुग्णांना मोफत उपचार.')}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-5 w-5 shrink-0 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs">✓</div>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase font-mono tracking-wider">
                    {lang === 'EN' ? (siteContent?.mission3_titleEN || 'Eco-Commitment & Welfare') : (siteContent?.mission3_titleMR || 'शाश्वत पर्यावरण संकल्प')}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === 'EN' ? (siteContent?.mission3_descEN || 'Pledging 100% plastic-free festivals and organizing local sapling distribution drives.') : (siteContent?.mission3_descMR || 'उत्सवात शंभर टक्के कचराविहीन व्यवस्था आणि वृक्षारोपण मोहिमेला गती देणे.')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-maroon/40 border border-brand-saffron/10 p-3.5 rounded-lg text-xs leading-relaxed italic text-white/90">
            "{lang === 'EN' 
              ? (siteContent?.quoteEN || 'True prayer manifests not only in dynamic chants, but in feeding the hungry and supporting emergency healthcare.') 
              : (siteContent?.quoteMR || 'देवीची खरी भक्ती केवळ पूजा आणि आरतीत नसून भुकेलेल्यांना अन्न देणे आणि समाज हिताचे कार्य करण्यात सामावली आहे.')}"
          </div>
        </div>
      </div>

      {/* Interactive Chronicle Timeline Section */}
      <div className="border-t border-white/5 pt-10 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between text-left gap-4">
          <div>
            <div className="flex items-center gap-1 text-brand-gold text-xs font-mono tracking-wider font-bold uppercase mb-1">
              <Milestone className="h-4 w-4" />
              <span>{lang === 'EN' ? 'Historical Journey Map' : 'ऐतिहासिक प्रवास आलेख'}</span>
            </div>
            <h3 className="text-2xl font-sans font-black text-white">
              {lang === 'EN' ? 'Shree Young Ishwati Navratrotsav Mandal Milestones & Establishment' : 'श्री यंग इश्वटी नवरात्रौत्सव मंडळ: स्थापनेपासूनचा दैवी इतिहास'}
            </h3>
          </div>
          <span className="text-xs text-gray-400 italic">
            {lang === 'EN' ? 'Click on years to view chronicle details' : 'सविस्तर वृत्तांत वाचण्यासाठी संबंधित वर्षावर क्लिक करा'}
          </span>
        </div>

        {/* Year Buttons */}
        <div className="flex flex-wrap gap-2 md:justify-start items-center border-b border-white/5 pb-4">
          {finalMilestones.map((stone) => {
            const isSelected = selectedMilestone.year === stone.year;
            return (
              <button
                key={stone.year}
                onClick={() => setSelectedMilestone(stone)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full cursor-pointer text-sm font-bold transition-all duration-300 border ${
                  isSelected
                    ? 'bg-brand-saffron text-brand-maroon border-brand-gold scale-105 shadow-md shadow-brand-saffron/20'
                    : 'bg-black/30 border-brand-gold/25 text-white/75 hover:bg-brand-red/25 hover:text-white'
                }`}
              >
                <Star className={`h-3 w-3 ${isSelected ? 'fill-current animate-spin' : ''}`} />
                <span>{stone.year}</span>
              </button>
            );
          })}
        </div>

        {/* Milestone Detail Card */}
        <div className="bg-brand-maroon/30 border border-brand-gold/15 rounded-xl p-6 md:p-8 space-y-3 transition-all duration-500 ease-in-out">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-mono font-black text-brand-saffron tracking-tight">
              {selectedMilestone.year}
            </span>
            <span className="text-xs px-2.5 py-1 rounded bg-brand-gold/15 text-brand-gold font-mono uppercase border border-brand-gold/20">
              {lang === 'EN' ? 'Verified Milestone' : 'महत्त्वाचा टप्पा'}
            </span>
          </div>
          <h4 className="text-xl md:text-2xl font-sans font-extrabold text-white">
            {lang === 'EN' ? selectedMilestone.title : selectedMilestone.titleMarathi}
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed font-sans">
            {lang === 'EN' ? selectedMilestone.description : selectedMilestone.descriptionMarathi}
          </p>
        </div>
      </div>
    </section>
  );
};
