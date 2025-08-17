import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Users, UserCheck, RefreshCw, AlertTriangle } from 'lucide-react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useSessionUser, useUser } from '@/context/UserContext';
import { useRoleNavigation } from '@/hooks/useRoleNavigation';

interface RoleTestingPanelProps {
  onClose?: () => void;
}

/**
 * Composant de test pour le changement de rôle (DEV uniquement)
 * Permet de tester facilement la navigation basée sur les rôles
 */
export default function RoleTestingPanel({ onClose }: RoleTestingPanelProps) {
  const { colors } = useThemeContext();
  const { profile } = useSessionUser();
  const { updateUserProfile, loading } = useUser();
  const { currentRole, currentStack, isInCorrectStack, navigateToCurrentRoleHome } = useRoleNavigation();

  const handleRoleChange = async (newRole: 'aidant' | 'intervenant') => {
    console.log('🧪 Testing role change:', { from: currentRole, to: newRole });
    
    const { error } = await updateUserProfile({ role: newRole });
    if (error) {
      console.error('❌ Role change failed:', error);
    } else {
      console.log('✅ Role changed successfully, auto-navigation should occur');
      // La navigation automatique se fera via le AuthNavigator
    }
  };

  const handleForceNavigation = () => {
    console.log('🔄 Force navigation to current role home');
    navigateToCurrentRoleHome();
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      margin: 16,
      borderWidth: 2,
      borderColor: colors.warning,
      borderStyle: 'dashed',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.warning,
      marginLeft: 8,
      flex: 1,
    },
    closeButton: {
      padding: 4,
    },
    closeText: {
      color: colors.textTertiary,
      fontSize: 12,
    },
    info: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    label: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    value: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    statusBadge: {
      fontSize: 12,
      fontWeight: '600',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    correctStatus: {
      backgroundColor: colors.success + '20',
      color: colors.success,
    },
    incorrectStatus: {
      backgroundColor: colors.error + '20',
      color: colors.error,
    },
    buttons: {
      gap: 8,
    },
    roleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    activeRole: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    activeButtonText: {
      color: '#FFFFFF',
    },
    utilityButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.primaryLight,
      gap: 8,
    },
    utilityButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.primary,
    },
    warning: {
      fontSize: 12,
      color: colors.textTertiary,
      textAlign: 'center',
      marginTop: 8,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AlertTriangle size={20} color={colors.warning} />
        <Text style={styles.title}>Panel de Test - Navigation par Rôle</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Rôle actuel :</Text>
          <Text style={styles.value}>{currentRole || 'Non défini'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Stack actuelle :</Text>
          <Text style={styles.value}>{currentStack}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Navigation :</Text>
          <Text style={[
            styles.statusBadge,
            isInCorrectStack ? styles.correctStatus : styles.incorrectStatus
          ]}>
            {isInCorrectStack ? 'Correcte' : 'Incorrecte'}
          </Text>
        </View>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            currentRole === 'aidant' && styles.activeRole
          ]}
          onPress={() => handleRoleChange('aidant')}
          disabled={loading}
        >
          <Users size={16} color={currentRole === 'aidant' ? '#FFFFFF' : colors.text} />
          <Text style={[
            styles.buttonText,
            currentRole === 'aidant' && styles.activeButtonText
          ]}>
            Basculer vers Aidant
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            currentRole === 'intervenant' && styles.activeRole
          ]}
          onPress={() => handleRoleChange('intervenant')}
          disabled={loading}
        >
          <UserCheck size={16} color={currentRole === 'intervenant' ? '#FFFFFF' : colors.text} />
          <Text style={[
            styles.buttonText,
            currentRole === 'intervenant' && styles.activeButtonText
          ]}>
            Basculer vers Intervenant
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.utilityButton}
          onPress={handleForceNavigation}
          disabled={!currentRole}
        >
          <RefreshCw size={16} color={colors.primary} />
          <Text style={styles.utilityButtonText}>
            Forcer Navigation
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.warning}>
        ⚠️ Panel de développement - Masquer en production
      </Text>
    </View>
  );
}