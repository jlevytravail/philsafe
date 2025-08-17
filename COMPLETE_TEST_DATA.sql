-- 🚀 DONNÉES DE TEST COMPLÈTES - PhilSafe
-- Remplacez 'YOUR_USER_ID_HERE' par votre UUID réel

-- ====================================
-- ÉTAPE 1: DIAGNOSTIC ET NETTOYAGE
-- ====================================

-- Vérifier votre compte utilisateur
SELECT id, email, role, full_name FROM users;

-- Nettoyer les données existantes (optionnel)
-- DELETE FROM intervention_logs;
-- DELETE FROM interventions;
-- DELETE FROM aidant_patient_links;
-- DELETE FROM patients;

-- ====================================
-- ÉTAPE 2: CRÉER LES FOREIGN KEYS
-- ====================================

-- Ajouter les contraintes foreign key si elles n'existent pas
DO $$ 
BEGIN
    -- Foreign key pour intervenant_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'interventions_intervenant_id_fkey'
    ) THEN
        ALTER TABLE interventions 
        ADD CONSTRAINT interventions_intervenant_id_fkey 
        FOREIGN KEY (intervenant_id) REFERENCES users(id);
    END IF;
    
    -- Foreign key pour created_by_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'interventions_created_by_id_fkey'
    ) THEN
        ALTER TABLE interventions 
        ADD CONSTRAINT interventions_created_by_id_fkey 
        FOREIGN KEY (created_by_id) REFERENCES users(id);
    END IF;
END $$;

-- ====================================
-- ÉTAPE 3: INSÉRER LES PATIENTS
-- ====================================

INSERT INTO patients (id, full_name, address, birth_date, medical_notes) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Marie Dupont', '15 rue des Lilas, 75001 Paris', '1945-03-15', 'Diabète type 2, hypertension artérielle. Traitement: Metformine 500mg 2x/jour'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Jean Martin', '8 avenue Victor Hugo, 75016 Paris', '1942-11-22', 'Alzheimer débutant, mobilité réduite. Besoin de surveillance'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Françoise Blanc', '22 boulevard Saint-Germain, 75005 Paris', '1948-07-08', 'Arthrose, problèmes de vision. Aide pour la toilette'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Pierre Moreau', '45 avenue de la République, 75011 Paris', '1950-12-03', 'Problèmes cardiaques, pacemaker. Suivi régulier'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Lucie Bernard', '12 rue Saint-Antoine, 75004 Paris', '1938-06-18', 'Démence sénile, troubles de la mémoire. Besoin de surveillance constante')
ON CONFLICT (id) DO NOTHING;

-- ====================================
-- ÉTAPE 4: INTERVENTIONS PASSÉES
-- ====================================

INSERT INTO interventions (patient_id, intervenant_id, created_by_id, scheduled_start, scheduled_end, status, notes) VALUES
  -- Hier
  ('550e8400-e29b-41d4-a716-446655440001', 'YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 
   CURRENT_DATE - INTERVAL '1 day' + INTERVAL '8 hours 30 minutes', 
   CURRENT_DATE - INTERVAL '1 day' + INTERVAL '9 hours 25 minutes', 
   'done', ARRAY['Toilette', 'Prise de médicaments']),
   
  ('550e8400-e29b-41d4-a716-446655440002', 'YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 
   CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14 hours', 
   CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14 hours 45 minutes', 
   'done', ARRAY['Surveillance', 'Aide repas']),
   
  -- Avant-hier
  ('550e8400-e29b-41d4-a716-446655440003', 'YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 
   CURRENT_DATE - INTERVAL '2 days' + INTERVAL '16 hours', 
   CURRENT_DATE - INTERVAL '2 days' + INTERVAL '17 hours', 
   'done', ARRAY['Aide à la mobilité', 'Soins de base']);

-- ====================================
-- ÉTAPE 5: INTERVENTIONS D'AUJOURD'HUI
-- ====================================

INSERT INTO interventions (patient_id, intervenant_id, created_by_id, scheduled_start, scheduled_end, status, notes) VALUES
  -- Matin
  ('550e8400-e29b-41d4-a716-446655440001', 'YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 
   CURRENT_DATE + INTERVAL '8 hours 30 minutes', 
   CURRENT_DATE + INTERVAL '9 hours 30 minutes', 
   'planned', ARRAY['Toilette matinale', 'Prise de médicaments', 'Contrôle glycémie']),
   
  -- Midi
  ('550e8400-e29b-41d4-a716-446655440002', 'YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 
   CURRENT_DATE + INTERVAL '12 hours', 
   CURRENT_DATE + INTERVAL '13 hours', 
   'planned', ARRAY['Aide au repas', 'Prise de médicaments', 'Stimulation cognitive']),
   
  -- Après-midi
  ('550e8400-e29b-41d4-a716-446655440004', 'YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 
   CURRENT_DATE + INTERVAL '14 hours', 
   CURRENT_DATE + INTERVAL '15 hours', 
   'planned', ARRAY['Contrôle tension', 'Soins infirmiers', 'Vérification pacemaker']),
   
  -- Soir
  ('550e8400-e29b-41d4-a716-446655440003', 'YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 
   CURRENT_DATE + INTERVAL '18 hours', 
   CURRENT_DATE + INTERVAL '19 hours', 
   'planned', ARRAY['Aide au repas du soir', 'Préparation pour la nuit']),
   
  ('550e8400-e29b-41d4-a716-446655440005', 'YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 
   CURRENT_DATE + INTERVAL '20 hours', 
   CURRENT_DATE + INTERVAL '21 hours', 
   'planned', ARRAY['Surveillance de nuit', 'Aide au coucher']);

-- ====================================
-- ÉTAPE 6: INTERVENTIONS FUTURES
-- ====================================

INSERT INTO interventions (patient_id, intervenant_id, created_by_id, scheduled_start, scheduled_end, status, notes) VALUES
  -- Demain
  ('550e8400-e29b-41d4-a716-446655440001', 'YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 
   CURRENT_DATE + INTERVAL '1 day' + INTERVAL '8 hours 30 minutes', 
   CURRENT_DATE + INTERVAL '1 day' + INTERVAL '9 hours 30 minutes', 
   'planned', ARRAY['Toilette', 'Prise de médicaments']),
   
  ('550e8400-e29b-41d4-a716-446655440002', 'YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 
   CURRENT_DATE + INTERVAL '1 day' + INTERVAL '14 hours', 
   CURRENT_DATE + INTERVAL '1 day' + INTERVAL '15 hours', 
   'planned', ARRAY['Soins spécialisés', 'Surveillance']),
   
  -- Après-demain
  ('550e8400-e29b-41d4-a716-446655440004', 'YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 
   CURRENT_DATE + INTERVAL '2 days' + INTERVAL '10 hours', 
   CURRENT_DATE + INTERVAL '2 days' + INTERVAL '11 hours', 
   'planned', ARRAY['Contrôle médical', 'Soins cardiologiques']);

-- ====================================
-- ÉTAPE 7: LIENS AIDANT-PATIENT
-- ====================================

-- À utiliser SI vous voulez tester le mode AIDANT
INSERT INTO aidant_patient_links (aidant_id, patient_id) VALUES
  ('YOUR_USER_ID_HERE', '550e8400-e29b-41d4-a716-446655440001'),
  ('YOUR_USER_ID_HERE', '550e8400-e29b-41d4-a716-446655440002'),
  ('YOUR_USER_ID_HERE', '550e8400-e29b-41d4-a716-446655440003'),
  ('YOUR_USER_ID_HERE', '550e8400-e29b-41d4-a716-446655440004'),
  ('YOUR_USER_ID_HERE', '550e8400-e29b-41d4-a716-446655440005')
ON CONFLICT (aidant_id, patient_id) DO NOTHING;

-- ====================================
-- ÉTAPE 8: QUELQUES LOGS D'INTERVENTION
-- ====================================

-- Récupérer l'ID d'une intervention terminée pour ajouter des logs
DO $$
DECLARE
    intervention_uuid UUID;
BEGIN
    -- Prendre la première intervention terminée
    SELECT id INTO intervention_uuid 
    FROM interventions 
    WHERE status = 'done' 
    AND intervenant_id = 'YOUR_USER_ID_HERE'
    LIMIT 1;
    
    -- Ajouter des logs si l'intervention existe
    IF intervention_uuid IS NOT NULL THEN
        INSERT INTO intervention_logs (intervention_id, check_in, check_out, remarks) VALUES
        (intervention_uuid, 
         CURRENT_DATE - INTERVAL '1 day' + INTERVAL '8 hours 35 minutes',
         CURRENT_DATE - INTERVAL '1 day' + INTERVAL '9 hours 20 minutes',
         'Intervention réalisée sans problème. Patient en forme.');
    END IF;
END $$;

-- ====================================
-- ÉTAPE 9: VÉRIFICATIONS
-- ====================================

-- Vérifier que tout est bien inséré
SELECT 'Patients' as table_name, COUNT(*) as count FROM patients
UNION ALL
SELECT 'Interventions', COUNT(*) FROM interventions WHERE intervenant_id = 'YOUR_USER_ID_HERE'
UNION ALL
SELECT 'Interventions aujourd''hui', COUNT(*) FROM interventions 
WHERE intervenant_id = 'YOUR_USER_ID_HERE' 
AND DATE(scheduled_start) = CURRENT_DATE
UNION ALL
SELECT 'Liens aidant-patient', COUNT(*) FROM aidant_patient_links WHERE aidant_id = 'YOUR_USER_ID_HERE';

-- Voir les interventions d'aujourd'hui
SELECT 
  i.scheduled_start,
  i.scheduled_end,
  i.status,
  p.full_name as patient_name,
  i.notes
FROM interventions i
JOIN patients p ON i.patient_id = p.id
WHERE i.intervenant_id = 'YOUR_USER_ID_HERE'
AND DATE(i.scheduled_start) = CURRENT_DATE
ORDER BY i.scheduled_start;

-- 🚨 N'OUBLIEZ PAS DE REMPLACER 'YOUR_USER_ID_HERE' PAR VOTRE VRAI UUID !