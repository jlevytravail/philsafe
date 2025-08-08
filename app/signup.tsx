import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function SignUpScreen() {
  const { session, role } = useAuth();

  useEffect(() => {
    // Rediriger vers l'écran d'authentification unifié
    router.replace('/auth');
  }, []);

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (session && role) {
      if (role === 'aidant') {
        router.replace('/(tabs)');
      } else if (role === 'intervenant') {
        router.replace('/(caregiver)');
      }
    }
  }, [session, role]);

  return null; // Pas de rendu, redirection immédiate
}