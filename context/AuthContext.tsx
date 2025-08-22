import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, Database } from '../src/lib/supabase';
import Toast from 'react-native-toast-message';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  otpSent: boolean;
  otpEmail: string;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string, role: 'aidant' | 'intervenant') => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error?: string }>;
  signInWithOAuth: (provider: 'google' | 'apple' | 'facebook') => Promise<{ error?: string }>;
  signInWithOtp: (email: string) => Promise<{ error?: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ error?: string }>;
  signInAsDebugUser: () => Promise<{ error?: string }>; // Connexion debug
  clearError: () => void;
  clearOtpState: () => void;
  debugAuthState: () => Promise<void>; // Diagnostic debug
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');

  useEffect(() => {
    let mounted = true;

    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        console.log('🔄 AuthContext: Initialisation, récupération de la session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('❌ AuthContext: Erreur lors de la récupération de la session:', error);
          setError('Erreur lors de l\'initialisation de la session');
          setLoading(false);
          return;
        }

        if (session) {
          console.log('✅ AuthContext: Session initiale trouvée:', session.user?.email);
        } else {
          console.log('ℹ️ AuthContext: Aucune session initiale');
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        console.error('❌ AuthContext: Erreur inattendue lors de l\'initialisation:', err);
        setError('Erreur lors de l\'initialisation de l\'application');
        setLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔔 AuthContext: Auth state changed:', event, session?.user?.id);
        
        // Gestion spéciale pour les magic links
        if (event === 'SIGNED_IN' && session) {
          console.log('✅ AuthContext: User signed in via', event);
          console.log('📧 User email:', session.user?.email);
          console.log('⏰ Session expires at:', new Date(session.expires_at * 1000).toLocaleString());
          
          Toast.show({
            type: 'success',
            text1: 'Connexion réussie',
            text2: 'Bienvenue dans PhilSafe !',
          });
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 AuthContext: User signed out');
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 AuthContext: Token refreshed');
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
        
        // Créer le profil directement maintenant que les policies RLS sont en place
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            full_name: fullName.trim(),
            email: email.trim().toLowerCase(),
            role,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          console.log('Profile creation failed for user:', authData.user.id, 'with data:', {
            id: authData.user.id,
            full_name: fullName.trim(),
            email: email.trim().toLowerCase(),
            role,
          });
          // Ne pas bloquer l'inscription si le profil n'a pas pu être créé
          // L'utilisateur pourra compléter son profil plus tard
          Toast.show({
            type: 'info',
            text1: 'Compte créé',
            text2: 'Veuillez compléter votre profil après connexion',
          });
        } else {
          console.log('Profile created successfully for user:', authData.user.id);
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
      
      console.log('🚪 AuthContext: Attempting sign out');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ AuthContext: Sign out error:', error);
        setError('Erreur lors de la déconnexion');
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Erreur lors de la déconnexion',
        });
      } else {
        console.log('✅ AuthContext: Sign out successful');
        
        // Nettoyer explicitement les états locaux
        setSession(null);
        setUser(null);
        setOtpSent(false);
        setOtpEmail('');
        setError(null);
        
        Toast.show({
          type: 'success',
          text1: 'Déconnexion réussie',
          text2: 'À bientôt !',
        });
      }
    } catch (err) {
      console.error('❌ AuthContext: Unexpected sign out error:', err);
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
        redirectTo: 'philsafe://auth-callback', // Deep link vers l'app
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


  const signInWithOtp = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting OTP sign in for:', email);
      console.log('Attempting OTP sign in');
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: false, // Seulement pour les utilisateurs existants
          // PAS de emailRedirectTo = Supabase envoie un code à 6 chiffres
        }
      });

      console.log('OTP response data:', data);
      console.log('OTP response error:', error);

      if (error) {
        console.error('OTP sign in error:', error);
        
        let errorMessage = 'Erreur lors de l\'envoi du lien de connexion';
        
        if (error.message.includes('Email rate limit exceeded')) {
          errorMessage = 'Trop de demandes. Veuillez réessayer plus tard';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Format d\'email invalide';
        }
        
        setError(errorMessage);
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: errorMessage,
        });
        
        return { error: errorMessage };
      }

      console.log('OTP email sent successfully');
      
      // Mettre à jour les états OTP
      setOtpSent(true);
      setOtpEmail(email.trim().toLowerCase());
      
      Toast.show({
        type: 'success',
        text1: 'Code envoyé',
        text2: 'Vérifiez votre boîte mail et saisissez le code à 6 chiffres',
      });

      return { error: undefined };
    } catch (err) {
      console.error('Unexpected OTP error:', err);
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

  const verifyOtp = async (email: string, token: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting OTP verification for:', email, 'with token:', token);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type: 'email'
      });

      console.log('OTP verification response data:', data);
      console.log('OTP verification response error:', error);

      if (error) {
        console.error('OTP verification error:', error);
        
        let errorMessage = 'Code invalide ou expiré';
        
        if (error.message.includes('Token has expired')) {
          errorMessage = 'Le code a expiré. Demandez un nouveau code.';
        } else if (error.message.includes('Invalid token')) {
          errorMessage = 'Code invalide. Vérifiez et réessayez.';
        }
        
        setError(errorMessage);
        Toast.show({
          type: 'error',
          text1: 'Erreur de vérification',
          text2: errorMessage,
        });
        
        return { error: errorMessage };
      }

      console.log('OTP verification successful');
      
      // Nettoyer les états OTP après connexion réussie
      setOtpSent(false);
      setOtpEmail('');
      
      Toast.show({
        type: 'success',
        text1: 'Connexion réussie',
        text2: 'Bienvenue dans PhilSafe !',
      });

      return { error: undefined };
    } catch (err) {
      console.error('Unexpected OTP verification error:', err);
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

  const clearOtpState = () => {
    setOtpSent(false);
    setOtpEmail('');
  };

  const debugAuthState = async () => {
    if (!__DEV__) return;
    
    console.log('🔍 DEBUG AuthContext: État actuel');
    console.log('├── Session:', session ? `✅ ${session.user?.email}` : '❌ null');
    console.log('├── User:', user ? `✅ ${user.email}` : '❌ null');
    console.log('├── Loading:', loading);
    console.log('├── Error:', error || 'null');
    console.log('└── OTP:', { sent: otpSent, email: otpEmail });
    
    try {
      const { data: { session: supaSession }, error } = await supabase.auth.getSession();
      console.log('🔍 DEBUG Supabase getSession():', supaSession ? `✅ ${supaSession.user?.email}` : '❌ null');
      if (error) console.log('├── Erreur:', error.message);
      
      const { data: { user: supaUser }, error: userError } = await supabase.auth.getUser();
      console.log('🔍 DEBUG Supabase getUser():', supaUser ? `✅ ${supaUser.email}` : '❌ null');
      if (userError) console.log('├── Erreur:', userError.message);
    } catch (err) {
      console.log('🔍 DEBUG Exception:', err);
    }
  };

  const signInAsDebugUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔧 DEBUG: Connexion debug simplifiée avec OTP standard...');
      
      if (!__DEV__) {
        throw new Error('La connexion debug n\'est disponible qu\'en mode développement');
      }
      
      const debugEmail = 'jlevy.travail@gmail.com';
      
      // Utiliser le flow OTP standard qui fonctionne
      console.log('🔧 DEBUG: Envoi OTP à', debugEmail);
      
      const result = await signInWithOtp(debugEmail);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      console.log('✅ DEBUG: OTP envoyé avec succès');
      
      Toast.show({
        type: 'success',
        text1: '🔧 Debug: Code envoyé',
        text2: 'Vérifiez votre email et saisissez le code reçu (utilisation du flow OTP standard)',
      });
      
      return { error: undefined };
      
    } catch (err: any) {
      console.error('🔧 DEBUG: Erreur de connexion debug:', err);
      const errorMessage = err.message || 'Erreur de connexion debug';
      setError(errorMessage);
      
      Toast.show({
        type: 'error',
        text1: '🔧 Erreur debug',
        text2: errorMessage,
      });
      
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      loading,
      error,
      otpSent,
      otpEmail,
      signIn,
      signUp,
      signOut,
      resetPasswordForEmail,
      signInWithOAuth,
      signInWithOtp,
      verifyOtp,
      signInAsDebugUser,
      debugAuthState,
      clearError,
      clearOtpState,
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