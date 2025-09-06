-- ===================================================
-- DIAGNOSTIC STRUCTURE USERS vs AUTH
-- ===================================================

-- 1. Vérifier la structure de la table users
SELECT 
    id, 
    auth_id, 
    email, 
    full_name, 
    role 
FROM users 
WHERE email = 'jlevy.travail@gmail.com' 
   OR id = '06192242-9578-4ca5-adf5-c305c42937b5';

-- 2. Vérifier l'utilisateur auth actuel
SELECT auth.uid() as current_auth_uid;

-- 3. Comprendre la relation auth_id vs id dans users
SELECT 
    'Structure table users:' as info,
    id as users_id,
    auth_id as users_auth_id,
    email,
    full_name
FROM users 
WHERE role = 'aidant'
LIMIT 5;

-- 4. Tester la politique RLS avec votre utilisateur
SELECT 
    'Test RLS Policy:' as info,
    users.id as users_id,
    auth.uid() as current_auth_uid,
    (users.auth_id = auth.uid()) as rls_match
FROM users 
WHERE users.email = 'jlevy.travail@gmail.com';

-- 5. SOLUTION : Corriger les liens avec le bon users.id
-- Supprimer les anciens liens incorrects
DELETE FROM aidant_patient_links 
WHERE aidant_id = '06192242-9578-4ca5-adf5-c305c42937b5';

-- Insérer les nouveaux liens avec le bon users.id
INSERT INTO aidant_patient_links (aidant_id, patient_id)
SELECT 
    users.id,
    patient_id
FROM users, 
     (VALUES 
        ('550e8400-e29b-41d4-a716-446655440001'::uuid),
        ('550e8400-e29b-41d4-a716-446655440002'::uuid),
        ('550e8400-e29b-41d4-a716-446655440003'::uuid)
     ) as patients(patient_id)
WHERE users.email = 'jlevy.travail@gmail.com'
  AND users.role = 'aidant';

-- 6. Corriger aussi les interventions avec le bon created_by_id
UPDATE interventions 
SET created_by_id = (
    SELECT id FROM users 
    WHERE email = 'jlevy.travail@gmail.com' 
      AND role = 'aidant'
)
WHERE created_by_id = '06192242-9578-4ca5-adf5-c305c42937b5';

-- 7. Vérification finale
SELECT 
    'Vérification finale:' as info,
    apl.aidant_id,
    u.email,
    u.full_name,
    p.full_name as patient_nom
FROM aidant_patient_links apl
JOIN users u ON apl.aidant_id = u.id
JOIN patients p ON apl.patient_id = p.id
WHERE u.email = 'jlevy.travail@gmail.com';