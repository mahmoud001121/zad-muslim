import { NextResponse } from 'next/server';

const RADIO_API_URL = 'https://data-rosy.vercel.app/radio.json';

export async function GET() {
  try {
    const response = await fetch(RADIO_API_URL, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) throw new Error('Failed to fetch from remote API');
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Radio API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch radio stations' }, { status: 500 });
  }
}
