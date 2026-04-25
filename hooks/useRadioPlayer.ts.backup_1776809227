'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { RadioStation } from '@/types';

const VOLUME_STORAGE_KEY = 'zad-radio-volume';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export function useRadioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  const [activeStation, setActiveStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [volume, setVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          return parsed;
        }
      }
    }
    return 80;
  });

  // Save volume to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
    }
    if (audioRef.current) {
      audioRef.current.volume = Math.min(1, Math.max(0, volume / 100));
    }
  }, [volume]);

  // Get error message from MediaError
  const getErrorMessage = useCallback((error: MediaError | null): string => {
    if (!error) return 'Unknown error occurred';
    
    switch (error.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return 'Playback was aborted';
      case MediaError.MEDIA_ERR_NETWORK:
        return 'Network error - check your connection';
      case MediaError.MEDIA_ERR_DECODE:
        return 'Media decoding failed';
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return 'Stream format not supported. Try another station.';
      default:
        return 'Playback error occurred';
    }
  }, []);

  // Cleanup audio - IMPROVED
  const cleanupAudio = useCallback(() => {
    console.log('[Radio] Cleaning up audio');
    
    // Clear retry timer
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    
    // Stop and cleanup audio element
    if (audioRef.current) {
      try {
        // Remove all event listeners first
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
        audioRef.current = null;
      } catch (e) {
        console.warn('[Radio] Cleanup error:', e);
      }
    }
    
    retryCountRef.current = 0;
  }, []);

  // Play station with proper cleanup
  const playStation = useCallback((station: RadioStation) => {
    console.log('[Radio] Playing station:', station.name, station.url);
    
    // IMPORTANT: Cleanup previous audio completely before starting new one
    cleanupAudio();
    
    setActiveStation(station);
    setIsPlaying(true);
    setIsBuffering(true);
    setHasError(false);
    setErrorMessage(null);
    retryCountRef.current = 0;

    // Small delay to ensure cleanup is complete
    setTimeout(() => {
      // Create new audio element
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.volume = Math.min(1, Math.max(0, volume / 100));
      audioRef.current = audio;

      // Event handlers
      const handleCanPlay = () => {
        console.log('[Radio] Can play');
        setIsBuffering(false);
      };

      const handlePlaying = () => {
        console.log('[Radio] Playing');
        setIsPlaying(true);
        setIsBuffering(false);
        setHasError(false);
        setErrorMessage(null);
        retryCountRef.current = 0;
      };

      const handleWaiting = () => {
        console.log('[Radio] Buffering');
        setIsBuffering(true);
      };

      const handleLoadStart = () => {
        console.log('[Radio] Load start');
        setIsBuffering(true);
      };

      const handleError = (e: Event) => {
        const audio = e.target as HTMLAudioElement;
        const error = audio.error;
        
        console.error('[Radio] Error:', {
          station: station.name,
          url: station.url,
          error: error,
          code: error?.code,
        });

        const errMsg = getErrorMessage(error);
        setErrorMessage(errMsg);
        setHasError(true);
        setIsBuffering(false);
        setIsPlaying(false);

        // Retry logic
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          console.log(`[Radio] Retrying (${retryCountRef.current}/${MAX_RETRIES})...`);
          
          retryTimerRef.current = setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.src = '';
              audioRef.current.src = station.url;
              audioRef.current.load();
              audioRef.current.play().catch((err) => {
                console.error('[Radio] Retry failed:', err);
              });
            }
          }, RETRY_DELAY * retryCountRef.current);
        } else {
          console.error('[Radio] Max retries reached');
        }
      };

      const handleStalled = () => {
        console.warn('[Radio] Stalled');
        setIsBuffering(true);
      };

      const handleEnded = () => {
        console.log('[Radio] Stream ended');
        // Auto-restart if stream ends unexpectedly
        if (audioRef.current) {
          audioRef.current.play().catch((err) => {
            console.error('[Radio] Auto-restart failed:', err);
          });
        }
      };

      // Attach event listeners
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('playing', handlePlaying);
      audio.addEventListener('waiting', handleWaiting);
      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('error', handleError);
      audio.addEventListener('stalled', handleStalled);
      audio.addEventListener('ended', handleEnded);

      // Set source and start playback
      audio.src = station.url;
      audio.load();
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error('[Radio] Play failed:', err);
          
          if (err.name === 'NotAllowedError') {
            setErrorMessage('Tap play button to start (browser security)');
            setHasError(true);
          } else if (err.name === 'NotSupportedError') {
            setErrorMessage('Stream format not supported. Try another station.');
            setHasError(true);
          } else if (err.name === 'AbortError') {
            setErrorMessage('Playback aborted. Try again.');
            setHasError(true);
          } else {
            setErrorMessage('Failed to start: ' + err.message);
            setHasError(true);
          }
          setIsBuffering(false);
          setIsPlaying(false);
        });
      }
    }, 100); // 100ms delay for cleanup
  }, [volume, cleanupAudio, getErrorMessage]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    console.log('[Radio] Stopping playback');
    cleanupAudio();
    setIsPlaying(false);
    setIsBuffering(false);
    setHasError(false);
    setErrorMessage(null);
  }, [cleanupAudio]);

  // Toggle play/pause
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else if (activeStation) {
      playStation(activeStation);
    }
  }, [isPlaying, activeStation, stopPlayback, playStation]);

  // Retry current station
  const retry = useCallback(() => {
    if (activeStation) {
      console.log('[Radio] Manual retry');
      retryCountRef.current = 0;
      playStation(activeStation);
    }
  }, [activeStation, playStation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return {
    activeStation,
    isPlaying,
    isBuffering,
    hasError,
    errorMessage,
    volume,
    setVolume,
    playStation,
    stopPlayback,
    togglePlayback,
    retry,
  };
}
