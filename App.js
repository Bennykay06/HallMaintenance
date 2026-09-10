// App.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registerForPushNotifications } from "./assets/utils/registerNotification";
import supabase from './lib/supabase';
import { registerPushToken } from './lib/api';
// Import Screens
import { ThemeProvider } from './assets/context/ThemeContext.tsx';
import TabNavigator from './assets/navigation/TabNavigator.tsx';
import AppointmentsScreen from './assets/screens/AppointmentsScreen.tsx';
import ArticleDetailScreen from './assets/screens/ArticleDetailScreen.tsx';
import EditProfileScreen from './assets/screens/EditProfileScreen.tsx';
import FacilityRulesScreen from './assets/screens/FacilityRulesScreen.tsx';
import FAQScreen from './assets/screens/FAQScreen.tsx';
import HelpSupportScreen from './assets/screens/HelpSupportScreen.tsx';
import LoginScreen from './assets/screens/LoginScreen.tsx';
import NotificationDetailScreen from './assets/screens/NotificationDetailScreen.tsx';
import NotificationScreen from './assets/screens/NotificationScreen.tsx';
import NotificationSettingsScreen from './assets/screens/NotificationSettingsScreen.tsx';
import OnboardingScreen from './assets/screens/OnboardingScreen.tsx';
import PhotosUploadScreen from './assets/screens/PhotosUploadScreen.tsx';
import ProfileScreen from './assets/screens/ProfileScreen.tsx';
import RegisterScreen from './assets/screens/RegisterScreen.tsx';
import ReportIssueScreen from './assets/screens/ReportIssueScreen.tsx';
import RequestDetailScreen from './assets/screens/RequestDetailScreen.tsx';
import ReviewReportScreen from './assets/screens/ReviewReportScreen.tsx';
import ServiceIssuesScreen from './assets/screens/ServiceIssuesScreen.tsx';
import SuccessScreen from './assets/screens/SuccessScreen.tsx';
import SupportChatScreen from './assets/screens/SupportChatScreen.tsx';

const Stack = createStackNavigator();

// Lets code outside the component tree (the deep-link handler below) drive
// navigation once a confirmation link establishes a session — the link can
// arrive while any screen is on top, or before the app has even mounted.
const navigationRef = createNavigationContainerRef();

/**
 * Supabase's "Confirm signup" / magic-link emails redirect to
 * resifix://confirm-email#access_token=...&refresh_token=...&type=signup
 * (the tokens are in the URL fragment — this is the implicit flow, same one
 * the web dashboard's Login.jsx parses out of window.location.hash).
 *
 * React Native has no URL bar for supabase-js to read that fragment from
 * automatically (lib/supabase.ts sets detectSessionInUrl: false for exactly
 * this reason), so it's parsed here and the session is set explicitly.
 *
 * NOTE: this only works from a custom dev client or a standalone/EAS build.
 * Expo Go does not register third-party apps' custom URL schemes, so a link
 * tapped from an email app has nothing to hand off to — it either opens a
 * browser or does nothing. This app must be running as its own build (not
 * inside Expo Go) for tapping the confirmation link to do anything at all.
 */
const handleAuthDeepLink = async (url) => {
  if (!url || !url.includes('access_token')) return;

  try {
    const fragment = url.split('#')[1] ?? url.split('?')[1] ?? '';
    const params = new URLSearchParams(fragment);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const type = params.get('type');

    // Only handle signup confirmations here. A password-recovery link
    // carries the same shape of tokens but needs its own "set a new
    // password" screen before landing the user anywhere — that screen
    // doesn't exist yet (LoginScreen's "Forgot Password" redirect is a
    // separate, still-unfinished piece), so leave those links alone rather
    // than dropping a recovery session straight into Onboarding.
    if (type !== 'signup') return;
    if (!access_token || !refresh_token) return;

    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) {
      console.log('[deep link] setSession failed:', error.message);
      return;
    }

    if (navigationRef.isReady()) {
      navigationRef.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
    }
  } catch (err) {
    console.log('[deep link] failed to handle auth callback:', err);
  }
};

export default function App() {
  // --- Automatic sign-in -------------------------------------------------
  // supabase-js persists the session to AsyncStorage (see lib/supabase.ts), so
  // a returning student already has a valid one at launch. Choosing the first
  // screen from that session — rather than always opening Login — is what
  // makes the app resume where they left off.
  //
  // null means "still deciding": the navigator is not mounted until we know,
  // because initialRouteName is only read once.
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const finish = (route) => {
      if (!cancelled) setInitialRoute(route);
    };

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          finish('Login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_setup_complete')
          .eq('id', session.user.id)
          .maybeSingle();

        // A missing profile row, or an address that is not yet complete, both
        // mean onboarding still has to run. Only a finished profile goes
        // straight through to the app.
        finish(profile?.is_setup_complete === true ? 'MainTabs' : 'Onboarding');
      } catch (err) {
        console.log('[startup] could not restore session:', err?.message);
        finish('Login');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Cold start (app opened by tapping the link) and warm start (app already
  // running, link tapped) arrive through two different APIs.
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) handleAuthDeepLink(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleAuthDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  // A placeholder identity used to be seeded here on first launch —
  // "John Doe" / "North Hall, Room 402". The screens read that cached name,
  // and nothing on the login path replaced it, so whoever signed in was
  // greeted as John Doe. The signed-in account is the only source of the
  // name now, so there is nothing to seed.
  // Re-register the device token whenever a session exists. Tokens are keyed
  // to the user, so this has to wait for sign-in rather than run once at
  // launch — at cold start there may be no session yet.
  useEffect(() => {
    const registerToken = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) return;

        const token = await registerForPushNotifications();
        if (token) await registerPushToken(token);
      } catch (err) {
        console.log('Error registering push token:', err);
      }
    };

    registerToken();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') registerToken();
    });

    return () => listener.subscription.unsubscribe();
  }, []);


  // Held until the stored session has been checked, so the app never flashes
  // the login screen at somebody who is already signed in.
  if (!initialRoute) {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar style="dark" backgroundColor="#F9F9F9" />
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F9F9F9',
            }}
          >
            <ActivityIndicator size="large" color="#AF101A" />
          </View>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor="#F9F9F9" />
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            {/* Auth Screens */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            
            {/* Main Tab Navigator */}
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            
            {/* Modal/Full Screen Screens */}
            <Stack.Screen name="ServiceIssues" component={ServiceIssuesScreen} />
            <Stack.Screen name="PhotosUpload" component={PhotosUploadScreen} />
            <Stack.Screen name="ReviewReport" component={ReviewReportScreen} />
            <Stack.Screen name="RequestDetail" component={RequestDetailScreen} />
            <Stack.Screen name="Appointments" component={AppointmentsScreen} />
            <Stack.Screen name="Success" component={SuccessScreen} />
            <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="FacilityRules" component={FacilityRulesScreen} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            <Stack.Screen name="FAQ" component={FAQScreen} />
            <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
            <Stack.Screen name="SupportChat" component={SupportChatScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}