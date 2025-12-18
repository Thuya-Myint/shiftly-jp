import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

    if (isStandalone) return null;

    // Don't show if no install method available
    if (!isIOS && !deferredPrompt) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                    className="fixed bottom-4 left-4 right-4 z-[99999] bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl border border-gray-200 dark:border-slate-700 gpu-accelerated"
                >
                    <div className="flex items-start gap-3">
                        <div className={cn("p-2 rounded-lg bg-violet-100 dark:bg-violet-900/40")}>
                            <Plus className="text-violet-600 dark:text-violet-400" size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                {lang === 'en' ? 'Add to Home Screen' : 'ホーム画面に追加'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                {lang === 'en'
                                    ? 'Install this app for quick access and better experience'
                                    : 'より良い体験のためにこのアプリをインストールしてください'
                                }
                            </p>
                            <div className="flex gap-2">
                                {isIOS ? (
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            {lang === 'en'
                                                ? 'Tap Share → Add to Home Screen'
                                                : 'シェア → ホーム画面に追加をタップ'
                                            }
                                        </p>
                                        <div className="text-2xl">📱 ↗️</div>
                                    </div>
                                ) : deferredPrompt ? (
                                    <Button
                                        onClick={handleInstall}
                                        className={cn("text-white font-semibold text-sm h-8 px-3 bg-gradient-to-r from-violet-500 to-purple-600")}
                                    >
                                        {lang === 'en' ? 'Install' : 'インストール'}
                                    </Button>
                                ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {lang === 'en'
                                            ? 'Use browser menu to add to home screen'
                                            : 'ブラウザメニューからホーム画面に追加'
                                        }
                                    </p>
                                )}
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="text-sm h-8 px-3 border-gray-300 dark:border-slate-600 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100"
                                >
                                    {lang === 'en' ? 'Later' : '後で'}
                                </Button>
                            </div>
                        </div>
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="sm"
                            className="p-1 h-6 w-6 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        >
                            <X size={14} />
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}