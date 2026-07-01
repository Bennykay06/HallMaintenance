// src/hooks/useDynamicStyles.ts
import { useTheme } from '../context/ThemeContext';
import { StyleSheet } from 'react-native';

export const useDynamicStyles = () => {
  const { theme } = useTheme();

  const dynamicStyles = StyleSheet.create({
    // Container
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    
    // Header
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      height: 56,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.primary,
    },
    
    // Text
    textPrimary: {
      color: theme.text,
    },
    textSecondary: {
      color: theme.textSecondary,
    },
    textWhite: {
      color: '#FFFFFF',
    },
    
    // Buttons
    primaryButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    outlineButton: {
      borderWidth: 2,
      borderColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: 'transparent',
    },
    outlineButtonText: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    
    // Cards
    card: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    
    // Inputs
    input: {
      backgroundColor: theme.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text,
    },
    
    // Badge
    badge: {
      backgroundColor: theme.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },
    
    // Tab Bar
    tabBar: {
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    tabItemActive: {
      backgroundColor: theme.primary,
    },
    tabItemInactive: {
      backgroundColor: 'transparent',
    },
    
    // FAB
    fab: {
      backgroundColor: theme.primary,
      shadowColor: theme.primary,
    },
    
    // Gradient
    gradient: {
      colors: [theme.gradientStart, theme.gradientEnd],
    },
  });

  return { theme, dynamicStyles };
};