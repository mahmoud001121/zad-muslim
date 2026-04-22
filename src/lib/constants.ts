import type { UserSettings, Reciter, AppTab } from "@/types";

export const DEFAULT_SETTINGS: UserSettings = {
  language: "ar",
  theme: "dark",
  prayerMethod: 5,
  madhab: 0,
  reciterId: "ar.alafasy",
  quranFontSize: 24,
  translationLang: "ar",
  locationLat: 31.0421,
  locationLng: 31.3428,
  locationName: "المنصورة",
  notificationsEnabled: true,
  eyeComfort: false,
  salawatEnabled: true,
  salawatInterval: 15,
  prayerReminderEnabled: true,
  prayerReminderMinutes: 10,
  adhanEnabled: true,
  adhanSound: "rashed",
  pushEnabled: true,
};

export const TRANSLATIONS = {
  ar: {
    home: "الرئيسية",
    quran: "القرآن",
    prayer: "الصلاة",
    azkar: "الأذكار",
    more: "المزيد",
    fajr: "الفجر",
    dhuhr: "الظهر",
    asr: "العصر",
    maghrib: "المغرب",
    isha: "العشاء",
    sunrise: "الشروق",
    nextPrayer: "الصلاة القادمة",
    remaining: "متبقي",
    settings: "الإعدادات",
    language: "اللغة",
    theme: "المظهر",
    dark: "داكن",
    light: "فاتح",
    method: "طريقة الحساب",
    madhab: "المذهب",
    reciter: "القاريء",
    selectReciter: "اختر القاريء",
    fontSize: "حجم الخط",
    reset: "إعادة ضبط الإعدادات",
    greeting: "السلام عليكم",
    tagline: "زادك في طريق الإيمان",
    appName: "زاد Muslim",
    noResults: "لا توجد نتائج",
    back: "رجوع",
    pushNotifications: "الإشعارات الفورية",
    pushSubscribed: "أنت مشترك في الإشعارات الفورية",
    pushNotSupported: "متصفحك لا يدعم الإشعارات الفورية",
    pushDescription: "احصل على تنبيهات الأذان، تذكيرات الصلاة، والذكر اليومي مباشرة على جهازك.",
    adhanNotifTitle: "حان الآن موعد صلاة {prayer}",
    adhanNotifBody: "حي على الصلاة، حي على الفلاح",
    eyeComfort: "وضع حماية العين",
    salawatSound: "صوت الصلاة على النبي",
    salawatInterval: "فترة التكرار",
    salawatIntervalDesc: "المدة الزمنية بين كل صوت",
    chooseSalawatInterval: "اختر الفترة الزمنية",
  },
  en: {
    home: "Home",
    quran: "Quran",
    prayer: "Prayer",
    azkar: "Azkar",
    more: "More",
    fajr: "Fajr",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
    sunrise: "Sunrise",
    nextPrayer: "Next Prayer",
    remaining: "Remaining",
    settings: "Settings",
    language: "Language",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    method: "Calculation Method",
    madhab: "School (Madhab)",
    reciter: "Reciter",
    selectReciter: "Select Reciter",
    fontSize: "Font Size",
    reset: "Reset Settings",
    greeting: "Assalamu Alaikum",
    tagline: "Your companion on the path of faith",
    appName: "Zad Muslim",
    noResults: "No results found",
    back: "Back",
    pushNotifications: "Push Notifications",
    pushSubscribed: "You are subscribed to push notifications",
    pushNotSupported: "Your browser does not support push notifications",
    salawatSound: "Salawat Sound",
    salawatInterval: "Repeat Interval",
    salawatIntervalDesc: "Time between each sound",
    chooseSalawatInterval: "Choose Interval",
    pushDescription: "Get adhan alerts, prayer reminders, and daily dhikr directly on your device.",
    adhanNotifTitle: "It is now time for {prayer}",
    adhanNotifBody: "Hurry to prayer, hurry to success",
    eyeComfort: "Eye Comfort Mode",
  },
};

export const PRAYER_META = [
  { key: 'Fajr', name: 'Fajr', nameAr: 'الفجر', icon: 'Sun' },
  { key: 'Dhuhr', name: 'Dhuhr', nameAr: 'الظهر', icon: 'SunMedium' },
  { key: 'Asr', name: 'Asr', nameAr: 'العصر', icon: 'CloudSun' },
  { key: 'Maghrib', name: 'Maghrib', nameAr: 'المغرب', icon: 'Sunset' },
  { key: 'Isha', name: 'Isha', nameAr: 'العشاء', icon: 'Moon' },
];

export const PRAYER_METHODS = [
  { value: 1, name: "University of Islamic Sciences, Karachi", nameAr: "جامعة العلوم الإسلامية، كراتشي" },
  { value: 2, name: "Islamic Society of North America", nameAr: "الجمعية الإسلامية لأمريكا الشمالية" },
  { value: 3, name: "Muslim World League", nameAr: "رابطة العالم الإسلامي" },
  { value: 4, name: "Umm Al-Qura University, Makkah", nameAr: "جامعة أم القرى، مكة المكرمة" },
  { value: 5, name: "Egyptian General Authority of Survey", nameAr: "الهيئة المصرية العامة للمساحة" },
];

export const MADHAB_OPTIONS = [
  { value: 0, name: "Shafi (Standard)", nameAr: "شافعي، مالكي، حنبلي" },
  { value: 1, name: "Hanafi", nameAr: "حنفي" },
];

export const ADHAN_SOUNDS = [
  { value: "rashed", name: "Mishary Rashid", nameAr: "مشاري راشد" },
  { value: "makka", name: "Makkah", nameAr: "مكة المكرمة" },
  { value: "algeria", name: "Algeria", nameAr: "الجزائر" },
];

export const RECITERS: Reciter[] = [
  { id: "ar.alafasy", name: "Mishary Rashid Alafasy", nameAr: "مشاري راشد العفاسي", style: "Murattal" },
  { id: "ar.minshawi", name: "Mohamed Siddiq al-Minshawi", nameAr: "محمد صديق المنشاوي", style: "Murattal" },
  { id: "ar.husary", name: "Mahmoud Khalil Al-Husary", nameAr: "محمود خليل الحصري", style: "Murattal" },
  { id: "ar.abdulbasitmurattal", name: "AbdulBaset AbdulSamad", nameAr: "عبد الباسط عبد الصمد", style: "Murattal" },
  { id: "ar.abdullahbasfar", name: "Abdullah Basfar", nameAr: "عبد الله بصفر", style: "Murattal" },
  { id: "ar.abdulsamad", name: "AbdulBaset AbdulSamad", nameAr: "عبد الباسط عبد الصمد", style: "Mujawwad" },
];

export const TASBIEH_PHRASES = [
  { content: "سبحان الله", count: 33 },
  { content: "الحمد لله", count: 33 },
  { content: "الله أكبر", count: 33 },
];

export const PRAYER_REMINDER_INTERVALS = [
  { value: 5, nameEn: "5 Minutes", nameAr: "5 دقائق" },
  { value: 10, nameEn: "10 Minutes", nameAr: "10 دقائق" },
  { value: 15, nameEn: "15 Minutes", nameAr: "15 دقيقة" },
  { value: 20, nameEn: "20 Minutes", nameAr: "20 دقيقة" },
  { value: 30, nameEn: "30 Minutes", nameAr: "30 دقيقة" },
];

export const SALAWAT_INTERVALS = [
  { value: 1, nameEn: "Every 1 Minute", nameAr: "كل دقيقة" },
  { value: 5, nameEn: "Every 5 Minutes", nameAr: "كل 5 دقائق" },
  { value: 10, nameEn: "Every 10 Minutes", nameAr: "كل 10 دقائق" },
  { value: 15, nameEn: "Every 15 Minutes", nameAr: "كل 15 دقيقة" },
  { value: 30, nameEn: "Every 30 Minutes", nameAr: "كل 30 دقيقة" },
  { value: 60, nameEn: "Every 1 Hour", nameAr: "كل ساعة" },
];
