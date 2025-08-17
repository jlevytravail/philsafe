import { Tabs } from 'expo-router';
import { Chrome as Home, Calendar, Bell, Settings, FileText } from 'lucide-react-native';
import { useThemeContext } from '@/context/ThemeContext';
import RoleGuard from '@/components/RoleGuard';

/**
 * TabLayout - Stack de navigation pour les Aidants
 * Accessible uniquement aux utilisateurs avec le rôle 'aidant'
 */
export default function TabLayout() {
  const { colors } = useThemeContext();

  return (
    <RoleGuard allowedRoles={['aidant']}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 8,
            paddingBottom: 8,
            height: 70,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ size, color }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Notifications',
            tabBarIcon: ({ size, color }) => (
              <Bell size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendrier',
            tabBarIcon: ({ size, color }) => (
              <Calendar size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'Historique',
            tabBarIcon: ({ size, color }) => (
              <FileText size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Paramètres',
            tabBarIcon: ({ size, color }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </RoleGuard>
  );
}