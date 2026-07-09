// src/navigation/TabNavigator.tsx (Animated Version)
import React, { useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import RequestsScreen from '../screens/RequestsScreen';
import NewsScreen from '../screens/NewsScreen';
import EmergencyScreen from '../screens/EmergencyScreen';

const Tab = createBottomTabNavigator();

type IconProps = { color: string; size: number };

// SVG Tab Icons (recolor via the `color` prop)
const HomeIcon = ({ color, size }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </Svg>
);

const RequestsIcon = ({ color, size }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M21.67 18.17l-5.3-5.3h-.99l-2.54 2.54v.99l5.3 5.3c.39.39 1.02.39 1.41 0l2.12-2.12c.39-.38.39-1.02 0-1.41zM17.34 10.19l1.41-1.41 2.12 2.12c1.17-1.17 1.17-3.07 0-4.24l-3.54-3.54-1.41 1.41V1.71L15.22 1l-3.54 3.54.71 1.41h2.83l-1.41 1.41 1.06 1.06-2.83 2.83-3.54-3.54c-1.17-1.17-3.07-1.17-4.24 0L1 11.22l1.41 1.41v2.83l3.54 3.54c1.17 1.17 3.07 1.17 4.24 0l3.54-3.54 1.41-1.41 2.12 2.12z" />
  </Svg>
);

const NewsIcon = ({ color, size }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11zm-2-9H6v2h12V7zm0 4H6v2h12v-2zm-6 4H6v2h6v-2z" />
  </Svg>
);

const EmergencyIcon = ({ color, size }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L3 21l3.38-1.97C7.92 20.26 9.87 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-1.63 0-3.16-.44-4.46-1.22l-.32-.19-2.09 1.21 1.21-2.09-.19-.32C5.44 15.16 5 13.63 5 12c0-3.86 3.14-7 7-7s7 3.14 7 7-3.14 7-7 7z" />
  </Svg>
);

// Custom Tab Bar Icon with Animation
type TabIconProps = {
  focused: boolean;
  Icon: React.FC<IconProps>;
  label: string;
};

const TabIcon = ({ focused, Icon, label, theme }: TabIconProps & { theme: any }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const isEmergency = label === 'Emergency';
  const iconColor = focused ? theme.primaryText : '#666';

  React.useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.1 : 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View
      style={[
        styles.tabItem,
        focused && { backgroundColor: theme.primary, shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
        isEmergency && focused && { backgroundColor: theme.primaryContainer, shadowColor: theme.primaryContainer, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
        { transform: [{ scale }] },
      ]}
    >
      <Icon color={iconColor} size={24} />
      <Text
        numberOfLines={1}
        style={[
          styles.tabLabel,
          focused && { color: theme.primaryText },
          isEmergency && focused && { color: theme.primaryText },
        ]}>
        {label}
      </Text>
    </Animated.View>
  );
};

import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabNavigator() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            height: 64 + insets.bottom,
            paddingBottom: insets.bottom,
          },
        ],
        tabBarActiveTintColor: theme.primaryText,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarIconStyle: {
          width: '100%',
          height: '100%',
        },
        tabBarItemStyle: {
          margin: 0,
          padding: 0,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={HomeIcon} label="Home" theme={theme} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Requests"
        component={RequestsScreen}
        options={{
          tabBarLabel: 'Requests',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={RequestsIcon} label="Requests" theme={theme} />
          ),
        }}
      />
      
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{
          tabBarLabel: 'News',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={NewsIcon} label="News" theme={theme} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{
          tabBarLabel: 'Emergency',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={EmergencyIcon} label="Emergency" theme={theme} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0d0d0d',
    borderTopWidth: 1,
    borderTopColor: '#0e0e0e',
    paddingTop: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 24,
    minWidth: 64,
    position: 'relative',
  },
  tabItemActive: {
    backgroundColor: '#D32F2F',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tabItemEmergency: {
    backgroundColor: '#AF101A',
    shadowColor: '#AF101A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#AAAAAA',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: '#121212',
  },
  tabLabelEmergency: {
    color: '#121212',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  tabIndicatorEmergency: {
    backgroundColor: '#FF4444',
  },
});