-- ===================================================
-- REQUÊTES DE DIAGNOSTIC POUR JULLIAN LEVY
-- ID: 06192242-9578-4ca5-adf5-c305c42937b5
-- ===================================================

-- 1. VÉRIFIER LES PATIENTS CRÉÉS
SELECT 
    id, 
    full_name, 
    address,
    created_at
FROM patients 
WHERE id IN (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002', 
    '550e8400-e29b-41d4-a716-446655440003'
);

-- 2. VÉRIFIER LES LIENS AIDANT-PATIENT
SELECT 
    apl.aidant_id,
    apl.patient_id,
    p.full_name as patient_nom,
    apl.created_at
FROM aidant_patient_links apl
LEFT JOIN patients p ON apl.patient_id = p.id
WHERE apl.aidant_id = '06192242-9578-4ca5-adf5-c305c42937b5';

-- 3. VÉRIFIER LES INTERVENTIONS CRÉÉES
SELECT 
    i.id,
    i.patient_id,
    p.full_name as patient_nom,
    i.created_by_id,
    i.scheduled_start,
    i.scheduled_end,
    i.status,
    i.notes
FROM interventions i
LEFT JOIN patients p ON i.patient_id = p.id
WHERE i.created_by_id = '06192242-9578-4ca5-adf5-c305c42937b5'
ORDER BY i.scheduled_start;

-- 4. VÉRIFIER LES RLS POLICIES SUR aidant_patient_links
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'aidant_patient_links';

-- 5. TESTER L'INSERTION MANUELLE D'UN LIEN
-- (Décommentez pour tester)
/*
INSERT INTO aidant_patient_links (aidant_id, patient_id) 
VALUES ('06192242-9578-4ca5-adf5-c305c42937b5', '550e8400-e29b-41d4-a716-446655440001');
*/