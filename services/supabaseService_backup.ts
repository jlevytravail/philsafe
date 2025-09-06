// Version de sauvegarde sans accès à la table users
// À utiliser temporairement pour contourner les problèmes de permissions

import { supabase } from '@/utils/supabase';
import type { Patient, Intervention, InterventionLog, AidantPatientLink, Notification } from './supabaseService';

export class SupabaseServiceNoUsers {
  
  // === PATIENTS ===
  async getPatients() {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('full_name', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  // === INTERVENTIONS SANS JOINTURE USERS ===
  async getInterventions(options?: {
    aidantId?: string;
    intervenantId?: string;
    patientId?: string;
    date?: string;
    status?: string;
  }) {
    try {
      // Si c'est un aidant, d'abord récupérer ses patients SANS utiliser la table users
      let patientIds: string[] = [];
      if (options?.aidantId) {
        console.log('🔍 DEBUG SupabaseServiceNoUsers - Recherche patients pour aidant:', options.aidantId);
        
        const { data: links, error: linksError } = await supabase
          .from('aidant_patient_links')
          .select('patient_id')
          .eq('aidant_id', options.aidantId);
        
        if (linksError) throw linksError;
        patientIds = links?.map(link => link.patient_id) || [];
        
        console.log('🔍 DEBUG SupabaseServiceNoUsers - Liens trouvés:', {
          aidantId: options.aidantId,
          linksCount: links?.length || 0,
          patientIds: patientIds
        });
        
        if (patientIds.length === 0) {
          console.log('⚠️ DEBUG SupabaseServiceNoUsers - Aucun patient lié pour cet aidant');
          return [];
        }
      }

      // Requête simple sans jointure users
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

      console.log('🔍 DEBUG SupabaseServiceNoUsers - Résultats requête interventions:', {
        dataCount: data?.length || 0,
        interventions: data?.slice(0, 2) || [], // Montrer seulement les 2 premières pour debug
        options,
        patientIds: options?.aidantId ? patientIds : 'N/A'
      });

      return data || [];
    } catch (error) {
      console.error('❌ Erreur dans getInterventions (NoUsers):', error);
      throw error;
    }
  }

  // === NOTIFICATIONS SIMPLES ===
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
      console.error('❌ Erreur dans getNotifications (NoUsers):', error);
      // Retourner un tableau vide au lieu de throw pour éviter de bloquer l'app
      return [];
    }
  }
}

export const supabaseServiceNoUsers = new SupabaseServiceNoUsers();