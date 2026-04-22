'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSettingsStore } from '@/store/settings-store';

interface PushState {
  supported: boolean;
  ios: boolean;
  iosPWA: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
  error?: string;
  loading: boolean;
}

// iOS detection utilities
function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function isIOSPWA(): boolean {
  return (navigator as any).standalone === true;
}

export function usePushNotifications() {
  const {
    locationLat, locationLng, prayerMethod, madhab,
    adhanEnabled, prayerReminderEnabled, prayerReminderMinutes,
    salawatEnabled, salawatInterval,
  } = useSettingsStore();

  const [state, setState] = useState<PushState>({
    supported: false,
    ios: false,
    iosPWA: false,
    permission: 'default',
    subscribed: false,
    loading: false,
  });
  const swRef = useRef<ServiceWorkerRegistration | null>(null);

  // Check if push is supported and detect iOS
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    const ios = isIOS();
    const iosPWA = isIOSPWA();
    
    setState((prev) => ({
      ...prev,
      supported,
      ios,
      iosPWA,
      permission: supported && 'Notification' in window ? Notification.permission : 'denied',
    }));
  }, []);

  // Register service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setState((prev) => ({ 
        ...prev, 
        supported: false,
        error: 'Service workers not supported in this browser.'
      }));
      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then(async (reg) => {
        console.log('[Push] Service Worker registered:', reg.scope);
        swRef.current = reg;

        // Cache settings for offline use by Service Worker
        cacheSettingsForSW();

        checkSubscription(reg);
      })
      .catch((err) => {
        console.error('[Push] SW registration failed:', err.message, err);
        setState((prev) => ({ 
          ...prev, 
          supported: false,
          error: 'Service worker registration failed. Please check your connection and try again.'
        }));
      });
  }, []);

  // Cache settings in SW cache so it can use them offline
  const cacheSettingsForSW = useCallback(async () => {
    try {
      const cache = await caches.open('zad-settings');
      await cache.put(
        '/settings.json',
        new Response(
          JSON.stringify({
            locationLat,
            locationLng,
            prayerMethod,
            madhab,
            adhanEnabled,
            prayerReminderEnabled,
            prayerReminderMinutes,
            salawatEnabled,
            salawatInterval,
          }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      );
      console.log('[Push] Settings cached for SW');
    } catch (err) {
      console.error('[Push] Failed to cache settings:', err);
    }
  }, [
    locationLat, locationLng, prayerMethod, madhab,
    adhanEnabled, prayerReminderEnabled, prayerReminderMinutes,
    salawatEnabled, salawatInterval,
  ]);

  const checkSubscription = useCallback(async (reg: ServiceWorkerRegistration) => {
    try {
      const subscription = await reg.pushManager.getSubscription();
      setState((prev) => ({
        ...prev,
        subscribed: !!subscription,
        loading: false,
      }));
    } catch (err) {
      console.error('[Push] Failed to check subscription:', err);
      setState((prev) => ({ 
        ...prev, 
        loading: false,
        error: 'Failed to check notification subscription status.'
      }));
    }
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!swRef.current) {
      setState((prev) => ({ 
        ...prev, 
        loading: false,
        error: 'Service worker not ready. Please wait and try again.'
      }));
      return false;
    }

    setState((prev) => ({ ...prev, loading: true, error: undefined }));

    try {
      // 1) Get VAPID public key
      const vapidRes = await fetch('/api/push/vapid');
      if (!vapidRes.ok) {
        throw new Error('Failed to get VAPID key from server');
      }
      const { publicKey } = await vapidRes.json();
      if (!publicKey) throw new Error('No VAPID key available');

      // 2) Check iOS limitations
      if (state.ios && !state.iosPWA) {
        setState((prev) => ({ 
          ...prev, 
          loading: false,
          error: 'iOS requires adding app to home screen for notifications. Please install as PWA first.'
        }));
        return false;
      }

      // 3) Request notification permission
      const permission = await Notification.requestPermission();
      setState((prev) => ({ ...prev, permission }));
      
      if (permission !== 'granted') {
        setState((prev) => ({ 
          ...prev, 
          loading: false,
          error: permission === 'denied' 
            ? 'Notification permission was denied. Please enable notifications in browser settings.' 
            : 'Notification permission not granted. Please try again.'
        }));
        return false;
      }

      // 4) Create push subscription
      const subscription = await swRef.current.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // 5) Send subscription + all notification settings to server
      const subJson = subscription.toJSON();
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subJson,
          locationLat,
          locationLng,
          prayerMethod,
          madhab,
          adhanEnabled,
          prayerReminderEnabled,
          prayerReminderMinutes,
          salawatEnabled,
          salawatInterval,
        }),
      });

      setState((prev) => ({ ...prev, subscribed: true, loading: false }));
      return true;
    } catch (err: any) {
      console.error('[Push] Subscription failed:', err);
      setState((prev) => ({ 
        ...prev, 
        loading: false,
        error: err.message || 'Failed to subscribe to notifications. Please try again.'
      }));
      return false;
    }
  }, [
    locationLat, locationLng, prayerMethod, madhab,
    adhanEnabled, prayerReminderEnabled, prayerReminderMinutes,
    salawatEnabled, salawatInterval,
    state.ios, state.iosPWA,
  ]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!swRef.current) return false;

    setState((prev) => ({ ...prev, loading: true, error: undefined }));

    try {
      const subscription = await swRef.current.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      setState((prev) => ({ ...prev, subscribed: false, loading: false }));
      return true;
    } catch (err) {
      console.error('[Push] Unsubscribe failed:', err);
      setState((prev) => ({ 
        ...prev, 
        loading: false,
        error: 'Failed to unsubscribe from notifications.'
      }));
      return false;
    }
  }, []);

  const toggleSubscription = useCallback(async (): Promise<boolean> => {
    if (state.subscribed) {
      return await unsubscribe();
    } else {
      return await subscribe();
    }
  }, [state.subscribed, subscribe, unsubscribe]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    toggleSubscription,
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
