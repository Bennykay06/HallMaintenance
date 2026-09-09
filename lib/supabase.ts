// lib/supabase.ts
// The single Supabase client for the mobile app.
//
// Replaces the hand-written fake `supabase` object that used to live in
// config.js and talk to mock-server.js on port 3001. Auth, data and file
// storage now all go to the same project the admin dashboard uses, which
// is what makes a report filed here show up there.
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Fail loudly and early. The old client silently fell back to a mock when
// configuration was missing, which meant a misconfigured build looked like
// it worked while writing everything to a dead end.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase is not configured.\n\n' +
      'Copy .env.example to .env and fill in EXPO_PUBLIC_SUPABASE_URL and ' +
      'EXPO_PUBLIC_SUPABASE_ANON_KEY from your project dashboard\n' +
      '(Project Settings -> API), then restart Expo with `npx expo start -c`.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Sessions survive an app restart, so a student stays signed in.
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // React Native has no URL bar for Supabase to parse a session out of.
    detectSessionInUrl: false,
  },
  realtime: {
    params: { eventsPerSecond: 5 },
  },
});

export default supabase;
