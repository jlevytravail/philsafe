-- ===================================================
-- DIAGNOSTIC COMPLET DES POLICIES ET PERMISSIONS
-- ===================================================

-- 1. Vérifier l'état actuel des policies sur users
SELECT 
    '=== POLICIES ACTUELLES SUR USERS ===' as section,
    schemaname, 
    tablename, 
    policyname, 
    cmd, 
    permissive,
    qual as condition_using,
    with_check as condition_with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- 2. Vérifier si RLS est activé sur la table users
SELECT 
    '=== ÉTAT RLS ===' as section,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users';

-- 3. Test d'accès direct à la table users
SELECT 
    '=== TEST ACCÈS DIRECT ===' as section,
    'Tentative de lecture table users' as test;

-- Cette requête va échouer si les permissions ne sont pas bonnes
SELECT 
    id,
    email,
    full_name,
    role,
    auth_id,
    CASE 
        WHEN auth_id IS NULL THEN '❌ NULL'
        ELSE '✅ Configuré'
    END as auth_id_status
FROM users 
WHERE email = 'jlevy.travail@gmail.com';

-- 4. Tester la fonction get_user_id_from_auth (va échouer si auth.uid() est null)
SELECT 
    '=== TEST FONCTION UTILITAIRE ===' as section,
    'Test get_user_id_from_auth()' as test;

SELECT get_user_id_from_auth() as result_user_id;

-- 5. Information sur l'utilisateur auth actuel
SELECT 
    '=== CONTEXTE AUTH ACTUEL ===' as section,
    auth.uid() as current_auth_uid,
    auth.role() as current_auth_role;