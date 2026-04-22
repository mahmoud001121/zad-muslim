'use client';

import { motion } from 'framer-motion';
import { Play, Radio, Heart } from 'lucide-react';
import type { RadioStation } from '@/types';

interface StationCardProps {
  station: RadioStation;
  isActive: boolean;
  isPlaying: boolean;
  isFavorite: boolean;
  onClick: () => void;
  onToggleFavorite: () => void;
}

export function StationCard({
  station,
  isActive,
  isPlaying,
  isFavorite,
  onClick,
  onToggleFavorite,
}: StationCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-xl border transition-all ${
        isActive
          ? 'border-zad-gold/40 bg-zad-gold/10 shadow-lg'
          : 'border-zad-border/60 bg-zad-surface hover:border-zad-gold/40 hover:shadow-lg'
      }`}
    >
      {/* Active glow effect */}
      {isActive && isPlaying && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-zad-gold/5 to-transparent rounded-xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <button
        onClick={onClick}
        className="relative w-full p-4 text-right"
      >
        <div className="flex items-center gap-3">
          {/* Station Image */}
          {station.img ? (
            <img
              src={station.img}
              alt={station.name}
              className="w-14 h-14 rounded-lg object-cover border border-zad-border/60 flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-zad-gold/15 border border-zad-gold/30 flex items-center justify-center flex-shrink-0">
              <Radio className="w-6 h-6 text-zad-gold" />
            </div>
          )}

          {/* Station Info */}
          <div className="flex-1 min-w-0 text-right">
            <p
              className={`text-sm font-semibold truncate arabic-display ${
                isActive ? 'text-zad-gold' : 'text-text-primary'
              }`}
            >
              {station.name}
            </p>
            {isActive && isPlaying && (
              <div className="flex items-center justify-end gap-1 mt-1">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-green-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-xs text-green-400 font-bold">LIVE</span>
              </div>
            )}
          </div>

          {/* Status Icon */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isActive && isPlaying
                ? 'bg-zad-green/15'
                : isActive
                ? 'bg-zad-gold/15'
                : 'bg-zad-surface'
            }`}
          >
            {isActive && isPlaying ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Radio className="w-5 h-5 text-zad-green" />
              </motion.div>
            ) : (
              <Play className="w-5 h-5 text-text-muted" />
            )}
          </div>
        </div>
      </button>

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="absolute top-2 left-2 w-8 h-8 rounded-full bg-zad-midnight/80 backdrop-blur-sm flex items-center justify-center hover:bg-zad-midnight transition-all"
        aria-label="Toggle favorite"
      >
        <Heart
          className={`w-4 h-4 transition-all ${
            isFavorite ? 'text-red-400 fill-red-400' : 'text-text-muted'
          }`}
        />
      </button>
    </motion.div>
  );
}
