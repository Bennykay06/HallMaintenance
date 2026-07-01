// src/config/hallThemes.ts
export interface HallTheme {
  primary: string;
  primaryContainer: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceContainer: string;
  text: string;
  textSecondary: string;
  border: string;
  gradientStart: string;
  gradientEnd: string;
  accent: string;
  primaryText: string;
  name: string;
  icon: string;
}

export const HALL_THEMES: Record<string, HallTheme> = {
  'Unity Hall': {
    primary: '#AF101A',
    primaryContainer: '#D32F2F',
    secondary: '#B51A1B',
    background: '#F9F9F9',
    surface: '#FFFFFF',
    surfaceContainer: '#F3F3F3',
    text: '#1A1C1C',
    textSecondary: '#5B403D',
    border: '#E4BEBA',
    gradientStart: '#AF101A',
    gradientEnd: '#D32F2F',
    accent: '#FFDAD6',
    primaryText: '#FFFFFF',
    name: 'Unity Hall',
    icon: '🏛️',
  },
  'Independence Hall': {
    primary: '#AF101A',
    primaryContainer: '#D32F2F',
    secondary: '#B51A1B',
    background: '#F9F9F9',
    surface: '#FFFFFF',
    surfaceContainer: '#F3F3F3',
    text: '#1A1C1C',
    textSecondary: '#5B403D',
    border: '#E4BEBA',
    gradientStart: '#AF101A',
    gradientEnd: '#D32F2F',
    accent: '#FFDAD6',
    primaryText: '#FFFFFF',
    name: 'Independence Hall',
    icon: '🦅',
  },
  'University Hall (Katanga)': {
    primary: '#FFCB05',
    primaryContainer: '#E5B700',
    secondary: '#1E1E1E',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceContainer: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#333333',
    gradientStart: '#FFCB05',
    gradientEnd: '#E5B700',
    accent: '#332900',
    primaryText: '#000000',
    name: 'University Hall (Katanga)',
    icon: '🦁',
  },
  'Republic Hall': {
    primary: '#1B5E20',
    primaryContainer: '#2E7D32',
    secondary: '#1B5E20',
    background: '#F1F8F1',
    surface: '#FFFFFF',
    surfaceContainer: '#E8F5E9',
    text: '#1A1C1C',
    textSecondary: '#5B403D',
    border: '#C8E6C9',
    gradientStart: '#1B5E20',
    gradientEnd: '#2E7D32',
    accent: '#E8F5E9',
    primaryText: '#FFFFFF',
    name: 'Republic Hall',
    icon: '🏛️',
  },
  'Queens Hall': {
    primary: '#006994',
    primaryContainer: '#1A5276',
    secondary: '#006994',
    background: '#F0F8FF',
    surface: '#FFFFFF',
    surfaceContainer: '#E3F2FD',
    text: '#1A1C1C',
    textSecondary: '#5B403D',
    border: '#B3D9E8',
    gradientStart: '#006994',
    gradientEnd: '#1A5276',
    accent: '#E3F2FD',
    primaryText: '#FFFFFF',
    name: 'Queens Hall',
    icon: '👑',
  },
  'Africa Hall': {
    primary: '#F5C518',
    primaryContainer: '#FFD700',
    secondary: '#1A1A1A',
    background: '#FFFDF5',
    surface: '#FFFFFF',
    surfaceContainer: '#FEF9E7',
    text: '#1A1C1C',
    textSecondary: '#5B403D',
    border: '#F9E79F',
    gradientStart: '#F5C518',
    gradientEnd: '#FFD700',
    accent: '#FEF9E7',
    primaryText: '#1A1C1C',
    name: 'Africa Hall',
    icon: '🌍',
  },
};

export const getHallTheme = (hallName: string): HallTheme => {
  return HALL_THEMES[hallName] || HALL_THEMES['Unity Hall'];
};