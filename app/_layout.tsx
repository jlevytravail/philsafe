import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { VisitProvider } from '@/context/VisitContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function AuthNavigator() {
  const { session, profile, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    
    console.log('AuthNavigator - State:', { 
      hasSession: !!session, 
      profileRole: profile?.role, 
      loading,
      segments
    });

    // Navigation conditionnelle basée sur l'état d'authentification
    const inAuthGroup = segments[0] === 'auth' || segments[0] === 'login' || segments[0] === 'signup';
    const inTabsGroup = segments[0] === '(tabs)';
    const inCaregiverGroup = segments[0] === '(caregiver)';

    if (!session && !inAuthGroup) {
      console.log('No session, redirecting to auth');
      router.replace('/auth');
    } else if (session && profile?.role === 'aidant' && !inTabsGroup) {
      console.log('Aidant role, redirecting to tabs');
      router.replace('/(tabs)');
    } else if (session && profile?.role === 'intervenant' && !inCaregiverGroup) {
      console.log('Intervenant role, redirecting to caregiver');
      router.replace('/(caregiver)');
    } else if (session && profile && !profile.role && !inAuthGroup) {
      console.log('Profile exists but no role, redirecting to auth');
      router.replace('/auth');
    }
  }, [session, profile, loading, segments]);

  // Afficher un écran de chargement pendant l'initialisation
  if (loading) {
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
    <SafeAreaProvider>
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
    </SafeAreaProvider>
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