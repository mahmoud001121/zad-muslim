'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, RotateCcw } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import type { Dhikr } from '@/types';
import azkarData from '@/data/azkar.json';

interface AzkarListProps {
  category: string;
  onBack: () => void;
}

export function AzkarList({ category, onBack }: AzkarListProps) {
  const [counters, setCounters] = useState<Map<number, number>>(new Map());
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const { data, isLoading } = useQuery<Dhikr[]>({
    queryKey: ['azkar'],
    queryFn: () => fetch('/api/azkar').then((r) => r.json()),
    staleTime: 7 * 24 * 60 * 60 * 1000,
  });

  const items = data?.filter((d) => d.category === category) || [];

  useEffect(() => {
    const initial = new Map<number, number>();
    items.forEach((item, index) => {
      const itemId = item.id !== undefined ? item.id : index;
      initial.set(itemId, item.count);
    });
    setCounters(initial);
  }, [items]);

  const handleTap = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCounters((prev) => {
      const next = new Map(prev);
      const current = next.get(id);
      if (current !== undefined && current > 0) {
        next.set(id, current - 1);
      }
      return next;
    });
  };

  const resetCounter = (id: number, maxCount: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCounters((prev) => {
      const next = new Map(prev);
      next.set(id, maxCount);
      return next;
    });
  };

  const total = items.length;
  const done = Array.from(counters.values()).filter((count) => count === 0).length;

  if (isLoading) {
    return (
      <div className="custom-scrollbar space-y-4 p-4">
        <Skeleton className="mx-auto h-8 w-48" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={`skeleton-${i}`} className="mx-auto h-24 w-full max-w-lg rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="custom-scrollbar flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-zad-border bg-zad-midnight/90 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="rounded-full p-2 hover:bg-zad-surface">
            {isRtl ? <ArrowRight size={20} className="text-text-secondary" /> : <ArrowLeft size={20} className="text-text-secondary" />}
          </button>
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary">{category}</p>
            <p className="text-xs text-text-muted">{done}/{total}</p>
          </div>
          <div className="w-8" />
        </div>
        {/* Progress bar */}
        <div className="mx-auto mt-2 h-1 max-w-xs overflow-hidden rounded-full bg-zad-surface">
          <motion.div
            className="h-full rounded-full bg-zad-gold"
            animate={{ width: total > 0 ? `${(done / total) * 100}%` : '0%' }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Azkar Cards */}
      <div className="mx-auto w-full max-w-2xl space-y-6 p-4 pb-8">
        {items.map((item, i) => {
          const itemId = item.id !== undefined ? item.id : i;
          const currentCount = counters.get(itemId) ?? item.count;
          const isCompleted = currentCount === 0;
          const progress = ((item.count - currentCount) / item.count) * 100;
          
          return (
            <motion.div
              key={itemId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
              className={`relative w-full rounded-3xl border p-8 text-right transition-all ${
                isCompleted
                  ? 'border-zad-green/40 bg-zad-green-glow shadow-xl shadow-zad-green/10'
                  : currentCount < item.count
                  ? 'border-zad-gold/40 bg-gradient-to-br from-zad-gold/5 to-zad-surface shadow-xl shadow-zad-gold/10'
                  : 'border-zad-border bg-zad-surface/50 hover:border-zad-gold/30'
              }`}
            >
              {/* Counter Display - Top Left */}
              <div className="absolute left-6 top-6 flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => resetCounter(itemId, item.count, e)}
                  className="rounded-full p-2 transition-colors hover:bg-zad-surface"
                  title="Reset"
                >
                  <RotateCcw size={16} className="text-text-muted" />
                </motion.button>
                
                <div className="flex flex-col items-center">
                  <motion.span
                    key={currentCount}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`font-mono text-3xl font-bold tabular-nums ${
                      isCompleted ? 'text-zad-green' : 'text-zad-gold'
                    }`}
                  >
                    {currentCount}
                  </motion.span>
                  <span className="text-xs text-text-muted">/ {item.count}</span>
                </div>

                {/* Circular Progress */}
                <svg width="50" height="50" className="-rotate-90">
                  <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-zad-surface"
                  />
                  <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                    className={`transition-all duration-300 ${
                      isCompleted ? 'text-zad-green' : 'text-zad-gold'
                    }`}
                  />
                </svg>
              </div>

              {/* Tap Area */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={(e) => handleTap(itemId, e)}
                disabled={isCompleted}
                className="w-full text-right"
              >
                {/* Dhikr text */}
                <p className={`arabic-display text-4xl leading-loose ${
                  isCompleted ? 'text-text-muted/50 line-through' : 'text-text-arabic'
                }`}>
                  {item.content}
                </p>

                {/* Description */}
                {item.description && (
                  <p className="mt-4 text-base leading-relaxed text-text-secondary">{item.description}</p>
                )}

                {/* Reference */}
                {item.reference && (
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <span className="rounded-full bg-zad-midnight px-4 py-1.5 text-sm text-text-muted">
                      {item.reference}
                    </span>
                  </div>
                )}
              </motion.button>

              {/* Check icon */}
              <AnimatePresence>
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    className="absolute right-6 top-6 rounded-full bg-zad-green/20 p-3"
                  >
                    <Check size={24} className="text-zad-green" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {items.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-text-muted">{t.noResults}</p>
          </div>
        )}
      </div>
    </div>
  );
}
