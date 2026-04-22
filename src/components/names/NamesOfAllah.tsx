'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAMES_OF_ALLAH } from '@/lib/names-of-allah';
import type { NameOfAllah } from '@/types';
import { Search, X, Star, Copy, Share2, Info, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

// ─── Animation Constants ───────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 }
  }
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20 } 
  },
  hover: { 
    y: -5, 
    scale: 1.02,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
} as const;

// ─── Components ────────────────────────────────────────────────────────

function NameCard({ name, onClick }: { name: NameOfAllah; onClick: () => void }) {
  return (
    <motion.button
      variants={cardVariants}
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center p-5 rounded-[2rem] bg-gradient-to-br from-zad-surface/80 to-zad-midnight border border-zad-border/50 hover:border-zad-gold/40 transition-all duration-300 shadow-xl overflow-hidden"
    >
      {/* Background patterns */}
      <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
        <Star size={40} className="text-zad-gold" />
      </div>
      
      {/* Number Badge */}
      <div className="absolute top-3 right-4 flex items-center gap-1">
        <span className="text-[10px] font-bold text-zad-gold/60">#{name.number}</span>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        <h2 className="arabic-display text-3xl text-text-primary group-hover:text-zad-gold transition-colors leading-relaxed mb-1">
          {name.name}
        </h2>
        <p className="text-[11px] font-bold text-zad-gold-light uppercase tracking-widest opacity-80">
          {name.transliteration}
        </p>
        <p className="text-[10px] text-text-muted mt-1.5 line-clamp-1 italic px-2">
          {name.meaning}
        </p>
      </div>

      {/* Interactive Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-zad-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.button>
  );
}

export function NamesOfAllah() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);
  const [isMounted, setIsAppMounted] = useState(false);

  useEffect(() => setIsAppMounted(true), []);

  const filteredNames = useMemo(() => {
    if (!searchQuery.trim()) return NAMES_OF_ALLAH;
    const q = searchQuery.toLowerCase().trim();
    return NAMES_OF_ALLAH.filter(n => 
      n.name.includes(q) || 
      n.transliteration.toLowerCase().includes(q) ||
      n.meaning.toLowerCase().includes(q) ||
      String(n.number) === q
    );
  }, [searchQuery]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ إلى الحافظة', {
      icon: <CheckCircle2 className="text-zad-green" size={16} />,
      className: 'arabic-display'
    });
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-full bg-zad-midnight select-none" dir="rtl">
      
      {/* ─── Premium Header & Search ─── */}
      <div className="px-6 pt-8 pb-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black gold-text arabic-display tracking-tight">أسماء الله الحسنى</h1>
            <p className="text-xs text-text-muted mt-1 font-medium tracking-wide">99 Beautiful Names of Allah</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-zad-gold/10 flex items-center justify-center border border-zad-gold/20">
            <Star className="text-zad-gold animate-pulse-slow" size={24} />
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-zad-gold transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم، المعنى، أو الرقم..."
            className="w-full h-14 pr-12 pl-12 bg-zad-surface/50 backdrop-blur-md border border-zad-border rounded-[1.25rem] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-zad-gold/50 focus:ring-4 focus:ring-zad-gold/5 transition-all duration-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 left-4 flex items-center text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-tighter">
            {filteredNames.length} {searchQuery ? 'نتائج' : 'أسماء'}
          </span>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-zad-gold/40" />
            <div className="w-1 h-1 rounded-full bg-zad-gold/20" />
            <div className="w-1 h-1 rounded-full bg-zad-gold/10" />
          </div>
        </div>
      </div>

      {/* ─── Scrollable Grid ─── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-24">
        <AnimatePresence mode="popLayout">
          {filteredNames.length > 0 ? (
            <motion.div
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 gap-4"
            >
              {filteredNames.map((name) => (
                <NameCard 
                  key={name.number} 
                  name={name} 
                  onClick={() => setSelectedName(name)} 
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-zad-surface flex items-center justify-center mb-4 border border-zad-border">
                <Search size={32} className="text-text-muted" />
              </div>
              <p className="text-text-primary font-bold">لم يتم العثور على نتائج</p>
              <p className="text-text-muted text-xs mt-1 italic">جرب البحث بكلمات أخرى</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Immersive Detail Modal ─── */}
      <AnimatePresence>
        {selectedName && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedName(null)}
              className="fixed inset-0 bg-zad-midnight/90 backdrop-blur-md z-[100]"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-4 bottom-8 z-[101] max-w-lg mx-auto"
            >
              <div className="relative bg-zad-surface border border-zad-gold/20 rounded-[3rem] p-8 shadow-2xl overflow-hidden">
                {/* Modal Ornaments */}
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-zad-gold/10 blur-[50px] rounded-full" />
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-zad-green/10 blur-[50px] rounded-full" />
                
                <button 
                  onClick={() => setSelectedName(null)}
                  className="absolute top-6 left-6 p-2 rounded-full bg-zad-midnight/50 border border-zad-border hover:border-zad-gold/40 transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-zad-gold uppercase tracking-[0.3em]">الاسم رقم {selectedName.number}</span>
                    <h2 className="arabic-display text-6xl gold-text py-2">{selectedName.name}</h2>
                    <p className="text-lg font-bold tracking-widest text-text-primary uppercase">{selectedName.transliteration}</p>
                  </div>

                  <div className="w-full h-px bg-gradient-to-r from-transparent via-zad-border to-transparent" />

                  <div className="space-y-4 w-full">
                    <div className="bg-zad-midnight/40 rounded-3xl p-6 border border-zad-border/30">
                      <p className="text-xl arabic-display text-text-arabic leading-relaxed">
                        {selectedName.meaningAr}
                      </p>
                    </div>
                    <div className="bg-zad-gold/5 rounded-3xl p-6 border border-zad-gold/10">
                      <p className="text-sm text-text-secondary leading-relaxed font-medium">
                        {selectedName.meaning}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => copyToClipboard(`${selectedName.name} - ${selectedName.meaning}`)}
                      className="flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl bg-zad-surface border border-zad-border hover:border-zad-gold/30 transition-all active:scale-95"
                    >
                      <Copy size={18} />
                      <span className="text-sm font-bold">نسخ</span>
                    </button>
                    <button 
                      className="w-14 h-14 flex items-center justify-center rounded-2xl bg-zad-gold text-zad-midnight hover:bg-zad-gold-light transition-all active:scale-95 shadow-lg shadow-zad-gold/20"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>

                  <div className="pt-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zad-surface/50 border border-zad-border text-[10px] text-text-muted italic">
                      <Info size={12} />
                      <span>{selectedName.name.replace(/^ال/, 'يا ')}... كررها بقلب حاضر</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
