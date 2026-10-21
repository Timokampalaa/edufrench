import React, { useEffect, useState } from 'react';
import { Download, X, Share, Monitor, Info } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'pc-chrome' | 'pc-other'>('pc-chrome');

  useEffect(() => {
    // Check if already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                             (window.navigator as any).standalone === true;
    if (isStandaloneMode) return;

    // Detect device / browser
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    const isChrome = /chrome|crios/.test(ua);
    const isEdge = /edg/.test(ua);

    if (isIOS) {
      setDeviceType('ios');
    } else if (isAndroid) {
      setDeviceType('android');
    } else if (isChrome || isEdge) {
      setDeviceType('pc-chrome');
    } else {
      setDeviceType('pc-other');
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show banner automatically if not dismissed this session
      if (!sessionStorage.getItem('pwa_prompt_dismissed')) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If PWA banner wasn't shown because prompt didn't fire, but we are on mobile (iOS/Android),
    // we can still proactively show the install prompt banner after a 5 second delay to invite the user.
    const fallbackTimer = setTimeout(() => {
      if (!window.deferredPrompt && !sessionStorage.getItem('pwa_prompt_dismissed')) {
        setShowPrompt(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstall = async () => {
    // First try the window global prompt or the local state prompt
    const activePrompt = window.deferredPrompt || deferredPrompt;
    if (activePrompt) {
      try {
        activePrompt.prompt();
        const { outcome } = await activePrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted PWA installation');
        }
        window.deferredPrompt = null;
        setDeferredPrompt(null);
        setShowPrompt(false);
      } catch (err) {
        console.error('Error triggering local prompt:', err);
        setShowGuideModal(true);
      }
    } else {
      // Prompt not active / supported -> show custom instructions modal
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt && !showGuideModal) return null;

  return (
    <>
      {showPrompt && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm app-card p-4 z-50 flex items-center justify-between pointer-events-auto surface-primary animate-in" style={{ boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.1)', border: '1px solid var(--border)' }}>
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="EduFrench by Sonia" className="w-12 h-12 object-contain" />
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                <span style={{ color: '#2563EB' }}>Edu</span><span style={{ color: '#dc2626' }}>French</span><span className="italic font-medium ml-1 text-xs" style={{ color: 'var(--text-muted)' }}>by Sonia</span>
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Add to home screen for quick access.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleDismiss} className="p-2 transition-colors hover:text-neutral-900 cursor-pointer text-xs font-bold" style={{ color: 'var(--text-muted)' }}>✕ Dismiss</button>
            <button onClick={handleInstall} className="btn-primary p-2.5 rounded-full shadow-md cursor-pointer">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Guided Instructions Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md pointer-events-auto">
          <div className="app-card w-full max-w-md p-6 relative border" style={{ borderColor: 'var(--border)', background: 'var(--card-bg)', boxShadow: 'var(--shadow)' }}>
            <button 
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center">
              <img src="/logo.png" alt="EduFrench by Sonia" className="w-20 h-20 object-contain mb-3 drop-shadow-md" />
              <h3 className="font-bold text-xl text-center" style={{ color: 'var(--text-heading)' }}>
                <span style={{ color: '#2563EB' }}>Edu</span><span style={{ color: '#dc2626' }}>French</span><span className="font-medium italic text-sm ml-1" style={{ color: 'var(--text-muted)' }}>by Sonia</span>
              </h3>
              <p className="text-xs text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
                Access the portal directly from your home screen with offline capabilities.
              </p>

              {/* iOS Instructions */}
              {deviceType === 'ios' && (
                <div className="w-full space-y-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex gap-2 text-xs text-amber-800 dark:text-amber-300">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Safari is recommended for PWA installation on iOS.</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 font-bold flex items-center justify-center text-xs">1</span>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Tap the Share button at the bottom of Safari (represented by a square with an arrow pointing up).</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 font-bold flex items-center justify-center text-xs">2</span>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Scroll down and tap <strong>Add to Home Screen</strong>.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Android Instructions */}
              {deviceType === 'android' && (
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 font-bold flex items-center justify-center text-xs">1</span>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Tap the browser's menu (<strong>three dots</strong> in top/bottom right).</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 font-bold flex items-center justify-center text-xs">2</span>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Select <strong>Add to Home Screen</strong> or <strong>Install App</strong>.</p>
                  </div>
                </div>
              )}

              {/* PC Chrome / Edge Instructions */}
              {deviceType === 'pc-chrome' && (
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 font-bold flex items-center justify-center text-xs">1</span>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Look at the right side of your browser's address bar.</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 font-bold flex items-center justify-center text-xs">2</span>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Click the <strong>Install Icon</strong> <Monitor className="inline w-4 h-4 mx-1 text-blue-500" /> (or click the three dots menu and select <strong>Install App</strong>).</p>
                  </div>
                </div>
              )}

              {/* Other Browsers / PC Instructions */}
              {deviceType === 'pc-other' && (
                <div className="w-full space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl flex gap-2 text-xs text-blue-800 dark:text-blue-300">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>For the best app experience, we recommend using Chrome, Edge, or Safari.</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 font-bold flex items-center justify-center text-xs">1</span>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Open the browser options/settings menu.</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 font-bold flex items-center justify-center text-xs">2</span>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Select <strong>Install</strong> or <strong>Add to desktop / page shortcuts</strong>.</p>
                  </div>
                </div>
              )}

              <button 
                onClick={() => {
                  setShowGuideModal(false);
                  setShowPrompt(false);
                }}
                className="w-full mt-6 py-2.5 rounded-xl font-bold text-sm text-center btn-primary cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
