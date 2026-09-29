/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TRANSLATIONS } from '../data';
import { DonationRecord } from '../types';
import { CreditCard, Award, Printer, ShieldAlert, Heart, QrCode, FileText, CheckCircle, HelpCircle } from 'lucide-react';
import { SiteLogo } from './SiteLogo';

interface DonationSectionProps {
  lang: 'EN' | 'MR';
  onNewDonation: (record: DonationRecord) => void;
  userDonationPlus: (amount: number) => void;
}

export const DonationSection: React.FC<DonationSectionProps> = ({ lang, onNewDonation, userDonationPlus }) => {
  const t = TRANSLATIONS[lang];
  const [amount, setAmount] = useState<number>(1001);
  const [donorName, setDonorName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pan, setPan] = useState('');
  const [fundCategory, setFundCategory] = useState('Maha Prasad Bhandara Food Fund');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbank'>('upi');
  
  // Checkout & output states
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'checkout' | 'receipt'>('form');
  const [generatedReceipt, setGeneratedReceipt] = useState<DonationRecord | null>(null);

  // Card payment mock fields
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const preSets = [501, 1001, 2501, 5001, 11000];

  const funds = [
    'Maha Prasad Bhandara Food Fund',
    'Golden Crown Jubilee Gold Fund',
    'Charitable Clinic Mobile Health Fund',
    'Mandal Evening School Children Fund',
    'Temple General Corpus & Maintenance'
  ];

  const handleStartCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !phone || !email || amount <= 0) {
      alert(lang === 'EN' ? 'Please complete all required fields.' : 'कृपया सर्व आवश्यक गोळ्या भरा.');
      return;
    }
    setCheckoutStep('checkout');
  };

  const handleConfirmPayment = () => {
    // Simulate API delay
    const utrNo = 'MOCKUTR-' + Math.floor(100000000 + Math.random() * 900000000);
    const newRecord: DonationRecord = {
      id: 'REC-' + Math.floor(10000 + Math.random() * 90000),
      donorName,
      amount,
      paymentMethod: paymentMethod.toUpperCase(),
      phone,
      email,
      pan: pan || undefined,
      utr: utrNo,
      date: new Date().toISOString().split('T')[0],
      category: fundCategory
    };

    onNewDonation(newRecord);
    userDonationPlus(amount);
    setGeneratedReceipt(newRecord);
    setCheckoutStep('receipt');
  };

  return (
    <section className="bg-brand-maroon/20 rounded-2xl border border-brand-gold/15 p-6 md:p-8 text-white backdrop-blur-sm shadow-xl space-y-8">
      
      {/* Top section header */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-brand-gold text-xs font-mono font-bold uppercase tracking-wider block mb-1">
            💝 Sacred Charities
          </span>
          <h2 className="text-2xl md:text-4xl font-serif font-black text-white">
            {lang === 'EN' ? 'Online Donation Portals' : 'पवित्र देणगी व निधी संकलन दालन'}
          </h2>
          <p className="text-xs text-gray-300 mt-1">
            {lang === 'EN' 
              ? 'Authorized 80G tax exemption trust. Every contribution directly empowers tribal food distribution, health programs, and temple development.' 
              : 'कलम ८०जी अंतर्गत अधिकृत आयकर वजावट. तुमच्या प्रत्येक थेंबाने समाजोपयोगी सेवा कार्यास गती मिळते.'}
          </p>
        </div>
        <div className="bg-brand-gold/15 border-2 border-brand-gold py-1.5 px-4 rounded-full text-brand-gold font-serif font-black text-xs animate-pulse">
          🏆 80G Tax Exemption Certified
        </div>
      </div>

      {checkoutStep === 'form' && (
        <form onSubmit={handleStartCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2 font-sans">
          
          {/* Fund Details Setup Left Column */}
          <div className="lg:col-span-8 bg-black/40 border border-brand-gold/15 rounded-xl p-5 md:p-8 space-y-5">
            <div className="flex items-center gap-2 text-brand-saffron font-serif font-bold text-lg border-b border-white/5 pb-2">
              <Heart className="h-5 w-5 text-red-500 animate-pulse" />
              <span>{lang === 'EN' ? 'Configure Devout Gift' : 'देणगी पर्याय निवडा'}</span>
            </div>

            {/* Amount Presets */}
            <div className="space-y-2">
              <label className="text-xs text-gray-300 font-bold block">{lang === 'EN' ? 'Select Sacred Amount' : 'कृपाहून देणगी रक्कम निवडा'}:</label>
              <div className="grid grid-cols-5 gap-2">
                {preSets.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                      amount === amt
                        ? 'bg-brand-saffron text-brand-maroon font-black border-brand-gold scale-105 shadow'
                        : 'bg-black/30 text-white/80 border-white/5 hover:border-brand-saffron/40'
                    }`}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Entry */}
            <div className="space-y-1 text-xs">
              <label className="text-gray-300 block font-bold">{lang === 'EN' ? 'Or Enter Custom Amount (INR)' : 'किंवा हवी असलेली रक्कम लिहा'}</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-brand-gold font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  placeholder="2500"
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-8 pr-3 text-white text-sm font-bold focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            {/* Fund Selection drop */}
            <div className="space-y-1 text-xs">
              <label className="text-gray-300 block font-bold">{lang === 'EN' ? 'Direct My Contribution To' : 'देणगीचा विनियोग करण्यासाठी विशेष विभाग निवडा'}</label>
              <select
                value={fundCategory}
                onChange={(e) => setFundCategory(e.target.value)}
                className="w-full bg-brand-maroon/40 border border-brand-gold/30 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-saffron font-bold text-xs"
              >
                {funds.map((f, idx) => (
                  <option key={idx} value={f} className="bg-brand-maroon text-white">{f}</option>
                ))}
              </select>
            </div>

            {/* Donor Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-gray-300 block font-bold">{lang === 'EN' ? 'Donor Full Name *' : 'देणगीदाराचे पूर्ण नाव *'}</label>
                <input
                  type="text"
                  required
                  placeholder="Aarav Joshi..."
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 block font-bold">{lang === 'EN' ? 'PAN Number (Required for Tax Benefits)' : 'पॅन कार्ड नंबर (८०जी प्राप्तीसाठी आवश्यक)'}</label>
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 px-3 uppercase text-brand-gold focus:outline-none focus:border-brand-gold font-mono tracking-widest"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 block font-bold">{lang === 'EN' ? 'Mobile Number *' : 'मोबाईल नंबर *'}</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 block font-bold">{lang === 'EN' ? 'Email Address *' : 'ईमेल आयडी *'}</label>
                <input
                  type="email"
                  required
                  placeholder="aarav.joshi@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-brand-red via-brand-saffron to-brand-gold text-brand-maroon font-serif font-black py-3 rounded-xl hover:opacity-95 text-sm cursor-pointer shadow-lg outline-none"
            >
              🤝 {lang === 'EN' ? `Proceed to Donate ₹${amount.toLocaleString()}` : `देणगी स्वीकारण्यासाठी पुढे जा - ₹${amount.toLocaleString()}`}
            </button>
          </div>

          {/* Secure Trust Callout Card on Right Column */}
          <div className="lg:col-span-4 bg-gradient-to-b from-brand-maroon/40 to-black/60 border border-brand-gold/15 rounded-xl p-5 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-center gap-2 text-brand-gold font-serif font-black">
                <Printer className="h-5 w-5 text-brand-saffron animate-bounce" />
                <span>Exemption Clauses</span>
              </div>
              <p className="leading-relaxed text-gray-300">
                {lang === 'EN'
                  ? 'Shree Ishwatichi Mata Charitable Trust is registered under section 80G of the Indian Income Tax Act. Devotees receive tax deduction certificates matching 50% of the total gifted amount directly inside their email inbox when providing their PAN card numbers.'
                  : 'श्री ईश्वटीची माता चॅरिटेबल ट्रस्ट कलम ८०जी अंतर्गत सवलत पात्र आहे. पॅन कार्ड नंबर अचूक भरल्यास वर्षाला ५०% टक्के सवलत प्राप्ती कर कायद्यानुसार दिली जाईल.'}
              </p>
              
              <div className="border border-brand-gold/25 p-3 rounded bg-brand-gold/5 flex gap-2">
                <ShieldAlert className="h-4 w-4 text-brand-gold shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-300">
                  {lang === 'EN' ? 'Payments are processed over SSL 256-Bit bankgrade networks. Your privacy is strongly protected.' : 'अतिसुरक्षित पेमेंट गेटवे व कूटबद्धीकरण प्रणालीचा वापर.'}
                </p>
              </div>
            </div>

            <div className="border-t border-brand-gold/15 pt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-brand-saffron font-bold">
                <Award className="h-4 w-4 text-brand-gold" />
                <span>Streak Booster Awarded</span>
              </div>
              <p className="text-[10px] text-gray-400">
                {lang === 'EN' ? 'Any generous gift triggers local milestones and boosts streak attributes on user dashboard!' : 'तुम्ही दिलेल्या देणगीमुळे सामाजिक प्रभाव दाखवला जाईल आणि तुमच्या प्रोफाइलमध्ये दातृत्व पदक जोडले जाईल.'}
              </p>
            </div>
          </div>

        </form>
      )}

      {/* SECURE MOCK PAYMENTS ENGINE MODAL WITH UPI SCANNERS & CREDIT CARDS */}
      {checkoutStep === 'checkout' && (
        <div className="max-w-xl mx-auto rounded-xl border-2 border-brand-gold bg-black p-6 space-y-6 font-sans">
          
          <div className="text-center space-y-1">
            <h3 className="text-lg font-serif font-black text-white">Secure Divine Exchange Portal</h3>
            <p className="text-xs text-brand-saffron font-bold">Amount: ₹ {amount.toLocaleString()}</p>
          </div>

          {/* Payment Methods tabs select */}
          <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-4 text-xs font-semibold">
            <button
              onClick={() => setPaymentMethod('upi')}
              className={`py-2 rounded flex flex-col items-center cursor-pointer border ${paymentMethod === 'upi' ? 'bg-brand-gold/10 text-brand-gold border-brand-gold' : 'text-gray-400 border-transparent'}`}
            >
              <QrCode className="h-5 w-5 mb-1" />
              <span>UPI / QR</span>
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`py-2 rounded flex flex-col items-center cursor-pointer border ${paymentMethod === 'card' ? 'bg-brand-gold/10 text-brand-gold border-brand-gold' : 'text-gray-400 border-transparent'}`}
            >
              <CreditCard className="h-5 w-5 mb-1" />
              <span>Cards / Net</span>
            </button>
            <button
              onClick={() => setPaymentMethod('netbank')}
              className={`py-2 rounded flex flex-col items-center cursor-pointer border ${paymentMethod === 'netbank' ? 'bg-brand-gold/10 text-brand-gold border-brand-gold' : 'text-gray-400 border-transparent'}`}
            >
              <FileText className="h-5 w-5 mb-1" />
              <span>Net Banking</span>
            </button>
          </div>

          {/* Payment method specific layout */}
          {paymentMethod === 'upi' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-2">
              <div className="bg-white p-3 rounded-lg border-2 border-brand-gold shadow-lg relative">
                {/* Simulated QR Code for temple UPI ID */}
                <div className="h-36 w-36 bg-zinc-200 border border-gray-400 flex flex-col items-center justify-center p-2 text-center select-none">
                  <div className="grid grid-cols-6 gap-1 h-full w-full">
                    {/* Generates a neat mockup QR block visual pattern */}
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className={`rounded-sm ${(i % 2 === 0 && i % 3 === 0) || i < 6 || i % 7 === 0 ? 'bg-black' : 'bg-white'}`} />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-brand-maroon text-brand-gold border border-brand-gold text-[7px] font-bold px-1 rounded shadow uppercase">
                      Mata UPI
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-mono font-medium text-brand-saffron">UPI ID: ishwatichi.mata@paytm</p>
                <p className="text-[10px] text-gray-400">
                  {lang === 'EN' ? 'Open Google Pay, PhonePe, Paytm, or BHIM UPI app on your phone and scan the code.' : 'मोबाईलमधील कोणतेही पेमेंट ॲप ने हा क्यूआर कोड स्कॅन करा.'}
                </p>
              </div>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 block font-bold">16-Digit Card Number</label>
                <input
                  type="text"
                  maxLength={19}
                  placeholder="4111 2222 3333 4444"
                  value={cardNo}
                  onChange={(e) => setCardNo(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-gold font-mono text-sm tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 block font-bold">Expiry Date</label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-gold font-mono text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 block font-bold">CVV Security Code</label>
                  <input
                    type="password"
                    maxLength={3}
                    placeholder="***"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-gold font-mono text-center tracking-widest"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'netbank' && (
            <div className="space-y-2 text-xs">
              <label className="text-gray-300 block font-bold">Select Reputable Indian Bank</label>
              <select className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-gold font-bold">
                <option value="sbi">State Bank of India (SBI)</option>
                <option value="hdfc">HDFC Bank Secure Portal</option>
                <option value="icici">ICICI Corporate & Retail Bank</option>
                <option value="axis">Axis bank Direct checkout</option>
                <option value="boi">Bank of India (BOI)</option>
              </select>
            </div>
          )}

          {/* Guidelines info */}
          <div className="bg-yellow-950/20 border border-yellow-700/30 p-3 rounded-lg text-[11px] leading-relaxed text-yellow-200">
            * This checkout uses high fidelity simulation mode. No authentic currency will be debited. Proceed for testing and receipt generation.
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCheckoutStep('form')}
              className="flex-1 bg-white/10 hover:bg-white/15 py-3 rounded-lg text-xs font-bold font-serif cursor-pointer"
            >
              Cancel Setup
            </button>
            <button
              onClick={handleConfirmPayment}
              className="flex-1 bg-brand-gold text-brand-maroon hover:opacity-95 py-3 rounded-lg text-xs font-black font-serif cursor-pointer shadow"
            >
              Confirm Simulated Payment
            </button>
          </div>
        </div>
      )}

      {/* FULL EXQUISITE CERTIFIED TAX RECEIPT OUTPUT WITH PRINT LAYOUT */}
      {checkoutStep === 'receipt' && generatedReceipt && (
        <div className="max-w-2xl mx-auto space-y-6 font-sans">
          
          {/* Main Visual Altar Receipt */}
          <div id="printable-receipt-card" className="bg-white text-gray-900 border-8 border-double border-brand-gold rounded-2xl p-5 sm:p-10 shadow-2xl relative select-none">
            
            {/* Background design accents */}
            <div className="absolute inset-0 bg-[radial-gradient(#eed299_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
            <div className="absolute top-2 left-2 right-2 bottom-2 border border-brand-gold/15 pointer-events-none" />

            {/* Receipt Header logo */}
            <div className="text-center space-y-2 relative border-b-2 border-brand-gold/60 pb-5">
              <SiteLogo variant="transparent" size="sm" className="mx-auto mb-2" />
              <span className="text-brand-red font-serif font-black text-xl sm:text-2xl tracking-wide uppercase block">
                {lang === 'EN' ? 'Shree Ishwatichi Mata Charitable Devasthan Trust' : 'श्री ईश्वटीची माता चॅरिटेबल देवस्थान ट्रस्ट'}
              </span>
              <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase block">
                Govt Regd No: E-50125/MUMBAI • Section 80G Approval No: SEC80G/5482/2026
              </span>
              <span className="bg-brand-red text-white text-[10px] font-bold font-serif uppercase tracking-widest py-0.5 px-4 rounded-full inline-block border border-brand-gold">
                OFFICIAL SACRED GIFT RECEIPT
              </span>
            </div>

            {/* Receipt details columns */}
            <div className="py-6 space-y-4 text-xs font-sans">
              <div className="flex justify-between items-center text-gray-500 pb-2 border-b border-gray-100 font-mono">
                <span>Receipt Number: <strong>{generatedReceipt.id}</strong></span>
                <span>Date: <strong>{generatedReceipt.date}</strong></span>
              </div>

              <div className="space-y-2.5">
                <p className="leading-relaxed">
                  Earnestly Received with prayerful gratitude from Devotee 
                  <strong className="text-brand-maroon underline decoration-brand-gold decoration-2 ml-1 text-sm">{generatedReceipt.donorName}</strong>
                </p>
                
                <p className="leading-relaxed">
                  The sum of Rupees <strong className="text-lg text-brand-red">₹{generatedReceipt.amount.toLocaleString()}</strong> (INR) via secured payment exchange method: 
                  <strong className="bg-brand-gold/15 text-brand-maroon px-2 py-0.5 rounded font-mono font-bold uppercase ml-1">{generatedReceipt.paymentMethod}</strong>
                </p>

                <p className="leading-relaxed text-gray-700">
                  Directing this devotional gift with pristine pure focus towards: 
                  <strong className="text-gray-900 font-bold ml-1">"{generatedReceipt.category}"</strong>
                </p>

                {generatedReceipt.pan && (
                  <p className="bg-brand-gold/5 p-3 rounded border border-brand-gold/25 text-[11px] text-gray-700">
                    🔍 <strong>PAN Number recorded:</strong> <span className="font-mono uppercase font-bold text-brand-red tracking-wider">{generatedReceipt.pan}</span>
                    <br />
                    Complies fully under section 80G as a valid deduction resource. Your tax summary reporting is safely registered to the Indian ITD gateway.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-400 uppercase block">Simulated UTR Reference</span>
                  <span className="font-mono text-[10px] font-bold text-gray-700 select-all truncate block">{generatedReceipt.utr}</span>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[9px] text-gray-400 uppercase block">Authorized Signatory</span>
                  <span className="font-serif text-[11px] font-bold italic text-brand-maroon block">S. D. Deshmukh (Trustee Head)</span>
                  <span className="text-[8px] text-gray-500 font-mono block">50th Gold Jubilee Executive Court</span>
                </div>
              </div>
            </div>

            {/* Receipt Footer boundary */}
            <div className="border-t-2 border-dashed border-gray-300 pt-4 text-center text-[10px] text-gray-400 leading-relaxed font-mono uppercase">
              "Blessings be upon your household from Shree Ishwatichi Mata (श्री ईश्वटीची)"
            </div>

          </div>

          {/* Actions toolbar */}
          <div className="flex gap-2">
            <button
              onClick={() => setCheckoutStep('form')}
              className="flex-1 bg-white/10 hover:bg-white/15 px-4 py-3 rounded-lg text-xs font-bold font-serif cursor-pointer"
            >
              ← Convert Another Gift
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 bg-brand-gold text-brand-maroon hover:opacity-95 px-4 py-3 rounded-lg text-xs font-black font-serif cursor-pointer shadow flex items-center justify-center gap-2"
            >
              <Printer className="h-4 w-4" />
              <span>Print Tax Exemption PDF / 80G</span>
            </button>
          </div>

        </div>
      )}

    </section>
  );
};
