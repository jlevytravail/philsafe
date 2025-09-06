-- ===================================================
-- DONNÉES DE TEST POUR JULLIAN LEVY (Aidant)
-- ID: 06192242-9578-4ca5-adf5-c305c42937b5
-- ===================================================

-- 1. CRÉATION DES PATIENTS
-- Insérer 3 patients de test
INSERT INTO patients (id, full_name, address, birth_date, medical_notes) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Pierre Durand', '12 rue de la Paix, 75001 Paris', '1935-03-15', 'Diabète type 2, hypertension artérielle, mobilité réduite. Surveillance glycémie 3x/jour.'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Marie Leblanc', '45 avenue Victor Hugo, 75016 Paris', '1942-07-22', 'Arthrose sévère genoux/hanches, ostéoporose. Aide pour mobilité et toilette.'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Robert Petit', '8 place de la République, 75011 Paris', '1938-11-08', 'Post-AVC, hémiparésie gauche, troubles de déglutition. Kinésithérapie quotidienne.')
ON CONFLICT (id) DO NOTHING;

-- 2. CRÉATION DES LIENS AIDANT-PATIENTS
-- Lier Jullian Levy aux 3 patients
INSERT INTO aidant_patient_links (aidant_id, patient_id) VALUES
    ('06192242-9578-4ca5-adf5-c305c42937b5', '550e8400-e29b-41d4-a716-446655440001'),
    ('06192242-9578-4ca5-adf5-c305c42937b5', '550e8400-e29b-41d4-a716-446655440002'),
    ('06192242-9578-4ca5-adf5-c305c42937b5', '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT DO NOTHING;

-- 3. RÉCUPÉRATION D'INTERVENANTS EXISTANTS
-- On va utiliser les intervenants déjà présents dans la base
-- Vérification des intervenants disponibles (commentaire pour information)
-- SELECT id, full_name, role FROM users WHERE role = 'intervenant' LIMIT 3;

-- 4. INTERVENTIONS POUR AUJOURD'HUI (2025-09-06)
INSERT INTO interventions (
    patient_id, 
    intervenant_id, 
    created_by_id, 
    scheduled_start, 
    scheduled_end, 
    status, 
    notes
) VALUES
    -- Patient Pierre Durand - 3 interventions aujourd'hui
    ('550e8400-e29b-41d4-a716-446655440001', NULL, '06192242-9578-4ca5-adf5-c305c42937b5', 
     '2025-09-06 09:00:00+00', '2025-09-06 10:00:00+00', 'planned', 
     ARRAY['toilette', 'prise_medicaments', 'surveillance_glycemie']),
    
    ('550e8400-e29b-41d4-a716-446655440001', NULL, '06192242-9578-4ca5-adf5-c305c42937b5', 
     '2025-09-06 14:00:00+00', '2025-09-06 15:00:00+00', 'planned', 
     ARRAY['soins_infirmiers', 'controle_tension', 'preparation_insuline']),
    
    ('550e8400-e29b-41d4-a716-446655440001', NULL, '06192242-9578-4ca5-adf5-c305c42937b5', 
     '2025-09-06 18:30:00+00', '2025-09-06 19:30:00+00', 'planned', 
     ARRAY['preparation_repas', 'aide_mobilite', 'compagnie']),

    -- Patient Marie Leblanc - 2 interventions aujourd'hui  
    ('550e8400-e29b-41d4-a716-446655440002', NULL, '06192242-9578-4ca5-adf5-c305c42937b5', 
     '2025-09-06 10:30:00+00', '2025-09-06 11:30:00+00', 'planned', 
     ARRAY['toilette', 'aide_habillage', 'aide_mobilite']),
    
    ('550e8400-e29b-41d4-a716-446655440002', NULL, '06192242-9578-4ca5-adf5-c305c42937b5', 
     '2025-09-06 16:00:00+00', '2025-09-06 17:00:00+00', 'planned', 
     ARRAY['kinesitherapie', 'exercices_mobilite', 'reeducation']),

    -- Patient Robert Petit - 2 interventions aujourd'hui
    ('550e8400-e29b-41d4-a716-446655440003', NULL, '06192242-9578-4ca5-adf5-c305c42937b5', 
     '2025-09-06 08:00:00+00', '2025-09-06 09:00:00+00', 'planned', 
     ARRAY['kinesitherapie', 'exercices_parole', 'mobilisation_bras']),
    
    ('550e8400-e29b-41d4-a716-446655440003', NULL, '06192242-9578-4ca5-adf5-c305c42937b5', 
     '2025-09-06 12:00:00+00', '2025-09-06 13:00:00+00', 'planned', 
     ARRAY['aide_repas', 'surveillance_deglutition', 'hygienes_buccodentaire']);

-- 5. INTERVENTIONS DEMAIN (2025-09-07) pour avoir un planning
INSERT INTO interventions (
    patient_id, 
    intervenant_id, 
    created_by_id, 
    scheduled_start, 
    scheduled_end, 
    status, 
    notes
) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', NULL, '06192242-9578-4ca5-adf5-c305c42937b5', 
     '2025-09-07 09:00:00+00', '2025-09-07 10:00:00+00', 'planned', 
     ARRAY['toilette', 'prise_medicaments', 'surveillance_glycemie']),
    
    ('550e8400-e29b-41d4-a716-446655440002', NULL, '06192242-9578-4ca5-adf5-c305c42937b5', 
     '2025-09-07 15:00:00+00', '2025-09-07 16:00:00+00', 'planned', 
     ARRAY['toilette', 'aide_habillage']);

-- 6. INTERVENTION HIER (2025-09-05) AVEC LOGS pour historique
-- D'abord créer l'intervention
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
    ('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', NULL, '06192242-9578-4ca5-adf5-c305c42937b5', 
     '2025-09-05 14:00:00+00', '2025-09-05 15:00:00+00', 'done', 
     ARRAY['soins_infirmiers', 'controle_tension']);

-- Ensuite créer le log pour l'intervention d'hier
INSERT INTO intervention_logs (
    intervention_id, 
    check_in, 
    check_out, 
    remarks
) VALUES
    ('550e8400-e29b-41d4-a716-446655440100', '2025-09-05 14:05:00+00', '2025-09-05 15:02:00+00', 
     'Intervention terminée. Tension artérielle stable (13/8). Patient en forme. Médicaments pris correctement.');

-- 7. NOTIFICATIONS DE TEST
INSERT INTO notifications (aidant_id, intervention_id, type, sent_at)
SELECT 
    '06192242-9578-4ca5-adf5-c305c42937b5',
    i.id,
    'check_in',
    now()
FROM interventions i 
WHERE i.created_by_id = '06192242-9578-4ca5-adf5-c305c42937b5' 
  AND i.scheduled_start::date = '2025-09-06'
ORDER BY i.scheduled_start 
LIMIT 3;

-- ===================================================
-- REQUÊTES DE VÉRIFICATION
-- ===================================================

-- Vérifier les patients liés à Jullian
SELECT 
    p.full_name as patient_nom,
    p.address,
    p.medical_notes
FROM patients p
JOIN aidant_patient_links apl ON p.id = apl.patient_id
WHERE apl.aidant_id = '06192242-9578-4ca5-adf5-c305c42937b5';

-- Vérifier les interventions d'aujourd'hui pour Jullian
SELECT 
    p.full_name as patient_nom,
    u.full_name as intervenant_nom,
    i.scheduled_start,
    i.scheduled_end,
    i.status,
    i.notes
FROM interventions i
JOIN patients p ON i.patient_id = p.id
LEFT JOIN users u ON i.intervenant_id = u.id
WHERE i.created_by_id = '06192242-9578-4ca5-adf5-c305c42937b5'
  AND i.scheduled_start::date = '2025-09-06'
ORDER BY i.scheduled_start;

-- Vérifier les liens aidant-patient
SELECT 
    apl.aidant_id,
    apl.patient_id,
    p.full_name as patient_nom
FROM aidant_patient_links apl
JOIN patients p ON apl.patient_id = p.id
WHERE apl.aidant_id = '06192242-9578-4ca5-adf5-c305c42937b5';