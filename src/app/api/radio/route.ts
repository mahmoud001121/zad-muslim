import { NextResponse } from 'next/server';

// Using the working radio data from islamic-radio-api
const RADIO_API_URL = 'https://raw.githubusercontent.com/uthumany/islamic-radio-api/main/server/radio_data.json';

export async function GET() {
  try {
    console.log('[Radio API] Fetching stations from:', RADIO_API_URL);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(RADIO_API_URL, {
      next: { revalidate: 3600 },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('[Radio API] Response not OK:', response.status);
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.radios) {
      console.error('[Radio API] Invalid response structure');
      throw new Error('Invalid API response');
    }
    
    const stations = data.radios;
    
    if (!Array.isArray(stations) || stations.length === 0) {
      console.error('[Radio API] No stations in response');
      throw new Error('No stations available');
    }
    
    console.log('[Radio API] Successfully fetched', stations.length, 'stations');
    return NextResponse.json({ radios: stations });
    
  } catch (error) {
    console.error('[Radio API] Error:', error);
    
    // Return minimal fallback
    return NextResponse.json({ 
      radios: [
        {
          id: 1,
          name: "إذاعة القرآن الكريم من القاهرة",
          url: "https://stream.radiojar.com/8s5u5tpdtwzuv",
          img: "https://apkdownmod.com/thumbnail?src=images/appsicon/2020/08/app-image-5f42ba68a61b1.jpg",
          nameEn: "Holy Quran Radio from Cairo",
          description: "Live Quran radio from Cairo",
          country: "Egypt",
          genres: ["Quran", "Islamic"],
          frequency: "FM 96.1"
        }
      ],
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 });
  }
}
