import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, Database } from '@/src/lib/supabase';
import { useAuth } from './AuthContext';
import Toast from 'react-native-toast-message';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface UserContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isProfileComplete: boolean;
  fetchUserProfile: (userId: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  clearProfile: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  // Calculer si le profil est complet
  const isProfileComplete = Boolean(
    profile?.full_name && 
    profile?.role && 
    profile?.email
  );

  // Fetch le profil automatiquement quand la session change
  useEffect(() => {
    console.log('UserContext - Session changed:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      email: session?.user?.email 
    });
    
    if (session?.user?.id) {
      fetchUserProfile(session.user.id);
    } else {
      clearProfile();
    }
  }, [session?.user?.id]);

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching user profile for:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, sub_role, phone_number, created_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // Si l'utilisateur n'existe pas dans la table users
        if (error.code === 'PGRST116') {
          console.log('User profile not found - creating empty profile state');
          // Créer un profil vide avec les données de base de la session
          setProfile({
            id: userId,
            email: session?.user?.email || null,
            full_name: null,
            role: null,
            sub_role: null,
            phone_number: null,
            created_at: new Date().toISOString(),
          });
        } else {
          setError('Erreur lors de la récupération du profil utilisateur');
        }
      } else {
        console.log('User profile fetched successfully:', data);
        setProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      setError('Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      setError(null);

      if (!profile?.id) {
        throw new Error('Aucun profil à mettre à jour');
      }

      console.log('Updating user profile:', updates);

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        let errorMessage = 'Erreur lors de la mise à jour du profil';
        
        if (error.code === 'PGRST116') {
          // Si le profil n'existe pas, on le crée
          console.log('Profile does not exist, creating new one');
          const { data: newData, error: insertError } = await supabase
            .from('users')
            .insert({
              id: profile.id,
              email: profile.email,
              ...updates,
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating user profile:', insertError);
            setError('Erreur lors de la création du profil');
            return { error: 'Erreur lors de la création du profil' };
          } else {
            console.log('User profile created successfully:', newData);
            setProfile(newData);
            Toast.show({
              type: 'success',
              text1: 'Profil créé',
              text2: 'Votre profil a été créé avec succès',
            });
            return { error: undefined };
          }
        } else {
          setError(errorMessage);
          return { error: errorMessage };
        }
      } else {
        console.log('User profile updated successfully:', data);
        setProfile(data);
        Toast.show({
          type: 'success',
          text1: 'Profil mis à jour',
          text2: 'Vos informations ont été sauvegardées',
        });
        return { error: undefined };
      }
    } catch (err) {
      console.error('Unexpected error updating profile:', err);
      const errorMessage = 'Une erreur inattendue s\'est produite';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearProfile = () => {
    setProfile(null);
    setError(null);
    setLoading(false);
  };

  return (
    <UserContext.Provider value={{
      profile,
      loading,
      error,
      isProfileComplete,
      fetchUserProfile,
      updateUserProfile,
      clearProfile,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Hook combiné pour session + profil
export function useSessionUser() {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, error, isProfileComplete } = useUser();
  
  // Combiner les deux états de loading
  const loading = authLoading || profileLoading;
  
  return {
    session,
    profile,
    loading,
    error,
    isProfileComplete,
    isAuthenticated: Boolean(session),
  };
}