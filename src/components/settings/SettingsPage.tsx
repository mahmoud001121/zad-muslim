'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Globe,
  Moon,
  Sun,
  Compass,
  Scale,
  Headphones,
  Type,
  ChevronDown,
  Info,
  RotateCcw,
  Bell,
  Volume2,
  BellRing,
  Check,
  X,
  CheckCircle2,
  MapPin,
  Search,
  Loader2,
  Clock,
  AlertCircle,
  Play,
  Pause,
} from 'lucide-react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS, RECITERS, PRAYER_METHODS, MADHAB_OPTIONS, ADHAN_SOUNDS, SALAWAT_INTERVALS } from '@/lib/constants';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAdhanPlayer } from '@/hooks/useAdhanPlayer';

// Popular Egyptian cities
const POPULAR_CITIES = [
  { name: 'القاهرة', nameEn: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { name: 'الإسكندرية', nameEn: 'Alexandria', lat: 31.2001, lng: 29.9187 },
  { name: 'الجيزة', nameEn: 'Giza', lat: 30.0131, lng: 31.2089 },
  { name: 'المنصورة', nameEn: 'Mansoura', lat: 31.0409, lng: 31.3785 },
  { name: 'طنطا', nameEn: 'Tanta', lat: 30.7865, lng: 31.0004 },
  { name: 'أسيوط', nameEn: 'Asyut', lat: 27.1809, lng: 31.1837 },
];

// ─── Animation Variants ────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" },
  }),
} as const;

const drawerVariants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { y: '100%', transition: { ease: 'easeInOut', duration: 0.2 } },
};

// ─── Sub-components ────────────────────────────────────────────────────

function SectionHeader({ icon, title, lang }: { icon: React.ReactNode; title: string; lang: 'ar' | 'en' }) {
  const isAr = lang === 'ar';
  return (
    <div className={`flex items-center gap-3 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
      <div className="p-3 rounded-xl bg-zad-gold/15 border border-zad-gold/30 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className={`text-lg font-bold text-text-primary arabic-display ${isAr ? 'text-right' : 'text-left'}`}>
          {title}
        </h3>
        <div className="h-px bg-gradient-to-r from-zad-gold/50 via-zad-gold/20 to-transparent mt-2" />
      </div>
    </div>
  );
}

function SettingCard({ children, index, lang, className = "" }: { children: React.ReactNode; index: number; lang: 'ar' | 'en'; className?: string }) {
  const isAr = lang === 'ar';
  return (
    <motion.div
      custom={index}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={`border border-zad-border/60 bg-zad-surface rounded-xl px-5 py-4 flex items-center justify-between gap-4 shadow-lg hover:border-zad-gold/40 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 ${
        isAr ? 'flex-row-reverse text-right' : 'text-left'
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SelectionDrawer({
  label,
  value,
  options,
  lang,
  onSelect,
}: {
  label: string;
  value: string | number;
  options: { value: string | number; name: string; nameAr: string }[];
  lang: 'ar' | 'en';
  onSelect: (value: string | number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isAr = lang === 'ar';

  const selectedOption = useMemo(() => 
    options.find((o) => o.value === value), 
  [value, options]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zad-surface border border-zad-border/60 text-sm font-medium text-text-secondary hover:border-zad-gold/40 hover:text-text-primary transition-all"
      >
        <span className="truncate max-w-[120px]">
          {selectedOption ? (isAr ? selectedOption.nameAr : selectedOption.name) : label}
        </span>
        <ChevronDown className="w-4 h-4 shrink-0 opacity-60" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-x-0 bottom-0 z-[70] bg-zad-navy border-t border-zad-border/60 rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col"
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <div className="flex justify-center p-4">
                <div className="w-12 h-1.5 rounded-full bg-zad-border" />
              </div>
              <div className="px-6 pb-4 flex items-center justify-between border-b border-zad-border/40">
                <h4 className="text-lg font-bold text-text-primary arabic-display">{label}</h4>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full bg-zad-surface hover:bg-zad-border transition-colors">
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                {options.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={String(opt.value)}
                      onClick={() => {
                        onSelect(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all ${
                        isSelected 
                          ? 'bg-zad-gold/20 border-2 border-zad-gold text-zad-gold' 
                          : 'bg-zad-surface border border-zad-border/60 text-text-secondary hover:bg-zad-surface/80 hover:border-zad-gold/30'
                      }`}
                    >
                      <span className={`text-base ${isSelected ? 'font-bold' : 'font-medium'}`}>
                        {isAr ? opt.nameAr : opt.name}
                      </span>
                      {isSelected && <Check className="w-5 h-5" />}
                    </button>
                  );
                })}
              </div>
              <div className="h-8" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ToggleSwitch({
  enabled,
  onToggle,
  activeLabel,
  inactiveLabel,
}: {
  enabled: boolean;
  onToggle: () => void;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="relative flex items-center rounded-full bg-zad-surface border border-zad-border/60 p-1 min-w-[100px] h-9 hover:border-zad-gold/40 transition-all"
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`absolute w-[calc(50%-4px)] h-[calc(100%-8px)] rounded-full ${
          enabled ? 'bg-zad-gold shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'bg-zad-border'
        }`}
        style={{ left: enabled ? 'calc(50% + 2px)' : '4px' }}
      />
      <span className={`relative z-10 flex-1 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${enabled ? 'text-text-muted' : 'text-text-primary'}`}>
        {inactiveLabel}
      </span>
      <span className={`relative z-10 flex-1 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${enabled ? 'text-text-primary' : 'text-text-muted'}`}>
        {activeLabel}
      </span>
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

export default function SettingsPage({ onBack }: { onBack?: () => void }) {
  const { 
    language, theme, prayerMethod, madhab, reciterId, quranFontSize, 
    salawatEnabled, salawatInterval, prayerReminderEnabled, prayerReminderMinutes, 
    adhanEnabled, adhanSound, updateSettings, resetSettings, locationName, setLocation
  } = useSettingsStore();

  const { subscribed, loading: pushLoading, subscribe, unsubscribe, updateSubscription } = usePushNotifications();
  const { requestLocation, isLoading: geoLoading, error: geoError } = useGeolocation();
  const { playAdhanPreview, pauseAdhan, isPlaying: adhanIsPlaying } = useAdhanPlayer();

  const [searchCity, setSearchCity] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{lat: string, lon: string, display_name: string}[]>([]);
  const [locationHistory, setLocationHistory] = useState<Array<{ lat: number; lng: number; name: string }>>([]);
  const [showLocationHistory, setShowLocationHistory] = useState(false);
  const [showPopularCities, setShowPopularCities] = useState(false);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Collapsible section states
  const [locationExpanded, setLocationExpanded] = useState(true);
  const [languageExpanded, setLanguageExpanded] = useState(true);
  const [prayerExpanded, setPrayerExpanded] = useState(true);
  const [notificationsExpanded, setNotificationsExpanded] = useState(true);
  const [quranExpanded, setQuranExpanded] = useState(true);

  const t = TRANSLATIONS[language];
  const isAr = language === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  // Load location history on mount
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('locationHistory') || '[]');
      setLocationHistory(history);
    } catch (e) {
      console.warn('Failed to load location history', e);
    }
  }, []);

  // Load/save collapsible section states
  useEffect(() => {
    try {
      const saved = localStorage.getItem('settingsExpanded');
      if (saved) {
        const parsed = JSON.parse(saved);
        setLocationExpanded(parsed.location ?? true);
        setLanguageExpanded(parsed.language ?? true);
        setPrayerExpanded(parsed.prayer ?? true);
        setNotificationsExpanded(parsed.notifications ?? true);
        setQuranExpanded(parsed.quran ?? true);
      }
    } catch (e) {
      console.warn('Failed to load section states', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('settingsExpanded', JSON.stringify({
        location: locationExpanded,
        language: languageExpanded,
        prayer: prayerExpanded,
        notifications: notificationsExpanded,
        quran: quranExpanded,
      }));
    } catch (e) {
      console.warn('Failed to save section states', e);
    }
  }, [locationExpanded, languageExpanded, prayerExpanded, notificationsExpanded, quranExpanded]);

  // Auto-update push subscription when notification settings change
  useEffect(() => {
    if (subscribed) {
      updateSubscription();
    }
    
    // Update SW settings cache
    if ('caches' in window) {
      try {
        const data = { adhanEnabled, reminderEnabled: prayerReminderEnabled, reminderMinutes: prayerReminderMinutes, salawatEnabled, salawatInterval };
        caches.open('zad-muslim-cache').then(c => {
          c.put('/api/settings-cache', new Response(JSON.stringify(data)));
        });
      } catch {}
    }
  }, [subscribed, adhanEnabled, prayerReminderEnabled, prayerReminderMinutes, salawatEnabled, salawatInterval, updateSubscription]);

  const handlePushToggle = useCallback(async () => {
    if (subscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  }, [subscribed, subscribe, unsubscribe]);

  const handleCitySearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    setShowLocationHistory(false);
    setShowPopularCities(false);
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=8&accept-language=${language === 'ar' ? 'ar' : 'en'}`, {
        headers: { 'User-Agent': 'Zad-Muslim-App/1.2' }
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("City search failed", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchCity(value);
    
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    
    if (value.trim().length === 0) {
      setSearchResults([]);
      setShowLocationHistory(false);
      setShowPopularCities(false);
      return;
    }
    
    const timer = setTimeout(() => {
      handleCitySearch(value);
    }, 500);
    
    setSearchDebounceTimer(timer);
  };

  const selectCity = (lat: number, lng: number, name: string) => {
    setLocation(lat, lng, name);
    setSearchResults([]);
    setSearchCity('');
    setShowLocationHistory(false);
    setShowPopularCities(false);
    
    // Reload location history
    try {
      const history = JSON.parse(localStorage.getItem('locationHistory') || '[]');
      setLocationHistory(history);
    } catch (e) {
      console.warn('Failed to reload location history', e);
    }
  };

  const handleLanguageToggle = useCallback(() => updateSettings({ language: isAr ? 'en' : 'ar' }), [isAr, updateSettings]);
  const handleThemeToggle = useCallback(() => updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' }), [theme, updateSettings]);

  return (
    <div dir={dir} className="h-full flex flex-col bg-zad-midnight">
      {/* ─── Premium Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-6 pb-4 flex items-center justify-between"
      >
        <div className={`flex items-center gap-4 ${isAr ? 'flex-row' : ''}`}>
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-zad-surface border border-zad-border text-text-secondary hover:text-zad-gold hover:border-zad-gold/30 transition-all"
            >
              {isAr ? <ArrowRight className="w-5 h-5" /> : <ArrowRight className="w-5 h-5 rotate-180" />}
            </button>
          )}
          <h1 className="text-2xl font-black gold-text arabic-display tracking-tight">
            {t.settings}
          </h1>
        </div>
        <button
          onClick={resetSettings}
          className="p-2.5 rounded-xl bg-zad-surface border border-zad-border text-text-muted hover:text-red-400 hover:border-red-400/30 transition-all"
          title={t.reset}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </motion.div>

      {/* ─── Scrollable Content ─── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-12 space-y-10 max-w-3xl mx-auto w-full">
        
        {/* Location Section */}
        <section>
          <button 
            onClick={() => setLocationExpanded(!locationExpanded)}
            className="w-full flex items-center justify-between mb-4 group"
          >
            <div className="flex-1">
              <SectionHeader icon={<MapPin className="w-5 h-5" />} title={isAr ? 'الموقع' : 'Location'} lang={language} />
            </div>
            <ChevronDown className={`w-5 h-5 text-text-muted transition-transform duration-200 group-hover:text-zad-gold ${locationExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {locationExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-3">
                  <SettingCard index={-1} lang={language}>
                    <div className={`flex items-center gap-3 flex-1 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 rounded-xl bg-zad-gold/15 border border-zad-gold/30 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-zad-gold" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text-primary">{isAr ? 'موقعك الحالي' : 'Current City'}</p>
                        <p className="text-xs text-zad-gold font-medium">{locationName}</p>
                        {geoError && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3 text-red-400" />
                            <p className="text-[10px] text-red-400">{isAr ? 'فشل التحديد التلقائي' : 'Auto-detect failed'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={requestLocation}
                      disabled={geoLoading}
                      className="px-4 py-2 rounded-lg bg-zad-gold/20 border border-zad-gold/40 text-xs font-bold text-zad-gold uppercase tracking-wider hover:bg-zad-gold/30 disabled:opacity-50 transition-all"
                    >
                      {geoLoading ? (isAr ? 'جاري...' : 'LOCATING...') : (isAr ? 'تحديد تلقائي' : 'AUTO DETECT')}
                    </button>
                  </SettingCard>

                  {/* Search Input */}
                  <div className="relative">
                    <div className="relative group">
                      <input 
                        type="text" 
                        value={searchCity}
                        onChange={(e) => handleSearchInputChange(e.target.value)}
                        onFocus={() => {
                          if (searchCity.trim().length === 0 && locationHistory.length > 0) {
                            setShowLocationHistory(true);
                          }
                        }}
                        placeholder={isAr ? 'ابحث عن مدينتك يدوياً...' : 'Search for your city...'}
                        className="w-full h-12 px-4 pr-10 bg-zad-surface border border-zad-border/60 rounded-xl text-sm text-text-primary focus:outline-none focus:border-zad-gold/60 focus:ring-2 focus:ring-zad-gold/20 transition-all"
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center text-text-muted pointer-events-none">
                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      </div>
                      {searchCity && (
                        <button
                          onClick={() => {
                            setSearchCity('');
                            setSearchResults([]);
                            setShowLocationHistory(false);
                            setShowPopularCities(false);
                          }}
                          className="absolute inset-y-0 left-3 flex items-center text-text-muted hover:text-text-primary"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

              {/* Search Results */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-20 w-full mt-2 bg-zad-surface border border-zad-border/60 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto custom-scrollbar"
                  >
                    <div className="px-4 py-2 border-b border-zad-border/40 bg-zad-navy">
                      <p className="text-xs text-text-muted font-medium">
                        {isAr ? `${searchResults.length} نتيجة` : `${searchResults.length} results`}
                      </p>
                    </div>
                    {searchResults.map((city, i) => (
                      <button 
                        key={i} 
                        onClick={() => selectCity(parseFloat(city.lat), parseFloat(city.lon), city.display_name.split(',').slice(0, 2).join(', '))}
                        className="w-full px-4 py-3 text-left text-sm text-text-secondary hover:bg-zad-gold/10 hover:text-text-primary border-b border-zad-border/30 last:border-0 transition-colors"
                      >
                        {city.display_name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Location History */}
              <AnimatePresence>
                {showLocationHistory && locationHistory.length > 0 && searchResults.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-20 w-full mt-2 bg-zad-surface border border-zad-border/60 rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-zad-border/40 bg-zad-navy flex items-center gap-2">
                      <Clock className="w-3 h-3 text-text-muted" />
                      <p className="text-xs text-text-muted font-medium">
                        {isAr ? 'المواقع السابقة' : 'Recent Locations'}
                      </p>
                    </div>
                    {locationHistory.map((loc, i) => (
                      <button 
                        key={i} 
                        onClick={() => selectCity(loc.lat, loc.lng, loc.name)}
                        className="w-full px-4 py-3 text-left text-sm text-text-secondary hover:bg-zad-gold/10 hover:text-text-primary border-b border-zad-border/30 last:border-0 transition-colors"
                      >
                        {loc.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* No Results Message */}
              {searchCity.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className="mt-2 px-4 py-3 bg-zad-surface/50 border border-zad-border/60 rounded-xl text-center">
                  <p className="text-sm text-text-muted">
                    {isAr ? 'لم يتم العثور على نتائج. حاول مرة أخرى.' : 'No results found. Try again.'}
                  </p>
                </div>
              )}
            </div>

            {/* Popular Cities - Show when no search */}
            {!searchCity && !showLocationHistory && searchResults.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-text-muted font-medium px-1">
                  {isAr ? 'مدن شائعة' : 'Popular Cities'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_CITIES.map((city, i) => (
                    <button
                      key={i}
                      onClick={() => selectCity(city.lat, city.lng, language === 'ar' ? city.name : city.nameEn)}
                      className="rounded-lg border border-zad-border/60 bg-zad-surface px-4 py-3 text-sm text-text-secondary font-medium hover:bg-zad-gold/10 hover:border-zad-gold/40 hover:text-text-primary transition-all duration-200"
                    >
                      {language === 'ar' ? city.name : city.nameEn}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </section>

        {/* Language Section */}
        <section>
          <button 
            onClick={() => setLanguageExpanded(!languageExpanded)}
            className="w-full flex items-center justify-between mb-4 group"
          >
            <div className="flex-1">
              <SectionHeader icon={<Globe className="w-5 h-5" />} title={isAr ? 'اللغة' : 'Language'} lang={language} />
            </div>
            <ChevronDown className={`w-5 h-5 text-text-muted transition-transform duration-200 group-hover:text-zad-gold ${languageExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {languageExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-3">
                  <SettingCard index={0} lang={language}>
                    <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 rounded-xl bg-zad-gold/15 border border-zad-gold/30 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-zad-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{t.language}</p>
                      </div>
                    </div>
                    <ToggleSwitch enabled={isAr} onToggle={handleLanguageToggle} activeLabel="عربي" inactiveLabel="EN" />
                  </SettingCard>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Prayer Settings Section */}
        <section>
          <button 
            onClick={() => setPrayerExpanded(!prayerExpanded)}
            className="w-full flex items-center justify-between mb-4 group"
          >
            <div className="flex-1">
              <SectionHeader icon={<Compass className="w-5 h-5" />} title={t.prayer} lang={language} />
            </div>
            <ChevronDown className={`w-5 h-5 text-text-muted transition-transform duration-200 group-hover:text-zad-gold ${prayerExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {prayerExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-3">
                  <SettingCard index={2} lang={language}>
                    <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 rounded-xl bg-zad-gold/15 border border-zad-gold/30 flex items-center justify-center">
                        <Compass className="w-5 h-5 text-zad-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{t.method}</p>
                      </div>
                    </div>
                    <SelectionDrawer
                      label={t.method}
                      value={prayerMethod}
                      options={PRAYER_METHODS}
                      lang={language}
                      onSelect={(v) => updateSettings({ prayerMethod: v as number })}
                    />
                  </SettingCard>

                  <SettingCard index={3} lang={language}>
                    <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 rounded-xl bg-zad-gold/15 border border-zad-gold/30 flex items-center justify-center">
                        <Scale className="w-5 h-5 text-zad-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{t.madhab}</p>
                      </div>
                    </div>
                    <SelectionDrawer
                      label={t.madhab}
                      value={madhab}
                      options={MADHAB_OPTIONS}
                      lang={language}
                      onSelect={(v) => updateSettings({ madhab: v as 0 | 1 })}
                    />
                  </SettingCard>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Push Notifications Section */}
        <section>
          <button 
            onClick={() => setNotificationsExpanded(!notificationsExpanded)}
            className="w-full flex items-center justify-between mb-4 group"
          >
            <div className="flex-1">
              <SectionHeader icon={<BellRing className="w-5 h-5" />} title={t.pushNotifications} lang={language} />
            </div>
            <ChevronDown className={`w-5 h-5 text-text-muted transition-transform duration-200 group-hover:text-zad-gold ${notificationsExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {notificationsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-3">
                  <SettingCard index={4} lang={language}>
                    <div className={`flex flex-col gap-1 flex-1 ${isAr ? 'text-right' : 'text-left'}`}>
                      <p className="text-sm font-semibold text-text-primary">{t.pushNotifications}</p>
                      <p className="text-xs text-text-muted leading-tight">{t.pushDescription}</p>
                      {subscribed && (
                        <div className="inline-flex items-center gap-1 mt-1 text-zad-green font-bold text-[9px] uppercase tracking-wider">
                          <CheckCircle2 size={10} /> {t.pushSubscribed}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      {pushLoading ? (
                        <div className="w-10 h-5 rounded-full bg-zad-surface animate-pulse" />
                      ) : (
                        <ToggleSwitch enabled={subscribed} onToggle={handlePushToggle} activeLabel="ON" inactiveLabel="OFF" />
                      )}
                    </div>
                  </SettingCard>

                  <SettingCard index={5} lang={language}>
                    <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 rounded-xl bg-zad-gold/15 border border-zad-gold/30 flex items-center justify-center">
                        <Volume2 className="w-5 h-5 text-zad-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{isAr ? 'صوت الأذان' : 'Adhan Sound'}</p>
                      </div>
                    </div>
                    <ToggleSwitch enabled={adhanEnabled} onToggle={() => updateSettings({ adhanEnabled: !adhanEnabled })} activeLabel="ON" inactiveLabel="OFF" />
                  </SettingCard>

                  {adhanEnabled && (
                    <SettingCard index={6} lang={language}>
                      <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <div className="w-10 h-10 rounded-xl bg-zad-gold/15 border border-zad-gold/30 flex items-center justify-center">
                          <Headphones className="w-5 h-5 text-zad-gold" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{isAr ? 'نوع الأذان' : 'Muezzin'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adhanIsPlaying ? pauseAdhan() : playAdhanPreview(adhanSound)}
                          className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
                            adhanIsPlaying
                              ? 'bg-zad-gold/20 border-zad-gold text-zad-gold'
                              : 'bg-zad-surface border-zad-border/60 text-text-secondary hover:border-zad-gold/40 hover:text-zad-gold'
                          }`}
                        >
                          {adhanIsPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <SelectionDrawer
                          label={isAr ? 'اختر المؤذن' : 'Choose Adhan'}
                          value={adhanSound}
                          options={ADHAN_SOUNDS}
                          lang={language}
                          onSelect={(v) => {
                            const key = v as string;
                            updateSettings({ adhanSound: key });
                            pauseAdhan();
                            playAdhanPreview(key);
                          }}
                        />
                      </div>
                    </SettingCard>
                  )}

                  {/* Salawat Sound Toggle */}
                  <SettingCard index={7} lang={language}>
                    <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 rounded-xl bg-zad-gold/15 border border-zad-gold/30 flex items-center justify-center">
                        <Volume2 className="w-5 h-5 text-zad-gold" />
                      </div>
                      <div className={`flex-1 ${isAr ? 'text-right' : 'text-left'}`}>
                        <p className="text-sm font-semibold text-text-primary">{t.salawatSound}</p>
                        <p className="text-xs text-text-muted">{t.salawatIntervalDesc}</p>
                      </div>
                    </div>
                    <ToggleSwitch 
                      enabled={salawatEnabled} 
                      onToggle={() => updateSettings({ salawatEnabled: !salawatEnabled })} 
                      activeLabel="ON" 
                      inactiveLabel="OFF" 
                    />
                  </SettingCard>

                  {/* Salawat Interval Selector - shown only when enabled */}
                  {salawatEnabled && (
                    <SettingCard index={8} lang={language}>
                      <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <div className="w-10 h-10 rounded-xl bg-zad-gold/15 border border-zad-gold/30 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-zad-gold" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{t.salawatInterval}</p>
                        </div>
                      </div>
                      <SelectionDrawer
                        label={t.chooseSalawatInterval}
                        value={salawatInterval}
                        options={SALAWAT_INTERVALS}
                        lang={language}
                        onSelect={(v) => updateSettings({ salawatInterval: v as number })}
                      />
                    </SettingCard>
                  )}
                  </div>
                </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Quran Settings */}
        <section>
          <button 
            onClick={() => setQuranExpanded(!quranExpanded)}
            className="w-full flex items-center justify-between mb-4 group"
          >
            <div className="flex-1">
              <SectionHeader icon={<Headphones className="w-5 h-5" />} title={t.quran} lang={language} />
            </div>
            <ChevronDown className={`w-5 h-5 text-text-muted transition-transform duration-200 group-hover:text-zad-gold ${quranExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {quranExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-3">
                  <SettingCard index={7} lang={language}>
                    <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 rounded-xl bg-zad-gold/15 border border-zad-gold/30 flex items-center justify-center">
                        <Type className="w-5 h-5 text-zad-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{t.fontSize}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateSettings({ quranFontSize: Math.max(16, quranFontSize - 2) })} className="w-8 h-8 rounded-lg bg-zad-surface border border-zad-border/60 text-text-primary font-bold hover:border-zad-gold/40 transition-all">-</button>
                      <span className="text-sm font-mono text-zad-gold min-w-[24px] text-center font-bold">{quranFontSize}</span>
                      <button onClick={() => updateSettings({ quranFontSize: Math.min(48, quranFontSize + 2) })} className="w-8 h-8 rounded-lg bg-zad-surface border border-zad-border/60 text-text-primary font-bold hover:border-zad-gold/40 transition-all">+</button>
                    </div>
                  </SettingCard>

                  <SettingCard index={8} lang={language}>
                    <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 rounded-xl bg-zad-gold/15 border border-zad-gold/30 flex items-center justify-center">
                        <Headphones className="w-5 h-5 text-zad-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{t.reciter}</p>
                      </div>
                    </div>
                    <SelectionDrawer
                      label={t.selectReciter}
                      value={reciterId}
                      options={RECITERS.map(r => ({ ...r, value: r.id }))}
                      lang={language}
                      onSelect={(v) => updateSettings({ reciterId: v as string })}
                    />
                  </SettingCard>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <motion.div custom={10} variants={fadeInUp} initial="hidden" animate="visible" className="pt-6 text-center">
           <div className="inline-block px-4 py-2 rounded-2xl bg-zad-surface/30 border border-zad-border/40">
              <p className="text-xs text-text-muted arabic-display">زاد Muslim — الإصدار 1.2.5</p>
           </div>
        </motion.div>
      </div>
    </div>
  );
}
