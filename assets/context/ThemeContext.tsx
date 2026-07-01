// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HallTheme, getHallTheme } from '../config/HallThemes';

interface ThemeContextType {
  theme: HallTheme;
  setHall: (hallName: string) => void;
  hallName: string;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: getHallTheme('Unity Hall'),
  setHall: () => {},
  hallName: 'Unity Hall',
  isLoading: true,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hallName, setHallName] = useState('Unity Hall');
  const [theme, setTheme] = useState<HallTheme>(getHallTheme('Unity Hall'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHall();
  }, []);

  const loadHall = async () => {
    try {
      const hall = await AsyncStorage.getItem('userHall');
      if (hall) {
        setHallName(hall);
        setTheme(getHallTheme(hall));
      }
    } catch (error) {
      console.log('Error loading hall:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setHall = (hall: string) => {
    setHallName(hall);
    setTheme(getHallTheme(hall));
    AsyncStorage.setItem('userHall', hall);
  };

  return (
    <ThemeContext.Provider value={{ theme, setHall, hallName, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};