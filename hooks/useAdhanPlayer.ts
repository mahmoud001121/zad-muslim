'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useSettingsStore } from '@/store/settings-store';
import { TRANSLATIONS } from '@/lib/constants';

// Map adhan sound setting to actual audio file path
const ADHAN_FILES: Record<string, string> = {
  algeria: '/audio/adhan-algeria.mp3',
  makka: '/audio/adhan-makka.mp3',
  rashed: '/audio/adhan-rashed.mp3',
};

// Play a beautiful adhan-like tone using Web Audio API (fallback when no audio file)
function playDefaultAdhan() {
  console.log('[AdhanPlayer] Playing default Web Audio adhan');
  try {
    const ctx = new AudioContext();

    const playNote = (freq: number, startTime: number, duration: number, vol: number = 0.25) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.05);
      gain.gain.setValueAtTime(vol, startTime + duration - 0.1);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const t = ctx.currentTime;

    // Opening takbeer phrase
    playNote(261.63, t, 0.8, 0.3);
    playNote(329.63, t + 0.6, 0.6, 0.25);
    playNote(392.00, t + 1.0, 0.8, 0.25);
    playNote(523.25, t + 1.6, 1.2, 0.3);

    // Main melodic phrase
    playNote(392.00, t + 3.0, 0.8, 0.25);
    playNote(440.00, t + 3.6, 0.8, 0.25);
    playNote(523.25, t + 4.2, 1.0, 0.28);
    playNote(587.33, t + 5.0, 0.6, 0.22);
    playNote(523.25, t + 5.4, 1.2, 0.28);

    // Second phrase
    playNote(392.00, t + 7.0, 0.8, 0.25);
    playNote(523.25, t + 7.6, 1.2, 0.3);
    playNote(587.33, t + 8.6, 0.6, 0.22);
    playNote(659.25, t + 9.0, 1.5, 0.3);

    // Final resolve
    playNote(523.25, t + 10.8, 0.6, 0.25);
    playNote(587.33, t + 11.2, 0.6, 0.25);
    playNote(523.25, t + 11.6, 2.0, 0.35);

    setTimeout(() => ctx.close(), 15000);
  } catch {
    // Audio context not available
  }
}

const prayerArabic: Record<string, string> = {
  Fajr: '\u0627\u0644\u0641\u062C\u0631',
  Dhuhr: '\u0627\u0644\u0638\u0647\u0631',
  Asr: '\u0627\u0644\u0639\u0635\u0631',
  Maghrib: '\u0627\u0644\u0645\u063A\u0631\u0628',
  Isha: '\u0627\u0644\u0639\u0634\u0627\u0621',
};

export function useAdhanPlayer() {
  const { timings } = usePrayerTimes();
  const { adhanEnabled, adhanSound, isLoaded } = useSettingsStore();
  const notifiedPrayerRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Persistent audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.9;
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
      audio.src = '';
    };
  }, []);
  
  const playAdhanSound = useCallback((soundName: string) => {
    const audio = audioRef.current;
    if (!audio) return Promise.resolve(false);
    
    const filePath = ADHAN_FILES[soundName];
    if (!filePath) {
      console.log(`[AdhanPlayer] No file mapping for "${soundName}"`);
      return Promise.resolve(false);
    }
    
    audio.src = filePath;
    audio.currentTime = 0;
    
    return audio.play().then(() => true).catch((err) => {
      console.log(`[AdhanPlayer] ✗ play() rejected:`, err.message);
      return false;
    });
  }, []);
  
  const playAdhanTest = useCallback(() => {
    const currentSound = useSettingsStore.getState().adhanSound;
    console.log(`[AdhanPlayer] 🧪 TEST — sound setting: ${currentSound}`);
    
    window.dispatchEvent(
      new CustomEvent('adhan-playing', {
        detail: { prayerName: 'Test', prayerNameAr: '' },
      })
    );
    
    if (currentSound === 'default') {
      playDefaultAdhan();
    } else {
      playAdhanSound(currentSound).then((played) => {
        if (!played) {
          playDefaultAdhan();
        }
      });
    }
  }, [playAdhanSound]);
  
  const pauseAdhan = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
  }, []);

  const playAdhanPreview = useCallback((soundKey: string) => {
    if (soundKey === 'default') {
      playDefaultAdhan();
    } else {
      playAdhanSound(soundKey).then((played) => {
        if (!played) {
          playDefaultAdhan();
        }
      });
    }
  }, [playAdhanSound]);

  const triggerAdhan = useCallback(async (prayerName: string, prayerNameAr: string) => {
    const lang = useSettingsStore.getState().language;
    const t = TRANSLATIONS[lang];
    const currentSound = useSettingsStore.getState().adhanSound;

    console.log(`[AdhanPlayer] 🕌 ADHAN TRIGGERED for ${prayerNameAr} (${prayerName})`);

    // 1) Browser notification
    try {
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
        if (Notification.permission === 'granted') {
          const body = t.adhanNotifBody.replace('{prayer}', lang === 'ar' ? prayerNameAr : prayerName);
          new Notification(t.adhanNotifTitle, {
            body,
            icon: '/icon.png',
            tag: `adhan-${prayerName}`,
            requireInteraction: true,
          });
        }
      }
    } catch {}

    // 2) Play adhan sound
    if (currentSound === 'default') {
      playDefaultAdhan();
    } else {
      const played = await playAdhanSound(currentSound);
      if (!played) {
        console.log(`[AdhanPlayer] File failed, falling back to default tones`);
        playDefaultAdhan();
      }
    }

    // 3) Dispatch toast event
    window.dispatchEvent(
      new CustomEvent('adhan-playing', {
        detail: { prayerName, prayerNameAr },
      })
    );
  }, [playAdhanSound]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!adhanEnabled || !isLoaded || !timings) return undefined;

    console.log(`[AdhanPlayer] Active — checking every 15s, sound: ${adhanSound}`);

    const check = () => {
      const now = new Date();
      const prayerKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

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

        const diff = Math.abs(now.getTime() - prayerTime.getTime());

        // Within 30 seconds of prayer time
        if (diff <= 30000) {
          const dateKey = `${key}-${now.toDateString()}`;
          if (notifiedPrayerRef.current !== dateKey) {
            notifiedPrayerRef.current = dateKey;
            triggerAdhan(key, prayerArabic[key] || key);
          }
          return;
        }
      }

      // Reset at midnight
      const midnight = new Date();
      midnight.setHours(0, 5, 0, 0);
      if (now < midnight) {
        notifiedPrayerRef.current = null;
      }
    };

    check();
    timerRef.current = setInterval(check, 15 * 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [adhanEnabled, isLoaded, timings, triggerAdhan, adhanSound]);

  return { triggerAdhan, playAdhanTest, playAdhanPreview, pauseAdhan, isPlaying };
}
