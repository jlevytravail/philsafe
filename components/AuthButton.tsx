import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, View } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export default function AuthButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  style,
}: AuthButtonProps) {
  const { colors } = useThemeContext();

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 24,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled || loading ? colors.textTertiary : colors.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled || loading ? colors.borderLight : colors.surfaceSecondary,
          shadowOpacity: 0.05,
          elevation: 2,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled || loading ? colors.borderLight : colors.border,
          shadowOpacity: 0,
          elevation: 0,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: '600' as const,
        };
      case 'secondary':
        return {
          color: colors.text,
          fontSize: 16,
          fontWeight: '600' as const,
        };
      case 'outline':
        return {
          color: disabled || loading ? colors.textTertiary : colors.text,
          fontSize: 16,
          fontWeight: '500' as const,
        };
      default:
        return {
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: '600' as const,
        };
    }
  };

  const styles = StyleSheet.create({
    button: getButtonStyle(),
    buttonText: getTextStyle(),
    iconContainer: {
      marginRight: icon ? 8 : 0,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#FFFFFF' : colors.primary} 
        />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={styles.buttonText}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}