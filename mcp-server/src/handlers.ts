import { supabase } from './supabase.js';
import { Patient, User, Intervention, AidantPatientLink, Notification } from './types.js';
import { authManager } from './auth.js';

export class PhilSafeHandlers {
  // === PATIENTS ===
  async listPatients(args: { limit?: number }) {
    // Vérifier l'authentification
    authManager.checkRoleAccess(['aidant', 'intervenant']);
    
    const limit = args.limit || 50;
    const currentUser = authManager.getCurrentUser()!;
    
    let query = supabase
      .from('patients')
      .select('*')
      .order('full_name', { ascending: true })
      .limit(limit);
    
    // Si l'utilisateur est un aidant, filtrer par ses patients
    if (currentUser.role === 'aidant') {
      const { data: links } = await supabase
        .from('aidant_patient_links')
        .select('patient_id')
        .eq('aidant_id', currentUser.id);
      
      if (links && links.length > 0) {
        const patientIds = links.map(link => link.patient_id);
        query = query.in('id', patientIds);
      } else {
        return { patients: [] };
      }
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { patients: data as Patient[] };
  }

  async getPatient(args: { id: string }) {
    // Vérifier l'accès au patient
    await authManager.checkPatientAccess(args.id);
    
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', args.id)
      .single();
    
    if (error) throw error;
    return { patient: data as Patient };
  }

  async createPatient(args: {
    full_name: string;
    address: string;
    birth_date: string;
    medical_notes?: string;
  }) {
    // Seuls les aidants peuvent créer des patients
    authManager.checkRoleAccess(['aidant']);
    
    const { data, error } = await supabase
      .from('patients')
      .insert(args)
      .select()
      .single();
    
    if (error) throw error;
    return { patient: data as Patient };
  }

  // === INTERVENTIONS ===
  async listInterventions(args: {
    patient_id?: string;
    intervenant_id?: string;
    aidant_id?: string;
    date?: string;
    status?: 'planned' | 'done' | 'missed';
    limit?: number;
  }) {
    const limit = args.limit || 50;
    let query = supabase
      .from('interventions')
      .select(`
        *,
        patients!inner (
          id,
          full_name,
          address,
          medical_notes
        ),
        intervenant:users!interventions_intervenant_id_fkey (
          id,
          full_name,
          role,
          sub_role,
          phone_number
        )
      `)
      .order('scheduled_start', { ascending: true })
      .limit(limit);

    // Filtres
    if (args.patient_id) {
      query = query.eq('patient_id', args.patient_id);
    }
    
    if (args.intervenant_id) {
      query = query.eq('intervenant_id', args.intervenant_id);
    }
    
    if (args.status) {
      query = query.eq('status', args.status);
    }
    
    if (args.date) {
      const startOfDay = `${args.date}T00:00:00`;
      const endOfDay = `${args.date}T23:59:59`;
      query = query.gte('scheduled_start', startOfDay).lte('scheduled_start', endOfDay);
    }

    // Filtrage par aidant via les liens patients
    if (args.aidant_id) {
      const { data: links } = await supabase
        .from('aidant_patient_links')
        .select('patient_id')
        .eq('aidant_id', args.aidant_id);
      
      if (links && links.length > 0) {
        const patientIds = links.map(link => link.patient_id);
        query = query.in('patient_id', patientIds);
      } else {
        // Aucun patient lié, retourner tableau vide
        return { interventions: [] };
      }
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return { interventions: data as Intervention[] };
  }

  async createIntervention(args: {
    patient_id: string;
    intervenant_id?: string;
    created_by_id: string;
    scheduled_start: string;
    scheduled_end: string;
    status?: 'planned' | 'done' | 'missed';
    notes?: string[];
  }) {
    const interventionData = {
      ...args,
      status: args.status || 'planned',
      notes: args.notes || []
    };

    const { data, error } = await supabase
      .from('interventions')
      .insert(interventionData)
      .select(`
        *,
        patients!inner (
          id,
          full_name,
          address,
          medical_notes
        ),
        intervenant:users!interventions_intervenant_id_fkey (
          id,
          full_name,
          role,
          sub_role,
          phone_number
        )
      `)
      .single();
    
    if (error) throw error;
    return { intervention: data as Intervention };
  }

  // === UTILISATEURS ===
  async getUserProfile(args: { id?: string; email?: string }) {
    if (!args.id && !args.email) {
      throw new Error('ID ou email requis');
    }

    let query = supabase
      .from('users')
      .select('*');

    if (args.id) {
      query = query.eq('id', args.id);
    } else if (args.email) {
      query = query.eq('email', args.email);
    }

    const { data, error } = await query.single();
    
    if (error) throw error;
    return { user: data as User };
  }

  // === NOTIFICATIONS ===
  async listNotifications(args: { aidant_id: string; limit?: number }) {
    const limit = args.limit || 20;
    
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        interventions!inner (
          id,
          scheduled_start,
          scheduled_end,
          status,
          patients!inner (
            id,
            full_name
          ),
          intervenant:users!interventions_intervenant_id_fkey (
            id,
            full_name
          )
        )
      `)
      .eq('aidant_id', args.aidant_id)
      .order('sent_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return { notifications: data as Notification[] };
  }

  // === LIENS AIDANT-PATIENT ===
  async getAidantPatients(args: { aidant_id: string }) {
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
          birth_date,
          medical_notes
        )
      `)
      .eq('aidant_id', args.aidant_id);
    
    if (error) throw error;
    
    const links = data as (AidantPatientLink & { patients: Patient })[];
    const patients = links.map(link => link.patients);
    
    return { patients, links };
  }
}