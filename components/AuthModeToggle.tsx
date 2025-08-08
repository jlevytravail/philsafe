import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LogIn, UserPlus } from 'lucide-react-native';
import { useThemeContext } from '@/context/ThemeContext';

interface AuthModeToggleProps {
  mode: 'login' | 'signup';
  onModeChange: (mode: 'login' | 'signup') => void;
}

export default function AuthModeToggle({ mode, onModeChange }: AuthModeToggleProps) {
  const { colors } = useThemeContext();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      padding: 4,
      flexDirection: 'row',
      marginBottom: 24,
    },
    option: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 8,
    },
    activeOption: {
      backgroundColor: colors.primary,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 3,
    },
    optionText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textTertiary,
    },
    activeOptionText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceSecondary }]}>
      <TouchableOpacity
        style={[
          styles.option,
          mode === 'login' && [styles.activeOption, { backgroundColor: colors.primary }]
        ]}
        onPress={() => onModeChange('login')}
        accessibilityRole="tab"
        accessibilityState={{ selected: mode === 'login' }}
        accessibilityLabel="Mode connexion"
      >
        <LogIn size={16} color={mode === 'login' ? '#FFFFFF' : colors.textTertiary} />
        <Text style={[
          styles.optionText,
          { color: colors.textTertiary },
          mode === 'login' && styles.activeOptionText
        ]}>
          Connexion
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.option,
          mode === 'signup' && [styles.activeOption, { backgroundColor: colors.primary }]
        ]}
        onPress={() => onModeChange('signup')}
        accessibilityRole="tab"
        accessibilityState={{ selected: mode === 'signup' }}
        accessibilityLabel="Mode inscription"
      >
        <UserPlus size={16} color={mode === 'signup' ? '#FFFFFF' : colors.textTertiary} />
        <Text style={[
          styles.optionText,
          { color: colors.textTertiary },
          mode === 'signup' && styles.activeOptionText
        ]}>
          Inscription
        </Text>
      </TouchableOpacity>
    </View>
  );
}