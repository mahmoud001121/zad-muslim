import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/cache';

const BASE = 'https://api.aladhan.com/v1';

function normalizeTimings(data: Record<string, unknown>) {
  const map: Record<string, string> = {};
  for (const [key, val] of Object.entries(data)) {
    if (['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Sunset', 'Maghrib', 'Isha', 'Midnight'].includes(key)) {
      let timeStr = '';
      if (typeof val === 'string') {
        timeStr = val;
      } else if (val && typeof val === 'object' && 'time' in val) {
        timeStr = String((val as { time: string }).time);
      }
      const cleaned = timeStr.replace(/\s*\(.*?\)\s*$/, '').trim();
      if (/^\d{1,2}:\d{2}$/.test(cleaned)) {
        map[key] = cleaned;
      }
    }
  }
  return map;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat') || '31.0421';
  const lng = searchParams.get('lng') || '31.3428';
  const method = searchParams.get('method') || '5';
  const school = Number(searchParams.get('school')) || 0;
  const monthly = searchParams.get('monthly');
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  try {
    if (monthly && year && month) {
      const cacheKey = `prayer-calendar-${lat}-${lng}-${method}-${school}-${year}-${month}`;
      const cached = getCached<unknown>(cacheKey, 24 * 60 * 60 * 1000);
      if (cached) return NextResponse.json(cached);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      try {
        const res = await fetch(
          `${BASE}/calendarByCity/${year}/${month}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`,
          { next: { revalidate: 86400 }, signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          setCache(cacheKey, data, 24 * 60 * 60 * 1000);
          return NextResponse.json(data);
        }
      } catch (e) {
        clearTimeout(timeoutId);
      }
      return NextResponse.json({ error: 'Fallback needed' }, { status: 200 });
    }

    const ts = Math.floor(Date.now() / 1000);
    const cacheKey = `prayer-today-${lat}-${lng}-${method}-${school}`;
    const cached = getCached<unknown>(cacheKey, 30 * 60 * 1000);
    if (cached) return NextResponse.json(cached);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    try {
      const res = await fetch(
        `${BASE}/timings/${ts}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`,
        { next: { revalidate: 1800 }, signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const timings = normalizeTimings(data.data.timings);
        const hijri = data.data.date.hijri;
        const gregorian = data.data.date.gregorian;

        const result = {
          timings,
          date: {
            gregorian: `${gregorian.day} ${gregorian.month.en} ${gregorian.year}`,
            hijri: {
              day: hijri.day,
              month: String(hijri.month.number),
              monthAr: hijri.month.ar,
              monthEn: hijri.month.en,
              year: hijri.year,
              designation: hijri.designation,
              weekday: hijri.weekday,
            },
          },
          meta: data.data.meta,
        };

        setCache(cacheKey, result, 30 * 60 * 1000);
        return NextResponse.json(result);
      }
    } catch (e) {
      clearTimeout(timeoutId);
    }

    // Default static fallback to prevent 500 errors
    return NextResponse.json({
      timings: {
        Fajr: "04:00",
        Sunrise: "05:30",
        Dhuhr: "12:00",
        Asr: "15:30",
        Sunset: "18:30",
        Maghrib: "18:30",
        Isha: "20:00"
      },
      date: {
        gregorian: "01 Jan 2025",
        hijri: {
          day: "01",
          month: "09",
          monthAr: "رمضان",
          monthEn: "Ramadan",
          year: "1446",
          designation: { abbreviated: "AH", expanded: "Anno Hegirae" },
          weekday: { en: "Friday", ar: "الجمعة" }
        }
      },
      meta: { timezone: "Africa/Cairo" },
      isFallback: true
    });
  } catch (error) {
    return NextResponse.json({
      timings: { Fajr: "04:00", Sunrise: "05:30", Dhuhr: "12:00", Asr: "15:30", Sunset: "18:30", Maghrib: "18:30", Isha: "20:00" },
      date: { gregorian: "01 Jan 2025", hijri: { day: "01", month: "09", monthAr: "رمضان", monthEn: "Ramadan", year: "1446", designation: { abbreviated: "AH", expanded: "Anno Hegirae" }, weekday: { en: "Friday", ar: "الجمعة" } } },
      meta: { timezone: "Africa/Cairo" },
      isFallback: true
    });
  }
}
