import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

interface SocialLoginButtonProps {
  provider: 'google' | 'apple' | 'facebook';
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function SocialLoginButton({
  provider,
  onPress,
  disabled = false,
  style,
}: SocialLoginButtonProps) {
  const { colors } = useThemeContext();

  const getProviderConfig = () => {
    switch (provider) {
      case 'google':
        return {
          title: 'Continuer avec Google',
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937',
          borderColor: '#E5E7EB',
          icon: '🔍', // Placeholder - in production, use proper Google icon
        };
      case 'apple':
        return {
          title: 'Continuer avec Apple',
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
          borderColor: '#000000',
          icon: '🍎', // Placeholder - in production, use proper Apple icon
        };
      case 'facebook':
        return {
          title: 'Continuer avec Facebook',
          backgroundColor: '#1877F2',
          textColor: '#FFFFFF',
          borderColor: '#1877F2',
          icon: '📘', // Placeholder - in production, use proper Facebook icon
        };
      default:
        return {
          title: 'Continuer',
          backgroundColor: colors.surface,
          textColor: colors.text,
          borderColor: colors.border,
          icon: '🔗',
        };
    }
  };

  const config = getProviderConfig();

  const styles = StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: disabled ? colors.surfaceSecondary : config.backgroundColor,
      borderWidth: 1,
      borderColor: disabled ? colors.borderLight : config.borderColor,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    icon: {
      fontSize: 18,
      marginRight: 12,
    },
    text: {
      fontSize: 15,
      fontWeight: '500',
      color: disabled ? colors.textTertiary : config.textColor,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={config.title}
      accessibilityState={{ disabled }}
    >
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={styles.text}>{config.title}</Text>
    </TouchableOpacity>
  );
}