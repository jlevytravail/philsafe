export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone_number: string | null;
          role: 'intervenant' | 'aidant';
          sub_role: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone_number?: string | null;
          role: 'intervenant' | 'aidant';
          sub_role?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone_number?: string | null;
          role?: 'intervenant' | 'aidant';
          sub_role?: string | null;
          created_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          full_name: string;
          address: string | null;
          birth_date: string | null;
          medical_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          address?: string | null;
          birth_date?: string | null;
          medical_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          address?: string | null;
          birth_date?: string | null;
          medical_notes?: string | null;
          created_at?: string;
        };
      };
      interventions: {
        Row: {
          id: string;
          patient_id: string;
          intervenant_id: string | null;
          created_by_id: string;
          scheduled_start: string;
          scheduled_end: string;
          status: 'planned' | 'done' | 'missed';
          notes: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          intervenant_id?: string | null;
          created_by_id: string;
          scheduled_start: string;
          scheduled_end: string;
          status?: 'planned' | 'done' | 'missed';
          notes?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          intervenant_id?: string | null;
          created_by_id?: string;
          scheduled_start?: string;
          scheduled_end?: string;
          status?: 'planned' | 'done' | 'missed';
          notes?: string[] | null;
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
          type: 'check_in' | 'check_out' | 'missed';
          sent_at: string;
        };
        Insert: {
          id?: string;
          aidant_id: string;
          intervention_id: string;
          type: 'check_in' | 'check_out' | 'missed';
          sent_at?: string;
        };
        Update: {
          id?: string;
          aidant_id?: string;
          intervention_id?: string;
          type?: 'check_in' | 'check_out' | 'missed';
          sent_at?: string;
        };
      };
    };
  };
}