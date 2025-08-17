import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useSessionUser } from '@/context/UserContext';
import { Patient } from './useInterventions';

interface UsePatients {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePatients(): UsePatients {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session, profile } = useSessionUser();

  const fetchPatients = useCallback(async () => {
    if (!session?.user?.id || !profile?.role) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      let query = supabase
        .from('patients')
        .select('*');

      if (profile.role === 'intervenant') {
        // Intervenant : patients avec lesquels il a des interventions
        const { data: interventions } = await supabase
          .from('interventions')
          .select('patient_id')
          .eq('intervenant_id', session.user.id);

        if (!interventions || interventions.length === 0) {
          setPatients([]);
          setLoading(false);
          return;
        }

        const patientIds = [...new Set(interventions.map(i => i.patient_id))];
        query = query.in('id', patientIds);
      } else if (profile.role === 'aidant') {
        // Aidant : patients liés via aidant_patient_links
        const { data: patientLinks } = await supabase
          .from('aidant_patient_links')
          .select('patient_id')
          .eq('aidant_id', session.user.id);

        if (!patientLinks || patientLinks.length === 0) {
          setPatients([]);
          setLoading(false);
          return;
        }

        const patientIds = patientLinks.map(link => link.patient_id);
        query = query.in('id', patientIds);
      }

      const { data, error: fetchError } = await query.order('full_name');

      if (fetchError) {
        throw fetchError;
      }

      setPatients(data || []);
    } catch (err) {
      console.error('Erreur lors du fetch des patients:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, profile?.role]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const refetch = useCallback(async () => {
    await fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    loading,
    error,
    refetch
  };
}