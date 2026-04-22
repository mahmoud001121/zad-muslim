'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';

interface LocationPromptProps {
  error?: string | null;
  onRetry?: () => void;
}

// Popular Egyptian cities
const POPULAR_CITIES = [
  { name: 'القاهرة', nameEn: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { name: 'الإسكندرية', nameEn: 'Alexandria', lat: 31.2001, lng: 29.9187 },
  { name: 'الجيزة', nameEn: 'Giza', lat: 30.0131, lng: 31.2089 },
  { name: 'المنصورة', nameEn: 'Mansoura', lat: 31.0409, lng: 31.3785 },
  { name: 'طنطا', nameEn: 'Tanta', lat: 30.7865, lng: 31.0004 },
  { name: 'أسيوط', nameEn: 'Asyut', lat: 27.1809, lng: 31.1837 },
  { name: 'الأقصر', nameEn: 'Luxor', lat: 25.6872, lng: 32.6396 },
  { name: 'أسوان', nameEn: 'Aswan', lat: 24.0889, lng: 32.8998 },
];

export function LocationPrompt({ error, onRetry }: LocationPromptProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ lat: number; lng: number; name: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [locationHistory, setLocationHistory] = useState<Array<{ lat: number; lng: number; name: string }>>([]);
  const [noResults, setNoResults] = useState(false);
  const setLocation = useSettingsStore((s) => s.setLocation);
  const language = useSettingsStore((s) => s.language);
  const t = TRANSLATIONS[language];
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Load location history on mount
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('locationHistory') || '[]');
      setLocationHistory(history);
    } catch (e) {
      console.warn('Failed to load location history', e);
    }
  }, []);

  const searchCity = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setResults([]);
      setNoResults(false);
      return;
    }
    
    setIsSearching(true);
    setNoResults(false);
    
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=8&accept-language=${language === 'ar' ? 'ar' : 'en'}`,
        { headers: { 'User-Agent': 'Zad-Muslim-App/1.2' } }
      );
      const data = await res.json();
      
      if (data.length === 0) {
        setNoResults(true);
        setResults([]);
      } else {
        setNoResults(false);
        setResults(
          data.map((r: Record<string, string>) => ({
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
            name: r.display_name?.split(',').slice(0, 3).join(', ') || r.display_name,
          }))
        );
      }
    } catch {
      setResults([]);
      setNoResults(true);
    }
    setIsSearching(false);
  }, [language]);

  // Debounced search
  const handleQueryChange = (value: string) => {
    setQuery(value);
    setShowHistory(false);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      searchCity(value);
    }, 500);
  };

  const selectCity = (lat: number, lng: number, name: string) => {
    setLocation(lat, lng, name);
    setResults([]);
    setQuery('');
    setNoResults(false);
    setShowHistory(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setNoResults(false);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-zad-border bg-zad-surface p-6 text-center">
      <MapPin size={32} className="mx-auto text-zad-gold" />
      <p className="text-sm text-text-secondary">{error || (t as any).locationDenied || (language === 'ar' ? 'تم رفض الوصول للموقع' : 'Location access denied')}</p>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchCity(query)}
            onFocus={() => setShowHistory(query.length === 0 && locationHistory.length > 0)}
            placeholder={(t as any).selectCity || (language === 'ar' ? 'ابحث عن مدينتك...' : 'Search for your city...')}
            className="border-zad-border bg-zad-midnight text-text-primary placeholder:text-text-muted pr-8"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          onClick={() => searchCity(query)}
          disabled={isSearching || query.trim().length < 2}
          variant="outline"
          className="border-zad-gold/30 text-zad-gold hover:bg-zad-gold-muted"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* No results message */}
      {noResults && (
        <div className="text-sm text-text-muted">
          {language === 'ar' ? 'لم يتم العثور على نتائج. حاول مرة أخرى.' : 'No results found. Try again.'}
        </div>
      )}

      {/* Search results */}
      {results.length > 0 && (
        <div className="max-h-64 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="text-xs text-text-muted mb-2">
            {language === 'ar' ? `${results.length} نتيجة` : `${results.length} results`}
          </p>
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => selectCity(r.lat, r.lng, r.name)}
              className="w-full rounded-lg border border-zad-border px-3 py-2 text-right text-sm text-text-secondary transition-colors hover:bg-zad-gold-muted hover:text-text-primary"
            >
              {r.name}
            </button>
          ))}
        </div>
      )}

      {/* Location history */}
      {showHistory && locationHistory.length > 0 && (
        <div className="max-h-48 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
            <Clock className="h-3 w-3" />
            <span>{language === 'ar' ? 'المواقع السابقة' : 'Recent Locations'}</span>
          </div>
          {locationHistory.map((loc, i) => (
            <button
              key={i}
              onClick={() => selectCity(loc.lat, loc.lng, loc.name)}
              className="w-full rounded-lg border border-zad-border px-3 py-2 text-right text-sm text-text-secondary transition-colors hover:bg-zad-gold-muted hover:text-text-primary"
            >
              {loc.name}
            </button>
          ))}
        </div>
      )}

      {/* Popular cities - show when no search query */}
      {!query && !showHistory && results.length === 0 && (
        <div className="space-y-2">
          <p className="text-xs text-text-muted">
            {language === 'ar' ? 'مدن شائعة' : 'Popular Cities'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_CITIES.map((city, i) => (
              <button
                key={i}
                onClick={() => selectCity(city.lat, city.lng, language === 'ar' ? city.name : city.nameEn)}
                className="rounded-lg border border-zad-border px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-zad-gold-muted hover:text-text-primary"
              >
                {language === 'ar' ? city.name : city.nameEn}
              </button>
            ))}
          </div>
        </div>
      )}

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="ghost"
          className="text-text-muted hover:text-text-secondary"
        >
          {(t as any).retry || (language === 'ar' ? 'إعادة المحاولة' : 'Retry')}
        </Button>
      )}
    </div>
  );
}
