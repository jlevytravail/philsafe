import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase - Remplacez par vos vraies valeurs
const supabaseUrl = 'https://yrkjdoynzcvagcqmzmgw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya2pkb3luemN2YWdjcW16bWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTc0ODEsImV4cCI6MjA3MDIzMzQ4MX0.Q-Jyw6EPsrKkFpepFaUI8Czt3DP_kbrVwSVLxRSld5U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
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
          phone_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          role?: 'aidant' | 'intervenant' | null;
          phone_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          role?: 'aidant' | 'intervenant' | null;
          phone_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}