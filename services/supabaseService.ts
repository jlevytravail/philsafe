import { supabase } from '@/utils/supabase';

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

  async getPatientsForAidant(aidantId: string) {
    const { data, error } = await supabase
      .from('aidant_patient_links')
      .select(`
        patient_id,
        patients!inner (
          id,
          full_name,
          address,
          birth_date,
          medical_notes,
          created_at
        )
      `)
      .eq('aidant_id', aidantId);
    
    if (error) throw error;
    return data?.map(link => link.patients) || [];
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

  // === INTERVENANTS ===
  async getIntervenants() {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, role, sub_role, phone_number')
      .eq('role', 'intervenant')
      .order('full_name', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  // === INTERVENTIONS ===
  async getInterventions(options?: {
    aidantId?: string;
    intervenantId?: string;
    patientId?: string;
    date?: string;
    status?: string;
  }) {
    try {
      // Si c'est un aidant, d'abord récupérer ses patients
      let patientIds: string[] = [];
      if (options?.aidantId) {
        const { data: links, error: linksError } = await supabase
          .from('aidant_patient_links')
          .select('patient_id')
          .eq('aidant_id', options.aidantId);
        
        if (linksError) throw linksError;
        patientIds = links?.map(link => link.patient_id) || [];
        
        // Si l'aidant n'a aucun patient lié, retourner un tableau vide
        if (patientIds.length === 0) {
          return [];
        }
      }

      let query = supabase
        .from('interventions')
        .select(`
          id,
          patient_id,
          intervenant_id,
          created_by_id,
          scheduled_start,
          scheduled_end,
          status,
          notes,
          created_at,
          patients!patient_id (
            id,
            full_name,
            address,
            birth_date,
            medical_notes
          ),
          users!intervenant_id (
            id,
            full_name,
            role,
            sub_role,
            phone_number
          )
        `);

      // Appliquer les filtres
      if (options?.aidantId && patientIds.length > 0) {
        query = query.in('patient_id', patientIds);
      }

      if (options?.intervenantId) {
        query = query.eq('intervenant_id', options.intervenantId);
      }

      if (options?.patientId) {
        query = query.eq('patient_id', options.patientId);
      }

      if (options?.date) {
        const startOfDay = `${options.date}T00:00:00`;
        const endOfDay = `${options.date}T23:59:59`;
        query = query
          .gte('scheduled_start', startOfDay)
          .lte('scheduled_start', endOfDay);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      query = query.order('scheduled_start', { ascending: true });

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Mapper les données pour correspondre à notre interface
      return data?.map(intervention => ({
        ...intervention,
        patient: intervention.patients,
        intervenant: intervention.users
      })) || [];
      
    } catch (error) {
      console.error('Erreur dans getInterventions:', error);
      throw error;
    }
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

  async updateInterventionStatus(interventionId: string, status: 'planned' | 'done' | 'missed') {
    const { data, error } = await supabase
      .from('interventions')
      .update({ status })
      .eq('id', interventionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // === INTERVENTION LOGS ===
  async getInterventionLogs(interventionId: string) {
    const { data, error } = await supabase
      .from('intervention_logs')
      .select('*')
      .eq('intervention_id', interventionId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createInterventionLog(log: Omit<InterventionLog, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('intervention_logs')
      .insert(log)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async checkInIntervention(interventionId: string, remarks?: string) {
    const { data, error } = await supabase
      .from('intervention_logs')
      .insert({
        intervention_id: interventionId,
        check_in: new Date().toISOString(),
        remarks
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async checkOutIntervention(interventionId: string, remarks?: string) {
    // Récupérer le log existant pour cette intervention
    const { data: existingLog, error: fetchError } = await supabase
      .from('intervention_logs')
      .select('*')
      .eq('intervention_id', interventionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    
    if (existingLog && existingLog.check_in && !existingLog.check_out) {
      // Mettre à jour le log existant avec check_out
      const { data, error } = await supabase
        .from('intervention_logs')
        .update({
          check_out: new Date().toISOString(),
          remarks: remarks || existingLog.remarks
        })
        .eq('id', existingLog.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Créer un nouveau log avec check_out seulement
      const { data, error } = await supabase
        .from('intervention_logs')
        .insert({
          intervention_id: interventionId,
          check_out: new Date().toISOString(),
          remarks
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }

  // === NOTIFICATIONS ===
  async getNotifications(aidantId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        aidant_id,
        intervention_id,
        type,
        sent_at,
        interventions!inner (
          id,
          scheduled_start,
          scheduled_end,
          notes,
          patients!inner (
            full_name
          ),
          users!interventions_intervenant_id_fkey (
            full_name
          )
        )
      `)
      .eq('aidant_id', aidantId)
      .order('sent_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createNotification(notification: Omit<Notification, 'id'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // === LIENS AIDANT-PATIENT ===
  async linkAidantToPatient(aidantId: string, patientId: string) {
    const { data, error } = await supabase
      .from('aidant_patient_links')
      .insert({
        aidant_id: aidantId,
        patient_id: patientId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async unlinkAidantFromPatient(aidantId: string, patientId: string) {
    const { error } = await supabase
      .from('aidant_patient_links')
      .delete()
      .eq('aidant_id', aidantId)
      .eq('patient_id', patientId);
    
    if (error) throw error;
    return true;
  }

  // === SUBSCRIPTIONS TEMPS RÉEL ===
  subscribeToInterventions(callback: (payload: any) => void) {
    return supabase
      .channel('interventions_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'interventions'
      }, callback)
      .subscribe();
  }

  subscribeToInterventionLogs(callback: (payload: any) => void) {
    return supabase
      .channel('intervention_logs_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'intervention_logs'
      }, callback)
      .subscribe();
  }

  subscribeToNotifications(aidantId: string, callback: (payload: any) => void) {
    return supabase
      .channel('notifications_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `aidant_id=eq.${aidantId}`
      }, callback)
      .subscribe();
  }
}

export const supabaseService = new SupabaseService();