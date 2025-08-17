import { Tabs } from 'expo-router';
import { Calendar, Clock, Settings, Users, FileText } from 'lucide-react-native';
import { useThemeContext } from '@/context/ThemeContext';
import RoleGuard from '@/components/RoleGuard';

/**
 * CaregiverTabLayout - Stack de navigation pour les Intervenants
 * Accessible uniquement aux utilisateurs avec le rôle 'intervenant'
 */
export default function CaregiverTabLayout() {
  const { colors } = useThemeContext();

  return (
    <RoleGuard allowedRoles={['intervenant']}>
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
            title: 'Tournée',
            tabBarIcon: ({ size, color }) => (
              <Clock size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="patients"
          options={{
            title: 'Patients',
            tabBarIcon: ({ size, color }) => (
              <Users size={size} color={color} />
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
          name="reports"
          options={{
            title: 'Rapports',
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