import { NextResponse } from 'next/server';

const RADIO_API_URL = 'https://data-rosy.vercel.app/radio.json';

// Fallback radio stations in case the API fails
const FALLBACK_STATIONS = [
  {
    id: 1,
    name: "إذاعة مشاري العفاسي",
    url: "https://backup.qurango.net/radio/mishary_alafasi",
    img: "https://i1.sndcdn.com/artworks-000019055020-yr9cjc-t200x200.jpg"
  },
  {
    id: 2,
    name: "إذاعة ماهر المعيقلي",
    url: "https://backup.qurango.net/radio/maher",
    img: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts113/v4/4b/80/58/4b80582d-78ca-a466-0341-0869bc611745/mza_5280524847349008894.jpg/250x250bb.jpg"
  },
  {
    id: 3,
    name: "إذاعة عبدالباسط عبدالصمد",
    url: "https://backup.qurango.net/radio/abdulbasit_abdulsamad_mojawwad",
    img: "https://cdns-images.dzcdn.net/images/talk/06b711ac6da4cde0eb698e244f5e27b8/300x300.jpg"
  },
  {
    id: 4,
    name: "إذاعة القرآن الكريم من القاهرة",
    url: "https://n0e.radiojar.com/8s5u5tpdtwzuv?rj-ttl=5&rj-tok=AAABjW7yROAA0TUU8cXhXIAi6g",
    img: "https://apkdownmod.com/thumbnail?src=images/appsicon/2020/08/app-image-5f42ba68a61b1.jpg"
  }
];

export async function GET() {
  try {
    console.log('[Radio API] Fetching stations from:', RADIO_API_URL);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(RADIO_API_URL, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('[Radio API] Response not OK:', response.status);
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data || (!data.radios && !data.stations)) {
      console.error('[Radio API] Invalid response structure:', data);
      throw new Error('Invalid API response');
    }
    
    const stations = data.radios || data.stations || [];
    
    if (!Array.isArray(stations) || stations.length === 0) {
      console.error('[Radio API] No stations in response');
      throw new Error('No stations available');
    }
    
    console.log('[Radio API] Successfully fetched', stations.length, 'stations');
    return NextResponse.json({ radios: stations });
    
  } catch (error) {
    console.error('[Radio API] Error:', error);
    
    // Return fallback stations
    console.log('[Radio API] Returning fallback stations');
    return NextResponse.json({ 
      radios: FALLBACK_STATIONS,
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
