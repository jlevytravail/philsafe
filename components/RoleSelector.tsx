import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Users, UserCheck } from 'lucide-react-native';
import { useThemeContext } from '@/context/ThemeContext';

interface RoleSelectorProps {
  selectedRole: 'aidant' | 'intervenant';
  onRoleChange: (role: 'aidant' | 'intervenant') => void;
  disabled?: boolean;
}

export default function RoleSelector({ selectedRole, onRoleChange, disabled = false }: RoleSelectorProps) {
  const { colors } = useThemeContext();

  const roles = [
    {
      value: 'aidant' as const,
      label: 'Proche aidant',
      description: 'J\'accompagne un proche dans ses soins quotidiens',
      icon: Users,
    },
    {
      value: 'intervenant' as const,
      label: 'Professionnel de santé',
      description: 'Je suis un professionnel intervenant à domicile',
      icon: UserCheck,
    },
  ];

  const styles = StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: 12,
    },
    optionsContainer: {
      gap: 12,
    },
    option: {
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    selectedOption: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    disabledOption: {
      opacity: 0.5,
    },
    optionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    optionIcon: {
      marginRight: 12,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    selectedOptionTitle: {
      color: colors.primary,
    },
    optionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    selectedOptionDescription: {
      color: colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>Je suis *</Text>
      
      <View style={styles.optionsContainer}>
        {roles.map((role) => {
          const isSelected = selectedRole === role.value;
          const IconComponent = role.icon;
          
          return (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.option,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isSelected && [styles.selectedOption, { borderColor: colors.primary, backgroundColor: colors.primaryLight }],
                disabled && styles.disabledOption
              ]}
              onPress={() => onRoleChange(role.value)}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, disabled }}
              accessibilityLabel={`${role.label}: ${role.description}`}
            >
              <View style={styles.optionHeader}>
                <View style={styles.optionIcon}>
                  <IconComponent 
                    size={20} 
                    color={isSelected ? colors.primary : colors.textTertiary} 
                  />
                </View>
                <Text style={[
                  styles.optionTitle,
                  { color: colors.text },
                  isSelected && [styles.selectedOptionTitle, { color: colors.primary }]
                ]}>
                  {role.label}
                </Text>
              </View>
              <Text style={[
                styles.optionDescription,
                { color: colors.textSecondary },
                isSelected && [styles.selectedOptionDescription, { color: colors.primary }]
              ]}>
                {role.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}