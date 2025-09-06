-- ===================================================
-- SOLUTION TEMPORAIRE : DÉSACTIVER RLS SUR USERS
-- Pour confirmer que c'est bien le problème des policies
-- ===================================================

-- ATTENTION: Ceci désactive complètement la sécurité sur la table users
-- Ne pas utiliser en production, seulement pour diagnostic

-- 1. Désactiver RLS sur users temporairement
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Vérifier l'état
SELECT 
    'RLS désactivé sur users' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users';

-- 3. Test d'accès
SELECT 
    'Test après désactivation RLS:' as test,
    COUNT(*) as total_users
FROM users;