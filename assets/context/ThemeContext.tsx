// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HallTheme, getHallTheme, DEFAULT_HALL_NAME } from '../config/HallThemes';
import { getMyProfile } from '../../lib/api';
import supabase from '../../lib/supabase';

interface ThemeContextType {
  theme: HallTheme;
  setHall: (hallName: string) => void;
  hallName: string;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: getHallTheme(DEFAULT_HALL_NAME),
  setHall: () => {},
  hallName: DEFAULT_HALL_NAME,
  isLoading: true,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hallName, setHallName] = useState(DEFAULT_HALL_NAME);
  const [theme, setTheme] = useState<HallTheme>(getHallTheme(DEFAULT_HALL_NAME));
  const [isLoading, setIsLoading] = useState(true);

  const applyHall = (hall?: string | null) => {
    const name = String(hall ?? '').trim();
    if (!name) return false;
    setHallName(name);
    setTheme(getHallTheme(name));
    return true;
  };

  /**
   * The signed-in account is the source of truth for which hall a student is
   * in, so it is the source of truth for their colours.
   *
   * This used to read AsyncStorage and stop there. AsyncStorage is per-device,
   * not per-account, and only Onboarding ever wrote to it - so any student who
   * skipped onboarding (which is everyone whose profile is already complete,
   * because App.js routes them straight to MainTabs) got whatever hall the
   * last person on that phone had chosen, or, on a fresh install, the
   * hardcoded Unity Hall default. That is why a Republic Hall student could
   * sign in and be greeted by a red UI.
   */
  const syncHallFromAccount = async () => {
    try {
      const profile = await getMyProfile();
      if (profile?.hallName && applyHall(profile.hallName)) {
        // Keep the cache warm so the next cold start paints the right colour
        // immediately instead of flashing red while the profile loads.
        await AsyncStorage.setItem('userHall', profile.hallName);
        return true;
      }
    } catch (err: any) {
      // Offline is not a reason to repaint the app someone else's colour, so
      // whatever the cache gave us stays.
      console.log('[theme] could not read hall from account:', err?.message ?? err);
    }
    return false;
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // First paint from the cache: instant, and usually right.
      try {
        const cached = await AsyncStorage.getItem('userHall');
        if (!cancelled) applyHall(cached);
      } catch (err) {
        console.log('[theme] could not read cached hall:', err);
      }

      // Then correct it from the account, which is authoritative.
      if (!cancelled) await syncHallFromAccount();
      if (!cancelled) setIsLoading(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // A different student may have just signed in on this device.
        syncHallFromAccount();
      } else if (event === 'SIGNED_OUT') {
        // Don't leave one student's hall colours on the login screen for the
        // next person, and don't leave a stale hall in the cache for them to
        // inherit at first paint.
        setHallName(DEFAULT_HALL_NAME);
        setTheme(getHallTheme(DEFAULT_HALL_NAME));
        AsyncStorage.removeItem('userHall').catch(() => {});
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Used by Onboarding, where the hall is being chosen and there is nothing on
  // the server to read back yet.
  const setHall = (hall: string) => {
    if (!applyHall(hall)) return;
    AsyncStorage.setItem('userHall', hall).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ theme, setHall, hallName, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};
