/**
 * Universal WhatsApp & Social Sharing Utility for Shree Ishwatichi Mata Devasthan
 * Implements resilient cross-platform sharing with iframe, mobile, and desktop fallbacks.
 * Adheres to SOLID & Clean Architecture Principles.
 */

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  lang?: 'EN' | 'MR';
  phone?: string;
}

/**
 * Resolves any raw URL (relative, blob, or absolute) into a valid, shareable public URL.
 * Never shares machine-local blob: URLs over external messengers.
 */
export const resolveShareUrl = (rawUrl?: string): string => {
  if (!rawUrl || rawUrl.startsWith('blob:') || rawUrl.startsWith('data:')) {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${window.location.pathname}`;
    }
    return 'https://ishwatichimata.org/';
  }

  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }

  if (typeof window !== 'undefined' && rawUrl.startsWith('/')) {
    return `${window.location.origin}${rawUrl}`;
  }

  return rawUrl;
};

/**
 * Primary WhatsApp sharing service.
 * Handles mobile Web Share API, popup blocker bypass, fallback links, and clipboard copy.
 */
export const shareToWhatsApp = async (options: ShareOptions): Promise<boolean> => {
  const { title = '', text = '', url = '', lang = 'MR', phone } = options;
  const resolvedUrl = resolveShareUrl(url);

  // Format devotional header and message
  const header = lang === 'EN'
    ? '|| Shree Ishwati Chi Mata Prasanna ||'
    : '|| श्री इश्वटीची माता प्रसन्न ||';

  const titleLine = title ? (lang === 'EN' ? `Sacred Darshan: ${title}` : `पावन दर्शन: ${title}`) : '';
  const bodyText = text || '';
  
  const messageParts = [
    header,
    titleLine,
    bodyText,
    resolvedUrl ? `🔗 ${resolvedUrl}` : ''
  ].filter(Boolean);

  const fullMessage = messageParts.join('\n');
  const encodedMessage = encodeURIComponent(fullMessage);

  // Determine WhatsApp target URL (individual contact vs universal broadcast/chat picker)
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;

  // 1. Try mobile Web Share API if on mobile device (best native user experience)
  if (typeof navigator !== 'undefined' && typeof window !== 'undefined') {
    const isMobile = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || '');
    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: title || (lang === 'EN' ? 'Shree Ishwati Chi Mata' : 'श्री इश्वटीची माता'),
          text: fullMessage,
          url: resolvedUrl || undefined
        });
        return true;
      } catch (err: unknown) {
        // Devotee dismissed share sheet or app aborted; proceed to direct WhatsApp fallback
        const isAbort = err instanceof Error && err.name === 'AbortError';
        if (isAbort) {
          return false;
        }
      }
    }
  }

  // 2. Direct browser navigation with popup blocker circumvention
  let windowRef: Window | null = null;
  try {
    windowRef = window.open(waUrl, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.warn('Direct window.open blocked by browser:', error);
  }

  // 3. Fallback: If popup was blocked or returned null (common in iframes & strict mobile browsers)
  if (!windowRef || windowRef.closed || typeof windowRef.closed === 'undefined') {
    try {
      const link = document.createElement('a');
      link.href = waUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // 4. Ultimate fallback: location assign
      window.location.assign(waUrl);
    }
  }

  // 5. Secondary convenience: Copy devotional link to clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(fullMessage).catch(() => {});
  }

  return true;
};

/**
 * Initiates direct WhatsApp chat with the Mandal Helpline
 */
export const openMandalWhatsAppChat = (phone = '+91 94825 00000', lang: 'EN' | 'MR' = 'MR') => {
  const cleanNumber = phone.replace(/[^0-9]/g, '');
  const greeting = lang === 'EN'
    ? '|| Shree Ishwati Chi Mata Prasanna ||\nNamaskar Mandal Secretariat, I would like to inquire about:'
    : '|| श्री इश्वटीची माता प्रसन्न ||\nनमस्कार, मला श्री इश्वटीची माता देवस्थानाबाबत माहिती हवी आहे:';
  
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(greeting)}`;

  let opened: Window | null = null;
  try {
    opened = window.open(waUrl, '_blank', 'noopener,noreferrer');
  } catch {
    // ignore
  }

  if (!opened || opened.closed) {
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
