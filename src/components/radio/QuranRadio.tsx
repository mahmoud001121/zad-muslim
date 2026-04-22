'use client';

import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Star, Clock, Radio as RadioIcon, BookOpen, Mic, Heart as HeartIcon, Sparkles, Globe } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { useRadioPlayer } from '@/hooks/useRadioPlayer';
import { RadioHeader } from './RadioHeader';
import { NowPlayingCard } from './NowPlayingCard';
import { SearchBar } from './SearchBar';
import { StationCard } from './StationCard';
import type { RadioStation } from '@/types';

const FAVORITES_KEY = 'zad-radio-favorites';
const RECENT_KEY = 'zad-radio-recent';

type TabType = 'all' | 'quran' | 'tafsir' | 'special' | 'favorites' | 'recent';

export function QuranRadio() {
  const language = useSettingsStore((s) => s.language);
  const isAr = language === 'ar';

  // Radio player
  const {
    activeStation,
    isPlaying,
    isBuffering,
    hasError,
    errorMessage,
    volume,
    setVolume,
    playStation,
    stopPlayback,
    togglePlayback,
    retry,
  } = useRadioPlayer();

  // State
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [isLoadingStations, setIsLoadingStations] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [recentPlayed, setRecentPlayed] = useState<number[]>([]);

  // Load favorites and recent from localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }

      const savedRecent = localStorage.getItem(RECENT_KEY);
      if (savedRecent) {
        setRecentPlayed(JSON.parse(savedRecent));
      }
    } catch (e) {
      console.warn('Failed to load favorites/recent', e);
    }
  }, []);

  // Fetch stations from API
  useEffect(() => {
    async function fetchStations() {
      try {
        setIsLoadingStations(true);
        setFetchError(null);

        const res = await fetch('/api/radio');
        if (!res.ok) throw new Error('Failed to fetch stations');

        const data = await res.json();
        const stationsList = data.radios || data.stations || [];
        
        if (stationsList.length === 0) {
          throw new Error('No stations available');
        }

        setStations(stationsList);
        console.log('[Radio] Loaded', stationsList.length, 'stations');
      } catch (err) {
        console.error('[Radio] Fetch error:', err);
        setFetchError(isAr ? 'فشل تحميل المحطات' : 'Failed to load stations');
      } finally {
        setIsLoadingStations(false);
      }
    }

    fetchStations();
  }, [isAr]);

  // Categorize stations based on genres and description
  const categorizeStation = (station: RadioStation): string => {
    const name = station.name.toLowerCase();
    const genres = station.genres?.map(g => g.toLowerCase()).join(' ') || '';
    const desc = station.description?.toLowerCase() || '';
    
    // Tafsir category
    if (name.includes('تفسير') || genres.includes('tafsir') || desc.includes('tafsir')) {
      return 'tafsir';
    }
    
    // Special categories
    if (name.includes('سنة') || name.includes('رقية') || name.includes('تكبيرات') || 
        name.includes('خاشعة') || name.includes('صلوات') ||
        genres.includes('sunnah') || genres.includes('ruqyah')) {
      return 'special';
    }
    
    // Default to Quran recitation
    return 'quran';
  };

  // Toggle favorite
  const toggleFavorite = (stationId: number) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(stationId)
        ? prev.filter((id) => id !== stationId)
        : [...prev, stationId];
      
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  // Add to recent played
  const addToRecent = (stationId: number) => {
    setRecentPlayed((prev) => {
      const filtered = prev.filter((id) => id !== stationId);
      const newRecent = [stationId, ...filtered].slice(0, 10);
      localStorage.setItem(RECENT_KEY, JSON.stringify(newRecent));
      return newRecent;
    });
  };

  // Handle station click
  const handleStationClick = (station: RadioStation) => {
    if (activeStation && station.id === activeStation.id) {
      togglePlayback();
    } else {
      playStation(station);
      addToRecent(station.id);
    }
  };

  // Navigation
  const handleNext = () => {
    if (!activeStation || filteredStations.length === 0) return;
    const currentIdx = filteredStations.findIndex((s) => s.id === activeStation.id);
    const nextIdx = (currentIdx + 1) % filteredStations.length;
    const nextStation = filteredStations[nextIdx];
    playStation(nextStation);
    addToRecent(nextStation.id);
  };

  const handlePrev = () => {
    if (!activeStation || filteredStations.length === 0) return;
    const currentIdx = filteredStations.findIndex((s) => s.id === activeStation.id);
    const prevIdx = (currentIdx - 1 + filteredStations.length) % filteredStations.length;
    const prevStation = filteredStations[prevIdx];
    playStation(prevStation);
    addToRecent(prevStation.id);
  };

  // Share station
  const handleShare = async () => {
    if (!activeStation) return;

    const shareData = {
      title: activeStation.name,
      text: `${isAr ? 'استمع إلى' : 'Listen to'} ${activeStation.name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
        alert(isAr ? 'تم النسخ إلى الحافظة' : 'Copied to clipboard');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  // Filter stations
  const filteredStations = useMemo(() => {
    let filtered = stations;

    // Filter by tab
    if (activeTab === 'favorites') {
      filtered = filtered.filter((s) => favorites.includes(s.id));
    } else if (activeTab === 'recent') {
      filtered = recentPlayed
        .map((id) => stations.find((s) => s.id === id))
        .filter((s): s is RadioStation => s !== undefined);
    } else if (activeTab === 'quran') {
      filtered = filtered.filter((s) => categorizeStation(s) === 'quran');
    } else if (activeTab === 'tafsir') {
      filtered = filtered.filter((s) => categorizeStation(s) === 'tafsir');
    } else if (activeTab === 'special') {
      filtered = filtered.filter((s) => categorizeStation(s) === 'special');
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(query) ||
        s.nameEn?.toLowerCase().includes(query) ||
        s.country?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [stations, activeTab, favorites, recentPlayed, searchQuery]);

  // Count stations by category
  const categoryCounts = useMemo(() => {
    return {
      all: stations.length,
      quran: stations.filter((s) => categorizeStation(s) === 'quran').length,
      tafsir: stations.filter((s) => categorizeStation(s) === 'tafsir').length,
      special: stations.filter((s) => categorizeStation(s) === 'special').length,
      favorites: favorites.length,
      recent: recentPlayed.length,
    };
  }, [stations, favorites, recentPlayed]);

  return (
    <div className="h-full flex flex-col bg-zad-midnight">
      <RadioHeader />

      {/* Now Playing Card */}
      <AnimatePresence>
        {activeStation && (
          <NowPlayingCard
            station={activeStation}
            isPlaying={isPlaying}
            isBuffering={isBuffering}
            hasError={hasError}
            errorMessage={errorMessage}
            volume={volume}
            onPlayPause={togglePlayback}
            onNext={handleNext}
            onPrev={handlePrev}
            onVolumeChange={setVolume}
            onRetry={retry}
            onShare={handleShare}
          />
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <SearchBar onSearch={setSearchQuery} />

      {/* Tabs */}
      <div className="sticky top-[72px] z-10 bg-zad-midnight border-b border-zad-border/60 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-zad-gold text-black'
                : 'bg-zad-surface border border-zad-border/60 text-text-secondary hover:border-zad-gold/40'
            }`}
          >
            <Globe className="w-4 h-4" />
            {isAr ? 'الكل' : 'All'}
            <span className="text-xs opacity-70">({categoryCounts.all})</span>
          </button>

          <button
            onClick={() => setActiveTab('quran')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'quran'
                ? 'bg-zad-gold text-black'
                : 'bg-zad-surface border border-zad-border/60 text-text-secondary hover:border-zad-gold/40'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {isAr ? 'القرآن' : 'Quran'}
            <span className="text-xs opacity-70">({categoryCounts.quran})</span>
          </button>

          <button
            onClick={() => setActiveTab('tafsir')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'tafsir'
                ? 'bg-zad-gold text-black'
                : 'bg-zad-surface border border-zad-border/60 text-text-secondary hover:border-zad-gold/40'
            }`}
          >
            <Mic className="w-4 h-4" />
            {isAr ? 'التفسير' : 'Tafsir'}
            <span className="text-xs opacity-70">({categoryCounts.tafsir})</span>
          </button>

          <button
            onClick={() => setActiveTab('special')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'special'
                ? 'bg-zad-gold text-black'
                : 'bg-zad-surface border border-zad-border/60 text-text-secondary hover:border-zad-gold/40'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {isAr ? 'خاص' : 'Special'}
            <span className="text-xs opacity-70">({categoryCounts.special})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'bg-zad-gold text-black'
                : 'bg-zad-surface border border-zad-border/60 text-text-secondary hover:border-zad-gold/40'
            }`}
          >
            <Star className="w-4 h-4" />
            {isAr ? 'المفضلة' : 'Favorites'}
            <span className="text-xs opacity-70">({categoryCounts.favorites})</span>
          </button>

          <button
            onClick={() => setActiveTab('recent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'recent'
                ? 'bg-zad-gold text-black'
                : 'bg-zad-surface border border-zad-border/60 text-text-secondary hover:border-zad-gold/40'
            }`}
          >
            <Clock className="w-4 h-4" />
            {isAr ? 'الأخيرة' : 'Recent'}
            <span className="text-xs opacity-70">({categoryCounts.recent})</span>
          </button>
        </div>
      </div>

      {/* Station List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-6">
        {/* Loading State */}
        {isLoadingStations && (
          <div className="space-y-3 mt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-zad-surface animate-pulse" />
            ))}
          </div>
        )}

        {/* Error State */}
        {fetchError && !isLoadingStations && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-400">{fetchError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-xs text-red-400 underline"
                >
                  {isAr ? 'إعادة المحاولة' : 'Try Again'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingStations && !fetchError && filteredStations.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <RadioIcon className="w-16 h-16 text-text-muted mb-4" />
            <p className="text-text-secondary">
              {searchQuery
                ? isAr
                  ? 'لم يتم العثور على محطات'
                  : 'No stations found'
                : activeTab === 'favorites'
                ? isAr
                  ? 'لا توجد محطات مفضلة'
                  : 'No favorite stations'
                : activeTab === 'recent'
                ? isAr
                  ? 'لا توجد محطات حديثة'
                  : 'No recent stations'
                : isAr
                ? 'لا توجد محطات متاحة'
                : 'No stations available'}
            </p>
          </div>
        )}

        {/* Stations */}
        {!isLoadingStations && !fetchError && filteredStations.length > 0 && (
          <div className="space-y-3 mt-4">
            {filteredStations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                isActive={activeStation?.id === station.id}
                isPlaying={activeStation?.id === station.id && isPlaying}
                isFavorite={favorites.includes(station.id)}
                onClick={() => handleStationClick(station)}
                onToggleFavorite={() => toggleFavorite(station.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
