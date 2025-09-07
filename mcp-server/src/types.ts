// Types PhilSafe pour le serveur MCP
export interface Patient {
  id: string;
  full_name: string;
  address: string;
  birth_date: string;
  medical_notes?: string;
  created_at: string;
}

export interface User {
  id: string;
  full_name: string | null;
  email: string | null;
  role: 'aidant' | 'intervenant' | null;
  sub_role: string | null;
  phone_number: string | null;
  created_at: string;
}

export interface Intervention {
  id: string;
  patient_id: string;
  intervenant_id?: string;
  created_by_id: string;
  scheduled_start: string;
  scheduled_end: string;
  status: 'planned' | 'done' | 'missed';
  notes: string[];
  created_at: string;
  // Relations
  patient?: Patient;
  intervenant?: User;
}

export interface InterventionLog {
  id: string;
  intervention_id: string;
  check_in?: string;
  check_out?: string;
  remarks?: string;
  created_at: string;
}

export interface AidantPatientLink {
  id: string;
  aidant_id: string;
  patient_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  aidant_id: string;
  intervention_id: string;
  type: 'check_in' | 'check_out' | 'missed';
  sent_at: string;
}