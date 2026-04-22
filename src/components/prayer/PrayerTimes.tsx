'use client';

import { motion } from 'framer-motion';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { PRAYER_META } from '@/lib/constants';
import { Clock, MapPin, Sun, SunMedium, CloudSun, Sunset, Moon } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';
import { CountdownTimer } from './CountdownTimer';
import { parseTimeString, formatTime12Hour } from '@/lib/time';

const ICON_MAP: Record<string, any> = {
  Sun: Sun,
  SunMedium: SunMedium,
  CloudSun: CloudSun,
  Sunset: Sunset,
  Moon: Moon,
};

export function PrayerTimes() {
  const { timings, nextPrayer, isLoading } = usePrayerTimes();
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-40 animate-pulse rounded-2xl bg-zad-surface" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-zad-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (!timings) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zad-border bg-zad-surface p-10 text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zad-gold/10">
            <MapPin className="h-6 w-6 text-zad-gold" />
          </div>
          <p className="text-sm font-medium text-text-primary">
            {language === 'ar' ? 'تعذر تحميل مواقيت الصلاة' : 'Failed to load prayer times'}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {language === 'ar' ? 'يرجى التحقق من اتصال الإنترنت وإعدادات الموقع' : 'Please check your connection and location settings'}
          </p>
        </motion.div>
      </div>
    );
  }

  // Calculate which prayers are past
  const now = new Date();
  const isPast = (timeStr: string) => {
    const parts = parseTimeString(timeStr);
    if (!parts) return false;
    const pt = new Date();
    pt.setHours(parts.hours, parts.minutes, 0, 0);
    return pt <= now;
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      {/* Next Prayer Countdown Card */}
      {nextPrayer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <CountdownTimer nextPrayer={nextPrayer} />
        </motion.div>
      )}

      {/* 5 Prayer Cards List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {PRAYER_META.map(({ key, nameAr, icon: iconName }, index) => {
          const time = timings[key];
          if (!time) return null;
          
          const isNext = nextPrayer?.name === key;
          const past = !isNext && isPast(time);
          const Icon = ICON_MAP[iconName] || Clock;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: language === 'ar' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
              className={`flex items-center justify-between rounded-[1.25rem] border px-5 py-4 transition-all duration-300 ${
                isNext
                  ? 'border-zad-gold/50 bg-zad-gold-muted shadow-[0_0_20px_rgba(212,160,23,0.15)] ring-1 ring-zad-gold/20'
                  : 'border-zad-border bg-zad-surface/40 hover:bg-zad-surface/60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                  isNext ? 'bg-zad-gold text-zad-midnight shadow-lg' : 'bg-zad-surface text-zad-gold/80 border border-zad-border'
                }`}>
                  <Icon size={20} strokeWidth={isNext ? 2.5 : 2} />
                </div>
                <div>
                  <p
                    className={`text-base font-bold transition-colors ${
                      past ? 'text-text-muted/40' : isNext ? 'text-text-primary' : 'text-text-primary'
                    }`}
                  >
                    {nameAr}
                  </p>
                  {isNext && (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zad-gold/90 animate-pulse">
                      {t.nextPrayer}
                    </p>
                  )}
                </div>
              </div>
              <div className={`flex flex-col items-end ${past ? 'opacity-30' : 'opacity-100'}`}>
                <div className="flex items-center gap-1.5">
                   <Clock size={12} className="text-text-muted" />
                   <span className="font-mono text-base font-bold tabular-nums text-text-primary">
                    {(() => {
                      const parts = parseTimeString(time);
                      return parts ? formatTime12Hour(parts.hours, parts.minutes, language) : '—';
                    })()}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
