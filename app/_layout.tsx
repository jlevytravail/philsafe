import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { router, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { VisitProvider } from '@/context/VisitContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function AuthRedirector() {
  const { session, role, isLoading } = useAuth();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!isLoading && rootNavigationState?.stale === false) {
      if (!session) {
        // Pas de session, rediriger vers l'authentification
        setTimeout(() => router.replace('/auth'), 0);
      } else if (role) {
        // Session active et rôle défini, rediriger vers l'interface appropriée
        if (role === 'aidant') {
          setTimeout(() => router.replace('/(tabs)'), 0);
        } else if (role === 'intervenant') {
          setTimeout(() => router.replace('/(caregiver)'), 0);
        }
      }
    }
  }, [session, role, isLoading, rootNavigationState?.stale]);

  if (isLoading || rootNavigationState?.stale !== false) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return null;
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <ThemeProvider>
        <VisitProvider>
          <>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="auth" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(caregiver)" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <AuthRedirector />
            <StatusBar style="auto" />
          </>
        </VisitProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}