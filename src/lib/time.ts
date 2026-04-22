export function parseTimeString(timeStr: string): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  const cleaned = timeStr.replace(/\s*\(.*?\)/, '').trim();
  const [h, m] = cleaned.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return { hours: h, minutes: m };
}

export function formatTime12Hour(hours: number, minutes: number, lang: 'ar' | 'en' = 'ar'): string {
  const period = hours >= 12 ? (lang === 'ar' ? 'م' : 'PM') : (lang === 'ar' ? 'ص' : 'AM');
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes.toString().padStart(2, '0')} ${period}`;
}
