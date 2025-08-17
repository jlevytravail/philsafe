import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useSessionUser } from '@/context/UserContext';
import { useThemeContext } from '@/context/ThemeContext';

interface RoleGuardProps {
  allowedRoles: ('aidant' | 'intervenant')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * RoleGuard - Composant de garde pour contrôler l'accès basé sur le rôle utilisateur
 * 
 * @param allowedRoles - Rôles autorisés à accéder au contenu
 * @param children - Contenu à afficher si l'utilisateur a le bon rôle
 * @param fallback - Contenu à afficher si l'utilisateur n'a pas le bon rôle
 */
export default function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { session, profile, loading, isProfileComplete } = useSessionUser();
  const { colors } = useThemeContext();

  // Afficher un loader pendant le chargement
  if (loading || !session) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Si pas de profil ou profil incomplet, ne pas afficher le contenu
  if (!profile || !isProfileComplete) {
    return fallback || (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Vérifier si le rôle utilisateur est autorisé
  const userRole = profile.role;
  const hasAccess = userRole && allowedRoles.includes(userRole);

  console.log('RoleGuard check:', {
    userRole,
    allowedRoles,
    hasAccess,
    profileComplete: isProfileComplete
  });

  if (!hasAccess) {
    return fallback || (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});