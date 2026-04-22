'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settings-store';

// ─── Kaaba Coordinates ────────────────────────────────────────────
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;
const EARTH_RADIUS_KM = 6371;

function calculateQibla(lat: number, lng: number): number {
  const kaabaLat = (KAABA_LAT * Math.PI) / 180;
  const kaabaLng = (KAABA_LNG * Math.PI) / 180;
  const userLat = (lat * Math.PI) / 180;
  const userLng = (lng * Math.PI) / 180;

  const dLng = kaabaLng - userLng;
  const x = Math.sin(dLng);
  const y =
    Math.cos(userLat) * Math.tan(kaabaLat) -
    Math.sin(userLat) * Math.cos(dLng);

  let qibla = (Math.atan2(x, y) * 180) / Math.PI;
  return ((qibla + 360) % 360);
}

function calculateDistance(lat: number, lng: number): number {
  const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
  const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((KAABA_LAT * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function formatDistance(km: number): string {
  if (km >= 1000) return `${(km / 1000).toFixed(1)} ألف كم`;
  return `${Math.round(km)} كم`;
}

// ─── Icons ────────────────────────────────────────────────────────
function CompassHeaderIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#D4A017" strokeWidth="1.5" opacity="0.6" />
      <path d="M12 3L14 10L12 9L10 10Z" fill="#D4A017" />
      <path d="M12 21L10 14L12 15L14 14Z" fill="#5A6478" opacity="0.5" />
      <circle cx="12" cy="12" r="1.5" fill="#D4A017" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function DistanceIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function DegreeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 12l3 2" />
    </svg>
  );
}

function SensorIcon({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? 'text-zad-green' : 'text-text-muted'}>
      <circle cx="12" cy="12" r="3" fill={active ? 'currentColor' : 'none'} />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

// ─── Device Orientation Hook ─────────────────────────────────────
interface DeviceOrientationState {
  heading: number | null;
  hasGyroscope: boolean;
  permissionStatus: 'idle' | 'requesting' | 'granted' | 'denied';
}

function useDeviceOrientation() {
  const isIOS13 = useMemo(() => {
    if (typeof window === 'undefined' || typeof (window as any).DeviceOrientationEvent === 'undefined') return false;
    const DOE = (window as any).DeviceOrientationEvent as any;
    return typeof DOE.requestPermission === 'function';
  }, []);

  const [state, setState] = useState<DeviceOrientationState>({
    heading: null,
    hasGyroscope: false,
    permissionStatus: 'idle',
  });

  const handleOrientation = useCallback((event: any) => {
    let newHeading: number | null = null;
    
    // iOS
    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      newHeading = event.webkitCompassHeading;
    } 
    // Android
    else if (event.alpha !== null) {
      // alpha is 0 when pointing North, increases counter-clockwise (West=90). We want clockwise heading.
      newHeading = 360 - event.alpha;
    }

    if (newHeading !== null) {
      setState((prev) => ({
        ...prev,
        heading: newHeading,
        hasGyroscope: true,
      }));
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const DOE = (window as any).DeviceOrientationEvent as any;

    if (DOE && typeof DOE.requestPermission === 'function') {
      try {
        setState((prev) => ({ ...prev, permissionStatus: 'requesting' }));
        const response = await DOE.requestPermission();
        if (response === 'granted') {
          setState((prev) => ({ ...prev, permissionStatus: 'granted' }));
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setState((prev) => ({ ...prev, permissionStatus: 'denied' }));
        }
      } catch {
        setState((prev) => ({ ...prev, permissionStatus: 'denied' }));
      }
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }
  }, [handleOrientation]);

  useEffect(() => {
    if (isIOS13 || typeof window === 'undefined') return;
    
    // Listen to absolute if possible (Android)
    if ('ondeviceorientationabsolute' in window) {
      (window as any).addEventListener('deviceorientationabsolute', handleOrientation);
    } else {
      (window as any).addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if ('ondeviceorientationabsolute' in window) {
        (window as any).removeEventListener('deviceorientationabsolute', handleOrientation);
      } else {
        (window as any).removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [handleOrientation, isIOS13]);

  return { ...state, isIOS13, requestPermission };
}

// ─── Main Component ───────────────────────────────────────────────
export function QiblaCompass() {
  const locationLat = useSettingsStore((s) => s.locationLat);
  const locationLng = useSettingsStore((s) => s.locationLng);
  const locationName = useSettingsStore((s) => s.locationName);

  const lat = locationLat ?? 31.0421;
  const lng = locationLng ?? 31.3428;

  const qiblaDirection = useMemo(() => calculateQibla(lat, lng), [lat, lng]);
  const distance = useMemo(() => calculateDistance(lat, lng), [lat, lng]);

  const { heading, hasGyroscope, isIOS13, permissionStatus, requestPermission } = useDeviceOrientation();

  // Dial rotation: North is 0. If device heading is 90 (East), Dial should rotate -90 to keep North at actual North.
  const dialRotation = heading !== null ? -heading : 0;
  const displayHeading = heading !== null ? Math.round(heading) : null;
  const isLiveMode = heading !== null && hasGyroscope;
  const showNoSensorMessage = !hasGyroscope && !isIOS13;

  const compassSize = 300;
  const center = compassSize / 2;
  const outerRadius = 140;
  const innerRadius = 120;
  const textRadius = 105;

  const ticks = useMemo(() => {
    const result: { angle: number; major: boolean }[] = [];
    for (let i = 0; i < 360; i += 5) {
      result.push({ angle: i, major: i % 30 === 0 });
    }
    return result;
  }, []);

  const cardinals = [
    { label: 'شمال', subLabel: 'N', angle: 0 },
    { label: 'شرق', subLabel: 'E', angle: 90 },
    { label: 'جنوب', subLabel: 'S', angle: 180 },
    { label: 'غرب', subLabel: 'W', angle: 270 },
  ];

  return (
    <div className="flex flex-col h-full bg-zad-midnight overflow-y-auto custom-scrollbar" dir="rtl">
      {/* Header */}
      <motion.div className="px-5 pt-6 pb-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-zad-gold/10 border border-zad-gold/20 flex items-center justify-center shadow-lg">
              <CompassHeaderIcon />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary arabic-display gold-text">القبلة</h1>
              <p className="text-[10px] text-text-muted mt-0.5 tracking-widest uppercase">اتجاه الكعبة المشرفة</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zad-surface/50 border border-zad-border">
            <SensorIcon active={isLiveMode} />
            <span className="text-[10px] font-bold text-text-muted uppercase">
              {isLiveMode ? 'مباشر' : isIOS13 && permissionStatus !== 'granted' ? 'مغلق' : 'يدوي'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Compass Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <AnimatePresence>
          {isIOS13 && permissionStatus !== 'granted' && permissionStatus !== 'denied' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm mb-6">
              <div className="bg-zad-surface border border-zad-gold/30 rounded-2xl p-5 text-center shadow-xl">
                <p className="text-sm font-bold text-zad-gold mb-2 arabic-display">تفعيل البوصلة الذكية</p>
                <p className="text-[11px] text-text-secondary mb-4 leading-relaxed">
                  يحتاج التطبيق للوصول إلى مستشعر الاتجاه في هاتفك ليعمل كبوصلة حقيقية.
                </p>
                <button
                  onClick={requestPermission}
                  className="w-full py-3 rounded-xl bg-zad-gold text-zad-midnight font-bold shadow-lg shadow-zad-gold/20 hover:bg-zad-gold-light transition-all active:scale-95"
                >
                  {permissionStatus === 'requesting' ? 'جاري الطلب...' : 'السماح بالوصول'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compass SVG */}
        <motion.div
          className="relative flex items-center justify-center mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          {/* Static Phone Top Indicator (Points UP) */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center drop-shadow-[0_0_10px_rgba(212,160,23,0.5)]">
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-zad-gold mb-1" />
            <span className="text-[10px] font-bold text-zad-gold tracking-widest uppercase">هاتفك</span>
          </div>

          <svg width={compassSize} height={compassSize} viewBox={`0 0 ${compassSize} ${compassSize}`} className="drop-shadow-2xl">
            <defs>
              <linearGradient id="arrow-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#111827" />
                <stop offset="50%" stopColor="#D4A017" />
                <stop offset="100%" stopColor="#F5C842" />
              </linearGradient>
            </defs>

            {/* Background Rings */}
            <circle cx={center} cy={center} r={outerRadius} fill="#0B0F1A" stroke="#1E3A5F" strokeWidth="2" />
            <circle cx={center} cy={center} r={innerRadius} fill="none" stroke="#D4A017" strokeWidth="0.5" opacity="0.2" />

            {/* Rotating Dial (Ticks, N/S/E/W, and Qibla Arrow) */}
            <g
              style={{
                transform: `rotate(${dialRotation}deg)`,
                transformOrigin: `${center}px ${center}px`,
                transition: isLiveMode ? 'transform 0.1s linear' : 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Ticks */}
              {ticks.map((tick) => {
                const rad = ((tick.angle - 90) * Math.PI) / 180;
                const isMajor = tick.major;
                const x1 = center + (isMajor ? innerRadius - 8 : innerRadius - 4) * Math.cos(rad);
                const y1 = center + (isMajor ? innerRadius - 8 : innerRadius - 4) * Math.sin(rad);
                const x2 = center + outerRadius * Math.cos(rad);
                const y2 = center + outerRadius * Math.sin(rad);
                return (
                  <line key={tick.angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isMajor ? '#D4A017' : '#1E3A5F'} strokeWidth={isMajor ? 2 : 1} opacity={isMajor ? 1 : 0.4} />
                );
              })}

              {/* Cardinals */}
              {cardinals.map((c) => {
                const rad = ((c.angle - 90) * Math.PI) / 180;
                const x = center + textRadius * Math.cos(rad);
                const y = center + textRadius * Math.sin(rad);
                return (
                  <g key={c.label}>
                    <circle cx={x} cy={y} r="14" fill="#0B0F1A" stroke="#1E3A5F" strokeWidth="1" />
                    <text x={x} y={y - 2} textAnchor="middle" dominantBaseline="central" fill={c.angle === 0 ? '#D4A017' : '#B8A98A'} fontSize="10" fontWeight="bold" className="arabic-display">{c.label}</text>
                    <text x={x} y={y + 8} textAnchor="middle" dominantBaseline="central" fill="#5A6478" fontSize="7" fontWeight="bold">{c.subLabel}</text>
                  </g>
                );
              })}

              {/* ✨ THE QIBLA ARROW (Drawn ON the dial at Qibla Degree) ✨ */}
              <g transform={`rotate(${qiblaDirection} ${center} ${center})`}>
                {/* Glow behind arrow */}
                <circle cx={center} cy={center - 60} r="30" fill="url(#arrow-grad)" opacity="0.1" filter="blur(10px)" />
                {/* The Arrow */}
                <polygon points={`${center},${center-95} ${center-15},${center-15} ${center},${center-25} ${center+15},${center-15}`} fill="url(#arrow-grad)" stroke="#F5C842" strokeWidth="1" />
                {/* Center dot for arrow */}
                <circle cx={center} cy={center - 25} r="4" fill="#111827" stroke="#F5C842" strokeWidth="2" />
              </g>
            </g>

            {/* Center Anchor */}
            <circle cx={center} cy={center} r="12" fill="#0B0F1A" stroke="#D4A017" strokeWidth="2" />
            <circle cx={center} cy={center} r="4" fill="#F5C842" />
          </svg>
        </motion.div>

        {/* Real-time Indicator */}
        {isLiveMode && displayHeading !== null && (
          <div className="flex flex-col items-center mb-6">
            <span className="text-[11px] font-bold text-zad-green uppercase tracking-widest bg-zad-green/10 px-4 py-1.5 rounded-full border border-zad-green/20">
              دقة المستشعر: فعالة ({displayHeading}°)
            </span>
          </div>
        )}

        {/* Info Cards */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          <div className="bg-gradient-to-br from-zad-surface to-zad-midnight border border-zad-gold/30 rounded-2xl p-5 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-zad-gold/10 blur-[40px] rounded-full pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zad-gold/15 flex items-center justify-center">
                  <DegreeIcon />
                </div>
                <div>
                  <p className="text-xs text-text-secondary">اتجاه الكعبة (القبلة)</p>
                  <p className="text-2xl font-black text-text-primary tabular-nums tracking-tighter">
                    {Math.round(qiblaDirection)}°
                  </p>
                </div>
              </div>
              <div className="text-left px-4 py-2 bg-zad-midnight/60 rounded-xl border border-zad-border">
                <p className="text-[10px] text-text-muted uppercase tracking-widest">المسافة</p>
                <p className="text-sm font-bold text-zad-gold">{formatDistance(distance)}</p>
              </div>
            </div>
          </div>

          <div className="bg-zad-surface/50 border border-zad-border rounded-xl p-4 text-center">
             <p className="arabic-display text-sm text-zad-gold/90 leading-relaxed">
              ﴿ فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ ﴾
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
