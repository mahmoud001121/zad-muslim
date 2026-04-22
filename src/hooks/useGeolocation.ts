'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettingsStore } from '@/store/settings-store';

export type PermissionState = 'granted' | 'prompt' | 'denied' | 'unavailable' | 'checking';

interface UseGeolocationReturn {
  location: { latitude: number; longitude: number } | null;
  isLoading: boolean;
  error: string | null;
  permissionState: PermissionState;
  requestLocation: () => void;
  setManualLocation: (lat: number, lng: number, name: string) => void;
  isUsingDefault: boolean;
  checkAndRequest: () => Promise<PermissionState>;
  testLocation: (lat: number, lng: number) => Promise<boolean>;
}

// IP Geolocation providers (fallback chain)
const IP_GEO_PROVIDERS = [
  {
    name: 'ipapi.co',
    url: 'https://ipapi.co/json/',
    parse: (data: any) => ({
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city || data.region || data.country_name || 'موقعك'
    })
  },
  {
    name: 'ip-api.com',
    url: 'http://ip-api.com/json/',
    parse: (data: any) => ({
      latitude: data.lat,
      longitude: data.lon,
      city: data.city || data.regionName || data.country || 'موقعك'
    })
  },
  {
    name: 'geojs.io',
    url: 'https://get.geojs.io/v1/ip/geo.json',
    parse: (data: any) => ({
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      city: data.city || data.region || data.country || 'موقعك'
    })
  }
];

// Test if location coordinates return valid prayer times
async function testPrayerTimes(lat: number, lng: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/prayer?lat=${lat}&lng=${lng}`);
    if (!response.ok) return false;
    const data = await response.json();
    return data && data.timings && Object.keys(data.timings).length > 0;
  } catch {
    return false;
  }
}

// Save location to history
function saveLocationHistory(lat: number, lng: number, name: string) {
  try {
    const history = JSON.parse(localStorage.getItem('locationHistory') || '[]');
    const newEntry = { lat, lng, name, timestamp: Date.now() };
    
    // Remove duplicates (same coordinates)
    const filtered = history.filter((h: any) => 
      !(Math.abs(h.lat - lat) < 0.01 && Math.abs(h.lng - lng) < 0.01)
    );
    
    // Add new entry at the beginning and keep only last 5
    const updated = [newEntry, ...filtered].slice(0, 5);
    localStorage.setItem('locationHistory', JSON.stringify(updated));
  } catch (e) {
    console.warn('[Geo] Failed to save location history', e);
  }
}

export function useGeolocation(): UseGeolocationReturn {
  const { locationLat, locationLng, locationName, setLocation } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('checking');

  const isDefaultLocation = locationLat === 30.0444 && locationLng === 31.2357 && (locationName === 'القاهرة' || locationName === '');

  const location =
    locationLat !== null && locationLng !== null
      ? { latitude: locationLat, longitude: locationLng }
      : null;

  // Try IP geolocation providers in sequence
  const tryIPGeolocation = async (): Promise<{ latitude: number; longitude: number; city: string } | null> => {
    for (const provider of IP_GEO_PROVIDERS) {
      try {
        console.log(`[Geo] Trying ${provider.name}...`);
        const response = await fetch(provider.url, { 
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        if (!response.ok) continue;
        
        const data = await response.json();
        const result = provider.parse(data);
        
        if (result.latitude && result.longitude) {
          console.log(`[Geo] ${provider.name} Success:`, result);
          return result;
        }
      } catch (err) {
        console.warn(`[Geo] ${provider.name} failed:`, err);
        continue;
      }
    }
    return null;
  };

  // Reverse geocode coordinates to city name
  const reverseGeocode = async (lat: number, lng: number, language: string = 'ar'): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=${language}`,
        { 
          headers: { 'User-Agent': 'Zad-Muslim-App/1.2' },
          signal: AbortSignal.timeout(5000)
        }
      );
      
      if (!response.ok) throw new Error('Reverse geocode failed');
      
      const data = await response.json();
      return data.address?.city ||
             data.address?.town ||
             data.address?.village ||
             data.address?.suburb ||
             data.address?.state ||
             'موقعك';
    } catch (e) {
      console.warn('[Geo] Reverse geocode failed:', e);
      return 'موقعك';
    }
  };

  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // 1. Primary: Browser Geolocation (most accurate)
    if (typeof window !== 'undefined' && navigator?.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          });
        });

        const { latitude, longitude } = position.coords;
        console.log(`[Geo] Browser GPS Success: ${latitude}, ${longitude}`);
        
        // Get city name
        const cityName = await reverseGeocode(latitude, longitude);
        
        // Test if location works for prayer times
        const isValid = await testPrayerTimes(latitude, longitude);
        if (!isValid) {
          console.warn('[Geo] Location failed prayer time test');
          setError('Location may not be accurate for prayer times');
        }
        
        setLocation(latitude, longitude, cityName);
        saveLocationHistory(latitude, longitude, cityName);
        setPermissionState('granted');
        setIsLoading(false);
        return;
      } catch (err: any) {
        console.warn('[Geo] Browser GPS failed:', err);
        
        if (err.code === 1) {
          setPermissionState('denied');
          setError('Location permission denied. Please enable location access.');
        } else if (err.code === 2) {
          console.log('[Geo] Position unavailable, trying IP geolocation...');
        } else if (err.code === 3) {
          console.log('[Geo] Timeout, trying IP geolocation...');
        }
      }
    }

    // 2. Fallback: IP Geolocation
    console.log('[Geo] Trying IP geolocation providers...');
    const ipResult = await tryIPGeolocation();
    
    if (ipResult) {
      const { latitude, longitude, city } = ipResult;
      
      // Test if location works for prayer times
      const isValid = await testPrayerTimes(latitude, longitude);
      if (!isValid) {
        console.warn('[Geo] IP location failed prayer time test');
        setError('Auto-detect may not be accurate. Please enter your city manually.');
      }
      
      setLocation(latitude, longitude, city);
      saveLocationHistory(latitude, longitude, city);
      setPermissionState('granted');
      setIsLoading(false);
      return;
    }

    // 3. All methods failed
    setPermissionState('unavailable');
    setError('Unable to detect location. Please enter your city manually.');
    setIsLoading(false);
  }, [setLocation]);

  const setManualLocation = useCallback(
    async (lat: number, lng: number, name: string) => {
      // Test location before saving
      const isValid = await testPrayerTimes(lat, lng);
      if (!isValid) {
        console.warn('[Geo] Manual location failed prayer time test');
        setError('Unable to verify prayer times for this location');
      }
      
      setLocation(lat, lng, name);
      saveLocationHistory(lat, lng, name);
      setError(null);
      setPermissionState('granted');
    },
    [setLocation]
  );

  const testLocation = useCallback(async (lat: number, lng: number): Promise<boolean> => {
    return await testPrayerTimes(lat, lng);
  }, []);

  const autoRequestedRef = useRef(false);

  const permissionsRef = useCallback(async (): Promise<{ result: PermissionState; cleanup: (() => void) | null }> => {
    if (typeof window === 'undefined' || !navigator?.permissions) {
      return { result: 'prompt', cleanup: null };
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      const state = result.state as PermissionState;

      const handleChange = () => {
        setPermissionState(result.state as PermissionState);
      };

      result.addEventListener('change', handleChange);

      return { result: state, cleanup: () => result.removeEventListener('change', handleChange) };
    } catch {
      return { result: 'prompt', cleanup: null };
    }
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    
    permissionsRef().then(({ result, cleanup: c }) => {
      setPermissionState(result);
      cleanup = c;

      // Auto-request only ONCE if we are at default location and permission is prompt
      if (result === 'prompt' && isDefaultLocation && !autoRequestedRef.current) {
        autoRequestedRef.current = true;
        // Don't auto-request, it's annoying. Just keep state.
        // requestLocation(); 
      }
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [permissionsRef, isDefaultLocation]);

  const checkAndRequest = useCallback(async (): Promise<PermissionState> => {
    const { result } = await permissionsRef();
    return result;
  }, [permissionsRef]);

  return {
    location,
    isLoading,
    error,
    permissionState,
    requestLocation,
    setManualLocation,
    isUsingDefault: isDefaultLocation,
    checkAndRequest,
    testLocation,
  };
}
