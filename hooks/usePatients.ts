import { useState, useEffect, useCallback } from 'react';
import { supabaseService, Patient } from '@/services/supabaseService';
import { useSessionUser } from '@/context/UserContext';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useSessionUser();

  const fetchPatients = useCallback(async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let data: Patient[];
      
      if (profile.role === 'aidant') {
        // Les aidants ne voient que leurs patients liés
        data = await supabaseService.getPatientsForAidant(profile.id);
      } else if (profile.role === 'intervenant') {
        // Les intervenants voient tous les patients (ou on peut filtrer par leurs interventions)
        data = await supabaseService.getPatients();
      } else {
        data = [];
      }
      
      setPatients(data);
    } catch (err) {
      console.error('Erreur lors du chargement des patients:', err);
      setError('Impossible de charger les patients');
    } finally {
      setLoading(false);
    }
  }, [profile?.id, profile?.role]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const createPatient = async (patientData: Omit<Patient, 'id' | 'created_at'>) => {
    try {
      const newPatient = await supabaseService.createPatient(patientData);
      
      // Si c'est un aidant qui crée le patient, créer automatiquement le lien
      if (profile?.role === 'aidant' && profile.id) {
        await supabaseService.linkAidantToPatient(profile.id, newPatient.id);
      }
      
      // Recharger la liste
      await fetchPatients();
      
      return newPatient;
    } catch (err) {
      console.error('Erreur lors de la création du patient:', err);
      setError('Impossible de créer le patient');
      return null;
    }
  };

  const linkToPatient = async (patientId: string) => {
    if (!profile?.id || profile.role !== 'aidant') return false;
    
    try {
      await supabaseService.linkAidantToPatient(profile.id, patientId);
      await fetchPatients(); // Recharger pour voir le nouveau patient
      return true;
    } catch (err) {
      console.error('Erreur lors du lien avec le patient:', err);
      setError('Impossible de se lier au patient');
      return false;
    }
  };

  const unlinkFromPatient = async (patientId: string) => {
    if (!profile?.id || profile.role !== 'aidant') return false;
    
    try {
      await supabaseService.unlinkAidantFromPatient(profile.id, patientId);
      await fetchPatients(); // Recharger pour retirer le patient
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression du lien:', err);
      setError('Impossible de supprimer le lien');
      return false;
    }
  };

  const searchPatients = (query: string) => {
    if (!query.trim()) return patients;
    
    const lowercaseQuery = query.toLowerCase();
    return patients.filter(patient => 
      patient.full_name.toLowerCase().includes(lowercaseQuery) ||
      patient.address.toLowerCase().includes(lowercaseQuery)
    );
  };

  const getPatientAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return {
    patients,
    loading,
    error,
    refetch: fetchPatients,
    createPatient,
    linkToPatient,
    unlinkFromPatient,
    searchPatients,
    getPatientAge
  };
}