// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Screens
import { ThemeProvider } from './assets/context/ThemeContext.tsx';
import TabNavigator from './assets/navigation/TabNavigator.tsx';
import ServiceIssuesScreen from './assets/screens/ServiceIssuesScreen.tsx';
import PhotosUploadScreen from './assets/screens/PhotosUploadScreen.tsx';
import ReviewReportScreen from './assets/screens/ReviewReportScreen.tsx';
import RequestDetailScreen from './assets/screens/RequestDetailScreen.tsx';
import SuccessScreen from './assets/screens/SuccessScreen.tsx';
import ArticleDetailScreen from './assets/screens/ArticleDetailScreen.tsx';
import ProfileScreen from './assets/screens/ProfileScreen.tsx';
import EditProfileScreen from './assets/screens/EditProfileScreen.tsx';
import FacilityRulesScreen from './assets/screens/FacilityRulesScreen.tsx';
import NotificationSettingsScreen from './assets/screens/NotificationSettingsScreen.tsx';
import HelpSupportScreen from './assets/screens/HelpSupportScreen.tsx';
import FAQScreen from './assets/screens/FAQScreen.tsx';
import ReportIssueScreen from './assets/screens/ReportIssueScreen.tsx';
import SupportChatScreen from './assets/screens/SupportChatScreen.tsx';
import LoginScreen from './assets/screens/LoginScreen.tsx';
import RegisterScreen from './assets/screens/RegisterScreen.tsx';
import OnboardingScreen from './assets/screens/OnboardingScreen.tsx';
import NotificationScreen from './assets/screens/NotificationScreen.tsx';
import NotificationDetailScreen from './assets/screens/NotificationDetailScreen.tsx';
import ChatScreen from './assets/screens/ChatScreen.tsx';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    const initUserData = async () => {
      try {
        const name = await AsyncStorage.getItem('userName');
        if (!name) {
          await AsyncStorage.setItem('userName', 'John Doe');
          await AsyncStorage.setItem('userLocation', 'North Hall, Room 402');
        }
      } catch (error) {
        console.log('Error initializing user data:', error);
      }
    };
    initUserData();
  }, []);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor="#F9F9F9" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
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
            <Stack.Screen name="Success" component={SuccessScreen} />
            <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="FacilityRules" component={FacilityRulesScreen} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
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