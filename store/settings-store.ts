import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserSettings } from "@/types";
import { DEFAULT_SETTINGS } from "@/lib/constants";

interface SettingsStore extends UserSettings {
  updateSettings: (partial: Partial<UserSettings>) => void;
  resetSettings: () => void;
  setLocation: (lat: number, lng: number, name: string) => void;
  isLoaded: boolean;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      locationLat: 31.0421,
      locationLng: 31.3428,
      locationName: "المنصورة",
      isLoaded: false,

      updateSettings: (partial) => set((s) => ({ ...s, ...partial })),
      resetSettings: () =>
        set({
          ...DEFAULT_SETTINGS,
          locationLat: 31.0421,
          locationLng: 31.3428,
          locationName: "المنصورة",
          isLoaded: false,
        }),
      setLocation: (lat, lng, name) =>
        set({ locationLat: lat, locationLng: lng, locationName: name }),
    }),
    {
      name: "zad-muslim-settings",
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        prayerMethod: state.prayerMethod,
        madhab: state.madhab,
        reciterId: state.reciterId,
        quranFontSize: state.quranFontSize,
        locationLat: state.locationLat,
        locationLng: state.locationLng,
        locationName: state.locationName,
        eyeComfort: state.eyeComfort,
        adhanEnabled: state.adhanEnabled,
        adhanSound: state.adhanSound,
        salawatEnabled: state.salawatEnabled,
        salawatInterval: state.salawatInterval,
        prayerReminderEnabled: state.prayerReminderEnabled,
        prayerReminderMinutes: state.prayerReminderMinutes,
        pushEnabled: state.pushEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          useSettingsStore.setState({
            locationLat: state.locationLat ?? 31.0421,
            locationLng: state.locationLng ?? 31.3428,
            locationName: state.locationName ?? "المنصورة",
            isLoaded: true,
          });
        }
      },
    }
  )
);
