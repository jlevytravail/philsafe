import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useThemeContext } from '@/context/ThemeContext';

interface AuthInputProps extends Omit<TextInputProps, 'style' | 'onBlur'> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  isPassword?: boolean;
  required?: boolean;
  onBlur?: () => void;
}

export default function AuthInput({
  label,
  icon,
  error,
  isPassword = false,
  required = false,
  onBlur,
  ...textInputProps
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { colors } = useThemeContext();

  const hasError = Boolean(error);

  const styles = StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    required: {
      color: colors.error,
      marginLeft: 2,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: hasError ? colors.error : colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    inputWrapperFocused: {
      borderColor: colors.primary,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    inputIcon: {
      marginRight: 12,
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      paddingVertical: 0, // Remove default padding for consistent height
    },
    passwordToggle: {
      padding: 4,
      marginLeft: 8,
    },
    errorContainer: {
      marginTop: 6,
      marginLeft: 4,
    },
    errorText: {
      fontSize: 12,
      color: colors.error,
      lineHeight: 16,
    },
    successIndicator: {
      marginLeft: 8,
    },
  });

  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
          {required && <Text style={[styles.required, { color: colors.error }]}> *</Text>}
        </Text>
      </View>
      
      <View style={[
        styles.inputWrapper,
        { backgroundColor: colors.surface, borderColor: hasError ? colors.error : colors.border },
        isFocused && [styles.inputWrapperFocused, { borderColor: colors.primary }]
      ]}>
        {icon && (
          <View style={styles.inputIcon}>
            {icon}
          </View>
        )}
        
        <TextInput
          {...textInputProps}
          style={[styles.textInput, { color: colors.text }]}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={isPassword && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={label}
          accessibilityHint={error || undefined}
        />
        
        {isPassword && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            accessibilityRole="button"
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.textTertiary} />
            ) : (
              <Eye size={20} color={colors.textTertiary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      )}
    </View>
  );
}