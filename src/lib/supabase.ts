import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration Supabase - utiliser les mêmes valeurs que utils/supabase.ts
const supabaseUrl = 'https://yrkjdoynzcvagcqmzmgw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya2pkb3luemN2YWdjcW16bWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTc0ODEsImV4cCI6MjA3MDIzMzQ4MX0.Q-Jyw6EPsrKkFpepFaUI8Czt3DP_kbrVwSVLxRSld5U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Désactiver pour éviter les conflits
    storageKey: 'philsafe-auth-token', // Même clé que utils/supabase.ts
    storage: AsyncStorage, // Utiliser AsyncStorage explicitement
    // Options de debug en développement
    ...__DEV__ && {
      debug: true,
    }
  },
});

// Types pour TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          role: 'aidant' | 'intervenant' | null;
          sub_role: string | null;
          phone_number: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          role?: 'aidant' | 'intervenant' | null;
          sub_role?: string | null;
          phone_number?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          role?: 'aidant' | 'intervenant' | null;
          sub_role?: string | null;
          phone_number?: string | null;
          created_at?: string;
        };
      };
    };
  };
}