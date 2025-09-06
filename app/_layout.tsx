import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { VisitProvider } from '@/context/VisitContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { UserProvider, useSessionUser } from '@/context/UserContext';

function AuthNavigator() {
  const { session, profile, loading, isProfileComplete } = useSessionUser();
  const router = useRouter();
  const segments = useSegments();
  const [isMounted, setIsMounted] = useState(false);

  // Log pour debugging - affiche l'état à chaque changement (commenté pour réduire le bruit)
  // console.log('🔍 AuthNavigator render:', {
  //   hasSession: !!session,
  //   userId: session?.user?.id,
  //   profileExists: !!profile,
  //   profileRole: profile?.role,
  //   profileFullName: profile?.full_name,
  //   isProfileComplete,
  //   loading,
  //   isMounted,
  //   currentSegment: segments[0]
  // });

  // Attendre que le composant soit monté avant d'autoriser la navigation
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Attendre que le composant soit monté ET que le chargement soit terminé
    if (!isMounted || loading) return;
    
    console.log('AuthNavigator - State:', { 
      hasSession: !!session, 
      sessionUserId: session?.user?.id,
      profileRole: profile?.role, 
      profileFullName: profile?.full_name,
      isProfileComplete,
      loading,
      isMounted,
      segments
    });

    // Navigation conditionnelle basée sur l'état d'authentification
    const inAuthGroup = segments[0] === 'auth' || segments[0] === 'login' || segments[0] === 'signup';
    const inCompleteProfile = segments[0] === 'complete-profile';
    const inTabsGroup = segments[0] === '(tabs)';
    const inCaregiverGroup = segments[0] === '(caregiver)';
    const inDevRoute = segments[0] === 'test-data' || segments[0] === 'debug' || segments[0] === 'admin' || segments[0] === 'import-diagnostic';

    // Utiliser setTimeout pour s'assurer que la navigation se fait après le rendu
    const navigate = (path: string) => {
      setTimeout(() => {
        console.log('Navigating to:', path);
        router.replace(path);
      }, 100); // Augmenter légèrement le délai pour être sûr
    };

    // Pas de session → page de connexion
    if (!session && !inAuthGroup) {
      console.log('No session, redirecting to auth');
      navigate('/auth');
      return;
    }

    // Session mais pas de profil chargé → attendre le chargement du profil
    if (session && !profile) {
      console.log('⏳ Session exists but profile not loaded yet, waiting...');
      return;
    }

    // Session + profil incomplet → page de complétion
    if (session && profile && !isProfileComplete && !inCompleteProfile) {
      console.log('✅ Session exists but profile incomplete, redirecting to complete-profile');
      navigate('/complete-profile');
      return;
    }

    // Session + profil complet → redirection selon le rôle (sauf routes de dev)
    if (session && profile && isProfileComplete && !inDevRoute) {
      const userRole = profile.role;
      
      // Vérifier si l'utilisateur est dans la bonne stack selon son rôle
      if (userRole === 'aidant' && !inTabsGroup) {
        console.log('Aidant role detected, redirecting to tabs');
        navigate('/(tabs)');
      } else if (userRole === 'intervenant' && !inCaregiverGroup) {
        console.log('Intervenant role detected, redirecting to caregiver');
        navigate('/(caregiver)');
      }
      // Si l'utilisateur aidant est dans la stack intervenant ou vice versa, rediriger
      else if (userRole === 'aidant' && inCaregiverGroup) {
        console.log('Aidant in caregiver stack, redirecting to tabs');
        navigate('/(tabs)');
      } else if (userRole === 'intervenant' && inTabsGroup) {
        console.log('Intervenant in tabs stack, redirecting to caregiver');
        navigate('/(caregiver)');
      }
    }
  }, [session, profile, loading, isProfileComplete, segments, isMounted]);

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
      <Stack.Screen name="complete-profile" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(caregiver)" />
      <Stack.Screen name="visit/[id]" />
      <Stack.Screen name="import-diagnostic" />
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
          <UserProvider>
            <VisitProvider>
              <>
                <AuthNavigator />
                <StatusBar style="auto" />
                <Toast />
              </>
            </VisitProvider>
          </UserProvider>
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