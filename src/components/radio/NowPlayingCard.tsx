'use client';

import { motion } from 'framer-motion';
import { Play, Square, SkipBack, SkipForward, Volume2, VolumeX, Volume1, Loader2, AlertCircle, Share2 } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import type { RadioStation } from '@/types';

interface NowPlayingCardProps {
  station: RadioStation;
  isPlaying: boolean;
  isBuffering: boolean;
  hasError: boolean;
  errorMessage: string | null;
  volume: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onVolumeChange: (volume: number) => void;
  onRetry: () => void;
  onShare: () => void;
}

export function NowPlayingCard({
  station,
  isPlaying,
  isBuffering,
  hasError,
  errorMessage,
  volume,
  onPlayPause,
  onNext,
  onPrev,
  onVolumeChange,
  onRetry,
  onShare,
}: NowPlayingCardProps) {
  const language = useSettingsStore((s) => s.language);
  const isAr = language === 'ar';

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = isAr ? rect.right - e.clientX : e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
    onVolumeChange(pct);
  };

  const toggleMute = () => {
    onVolumeChange(volume > 0 ? 0 : 80);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="mx-4 mt-4 rounded-2xl border-2 border-zad-gold/40 bg-zad-surface p-6 shadow-2xl"
    >
      {/* Station Image & Name */}
      <div className="flex items-center gap-4 mb-6">
        {station.img ? (
          <img
            src={station.img}
            alt={station.name}
            className="w-16 h-16 rounded-xl object-cover border border-zad-border/60"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-zad-gold/15 border border-zad-gold/30 flex items-center justify-center">
            <span className="text-2xl">📻</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-zad-gold truncate arabic-display">
            {station.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            {isBuffering ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                <span className="text-xs text-amber-400 font-medium">
                  {isAr ? 'جاري التحميل...' : 'Buffering...'}
                </span>
              </>
            ) : isPlaying ? (
              <>
                <motion.div
                  className="w-2 h-2 rounded-full bg-green-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-xs text-green-400 font-bold">
                  {isAr ? 'مباشر' : 'LIVE'}
                </span>
              </>
            ) : (
              <span className="text-xs text-text-muted">
                {isAr ? 'متوقف' : 'Stopped'}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onShare}
          className="w-10 h-10 rounded-full bg-zad-surface border border-zad-border/60 hover:border-zad-gold/40 flex items-center justify-center transition-all"
          aria-label="Share"
        >
          <Share2 className="w-4 h-4 text-text-secondary" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={onPrev}
          className="w-12 h-12 rounded-full bg-zad-surface border border-zad-border/60 hover:border-zad-gold/40 hover:shadow-lg flex items-center justify-center transition-all"
          aria-label="Previous"
        >
          <SkipBack className="w-5 h-5 text-text-secondary" />
        </button>

        <button
          onClick={onPlayPause}
          disabled={isBuffering}
          className="w-16 h-16 rounded-full bg-zad-gold hover:bg-zad-gold-light disabled:opacity-50 flex items-center justify-center shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed"
          aria-label={isPlaying ? 'Stop' : 'Play'}
        >
          {isBuffering ? (
            <Loader2 className="w-7 h-7 text-black animate-spin" />
          ) : isPlaying ? (
            <Square className="w-7 h-7 text-black fill-black" />
          ) : (
            <Play className="w-7 h-7 text-black fill-black ml-1" />
          )}
        </button>

        <button
          onClick={onNext}
          className="w-12 h-12 rounded-full bg-zad-surface border border-zad-border/60 hover:border-zad-gold/40 hover:shadow-lg flex items-center justify-center transition-all"
          aria-label="Next"
        >
          <SkipForward className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={toggleMute}
          className="flex-shrink-0"
          aria-label="Toggle mute"
        >
          {volume === 0 ? (
            <VolumeX className="w-5 h-5 text-text-muted" />
          ) : volume < 50 ? (
            <Volume1 className="w-5 h-5 text-text-secondary" />
          ) : (
            <Volume2 className="w-5 h-5 text-text-secondary" />
          )}
        </button>

        <div
          className="relative h-2 flex-1 cursor-pointer rounded-full bg-zad-surface overflow-hidden"
          onClick={handleVolumeClick}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={volume}
          aria-label="Volume"
        >
          <motion.div
            className={`absolute inset-y-0 rounded-full bg-gradient-to-${isAr ? 'l' : 'r'} from-zad-gold to-zad-gold/60`}
            style={{ [isAr ? 'right' : 'left']: 0, width: `${volume}%` }}
            transition={{ duration: 0.15 }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-zad-gold border-2 border-zad-midnight shadow-lg"
            style={{ [isAr ? 'right' : 'left']: `calc(${volume}% - 8px)` }}
          />
        </div>

        <span className="text-xs tabular-nums text-text-muted w-10 text-center flex-shrink-0">
          {volume}%
        </span>
      </div>

      {/* Error Message */}
      {hasError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 rounded-lg bg-red-500/10 border border-red-500/30"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-red-400">
                {errorMessage || (isAr ? 'فشل تشغيل المحطة' : 'Failed to play station')}
              </p>
              <button
                onClick={onRetry}
                className="mt-2 text-xs text-red-400 underline hover:text-red-300"
              >
                {isAr ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sound Wave Visualizer */}
      {isPlaying && !hasError && (
        <div className="flex items-center justify-center gap-1 mt-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full bg-zad-gold"
              animate={{
                height: [8, 24, 12, 28, 8],
                opacity: [0.4, 1, 0.6, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
