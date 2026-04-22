'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';
import { parseTimeString, formatTime12Hour } from '@/lib/time';
import { Clock, BellRing, Sparkles } from 'lucide-react';
import type { NextPrayer, PrayerTimings } from '@/types';

interface NextPrayerCardProps {
  nextPrayer: NextPrayer | null;
  timings: PrayerTimings | null;
}

export function NextPrayerCard({ nextPrayer, timings }: NextPrayerCardProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(0);
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';

  useEffect(() => {
    if (!nextPrayer) return;

    const targetTime = Date.now() + nextPrayer.remaining;

    const update = () => {
      const now = Date.now();
      const msLeft = Math.max(0, targetTime - now);
      
      // Progress calculation (based on typical 5-hour gap)
      const totalWindow = 5 * 60 * 60 * 1000;
      const elapsed = totalWindow - msLeft;
      setProgress(Math.min(100, Math.max(0, (elapsed / totalWindow) * 100)));

      const h = Math.floor(msLeft / 3600000);
      const m = Math.floor((msLeft % 3600000) / 60000);
      const s = Math.floor((msLeft % 60000) / 1000);
      
      setTimeLeft(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer]);

  const sunrise = timings?.Sunrise;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-zad-surface/80 to-zad-midnight p-6 shadow-2xl border border-zad-gold/20"
    >
      {/* Decorative Ornaments */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-zad-gold/10 blur-[50px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-zad-gold/5 blur-[40px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
             <div className="w-10 h-10 rounded-2xl bg-zad-gold/10 flex items-center justify-center border border-zad-gold/20">
                <BellRing size={20} className="text-zad-gold animate-pulse-slow" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zad-gold/60">{t.nextPrayer}</p>
                <h2 className="arabic-display text-3xl font-black text-text-primary leading-none mt-1">
                  {nextPrayer?.nameAr || '—'}
                </h2>
             </div>
          </div>
          
          <div className="text-right">
             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zad-surface border border-zad-border">
                <Clock size={12} className="text-zad-gold" />
                <span className="font-mono text-xs font-bold text-text-primary">
                  {nextPrayer?.time ? (() => {
                    const p = parseTimeString(nextPrayer.time);
                    return p ? formatTime12Hour(p.hours, p.minutes, language) : '—';
                  })() : '—'}
                </span>
             </div>
          </div>
        </div>

        {/* Big Countdown */}
        <div className="flex flex-col items-center justify-center py-4 bg-zad-midnight/40 rounded-[2rem] border border-zad-border/30 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-zad-gold)_0%,_transparent_100%)] opacity-[0.03]" />
          
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">{t.remaining}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black font-mono tabular-nums tracking-tighter text-text-primary drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              {timeLeft || '00:00:00'}
            </span>
          </div>

          {/* Progress Indicator */}
          <div className="mt-6 w-full max-w-[240px] h-1.5 bg-zad-border/40 rounded-full overflow-hidden p-[2px]">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ type: 'spring', damping: 20, stiffness: 100 }}
               className="h-full rounded-full bg-gradient-to-r from-zad-gold to-zad-gold-light shadow-[0_0_10px_rgba(212,160,23,0.4)]"
             />
          </div>
        </div>

        {/* Sunrise Info & Extra Detail */}
        <div className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
           {sunrise && (
             <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
                   <Sparkles size={14} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-text-muted uppercase">{isAr ? 'الشروق' : 'Sunrise'}</p>
                   <p className="font-mono text-xs font-bold text-amber-200">
                     {(() => {
                        const p = parseTimeString(sunrise);
                        return p ? formatTime12Hour(p.hours, p.minutes, language) : '—';
                     })()}
                   </p>
                </div>
             </div>
           )}
           
           <div className="px-4 py-2 rounded-2xl bg-zad-gold/5 border border-zad-gold/10">
              <p className="text-[10px] font-medium text-zad-gold/80 italic">
                {isAr ? 'اللهم بارك لنا في وقتنا' : 'Bless our time, O Allah'}
              </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
