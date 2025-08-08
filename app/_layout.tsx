import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { VisitProvider } from '@/context/VisitContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

function AuthNavigator() {
  const { session, profile, loading } = useAuth();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    console.log('AuthNavigator - State:', { 
      hasSession: !!session, 
      profileRole: profile?.role, 
      loading 
    });

    // Attendre que l'authentification soit initialisée
    if (!loading) {
      setInitializing(false);
      
      // Navigation conditionnelle basée sur l'état d'authentification
      if (!session) {
        // Pas de session, rediriger vers auth
        console.log('No session, redirecting to auth');
        router.replace('/auth');
      } else if (profile?.role === 'aidant') {
        // Utilisateur aidant, rediriger vers l'interface aidant
        console.log('Aidant role, redirecting to tabs');
        router.replace('/(tabs)');
      } else if (profile?.role === 'intervenant') {
        // Utilisateur intervenant, rediriger vers l'interface intervenant
        console.log('Intervenant role, redirecting to caregiver');
        router.replace('/(caregiver)');
      } else if (profile && !profile.role) {
        // Profil existe mais pas de rôle défini, rediriger vers auth pour reconfiguration
        console.log('Profile exists but no role, redirecting to auth');
        router.replace('/auth');
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
      <Stack.Screen name="auth" />
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
            <Toast />
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