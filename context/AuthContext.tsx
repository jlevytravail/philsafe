import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';
import { Database } from '@/types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  role: 'intervenant' | 'aidant' | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string, role: 'intervenant' | 'aidant') => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la session:', error);
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur lors du chargement du profil:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'Une erreur inattendue s\'est produite' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    role: 'intervenant' | 'aidant'
  ): Promise<{ error?: string }> => {
    try {
      setIsLoading(true);
      
      // Créer le compte utilisateur
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return { error: authError.message };
      }

      if (data.user) {
        // Créer le profil utilisateur
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            full_name: fullName,
            email,
            role,
          });

        if (profileError) {
          return { error: 'Erreur lors de la création du profil' };
        }
      }

      return {};
    } catch (error) {
      return { error: 'Une erreur inattendue s\'est produite' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error?: string }> => {
    if (!user) {
      return { error: 'Utilisateur non connecté' };
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { error: error.message };
      }

      // Recharger le profil après mise à jour
      await loadUserProfile(user.id);
      return {};
    } catch (error) {
      return { error: 'Une erreur inattendue s\'est produite' };
    }
  };

  const role = profile?.role || null;

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      role,
      isLoading,
      signIn,
      signUp,
      signOut,
      updateProfile,
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