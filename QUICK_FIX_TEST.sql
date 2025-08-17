-- 🚀 TEST RAPIDE APRÈS CORRECTION
-- Remplacez 'YOUR_USER_ID_HERE' par votre UUID réel

-- 1. Mettre le rôle à intervenant
UPDATE users SET role = 'intervenant' WHERE id = 'YOUR_USER_ID_HERE';

-- 2. Ajouter foreign keys si pas déjà fait
ALTER TABLE interventions 
DROP CONSTRAINT IF EXISTS interventions_intervenant_id_fkey,
DROP CONSTRAINT IF EXISTS interventions_created_by_id_fkey;

ALTER TABLE interventions 
ADD CONSTRAINT interventions_intervenant_id_fkey 
FOREIGN KEY (intervenant_id) REFERENCES users(id);

ALTER TABLE interventions 
ADD CONSTRAINT interventions_created_by_id_fkey 
FOREIGN KEY (created_by_id) REFERENCES users(id);

-- 3. Nettoyer et ajouter des interventions de test
DELETE FROM intervention_logs;
DELETE FROM interventions WHERE intervenant_id = 'YOUR_USER_ID_HERE';
DELETE FROM aidant_patient_links WHERE aidant_id = 'YOUR_USER_ID_HERE';

-- 4. Patients (si pas déjà créés)
INSERT INTO patients (id, full_name, address, birth_date, medical_notes) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Marie Dupont', '15 rue des Lilas, 75001 Paris', '1945-03-15', 'Diabète type 2'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Jean Martin', '8 avenue Victor Hugo, 75016 Paris', '1942-11-22', 'Alzheimer débutant')
ON CONFLICT (id) DO NOTHING;

-- 5. Interventions d'aujourd'hui 
INSERT INTO interventions (patient_id, intervenant_id, created_by_id, scheduled_start, scheduled_end, status, notes) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 
   CURRENT_DATE + INTERVAL '8 hours 30 minutes', 
   CURRENT_DATE + INTERVAL '9 hours 30 minutes', 
   'planned', ARRAY['Toilette', 'Médicaments']),
   
  ('550e8400-e29b-41d4-a716-446655440001', 'YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 
   CURRENT_DATE + INTERVAL '14 hours', 
   CURRENT_DATE + INTERVAL '15 hours', 
   'planned', ARRAY['Soins infirmiers']),
   
  ('550e8400-e29b-41d4-a716-446655440002', 'YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 
   CURRENT_DATE + INTERVAL '18 hours', 
   CURRENT_DATE + INTERVAL '19 hours', 
   'planned', ARRAY['Aide repas']);

-- 6. Vérification
SELECT 
  'Interventions aujourd''hui' as check_name,
  COUNT(*) as count
FROM interventions 
WHERE intervenant_id = 'YOUR_USER_ID_HERE' 
AND DATE(scheduled_start) = CURRENT_DATE;

-- Vous devriez voir "count: 3"
-- Maintenant relancez l'app et allez dans "Tournée"