/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Lock, Eye, CheckCircle, XCircle, Trash2, ShieldCheck, Download, PlusCircle, 
  BarChart3, Users, Flame, Sparkles, LogOut, Disc, Volume2, VolumeX, Play, 
  Pause, Edit2, Music, Radio, Plus, RotateCcw, RefreshCw, Upload, HardDrive, 
  Globe, Check, AlertCircle, FileAudio, X, Loader2
} from 'lucide-react';
import { DevoteeExperience, DigitalSevaBooking, DonationRecord, Announcement } from '../types';
import { 
  SoundboardItem, 
  subscribeSoundboardItems, 
  addSoundboardItem, 
  updateSoundboardItem, 
  deleteSoundboardItem, 
  toggleSoundboardItemActive 
} from '../services/soundboardService';
import { templeSoundboardEngine } from '../utils/templeSoundboardEngine';
import { uploadMediaToCloudStorage } from '../services/cloudMediaStorage';
import { formatFileSize } from '../services/localMediaStorage';

interface AdminPanelProps {
  lang: 'EN' | 'MR';
  isAdminUser: boolean;
  signedInEmail: string | null;
  authMessage: string | null;
  onAdminLogin: () => void;
  onAdminLogout?: () => void;
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
  isAdminUser,
  signedInEmail,
  authMessage,
  onAdminLogin,
  onAdminLogout,
  experiences,
  onApproveExperience,
  bookings,
  onDeleteBooking,
  donations,
  onAddAnnouncement,
  siteContent,
  onSaveSiteContent
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'bookings' | 'reports' | 'announcements' | 'cms' | 'soundboard'>('approvals');

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

  // Soundboard (पवित्र ध्वनी) CRUD Management states
  const [soundboardItems, setSoundboardItems] = useState<SoundboardItem[]>([]);
  const [isSoundboardLoading, setIsSoundboardLoading] = useState(true);
  const [isSoundboardFormOpen, setIsSoundboardFormOpen] = useState(false);
  const [editingSoundboardItem, setEditingSoundboardItem] = useState<SoundboardItem | null>(null);
  const [isSoundboardSubmitting, setIsSoundboardSubmitting] = useState(false);
  const [soundboardSubmitError, setSoundboardSubmitError] = useState<string | null>(null);
  const [previewChantId, setPreviewChantId] = useState<string | null>(null);

  // Form input fields for Soundboard
  const [sbNameMR, setSbNameMR] = useState('');
  const [sbNameEN, setSbNameEN] = useState('');
  const [sbChantTextMR, setSbChantTextMR] = useState('');
  const [sbChantTextEN, setSbChantTextEN] = useState('');
  const [sbCategory, setSbCategory] = useState<'mantra' | 'stuti' | 'instrument' | 'aarti'>('mantra');
  const [sbFrequencyHz, setSbFrequencyHz] = useState<number>(136.1);
  const [sbAudioUrl, setSbAudioUrl] = useState('');
  const [sbDescriptionMR, setSbDescriptionMR] = useState('');
  const [sbDescriptionEN, setSbDescriptionEN] = useState('');
  const [sbDisplayOrder, setSbDisplayOrder] = useState<number>(1);
  const [sbIsActive, setSbIsActive] = useState<boolean>(true);

  // Audio source mode and device upload states
  const [sbAudioSource, setSbAudioSource] = useState<'upload' | 'url' | 'synthesizer'>('upload');
  const [sbSelectedAudioFile, setSbSelectedAudioFile] = useState<File | null>(null);
  const [sbAudioFileName, setSbAudioFileName] = useState('');
  const [sbAudioFileSize, setSbAudioFileSize] = useState<number | null>(null);
  const [sbAudioUploadProgress, setSbAudioUploadProgress] = useState<number>(0);
  const [isSbAudioUploading, setIsSbAudioUploading] = useState<boolean>(false);
  const [sbStoragePath, setSbStoragePath] = useState('');
  const [sbAudioBlobPreviewUrl, setSbAudioBlobPreviewUrl] = useState<string | null>(null);
  const sbAudioInputRef = useRef<HTMLInputElement | null>(null);

  // Subscribe to real-time Soundboard items
  React.useEffect(() => {
    const unsub = subscribeSoundboardItems(
      (items) => {
        setSoundboardItems(items);
        setIsSoundboardLoading(false);
      },
      (err) => {
        console.warn('Soundboard items fetch error:', err);
        setIsSoundboardLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const resetSoundboardForm = () => {
    setSbNameMR('');
    setSbNameEN('');
    setSbChantTextMR('');
    setSbChantTextEN('');
    setSbCategory('mantra');
    setSbFrequencyHz(136.1);
    setSbAudioUrl('');
    setSbAudioSource('upload');
    setSbSelectedAudioFile(null);
    setSbAudioFileName('');
    setSbAudioFileSize(null);
    setSbAudioUploadProgress(0);
    setSbStoragePath('');
    if (sbAudioBlobPreviewUrl) {
      try {
        URL.revokeObjectURL(sbAudioBlobPreviewUrl);
      } catch {}
    }
    setSbAudioBlobPreviewUrl(null);
    setIsSbAudioUploading(false);
    if (sbAudioInputRef.current) {
      sbAudioInputRef.current.value = '';
    }
    setSbDescriptionMR('');
    setSbDescriptionEN('');
    setSbDisplayOrder(soundboardItems.length + 1);
    setSbIsActive(true);
    setEditingSoundboardItem(null);
    setSoundboardSubmitError(null);
  };

  const [isAudioDragging, setIsAudioDragging] = useState(false);

  const processAudioFile = (file: File) => {
    if (!file) return;

    const allowedExtensions = ['mp3', 'wav', 'm4a', 'ogg', 'aac', 'weba'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!file.type.startsWith('audio/') && !allowedExtensions.includes(ext)) {
      setSoundboardSubmitError(
        lang === 'EN'
          ? 'Unsupported file type. Please select an audio file (MP3, WAV, M4A, OGG, AAC).'
          : 'असमर्थित फाईल प्रकार. कृपया ऑडिओ फाईल (MP3, WAV, M4A, OGG, AAC) निवडा.'
      );
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setSoundboardSubmitError(
        lang === 'EN'
          ? 'Audio file is too large. Maximum size allowed is 50 MB.'
          : 'ऑडिओ फाईल खूप मोठी आहे. कमाल आकार ५० MB पर्यंत असावा.'
      );
      return;
    }

    if (sbAudioBlobPreviewUrl) {
      try {
        URL.revokeObjectURL(sbAudioBlobPreviewUrl);
      } catch {}
    }

    const previewUrl = URL.createObjectURL(file);
    setSbSelectedAudioFile(file);
    setSbAudioBlobPreviewUrl(previewUrl);
    setSbAudioFileName(file.name);
    setSbAudioFileSize(file.size);
    setSbAudioSource('upload');
    setSoundboardSubmitError(null);
  };

  const handleSelectAudioFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAudioFile(file);
    }
  };

  const handleAudioDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsAudioDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAudioFile(file);
    }
  };

  const handleClearAudioFile = () => {
    if (sbAudioBlobPreviewUrl) {
      try {
        URL.revokeObjectURL(sbAudioBlobPreviewUrl);
      } catch {}
    }
    setSbSelectedAudioFile(null);
    setSbAudioBlobPreviewUrl(null);
    setSbAudioFileName('');
    setSbAudioFileSize(null);
    setSbAudioUrl('');
    setSbStoragePath('');
    if (sbAudioInputRef.current) {
      sbAudioInputRef.current.value = '';
    }
  };

  const handleOpenAddSoundboard = () => {
    resetSoundboardForm();
    setSbAudioSource('upload'); // Explicitly start with device upload
    setIsSoundboardFormOpen(true);
  };

  const handleOpenEditSoundboard = (item: SoundboardItem, openDeviceUploadDirectly: boolean = false) => {
    setEditingSoundboardItem(item);
    setSbNameMR(item.nameMR);
    setSbNameEN(item.nameEN);
    setSbChantTextMR(item.chantTextMR);
    setSbChantTextEN(item.chantTextEN || '');
    setSbCategory(item.category || 'mantra');
    setSbFrequencyHz(item.frequencyHz || 136.1);
    setSbAudioUrl(item.audioUrl || '');
    setSbStoragePath(item.storagePath || '');
    setSbAudioFileName(item.audioFileName || '');
    setSbAudioFileSize(item.audioFileSize || null);
    setSbSelectedAudioFile(null);
    setSbAudioUploadProgress(0);
    if (sbAudioBlobPreviewUrl) {
      try {
        URL.revokeObjectURL(sbAudioBlobPreviewUrl);
      } catch {}
    }
    setSbAudioBlobPreviewUrl(null);

    // Default to 'upload' source mode so device audio upload is immediately available and clearly visible
    if (openDeviceUploadDirectly || item.storagePath || item.audioFileName || !item.audioUrl) {
      setSbAudioSource('upload');
    } else {
      setSbAudioSource('url');
    }

    setSbDescriptionMR(item.descriptionMR || '');
    setSbDescriptionEN(item.descriptionEN || '');
    setSbDisplayOrder(item.displayOrder ?? 1);
    setSbIsActive(item.isActive !== false);
    setSoundboardSubmitError(null);
    setIsSoundboardFormOpen(true);

    if (openDeviceUploadDirectly) {
      setTimeout(() => {
        sbAudioInputRef.current?.click();
      }, 150);
    }
  };

  const handleSaveSoundboardItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sbNameMR.trim() || !sbNameEN.trim() || !sbChantTextMR.trim()) {
      setSoundboardSubmitError(lang === 'EN' ? 'Please fill in Name (Marathi & English) and Chanting text.' : 'कृपया मराठी व इंग्रजी नाव आणि मंत्राचे बोल भरावे.');
      return;
    }

    setIsSoundboardSubmitting(true);
    setSoundboardSubmitError(null);

    try {
      let finalAudioUrl = sbAudioUrl.trim();
      let finalStoragePath = sbStoragePath;
      let finalFileName = sbAudioFileName;
      let finalFileSize = sbAudioFileSize;

      // Handle Device File Upload if selected
      if (sbAudioSource === 'upload') {
        if (sbSelectedAudioFile) {
          setIsSbAudioUploading(true);
          setSbAudioUploadProgress(5);
          try {
            const uploadResult = await uploadMediaToCloudStorage(
              sbSelectedAudioFile,
              'soundboard_audio',
              (progress) => {
                setSbAudioUploadProgress(progress);
              }
            );
            finalAudioUrl = uploadResult.url;
            finalStoragePath = uploadResult.storagePath;
            finalFileName = uploadResult.name;
            finalFileSize = uploadResult.size;
          } catch (uploadErr: any) {
            console.error('Audio upload to Cloud Storage error:', uploadErr);
            throw new Error(
              lang === 'EN'
                ? `Failed to upload audio file: ${uploadErr?.message || 'Storage error'}`
                : `ऑडिओ फाईल अपलोड करताना त्रुटी आली: ${uploadErr?.message || 'स्टोरेज त्रुटी'}`
            );
          } finally {
            setIsSbAudioUploading(false);
          }
        } else if (!finalAudioUrl && !editingSoundboardItem?.audioUrl) {
          // Prompt admin if no audio file was chosen and no existing audio exists
          setSoundboardSubmitError(
            lang === 'EN'
              ? 'Please select an audio file to upload from your device, or switch to Live Synthesizer.'
              : 'कृपया तुमच्या डिव्हाइसवरून ऑडिओ फाईल निवडा किंवा "वैदिक सिंथेसायझर" पर्याय निवडा.'
          );
          setIsSoundboardSubmitting(false);
          return;
        }
      } else if (sbAudioSource === 'synthesizer') {
        finalAudioUrl = '';
        finalStoragePath = '';
        finalFileName = '';
        finalFileSize = 0;
      }

      if (editingSoundboardItem) {
        await updateSoundboardItem(editingSoundboardItem.id, {
          nameMR: sbNameMR.trim(),
          nameEN: sbNameEN.trim(),
          chantTextMR: sbChantTextMR.trim(),
          chantTextEN: sbChantTextEN.trim(),
          category: sbCategory,
          frequencyHz: Number(sbFrequencyHz) || 136.1,
          audioUrl: finalAudioUrl,
          storagePath: finalStoragePath,
          audioFileName: finalFileName,
          audioFileSize: finalFileSize || 0,
          descriptionMR: sbDescriptionMR.trim(),
          descriptionEN: sbDescriptionEN.trim(),
          displayOrder: Number(sbDisplayOrder) || 1,
          isActive: sbIsActive
        });
        alert(lang === 'EN' ? 'Sacred soundboard item updated successfully!' : 'पवित्र ध्वनी यशस्वीरित्या अद्ययावत झाला!');
      } else {
        await addSoundboardItem({
          nameMR: sbNameMR.trim(),
          nameEN: sbNameEN.trim(),
          chantTextMR: sbChantTextMR.trim(),
          chantTextEN: sbChantTextEN.trim(),
          category: sbCategory,
          frequencyHz: Number(sbFrequencyHz) || 136.1,
          audioUrl: finalAudioUrl,
          storagePath: finalStoragePath,
          audioFileName: finalFileName,
          audioFileSize: finalFileSize || 0,
          descriptionMR: sbDescriptionMR.trim(),
          descriptionEN: sbDescriptionEN.trim(),
          displayOrder: Number(sbDisplayOrder) || soundboardItems.length + 1,
          isActive: sbIsActive
        });
        alert(lang === 'EN' ? 'New sacred soundboard item added successfully!' : 'नवीन पवित्र ध्वनी यशस्वीरित्या समाविष्ट झाला!');
      }
      setIsSoundboardFormOpen(false);
      resetSoundboardForm();
    } catch (err: any) {
      console.error('Save soundboard error:', err);
      setSoundboardSubmitError(err?.message || (lang === 'EN' ? 'Failed to save soundboard item.' : 'पवित्र ध्वनी सेव्ह करताना त्रुटी आली.'));
    } finally {
      setIsSoundboardSubmitting(false);
      setIsSbAudioUploading(false);
    }
  };

  const handleDeleteSoundboardItem = async (id: string, name: string) => {
    const confirmPrompt = lang === 'EN'
      ? `Are you sure you want to delete the sacred sound "${name}"?`
      : `आपण खात्रीने "${name}" हा पवित्र ध्वनी हटवू इच्छिता?`;
    if (!window.confirm(confirmPrompt)) return;

    try {
      if (previewChantId === id) {
        templeSoundboardEngine.stopMantraChant();
        setPreviewChantId(null);
      }
      await deleteSoundboardItem(id);
      alert(lang === 'EN' ? 'Soundboard item deleted successfully.' : 'पवित्र ध्वनी यशस्वीरित्या हटवण्यात आला.');
    } catch (err: any) {
      console.error('Delete soundboard error:', err);
      alert(err?.message || (lang === 'EN' ? 'Failed to delete soundboard item.' : 'पवित्र ध्वनी हटवताना त्रुटी आली.'));
    }
  };

  const handleToggleSoundboardActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleSoundboardItemActive(id, currentStatus);
    } catch (err) {
      console.error('Toggle active error:', err);
    }
  };

  const handleTestPreviewSound = (item: SoundboardItem) => {
    if (previewChantId === item.id) {
      templeSoundboardEngine.stopMantraChant();
      setPreviewChantId(null);
    } else {
      templeSoundboardEngine.startMantraChant(item.id);
      setPreviewChantId(item.id);
    }
  };

  // Announcement input states
  const [annTitle, setAnnTitle] = useState('');
  const [annTitleMR, setAnnTitleMR] = useState('');
  const [annCategory, setAnnCategory] = useState<'Notice' | 'Festival' | 'Press' | 'Event'>('Notice');
  const [annContent, setAnnContent] = useState('');
  const [annContentMR, setAnnContentMR] = useState('');

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

  if (!isAdminUser) {
    return (
      <div className="max-w-md mx-auto bg-gradient-to-b from-brand-maroon/60 to-black p-6 md:p-8 rounded-xl border border-brand-gold/35 text-center space-y-6 font-sans shadow-2xl">
        <Lock className="h-12 w-12 text-brand-gold mx-auto animate-pulse" />
        <div className="space-y-1">
          <h3 className="text-xl font-sans font-black text-white">Administrator Secure Station</h3>
          <p className="text-xs text-gray-400">
            {lang === 'EN' ? 'Sign in with the authorized, verified Google account to manage site data.' : 'वेबसाइट माहिती व्यवस्थापित करण्यासाठी अधिकृत आणि सत्यापित Google खात्याने साइन इन करा.'}
          </p>
        </div>
        {signedInEmail && (
          <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/30 space-y-2">
            <p className="text-xs text-amber-300">
              {lang === 'EN'
                ? `Signed in as ${signedInEmail}. Only dangebow@gmail.com has administrator access.`
                : `साइन इन केलेले खाते: ${signedInEmail}. केवळ dangebow@gmail.com कडे प्रशासकीय अधिकार आहेत.`}
            </p>
            {onAdminLogout && (
              <button
                type="button"
                onClick={onAdminLogout}
                className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow"
              >
                <LogOut className="h-3.5 w-3.5 text-red-300" />
                <span>{lang === 'EN' ? 'Sign Out / Switch Account' : 'बाहेर पडा / दुसरे खाते वापरा'}</span>
              </button>
            )}
          </div>
        )}
        {authMessage && <p role="alert" className="text-xs text-red-300">{authMessage}</p>}
        <button
          type="button"
          onClick={onAdminLogin}
          className="w-full py-2.5 bg-brand-gold text-brand-maroon font-sans font-bold text-xs rounded-lg hover:opacity-95 cursor-pointer shadow"
        >
          Sign in with authorized Google account
        </button>
        <p className="text-[10px] text-gray-500 italic leading-snug">
          * Access is enforced by Firebase for the verified account dangebow@gmail.com. A local PIN cannot grant database access.
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
          <h2 className="text-2xl font-sans font-black text-white">
            Temple Board Executive Desk
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage registrations, approve devotee experiences, publish active notices, and audit donation analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-emerald-300 border border-emerald-500/25 px-2.5 py-1 rounded bg-emerald-950/20">
            🔐 Signed in as {signedInEmail}
          </span>
          {onAdminLogout && (
            <button
              type="button"
              onClick={onAdminLogout}
              className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-white border border-red-500/40 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow"
              title={lang === 'EN' ? 'Sign out of Admin Console' : 'अॅडमिन पॅनेलमधून बाहेर पडा'}
            >
              <LogOut className="h-3 w-3" />
              <span>{lang === 'EN' ? 'Sign Out' : 'लॉगआउट'}</span>
            </button>
          )}
        </div>
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
        <button
          onClick={() => setActiveTab('soundboard')}
          className={`px-3 py-1.5 rounded transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${activeTab === 'soundboard' ? 'bg-brand-gold text-brand-maroon font-bold' : 'text-gray-400 hover:text-white'}`}
        >
          <Disc className={`h-3.5 w-3.5 ${activeTab === 'soundboard' ? 'animate-spin text-brand-maroon' : 'text-brand-saffron'}`} />
          <span>{lang === 'EN' ? `🔔 Sacred Soundboard (${soundboardItems.length})` : `🔔 पवित्र ध्वनी व्यवस्थापन (${soundboardItems.length})`}</span>
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
            <h3 className="text-sm font-sans font-bold text-white tracking-wide">
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
          <div className="flex items-center gap-1.5 text-xs text-brand-gold font-sans font-bold uppercase pb-1 border-b border-white/5">
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
              className="w-full bg-zinc-900 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-brand-gold font-bold font-sans"
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
            className="w-full bg-brand-gold text-brand-maroon font-sans font-bold py-2.5 rounded-lg hover:opacity-90 cursor-pointer shadow text-xs"
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
                <h3 className="text-sm font-sans font-bold uppercase tracking-wider">Configure Hero Welcome Area</h3>
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
                  className="px-6 py-2 bg-brand-gold hover:opacity-95 text-brand-maroon font-sans font-black rounded-lg cursor-pointer flex items-center gap-1.5 shadow"
                >
                  Save Welcome Hero CMS Changes
                </button>
              </div>
            </div>

            {/* 2. HISTORY / ABOUT CONTENT CARD */}
            <div className="bg-black/40 border border-brand-gold/15 p-6 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-brand-gold border-b border-white/5 pb-2">
                <span className="text-xl">📖</span>
                <h3 className="text-sm font-sans font-bold uppercase tracking-wider">Configure About & Historical Narrative</h3>
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
                  className="px-6 py-2 bg-brand-gold hover:opacity-95 text-brand-maroon font-sans font-black rounded-lg cursor-pointer flex items-center gap-1.5 shadow"
                >
                  Save Historical Content CMS Changes
                </button>
              </div>
            </div>

            {/* 3. CONTACT COORDINATES CARD */}
            <div className="bg-black/40 border border-brand-gold/15 p-6 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-brand-gold border-b border-white/5 pb-2">
                <span className="text-xl">📍</span>
                <h3 className="text-sm font-sans font-bold uppercase tracking-wider">Configure Office Addresses, Hotlines & Emails</h3>
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
                  className="px-6 py-2 bg-brand-gold hover:opacity-95 text-brand-maroon font-sans font-black rounded-lg cursor-pointer flex items-center gap-1.5 shadow"
                >
                  Save Office Contact Details CMS Changes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Sacred Soundboard (पवित्र ध्वनी) Management Tab */}
      {activeTab === 'soundboard' && (
        <div className="space-y-6 text-xs font-sans">
          {/* Soundboard Header & CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Disc className="h-5 w-5 text-brand-gold animate-spin" />
                <h3 className="text-lg font-bold text-white font-sans">
                  {lang === 'EN' ? 'Sacred Soundboard (पवित्र ध्वनी) Management' : 'पवित्र ध्वनी व वैदिक मंत्र व्यवस्थापन'}
                </h3>
              </div>
              <p className="text-gray-400 mt-1 max-w-2xl text-[11px] leading-relaxed">
                {lang === 'EN'
                  ? 'Manage Vedic mantras, conch shell sounds, stutis, and sacred audio loops played in the 24/7 Live Darshan soundboard. Add custom chants or modify frequencies.'
                  : 'थेट दर्शन दालनात भक्तांना ऐकू येणारे पवित्र मंत्र, शंखनाद, स्तवन व स्वरांचे व्यवस्थापन करा. नवीन मंत्र जोडा, संपादित करा किंवा चाचणी घ्या.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddSoundboard}
              className="px-4 py-2 bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-sans font-black rounded-xl hover:opacity-95 transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>{lang === 'EN' ? 'Add New Sacred Sound' : 'नवीन पवित्र ध्वनी जोडा'}</span>
            </button>
          </div>

          {/* Quick Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-black/50 border border-brand-gold/25 rounded-xl p-3">
              <span className="text-[10px] text-gray-400 uppercase font-mono block">
                {lang === 'EN' ? 'Total Sounds' : 'एकूण ध्वनी'}
              </span>
              <span className="text-xl font-bold font-sans text-brand-gold mt-0.5 block">
                {soundboardItems.length}
              </span>
            </div>
            <div className="bg-black/50 border border-emerald-500/25 rounded-xl p-3">
              <span className="text-[10px] text-gray-400 uppercase font-mono block">
                {lang === 'EN' ? 'Active Chants' : 'सक्रिय मंत्र'}
              </span>
              <span className="text-xl font-bold font-sans text-emerald-400 mt-0.5 block">
                {soundboardItems.filter(i => i.isActive !== false).length}
              </span>
            </div>
            <div className="bg-black/50 border border-amber-500/25 rounded-xl p-3">
              <span className="text-[10px] text-gray-400 uppercase font-mono block">
                {lang === 'EN' ? 'Vedic Mantras' : 'वैदिक मंत्र'}
              </span>
              <span className="text-xl font-bold font-sans text-amber-300 mt-0.5 block">
                {soundboardItems.filter(i => (i.category || 'mantra') === 'mantra').length}
              </span>
            </div>
            <div className="bg-black/50 border border-purple-500/25 rounded-xl p-3">
              <span className="text-[10px] text-gray-400 uppercase font-mono block">
                {lang === 'EN' ? 'Stuti & Aarti' : 'स्तोत्र व आरत्या'}
              </span>
              <span className="text-xl font-bold font-sans text-purple-300 mt-0.5 block">
                {soundboardItems.filter(i => i.category === 'stuti' || i.category === 'aarti').length}
              </span>
            </div>
          </div>

          {/* Add / Edit Modal Form */}
          {isSoundboardFormOpen && (
            <div className="bg-zinc-950/95 border-2 border-brand-gold/40 rounded-2xl p-5 md:p-6 shadow-2xl backdrop-blur-md space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Disc className="h-5 w-5 text-brand-gold" />
                  <h4 className="text-base font-bold text-white font-sans">
                    {editingSoundboardItem
                      ? (lang === 'EN' ? `Edit Sacred Sound: ${editingSoundboardItem.nameEN}` : `पवित्र ध्वनी संपादन: ${editingSoundboardItem.nameMR}`)
                      : (lang === 'EN' ? 'Add New Sacred Sound to Soundboard' : 'साउंडबोर्डमध्ये नवीन पवित्र ध्वनी समाविष्ट करा')}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsSoundboardFormOpen(false); resetSoundboardForm(); }}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 text-xs font-bold cursor-pointer"
                >
                  ✕ {lang === 'EN' ? 'Close' : 'बंद करा'}
                </button>
              </div>

              {soundboardSubmitError && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
                  ⚠️ {soundboardSubmitError}
                </div>
              )}

              <form onSubmit={handleSaveSoundboardItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-gray-300 font-bold block text-xs">
                      {lang === 'EN' ? 'Sacred Title (Marathi / देवनागरी) *' : 'पवित्र शीर्षक (मराठी) *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. श्री इश्वटीची माता महामंत्र"
                      value={sbNameMR}
                      onChange={e => setSbNameMR(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-gray-300 font-bold block text-xs">
                      {lang === 'EN' ? 'Sacred Title (English) *' : 'पवित्र शीर्षक (इंग्रजी) *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ishwati Mata Mahamantra"
                      value={sbNameEN}
                      onChange={e => setSbNameEN(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-gray-300 font-bold block text-xs">
                      {lang === 'EN' ? 'Chanting Verse / Lyrics (Devanagari) *' : 'पवित्र मंत्र / स्तवन बोल (देवनागरी) *'}
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="उदा. ॥ ॐ श्री इश्वटीची माता प्रसन्न ॥"
                      value={sbChantTextMR}
                      onChange={e => setSbChantTextMR(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-brand-gold font-sans font-bold focus:outline-none focus:border-brand-gold text-sm"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-gray-300 font-bold block text-xs">
                      {lang === 'EN' ? 'Chanting Phonetics / Meaning (English)' : 'इंग्रजी उच्चार / अर्थ'}
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Om Shree Ishwatichi Mata Prasanna"
                      value={sbChantTextEN}
                      onChange={e => setSbChantTextEN(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-gray-300 font-bold block text-xs">
                      {lang === 'EN' ? 'Category' : 'श्रेणी'}
                    </label>
                    <select
                      value={sbCategory}
                      onChange={e => setSbCategory(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold cursor-pointer"
                    >
                      <option value="mantra">{lang === 'EN' ? 'Vedic Mantra' : 'वैदिक मंत्र'}</option>
                      <option value="stuti">{lang === 'EN' ? 'Devi Stuti / Shloka' : 'देवी स्तुती / श्लोक'}</option>
                      <option value="instrument">{lang === 'EN' ? 'Temple Instrument' : 'मंदिरातील वाद्य / शंखनाद'}</option>
                      <option value="aarti">{lang === 'EN' ? 'Holy Aarti' : 'पवित्र आरती'}</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-gray-300 font-bold block text-xs">
                      {lang === 'EN' ? 'Tanpura Drone Frequency (Hz)' : 'तानपुरा फ्रिक्वेन्सी (Hz)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="50"
                      max="1000"
                      value={sbFrequencyHz}
                      onChange={e => setSbFrequencyHz(parseFloat(e.target.value) || 136.1)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold font-mono"
                    />
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSbFrequencyHz(136.1)}
                        className="text-[9px] bg-zinc-800 hover:bg-zinc-700 px-1.5 py-0.5 rounded text-brand-gold cursor-pointer"
                      >
                        136.1Hz (OM)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSbFrequencyHz(144.0)}
                        className="text-[9px] bg-zinc-800 hover:bg-zinc-700 px-1.5 py-0.5 rounded text-brand-gold cursor-pointer"
                      >
                        144Hz (Gayatri)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSbFrequencyHz(153.3)}
                        className="text-[9px] bg-zinc-800 hover:bg-zinc-700 px-1.5 py-0.5 rounded text-brand-gold cursor-pointer"
                      >
                        153.3Hz (Devi)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSbFrequencyHz(432.0)}
                        className="text-[9px] bg-zinc-800 hover:bg-zinc-700 px-1.5 py-0.5 rounded text-brand-gold cursor-pointer"
                      >
                        432Hz (Shankh)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-gray-300 font-bold block text-xs">
                      {lang === 'EN' ? 'Display Sequence Order' : 'प्रदर्शन क्रम'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={sbDisplayOrder}
                      onChange={e => setSbDisplayOrder(parseInt(e.target.value) || 1)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold font-mono"
                    />
                  </div>
                </div>

                {/* Sacred Audio Source Section: Device File Upload, Web Audio URL, or Live Synthesizer */}
                <div className="space-y-4 bg-zinc-900/90 p-4 md:p-5 rounded-2xl border-2 border-brand-gold/40 text-left shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                        <Music className="h-4 w-4" />
                      </div>
                      <div>
                        <label className="text-brand-gold font-bold text-sm block">
                          {lang === 'EN' ? 'Sacred Audio Source & Chanting Voice' : 'पवित्र ऑडिओ स्रोत व जप ध्वनी'}
                        </label>
                        <span className="text-[11px] text-gray-400 block">
                          {lang === 'EN'
                            ? 'Upload a real recording from device or choose synthesizer'
                            : 'तुमच्या डिव्हाइसवरील ऑडिओ रेकॉर्डिंग अपलोड करा किंवा थेट सिंथेसायझर वापरा'}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full font-bold border border-brand-gold/40 bg-black/60 text-brand-gold self-start sm:self-auto">
                      {sbAudioSource === 'upload' 
                        ? (lang === 'EN' ? '📁 Device File Upload' : '📁 डिव्हाइस ऑडिओ फाईल') 
                        : sbAudioSource === 'url' 
                        ? (lang === 'EN' ? '🌐 Web Audio URL' : '🌐 वेब ऑडिओ लिंक') 
                        : (lang === 'EN' ? '🎵 Vedic Synthesizer' : '🎵 वैदिक सिंथेसायझर')}
                    </span>
                  </div>

                  {/* Prominent Source Mode Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSbAudioSource('upload')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 text-center shadow-sm ${
                        sbAudioSource === 'upload'
                          ? 'bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-black border-brand-gold ring-2 ring-brand-gold/50 scale-[1.02]'
                          : 'bg-black/60 text-gray-300 border-white/15 hover:border-brand-gold/50 hover:text-white'
                      }`}
                    >
                      <HardDrive className="h-4 w-4 shrink-0" />
                      <span>{lang === 'EN' ? 'Upload from Device' : 'डिव्हाइसवरून ऑडिओ अपलोड'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSbAudioSource('url')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 text-center shadow-sm ${
                        sbAudioSource === 'url'
                          ? 'bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-black border-brand-gold ring-2 ring-brand-gold/50 scale-[1.02]'
                          : 'bg-black/60 text-gray-300 border-white/15 hover:border-brand-gold/50 hover:text-white'
                      }`}
                    >
                      <Globe className="h-4 w-4 shrink-0" />
                      <span>{lang === 'EN' ? 'Web Audio URL' : 'वेब ऑडिओ लिंक (URL)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSbAudioSource('synthesizer');
                        setSbSelectedAudioFile(null);
                        setSbAudioBlobPreviewUrl(null);
                        setSbAudioUrl('');
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 text-center shadow-sm ${
                        sbAudioSource === 'synthesizer'
                          ? 'bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-black border-brand-gold ring-2 ring-brand-gold/50 scale-[1.02]'
                          : 'bg-black/60 text-gray-300 border-white/15 hover:border-brand-gold/50 hover:text-white'
                      }`}
                    >
                      <Radio className="h-4 w-4 shrink-0" />
                      <span>{lang === 'EN' ? 'Vedic Synthesizer' : 'वैदिक सिंथेसायझर'}</span>
                    </button>
                  </div>

                  {/* Mode 1: Device File Upload */}
                  {sbAudioSource === 'upload' && (
                    <div className="space-y-3 pt-1">
                      <input
                        type="file"
                        ref={sbAudioInputRef}
                        onChange={handleSelectAudioFile}
                        accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac,.weba"
                        className="hidden"
                      />

                      {/* Prominent Upload Dropzone */}
                      <div
                        onClick={() => sbAudioInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsAudioDragging(true); }}
                        onDragLeave={() => setIsAudioDragging(false)}
                        onDrop={handleAudioDrop}
                        className={`border-2 border-dashed rounded-2xl p-5 md:p-6 text-center cursor-pointer transition-all ${
                          isAudioDragging
                            ? 'border-brand-gold bg-brand-gold/15 scale-[1.01]'
                            : 'border-brand-gold/50 hover:border-brand-gold bg-black/70 hover:bg-black/90'
                        } group space-y-3 shadow-inner`}
                      >
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-brand-gold/25 to-brand-saffron/20 text-brand-gold flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-md border border-brand-gold/30">
                          <Upload className="h-7 w-7" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-bold text-white group-hover:text-brand-gold transition-colors block">
                            {lang === 'EN' ? 'Click to select audio file from your device' : 'तुमच्या डिव्हाइसवरून ऑडिओ फाईल निवडण्यासाठी येथे क्लिक करा'}
                          </span>
                          <p className="text-xs text-gray-300 font-sans">
                            {lang === 'EN'
                              ? 'Or drag and drop audio file here (MP3, WAV, M4A, AAC, OGG)'
                              : 'किंवा ऑडिओ फाईल येथे ड्रॅग आणि ड्रॉप करा (MP3, WAV, M4A, AAC, OGG)'}
                          </p>
                          <span className="inline-block text-[10px] font-mono text-brand-gold bg-zinc-900 px-2.5 py-0.5 rounded-full border border-brand-gold/30 mt-1">
                            {lang === 'EN' ? 'Maximum size: 50 MB' : 'कमाल आकार: ५० MB'}
                          </span>
                        </div>
                      </div>

                      {/* Selected File & Live HTML5 Audio Player Preview */}
                      {(sbAudioBlobPreviewUrl || sbAudioUrl || sbSelectedAudioFile || sbAudioFileName) && (
                        <div className="p-4 bg-black/80 rounded-2xl border-2 border-brand-gold/40 space-y-3 shadow-lg">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-9 w-9 rounded-xl bg-brand-gold/20 flex items-center justify-center text-brand-gold shrink-0 border border-brand-gold/30">
                                <FileAudio className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white truncate block">
                                    {sbAudioFileName || (editingSoundboardItem?.audioFileName) || (sbSelectedAudioFile?.name) || 'Sacred Audio File'}
                                  </span>
                                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {sbAudioFileSize !== null && (
                                    <span className="text-[10px] text-brand-gold font-mono">
                                      {formatFileSize(sbAudioFileSize)}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-emerald-400 font-medium">
                                    ✓ {lang === 'EN' ? 'Ready for playback' : 'चाचणीसाठी तयार'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => sbAudioInputRef.current?.click()}
                                className="text-brand-gold hover:text-white text-xs px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-brand-gold/30 cursor-pointer flex items-center gap-1 transition-colors"
                              >
                                <RefreshCw className="h-3 w-3" />
                                <span>{lang === 'EN' ? 'Change' : 'बदला'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleClearAudioFile}
                                className="text-red-400 hover:text-red-300 text-xs px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-950 border border-red-500/30 cursor-pointer flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>{lang === 'EN' ? 'Remove' : 'काढा'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Instant In-Browser Audio Player for Audio Verification */}
                          <div className="pt-1">
                            <span className="text-[10px] text-gray-400 font-sans block mb-1">
                              {lang === 'EN' ? 'Preview Audio Playback:' : 'ऑडिओ ऐकून खात्री करा:'}
                            </span>
                            <audio
                              controls
                              src={sbAudioBlobPreviewUrl || sbAudioUrl}
                              className="w-full h-9 rounded-lg border border-white/10"
                            >
                              Your browser does not support audio playback.
                            </audio>
                          </div>

                          {/* Upload Progress Bar if uploading */}
                          {isSbAudioUploading && (
                            <div className="space-y-1.5 pt-2 border-t border-white/10">
                              <div className="flex justify-between text-[11px] text-brand-gold font-mono">
                                <span className="flex items-center gap-1.5">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  <span>{lang === 'EN' ? 'Uploading audio to Cloud Storage...' : 'क्लाउड स्टोरेजवर ऑडिओ सुरक्षित अपलोड होत आहे...'}</span>
                                </span>
                                <span>{sbAudioUploadProgress}%</span>
                              </div>
                              <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden border border-white/10">
                                <div
                                  className="bg-gradient-to-r from-brand-gold via-amber-400 to-brand-saffron h-full transition-all duration-200"
                                  style={{ width: `${sbAudioUploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mode 2: Web Audio URL */}
                  {sbAudioSource === 'url' && (
                    <div className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-300 font-bold block">
                          {lang === 'EN' ? 'Direct Audio Stream / MP3 URL' : 'थेट ऑडिओ URL लिंक (MP3 / WAV)'}
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/sacred_mantra.mp3"
                          value={sbAudioUrl}
                          onChange={e => setSbAudioUrl(e.target.value)}
                          className="w-full bg-black/70 border border-brand-gold/40 rounded-xl p-2.5 text-white focus:outline-none focus:border-brand-gold text-xs font-mono"
                        />
                      </div>
                      {sbAudioUrl && (
                        <div className="p-3 bg-black/60 rounded-xl border border-white/10 space-y-1">
                          <span className="text-[10px] text-gray-400 block">{lang === 'EN' ? 'Test Stream Playback:' : 'चाचणी ऑडिओ:'}</span>
                          <audio controls src={sbAudioUrl} className="w-full h-8 rounded">
                            Your browser does not support audio playback.
                          </audio>
                        </div>
                      )}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setSbAudioSource('upload')}
                          className="text-[11px] text-brand-gold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <HardDrive className="h-3 w-3" />
                          <span>{lang === 'EN' ? 'Switch to upload from device instead' : 'किंवा डिव्हाइसवरून ऑडिओ फाईल अपलोड करा'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode 3: Live Vedic Synthesizer */}
                  {sbAudioSource === 'synthesizer' && (
                    <div className="p-4 bg-black/60 rounded-xl border border-white/15 text-xs text-gray-300 space-y-2">
                      <div className="flex items-center gap-2 text-brand-gold font-bold">
                        <Sparkles className="h-4 w-4" />
                        <span>{lang === 'EN' ? 'Real-Time Pure Tone Synthesizer' : 'थेट तानपुरा व ओंकार स्वर संश्लेषण'}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        {lang === 'EN'
                          ? `Will generate authentic Tanpura drone and resonant vocal formant chants continuously at ${sbFrequencyHz}Hz.`
                          : `कोणतीही ऑडिओ फाईल आवश्यक नाही. प्रणाली आपोआप ${sbFrequencyHz}Hz फ्रिक्वेन्सीवर तानपुरा व वैदिक स्वरांचा अखंड जप निर्माण करेल.`}
                      </p>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">
                          {lang === 'EN' ? 'Want to use an original temple recording?' : 'मंदिरातील मूळ ऑडिओ रेकॉर्डिंग जोडायचे आहे?'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSbAudioSource('upload');
                            setTimeout(() => sbAudioInputRef.current?.click(), 100);
                          }}
                          className="px-2.5 py-1 bg-brand-gold/20 hover:bg-brand-gold/30 text-brand-gold rounded-lg text-xs font-bold transition-colors border border-brand-gold/40 flex items-center gap-1 cursor-pointer"
                        >
                          <Upload className="h-3 w-3" />
                          <span>{lang === 'EN' ? 'Upload Audio from Device' : 'डिव्हाइसवरून ऑडिओ अपलोड करा'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-gray-300 font-bold block text-xs">
                      {lang === 'EN' ? 'Spiritual Significance / Description (MR)' : 'आध्यात्मिक महत्त्व / वर्णन (मराठी)'}
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. कुलस्वामिनी श्री इश्वटीची मातेचा आशीर्वाद देणारा पावन मंत्र"
                      value={sbDescriptionMR}
                      onChange={e => setSbDescriptionMR(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-gray-300 font-bold block text-xs">
                      {lang === 'EN' ? 'Spiritual Significance / Description (EN)' : 'आध्यात्मिक महत्त्व / वर्णन (इंग्रजी)'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sacred invocation for peace and divine mother's blessings"
                      value={sbDescriptionEN}
                      onChange={e => setSbDescriptionEN(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="sb-active-toggle"
                    checked={sbIsActive}
                    onChange={e => setSbIsActive(e.target.checked)}
                    className="rounded text-brand-gold focus:ring-0 cursor-pointer h-4 w-4 bg-zinc-900 border-white/20"
                  />
                  <label htmlFor="sb-active-toggle" className="text-xs text-gray-200 cursor-pointer select-none">
                    {lang === 'EN' ? 'Active in Live Darshan Soundboard (Visible to Devotees)' : 'थेट दर्शन साउंडबोर्डमध्ये सक्रिय ठेवा (भक्तांना उपलब्ध)'}
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => { setIsSoundboardFormOpen(false); resetSoundboardForm(); }}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    {lang === 'EN' ? 'Cancel' : 'रद्द करा'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSoundboardSubmitting}
                    className="px-6 py-2 bg-gradient-to-r from-brand-gold to-brand-saffron text-brand-maroon font-sans font-black rounded-lg hover:opacity-95 transition-all cursor-pointer shadow flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSoundboardSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                    <span>
                      {editingSoundboardItem
                        ? (lang === 'EN' ? 'Save Changes' : 'बदल जतन करा')
                        : (lang === 'EN' ? 'Publish to Soundboard' : 'साउंडबोर्डमध्ये जोडा')}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Soundboard Items List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-gray-400 border-b border-white/5 pb-2">
              <span className="font-bold">
                {lang === 'EN' ? 'Current Soundboard Inventory' : 'साउंडबोर्डमधील सक्रिय व उपलब्ध ध्वनी'}
              </span>
              <span className="text-[11px] font-mono text-brand-gold">
                {soundboardItems.length} {lang === 'EN' ? 'Items Loaded' : 'मंत्र उपलब्ध'}
              </span>
            </div>

            {soundboardItems.length === 0 ? (
              <div className="p-8 text-center bg-black/40 rounded-xl border border-white/10 text-gray-400">
                <Music className="h-10 w-10 text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-bold">
                  {lang === 'EN' ? 'No soundboard items configured.' : 'कोणतेही ध्वनी उपलब्ध नाहीत.'}
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddSoundboard}
                  className="mt-3 px-4 py-2 bg-brand-gold text-brand-maroon rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{lang === 'EN' ? 'Add First Sacred Sound' : 'पहिला पवित्र ध्वनी जोडा'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {soundboardItems.map((item) => {
                  const isPreviewPlaying = previewChantId === item.id;
                  const isItemActive = item.isActive !== false;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all duration-300 space-y-3 relative overflow-hidden ${
                        isPreviewPlaying
                          ? 'bg-amber-950/60 border-brand-gold shadow-[0_0_20px_rgba(255,153,51,0.25)] ring-1 ring-brand-gold'
                          : isItemActive
                          ? 'bg-black/60 border-brand-gold/25 hover:border-brand-gold/50'
                          : 'bg-zinc-950/60 border-white/10 opacity-75'
                      }`}
                    >
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-brand-gold border border-brand-gold/30">
                            #{item.displayOrder ?? 1}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold bg-amber-950/80 text-amber-300 border border-amber-500/30">
                            {item.category || 'mantra'}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-emerald-500/30">
                            {item.frequencyHz ? `${item.frequencyHz}Hz` : 'Tanpura'}
                          </span>
                        </div>

                        {/* Active status pill */}
                        <button
                          type="button"
                          onClick={() => handleToggleSoundboardActive(item.id, isItemActive)}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                            isItemActive
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900'
                              : 'bg-zinc-800 text-gray-400 border border-zinc-700 hover:bg-zinc-700'
                          }`}
                          title={lang === 'EN' ? 'Click to toggle active status' : 'सक्रिय/निष्क्रिय स्थिती बदला'}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isItemActive ? 'bg-emerald-400 animate-ping' : 'bg-gray-500'}`} />
                          <span>{isItemActive ? (lang === 'EN' ? 'Active' : 'सक्रिय') : (lang === 'EN' ? 'Hidden' : 'अप्रकाशित')}</span>
                        </button>
                      </div>

                      {/* Sacred Titles */}
                      <div>
                        <h4 className="text-base font-black text-white font-sans">
                          {item.nameMR}
                        </h4>
                        <span className="text-xs text-gray-300 font-sans block">
                          {item.nameEN}
                        </span>
                      </div>

                      {/* Devanagari Sacred Chant Calligraphy Box */}
                      <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-brand-gold/30 text-center">
                        <p className="text-sm font-bold text-brand-gold font-sans tracking-wide">
                          {item.chantTextMR}
                        </p>
                        {item.chantTextEN && (
                          <p className="text-[11px] text-gray-300 italic font-sans mt-0.5">
                            {item.chantTextEN}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      {(item.descriptionMR || item.descriptionEN) && (
                        <p className="text-[11px] text-gray-400 font-sans leading-snug line-clamp-2">
                          {lang === 'EN' ? (item.descriptionEN || item.descriptionMR) : (item.descriptionMR || item.descriptionEN)}
                        </p>
                      )}

                      {/* Audio Track Source Badge */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {item.audioUrl ? (
                          item.audioFileName ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] shadow-sm">
                              <HardDrive className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              <span className="truncate max-w-[180px] font-sans font-bold">{item.audioFileName}</span>
                              {item.audioFileSize ? (
                                <span className="text-[10px] text-emerald-400 font-mono">
                                  ({formatFileSize(item.audioFileSize)})
                                </span>
                              ) : null}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/80 border border-sky-500/40 text-sky-300 font-mono text-[11px] shadow-sm">
                              <Globe className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                              <span className="font-sans font-bold">{lang === 'EN' ? 'Web Audio Stream' : 'वेब ऑडिओ ट्रॅक'}</span>
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-[11px] shadow-sm">
                            <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                            <span className="font-sans font-bold">
                              {lang === 'EN'
                                ? `Vedic Synthesizer (${item.frequencyHz || 136.1}Hz)`
                                : `वैदिक सिंथेसायझर (${item.frequencyHz || 136.1}Hz)`}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Card Action Controls */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 flex-wrap">
                        {/* Live Audio Test Play */}
                        <button
                          type="button"
                          onClick={() => handleTestPreviewSound(item)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow ${
                            isPreviewPlaying
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400 animate-pulse'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-brand-gold border border-brand-gold/30'
                          }`}
                          title={isPreviewPlaying ? 'Stop playback preview' : 'Listen live preview'}
                        >
                          {isPreviewPlaying ? (
                            <>
                              <Pause className="h-3.5 w-3.5 text-white" />
                              <span>{lang === 'EN' ? 'Stop Listening' : 'थांबवा'}</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5 text-brand-gold" />
                              <span>{lang === 'EN' ? 'Test Listen' : 'चाचणी ऐका'}</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1.5">
                          {/* Direct Device Audio Upload Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditSoundboard(item, true)}
                            className="px-2.5 py-1.5 rounded-lg bg-brand-gold/15 hover:bg-brand-gold/25 text-brand-gold hover:text-white transition-all cursor-pointer border border-brand-gold/30 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                            title={lang === 'EN' ? 'Upload audio file from device for this chant' : 'या मंत्रासाठी डिव्हाइसवरून ऑडिओ फाईल अपलोड करा'}
                          >
                            <Upload className="h-3.5 w-3.5 shrink-0" />
                            <span>{lang === 'EN' ? 'Upload Audio' : 'ऑडिओ अपलोड'}</span>
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditSoundboard(item)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 hover:text-white transition-all cursor-pointer border border-white/10"
                            title={lang === 'EN' ? 'Edit this sacred sound' : 'हा ध्वनी संपादित करा'}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteSoundboardItem(item.id, lang === 'EN' ? item.nameEN : item.nameMR)}
                            className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 hover:text-white transition-all cursor-pointer border border-red-500/30"
                            title={lang === 'EN' ? 'Delete this sacred sound' : 'हा ध्वनी हटवा'}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </section>
  );
};
