/**
 * Script pour insérer des données de test dans Supabase
 * À exécuter une seule fois pour préparer la base de données avec des données réalistes
 */

import { supabase } from '@/utils/supabase';
import { supabaseService } from '@/services/supabaseService';

interface TestData {
  patients: any[];
  intervenants: any[];
  interventions: any[];
  aidantPatientLinks: any[];
}

// Version RPC utilisant une fonction Supabase pour bypasser les RLS
export async function seedTestDataWithRPC(): Promise<TestData> {
  console.log('🌱 Insertion des données de test via fonction RPC...');
  
  try {
    // Vérifier que l'utilisateur est connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Utilisateur non connecté. Connectez-vous d\'abord pour insérer des données de test.');
    }
    console.log('👤 Utilisateur connecté:', user.email);

    // Appeler la fonction RPC create_test_data
    console.log('🔧 Appel de la fonction RPC create_test_data()...');
    const { data: result, error: rpcError } = await supabase.rpc('create_test_data');
    
    if (rpcError) {
      console.error('❌ Erreur RPC:', rpcError);
      throw new Error(`Erreur fonction RPC: ${rpcError.message}`);
    }
    
    if (!result) {
      throw new Error('Aucune réponse de la fonction RPC');
    }
    
    // Vérifier le résultat
    if (result.success) {
      console.log('🎉 Données de test créées avec succès via RPC !');
      console.log('📊 Résumé:');
      console.log(`├── Intervenants: ${result.data.intervenants_count}`);
      console.log(`├── Patients: ${result.data.patients_count}`);
      console.log(`├── Interventions: ${result.data.interventions_count}`);
      console.log(`├── Notifications: ${result.data.notifications_count}`);
      console.log(`└── Aidant ID: ${result.data.aidant_id}`);
      
      // Récupérer les données créées pour les retourner
      console.log('📋 Récupération des données créées...');
      
      // Récupérer les intervenants créés
      const { data: intervenants, error: intervenantsError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'intervenant')
        .in('id', result.data.intervenants_ids);
      
      if (intervenantsError) {
        console.warn('⚠️ Impossible de récupérer les intervenants:', intervenantsError);
      }
      
      // Récupérer les patients créés
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .in('id', result.data.patients_ids);
      
      if (patientsError) {
        console.warn('⚠️ Impossible de récupérer les patients:', patientsError);
      }
      
      // Récupérer les interventions créées
      const { data: interventions, error: interventionsError } = await supabase
        .from('interventions')
        .select('*')
        .eq('created_by_id', user.id)
        .gte('created_at', new Date(Date.now() - 60000).toISOString()); // Créées dans la dernière minute
      
      if (interventionsError) {
        console.warn('⚠️ Impossible de récupérer les interventions:', interventionsError);
      }
      
      // Récupérer les liens aidant-patient
      const { data: aidantPatientLinks, error: linksError } = await supabase
        .from('aidant_patient_links')
        .select('*')
        .eq('aidant_id', user.id)
        .in('patient_id', result.data.patients_ids);
      
      if (linksError) {
        console.warn('⚠️ Impossible de récupérer les liens:', linksError);
      }
      
      // VÉRIFICATION CRITIQUE: Si aucun lien n'a été créé malgré le succès RPC, c'est un échec
      if (!aidantPatientLinks || aidantPatientLinks.length === 0) {
        console.error('❌ ÉCHEC CRITIQUE: La fonction RPC a réussi mais n\'a créé aucun lien aidant-patient !');
        console.error('   → Les interventions ne seront pas visibles sur le dashboard');
        console.error('   → Déclenchement de la solution de contournement...');
        
        // Lancer une erreur pour déclencher automatiquement le fallback
        throw new Error('RPC function failed to create aidant-patient links - dashboard will be empty');
      }
      
      console.log(`✅ ${aidantPatientLinks.length} liens aidant-patient créés avec succès`);
      
      return {
        patients: patients || [],
        intervenants: intervenants || [],
        interventions: interventions || [],
        aidantPatientLinks: aidantPatientLinks || []
      };
      
    } else {
      console.error('❌ Erreur rapportée par la fonction RPC:', result.error);
      throw new Error(`Erreur RPC: ${result.error} (Code: ${result.error_code})`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données via RPC:', error);
    throw error;
  }
}

// Version alternative utilisant les services (peut mieux gérer les RLS)
export async function seedTestDataWithServices(): Promise<TestData> {
  console.log('🌱 Insertion des données de test via services...');
  
  try {
    // Vérifier que l'utilisateur est connecté avec attente de session stable
    console.log('🔍 Vérification de la session utilisateur...');
    
    let user = null;
    let attempts = 0;
    const maxAttempts = 5; // Augmenter le nombre d'attempts
    
    // Essayer plusieurs fois car la session peut être en cours de rafraîchissement
    while (!user && attempts < maxAttempts) {
      attempts++;
      console.log(`📡 Tentative ${attempts}/${maxAttempts} de récupération de session...`);
      
      try {
        // D'abord essayer de récupérer la session courante
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error(`❌ Erreur session (tentative ${attempts}):`, sessionError);
          
          // Si l'erreur est "Auth session missing", on essaie de forcer la récupération
          if (sessionError.message.includes('Auth session missing')) {
            console.log('🔄 Session manquante, tentative de refresh...');
            
            // Essayer de refresh la session
            const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
            
            if (!refreshError && refreshedSession?.user) {
              user = refreshedSession.user;
              console.log('✅ Session récupérée via refresh:', user.email);
              break;
            }
          }
        } else if (session && session.user) {
          user = session.user;
          console.log('✅ Session utilisateur récupérée:', user.email);
          break;
        }
        
        // Si pas de session, essayer getUser() comme fallback
        if (!user) {
          try {
            const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
              console.error(`❌ Erreur getUser (tentative ${attempts}):`, userError);
            } else if (currentUser) {
              user = currentUser;
              console.log('✅ Utilisateur récupéré via getUser():', user.email);
              break;
            }
          } catch (getUserErr) {
            console.error(`❌ Exception lors de getUser (tentative ${attempts}):`, getUserErr);
          }
        }
        
      } catch (generalError) {
        console.error(`❌ Erreur générale lors de la récupération (tentative ${attempts}):`, generalError);
      }
      
      if (attempts === maxAttempts) {
        console.log('🔍 Dernière vérification: test simple de connexion...');
        
        // Essayer une dernière fois avec une approche différente
        try {
          console.log('🔄 Dernière tentative: force refresh session...');
          
          // Forcer un refresh de session
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (!refreshError && refreshData.session?.user) {
            user = refreshData.session.user;
            console.log('✅ Utilisateur récupéré via refresh session:', user.email);
            break;
          }
          
          // Essayer getUser une dernière fois
          const { data: authData, error: authError } = await supabase.auth.getUser();
          if (!authError && authData.user) {
            user = authData.user;
            console.log('✅ Utilisateur récupéré en dernière tentative:', user.email);
            break;
          }
          
          console.log('🧪 Test de requête authentifiée pour forcer la session...');
          
          // Essayer une requête qui nécessite une authentification
          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('id, email')
            .limit(1)
            .single();
            
          if (!profileError && profileData) {
            // Si on arrive ici, on a une session qui fonctionne, mais on ne peut pas récupérer l'utilisateur
            console.log('🔄 Session active détectée via requête, nouvelle tentative getUser...');
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            const { data: finalAuthData, error: finalAuthError } = await supabase.auth.getUser();
            if (!finalAuthError && finalAuthData.user) {
              user = finalAuthData.user;
              console.log('✅ Utilisateur enfin récupéré:', user.email);
              break;
            }
          }
          
          // Test de requête simple pour vérifier si on peut accéder à la DB
          const { data: testData, error: testError } = await supabase.from('users').select('id').limit(1);
          
          if (!testError && testData) {
            throw new Error('✅ Base de données accessible mais session utilisateur introuvable.\n' +
                          '💡 Solutions possibles:\n' +
                          '1. Attendre 10-15 secondes et réessayer\n' +
                          '2. Se déconnecter puis se reconnecter\n' +
                          '3. Fermer et relancer l\'application\n' +
                          '4. Vider le cache de l\'app (Expo: secouer > "Reload")');
          }
          
        } catch (finalTestError) {
          console.error('❌ Test final échoué:', finalTestError);
        }
        
        throw new Error('❌ Impossible de récupérer la session utilisateur après ' + maxAttempts + ' tentatives.\n' +
                      '💡 Veuillez vous reconnecter ou redémarrer l\'application.');
      }
      
      const waitTime = 2000 + (attempts * 1500); // Attente progressive: 3.5s, 5s, 6.5s, 8s, 9.5s
      console.log(`⏳ Session non disponible, attente de ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    if (!user) {
      throw new Error('Utilisateur non connecté. Connectez-vous d\'abord pour insérer des données de test.');
    }

    // 1. Essayer de créer des patients via insertion directe avec RLS bypass
    console.log('📋 Tentative de création des patients...');
    const patientsData = [
      {
        full_name: 'Marie Dupont',
        address: '15 rue des Lilas, 75001 Paris',
        birth_date: '1945-03-15',
        medical_notes: 'Diabète type 2, Hypertension artérielle. Traitement : Metformine 500mg matin et soir, Ramipril 5mg le matin.',
        created_by: user.id // Ajouter l'utilisateur créateur pour les RLS
      },
      {
        full_name: 'Jean Martin',
        address: '8 avenue Victor Hugo, 75016 Paris',
        birth_date: '1941-08-22',
        medical_notes: 'Maladie d\'Alzheimer stade modéré, troubles de la mobilité. Surveillance constante nécessaire.',
        created_by: user.id
      },
      {
        full_name: 'Françoise Blanc',
        address: '22 boulevard Saint-Germain, 75005 Paris',
        birth_date: '1948-11-30',
        medical_notes: 'Mobilité réduite suite à fracture du col du fémur. Utilise un déambulateur.',
        created_by: user.id
      }
    ];

    const patients = [];
    
    // Essayer d'abord l'insertion directe avec bypass RLS
    console.log('🔧 Tentative d\'insertion directe avec RLS...');
    
    try {
      const { data: insertedPatients, error: directError } = await supabase
        .from('patients')
        .insert(patientsData)
        .select();
      
      if (!directError && insertedPatients) {
        patients.push(...insertedPatients);
        console.log(`✅ ${insertedPatients.length} patients créés par insertion directe`);
      } else {
        throw new Error(`Insertion directe échouée: ${directError?.message}`);
      }
    } catch (directInsertError: any) {
      console.log(`⚠️ Insertion directe échouée: ${directInsertError.message}`);
      
      // Fallback : utiliser des patients existants ou créer via service admin
      console.log('🔄 Fallback: Recherche de patients existants ou création alternative...');
      
      // Option 1: Essayer de récupérer des patients existants
      const { data: existingPatients, error: fetchError } = await supabase
        .from('patients')
        .select('*')
        .limit(3);
      
      if (!fetchError && existingPatients && existingPatients.length > 0) {
        patients.push(...existingPatients);
        console.log(`✅ Utilisation de ${existingPatients.length} patients existants`);
      } else {
        // Option 2: Créer des patients de test avec les bonnes permissions
        console.log('🔧 Tentative de création avec permissions spéciales...');
        
        // Utiliser une approche RPC ou fonction Postgres si disponible
        try {
          // Créer un par un avec gestion d'erreur individuelle
          for (const patientData of patientsData.slice(0, 1)) { // Commencer par 1 seul
            try {
              const { data: singlePatient, error: singleError } = await supabase
                .from('patients')
                .insert({
                  ...patientData,
                  // Essayer différentes approches pour contourner RLS
                })
                .select()
                .single();
              
              if (!singleError && singlePatient) {
                patients.push(singlePatient);
                console.log(`✅ Patient créé individuellement: ${singlePatient.full_name}`);
              } else {
                console.log(`⚠️ Impossible de créer ${patientData.full_name}: ${singleError?.message}`);
              }
            } catch (singlePatientError) {
              console.log(`⚠️ Exception patient ${patientData.full_name}:`, singlePatientError);
            }
          }
          
          // Si on n'a aucun patient, créer des données de test minimales
          if (patients.length === 0) {
            console.log('📝 Création de données de test minimales sans patients...');
            // Continuer le script sans patients - utiliser les intervenants seulement
          }
        } catch (alternativeError) {
          console.log('⚠️ Toutes les tentatives de création de patients ont échoué');
          console.log('ℹ️ Le script continuera avec les autres données disponibles');
        }
      }
    }

    // Pas d'intervenants via service (pas encore implémenté), utiliser l'insertion directe pour eux
    console.log('👨‍⚕️ Création des intervenants (insertion directe)...');
    const intervenantsToInsert = [
      {
        full_name: 'Marie Dubois',
        email: 'marie.dubois@philsafe.com',
        role: 'intervenant',
        sub_role: 'aide-soignante',
        phone_number: '06 12 34 56 78'
      },
      {
        full_name: 'Pierre Martin',
        email: 'pierre.martin@philsafe.com',
        role: 'intervenant',
        sub_role: 'infirmier',
        phone_number: '06 98 76 54 32'
      },
      {
        full_name: 'Sophie Leroy',
        email: 'sophie.leroy@philsafe.com',
        role: 'intervenant',
        sub_role: 'auxiliaire de vie',
        phone_number: '06 55 44 33 22'
      }
    ];

    const { data: intervenants, error: intervenantsError } = await supabase
      .from('users')
      .insert(intervenantsToInsert)
      .select();

    if (intervenantsError) {
      console.error('❌ Erreur lors de l\'insertion des intervenants:', intervenantsError);
      throw new Error(`Erreur RLS intervenants: ${intervenantsError.message}`);
    }

    // Créer les liens aidant-patients via service (seulement si on a des patients)
    console.log('🔗 Création des liens aidant-patients via service...');
    const aidantPatientLinks = [];
    
    if (patients.length > 0) {
      for (const patient of patients) {
        try {
          const link = await supabaseService.linkAidantToPatient(user.id, patient.id);
          aidantPatientLinks.push(link);
          console.log(`✅ Lien créé: ${user.id} ↔ ${patient.full_name}`);
        } catch (error: any) {
          console.error(`❌ Erreur création lien patient ${patient.full_name}:`, error);
          console.log(`⚠️ Lien ignoré pour ${patient.full_name}, continuons...`);
          // Ne pas faire échouer tout le processus pour un lien
        }
      }
    } else {
      console.log('ℹ️ Aucun patient disponible, pas de liens à créer');
    }

    // Pour les interventions, utiliser aussi le service (seulement si on a des patients et intervenants)
    console.log('📅 Création des interventions via service...');
    const interventions = [];
    const today = new Date();
    
    if (patients.length > 0 && intervenants && intervenants.length > 0) {
      // Créer quelques interventions pour chaque patient
      const patientsToUse = patients.slice(0, Math.min(2, patients.length)); // Limiter selon les patients disponibles
      
      for (const patient of patientsToUse) {
        for (let dayOffset = -1; dayOffset <= 2; dayOffset++) {
          const date = new Date(today);
          date.setDate(today.getDate() + dayOffset);
          
          const morningStart = new Date(date);
          morningStart.setHours(8, 30, 0, 0);
          const morningEnd = new Date(morningStart);
          morningEnd.setHours(9, 30, 0, 0);
          
          const interventionData = {
            patient_id: patient.id,
            intervenant_id: intervenants[0].id, // Premier intervenant disponible
            created_by_id: user.id,
            scheduled_start: morningStart.toISOString(),
            scheduled_end: morningEnd.toISOString(),
            status: dayOffset < 0 ? 'done' : 'planned',
            notes: ['Toilette', 'Prise de médicaments', 'Petit déjeuner']
          } as const;
          
          try {
            const intervention = await supabaseService.createIntervention(interventionData);
            interventions.push(intervention);
            console.log(`✅ Intervention créée: ${patient.full_name} - ${date.toLocaleDateString()}`);
          } catch (error: any) {
            console.error(`❌ Erreur création intervention:`, error);
            console.log(`⚠️ Intervention ignorée pour ${patient.full_name}, continuons...`);
            // Ne pas faire échouer tout le processus pour une intervention
          }
        }
      }
    } else {
      console.log('ℹ️ Patients ou intervenants manquants, pas d\'interventions à créer');
      
      // Créer des données de test minimales si possible
      if (intervenants && intervenants.length > 0) {
        console.log('📝 Création d\'interventions de test sans patients spécifiques...');
        // Ici on pourrait créer des interventions de test génériques si nécessaire
      }
    }

    const summary = {
      patients: patients.length,
      intervenants: intervenants?.length || 0,
      interventions: interventions.length,
      links: aidantPatientLinks.length
    };
    
    console.log('🎉 Données de test créées avec succès via services !');
    console.log('📊 Résumé:');
    console.log(`├── Patients: ${summary.patients}`);
    console.log(`├── Intervenants: ${summary.intervenants}`);
    console.log(`├── Interventions: ${summary.interventions}`);
    console.log(`└── Liens aidant-patient: ${summary.links}`);
    
    if (summary.patients === 0) {
      console.log('⚠️ Note: Aucun patient créé en raison des restrictions RLS');
      console.log('💡 Les patients peuvent être ajoutés manuellement via l\'interface admin ou avec les bonnes permissions');
    }
    
    return {
      patients,
      intervenants,
      interventions,
      aidantPatientLinks
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données via services:', error);
    throw error;
  }
}

export async function seedTestData(): Promise<TestData> {
  console.log('🌱 Insertion des données de test...');
  
  try {
    // Vérifier que l'utilisateur est connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Utilisateur non connecté. Connectez-vous d\'abord pour insérer des données de test.');
    }
    console.log('👤 Utilisateur connecté:', user.email);

    // 1. Créer des patients de test
    console.log('📋 Création des patients...');
    const patientsToInsert = [
      {
        full_name: 'Marie Dupont',
        address: '15 rue des Lilas, 75001 Paris',
        birth_date: '1945-03-15',
        medical_notes: 'Diabète type 2, Hypertension artérielle. Traitement : Metformine 500mg matin et soir, Ramipril 5mg le matin.'
      },
      {
        full_name: 'Jean Martin',
        address: '8 avenue Victor Hugo, 75016 Paris',
        birth_date: '1941-08-22',
        medical_notes: 'Maladie d\'Alzheimer stade modéré, troubles de la mobilité. Surveillance constante nécessaire.'
      },
      {
        full_name: 'Françoise Blanc',
        address: '22 boulevard Saint-Germain, 75005 Paris',
        birth_date: '1948-11-30',
        medical_notes: 'Mobilité réduite suite à fracture du col du fémur. Utilise un déambulateur.'
      }
    ];

    // Essayer d'insérer les patients avec gestion d'erreur améliorée
    console.log('🔧 Tentative d\'insertion des patients...');
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .insert(patientsToInsert)
      .select();

    if (patientsError) {
      console.error('❌ Erreur lors de l\'insertion des patients:', patientsError);
      throw new Error(`Erreur RLS patients: ${patientsError.message}. Vérifiez les politiques Supabase.`);
    }
    console.log(`✅ ${patients.length} patients créés`);

    // 2. Créer des intervenants de test
    console.log('👨‍⚕️ Création des intervenants...');
    const intervenantsToInsert = [
      {
        full_name: 'Marie Dubois',
        email: 'marie.dubois@philsafe.com',
        role: 'intervenant',
        sub_role: 'aide-soignante',
        phone_number: '06 12 34 56 78'
      },
      {
        full_name: 'Pierre Martin',
        email: 'pierre.martin@philsafe.com',
        role: 'intervenant',
        sub_role: 'infirmier',
        phone_number: '06 98 76 54 32'
      },
      {
        full_name: 'Sophie Leroy',
        email: 'sophie.leroy@philsafe.com',
        role: 'intervenant',
        sub_role: 'auxiliaire de vie',
        phone_number: '06 55 44 33 22'
      }
    ];

    console.log('🔧 Tentative d\'insertion des intervenants...');
    const { data: intervenants, error: intervenantsError } = await supabase
      .from('users')
      .insert(intervenantsToInsert)
      .select();

    if (intervenantsError) {
      console.error('❌ Erreur lors de l\'insertion des intervenants:', intervenantsError);
      throw new Error(`Erreur RLS intervenants: ${intervenantsError.message}. Vérifiez les politiques Supabase.`);
    }
    console.log(`✅ ${intervenants.length} intervenants créés`);

    // 3. Utiliser l'utilisateur connecté pour les liens (déjà récupéré plus haut)

    // 4. Créer les liens aidant-patients
    console.log('🔗 Création des liens aidant-patients...');
    const linksToInsert = patients.map(patient => ({
      aidant_id: user.id,
      patient_id: patient.id
    }));

    const { data: aidantPatientLinks, error: linksError } = await supabase
      .from('aidant_patient_links')
      .insert(linksToInsert)
      .select();

    if (linksError) throw linksError;
    console.log(`✅ ${aidantPatientLinks.length} liens créés`);

    // 5. Créer des interventions sur 7 jours
    console.log('📅 Création des interventions...');
    const interventionsToInsert = [];
    const today = new Date();
    
    // Générer des interventions pour chaque patient sur 7 jours
    for (let dayOffset = -2; dayOffset <= 4; dayOffset++) {
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset);
      
      for (const patient of patients) {
        // Intervention du matin (aide-soignante)
        const morningStart = new Date(date);
        morningStart.setHours(8, 30, 0, 0);
        const morningEnd = new Date(morningStart);
        morningEnd.setHours(9, 30, 0, 0);
        
        interventionsToInsert.push({
          patient_id: patient.id,
          intervenant_id: intervenants[0].id, // Marie Dubois
          created_by_id: user.id,
          scheduled_start: morningStart.toISOString(),
          scheduled_end: morningEnd.toISOString(),
          status: dayOffset < 0 ? 'done' : (dayOffset === 0 ? 'planned' : 'planned'),
          notes: ['Toilette', 'Prise de médicaments', 'Petit déjeuner']
        });

        // Intervention de l'après-midi (infirmier) - pas tous les jours
        if (dayOffset % 2 === 0) {
          const afternoonStart = new Date(date);
          afternoonStart.setHours(14, 0, 0, 0);
          const afternoonEnd = new Date(afternoonStart);
          afternoonEnd.setHours(15, 0, 0, 0);
          
          interventionsToInsert.push({
            patient_id: patient.id,
            intervenant_id: intervenants[1].id, // Pierre Martin
            created_by_id: user.id,
            scheduled_start: afternoonStart.toISOString(),
            scheduled_end: afternoonEnd.toISOString(),
            status: dayOffset < 0 ? 'done' : (dayOffset === 0 ? 'planned' : 'planned'),
            notes: ['Soins infirmiers', 'Contrôle tension', 'Pansement']
          });
        }

        // Intervention du soir (auxiliaire de vie) - quelques jours
        if (dayOffset >= 0 && dayOffset <= 2) {
          const eveningStart = new Date(date);
          eveningStart.setHours(18, 0, 0, 0);
          const eveningEnd = new Date(eveningStart);
          eveningEnd.setHours(19, 0, 0, 0);
          
          interventionsToInsert.push({
            patient_id: patient.id,
            intervenant_id: intervenants[2].id, // Sophie Leroy
            created_by_id: user.id,
            scheduled_start: eveningStart.toISOString(),
            scheduled_end: eveningEnd.toISOString(),
            status: 'planned',
            notes: ['Aide aux repas', 'Compagnie', 'Préparation du coucher']
          });
        }
      }
    }

    const { data: interventions, error: interventionsError } = await supabase
      .from('interventions')
      .insert(interventionsToInsert)
      .select();

    if (interventionsError) throw interventionsError;
    console.log(`✅ ${interventions.length} interventions créées`);

    // 6. Créer des logs pour les interventions passées
    console.log('📝 Création des logs d\'interventions...');
    const logsToInsert = [];
    
    for (const intervention of interventions) {
      if (intervention.status === 'done') {
        const checkInTime = new Date(intervention.scheduled_start);
        const checkOutTime = new Date(intervention.scheduled_end);
        
        // Ajouter un peu de variabilité dans les horaires
        checkInTime.setMinutes(checkInTime.getMinutes() + Math.floor(Math.random() * 10) - 5);
        checkOutTime.setMinutes(checkOutTime.getMinutes() + Math.floor(Math.random() * 15) - 5);
        
        const remarks = [
          'Intervention réalisée sans difficulté.',
          'Patient en forme, bonne coopération.',
          'Médicaments administrés selon prescription.',
          'Soins terminés, patient satisfait.',
          'Pansement changé, cicatrisation normale.'
        ];
        
        logsToInsert.push({
          intervention_id: intervention.id,
          check_in: checkInTime.toISOString(),
          check_out: checkOutTime.toISOString(),
          remarks: remarks[Math.floor(Math.random() * remarks.length)]
        });
      }
    }

    if (logsToInsert.length > 0) {
      const { error: logsError } = await supabase
        .from('intervention_logs')
        .insert(logsToInsert);

      if (logsError) throw logsError;
      console.log(`✅ ${logsToInsert.length} logs d'interventions créés`);
    }

    // 7. Créer quelques notifications de test
    console.log('🔔 Création des notifications...');
    const notificationsToInsert = [];
    
    // Notifications pour les interventions terminées aujourd'hui
    const todayInterventions = interventions.filter(i => {
      const interventionDate = new Date(i.scheduled_start).toDateString();
      const todayDate = new Date().toDateString();
      return interventionDate === todayDate && i.status === 'done';
    });

    for (const intervention of todayInterventions.slice(0, 3)) {
      notificationsToInsert.push({
        aidant_id: user.id,
        intervention_id: intervention.id,
        type: 'check_out',
        sent_at: new Date(intervention.scheduled_end).toISOString()
      });
    }

    if (notificationsToInsert.length > 0) {
      const { error: notificationsError } = await supabase
        .from('notifications')
        .insert(notificationsToInsert);

      if (notificationsError) throw notificationsError;
      console.log(`✅ ${notificationsToInsert.length} notifications créées`);
    }

    console.log('🎉 Données de test insérées avec succès !');
    
    return {
      patients,
      intervenants,
      interventions,
      aidantPatientLinks
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données:', error);
    throw error;
  }
}

// Fonction pour nettoyer les données de test via RPC (bypasse les RLS)
export async function cleanTestDataWithRPC() {
  console.log('🧹 Nettoyage des données de test via RPC...');
  
  try {
    // Vérifier que l'utilisateur est connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Utilisateur non connecté. Connectez-vous d\'abord pour nettoyer les données de test.');
    }
    console.log('👤 Utilisateur connecté:', user.email);

    // Appeler la fonction RPC clean_test_data
    console.log('🔧 Appel de la fonction RPC clean_test_data()...');
    const { data: result, error: rpcError } = await supabase.rpc('clean_test_data');
    
    if (rpcError) {
      console.error('❌ Erreur RPC:', rpcError);
      throw new Error(`Erreur fonction RPC: ${rpcError.message}`);
    }
    
    if (!result) {
      throw new Error('Aucune réponse de la fonction RPC');
    }
    
    // Vérifier le résultat
    if (result.success) {
      console.log('🎉 Données de test nettoyées avec succès via RPC !');
      console.log('📊 Résumé des suppressions:');
      console.log(`├── Notifications: ${result.deleted_counts.notifications}`);
      console.log(`├── Logs interventions: ${result.deleted_counts.intervention_logs}`);
      console.log(`├── Interventions: ${result.deleted_counts.interventions}`);
      console.log(`├── Liens aidant-patient: ${result.deleted_counts.aidant_patient_links}`);
      console.log(`├── Patients: ${result.deleted_counts.patients}`);
      console.log(`└── Intervenants: ${result.deleted_counts.intervenants}`);
      
      return result.deleted_counts;
    } else {
      console.error('❌ Erreur rapportée par la fonction RPC:', result.error);
      throw new Error(`Erreur RPC: ${result.error} (Code: ${result.error_code})`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des données via RPC:', error);
    throw error;
  }
}

// Fonction pour nettoyer les données de test (version originale avec RLS)
export async function cleanTestData() {
  console.log('🧹 Nettoyage des données de test...');
  
  try {
    // Supprimer dans l'ordre inverse des dépendances
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('intervention_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('interventions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('aidant_patient_links').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('patients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().eq('role', 'intervenant');
    
    console.log('✅ Données de test supprimées');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  }
}

export async function debugAidantPatientLinks(): Promise<void> {
  try {
    console.log('🔍 DIAGNOSTIC: Liens aidant-patient');
    
    // 1. Vérifier l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ Pas d\'utilisateur connecté:', userError);
      return;
    }
    
    console.log('👤 Utilisateur connecté:', user.id, user.email);
    
    // 2. Vérifier les patients existants
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('id, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (patientsError) {
      console.error('❌ Erreur lecture patients:', patientsError);
      return;
    }
    
    console.log('🏥 Patients récents:', patients?.map(p => ({ id: p.id, name: p.full_name, created: p.created_at })));
    
    // 3. Vérifier les liens existants pour cet aidant
    const { data: existingLinks, error: linksError } = await supabase
      .from('aidant_patient_links')
      .select('patient_id, patients!inner(full_name)')
      .eq('aidant_id', user.id);
      
    if (linksError) {
      console.error('❌ Erreur lecture liens:', linksError);
      return;
    }
    
    console.log('🔗 Liens existants pour cet aidant:', existingLinks);
    
    // 4. Tenter de créer manuellement un lien avec le patient le plus récent
    if (patients && patients.length > 0) {
      const firstPatient = patients[0];
      console.log('🧪 Test: Création manuelle d\'un lien avec', firstPatient.full_name);
      
      const { data: insertResult, error: insertError } = await supabase
        .from('aidant_patient_links')
        .insert({
          aidant_id: user.id,
          patient_id: firstPatient.id
        })
        .select();
        
      if (insertError) {
        console.error('❌ Erreur insertion lien manuel:', insertError);
        
        // Si c'est une erreur de doublon, c'est normal
        if (insertError.code === '23505') {
          console.log('ℹ️ Lien déjà existant (normal)');
        }
      } else {
        console.log('✅ Lien créé manuellement:', insertResult);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur diagnostic liens:', error);
  }
}

export async function createTestDataManually(): Promise<TestData> {
  try {
    console.log('🚀 SOLUTION DE CONTOURNEMENT: Création manuelle des données de test');
    
    // 1. Vérifier l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Utilisateur non connecté');
    }
    
    console.log('👤 Utilisateur connecté:', user.email);
    
    // 2. Créer les patients directement via TypeScript
    console.log('🏥 Création des patients...');
    const patientsToCreate = [
      {
        full_name: 'Pierre Durand',
        address: '12 rue de la Paix, 75001 Paris',
        birth_date: '1935-03-15',
        medical_notes: 'Diabète type 2, hypertension artérielle, mobilité réduite. Traitement: Metformine 850mg x2/jour, Amlodipine 5mg/jour.'
      },
      {
        full_name: 'Marie Leblanc',
        address: '45 avenue Victor Hugo, 75016 Paris',
        birth_date: '1942-07-22',
        medical_notes: 'Arthrose sévère genoux et hanches, ostéoporose. Port de prothèse auditive. Aide pour la toilette et habillage.'
      },
      {
        full_name: 'Robert Petit',
        address: '8 place de la République, 75011 Paris',
        birth_date: '1938-11-08',
        medical_notes: 'Post-AVC, hémiparésie gauche, troubles de la déglutition. Kiné 3x/semaine, orthophonie 2x/semaine.'
      }
    ];
    
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .insert(patientsToCreate)
      .select();
      
    if (patientsError) {
      console.error('❌ Erreur création patients:', patientsError);
      throw patientsError;
    }
    
    console.log('✅ Patients créés:', patients.map(p => p.full_name));
    
    // 3. Créer les liens aidant-patient
    console.log('🔗 Création des liens aidant-patient...');
    const linksToCreate = patients.map(patient => ({
      aidant_id: user.id,
      patient_id: patient.id
    }));
    
    const { data: links, error: linksError } = await supabase
      .from('aidant_patient_links')
      .insert(linksToCreate)
      .select();
      
    if (linksError) {
      console.error('❌ Erreur création liens:', linksError);
      throw linksError;
    }
    
    console.log('✅ Liens créés:', links.length);
    
    // 4. Créer les interventions pour aujourd'hui
    console.log('📅 Création des interventions d\'aujourd\'hui...');
    const today = new Date().toISOString().split('T')[0]; // 2025-08-30
    
    const interventionsToCreate = [
      // Patient 1 - 3 interventions aujourd'hui
      {
        patient_id: patients[0].id,
        intervenant_id: null, // Pas d'intervenant assigné pour le test
        created_by_id: user.id,
        scheduled_start: `${today}T09:00:00`,
        scheduled_end: `${today}T10:00:00`,
        status: 'planned',
        notes: ['toilette', 'prise_medicaments', 'surveillance_glycemie']
      },
      {
        patient_id: patients[0].id,
        intervenant_id: null,
        created_by_id: user.id,
        scheduled_start: `${today}T14:00:00`,
        scheduled_end: `${today}T15:00:00`,
        status: 'planned',
        notes: ['soins_infirmiers', 'controle_tension']
      },
      {
        patient_id: patients[0].id,
        intervenant_id: null,
        created_by_id: user.id,
        scheduled_start: `${today}T18:00:00`,
        scheduled_end: `${today}T19:00:00`,
        status: 'planned',
        notes: ['preparation_repas', 'aide_mobilite', 'compagnie']
      },
      // Patient 2 - 2 interventions aujourd'hui
      {
        patient_id: patients[1].id,
        intervenant_id: null,
        created_by_id: user.id,
        scheduled_start: `${today}T10:00:00`,
        scheduled_end: `${today}T11:00:00`,
        status: 'planned',
        notes: ['toilette', 'aide_habillage']
      },
      {
        patient_id: patients[1].id,
        intervenant_id: null,
        created_by_id: user.id,
        scheduled_start: `${today}T16:00:00`,
        scheduled_end: `${today}T17:00:00`,
        status: 'planned',
        notes: ['kinesitherapie', 'exercices_mobilite']
      }
    ];
    
    const { data: interventions, error: interventionsError } = await supabase
      .from('interventions')
      .insert(interventionsToCreate)
      .select();
      
    if (interventionsError) {
      console.error('❌ Erreur création interventions:', interventionsError);
      throw interventionsError;
    }
    
    console.log('✅ Interventions créées:', interventions.length);
    
    return {
      patients,
      intervenants: [], // Pas d'intervenants créés dans cette solution
      interventions,
      aidantPatientLinks: links,
      notifications: []
    };
    
  } catch (error) {
    console.error('❌ Erreur création manuelle des données:', error);
    throw error;
  }
}