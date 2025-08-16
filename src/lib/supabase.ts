import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Please add SUPABASE_URL and SUPABASE_ANON_KEY to your app.config.ts extra section.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Activer pour les deep links
    storage: undefined, // Uses AsyncStorage by default in React Native
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
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          role?: 'aidant' | 'intervenant' | null;
          phone_number?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          role?: 'aidant' | 'intervenant' | null;
          phone_number?: string | null;
          created_at?: string;
        };
      };
    };
  };
}