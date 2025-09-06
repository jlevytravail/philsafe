-- ===================================================
-- NETTOYAGE COMPLET DES POLICIES USERS
-- Supprimer toutes les policies conflictuelles et en créer des simples
-- ===================================================

-- 1. SUPPRIMER TOUTES LES POLICIES EXISTANTES SUR USERS
DROP POLICY IF EXISTS "Users : accès profil et intervenants" ON users;
DROP POLICY IF EXISTS "Users : mise à jour profil" ON users;
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Utilisateurs : accès à soi-même" ON users;

-- 2. CRÉER DES POLICIES SIMPLES ET FONCTIONNELLES

-- Policy de lecture : tous les utilisateurs authentifiés peuvent lire tous les users
-- (nécessaire pour voir les intervenants et pour les fonctions get_user_id_from_auth)
CREATE POLICY "Users SELECT policy" ON users
FOR SELECT TO authenticated
USING (true);

-- Policy de mise à jour : un utilisateur peut modifier seulement son profil
CREATE POLICY "Users UPDATE policy" ON users  
FOR UPDATE TO authenticated
USING (
    -- Via auth_id si présent
    auth_id = auth.uid()
    OR
    -- Via email comme fallback
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
    -- Mêmes conditions
    auth_id = auth.uid()
    OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Policy d'insertion : création de profil autorisée
CREATE POLICY "Users INSERT policy" ON users
FOR INSERT TO authenticated  
WITH CHECK (
    -- Permettre la création si l'email correspond
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    -- Ou si l'auth_id correspond
    auth_id = auth.uid()
);

-- 3. VÉRIFICATION : lister les nouvelles policies
SELECT 
    'Nouvelles policies:' as info,
    schemaname, 
    tablename, 
    policyname, 
    cmd, 
    permissive
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- 4. TEST D'ACCÈS
SELECT 
    'Test accès après nettoyage:' as test,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'aidant' THEN 1 END) as aidants,
    COUNT(CASE WHEN role = 'intervenant' THEN 1 END) as intervenants
FROM users;

-- 5. TEST DE LA FONCTION get_user_id_from_auth
SELECT 
    'Test fonction utilitaire:' as test,
    get_user_id_from_auth() as current_user_id,
    auth.uid() as current_auth_uid;