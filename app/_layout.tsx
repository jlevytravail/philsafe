import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { VisitProvider } from '@/context/VisitContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <VisitProvider>
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </>
    </VisitProvider>
  );
}
