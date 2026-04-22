'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

interface SplashScreenProps {
  isLoading: boolean;
  onComplete?: () => void;
}

const DHIKR_QUOTES = [
  { ar: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", en: "Glory be to Allah and His is the praise" },
  { ar: "لَا إِلٰهَ إِلَّا اللَّهُ", en: "There is no god but Allah" },
  { ar: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", en: "Praise be to Allah, Lord of the worlds" },
  { ar: "اللَّهُ أَكْبَرُ", en: "Allah is the Greatest" },
  { ar: "أَسْتَغْفِرُ اللَّهَ", en: "I seek forgiveness from Allah" },
];

export function SplashScreen({ isLoading, onComplete }: SplashScreenProps) {
  const [show, setShow] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Rotate quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % DHIKR_QUOTES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulate progress if not provided by app
  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + (100 - prev) * 0.1;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && show && !isExiting && progress >= 90) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setShow(false);
          onComplete?.();
        }, 1200);
      }, 1000); 
      return () => clearTimeout(exitTimer);
    }
  }, [isLoading, show, isExiting, onComplete, progress]);

  const stars = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
  })), []);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.1,
            filter: 'blur(10px)',
            transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050914] overflow-hidden"
        >
          {/* ─── Minimalist, Eye-Friendly Background ─── */}
          <div className="absolute inset-0 pointer-events-none bg-[#050914]">
             {/* Very subtle, slow-breathing center glow */}
             <motion.div 
               className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-[radial-gradient(circle,_rgba(212,160,23,0.08)_0%,_transparent_50%)]"
               animate={{ opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
             />
             
             {/* Subtle vignette for depth */}
             <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_40%,_rgba(2,4,10,0.8)_100%)]" />
          </div>

          {/* ─── Main Content ─── */}
          <div className="relative z-10 flex flex-col items-center w-full max-w-lg px-8">
            
            {/* ─── Premium Front-Facing 2D Kaaba ─── */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative w-48 h-48 sm:w-64 sm:h-64 mb-16 flex items-center justify-center"
            >
              {/* Outer Glow Aura */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-zad-gold/10 blur-[60px]"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Front-Facing Kaaba Implementation */}
              <div className="kaaba-wrapper">
                <div className="premium-kaaba front-facing">
                  <div className="kaaba-front-face">
                    <div className="kiswa-texture" />
                    <div className="kaaba-roof-trim" />
                    <div className="gold-belt" />
                    <div className="door-gold" />
                    <div className="kaaba-base-trim" />
                  </div>
                  <div className="kaaba-shadow" />
                </div>
              </div>
            </motion.div>

            {/* ─── Calligraphy & Branding ─── */}
            <div className="text-center flex flex-col items-center gap-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                <h1 className="text-4xl sm:text-5xl font-arabic text-zad-gold drop-shadow-[0_0_15px_rgba(212,160,23,0.4)] tracking-wide">
                  زاد المسلم
                </h1>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 1.5 }}
                  className="h-[1px] bg-gradient-to-r from-transparent via-zad-gold/50 to-transparent mt-2"
                />
              </motion.div>

              {/* Dynamic Spiritual Quotes */}
              <div className="h-16 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={quoteIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <p className="text-xl sm:text-2xl font-arabic text-white/90">
                      {DHIKR_QUOTES[quoteIndex].ar}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zad-gold/60 font-medium">
                      {DHIKR_QUOTES[quoteIndex].en}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* ─── Premium Progress Section ─── */}
            <div className="mt-12 w-full max-w-[240px] flex flex-col items-center gap-4">
               <div className="relative w-full h-1 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   className="absolute top-0 left-0 h-full bg-gradient-to-r from-zad-gold/40 via-zad-gold to-white shadow-[0_0_10px_rgba(212,160,23,0.8)]"
                   style={{ width: `${progress}%` }}
                 />
               </div>
               
               <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-1 rounded-full bg-zad-gold"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-bold text-zad-gold/50 tracking-[0.3em] uppercase">
                    {progress < 100 ? 'Initializing' : 'Ready'}
                  </span>
               </div>
            </div>
          </div>
          
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-0 left-0 w-32 h-32 opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-zad-gold rotate-180">
              <path d="M0 0 L100 0 Q50 50 0 100 Z" />
            </svg>
          </div>
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-zad-gold">
              <path d="M0 0 L100 0 Q50 50 0 100 Z" />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
