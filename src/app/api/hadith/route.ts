import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Load fallback data dynamically
let fallbackData: any[] | null = null;
async function getFallbackData() {
  if (!fallbackData) {
    try {
      const filePath = join(process.cwd(), 'src/data/bukhari-150.json');
      const fileContent = await readFile(filePath, 'utf-8');
      fallbackData = JSON.parse(fileContent);
    } catch (error) {
      fallbackData = [{
        textAr: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
        textEn: "Actions are judged by intentions",
        narrator: "الإمام البخاري",
        source: "صحيح البخاري",
        grade: "صحيح"
      }];
    }
  }
  return fallbackData;
}

const HADITH_COLLECTIONS = [
  { 
    id: 'bukhari', 
    nameAr: "صحيح البخاري", 
    nameEn: "Sahih Al-Bukhari", 
    hadithsCount: 150, 
    description: "أصح كتب الحديث النبوي (متوفر)",
    available: true 
  },
  { 
    id: 'muslim', 
    nameAr: "صحيح مسلم", 
    nameEn: "Sahih Muslim", 
    hadithsCount: 5362, 
    description: "أحد الصحيحين (قريباً)",
    available: false 
  },
  { 
    id: 'abu-dawud', 
    nameAr: "سنن أبي داود", 
    nameEn: "Sunan Abi Dawud", 
    hadithsCount: 5274, 
    description: "من أمهات كتب السنن (قريباً)",
    available: false 
  },
  { 
    id: 'tirmidhi', 
    nameAr: "سنن الترمذي", 
    nameEn: "Sunan At-Tirmidhi", 
    hadithsCount: 3956, 
    description: "من كتب السنن المشهورة (قريباً)",
    available: false 
  },
  { 
    id: 'nasai', 
    nameAr: "سنن النسائي", 
    nameEn: "Sunan An-Nasa'i", 
    hadithsCount: 5758, 
    description: "المجتبى من السنن (قريباً)",
    available: false 
  },
  { 
    id: 'ibnu-majah', 
    nameAr: "سنن ابن ماجه", 
    nameEn: "Sunan Ibn Majah", 
    hadithsCount: 4341, 
    description: "أحد كتب السنن الستة (قريباً)",
    available: false 
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const book = searchParams.get('book') || 'bukhari';
    
    // Check if the requested book is available
    const collection = HADITH_COLLECTIONS.find(c => c.id === book);
    
    if (!collection?.available && book !== 'bukhari') {
      // Return message that this collection is not available yet
      return NextResponse.json({
        daily: {
          textAr: "هذه المجموعة غير متوفرة حالياً",
          textEn: "This collection is not available yet",
          narrator: "",
          source: collection?.nameAr || book,
          grade: ""
        },
        collections: HADITH_COLLECTIONS,
        items: [],
        totalHadiths: 0,
        notAvailable: true,
        message: "هذه المجموعة ستكون متاحة قريباً إن شاء الله"
      });
    }

    // Only Bukhari is available
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
