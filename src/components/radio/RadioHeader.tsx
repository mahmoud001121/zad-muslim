'use client';

import { Radio } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';

export function RadioHeader() {
  const language = useSettingsStore((s) => s.language);
  const isAr = language === 'ar';

  return (
    <div className="sticky top-0 z-20 bg-zad-midnight border-b border-zad-border/60 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-zad-gold/15 border border-zad-gold/30 flex items-center justify-center">
          <Radio className="w-5 h-5 text-zad-gold" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary arabic-display">
            {isAr ? 'إذاعة القرآن الكريم' : 'Quran Radio'}
          </h1>
          <p className="text-xs text-text-muted">
            {isAr ? 'استمع للقرآن الكريم مباشرة' : 'Listen to Quran live'}
          </p>
        </div>
      </div>
    </div>
  );
}
