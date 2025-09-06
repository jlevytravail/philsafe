-- ===================================================
-- CORRECTION PERMISSIONS TABLE USERS
-- Les nouvelles policies ont cassé l'accès à la table users
-- ===================================================

-- 1. Vérifier les policies actuelles sur users
SELECT schemaname, tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 2. Supprimer les policies problématiques et les recréer correctement
DROP POLICY IF EXISTS "Users : accès profil et intervenants" ON users;
DROP POLICY IF EXISTS "Users : mise à jour profil" ON users;

-- 3. Créer des policies simples qui fonctionnent
CREATE POLICY "Users : lecture pour tous authentifiés" ON users
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users : mise à jour profil personnel" ON users
FOR UPDATE TO authenticated
USING (
    -- Permettre à l'utilisateur de modifier son propre profil
    auth_id = auth.uid()
    OR
    -- Fallback pour auth_id null
    email = (
        SELECT email FROM auth.users 
        WHERE id = auth.uid()
    )
)
WITH CHECK (
    -- Mêmes conditions pour WITH CHECK
    auth_id = auth.uid()
    OR
    email = (
        SELECT email FROM auth.users 
        WHERE id = auth.uid()
    )
);

-- 4. Policy pour insertion (si nécessaire)
CREATE POLICY "Users : création profil" ON users
FOR INSERT TO authenticated
WITH CHECK (
    auth_id = auth.uid()
    OR
    email = (
        SELECT email FROM auth.users 
        WHERE id = auth.uid()
    )
);

-- 5. Tester l'accès
SELECT 
    'Test accès users:' as test,
    id, 
    email, 
    full_name, 
    role, 
    auth_id
FROM users 
LIMIT 3;