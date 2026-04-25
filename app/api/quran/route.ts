import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/cache';

const QURAN_API = 'https://api.alquran.cloud/v1';

const SURAH_LIST_TTL = 24 * 60 * 60 * 1000;
const SURAH_DETAIL_TTL = 60 * 60 * 1000;
const PAGE_TTL = 60 * 60 * 1000;

interface AlquranSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action');

  try {
    if (action === 'surahs') {
      return await handleSurahsList();
    }

    if (action === 'surah') {
      const number = searchParams.get('number');
      return await handleSurahDetail(Number(number));
    }

    if (action === 'page') {
      const pageNumber = searchParams.get('pageNumber');
      return await handlePageDetail(Number(pageNumber));
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Fallback needed' }, { status: 200 });
  }
}

async function handleSurahsList() {
  const cacheKey = 'quran:all-surahs';
  const cached = getCached<AlquranSurah[]>(cacheKey, SURAH_LIST_TTL);
  if (cached) return NextResponse.json({ surahs: cached });

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${QURAN_API}/surah`, { next: { revalidate: 86400 }, signal: controller.signal });
    clearTimeout(id);
    if (response.ok) {
      const result = await response.json();
      setCache(cacheKey, result.data, SURAH_LIST_TTL);
      return NextResponse.json({ surahs: result.data });
    }
  } catch (e) {
    clearTimeout(id);
  }
  return NextResponse.json({ surahs: [] }, { status: 200 });
}

async function handleSurahDetail(surahNumber: number) {
  const cacheKey = `quran:surah:${surahNumber}`;
  const cached = getCached<any>(cacheKey, SURAH_DETAIL_TTL);
  if (cached) return NextResponse.json(cached);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const [arabic, translation] = await Promise.all([
      fetch(`${QURAN_API}/surah/${surahNumber}/quran-uthmani`, { next: { revalidate: 86400 }, signal: controller.signal }),
      fetch(`${QURAN_API}/surah/${surahNumber}/en.asad`, { next: { revalidate: 86400 }, signal: controller.signal }).catch(() => null),
    ]);
    clearTimeout(timeoutId);

    if (arabic.ok) {
      const arabicResult = await arabic.json();
      let translations: Record<number, string> = {};
      if (translation && translation.ok) {
        try {
          const translationResult = await translation.json();
          translations = translationResult.data.ayahs.reduce((acc: any, ayah: any) => {
            acc[ayah.number] = ayah.text;
            return acc;
          }, {});
        } catch {}
      }

      const { ayahs: arabicAyahs, ...surahMeta } = arabicResult.data;
      const ayahs = arabicAyahs.map((ayah: any) => ({
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        text: ayah.text,
        translation: translations[ayah.number] || undefined,
      }));

      const result = { surah: surahMeta, ayahs };
      setCache(cacheKey, result, SURAH_DETAIL_TTL);
      return NextResponse.json(result);
    }
  } catch (e) {
    clearTimeout(timeoutId);
  }
  return NextResponse.json({ surah: {}, ayahs: [] }, { status: 200 });
}

async function handlePageDetail(pageNumber: number) {
  const cacheKey = `quran:page:${pageNumber}`;
  const cached = getCached<any>(cacheKey, PAGE_TTL);
  if (cached) return NextResponse.json(cached);

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${QURAN_API}/page/${pageNumber}/quran-uthmani`, { next: { revalidate: 86400 }, signal: controller.signal });
    clearTimeout(id);

    if (response.ok) {
      const result = await response.json();
      const pageAyahs = result.data.ayahs;
      
      const ayahs = pageAyahs.map((ayah: any) => ({
        number: ayah.number,
        text: ayah.text,
        numberInSurah: ayah.numberInSurah,
        juz: ayah.juz,
        hizbQuarter: ayah.hizbQuarter,
        sajda: typeof ayah.sajda === 'object' ? (ayah.sajda.obligatory || ayah.sajda.recommended) : !!ayah.sajda,
        surah: ayah.surah,
      }));

      const surahStarts: AlquranSurah[] = [];
      for (const ayah of pageAyahs) {
        if (ayah.numberInSurah === 1 && ayah.surah) {
          if (!surahStarts.find((s) => s.number === ayah.surah.number)) {
            surahStarts.push(ayah.surah);
          }
        }
      }

      const data = { number: result.data.number, ayahs, surahStarts };
      setCache(cacheKey, data, PAGE_TTL);
      return NextResponse.json(data);
    }
  } catch (e) {
    clearTimeout(id);
  }
  return NextResponse.json({ number: pageNumber, ayahs: [], surahStarts: [] }, { status: 200 });
}
