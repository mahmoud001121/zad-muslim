'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/settings-store';
import type { PrayerTimings, HijriDate, NextPrayer } from '@/types';

interface PrayerData {
  timings: PrayerTimings;
  date: { gregorian: string; hijri: HijriDate };
}

function calculateNextPrayer(timings: PrayerTimings): NextPrayer | null {
  const now = new Date();
  const prayerKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
  const prayerAr: Record<string, string> = {
    Fajr: 'الفجر',
    Dhuhr: 'الظهر',
    Asr: 'العصر',
    Maghrib: 'المغرب',
    Isha: 'العشاء',
  };

  for (const key of prayerKeys) {
    const timeStr = timings[key];
    if (!timeStr) continue;
    const cleaned = timeStr.replace(/\s*\(.*?\)/, '').trim();
    const parts = cleaned.split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) continue;
    const prayerTime = new Date();
    prayerTime.setHours(h, m, 0, 0);
    if (prayerTime > now) {
      return {
        name: key,
        nameAr: prayerAr[key],
        time: cleaned,
        remaining: prayerTime.getTime() - now.getTime(),
      };
    }
  }

  // All prayers passed — next is tomorrow's Fajr
  const fajrTime = timings.Fajr;
  if (fajrTime) {
    const cleaned = fajrTime.replace(/\s*\(.*?\)/, '').trim();
    const parts = cleaned.split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(h) && !isNaN(m)) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(h, m, 0, 0);
      return {
        name: 'Fajr',
        nameAr: 'الفجر',
        time: cleaned,
        remaining: tomorrow.getTime() - now.getTime(),
      };
    }
  }

  return null;
}

export function usePrayerTimes() {
  const { locationLat, locationLng, prayerMethod, madhab } = useSettingsStore();
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);

  const { data, isLoading, error, refetch } = useQuery<PrayerData>({
    queryKey: ['prayer-times', locationLat, locationLng, prayerMethod, madhab],
    queryFn: () => {
      if (!locationLat || !locationLng) throw new Error('No location');
      const params = new URLSearchParams({
        lat: String(locationLat),
        lng: String(locationLng),
        method: String(prayerMethod),
        school: String(madhab),
      });
      return fetch(`/api/prayer?${params}`).then((r) => r.json());
    },
    enabled: !!locationLat && !!locationLng,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  useEffect(() => {
    if (!data?.timings) {
      setNextPrayer(null);
      return;
    }
    
    // Initial calculation
    setNextPrayer(calculateNextPrayer(data.timings));

    // Update every second locally without hitting the server
    const interval = setInterval(() => {
      setNextPrayer(calculateNextPrayer(data.timings));
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.timings]);

  return {
    timings: data?.timings || null,
    hijriDate: data?.date?.hijri || null,
    gregorianDate: data?.date?.gregorian || null,
    nextPrayer,
    isLoading,
    error,
    refetch,
  };
}
