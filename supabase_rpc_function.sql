-- Fonction RPC pour créer des données de test (sans création d'utilisateurs)
-- À exécuter dans Supabase Dashboard > Database > Functions

CREATE OR REPLACE FUNCTION create_test_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Exécute avec les permissions du propriétaire (bypass RLS)
AS $$
DECLARE
  result json;
  intervenants_ids uuid[];
  patients_ids uuid[];
  aidant_id uuid;
  intervention_id uuid;
  patient_id uuid;
  intervenant_id uuid;
  interventions_created integer := 0;
  notifications_created integer := 0;
BEGIN
  -- Récupérer l'ID de l'utilisateur connecté (aidant)
  aidant_id := auth.uid();
  
  -- Vérifier que l'utilisateur est connecté
  IF aidant_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create test data';
  END IF;

  -- 1. Rechercher des intervenants existants SEULEMENT (pas de création)
  SELECT ARRAY(
    SELECT id FROM users 
    WHERE role = 'intervenant' 
    ORDER BY created_at DESC
    LIMIT 3
  ) INTO intervenants_ids;
  
  -- Si aucun intervenant, continuer sans intervenants (interventions avec intervenant_id = NULL)
  IF array_length(intervenants_ids, 1) IS NULL THEN
    intervenants_ids := ARRAY[]::uuid[];
  END IF;

  -- 2. Créer les patients
  WITH inserted_patients AS (
    INSERT INTO patients (full_name, address, birth_date, medical_notes)
    VALUES 
      ('Pierre Durand', '12 rue de la Paix, 75001 Paris', '1935-03-15', 'Diabète type 2, hypertension artérielle, mobilité réduite. Traitement: Metformine 850mg x2/jour, Amlodipine 5mg/jour.'),
      ('Marie Leblanc', '45 avenue Victor Hugo, 75016 Paris', '1942-07-22', 'Arthrose sévère genoux et hanches, ostéoporose. Port de prothèse auditive. Aide pour la toilette et habillage.'),
      ('Robert Petit', '8 place de la République, 75011 Paris', '1938-11-08', 'Post-AVC, hémiparésie gauche, troubles de la déglutition. Kiné 3x/semaine, orthophonie 2x/semaine.')
    RETURNING id
  )
  SELECT array_agg(id) INTO patients_ids FROM inserted_patients;

  -- 3. Créer les liens aidant-patient (l'aidant connecté suit tous les patients)
  RAISE NOTICE 'DEBUG RPC: Création des liens pour aidant_id=% avec % patients', aidant_id, array_length(patients_ids, 1);
  
  -- D'abord supprimer les anciens liens pour éviter les doublons
  DELETE FROM aidant_patient_links WHERE aidant_id = aidant_id;
  
  -- Insérer les nouveaux liens
  INSERT INTO aidant_patient_links (aidant_id, patient_id)
  SELECT aidant_id, unnest(patients_ids);

  -- 4. Créer des interventions sur plusieurs jours (adaptées selon la disponibilité des intervenants)
  IF array_length(patients_ids, 1) > 0 THEN
    
    -- AUJOURD'HUI (30 août 2025) - Plusieurs interventions pour être sûr
    SELECT patients_ids[1] INTO patient_id;
    
    -- Utiliser un intervenant existant s'il y en a, sinon laisser NULL
    IF array_length(intervenants_ids, 1) > 0 THEN
      SELECT intervenants_ids[1] INTO intervenant_id;
    ELSE
      intervenant_id := NULL; -- Intervention sans intervenant assigné
    END IF;
    
    -- Interventions d'aujourd'hui (matin, après-midi, soir)
    INSERT INTO interventions (patient_id, intervenant_id, created_by_id, scheduled_start, scheduled_end, status, notes)
    VALUES 
      (patient_id, intervenant_id, aidant_id, 
       CURRENT_DATE + INTERVAL '9 hours', 
       CURRENT_DATE + INTERVAL '10 hours', 
       'planned', 
       ARRAY['toilette', 'prise_medicaments', 'surveillance_glycemie']),
      (patient_id, intervenant_id, aidant_id,
       CURRENT_DATE + INTERVAL '14 hours',
       CURRENT_DATE + INTERVAL '15 hours',
       'planned',
       ARRAY['soins_infirmiers', 'controle_tension']),
      (patient_id, intervenant_id, aidant_id,
       CURRENT_DATE + INTERVAL '18 hours',
       CURRENT_DATE + INTERVAL '19 hours',
       'planned',
       ARRAY['preparation_repas', 'aide_mobilite', 'compagnie']);
    
    interventions_created := interventions_created + 3;
    
    -- Si on a un 2ème patient, lui donner aussi des interventions aujourd'hui
    IF array_length(patients_ids, 1) > 1 THEN
      SELECT patients_ids[2] INTO patient_id;
      
      IF array_length(intervenants_ids, 1) > 1 THEN
        SELECT intervenants_ids[2] INTO intervenant_id;
      ELSE
        intervenant_id := NULL;
      END IF;
      
      INSERT INTO interventions (patient_id, intervenant_id, created_by_id, scheduled_start, scheduled_end, status, notes)
      VALUES 
        (patient_id, intervenant_id, aidant_id,
         CURRENT_DATE + INTERVAL '10 hours',
         CURRENT_DATE + INTERVAL '11 hours',
         'planned',
         ARRAY['toilette', 'aide_habillage']),
        (patient_id, intervenant_id, aidant_id,
         CURRENT_DATE + INTERVAL '16 hours',
         CURRENT_DATE + INTERVAL '17 hours',
         'planned',
         ARRAY['kinesitherapie', 'exercices_mobilite']);
      
      interventions_created := interventions_created + 2;
    END IF;

    -- Interventions pour demain (si on a au moins 2 patients)
    IF array_length(patients_ids, 1) > 1 THEN
      SELECT patients_ids[2] INTO patient_id;
      
      -- Utiliser le 2ème intervenant s'il existe
      IF array_length(intervenants_ids, 1) > 1 THEN
        SELECT intervenants_ids[2] INTO intervenant_id;
      ELSE
        intervenant_id := NULL;
      END IF;
      
      INSERT INTO interventions (patient_id, intervenant_id, created_by_id, scheduled_start, scheduled_end, status, notes)
      VALUES 
        (patient_id, intervenant_id, aidant_id,
         CURRENT_DATE + INTERVAL '1 day' + INTERVAL '8 hours',
         CURRENT_DATE + INTERVAL '1 day' + INTERVAL '9 hours',
         'planned',
         ARRAY['kinesitherapie', 'exercices_mobilite']),
        (patient_id, intervenant_id, aidant_id,
         CURRENT_DATE + INTERVAL '1 day' + INTERVAL '14 hours',
         CURRENT_DATE + INTERVAL '1 day' + INTERVAL '15 hours',
         'planned',
         ARRAY['aide_toilette', 'surveillance_tension']);
      
      interventions_created := interventions_created + 2;
    END IF;

    -- Intervention passée (hier) avec log (si on a au moins 3 patients)
    IF array_length(patients_ids, 1) > 2 THEN
      SELECT patients_ids[3] INTO patient_id;
      
      -- Utiliser le 3ème intervenant s'il existe
      IF array_length(intervenants_ids, 1) > 2 THEN
        SELECT intervenants_ids[3] INTO intervenant_id;
      ELSE
        intervenant_id := NULL;
      END IF;
      
      INSERT INTO interventions (patient_id, intervenant_id, created_by_id, scheduled_start, scheduled_end, status, notes)
      VALUES 
        (patient_id, intervenant_id, aidant_id,
         CURRENT_DATE - INTERVAL '1 day' + INTERVAL '10 hours',
         CURRENT_DATE - INTERVAL '1 day' + INTERVAL '11 hours',
         'done',
         ARRAY['orthophonie', 'exercices_deglutition'])
      RETURNING id INTO intervention_id;
      
      interventions_created := interventions_created + 1;

      -- Log pour l'intervention passée
      INSERT INTO intervention_logs (intervention_id, check_in, check_out, remarks)
      VALUES (
        intervention_id,
        CURRENT_DATE - INTERVAL '1 day' + INTERVAL '10 hours' + INTERVAL '5 minutes',
        CURRENT_DATE - INTERVAL '1 day' + INTERVAL '11 hours' - INTERVAL '3 minutes',
        'Séance d''orthophonie réussie. Patient coopératif, progrès visible sur la déglutition. RDV suivant programmé.'
      );

      -- 5. Créer quelques notifications
      INSERT INTO notifications (aidant_id, intervention_id, type, sent_at)
      VALUES 
        (aidant_id, intervention_id, 'check_in', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '10 hours' + INTERVAL '5 minutes'),
        (aidant_id, intervention_id, 'check_out', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '11 hours' - INTERVAL '3 minutes');
      
      notifications_created := 2;
    END IF;
  END IF;

  -- Construire le résultat JSON avec message informatif
  result := json_build_object(
    'success', true,
    'message', CASE 
      WHEN array_length(intervenants_ids, 1) > 0 THEN 
        'Données de test créées avec succès avec ' || array_length(intervenants_ids, 1) || ' intervenants existants'
      ELSE 
        'Données de test créées avec succès (patients et interventions créés, mais aucun intervenant trouvé - créez des comptes intervenants pour des tests complets)'
    END,
    'data', json_build_object(
      'intervenants_count', COALESCE(array_length(intervenants_ids, 1), 0),
      'patients_count', COALESCE(array_length(patients_ids, 1), 0),
      'interventions_count', interventions_created,
      'notifications_count', notifications_created,
      'aidant_id', aidant_id,
      'intervenants_ids', COALESCE(intervenants_ids, ARRAY[]::uuid[]),
      'patients_ids', COALESCE(patients_ids, ARRAY[]::uuid[]),
      'note', CASE 
        WHEN array_length(intervenants_ids, 1) IS NULL OR array_length(intervenants_ids, 1) = 0 THEN 
          'Pour créer des intervenants, utilisez l''interface admin ou invitez des utilisateurs avec le rôle "intervenant"'
        ELSE 
          'Intervenants existants utilisés pour les interventions'
      END
    )
  );

  RETURN result;

EXCEPTION WHEN OTHERS THEN
  -- En cas d'erreur, retourner les détails
  result := json_build_object(
    'success', false,
    'error', SQLERRM,
    'error_code', SQLSTATE
  );
  RETURN result;
END;
$$;

-- Donner les permissions d'exécution à tous les utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION create_test_data() TO authenticated;

-- Fonction pour nettoyer les données de test
CREATE OR REPLACE FUNCTION clean_test_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Exécute avec les permissions du propriétaire (bypass RLS)
AS $$
DECLARE
  result json;
  aidant_id uuid;
  notifications_deleted integer := 0;
  logs_deleted integer := 0;
  interventions_deleted integer := 0;
  links_deleted integer := 0;
  patients_deleted integer := 0;
  intervenants_deleted integer := 0;
BEGIN
  -- Récupérer l'ID de l'utilisateur connecté
  aidant_id := auth.uid();
  
  -- Vérifier que l'utilisateur est connecté
  IF aidant_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to clean test data';
  END IF;

  -- Supprimer les données dans l'ordre inverse des dépendances
  -- (éviter les erreurs de clés étrangères)
  
  -- 1. Supprimer les notifications
  DELETE FROM notifications 
  WHERE notifications.aidant_id = auth.uid();
  GET DIAGNOSTICS notifications_deleted = ROW_COUNT;
  
  -- 2. Supprimer les logs d'intervention
  DELETE FROM intervention_logs 
  WHERE intervention_logs.intervention_id IN (
    SELECT interventions.id FROM interventions 
    WHERE interventions.created_by_id = auth.uid()
  );
  GET DIAGNOSTICS logs_deleted = ROW_COUNT;
  
  -- 3. Supprimer les interventions
  DELETE FROM interventions 
  WHERE interventions.created_by_id = auth.uid();
  GET DIAGNOSTICS interventions_deleted = ROW_COUNT;
  
  -- 4. Supprimer les liens aidant-patient
  DELETE FROM aidant_patient_links 
  WHERE aidant_patient_links.aidant_id = auth.uid();
  GET DIAGNOSTICS links_deleted = ROW_COUNT;
  
  -- 5. Supprimer les patients (seulement ceux créés récemment pour éviter de supprimer des vraies données)
  DELETE FROM patients 
  WHERE patients.created_at >= CURRENT_DATE - INTERVAL '1 day';
  GET DIAGNOSTICS patients_deleted = ROW_COUNT;
  
  -- 6. Supprimer les intervenants de test (ceux avec des emails @philsafe.com)
  DELETE FROM users 
  WHERE users.role = 'intervenant' 
  AND users.email LIKE '%@philsafe.com';
  GET DIAGNOSTICS intervenants_deleted = ROW_COUNT;

  -- Construire le résultat JSON
  result := json_build_object(
    'success', true,
    'message', 'Données de test nettoyées avec succès',
    'deleted_counts', json_build_object(
      'notifications', notifications_deleted,
      'intervention_logs', logs_deleted,
      'interventions', interventions_deleted,
      'aidant_patient_links', links_deleted,
      'patients', patients_deleted,
      'intervenants', intervenants_deleted
    )
  );

  RETURN result;

EXCEPTION WHEN OTHERS THEN
  -- En cas d'erreur, retourner les détails
  result := json_build_object(
    'success', false,
    'error', SQLERRM,
    'error_code', SQLSTATE
  );
  RETURN result;
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION clean_test_data() TO authenticated;