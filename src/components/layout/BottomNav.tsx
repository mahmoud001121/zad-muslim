'use client';

import { memo, useCallback, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Home, BookOpen, Clock, Sparkles, LayoutGrid } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';
import type { AppTab } from '@/types';

const tabs: { key: AppTab; icon: typeof Home; labelKey: keyof typeof TRANSLATIONS.ar }[] = [
  { key: 'home', icon: Home, labelKey: 'home' },
  { key: 'quran', icon: BookOpen, labelKey: 'quran' },
  { key: 'prayer', icon: Clock, labelKey: 'prayer' },
  { key: 'azkar', icon: Sparkles, labelKey: 'azkar' },
  { key: 'more', icon: LayoutGrid, labelKey: 'more' },
];

export const BottomNav = memo(function BottomNav() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';

  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  // Smart Hide Logic: Hide on scroll down, show on scroll up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    // Show if we are near the top or scrolling up
    if (latest > previous && latest > 100) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const handleTabClick = useCallback((key: AppTab) => {
    if (activeTab !== key) {
      setActiveTab(key);
    }
  }, [activeTab, setActiveTab]);

  return (
    <motion.nav 
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "120%", opacity: 0 }
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: "circOut" }}
      className="fixed bottom-0 left-0 right-0 z-[50] px-4 pb-6 pt-2 pointer-events-none"
    >
      <div className="mx-auto max-w-lg pointer-events-auto">
        <div className="relative flex items-center justify-around rounded-[2.5rem] border border-zad-border bg-zad-navy/80 p-2 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          
          {/* Animated Background Indicator */}
          <div className="absolute inset-0 z-0 flex items-center justify-around px-2">
            {tabs.map((tab) => (
              <div key={tab.key} className="relative flex-1 flex justify-center">
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="nav-bg"
                    className="h-12 w-12 rounded-2xl bg-zad-gold/10 border border-zad-gold/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </div>
            ))}
          </div>

          {tabs.map(({ key, icon: Icon, labelKey }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => handleTabClick(key)}
                className="relative z-10 flex flex-1 flex-col items-center gap-1 py-2 transition-all active:scale-90"
                aria-label={t[labelKey]}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon
                    size={22}
                    className={`transition-colors duration-300 ${
                      isActive ? 'text-zad-gold' : 'text-text-muted'
                    }`}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="icon-glow"
                      className="absolute inset-0 -z-10 blur-[15px] bg-zad-gold opacity-30"
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold tracking-tight transition-all duration-300 ${
                    isActive ? 'text-zad-gold scale-100' : 'text-text-muted scale-95 opacity-60'
                  } ${isAr ? 'arabic-display' : ''}`}
                >
                  {t[labelKey]}
                </span>
                
                {/* Elegant Dot indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, y: 5 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0, y: 5 }}
                      className="absolute -bottom-1 h-1 w-1 rounded-full bg-zad-gold shadow-[0_0_10px_#D4A017]"
                    />
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
});
