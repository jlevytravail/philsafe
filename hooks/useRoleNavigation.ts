import { useSessionUser } from '@/context/UserContext';
import { router, useSegments } from 'expo-router';

/**
 * Hook pour gérer la navigation basée sur le rôle utilisateur
 * Facilite le changement de rôle et la redirection automatique
 */
export function useRoleNavigation() {
  const { session, profile, isProfileComplete } = useSessionUser();
  const segments = useSegments();

  const getCurrentStack = () => {
    const currentSegment = segments[0];
    if (currentSegment === '(tabs)') return 'aidant';
    if (currentSegment === '(caregiver)') return 'intervenant';
    return 'none';
  };

  const navigateToRoleHome = (role: 'aidant' | 'intervenant') => {
    console.log('Navigating to role home:', role);
    
    if (role === 'aidant') {
      router.replace('/(tabs)');
    } else if (role === 'intervenant') {
      router.replace('/(caregiver)');
    }
  };

  const navigateToCurrentRoleHome = () => {
    if (profile?.role) {
      navigateToRoleHome(profile.role);
    }
  };

  const isInCorrectStack = () => {
    if (!profile?.role) return false;
    
    const currentStack = getCurrentStack();
    return currentStack === profile.role;
  };

  return {
    currentRole: profile?.role,
    currentStack: getCurrentStack(),
    isAuthenticated: Boolean(session),
    isProfileComplete,
    isInCorrectStack: isInCorrectStack(),
    navigateToRoleHome,
    navigateToCurrentRoleHome,
  };
}