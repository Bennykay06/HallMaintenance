// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Screens
import TabNavigator from './assets/navigation/TabNavigator.tsx';
import ServiceIssuesScreen from './assets/screens/ServiceIssuesScreen.tsx';
import PhotosUploadScreen from './assets/screens/PhotosUploadScreen.tsx';
import ReviewReportScreen from './assets/screens/ReviewReportScreen.tsx';
import SuccessScreen from './assets/screens/SuccessScreen.tsx';
import ArticleDetailScreen from './assets/screens/ArticleDetailScreen.tsx';

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
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#F9F9F9" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MainTabs"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          {/* Main Tab Navigator */}
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          
          {/* Modal/Full Screen Screens */}
          <Stack.Screen name="ServiceIssues" component={ServiceIssuesScreen} />
          <Stack.Screen name="PhotosUpload" component={PhotosUploadScreen} />
          <Stack.Screen name="ReviewReport" component={ReviewReportScreen} />
          <Stack.Screen name="Success" component={SuccessScreen} />
          <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}