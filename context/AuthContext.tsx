import React, { createContext, useContext, ReactNode } from 'react';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  role?: string;
  sub_role?: string;
}

interface AuthContextType {
  profile: Profile | null;
  role: 'aidant' | 'intervenant';
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Mock profile data
  const mockProfile: Profile = {
    id: '1',
    email: 'user@example.com',
    full_name: 'Utilisateur Test',
    phone_number: '06 12 34 56 78',
    role: 'aidant',
    sub_role: 'Proche aidant'
  };

  const signOut = async () => {
    // Mock sign out
    console.log('Déconnexion simulée');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    // Mock profile update
    console.log('Mise à jour du profil simulée:', updates);
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{
      profile: mockProfile,
      role: 'aidant',
      signOut,
      updateProfile
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