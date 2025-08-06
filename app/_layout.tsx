import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { VisitProvider } from '@/context/VisitContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { RoleProvider, useRole } from '@/context/RoleContext';

function AppContent() {
  const { role, isLoading } = useRole();

  useEffect(() => {
    if (!isLoading) {
      // Force navigation to the correct interface based on role
      if (role === 'family') {
        router.replace('/(tabs)');
      } else if (role === 'caregiver') {
        router.replace('/(caregiver)');
      }
    }
  }, [role, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {role === 'family' ? (
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
    <RoleProvider>
      <ThemeProvider>
        <VisitProvider>
          <>
            <AppContent />
            <StatusBar style="auto" />
          </>
        </VisitProvider>
      </ThemeProvider>
    </RoleProvider>
  );
}
