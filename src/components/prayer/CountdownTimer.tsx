'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';
import { Clock, Timer } from 'lucide-react';
import type { NextPrayer } from '@/types';

interface CountdownTimerProps {
  nextPrayer: NextPrayer;
}

export function CountdownTimer({ nextPrayer }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(0);
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';

  const targetTimeRef = useRef<number>(0);

  useEffect(() => {
    targetTimeRef.current = Date.now() + nextPrayer.remaining;
  }, [nextPrayer.remaining, nextPrayer.name]);

  useEffect(() => {
    const update = () => {
      const msLeft = Math.max(0, targetTimeRef.current - Date.now());
      const totalMs = 5 * 60 * 60 * 1000;
      const elapsed = totalMs - msLeft;
      setProgress(Math.min(100, Math.max(0, (elapsed / totalMs) * 100)));

      const hours = Math.floor(msLeft / 3600000);
      const minutes = Math.floor((msLeft % 3600000) / 60000);
      const seconds = Math.floor((msLeft % 60000) / 1000);
      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-zad-surface to-zad-midnight p-8 text-center border border-zad-gold/20 shadow-2xl"
    >
      {/* Background Ornament */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-zad-gold) 1px, transparent 0)`, backgroundSize: '24px 24px' }} 
      />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zad-gold/10 border border-zad-gold/20 mb-4">
           <Timer size={14} className="text-zad-gold" />
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zad-gold">{t.nextPrayer}</p>
        </div>

        <h2 className="arabic-display text-4xl font-black text-text-primary mb-1">{nextPrayer.nameAr}</h2>
        
        <div className="py-6">
           <span className="font-mono text-5xl font-black tabular-nums tracking-tighter text-text-primary drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
             {timeLeft}
           </span>
        </div>

        <div className="flex flex-col items-center gap-4">
           <div className="w-full max-w-[280px] h-2 bg-zad-midnight/60 rounded-full p-[3px] border border-zad-border/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', damping: 20, stiffness: 80 }}
                className="h-full rounded-full bg-gradient-to-r from-zad-gold to-zad-gold-light shadow-[0_0_15px_rgba(212,160,23,0.3)]"
              />
           </div>
           
           <div className="flex items-center gap-2 text-text-muted">
              <Clock size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{isAr ? 'موعد الأذان' : 'Adhan Time'}: {nextPrayer.time}</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
