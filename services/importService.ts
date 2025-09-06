import { supabase } from '@/utils/supabase';

// Types pour l'import de calendriers
export interface PatientImportData {
  full_name: string;
  address: string;
  birth_date: string; // Format YYYY-MM-DD
  medical_notes?: string;
}

export interface InterventionImportData {
  scheduled_start: string; // Format ISO 8601
  scheduled_end: string;
  status?: 'planned' | 'done' | 'missed';
  notes: string[];
}

export interface UserCalendarImportData {
  email: string;
  full_name: string;
  role?: 'aidant' | 'intervenant';
  sub_role?: string;
  phone_number?: string;
  patients: PatientImportData[];
  interventions: InterventionImportData[];
}

export interface DiagnosticResult {
  success: boolean;
  auth_uid?: string;
  user_found: boolean;
  user_info?: {
    id: string;
    email: string;
    auth_id: string | null;
    auth_id_matches: boolean;
  };
  data_access?: {
    links_count: number;
    interventions_count: number;
  };
  error?: string;
}

class ImportService {
  /**
   * Importe un utilisateur avec son calendrier complet
   */
  async importUserCalendar(data: UserCalendarImportData) {
    try {
      console.log('🔄 Import en cours pour:', data.email);
      
      const { data: result, error } = await supabase.rpc('import_user_with_calendar', {
        p_email: data.email,
        p_full_name: data.full_name,
        p_role: data.role || 'aidant',
        p_sub_role: data.sub_role,
        p_phone_number: data.phone_number,
        p_patients_data: data.patients,
        p_interventions_data: data.interventions
      });

      if (error) {
        console.error('❌ Erreur lors de l\'import:', error);
        throw error;
      }

      console.log('✅ Import réussi:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur dans importUserCalendar:', error);
      throw error;
    }
  }

  /**
   * Diagnostique l'accès RLS pour l'utilisateur actuel
   */
  async diagnoseCurrentUser(): Promise<DiagnosticResult> {
    try {
      const { data: result, error } = await supabase.rpc('diagnose_rls_for_user');

      if (error) {
        console.error('❌ Erreur lors du diagnostic:', error);
        throw error;
      }

      console.log('🔍 Diagnostic RLS:', result);
      return result as DiagnosticResult;
    } catch (error) {
      console.error('❌ Erreur dans diagnoseCurrentUser:', error);
      return {
        success: false,
        user_found: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Valide qu'un utilisateur peut voir ses données après import
   */
  async validateImportSuccess(userEmail: string) {
    try {
      console.log('🔍 Validation de l\'import pour:', userEmail);
      
      // 1. Vérifier que l'utilisateur existe
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, auth_id, role')
        .eq('email', userEmail)
        .single();

      if (userError || !user) {
        throw new Error(`Utilisateur non trouvé: ${userEmail}`);
      }

      // 2. Vérifier les liens patient
      const { data: links, error: linksError } = await supabase
        .from('aidant_patient_links')
        .select('patient_id')
        .eq('aidant_id', user.id);

      if (linksError) {
        throw linksError;
      }

      // 3. Vérifier les interventions
      const patientIds = links?.map(link => link.patient_id) || [];
      const { data: interventions, error: interventionsError } = await supabase
        .from('interventions')
        .select('id, patient_id, scheduled_start')
        .or(`created_by_id.eq.${user.id},patient_id.in.(${patientIds.join(',')})`);

      if (interventionsError && patientIds.length > 0) {
        throw interventionsError;
      }

      const result = {
        success: true,
        user_id: user.id,
        email: user.email,
        auth_id: user.auth_id,
        auth_id_configured: user.auth_id !== null,
        patients_linked: links?.length || 0,
        interventions_accessible: interventions?.length || 0,
        issues: [] as string[]
      };

      // Détecter les problèmes potentiels
      if (!user.auth_id) {
        result.issues.push('auth_id is null - user might have visibility issues');
      }
      if (result.patients_linked === 0) {
        result.issues.push('No patients linked - no interventions will be visible');
      }

      console.log('✅ Validation terminée:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de la validation:', error);
      throw error;
    }
  }

  /**
   * Corrige les auth_id manquants pour les utilisateurs existants
   */
  async fixMissingAuthIds() {
    try {
      console.log('🔧 Correction des auth_id manquants...');
      
      const { data: result, error } = await supabase.rpc('fix_missing_auth_ids');

      if (error) {
        throw error;
      }

      console.log('✅ Correction terminée:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de la correction:', error);
      throw error;
    }
  }

  /**
   * Exemple d'import pour tester le système
   */
  generateTestImportData(email: string, name: string): UserCalendarImportData {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      email: email,
      full_name: name,
      role: 'aidant',
      sub_role: 'famille',
      phone_number: '06.12.34.56.78',
      patients: [
        {
          full_name: 'Jean Dupont',
          address: '123 rue de la Paix, 75001 Paris',
          birth_date: '1940-05-15',
          medical_notes: 'Diabète, hypertension. Surveillance quotidienne.'
        },
        {
          full_name: 'Marie Martin',
          address: '45 avenue des Champs, 75008 Paris',
          birth_date: '1945-08-22',
          medical_notes: 'Arthrose, mobilité réduite. Aide quotidienne nécessaire.'
        }
      ],
      interventions: [
        {
          scheduled_start: `${today.toISOString().split('T')[0]}T09:00:00.000Z`,
          scheduled_end: `${today.toISOString().split('T')[0]}T10:00:00.000Z`,
          status: 'planned',
          notes: ['toilette', 'medicaments']
        },
        {
          scheduled_start: `${today.toISOString().split('T')[0]}T14:00:00.000Z`,
          scheduled_end: `${today.toISOString().split('T')[0]}T15:00:00.000Z`,
          status: 'planned',
          notes: ['soins_infirmiers', 'controle_tension']
        },
        {
          scheduled_start: `${tomorrow.toISOString().split('T')[0]}T09:00:00.000Z`,
          scheduled_end: `${tomorrow.toISOString().split('T')[0]}T10:00:00.000Z`,
          status: 'planned',
          notes: ['toilette', 'aide_mobilite']
        }
      ]
    };
  }
}

export const importService = new ImportService();