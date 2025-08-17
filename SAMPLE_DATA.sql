-- Données de test pour PhilSafe - Version compte unique
-- À exécuter dans Supabase Dashboard > SQL Editor

-- ÉTAPE 1: Récupérer votre UUID utilisateur
-- Exécutez d'abord cette requête pour connaître votre ID :
-- SELECT id, email, role FROM users WHERE email = 'VOTRE_EMAIL@example.com';

-- REMPLACEZ 'YOUR_USER_ID_HERE' par votre UUID réel dans tout le script ci-dessous

-- 1. Insérer des patients de test
INSERT INTO patients (id, full_name, address, birth_date, medical_notes) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Marie Dupont', '15 rue des Lilas, 75001 Paris', '1945-03-15', 'Diabète type 2, hypertension artérielle. Traitement: Metformine 500mg 2x/jour'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Jean Martin', '8 avenue Victor Hugo, 75016 Paris', '1942-11-22', 'Alzheimer débutant, mobilité réduite. Besoin de surveillance'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Françoise Blanc', '22 boulevard Saint-Germain, 75005 Paris', '1948-07-08', 'Arthrose, problèmes de vision. Aide pour la toilette')
ON CONFLICT (id) DO NOTHING;

-- 2. Créer des interventions avec VOTRE compte comme intervenant/créateur
INSERT INTO interventions (
  id, 
  patient_id, 
  intervenant_id, 
  created_by_id, 
  scheduled_start, 
  scheduled_end, 
  status, 
  notes
) VALUES
  -- Interventions d'aujourd'hui
  (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001', -- Marie Dupont
    'YOUR_USER_ID_HERE', -- REMPLACEZ par votre UUID
    'YOUR_USER_ID_HERE', -- REMPLACEZ par votre UUID
    CURRENT_DATE + INTERVAL '8 hours 30 minutes',
    CURRENT_DATE + INTERVAL '9 hours 30 minutes',
    'planned',
    ARRAY['Toilette', 'Prise de médicaments']
  ),
  (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001', -- Marie Dupont
    'YOUR_USER_ID_HERE', -- REMPLACEZ par votre UUID
    'YOUR_USER_ID_HERE', -- REMPLACEZ par votre UUID
    CURRENT_DATE + INTERVAL '14 hours',
    CURRENT_DATE + INTERVAL '15 hours',
    'planned',
    ARRAY['Soins infirmiers', 'Contrôle tension']
  ),
  (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440002', -- Jean Martin
    'YOUR_USER_ID_HERE', -- REMPLACEZ par votre UUID
    'YOUR_USER_ID_HERE', -- REMPLACEZ par votre UUID
    CURRENT_DATE + INTERVAL '18 hours',
    CURRENT_DATE + INTERVAL '19 hours',
    'planned',
    ARRAY['Aide aux repas', 'Compagnie']
  ),
  
  -- Interventions de demain
  (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001', -- Marie Dupont
    'YOUR_USER_ID_HERE', -- REMPLACEZ par votre UUID
    'YOUR_USER_ID_HERE', -- REMPLACEZ par votre UUID
    CURRENT_DATE + INTERVAL '1 day 8 hours 30 minutes',
    CURRENT_DATE + INTERVAL '1 day 9 hours 30 minutes',
    'planned',
    ARRAY['Toilette', 'Prise de médicaments']
  ),
  (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440003', -- Françoise Blanc
    'YOUR_USER_ID_HERE', -- REMPLACEZ par votre UUID
    'YOUR_USER_ID_HERE', -- REMPLACEZ par votre UUID
    CURRENT_DATE + INTERVAL '1 day 10 hours',
    CURRENT_DATE + INTERVAL '1 day 11 hours',
    'planned',
    ARRAY['Soins de base', 'Aide à la mobilité']
  ),

  -- Interventions d'hier (terminées)
  (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001', -- Marie Dupont
    'YOUR_USER_ID_HERE', -- REMPLACEZ par votre UUID
    'YOUR_USER_ID_HERE', -- REMPLACEZ par votre UUID
    CURRENT_DATE - INTERVAL '1 day' + INTERVAL '8 hours 30 minutes',
    CURRENT_DATE - INTERVAL '1 day' + INTERVAL '9 hours 25 minutes',
    'done',
    ARRAY['Toilette', 'Prise de médicaments']
  ),
  (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440002', -- Jean Martin
    'YOUR_USER_ID_HERE', -- REMPLACEZ par votre UUID
    'YOUR_USER_ID_HERE', -- REMPLACEZ par votre UUID
    CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14 hours',
    CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14 hours 45 minutes',
    'done',
    ARRAY['Surveillance', 'Aide repas']
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Créer des liens aidant-patient (si votre rôle est 'aidant')
-- Décommentez cette section SI votre role = 'aidant'
/*
INSERT INTO aidant_patient_links (aidant_id, patient_id) VALUES
  ('YOUR_USER_ID_HERE', '550e8400-e29b-41d4-a716-446655440001'), -- Lien vers Marie Dupont
  ('YOUR_USER_ID_HERE', '550e8400-e29b-41d4-a716-446655440002'), -- Lien vers Jean Martin
  ('YOUR_USER_ID_HERE', '550e8400-e29b-41d4-a716-446655440003')  -- Lien vers Françoise Blanc
ON CONFLICT (aidant_id, patient_id) DO NOTHING;
*/

-- 📋 INSTRUCTIONS D'UTILISATION :

-- 1. Récupérez votre UUID :
--    SELECT id, email, role FROM users WHERE email = 'votre.email@example.com';

-- 2. Remplacez TOUTES les occurrences de 'YOUR_USER_ID_HERE' par votre UUID réel

-- 3. Si votre rôle est 'aidant' :
--    - Décommentez la section aidant_patient_links
--    - Vous verrez les interventions depuis le dashboard aidant

-- 4. Si votre rôle est 'intervenant' :
--    - Laissez aidant_patient_links commenté
--    - Vous verrez les interventions depuis le dashboard intervenant

-- 5. Exécutez le script modifié dans Supabase Dashboard > SQL Editor

-- 6. Testez l'app : vous devriez voir des données réelles !