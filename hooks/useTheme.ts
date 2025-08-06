import { useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  primaryLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  border: string;
  borderLight: string;
  shadow: string;
  overlay: string;
}

const lightTheme: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F9FAFB',
  text: '#111827',
  textSecondary: '#374151',
  textTertiary: '#6B7280',
  primary: '#3B82F6',
  primaryLight: '#EBF8FF',
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const darkTheme: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceSecondary: '#334155',
  text: '#F8FAFC',
  textSecondary: '#E2E8F0',
  textTertiary: '#94A3B8',
  primary: '#60A5FA',
  primaryLight: '#1E3A8A',
  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#92400E',
  error: '#F87171',
  errorLight: '#7F1D1D',
  border: '#475569',
  borderLight: '#334155',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    // Load saved theme preference
    const loadTheme = async () => {
      try {
        const savedTheme = await import('expo-secure-store').then(store => 
          store.getItemAsync('theme')
        ).catch(() => null);
        
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setTheme(savedTheme as Theme);
        }
      } catch (error) {
        console.log('Could not load theme preference');
      }
    };

    loadTheme();

    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  const saveTheme = async (newTheme: Theme) => {
    try {
      const store = await import('expo-secure-store');
      await store.setItemAsync('theme', newTheme);
    } catch (error) {
      console.log('Could not save theme preference');
    }
  };

  const setThemePreference = (newTheme: Theme) => {
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const getActiveColorScheme = (): 'light' | 'dark' => {
    if (theme === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return theme === 'dark' ? 'dark' : 'light';
  };

  const colors = getActiveColorScheme() === 'dark' ? darkTheme : lightTheme;

  return {
    theme,
    setTheme: setThemePreference,
    colors,
    isDark: getActiveColorScheme() === 'dark',
    activeColorScheme: getActiveColorScheme(),
  };
}