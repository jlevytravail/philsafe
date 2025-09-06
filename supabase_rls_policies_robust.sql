-- ===================================================
-- RLS POLICIES ROBUSTES POUR PHILSAFE
-- Policies qui gèrent les cas edge et les imports de données
-- ===================================================

-- 1. SUPPRIMER LES ANCIENNES POLICIES
DROP POLICY IF EXISTS "Aidants : accès à leurs liens patients" ON aidant_patient_links;
DROP POLICY IF EXISTS "Aidants : accès direct Jullian" ON aidant_patient_links;
DROP POLICY IF EXISTS "Aidants : accès aux interventions de leurs proches" ON interventions;
DROP POLICY IF EXISTS "Interventions : accès direct Jullian" ON interventions;
DROP POLICY IF EXISTS "Intervenants : accès à leurs interventions" ON interventions;

-- 2. FONCTION UTILITAIRE POUR OBTENIR L'USER_ID DEPUIS AUTH
CREATE OR REPLACE FUNCTION get_user_id_from_auth()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT id FROM users 
    WHERE auth_id = auth.uid() 
    LIMIT 1;
$$;

-- 3. POLICIES ROBUSTES POUR AIDANT_PATIENT_LINKS
CREATE POLICY "Aidants : liens patients robuste" ON aidant_patient_links
FOR ALL TO authenticated
USING (
    -- Cas 1: Utilisateur avec auth_id correctement configuré
    aidant_id = get_user_id_from_auth()
    OR
    -- Cas 2: Fallback pour les utilisateurs avec auth_id manquant
    -- (utilisé pendant les imports ou migrations)
    aidant_id IN (
        SELECT id FROM users 
        WHERE email = (
            SELECT email FROM auth.users 
            WHERE id = auth.uid()
        )
        AND role = 'aidant'
    )
);

-- 4. POLICIES ROBUSTES POUR INTERVENTIONS
CREATE POLICY "Aidants : interventions robuste" ON interventions
FOR ALL TO authenticated
USING (
    -- Cas 1: Interventions créées par l'aidant
    created_by_id = get_user_id_from_auth()
    OR
    created_by_id IN (
        SELECT id FROM users 
        WHERE email = (
            SELECT email FROM auth.users 
            WHERE id = auth.uid()
        )
        AND role = 'aidant'
    )
    OR
    -- Cas 2: Interventions sur les patients liés à l'aidant
    patient_id IN (
        SELECT patient_id FROM aidant_patient_links 
        WHERE aidant_id = get_user_id_from_auth()
        OR aidant_id IN (
            SELECT id FROM users 
            WHERE email = (
                SELECT email FROM auth.users 
                WHERE id = auth.uid()
            )
            AND role = 'aidant'
        )
    )
);

CREATE POLICY "Intervenants : interventions assignées robuste" ON interventions
FOR ALL TO authenticated
USING (
    -- Interventions assignées à l'intervenant
    intervenant_id = get_user_id_from_auth()
    OR
    intervenant_id IN (
        SELECT id FROM users 
        WHERE email = (
            SELECT email FROM auth.users 
            WHERE id = auth.uid()
        )
        AND role = 'intervenant'
    )
);

-- 5. POLICIES POUR LES AUTRES TABLES

-- Policies pour PATIENTS (visible aux aidants liés)
DROP POLICY IF EXISTS "Patients : accès aidants" ON patients;
CREATE POLICY "Patients : accès aidants robuste" ON patients
FOR ALL TO authenticated
USING (
    id IN (
        SELECT patient_id FROM aidant_patient_links 
        WHERE aidant_id = get_user_id_from_auth()
        OR aidant_id IN (
            SELECT id FROM users 
            WHERE email = (
                SELECT email FROM auth.users 
                WHERE id = auth.uid()
            )
            AND role = 'aidant'
        )
    )
);

-- Policies pour USERS (chacun voit son profil + intervenants visibles)
DROP POLICY IF EXISTS "Users : accès profil" ON users;
CREATE POLICY "Users : accès profil et intervenants" ON users
FOR SELECT TO authenticated
USING (
    -- Son propre profil
    id = get_user_id_from_auth()
    OR
    email = (
        SELECT email FROM auth.users 
        WHERE id = auth.uid()
    )
    OR
    -- Tous les intervenants sont visibles (pour assignation)
    role = 'intervenant'
);

-- Policy pour mise à jour du profil utilisateur
CREATE POLICY "Users : mise à jour profil" ON users
FOR UPDATE TO authenticated
USING (
    id = get_user_id_from_auth()
    OR
    email = (
        SELECT email FROM auth.users 
        WHERE id = auth.uid()
    )
)
WITH CHECK (
    id = get_user_id_from_auth()
    OR
    email = (
        SELECT email FROM auth.users 
        WHERE id = auth.uid()
    )
);

-- 6. POLICIES POUR NOTIFICATIONS
DROP POLICY IF EXISTS "Notifications : accès aidant" ON notifications;
CREATE POLICY "Notifications : accès aidant robuste" ON notifications
FOR ALL TO authenticated
USING (
    aidant_id = get_user_id_from_auth()
    OR
    aidant_id IN (
        SELECT id FROM users 
        WHERE email = (
            SELECT email FROM auth.users 
            WHERE id = auth.uid()
        )
        AND role = 'aidant'
    )
);

-- 7. POLICIES POUR INTERVENTION_LOGS
DROP POLICY IF EXISTS "Logs : accès via intervention" ON intervention_logs;
CREATE POLICY "Logs : accès via intervention robuste" ON intervention_logs
FOR ALL TO authenticated
USING (
    intervention_id IN (
        SELECT id FROM interventions
        -- Les policies d'interventions s'appliquent automatiquement
    )
);

-- 8. FONCTION DE DIAGNOSTIC RLS
CREATE OR REPLACE FUNCTION diagnose_rls_for_user()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_auth_uid uuid;
    v_user_record RECORD;
    v_links_count int;
    v_interventions_count int;
    result json;
BEGIN
    v_auth_uid := auth.uid();
    
    IF v_auth_uid IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No authenticated user'
        );
    END IF;
    
    -- Récupérer les infos utilisateur
    SELECT * INTO v_user_record FROM users WHERE auth_id = v_auth_uid;
    
    IF v_user_record IS NULL THEN
        -- Essayer avec l'email comme fallback
        SELECT * INTO v_user_record FROM users 
        WHERE email = (SELECT email FROM auth.users WHERE id = v_auth_uid);
    END IF;
    
    -- Compter les liens et interventions
    SELECT COUNT(*) INTO v_links_count 
    FROM aidant_patient_links 
    WHERE aidant_id = v_user_record.id;
    
    SELECT COUNT(*) INTO v_interventions_count 
    FROM interventions 
    WHERE created_by_id = v_user_record.id 
       OR patient_id IN (
           SELECT patient_id FROM aidant_patient_links 
           WHERE aidant_id = v_user_record.id
       );
    
    result := json_build_object(
        'success', true,
        'auth_uid', v_auth_uid,
        'user_found', v_user_record IS NOT NULL,
        'user_info', CASE 
            WHEN v_user_record IS NOT NULL THEN
                json_build_object(
                    'id', v_user_record.id,
                    'email', v_user_record.email,
                    'auth_id', v_user_record.auth_id,
                    'auth_id_matches', v_user_record.auth_id = v_auth_uid
                )
            ELSE NULL
        END,
        'data_access', json_build_object(
            'links_count', v_links_count,
            'interventions_count', v_interventions_count
        )
    );
    
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_id_from_auth() TO authenticated;
GRANT EXECUTE ON FUNCTION diagnose_rls_for_user() TO authenticated;

-- 9. REQUÊTE DE TEST
-- SELECT diagnose_rls_for_user();