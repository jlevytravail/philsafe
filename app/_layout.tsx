import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { VisitProvider } from '@/context/VisitContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

function AuthNavigator() {
  const { session, profile, loading } = useAuth();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Attendre que l'authentification soit initialisée
    if (!loading) {
      setInitializing(false);
      
      // Navigation conditionnelle basée sur l'état d'authentification
      if (!session) {
        // Pas de session, rediriger vers login
        router.replace('/login');
      } else if (profile?.role === 'aidant') {
        // Utilisateur aidant, rediriger vers l'interface aidant
        router.replace('/(tabs)');
      } else if (profile?.role === 'intervenant') {
        // Utilisateur intervenant, rediriger vers l'interface intervenant
        router.replace('/(caregiver)');
      } else if (profile && !profile.role) {
        // Profil existe mais pas de rôle défini, rediriger vers login pour reconfiguration
        router.replace('/login');
      }
    }
  }, [session, profile, loading]);

  // Afficher un écran de chargement pendant l'initialisation
  if (initializing || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(caregiver)" />
      <Stack.Screen name="visit/[id]" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <AuthProvider>
        <VisitProvider>
          <>
            <AuthNavigator />
            <StatusBar style="auto" />
          </>
        </VisitProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});