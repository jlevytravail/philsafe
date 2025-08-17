// Hook de debug temporaire - Version sans filtre de date
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useSessionUser } from '@/context/UserContext';

export interface Patient {
  id: string;
  full_name: string;
  address: string;
  birth_date: string;
  medical_notes: string;
}

export interface Intervention {
  id: string;
  patient_id: string;
  intervenant_id: string;
  created_by_id: string;
  scheduled_start: string;
  scheduled_end: string;
  status: 'planned' | 'done' | 'missed';
  notes: string[];
  created_at: string;
  patient?: Patient;
  intervenant?: {
    id: string;
    full_name: string;
    sub_role: string;
  };
}

export function useInterventionsDebug() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session, profile } = useSessionUser();

  const fetchInterventions = useCallback(async () => {
    if (!session?.user?.id || !profile?.role) {
      console.log('🔍 [DEBUG] No session or profile');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      console.log('🔍 [DEBUG] User role:', profile.role, 'User ID:', session.user.id);

      // VERSION SIMPLE : Récupérer TOUTES les interventions de l'utilisateur
      const query = supabase
        .from('interventions')
        .select(`
          *,
          patient:patients(
            id,
            full_name,
            address,
            birth_date,
            medical_notes
          ),
          intervenant:users!interventions_intervenant_id_fkey(
            id,
            full_name,
            sub_role
          )
        `)
        .eq('intervenant_id', session.user.id)
        .order('scheduled_start', { ascending: true });

      console.log('🔍 [DEBUG] Executing query without date filters...');

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('🚨 [DEBUG] Query error:', fetchError);
        throw fetchError;
      }

      console.log('✅ [DEBUG] Data fetched:', data?.length, 'interventions');
      console.log('📋 [DEBUG] Full data:', data);
      
      // Filtrer côté client pour aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const todayInterventions = data?.filter(intervention => {
        const interventionDate = new Date(intervention.scheduled_start).toISOString().split('T')[0];
        console.log('🔍 [DEBUG] Comparing:', interventionDate, 'with today:', today);
        return interventionDate === today;
      }) || [];

      console.log('✅ [DEBUG] Today interventions after client filter:', todayInterventions.length);
      
      setInterventions(todayInterventions);
    } catch (err) {
      console.error('🚨 [DEBUG] Error:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, profile?.role]);

  useEffect(() => {
    fetchInterventions();
  }, [fetchInterventions]);

  const refetch = useCallback(async () => {
    await fetchInterventions();
  }, [fetchInterventions]);

  return {
    interventions,
    loading,
    error,
    refetch
  };
}