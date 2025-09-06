-- ===================================================
-- DÉSACTIVATION COMPLÈTE DE RLS (SOLUTION D'URGENCE)
-- Pour débloquer complètement la situation
-- ===================================================

-- 1. DÉSACTIVER RLS SUR TOUTES LES TABLES
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.aidant_patient_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervention_logs DISABLE ROW LEVEL SECURITY;

-- 2. SUPPRIMER TOUTES LES POLICIES PROBLÉMATIQUES
-- Users
DROP POLICY IF EXISTS "Users SELECT policy" ON public.users;
DROP POLICY IF EXISTS "Users UPDATE policy" ON public.users;
DROP POLICY IF EXISTS "Users INSERT policy" ON public.users;

-- Interventions
DROP POLICY IF EXISTS "Aidants : interventions robuste" ON public.interventions;
DROP POLICY IF EXISTS "Intervenants : interventions assignées robuste" ON public.interventions;

-- Aidant Patient Links
DROP POLICY IF EXISTS "Aidants : liens patients robuste" ON public.aidant_patient_links;

-- Patients
DROP POLICY IF EXISTS "Patients : accès aidants robuste" ON public.patients;

-- Notifications
DROP POLICY IF EXISTS "Notifications : accès aidant robuste" ON public.notifications;

-- Intervention Logs
DROP POLICY IF EXISTS "Logs : accès via intervention robuste" ON public.intervention_logs;

-- 3. SUPPRIMER LES FONCTIONS PROBLÉMATIQUES
DROP FUNCTION IF EXISTS public.get_user_id_from_auth();
DROP FUNCTION IF EXISTS public.diagnose_rls_for_user();

-- 4. VÉRIFIER L'ÉTAT FINAL
SELECT 
    'État RLS après désactivation:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'patients', 'interventions', 'aidant_patient_links', 'notifications', 'intervention_logs')
ORDER BY tablename;

-- 5. TEST D'ACCÈS FINAL
SELECT 
    'Test accès complet:' as test,
    'users' as table_name,
    COUNT(*) as total_rows
FROM public.users

UNION ALL

SELECT 
    'Test accès complet:' as test,
    'interventions' as table_name,
    COUNT(*) as total_rows
FROM public.interventions

UNION ALL

SELECT 
    'Test accès complet:' as test,
    'aidant_patient_links' as table_name,
    COUNT(*) as total_rows
FROM public.aidant_patient_links;