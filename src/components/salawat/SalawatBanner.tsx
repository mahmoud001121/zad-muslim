'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Volume2, X } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { useSalawatTimer } from '@/hooks/useSalawatTimer';

// iOS Detection Utilities
function isIOS() {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function isIOSPWA() {
  if (typeof window === 'undefined') return false;
  return (navigator as any).standalone === true;
}


export function SalawatBanner() {
  const { salawatEnabled, language, updateSettings } = useSettingsStore();
  const { playSalawat, playCount } = useSalawatTimer();
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAr = language === 'ar';

  const dismissBanner = useCallback(() => {
    if (bannerTimerRef.current) {
      clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = null;
    }
    setShowBanner(false);
  }, []);

  const handleToggle = useCallback(() => {
    if (!salawatEnabled) {
      // 1) الصوت الأول — متزامن مع الضغطة
      playSalawat();
      // 2) فعّل التايمر
      updateSettings({ salawatEnabled: true });
      // 3) إذن الإشعارات (مش هنتظر)
      if ('Notification' in window && Notification.permission === 'default') {
        // Check if iOS and not PWA
        if (isIOS() && !isIOSPWA()) {
          setShowIOSPrompt(true);
          return;
        }
        Notification.requestPermission().catch(() => {});
      }
    } else {
      updateSettings({ salawatEnabled: false });
    }
    setShowBanner(true);
    if (bannerTimerRef.current) {
      clearTimeout(bannerTimerRef.current);
    }
    bannerTimerRef.current = setTimeout(() => {
      setShowBanner(false);
    }, 3000);
  }, [salawatEnabled, updateSettings, playSalawat]);

  return (
    <>
      {/* Floating Quick Toggle Button */}
      <motion.button
        onClick={handleToggle}
        whileTap={{ scale: 0.9 }}
        className={`fixed bottom-20 right-4 z-[60] min-w-[48px] min-h-[48px] flex items-center justify-center gap-1.5 rounded-full px-3 py-2 shadow-lg transition-all sm:bottom-6 pb-[env(safe-area-inset-bottom,0)] ${
          salawatEnabled
            ? 'bg-emerald-600/90 text-white shadow-emerald-600/30'
            : 'bg-zad-surface/90 text-text-secondary border border-zad-border shadow-black/20'
        }`}
      >
        {salawatEnabled ? (
          <>
            <Volume2 className="w-4 h-4" />
            <span className="text-xs font-medium">{isAr ? 'صلى على محمد' : 'Salawat'}</span>
          </>
        ) : (
          <BellOff className="w-4 h-4" />
        )}
      </motion.button>

      {/* Status Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-32 right-4 z-[60] rounded-xl border px-4 py-3 shadow-xl sm:bottom-16 max-w-[280px] pb-[env(safe-area-inset-bottom,0)] ${
              salawatEnabled
                ? 'border-emerald-500/30 bg-emerald-950/95 text-emerald-100'
                : 'border-zad-border bg-zad-navy/95 text-text-primary'
            }`}
          >
            <div className="flex items-center gap-2">
              {salawatEnabled ? (
                <Bell className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <BellOff className="w-4 h-4 text-text-muted shrink-0" />
              )}
              <p className="text-xs font-medium">
                {salawatEnabled
                  ? (isAr ? 'تم تشغيل تذكير الصلاة على النبي ﷺ' : 'Salawat reminder enabled')
                  : (isAr ? 'تم إيقاف التذكير' : 'Reminder disabled')
                }
              </p>
              <button onClick={dismissBanner} className="mr-auto shrink-0 text-text-muted hover:text-text-primary">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {salawatEnabled && (
              <p className="text-[10px] text-emerald-300/60 mt-1">تشغيل #{playCount}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Install Prompt */}
      <AnimatePresence>
        {showIOSPrompt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowIOSPrompt(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-zad-navy border border-zad-border rounded-2xl p-6 max-w-sm shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zad-gold/10 flex items-center justify-center">
                  <Bell className="w-8 h-8 text-zad-gold" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">
                  {isAr ? 'تفعيل الإشعارات' : 'Enable Notifications'}
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                  {isAr 
                    ? 'لتلقي الإشعارات على iOS، يجب إضافة التطبيق إلى الشاشة الرئيسية'
                    : 'To receive notifications on iOS, add this app to your home screen'}
                </p>
                <div className="bg-zad-surface rounded-lg p-4 mb-4 text-right">
                  <ol className="text-xs text-text-secondary space-y-2">
                    <li>{isAr ? '١. اضغط على زر المشاركة' : '1. Tap the Share button'} 📤</li>
                    <li>{isAr ? '٢. اختر "إضافة إلى الشاشة الرئيسية"' : '2. Select "Add to Home Screen"'}</li>
                    <li>{isAr ? '٣. افتح التطبيق من الشاشة الرئيسية' : '3. Open app from home screen'}</li>
                  </ol>
                </div>
                <button
                  onClick={() => setShowIOSPrompt(false)}
                  className="w-full bg-zad-gold text-zad-midnight font-bold py-3 rounded-xl hover:bg-zad-gold/90 transition-colors"
                >
                  {isAr ? 'فهمت' : 'Got it'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
