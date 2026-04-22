'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const language = useSettingsStore((s) => s.language);
  const isAr = language === 'ar';
  const [query, setQuery] = useState('');

  const handleChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="px-4 py-3">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={isAr ? 'ابحث عن محطة...' : 'Search stations...'}
          className="w-full h-12 px-4 pr-10 bg-zad-surface border border-zad-border/60 rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-zad-gold/60 focus:ring-2 focus:ring-zad-gold/20 transition-all"
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-text-muted" />
        </div>
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 left-3 flex items-center text-text-muted hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
