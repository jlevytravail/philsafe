import { useState, useEffect, useCallback } from 'react';
import { supabaseService } from '@/services/supabaseService';

interface Caregiver {
  id: string;
  full_name: string;
  role: string;
  sub_role?: string;
  phone_number?: string;
}

export function useCaregivers() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCaregivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await supabaseService.getIntervenants();
      setCaregivers(data);
    } catch (err) {
      console.error('Erreur lors du chargement des intervenants:', err);
      setError('Impossible de charger les intervenants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaregivers();
  }, [fetchCaregivers]);

  const searchCaregivers = (query: string) => {
    if (!query.trim()) return caregivers;
    
    const lowercaseQuery = query.toLowerCase();
    return caregivers.filter(caregiver => 
      caregiver.full_name.toLowerCase().includes(lowercaseQuery) ||
      (caregiver.sub_role && caregiver.sub_role.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getCaregiversByRole = (subRole: string) => {
    return caregivers.filter(caregiver => 
      caregiver.sub_role?.toLowerCase() === subRole.toLowerCase()
    );
  };

  const getCaregiverById = (id: string) => {
    return caregivers.find(caregiver => caregiver.id === id);
  };

  return {
    caregivers,
    loading,
    error,
    refetch: fetchCaregivers,
    searchCaregivers,
    getCaregiversByRole,
    getCaregiverById
  };
}