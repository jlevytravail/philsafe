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
    try {
      // Si c'est un aidant, d'abord récupérer ses patients
      let patientIds: string[] = [];
      if (options?.aidantId) {
        console.log('🔍 DEBUG - Recherche patients pour aidant:', options.aidantId);
        
        const { data: links, error: linksError } = await supabase
          .from('aidant_patient_links')
          .select('patient_id')
          .eq('aidant_id', options.aidantId);
        
        if (linksError) throw linksError;
        patientIds = links?.map(link => link.patient_id) || [];
        
        if (patientIds.length === 0) {
          console.log('⚠️ DEBUG - Aucun patient lié pour cet aidant');
          return [];
        }
      }

      // Requête simple sur interventions
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
        const startOfDay = `${options.date}T00:00:00.000Z`;
        const endOfDay = `${options.date}T23:59:59.999Z`;
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
      return data || [];
      
    } catch (error) {
      console.error('❌ Erreur dans getInterventions:', error);
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

  // === NOTIFICATIONS ===
  async getNotifications(aidantId: string) {
    try {
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
            status,
            patients!inner (
              full_name
            )
          )
        `)
        .eq('aidant_id', aidantId)
        .order('sent_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur dans getNotifications:', error);
      // Retourner un tableau vide au lieu de throw pour éviter de bloquer l'app
      return [];
    }
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

  // Subscription temps réel aux interventions
  subscribeToInterventions(callback: (payload: any) => void) {
    console.log('🔔 Souscription aux interventions en temps réel');
    
    const subscription = supabase
      .channel('interventions_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'interventions' 
        },
        (payload) => {
          console.log('🔄 Changement détecté dans interventions:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        console.log('🔇 Désabonnement des interventions');
        subscription.unsubscribe();
      }
    };
  }

  // Subscription temps réel aux notifications
  subscribeToNotifications(callback: (payload: any) => void) {
    console.log('🔔 Souscription aux notifications en temps réel');
    
    const subscription = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications' 
        },
        (payload) => {
          console.log('🔄 Changement détecté dans notifications:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        console.log('🔇 Désabonnement des notifications');
        subscription.unsubscribe();
      }
    };
  }
}

export const supabaseService = new SupabaseService();