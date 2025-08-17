import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function SignUpScreen() {
  const { session } = useAuth();

  useEffect(() => {
    // Rediriger vers l'écran d'authentification unifié
    router.replace('/auth');
  }, []);

  return null; // Pas de rendu, redirection immédiate
}