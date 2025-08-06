import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Moon, Monitor } from 'lucide-react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { Theme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, setTheme, colors, isDark } = useThemeContext();

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    {
      value: 'light',
      label: 'Clair',
      icon: <Sun size={20} color={theme === 'light' ? colors.primary : colors.textTertiary} />
    },
    {
      value: 'dark',
      label: 'Sombre',
      icon: <Moon size={20} color={theme === 'dark' ? colors.primary : colors.textTertiary} />
    },
    {
      value: 'system',
      label: 'Système',
      icon: <Monitor size={20} color={theme === 'system' ? colors.primary : colors.textTertiary} />
    }
  ];

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: colors.border,
    },
    option: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      gap: 6,
    },
    activeOption: {
      backgroundColor: colors.primaryLight,
    },
    optionText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textTertiary,
    },
    activeOptionText: {
      color: colors.primary,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      {themeOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.option,
            theme === option.value && styles.activeOption
          ]}
          onPress={() => setTheme(option.value)}
          accessibilityRole="button"
          accessibilityLabel={`Basculer vers le thème ${option.label.toLowerCase()}`}
          accessibilityState={{ selected: theme === option.value }}
        >
          {option.icon}
          <Text style={[
            styles.optionText,
            theme === option.value && styles.activeOptionText
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}