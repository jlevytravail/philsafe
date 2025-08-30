import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabaseService, Intervention, InterventionLog } from '@/services/supabaseService';
import { useSessionUser } from '@/context/UserContext';

interface UseInterventionsOptions {
  date?: string;
  status?: 'planned' | 'done' | 'missed';
  autoRefresh?: boolean;
}

export function useInterventions(options: UseInterventionsOptions = {}) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useSessionUser();

  // Mémoriser les options pour éviter les re-renders
  const memoizedOptions = useMemo(() => options, [
    options?.date,
    options?.status,
    options?.autoRefresh
  ]);

  const fetchInterventions = useCallback(async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const queryOptions: any = { ...memoizedOptions };
      
      // Filtrer selon le rôle de l'utilisateur
      if (profile.role === 'aidant') {
        queryOptions.aidantId = profile.id;
        console.log('🔍 DEBUG useInterventions - Aidant:', {
          aidantId: profile.id,
          fullName: profile.full_name,
          queryOptions
        });
      } else if (profile.role === 'intervenant') {
        queryOptions.intervenantId = profile.id;
        console.log('🔍 DEBUG useInterventions - Intervenant:', {
          intervenantId: profile.id,
          queryOptions
        });
      }
      
      const data = await supabaseService.getInterventions(queryOptions);
      
      console.log('🔍 DEBUG useInterventions - Résultats:', {
        role: profile.role,
        userId: profile.id,
        interventionsCount: data.length,
        interventions: data.map(i => ({
          id: i.id,
          patient: i.patient?.full_name,
          scheduled_start: i.scheduled_start,
          status: i.status,
          notes: i.notes
        }))
      });
      
      setInterventions(data);
    } catch (err) {
      console.error('Erreur lors du chargement des interventions:', err);
      setError('Impossible de charger les interventions');
    } finally {
      setLoading(false);
    }
  }, [profile?.id, profile?.role, memoizedOptions]);

  // Charger les données au montage et quand les options changent
  useEffect(() => {
    fetchInterventions();
  }, [fetchInterventions]);

  // Subscription temps réel si autoRefresh est activé
  useEffect(() => {
    if (!memoizedOptions.autoRefresh) return;

    const subscription = supabaseService.subscribeToInterventions((payload) => {
      console.log('Intervention mise à jour:', payload);
      // Recharger les données quand il y a un changement
      fetchInterventions();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [memoizedOptions.autoRefresh, fetchInterventions]);

  const updateInterventionStatus = async (interventionId: string, status: 'planned' | 'done' | 'missed') => {
    try {
      await supabaseService.updateInterventionStatus(interventionId, status);
      
      // Mettre à jour l'état local
      setInterventions(prev => 
        prev.map(intervention => 
          intervention.id === interventionId 
            ? { ...intervention, status }
            : intervention
        )
      );
      
      // Si l'intervention est marquée comme terminée, créer une notification
      if (status === 'done') {
        // TODO: Créer notification pour les aidants liés
      }
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      setError('Impossible de mettre à jour le statut');
      return false;
    }
  };

  const checkInIntervention = async (interventionId: string, remarks?: string) => {
    try {
      await supabaseService.checkInIntervention(interventionId, remarks);
      
      // Recharger les données pour avoir les dernières infos
      await fetchInterventions();
      
      return true;
    } catch (err) {
      console.error('Erreur lors du check-in:', err);
      setError('Impossible d\'enregistrer l\'arrivée');
      return false;
    }
  };

  const checkOutIntervention = async (interventionId: string, remarks?: string) => {
    try {
      await supabaseService.checkOutIntervention(interventionId, remarks);
      
      // Marquer l'intervention comme terminée
      await updateInterventionStatus(interventionId, 'done');
      
      return true;
    } catch (err) {
      console.error('Erreur lors du check-out:', err);
      setError('Impossible d\'enregistrer le départ');
      return false;
    }
  };

  // Utilitaires pour filtrer les interventions
  const getTodayInterventions = () => {
    const today = new Date().toISOString().split('T')[0];
    return interventions.filter(intervention => 
      intervention.scheduled_start.startsWith(today)
    );
  };

  const getPastInterventions = () => {
    const now = new Date();
    return interventions.filter(intervention => 
      new Date(intervention.scheduled_start) < now
    );
  };

  const getUpcomingInterventions = () => {
    const now = new Date();
    return interventions.filter(intervention => 
      new Date(intervention.scheduled_start) > now
    );
  };

  const getInterventionsByStatus = (status: 'planned' | 'done' | 'missed') => {
    return interventions.filter(intervention => intervention.status === status);
  };

  return {
    interventions,
    loading,
    error,
    refetch: fetchInterventions,
    updateInterventionStatus,
    checkInIntervention,
    checkOutIntervention,
    // Utilitaires
    getTodayInterventions,
    getPastInterventions,
    getUpcomingInterventions,
    getInterventionsByStatus
  };
}

// Hook spécialisé pour les interventions d'aujourd'hui
export function useTodayInterventions() {
  // Mémoriser la date pour éviter les re-calculs
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  // Mémoriser les options
  const options = useMemo(() => ({ 
    date: today, 
    autoRefresh: true 
  }), [today]);

  return useInterventions(options);
}

// Hook spécialisé pour l'historique
export function useInterventionHistory() {
  const options = useMemo(() => ({ 
    status: 'done' as const,
    autoRefresh: false 
  }), []);

  return useInterventions(options);
}