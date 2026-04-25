import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const HADITH_API = 'https://hadis-api-id.vercel.app/hadith';

// Load fallback data dynamically to avoid slow compilation
let fallbackData: any[] | null = null;
async function getFallbackData(): Promise<any[]> {
  if (!fallbackData) {
    try {
      const filePath = join(process.cwd(), 'src/data/bukhari-150.json');
      const fileContent = await readFile(filePath, 'utf-8');
      fallbackData = JSON.parse(fileContent);
    } catch (error) {
      // Minimal fallback if file read fails
      fallbackData = [{
        textAr: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
        textEn: "Actions are judged by intentions",
        narrator: "الإمام البخاري",
        source: "صحيح البخاري",
        grade: "صحيح"
      }];
    }
  }
  return fallbackData || [];
}

const HADITH_COLLECTIONS = [
  { id: 'abu-dawud', nameAr: "سنن أبي داود", nameEn: "Sunan Abi Dawud", hadithsCount: 5274, description: "من أمهات كتب السنن" },
  { id: 'ahmad', nameAr: "مسند أحمد", nameEn: "Musnad Ahmad", hadithsCount: 26363, description: "أكبر كتب الحديث" },
  { id: 'darimi', nameAr: "سنن الدارمي", nameEn: "Sunan al-Darimi", hadithsCount: 3503, description: "من كتب السنن الهامة" },
  { id: 'bukhari', nameAr: "صحيح البخاري", nameEn: "Sahih Al-Bukhari", hadithsCount: 7285, description: "أصح كتب الحديث النبوي" },
  { id: 'muslim', nameAr: "صحيح مسلم", nameEn: "Sahih Muslim", hadithsCount: 5362, description: "أحد الصحيحين" },
  { id: 'nasai', nameAr: "سنن النسائي", nameEn: "Sunan An-Nasa'i", hadithsCount: 5758, description: "المجتبى من السنن" },
  { id: 'tirmidhi', nameAr: "سنن الترمذي", nameEn: "Sunan At-Tirmidhi", hadithsCount: 3956, description: "من كتب السنن المشهورة" },
  { id: 'ibnu-majah', nameAr: "سنن ابن ماجه", nameEn: "Sunan Ibn Majah", hadithsCount: 4341, description: "أحد كتب السنن الستة" },
  { id: 'malik', nameAr: "موطأ مالك", nameEn: "Muwatta Malik", hadithsCount: 1858, description: "من أقدم دواوين الحديث" },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const book = searchParams.get('book') || 'bukhari';
    const page = searchParams.get('page') || Math.floor(Math.random() * 50 + 1).toString();
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 6000); // 6s timeout for fast fallback

    try {
      const response = await fetch(`${HADITH_API}/${book}?page=${page}&limit=20`, {
        signal: controller.signal
      });
      clearTimeout(id);

      if (response.ok) {
        const result = await response.json();
        const items = result.items || [];
        const item = items[Math.floor(Math.random() * items.length)];

        if (item) {
          return NextResponse.json({
            daily: {
              textAr: item.arab,
              textEn: item.id,
              narrator: `حديث رقم ${item.number}`,
              source: HADITH_COLLECTIONS.find(c => c.id === book)?.nameAr || book,
              grade: "صحيح"
            },
            collections: HADITH_COLLECTIONS,
            items,
            totalHadiths: result.total
          });
        }
      }
    } catch (e) {
      // Silently fail and use fallback
      clearTimeout(id);
    }

    // High-quality local fallback containing 150 authentic hadiths
    const fallback = await getFallbackData();
    return NextResponse.json({
      daily: fallback[Math.floor(Math.random() * fallback.length)],
      collections: HADITH_COLLECTIONS,
      items: fallback,
      totalHadiths: fallback.length,
      isFallback: true
    });

  } catch (error) {
    const fallback = await getFallbackData();
    return NextResponse.json({
      daily: fallback[0],
      collections: HADITH_COLLECTIONS,
      items: fallback,
      totalHadiths: fallback.length,
      isFallback: true
    });
  }
}
