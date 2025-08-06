import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'family' | 'caregiver';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('family');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedRole();
  }, []);

  const loadSavedRole = async () => {
    try {
      const store = await import('expo-secure-store');
      const savedRole = await store.getItemAsync('userRole');
      
      if (savedRole && (savedRole === 'family' || savedRole === 'caregiver')) {
        setRoleState(savedRole as UserRole);
      }
    } catch (error) {
      console.log('Could not load saved role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setRole = async (newRole: UserRole) => {
    try {
      const store = await import('expo-secure-store');
      await store.setItemAsync('userRole', newRole);
      setRoleState(newRole);
    } catch (error) {
      console.log('Could not save role:', error);
      // Still update the state even if saving fails
      setRoleState(newRole);
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}