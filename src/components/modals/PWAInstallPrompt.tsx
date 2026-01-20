import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Lang } from '@/types/shift';

export function PWAInstallPrompt({ isOpen, onClose, lang }: { isOpen: boolean; onClose: () => void; lang: Lang }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .catch(err => console.log('SW registration failed'));
    }

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
    onClose();
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;

  if (isStandalone || !isOpen) return null;

  // Don't show if no install method available
  if (!isIOS && !deferredPrompt) return null;

  return (
    <div
      className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 z-[99999] bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2rem] p-4 sm:p-6 shadow-2xl border border-gray-100 dark:border-white/5 backdrop-blur-2xl"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={cn("p-2.5 sm:p-3 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex-shrink-0")}>
          <Plus className="text-violet-600 dark:text-violet-400 w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
        </div>
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-0.5 sm:mb-1 uppercase">
            {lang === 'en' ? 'Add to Home Screen' : 'ホーム画面に追加'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 font-medium leading-relaxed">
            {lang === 'en'
              ? 'Install Shomyn for quick access and a better experience.'
              : 'より良い体験のためにShomynをインストールしてください。'
            }
          </p>
          <div className="flex gap-3">
            {isIOS ? (
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  {lang === 'en'
                    ? 'Tap Share → Add to Home'
                    : 'シェア → ホーム画面に追加'
                  }
                </p>
                <span className="text-xl">📱</span>
              </div>
            ) : deferredPrompt ? (
              <Button
                onClick={handleInstall}
                className={cn("text-white font-bold text-xs h-10 px-6 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg active:scale-[0.98]")}
              >
                {lang === 'en' ? 'INSTALL' : 'インストール'}
              </Button>
            ) : (
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                {lang === 'en'
                  ? 'Use browser menu to install'
                  : 'ブラウザメニューからインストール'
                }
              </p>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              className="text-xs h-10 px-6 rounded-xl border-2 border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 font-bold active:scale-[0.98]"
            >
              {lang === 'en' ? 'LATER' : '後で'}
            </Button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="h-10 w-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-gray-50 dark:bg-white/5"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
