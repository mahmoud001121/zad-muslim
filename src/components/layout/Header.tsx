'use client';

import { memo, useCallback } from 'react';
import { Settings, ArrowRight, ArrowLeft, Moon, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import type { HijriDate } from '@/types';

interface HeaderProps {
  hijriDate?: HijriDate | null;
  showBack?: boolean;
  title?: string;
}

export const Header = memo(function Header({ hijriDate, showBack, title }: HeaderProps) {
  const goBack = useAppStore((s) => s.goBack);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const setMoreView = useAppStore((s) => s.setMoreView);
  
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const handleSettingsClick = useCallback(() => {
    setActiveTab('more');
    setMoreView('settings');
  }, [setActiveTab, setMoreView]);

  return (
    <header className="relative z-40 w-full overflow-hidden border-b border-zad-border bg-zad-midnight/80 backdrop-blur-xl">
      {/* Premium Gradient Ornament */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-zad-gold/40 to-transparent" />
      
      <div className="relative flex items-center justify-between px-5 py-3.5">
        
        {/* Left Side: Back or Brand */}
        <div className="flex items-center min-w-[100px]">
          <AnimatePresence mode="wait">
            {showBack ? (
              <motion.button
                key="back"
                initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRtl ? 10 : -10 }}
                onClick={goBack}
                className="group flex items-center gap-1.5 rounded-xl bg-zad-surface border border-zad-border px-3 py-1.5 transition-all hover:border-zad-gold/30 hover:bg-zad-surface/80"
              >
                {isRtl ? (
                  <ArrowRight size={18} className="text-zad-gold group-hover:translate-x-0.5 transition-transform" />
                ) : (
                  <ArrowLeft size={18} className="text-zad-gold group-hover:-translate-x-0.5 transition-transform" />
                )}
                <span className="text-xs font-bold text-text-secondary">{t.back}</span>
              </motion.button>
            ) : (
              <motion.div 
                key="brand"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2.5"
              >
                <div className="relative">
                  <Moon size={22} className="text-zad-gold moon-glow fill-zad-gold/10" />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles size={10} className="text-zad-gold-light" />
                  </motion.div>
                </div>
                <span className="gold-text arabic-display text-lg font-black tracking-tight leading-none">
                  {t.appName}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center: Contextual Info */}
        <div className="flex flex-col items-center">
          <AnimatePresence mode="wait">
            {title ? (
              <motion.h1 
                key={title}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-bold gold-text arabic-display"
              >
                {title}
              </motion.h1>
            ) : (
              <motion.div 
                key="greeting"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zad-gold/60 mb-0.5">{t.greeting}</span>
                {hijriDate && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-zad-gold/40" />
                    <p className="arabic-display text-[11px] font-medium text-text-primary">
                      {hijriDate.day} {hijriDate.monthAr} {hijriDate.year}
                    </p>
                    <span className="w-1 h-1 rounded-full bg-zad-gold/40" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Settings */}
        <div className="flex items-center justify-end min-w-[100px]">
          <button
            onClick={handleSettingsClick}
            className="group relative p-2.5 rounded-2xl bg-zad-surface/50 border border-zad-border transition-all hover:border-zad-gold/30 hover:bg-zad-surface"
            aria-label={t.settings}
          >
            <Settings size={20} className="text-text-secondary group-hover:text-zad-gold group-hover:rotate-45 transition-all duration-500" />
            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-zad-gold opacity-0 group-hover:opacity-100 transition-opacity blur-[2px]" />
          </button>
        </div>
      </div>
    </header>
  );
});
