// src/navigation/TabNavigator.tsx (Animated Version)
import React, { useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
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
    <Path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
  </Svg>
);

const NewsIcon = ({ color, size }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M22 3l-1.67 1.67L18.67 3 17 4.67 15.33 3l-1.66 1.67L12 3l-1.67 1.67L8.67 3 7 4.67 5.33 3 3.67 4.67 2 3v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V3zM11 19H4v-6h7v6zm9 0h-7v-2h7v2zm0-4h-7v-2h7v2zm0-4H4V8h16v3z" />
  </Svg>
);

const EmergencyIcon = ({ color, size }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </Svg>
);

// Custom Tab Bar Icon with Animation
type TabIconProps = {
  focused: boolean;
  Icon: React.FC<IconProps>;
  label: string;
};

const TabIcon = ({ focused, Icon, label }: TabIconProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const isEmergency = label === 'Emergency';
  const iconColor = focused ? '#FFFFFF' : '#666';

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
        focused && styles.tabItemActive,
        isEmergency && focused && styles.tabItemEmergency,
        { transform: [{ scale }] },
      ]}
    >
      <Icon color={iconColor} size={24} />
      <Text
        numberOfLines={1}
        style={[
          styles.tabLabel,
          focused && styles.tabLabelActive,
          isEmergency && focused && styles.tabLabelEmergency,
        ]}>
        {label}
      </Text>
      {focused && (
        <View style={[
          styles.tabIndicator,
          isEmergency && styles.tabIndicatorEmergency,
        ]} />
      )}
    </Animated.View>
  );
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#666',
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={HomeIcon} label="Home" />
          ),
        }}
      />
      
      <Tab.Screen
        name="RequestsTab"
        component={RequestsScreen}
        options={{
          tabBarLabel: 'Requests',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={RequestsIcon} label="Requests" />
          ),
        }}
      />
      
      <Tab.Screen
        name="NewsTab"
        component={NewsScreen}
        options={{
          tabBarLabel: 'News',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={NewsIcon} label="News" />
          ),
        }}
      />
      
      <Tab.Screen
        name="EmergencyTab"
        component={EmergencyScreen}
        options={{
          tabBarLabel: 'Emergency',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={EmergencyIcon} label="Emergency" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#F9F9F9',
    borderTopWidth: 1,
    borderTopColor: '#E4BEBA',
    height: Platform.OS === 'ios' ? 90 : 72,
    paddingBottom: Platform.OS === 'ios' ? 4 : 2,
    paddingTop: 14,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    minWidth: 68,
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
    fontSize: 10,
    fontWeight: '500',
    color: '#666',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  tabLabelEmergency: {
    color: '#FFFFFF',
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