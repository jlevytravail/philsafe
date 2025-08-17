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
  // Relations jointes
  patient?: Patient;
  intervenant?: {
    id: string;
    full_name: string;
    sub_role: string;
  };
  intervention_logs?: {
    check_in: string | null;
    check_out: string | null;
    remarks: string | null;
  }[];
}

interface UseInterventionsOptions {
  dateFrom?: string; // Format: YYYY-MM-DD
  dateTo?: string;   // Format: YYYY-MM-DD
  limit?: number;
  status?: Intervention['status'];
}

interface UseInterventionsReturn {
  interventions: Intervention[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useInterventions(options: UseInterventionsOptions = {}): UseInterventionsReturn {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session, profile } = useSessionUser();

  const {
    dateFrom,
    dateTo,
    limit = 50,
    status
  } = options;

  const fetchInterventions = useCallback(async () => {
    if (!session?.user?.id || !profile?.role) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      let query = supabase
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
          ),
          intervention_logs(
            check_in,
            check_out,
            remarks
          )
        `);

      // Filtrage selon le rôle
      console.log('🔍 [useInterventions] User role:', profile.role, 'User ID:', session.user.id);
      
      if (profile.role === 'intervenant') {
        // Intervenant : ses propres interventions
        console.log('🔍 [useInterventions] Filtering for intervenant with ID:', session.user.id);
        query = query.eq('intervenant_id', session.user.id);
      } else if (profile.role === 'aidant') {
        // Aidant : interventions des patients liés
        const { data: patientLinks } = await supabase
          .from('aidant_patient_links')
          .select('patient_id')
          .eq('aidant_id', session.user.id);

        if (!patientLinks || patientLinks.length === 0) {
          setInterventions([]);
          setLoading(false);
          return;
        }

        const patientIds = patientLinks.map(link => link.patient_id);
        query = query.in('patient_id', patientIds);
      }

      // Filtres de date
      if (dateFrom) {
        const dateFromFilter = `${dateFrom}T00:00:00`;
        console.log('🔍 [useInterventions] Date filter FROM:', dateFromFilter);
        query = query.gte('scheduled_start', dateFromFilter);
      }
      if (dateTo) {
        const dateToFilter = `${dateTo}T23:59:59`;
        console.log('🔍 [useInterventions] Date filter TO:', dateToFilter);
        query = query.lte('scheduled_start', dateToFilter);
      }

      // Filtre de status
      if (status) {
        query = query.eq('status', status);
      }

      // Tri et limite
      query = query
        .order('scheduled_start', { ascending: true })
        .limit(limit);

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('🚨 [useInterventions] Query error:', fetchError);
        throw fetchError;
      }

      console.log('✅ [useInterventions] Data fetched:', data?.length, 'interventions');
      console.log('📋 [useInterventions] Full data:', data);
      
      setInterventions(data || []);
    } catch (err) {
      console.error('Erreur lors du fetch des interventions:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, profile?.role, dateFrom, dateTo, limit, status]);

  // Abonnement temps réel
  useEffect(() => {
    if (!session?.user?.id || !profile?.role) return;

    const channel = supabase
      .channel('interventions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interventions'
        },
        (payload) => {
          console.log('Changement détecté sur interventions:', payload);
          // Refetch minimal - on pourrait optimiser en updatent localement
          fetchInterventions();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'intervention_logs'
        },
        (payload) => {
          console.log('Changement détecté sur intervention_logs:', payload);
          fetchInterventions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, profile?.role, fetchInterventions]);

  // Initial fetch et refetch si les options changent
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

// Hook spécialisé pour aujourd'hui
export function useTodayInterventions() {
  const today = new Date().toISOString().split('T')[0];
  
  return useInterventions({
    dateFrom: today,
    dateTo: today,
    limit: 20
  });
}

// Hook spécialisé pour la semaine courante
export function useWeekInterventions() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Dimanche

  const dateFrom = startOfWeek.toISOString().split('T')[0];
  const dateTo = endOfWeek.toISOString().split('T')[0];

  return useInterventions({
    dateFrom,
    dateTo,
    limit: 100
  });
}