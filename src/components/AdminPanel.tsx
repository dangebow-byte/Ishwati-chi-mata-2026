/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Eye, CheckCircle, XCircle, Trash2, ShieldCheck, Download, PlusCircle, BarChart3, Users, Flame, Sparkles } from 'lucide-react';
import { DevoteeExperience, DigitalSevaBooking, DonationRecord, Announcement } from '../types';

interface AdminPanelProps {
  lang: 'EN' | 'MR';
  experiences: DevoteeExperience[];
  onApproveExperience: (id: string, approve: boolean) => void;
  bookings: DigitalSevaBooking[];
  onDeleteBooking: (id: string) => void;
  donations: DonationRecord[];
  onAddAnnouncement: (ann: Announcement) => void;
  siteContent?: any;
  onSaveSiteContent?: (key: string, data: any) => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  lang,
  experiences,
  onApproveExperience,
  bookings,
  onDeleteBooking,
  donations,
  onAddAnnouncement,
  siteContent,
  onSaveSiteContent
}) => {
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'approvals' | 'bookings' | 'reports' | 'announcements' | 'cms'>('approvals');

  // Welcome Hero CMS states
  const [welcomeTitleEN, setWelcomeTitleEN] = useState(siteContent?.welcome?.titleEN ?? '');
  const [welcomeTitleMR, setWelcomeTitleMR] = useState(siteContent?.welcome?.titleMR ?? '');
  const [welcomeSubEN, setWelcomeSubEN] = useState(siteContent?.welcome?.subtitleEN ?? '');
  const [welcomeSubMR, setWelcomeSubMR] = useState(siteContent?.welcome?.subtitleMR ?? '');
  const [welcomeDescEN, setWelcomeDescEN] = useState(siteContent?.welcome?.descEN ?? '');
  const [welcomeDescMR, setWelcomeDescMR] = useState(siteContent?.welcome?.descMR ?? '');

  // About CMS states
  const [aboutHeaderEN, setAboutHeaderEN] = useState(siteContent?.about?.headerDescEN ?? '');
  const [aboutHeaderMR, setAboutHeaderMR] = useState(siteContent?.about?.headerDescMR ?? '');
  const [aboutOriginTitleEN, setAboutOriginTitleEN] = useState(siteContent?.about?.originTitleEN ?? '');
  const [aboutOriginTitleMR, setAboutOriginTitleMR] = useState(siteContent?.about?.originTitleMR ?? '');
  const [aboutOriginTextEN, setAboutOriginTextEN] = useState(siteContent?.about?.originTextEN ?? '');
  const [aboutOriginTextMR, setAboutOriginTextMR] = useState(siteContent?.about?.originTextMR ?? '');
  
  const [aboutQuoteEN, setAboutQuoteEN] = useState(siteContent?.about?.quoteEN ?? '');
  const [aboutQuoteMR, setAboutQuoteMR] = useState(siteContent?.about?.quoteMR ?? '');

  // Contact CMS states
  const [contactAddrEN, setContactAddrEN] = useState(siteContent?.contact?.addressEN ?? '');
  const [contactAddrMR, setContactAddrMR] = useState(siteContent?.contact?.addressMR ?? '');
  const [contactPhone, setContactPhone] = useState(siteContent?.contact?.phone ?? '');
  const [contactEmail, setContactEmail] = useState(siteContent?.contact?.email ?? '');

  // Synchronize state when external siteContent finishes loading asynchronously
  React.useEffect(() => {
    if (siteContent) {
      if (siteContent.welcome) {
        setWelcomeTitleEN(siteContent.welcome.titleEN || '');
        setWelcomeTitleMR(siteContent.welcome.titleMR || '');
        setWelcomeSubEN(siteContent.welcome.subtitleEN || '');
        setWelcomeSubMR(siteContent.welcome.subtitleMR || '');
        setWelcomeDescEN(siteContent.welcome.descEN || '');
        setWelcomeDescMR(siteContent.welcome.descMR || '');
      }
      if (siteContent.about) {
        setAboutHeaderEN(siteContent.about.headerDescEN || '');
        setAboutHeaderMR(siteContent.about.headerDescMR || '');
        setAboutOriginTitleEN(siteContent.about.originTitleEN || '');
        setAboutOriginTitleMR(siteContent.about.originTitleMR || '');
        setAboutOriginTextEN(siteContent.about.originTextEN || '');
        setAboutOriginTextMR(siteContent.about.originTextMR || '');
        setAboutQuoteEN(siteContent.about.quoteEN || '');
        setAboutQuoteMR(siteContent.about.quoteMR || '');
      }
      if (siteContent.contact) {
        setContactAddrEN(siteContent.contact.addressEN || '');
        setContactAddrMR(siteContent.contact.addressMR || '');
        setContactPhone(siteContent.contact.phone || '');
        setContactEmail(siteContent.contact.email || '');
      }
    }
  }, [siteContent]);

  // Announcement input states
  const [annTitle, setAnnTitle] = useState('');
  const [annTitleMR, setAnnTitleMR] = useState('');
  const [annCategory, setAnnCategory] = useState<'Notice' | 'Festival' | 'Press' | 'Event'>('Notice');
  const [annContent, setAnnContent] = useState('');
  const [annContentMR, setAnnContentMR] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
      setUnlocked(true);
    } else {
      alert(lang === 'EN' ? 'Incorrect pin. Hint: Use 1234 for testing purposes.' : 'चुकीचा पिन क्रमांक. संकेत: चाचणीसाठी १२३४ वापरा.');
      setPin('');
    }
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    const newAnn: Announcement = {
      id: 'ANN-' + Math.floor(100 + Math.random() * 900),
      title: annTitle,
      titleMarathi: annTitleMR || annTitle,
      category: annCategory,
      content: annContent,
      contentMarathi: annContentMR || annContent,
      date: new Date().toISOString().split('T')[0]
    };

    onAddAnnouncement(newAnn);
    alert(lang === 'EN' ? 'Announcement published successfully!' : 'घोषणा यशस्वीरित्या मुख्य पानावर प्रकाशित झाली!');
    setAnnTitle('');
    setAnnTitleMR('');
    setAnnContent('');
    setAnnContentMR('');
  };

  // Calculations for Reports
  const totalDonationsSum = donations.reduce((acc, d) => acc + d.amount, 0);

  // Group by category for a gorgeous SVG Bar Chart
  const categoriesMap = donations.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoriesMap).map(([name, val]) => ({
    name,
    amount: Number(val)
  }));

  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto bg-gradient-to-b from-brand-maroon/60 to-black p-6 md:p-8 rounded-xl border border-brand-gold/35 text-center space-y-6 font-sans shadow-2xl">
        <Lock className="h-12 w-12 text-brand-gold mx-auto animate-pulse" />
        <div className="space-y-1">
          <h3 className="text-xl font-serif font-black text-white">Administrator Secure Station</h3>
          <p className="text-xs text-gray-400">
            {lang === 'EN' ? 'Enter the security PIN to access the Temple Control Center.' : 'मुख्य नियंत्रण कक्षेमध्ये प्रवेश मिळवण्यासाठी संकेत पासवर्ड टाका.'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3 text-xs">
          <input
            type="password"
            maxLength={6}
            placeholder="Passcode PIN (Hint: 1234)"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full bg-black/60 border border-brand-gold/25 rounded-lg py-2.5 px-3 text-center text-brand-gold text-lg tracking-widest font-mono font-bold focus:outline-none focus:border-brand-saffron"
          />
          <button
            type="submit"
            className="w-full py-2.5 bg-brand-gold text-brand-maroon font-serif font-bold text-xs rounded-lg hover:opacity-95 cursor-pointer shadow"
          >
            Authorize Access
          </button>
        </form>

        <p className="text-[10px] text-gray-500 italic leading-snug">
          * Authorized only for Shree Ishwatichi Mata Mandal Trustee Officers. Input <strong>1234</strong> to review database updates.
        </p>
      </div>
    );
  }

  return (
    <section className="bg-brand-maroon/20 rounded-2xl border border-brand-gold/15 p-6 md:p-8 text-white backdrop-blur-sm shadow-xl space-y-8 animate-fade-in font-sans">
      
      {/* Admin header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="text-brand-gold text-xs font-mono font-bold uppercase tracking-wider block">
            ⚙️ Control panel
          </span>
          <h2 className="text-2xl font-serif font-black text-white">
            Temple Board Executive Desk
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage registrations, approve devotee experiences, publish active notices, and audit donation analytics.
          </p>
        </div>

        {/* Lock button */}
        <button
          onClick={() => setUnlocked(false)}
          className="text-xs text-red-400 hover:underline cursor-pointer border border-red-500/25 px-2.5 py-1 rounded bg-red-950/20"
        >
          🔐 Terminate Session
        </button>
      </div>

      {/* Admin Tabs Menu */}
      <div className="flex items-center gap-2 text-xs font-bold border-b border-white/5 pb-4 overflow-x-auto scrollbar-none w-full">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-3 py-1.5 rounded transition-all cursor-pointer whitespace-nowrap shrink-0 ${activeTab === 'approvals' ? 'bg-brand-gold text-brand-maroon' : 'text-gray-400 hover:text-white'}`}
        >
          Devotee Experiences Review ({experiences.filter(x => !x.approved).length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-3 py-1.5 rounded transition-all cursor-pointer whitespace-nowrap shrink-0 ${activeTab === 'bookings' ? 'bg-brand-gold text-brand-maroon' : 'text-gray-400 hover:text-white'}`}
        >
          Seva & Volunteer Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3 py-1.5 rounded transition-all cursor-pointer whitespace-nowrap shrink-0 ${activeTab === 'reports' ? 'bg-brand-gold text-brand-maroon' : 'text-gray-400 hover:text-white'}`}
        >
          Analytical Donation Reports
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-3 py-1.5 rounded transition-all cursor-pointer whitespace-nowrap shrink-0 ${activeTab === 'announcements' ? 'bg-brand-gold text-brand-maroon' : 'text-gray-400 hover:text-white'}`}
        >
          Publish Holy Notices
        </button>
        <button
          onClick={() => setActiveTab('cms')}
          className={`px-3 py-1.5 rounded transition-all cursor-pointer whitespace-nowrap shrink-0 ${activeTab === 'cms' ? 'bg-brand-gold text-brand-maroon' : 'text-gray-400 hover:text-white'}`}
        >
          ✍️ Manage Website CMS
        </button>
      </div>

      {/* Approvals tab */}
      {activeTab === 'approvals' && (
        <div className="space-y-4 text-xs font-sans">
          <div className="flex justify-between items-center text-gray-400 border-b border-white/5 pb-1 text-xs">
            <span>Pending Devotee Testimonies</span>
            <span>These remain invisible to public domains until approved here.</span>
          </div>

          <div className="space-y-3">
            {experiences.filter(x => !x.approved).map(exp => (
              <div key={exp.id} className="bg-black/40 border border-brand-gold/15 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1 w-full sm:w-3/4">
                  <div className="flex items-center gap-2">
                    <strong className="text-white uppercase uppercase text-xs">{exp.name}</strong>
                    <span className="text-[10px] text-brand-saffron italic">{exp.location} • {exp.date}</span>
                  </div>
                  <p className="text-gray-300 italic">"{exp.story}"</p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => onApproveExperience(exp.id, false)}
                    className="p-1.5 rounded bg-red-950/40 text-red-400 hover:bg-red-900/40 border border-red-500/20 cursor-pointer"
                    title="Reject and delete story"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onApproveExperience(exp.id, true)}
                    className="p-1.5 rounded bg-green-950/40 text-green-400 hover:bg-green-900/40 border border-green-500/20 cursor-pointer flex items-center gap-1 font-bold text-[10px]"
                    title="Approve and publish"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve Story</span>
                  </button>
                </div>
              </div>
            ))}

            {experiences.filter(x => !x.approved).length === 0 && (
              <div className="py-12 text-center text-gray-500">
                ⭐ No pending devotee stories require review. Submit stories in the "Devotee Experiences" tab!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookings tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-4 text-xs font-sans">
          <div className="flex justify-between items-center text-gray-400 border-b border-white/5 pb-1">
            <span>Active Pooja, Aarti & Volunteer Applications</span>
            <span>Database Table logs</span>
          </div>

          {/* Mobile Card List for Small Screens */}
          <div className="md:hidden space-y-2.5">
            {bookings.map(book => (
              <div key={book.id} className="bg-black/50 border border-white/10 rounded-xl p-3 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-brand-gold">{book.id}</span>
                  <span className="font-mono text-brand-saffron">{book.date}</span>
                </div>
                <div className="text-white font-bold text-xs">{book.devoteeName}</div>
                <div className="text-gray-300 text-[11px] truncate">{book.subType}</div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1.5 border-t border-white/5">
                  <span>{book.phone} {book.gotra ? `• ${book.gotra}` : ''}</span>
                  <button onClick={() => onDeleteBooking(book.id)} className="text-red-400 hover:text-red-300 p-1 cursor-pointer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="py-8 text-center text-gray-500">No bookings recorded yet.</div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto pb-2">
            <table className="w-full min-w-[640px] text-left text-xs text-gray-300 divide-y divide-white/10">
              <thead className="text-[10px] uppercase font-mono tracking-wider text-brand-gold">
                <tr>
                  <th className="py-2.5 px-2">ID</th>
                  <th className="py-2.5 px-2">Type</th>
                  <th className="py-2.5 px-2">Subtype</th>
                  <th className="py-2.5 px-2">Devotee Name</th>
                  <th className="py-2.5 px-2">Gotra</th>
                  <th className="py-2.5 px-2">Phone</th>
                  <th className="py-2.5 px-2">Target Date</th>
                  <th className="py-2.5 px-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.map(book => (
                  <tr key={book.id} className="hover:bg-white/5">
                    <td className="py-2 px-2 font-mono font-bold text-brand-gold">{book.id}</td>
                    <td className="py-2 px-2 uppercase font-mono text-[10px]">{book.type}</td>
                    <td className="py-2 px-2 text-white truncate max-w-[150px]" title={book.subType}>{book.subType}</td>
                    <td className="py-2 px-2 text-white font-bold">{book.devoteeName}</td>
                    <td className="py-2 px-2 italic text-gray-400">{book.gotra}</td>
                    <td className="py-2 px-2 font-mono">{book.phone}</td>
                    <td className="py-2 px-2 font-mono text-brand-saffron">{book.date}</td>
                    <td className="py-2 px-2">
                      <button
                        onClick={() => onDeleteBooking(book.id)}
                        className="p-1 hover:text-red-400 cursor-pointer"
                        title="Delete application"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      No bookings recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports tab with SVG bar charts */}
      {activeTab === 'reports' && (
        <div className="space-y-6 text-xs font-sans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/45 p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] text-gray-400 block uppercase font-mono">Simulated Audit Pool</span>
              <span className="text-2xl font-mono font-black text-brand-gold tracking-tight">₹ {totalDonationsSum.toLocaleString()}</span>
              <span className="text-[10px] text-brand-saffron block mt-1 font-semibold">Total Funds Deposited</span>
            </div>
            <div className="bg-black/45 p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] text-gray-400 block uppercase font-mono">Seva Slots Pool</span>
              <span className="text-2xl font-mono font-black text-white tracking-tight">{bookings.filter(x => x.type !== 'volunteer').length} Slots</span>
              <span className="text-[10px] text-green-400 block mt-1 font-semibold">Ritual Bookings Verified</span>
            </div>
            <div className="bg-black/45 p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] text-gray-400 block uppercase font-mono">Volunteer Roster</span>
              <span className="text-2xl font-mono font-black text-white tracking-tight">{bookings.filter(x => x.type === 'volunteer').length} Active</span>
              <span className="text-[10px] text-emerald-400 block mt-1 font-semibold">Selfless Seva Applicants</span>
            </div>
          </div>

          {/* SVG Bar Chart representing donation values across categorised groups */}
          <div className="bg-black/40 border border-brand-gold/15 rounded-xl p-5 md:p-6 space-y-4">
            <h3 className="text-sm font-serif font-bold text-white tracking-wide">
              📊 Funds Distribution Allocation Chart
            </h3>

            {chartData.length > 0 ? (
              <div className="space-y-4 font-sans text-xs">
                {chartData.map((bar, idx) => {
                  const percentage = totalDonationsSum > 0 ? (bar.amount / totalDonationsSum) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between font-semibold text-[11px]">
                        <span className="text-gray-300 truncate max-w-xs">{bar.name}</span>
                        <span className="text-brand-gold font-mono">₹{bar.amount.toLocaleString()} ({Math.round(percentage)}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-red via-brand-saffron to-brand-gold rounded-full transition-all duration-1000"
                          style={{ width: `${Math.max(5, percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                Please register a sample gift in the "Donate Now" tab to compile chart distributions!
              </div>
            )}
          </div>

          {/* Transaction logs */}
          <div className="space-y-2">
            <span className="text-xs text-gray-400 uppercase tracking-widest font-mono">Recent Sacrificial Log Ledger</span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-[10px] text-gray-300 pr-1 divide-y divide-white/5">
              {donations.map(don => (
                <div key={don.id} className="flex justify-between py-2 items-center">
                  <div>
                    <strong className="text-white font-sans">{don.donorName}</strong>
                    <span className="text-gray-500 block text-[9px]">{don.category} • Method: {don.paymentMethod}</span>
                  </div>
                  <strong className="text-brand-gold">₹{don.amount.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Publish Announcements tab */}
      {activeTab === 'announcements' && (
        <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs max-w-xl bg-black/45 border border-white/5 p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-1.5 text-xs text-brand-gold font-serif font-bold uppercase pb-1 border-b border-white/5">
            <PlusCircle className="h-4 w-4" />
            <span>Produce Fresh Notice Circular</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 text-left">
              <label className="text-gray-300 block font-bold">Notice Title (EN) *</label>
              <input
                type="text"
                required
                value={annTitle}
                onChange={e => setAnnTitle(e.target.value)}
                placeholder="VIP entry routes update..."
                className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-gold"
              />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-gray-300 block font-bold">Notice Title (MR)</label>
              <input
                type="text"
                value={annTitleMR}
                onChange={e => setAnnTitleMR(e.target.value)}
                placeholder="व्हीआयपी पास प्रवेश सूचना..."
                className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-gold"
              />
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-gray-300 block font-bold">Circular Category *</label>
            <select
              value={annCategory}
              onChange={e => setAnnCategory(e.target.value as any)}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-gold font-bold font-serif"
            >
              <option value="Notice">Notice</option>
              <option value="Festival">Festival Update</option>
              <option value="Press">Press Release</option>
              <option value="Event">Event Announcement</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 text-left">
              <label className="text-gray-300 block font-bold">Notice Body (EN) *</label>
              <textarea
                required
                rows={3}
                value={annContent}
                onChange={e => setAnnContent(e.target.value)}
                placeholder="The temple board decided that..."
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold outline-none"
              />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-gray-300 block font-bold">Notice Body (MR)</label>
              <textarea
                rows={3}
                value={annContentMR}
                onChange={e => setAnnContentMR(e.target.value)}
                placeholder="मंडळाने घेतलेल्या निर्णयानुसार..."
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-gold text-brand-maroon font-serif font-bold py-2.5 rounded-lg hover:opacity-90 cursor-pointer shadow text-xs"
          >
            Publish New Announcement Circular
          </button>
        </form>
      )}

      {/* CMS editor tab */}
      {activeTab === 'cms' && onSaveSiteContent && (
        <div className="space-y-8 text-xs font-sans">
          <div className="flex justify-between items-center text-gray-400 border-b border-white/5 pb-1">
            <span>Website CMS Management (All fields sync instantly with Firestore)</span>
            <span>Update homepage banner headings, historical narratives, contact information and emails.</span>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* 1. HERO BANNERS CARD */}
            <div className="bg-black/40 border border-brand-gold/15 p-6 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-brand-gold border-b border-white/5 pb-2">
                <span className="text-xl">📺</span>
                <h3 className="text-sm font-serif font-bold uppercase tracking-wider">Configure Hero Welcome Area</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-300 block font-bold">Main Title Banner (EN)</label>
                  <input
                    type="text"
                    value={welcomeTitleEN}
                    onChange={e => setWelcomeTitleEN(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-300 block font-bold">Main Title Banner (MR)</label>
                  <input
                    type="text"
                    value={welcomeTitleMR}
                    onChange={e => setWelcomeTitleMR(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-300 block font-bold">Subtitle Slogan (EN)</label>
                  <input
                    type="text"
                    value={welcomeSubEN}
                    onChange={e => setWelcomeSubEN(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-300 block font-bold">Subtitle Slogan (MR)</label>
                  <input
                    type="text"
                    value={welcomeSubMR}
                    onChange={e => setWelcomeSubMR(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-300 block font-bold">Description Introduction (EN)</label>
                  <textarea
                    rows={2}
                    value={welcomeDescEN}
                    onChange={e => setWelcomeDescEN(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold outline-none"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-300 block font-bold">Description Introduction (MR)</label>
                  <textarea
                    rows={2}
                    value={welcomeDescMR}
                    onChange={e => setWelcomeDescMR(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => onSaveSiteContent('welcome', {
                    titleEN: welcomeTitleEN,
                    titleMR: welcomeTitleMR,
                    subtitleEN: welcomeSubEN,
                    subtitleMR: welcomeSubMR,
                    descEN: welcomeDescEN,
                    descMR: welcomeDescMR
                  })}
                  className="px-6 py-2 bg-brand-gold hover:opacity-95 text-brand-maroon font-serif font-black rounded-lg cursor-pointer flex items-center gap-1.5 shadow"
                >
                  Save Welcome Hero CMS Changes
                </button>
              </div>
            </div>

            {/* 2. HISTORY / ABOUT CONTENT CARD */}
            <div className="bg-black/40 border border-brand-gold/15 p-6 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-brand-gold border-b border-white/5 pb-2">
                <span className="text-xl">📖</span>
                <h3 className="text-sm font-serif font-bold uppercase tracking-wider">Configure About & Historical Narrative</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-300 block font-bold">About Top Intro (EN)</label>
                  <textarea
                    rows={2}
                    value={aboutHeaderEN}
                    onChange={e => setAboutHeaderEN(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold outline-none"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-300 block font-bold">About Top Intro (MR)</label>
                  <textarea
                    rows={2}
                    value={aboutHeaderMR}
                    onChange={e => setAboutHeaderMR(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-300 block font-bold">Detailed Altar Origin Narrative (EN)</label>
                  <textarea
                    rows={4}
                    value={aboutOriginTextEN}
                    onChange={e => setAboutOriginTextEN(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold outline-none"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-300 block font-bold">Detailed Altar Origin Narrative (MR)</label>
                  <textarea
                    rows={4}
                    value={aboutOriginTextMR}
                    onChange={e => setAboutOriginTextMR(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-300 block font-bold">Editorial Inspired Quote (EN)</label>
                  <input
                    type="text"
                    value={aboutQuoteEN}
                    onChange={e => setAboutQuoteEN(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-300 block font-bold">Editorial Inspired Quote (MR)</label>
                  <input
                    type="text"
                    value={aboutQuoteMR}
                    onChange={e => setAboutQuoteMR(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => onSaveSiteContent('about', {
                    headerDescEN: aboutHeaderEN,
                    headerDescMR: aboutHeaderMR,
                    originTitleEN: aboutOriginTitleEN || siteContent?.about?.originTitleEN || 'The Goddess & Origin',
                    originTitleMR: aboutOriginTitleMR || siteContent?.about?.originTitleMR || 'देवीची उत्पत्ती व आख्यायिका',
                    originTextEN: aboutOriginTextEN,
                    originTextMR: aboutOriginTextMR,
                    quoteEN: aboutQuoteEN,
                    quoteMR: aboutQuoteMR,
                    missionTitleEN: siteContent?.about?.missionTitleEN || 'Mandal Mission & Community Vision',
                    missionTitleMR: siteContent?.about?.missionTitleMR || 'मंडळाचा संकल्प आणि उद्दिष्टे',
                    mission1_titleEN: siteContent?.about?.mission1_titleEN || 'Preserve Spiritual Architecture',
                    mission1_titleMR: siteContent?.about?.mission1_titleMR || 'भक्ती संस्कारांचे संवर्धन',
                    mission1_descEN: siteContent?.about?.mission1_descEN || 'Ensuring thousands of devotees secure safe daily darshan, keeping temple clean, dry, and pure.',
                    mission1_descMR: siteContent?.about?.mission1_descMR || 'परंपरा आणि संस्कृती पिढ्यानपिढ्या जपणूक करून नवीन तंत्रज्ञानाद्वारे जागतिक पातळीवर पोहचवणे.',
                    mission2_titleEN: siteContent?.about?.mission2_titleEN || 'Serve Humanity (Seva)',
                    mission2_titleMR: siteContent?.about?.mission2_titleMR || 'अखंड मानव सेवा (अन्न आणि औषध वाटप)',
                    mission2_descEN: siteContent?.about?.mission2_descEN || 'Transforming devotional offerings directly into food distribution programs, free healthcare clinics, and tribal education centers.',
                    mission2_descMR: siteContent?.about?.mission2_descMR || 'भक्तांच्या देणगीचा योग्य विनियोग करून दररोज मोफत भोजन आणि गरीब रुग्णांना मोफत उपचार.',
                    mission3_titleEN: siteContent?.about?.mission3_titleEN || 'Eco-Commitment & Welfare',
                    mission3_titleMR: siteContent?.about?.mission3_titleMR || 'शाश्वत पर्यावरण संकल्प',
                    mission3_descEN: siteContent?.about?.mission3_descEN || 'Pledging 100% plastic-free festivals and organizing local sapling distribution drives.',
                    mission3_descMR: siteContent?.about?.mission3_descMR || 'उत्सवात शंभर टक्के कचराविहीन व्यवस्था आणि वृक्षारोपण मोहिमेला गती देणे.'
                  })}
                  className="px-6 py-2 bg-brand-gold hover:opacity-95 text-brand-maroon font-serif font-black rounded-lg cursor-pointer flex items-center gap-1.5 shadow"
                >
                  Save Historical Content CMS Changes
                </button>
              </div>
            </div>

            {/* 3. CONTACT COORDINATES CARD */}
            <div className="bg-black/40 border border-brand-gold/15 p-6 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-brand-gold border-b border-white/5 pb-2">
                <span className="text-xl">📍</span>
                <h3 className="text-sm font-serif font-bold uppercase tracking-wider">Configure Office Addresses, Hotlines & Emails</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-300 block font-bold">Detailed Center Address (EN)</label>
                  <textarea
                    rows={2}
                    value={contactAddrEN}
                    onChange={e => setContactAddrEN(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold outline-none"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-300 block font-bold">Detailed Center Address (MR)</label>
                  <textarea
                    rows={2}
                    value={contactAddrMR}
                    onChange={e => setContactAddrMR(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-300 block font-bold">Help Desk Mobile Hotline</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-gray-300 block font-bold">Mandal Board Email Coordinates</label>
                  <input
                    type="text"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => onSaveSiteContent('contact', {
                    addressEN: contactAddrEN,
                    addressMR: contactAddrMR,
                    phone: contactPhone,
                    email: contactEmail,
                    hoursEN: siteContent?.contact?.hoursEN || '05:00 AM - 10:00 PM Daily',
                    hoursMR: siteContent?.contact?.hoursMR || 'दररोज सकाळी ०५:०० ते रात्री १०:००'
                  })}
                  className="px-6 py-2 bg-brand-gold hover:opacity-95 text-brand-maroon font-serif font-black rounded-lg cursor-pointer flex items-center gap-1.5 shadow"
                >
                  Save Office Contact Details CMS Changes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
