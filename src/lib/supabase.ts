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
      patients: {
        Row: {
          id: string;
          full_name: string;
          address: string;
          birth_date: string;
          medical_notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          address: string;
          birth_date: string;
          medical_notes: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          address?: string;
          birth_date?: string;
          medical_notes?: string;
          created_at?: string;
        };
      };
      interventions: {
        Row: {
          id: string;
          patient_id: string;
          intervenant_id: string;
          created_by_id: string;
          scheduled_start: string;
          scheduled_end: string;
          status: 'planned' | 'done' | 'missed';
          notes: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          intervenant_id: string;
          created_by_id: string;
          scheduled_start: string;
          scheduled_end: string;
          status?: 'planned' | 'done' | 'missed';
          notes?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          intervenant_id?: string;
          created_by_id?: string;
          scheduled_start?: string;
          scheduled_end?: string;
          status?: 'planned' | 'done' | 'missed';
          notes?: string[];
          created_at?: string;
        };
      };
      intervention_logs: {
        Row: {
          id: string;
          intervention_id: string;
          check_in: string | null;
          check_out: string | null;
          remarks: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          intervention_id: string;
          check_in?: string | null;
          check_out?: string | null;
          remarks?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          intervention_id?: string;
          check_in?: string | null;
          check_out?: string | null;
          remarks?: string | null;
          created_at?: string;
        };
      };
      aidant_patient_links: {
        Row: {
          id: string;
          aidant_id: string;
          patient_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          aidant_id: string;
          patient_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          aidant_id?: string;
          patient_id?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          aidant_id: string;
          intervention_id: string;
          type: string;
          sent_at: string;
        };
        Insert: {
          id?: string;
          aidant_id: string;
          intervention_id: string;
          type: string;
          sent_at?: string;
        };
        Update: {
          id?: string;
          aidant_id?: string;
          intervention_id?: string;
          type?: string;
          sent_at?: string;
        };
      };
    };
  };
}