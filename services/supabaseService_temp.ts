import { supabase } from '@/utils/supabase';
import { supabaseServiceNoUsers } from './supabaseService_backup';

// Types pour les tables de la base de données
export interface Patient {
  id: string;
  full_name: string;
  address: string;
  birth_date: string;
  medical_notes?: string;
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
  // Données jointes
  patient?: Patient;
  intervenant?: {
    id: string;
    full_name: string;
    role: string;
    sub_role?: string;
    phone_number?: string;
  };
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

class SupabaseService {
  // === PATIENTS ===
  async getPatients() {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('full_name', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async getPatient(id: string) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createPatient(patient: Omit<Patient, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('patients')
      .insert(patient)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updatePatient(id: string, updates: Partial<Patient>) {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deletePatient(id: string) {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // === INTERVENANTS === (TEMPORAIREMENT DÉSACTIVÉ)
  async getIntervenants() {
    // Retourner un tableau vide temporairement pour éviter l'accès à users
    console.log('⚠️ getIntervenants désactivé temporairement (problème permissions users)');
    return [];
  }

  // === INTERVENTIONS === (REDIRIGER VERS VERSION SANS USERS)
  async getInterventions(options?: {
    aidantId?: string;
    intervenantId?: string;
    patientId?: string;
    date?: string;
    status?: string;
  }) {
    console.log('🔄 Redirection vers supabaseServiceNoUsers.getInterventions()');
    return supabaseServiceNoUsers.getInterventions(options);
  }

  async createIntervention(intervention: Omit<Intervention, 'id' | 'created_at' | 'patient' | 'intervenant'>) {
    const { data, error } = await supabase
      .from('interventions')
      .insert(intervention)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateIntervention(id: string, updates: Partial<Intervention>) {
    const { data, error } = await supabase
      .from('interventions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteIntervention(id: string) {
    const { error } = await supabase
      .from('interventions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // === NOTIFICATIONS === (REDIRIGER VERS VERSION SANS USERS)
  async getNotifications(aidantId: string) {
    console.log('🔄 Redirection vers supabaseServiceNoUsers.getNotifications()');
    return supabaseServiceNoUsers.getNotifications(aidantId);
  }

  // === LIENS AIDANT-PATIENT ===
  async getAidantPatientLinks(aidantId: string) {
    const { data, error } = await supabase
      .from('aidant_patient_links')
      .select(`
        id,
        aidant_id,
        patient_id,
        created_at,
        patients!inner (
          id,
          full_name,
          address,
          medical_notes
        )
      `)
      .eq('aidant_id', aidantId);
    
    if (error) throw error;
    return data;
  }

  async createAidantPatientLink(aidantId: string, patientId: string) {
    const { data, error } = await supabase
      .from('aidant_patient_links')
      .insert({ aidant_id: aidantId, patient_id: patientId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteAidantPatientLink(id: string) {
    const { error } = await supabase
      .from('aidant_patient_links')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
}

export const supabaseService = new SupabaseService();