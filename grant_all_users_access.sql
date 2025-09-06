-- ===================================================
-- ACCORDER TOUS LES DROITS SUR LA TABLE USERS
-- Solution d'urgence pour débloquer la situation
-- ===================================================

-- 1. Vérifier les permissions actuelles
SELECT 
    'Permissions actuelles sur users:' as info,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 2. Accorder tous les droits à tous les rôles authentifiés
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO anon;

-- 3. Désactiver complètement RLS sur users (si pas déjà fait)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 4. Supprimer toutes les policies sur users
DROP POLICY IF EXISTS "Users SELECT policy" ON public.users;
DROP POLICY IF EXISTS "Users UPDATE policy" ON public.users;
DROP POLICY IF EXISTS "Users INSERT policy" ON public.users;

-- 5. Test d'accès
SELECT 
    'Test complet accès users:' as test,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email = 'jlevy.travail@gmail.com' THEN 1 END) as jullian_found
FROM public.users;

-- 6. Vérifier l'état final de la table
SELECT 
    'État final table users:' as info,
    schemaname,
    tablename,
    tableowner,
    rowsecurity as rls_enabled,
    hasindexes,
    hasrules
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';