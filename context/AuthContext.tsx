import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, Database } from '@/utils/supabase';
import Toast from 'react-native-toast-message';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  role: 'aidant' | 'intervenant' | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string, role: 'aidant' | 'intervenant') => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error?: string }>;
  signInWithOAuth: (provider: 'google' | 'apple' | 'facebook') => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
          setError('Erreur lors de l\'initialisation de la session');
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Erreur inattendue lors de l\'initialisation:', err);
        setError('Erreur lors de l\'initialisation de l\'application');
        setLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        
        // Si l'utilisateur n'existe pas dans la table users, on peut le créer
        if (error.code === 'PGRST116') {
          console.log('Profil utilisateur non trouvé, création en cours...');
          // Pour l'instant, on définit un profil par défaut
          setProfile({
            id: userId,
            full_name: null,
            email: null,
            role: null,
            phone_number: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          setError('Erreur lors de la récupération du profil utilisateur');
        }
      } else {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
      }
    } catch (err) {
      console.error('Erreur inattendue lors de la récupération du profil:', err);
      setError('Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        
        let errorMessage = 'Erreur de connexion';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Veuillez confirmer votre email avant de vous connecter';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'Aucun compte trouvé avec cet email';
        }
        
        setError(errorMessage);
        Toast.show({
          type: 'error',
          text1: 'Erreur de connexion',
          text2: errorMessage,
        });
        
        return { error: errorMessage };
      }

      console.log('Sign in successful');
      Toast.show({
        type: 'success',
        text1: 'Connexion réussie',
        text2: 'Bienvenue !',
      });

      return { error: undefined };
    } catch (err) {
      console.error('Unexpected sign in error:', err);
      const errorMessage = 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: errorMessage,
      });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    role: 'aidant' | 'intervenant'
  ) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting sign up for:', email, 'with role:', role);

      // Étape 1: Créer le compte d'authentification
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role,
          }
        }
      });

      if (authError) {
        console.error('Auth sign up error:', authError);
        
        let errorMessage = 'Erreur lors de la création du compte';
        
        if (authError.message.includes('User already registered')) {
          errorMessage = 'Un compte existe déjà avec cet email';
        } else if (authError.message.includes('Password should be at least')) {
          errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
        } else if (authError.message.includes('Invalid email')) {
          errorMessage = 'Format d\'email invalide';
        } else if (authError.message.includes('Signup is disabled')) {
          errorMessage = 'Les inscriptions sont temporairement désactivées';
        }
        
        setError(errorMessage);
        Toast.show({
          type: 'error',
          text1: 'Erreur d\'inscription',
          text2: errorMessage,
        });
        
        return { error: errorMessage };
      }

      // Étape 2: Créer le profil utilisateur dans la table users
      if (authData.user) {
        console.log('Creating user profile for:', authData.user.id);
        
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            full_name: fullName.trim(),
            email: email.trim().toLowerCase(),
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Ne pas bloquer l'inscription si le profil n'a pas pu être créé
          // L'utilisateur pourra compléter son profil plus tard
          Toast.show({
            type: 'info',
            text1: 'Compte créé',
            text2: 'Veuillez compléter votre profil après connexion',
          });
        } else {
          console.log('Profile created successfully');
          Toast.show({
            type: 'success',
            text1: 'Compte créé avec succès',
            text2: 'Vous pouvez maintenant vous connecter',
          });
        }
      }

      return { error: undefined };
    } catch (err) {
      console.error('Unexpected sign up error:', err);
      const errorMessage = 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: errorMessage,
      });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting sign out');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        setError('Erreur lors de la déconnexion');
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Erreur lors de la déconnexion',
        });
      } else {
        console.log('Sign out successful');
        Toast.show({
          type: 'success',
          text1: 'Déconnexion réussie',
          text2: 'À bientôt !',
        });
      }
    } catch (err) {
      console.error('Unexpected sign out error:', err);
      setError('Une erreur inattendue s\'est produite');
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Une erreur inattendue s\'est produite',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting password reset for:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://your-app.com/reset-password', // À remplacer par votre URL
      });

      if (error) {
        console.error('Password reset error:', error);
        
        let errorMessage = 'Erreur lors de l\'envoi de l\'email de récupération';
        
        if (error.message.includes('User not found')) {
          errorMessage = 'Aucun compte trouvé avec cet email';
        } else if (error.message.includes('Email rate limit exceeded')) {
          errorMessage = 'Trop de demandes. Veuillez réessayer plus tard';
        }
        
        setError(errorMessage);
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: errorMessage,
        });
        
        return { error: errorMessage };
      }

      console.log('Password reset email sent successfully');
      Toast.show({
        type: 'success',
        text1: 'Email envoyé',
        text2: 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe',
      });

      return { error: undefined };
    } catch (err) {
      console.error('Unexpected password reset error:', err);
      const errorMessage = 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: errorMessage,
      });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'apple' | 'facebook') => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting OAuth sign in with:', provider);
      
      // Pour l'instant, c'est un placeholder
      // L'implémentation complète nécessiterait la configuration des providers OAuth dans Supabase
      Toast.show({
        type: 'info',
        text1: 'Fonctionnalité à venir',
        text2: `La connexion via ${provider} sera bientôt disponible`,
      });
      
      return { error: 'Fonctionnalité non encore implémentée' };
    } catch (err) {
      console.error('Unexpected OAuth error:', err);
      const errorMessage = 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        return { error: 'Utilisateur non connecté' };
      }

      console.log('Updating profile for user:', user.id, 'with updates:', updates);

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        setError('Erreur lors de la mise à jour du profil');
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Erreur lors de la mise à jour du profil',
        });
        return { error: 'Erreur lors de la mise à jour du profil' };
      }

      console.log('Profile updated successfully:', data);
      setProfile(data);
      Toast.show({
        type: 'success',
        text1: 'Profil mis à jour',
        text2: 'Vos informations ont été sauvegardées',
      });

      return { error: undefined };
    } catch (err) {
      console.error('Unexpected profile update error:', err);
      const errorMessage = 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: errorMessage,
      });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      role: profile?.role || null,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      resetPasswordForEmail,
      signInWithOAuth,
      updateProfile,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}