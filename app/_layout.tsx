import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { router, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { VisitProvider } from '@/context/VisitContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function AppContent() {
  const { session, role, isLoading } = useAuth();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!isLoading && rootNavigationState?.isLoaded) {
      if (!session) {
        // Pas de session, rediriger vers l'authentification
        router.replace('/auth');
      } else if (role) {
        // Session active et rôle défini, rediriger vers l'interface appropriée
        if (role === 'aidant') {
          router.replace('/(tabs)');
        } else if (role === 'intervenant') {
          router.replace('/(caregiver)');
        }
      }
    }
  }, [session, role, isLoading, rootNavigationState?.isLoaded]);

  if (isLoading || !rootNavigationState?.isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      {role === 'aidant' ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(caregiver)" />
      )}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <ThemeProvider>
        <VisitProvider>
          <>
            <AppContent />
            <StatusBar style="auto" />
          </>
        </VisitProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
