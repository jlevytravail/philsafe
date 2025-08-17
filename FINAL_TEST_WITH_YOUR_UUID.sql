-- 🔧 TEST FINAL avec votre UUID : 06192242-9578-4ca5-adf5-c305c42937b5

-- 1. Vérifier vos interventions actuelles
SELECT COUNT(*) as total_interventions
FROM interventions 
WHERE intervenant_id = '06192242-9578-4ca5-adf5-c305c42937b5';

-- 2. Nettoyer les anciennes données de test
DELETE FROM intervention_logs 
WHERE intervention_id IN (
  SELECT id FROM interventions WHERE intervenant_id = '06192242-9578-4ca5-adf5-c305c42937b5'
);

DELETE FROM interventions 
WHERE intervenant_id = '06192242-9578-4ca5-adf5-c305c42937b5';

DELETE FROM aidant_patient_links 
WHERE aidant_id = '06192242-9578-4ca5-adf5-c305c42937b5';

-- 3. S'assurer que votre rôle est intervenant
UPDATE users 
SET role = 'intervenant' 
WHERE id = '06192242-9578-4ca5-adf5-c305c42937b5';

-- 4. Patients (si pas déjà créés)
INSERT INTO patients (id, full_name, address, birth_date, medical_notes) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Marie Dupont', '15 rue des Lilas, 75001 Paris', '1945-03-15', 'Diabète type 2'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Jean Martin', '8 avenue Victor Hugo, 75016 Paris', '1942-11-22', 'Alzheimer débutant'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Françoise Blanc', '22 boulevard Saint-Germain, 75005 Paris', '1948-07-08', 'Arthrose')
ON CONFLICT (id) DO NOTHING;

-- 5. Créer des interventions d'AUJOURD'HUI avec votre UUID
INSERT INTO interventions (patient_id, intervenant_id, created_by_id, scheduled_start, scheduled_end, status, notes) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '06192242-9578-4ca5-adf5-c305c42937b5', '06192242-9578-4ca5-adf5-c305c42937b5', 
   CURRENT_DATE + INTERVAL '8 hours 30 minutes', 
   CURRENT_DATE + INTERVAL '9 hours 30 minutes', 
   'planned', ARRAY['Toilette', 'Médicaments']),
   
  ('550e8400-e29b-41d4-a716-446655440002', '06192242-9578-4ca5-adf5-c305c42937b5', '06192242-9578-4ca5-adf5-c305c42937b5', 
   CURRENT_DATE + INTERVAL '14 hours', 
   CURRENT_DATE + INTERVAL '15 hours', 
   'planned', ARRAY['Soins infirmiers']),
   
  ('550e8400-e29b-41d4-a716-446655440003', '06192242-9578-4ca5-adf5-c305c42937b5', '06192242-9578-4ca5-adf5-c305c42937b5', 
   CURRENT_DATE + INTERVAL '18 hours', 
   CURRENT_DATE + INTERVAL '19 hours', 
   'planned', ARRAY['Aide repas']);

-- 6. Vérification finale
SELECT 
  'Total interventions' as check_name,
  COUNT(*) as count
FROM interventions 
WHERE intervenant_id = '06192242-9578-4ca5-adf5-c305c42937b5'

UNION ALL

SELECT 
  'Interventions aujourd''hui' as check_name,
  COUNT(*) as count
FROM interventions 
WHERE intervenant_id = '06192242-9578-4ca5-adf5-c305c42937b5'
AND DATE(scheduled_start) = CURRENT_DATE;

-- 7. Voir les détails des interventions créées
SELECT 
  id,
  scheduled_start,
  scheduled_end,
  status,
  notes,
  (SELECT full_name FROM patients WHERE id = patient_id) as patient_name
FROM interventions 
WHERE intervenant_id = '06192242-9578-4ca5-adf5-c305c42937b5'
ORDER BY scheduled_start;