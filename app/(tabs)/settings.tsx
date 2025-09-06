import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, User, Bell, Heart, Phone, Mail, Shield, CircleHelp as HelpCircle, ChevronRight, TestTube, Activity } from 'lucide-react-native';
import { Users, UserCheck, LogOut } from 'lucide-react-native';
import NotificationService from '@/utils/notifications';
import { Notification } from '@/types';
import { useThemeContext } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useSessionUser, useUser } from '@/context/UserContext';
import { useRoleNavigation } from '@/hooks/useRoleNavigation';
import { useRouter } from 'expo-router';
import ThemeToggle from '@/components/ThemeToggle';
import RoleTestingPanel from '@/components/RoleTestingPanel';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [emergencyAlertsEnabled, setEmergencyAlertsEnabled] = React.useState(true);
  const [showRoleTesting, setShowRoleTesting] = React.useState(__DEV__); // Afficher seulement en dev
  const { colors } = useThemeContext();
  const { signOut } = useAuth();
  const { profile } = useSessionUser();
  const { updateUserProfile } = useUser();
  const { navigateToCurrentRoleHome } = useRoleNavigation();
  const router = useRouter();

  const triggerTestNotification = () => {
    const testNotification: Notification = {
      id: Date.now().toString(),
      title: 'Test de notification',
      message: 'Marie Dubois vient d\'arriver chez Mme Dupont pour les soins du matin',
      timestamp: new Date().toISOString(),
      type: 'info',
      read: false
    };
    
    NotificationService.getInstance().simulateNotification(testNotification);
  };

  const openImportDiagnostic = () => {
    // Temporaire : utiliser test-data en attendant que import-diagnostic soit détecté
    router.push('/test-data');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleRoleUpdate = async (newRole: 'intervenant' | 'aidant') => {
    console.log('Changing role to:', newRole);
    const { error } = await updateUserProfile({ role: newRole });
    if (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
    } else {
      console.log('Role updated successfully, navigating to new role home');
      // Naviguer vers la nouvelle interface après changement de rôle
      setTimeout(() => {
        navigateToCurrentRoleHome();
      }, 500); // Petit délai pour que le contexte se mette à jour
    }
  };

  const RoleSelector = () => (
    <View style={[styles.roleSelector, { backgroundColor: colors.surface }]}>
      <Text style={[styles.roleSelectorTitle, { color: colors.textTertiary }]}>Interface utilisateur</Text>
      <View style={[styles.roleOptions, { backgroundColor: colors.surfaceSecondary }]}>
        <TouchableOpacity
          style={[
            styles.roleOption,
            profile?.role === 'aidant' && [styles.activeRoleOption, { backgroundColor: colors.primary }]
          ]}
          onPress={() => handleRoleUpdate('aidant')}
        >
          <Users size={16} color={profile?.role === 'aidant' ? '#FFFFFF' : colors.textTertiary} />
          <Text style={[
            styles.roleOptionText,
            { color: colors.textTertiary },
            profile?.role === 'aidant' && styles.activeRoleOptionText
          ]}>
            Proche aidant
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.roleOption,
            profile?.role === 'intervenant' && [styles.activeRoleOption, { backgroundColor: colors.primary }]
          ]}
          onPress={() => handleRoleUpdate('intervenant')}
        >
          <UserCheck size={16} color={profile?.role === 'intervenant' ? '#FFFFFF' : colors.textTertiary} />
          <Text style={[
            styles.roleOptionText,
            { color: colors.textTertiary },
            profile?.role === 'intervenant' && styles.activeRoleOptionText
          ]}>
            Professionnel de santé
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || <ChevronRight size={20} color="#9CA3AF" />}
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      marginLeft: 8,
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      backgroundColor: colors.surface,
      marginTop: 16,
      paddingVertical: 8,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
    },
    settingSubtitle: {
      fontSize: 14,
      marginTop: 2,
    },
    roleSelector: {
      marginTop: 16,
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    roleSelectorTitle: {
      fontSize: 14,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 16,
    },
    roleOptions: {
      flexDirection: 'row',
      borderRadius: 12,
      padding: 4,
    },
    roleOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 8,
    },
    activeRoleOption: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 3,
    },
    roleOptionText: {
      fontSize: 14,
      fontWeight: '500',
    },
    activeRoleOptionText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    themeSection: {
      backgroundColor: colors.surface,
      marginTop: 16,
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    themeSectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 16,
    },
    footer: {
      padding: 20,
      alignItems: 'center',
      marginTop: 32,
    },
    appVersion: {
      fontSize: 14,
      color: colors.textTertiary,
      fontWeight: '500',
    },
    footerText: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 4,
      textAlign: 'center',
    },
  });
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.titleContainer}>
          <Settings size={28} color="#3B82F6" />
          <Text style={[styles.title, { color: colors.text }]}>Paramètres</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <RoleSelector />

        <View style={styles.themeSection}>
          <Text style={styles.themeSectionTitle}>Apparence</Text>
          <ThemeToggle />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Profil</Text>
          <SettingItem
            icon={<User size={20} color="#6B7280" />}
            title={profile?.full_name || 'Utilisateur'}
            subtitle={profile?.role === 'aidant' ? 'Proche aidant' : 'Professionnel de santé'}
          />
          <SettingItem
            icon={<Phone size={20} color="#6B7280" />}
            title="Téléphone"
            subtitle={profile?.phone_number || 'Non renseigné'}
          />
          <SettingItem
            icon={<Mail size={20} color="#6B7280" />}
            title="Email"
            subtitle={profile?.email || 'Non renseigné'}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Notifications</Text>
          <SettingItem
            icon={<Bell size={20} color="#6B7280" />}
            title="Notifications push"
            subtitle="Recevoir les alertes en temps réel"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={notificationsEnabled ? '#FFFFFF' : '#9CA3AF'}
              />
            }
          />
          <SettingItem
            icon={<Heart size={20} color="#EF4444" />}
            title="Alertes d'urgence"
            subtitle="Notifications prioritaires"
            rightElement={
              <Switch
                value={emergencyAlertsEnabled}
                onValueChange={setEmergencyAlertsEnabled}
                trackColor={{ false: '#E5E7EB', true: '#EF4444' }}
                thumbColor={emergencyAlertsEnabled ? '#FFFFFF' : '#9CA3AF'}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Sécurité et confidentialité</Text>
          <SettingItem
            icon={<Shield size={20} color="#6B7280" />}
            title="Confidentialité des données"
            subtitle="Gérer l'utilisation de vos données"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Support</Text>
          <SettingItem
            icon={<TestTube size={20} color="#6B7280" />}
            title="Déclencher notification test"
            subtitle="Tester les notifications push"
            onPress={triggerTestNotification}
          />
          {__DEV__ && (
            <SettingItem
              icon={<Activity size={20} color="#3B82F6" />}
              title="Diagnostic d'import"
              subtitle="Tester l'import de calendriers"
              onPress={openImportDiagnostic}
            />
          )}
          <SettingItem
            icon={<HelpCircle size={20} color="#6B7280" />}
            title="Centre d'aide"
            subtitle="FAQ et guides d'utilisation"
          />
          <SettingItem
            icon={<Phone size={20} color="#6B7280" />}
            title="Contacter le support"
            subtitle="Assistance téléphonique 24h/7j"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Compte</Text>
          <SettingItem
            icon={<LogOut size={20} color="#EF4444" />}
            title="Se déconnecter"
            subtitle="Fermer la session"
            onPress={handleSignOut}
          />
        </View>

        {/* Panel de test pour les rôles (DEV uniquement) */}
        {showRoleTesting && (
          <RoleTestingPanel onClose={() => setShowRoleTesting(false)} />
        )}

        <View style={styles.footer}>
          <Text style={[styles.appVersion, { color: colors.textTertiary }]}>PhilSafe v1.0.0</Text>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Développé avec ❤️ pour les proches aidants
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
