-- ===================================================
-- SOLUTION PERMANENTE POUR LES PROBLÈMES AUTH_ID
-- PhilSafe - Système d'import de calendriers robuste
-- ===================================================

-- 1. FONCTION POUR SYNCHRONISER AUTH_ID AUTOMATIQUEMENT
-- Cette fonction sera appelée lors de l'insertion/mise à jour d'utilisateurs
CREATE OR REPLACE FUNCTION sync_user_auth_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Si auth_id est null et qu'on a un contexte d'authentification, l'utiliser
    IF NEW.auth_id IS NULL AND auth.uid() IS NOT NULL THEN
        NEW.auth_id := auth.uid();
    END IF;
    
    -- Log pour debug (optionnel)
    IF NEW.auth_id IS NOT NULL THEN
        RAISE NOTICE 'User % synchronized with auth_id: %', NEW.email, NEW.auth_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CRÉER LE TRIGGER SUR LA TABLE USERS
DROP TRIGGER IF EXISTS trigger_sync_user_auth_id ON users;

CREATE TRIGGER trigger_sync_user_auth_id
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_auth_id();

-- 3. FONCTION POUR CORRIGER LES AUTH_ID MANQUANTS
-- Utile pour migrer les utilisateurs existants
CREATE OR REPLACE FUNCTION fix_missing_auth_ids()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    fixed_count int := 0;
    user_record RECORD;
    result json;
BEGIN
    -- Cette fonction doit être exécutée par un admin
    -- Pour chaque utilisateur sans auth_id, essayer de le retrouver
    FOR user_record IN 
        SELECT id, email, full_name 
        FROM users 
        WHERE auth_id IS NULL 
        ORDER BY created_at DESC
    LOOP
        -- Pour l'instant, on ne peut pas automatiquement retrouver l'auth_id
        -- Cette fonction servira de base pour des corrections manuelles futures
        RAISE NOTICE 'User without auth_id found: % (id: %)', user_record.email, user_record.id;
    END LOOP;
    
    result := json_build_object(
        'success', true,
        'message', 'Scan completed for users without auth_id',
        'users_found', (SELECT COUNT(*) FROM users WHERE auth_id IS NULL)
    );
    
    RETURN result;
END;
$$;

-- 4. FONCTION D'IMPORT D'UTILISATEUR SÉCURISÉE
-- Cette fonction crée un utilisateur avec toutes les données nécessaires
CREATE OR REPLACE FUNCTION import_user_with_calendar(
    p_email text,
    p_full_name text,
    p_role text DEFAULT 'aidant',
    p_sub_role text DEFAULT NULL,
    p_phone_number text DEFAULT NULL,
    p_patients_data jsonb DEFAULT '[]',
    p_interventions_data jsonb DEFAULT '[]'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id uuid;
    v_patient_id uuid;
    v_intervention_id uuid;
    v_patients_created int := 0;
    v_interventions_created int := 0;
    v_links_created int := 0;
    patient_record jsonb;
    intervention_record jsonb;
    result json;
BEGIN
    -- Vérifier que l'utilisateur n'existe pas déjà
    SELECT id INTO v_user_id FROM users WHERE email = p_email;
    
    IF v_user_id IS NOT NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User already exists with this email',
            'user_id', v_user_id
        );
    END IF;
    
    -- 1. CRÉER L'UTILISATEUR
    -- L'auth_id sera automatiquement synchronisé par le trigger
    INSERT INTO users (email, full_name, role, sub_role, phone_number)
    VALUES (p_email, p_full_name, p_role, p_sub_role, p_phone_number)
    RETURNING id INTO v_user_id;
    
    -- 2. CRÉER LES PATIENTS ET LES LIER
    FOR patient_record IN SELECT * FROM jsonb_array_elements(p_patients_data)
    LOOP
        -- Créer le patient
        INSERT INTO patients (
            full_name, 
            address, 
            birth_date, 
            medical_notes
        ) VALUES (
            patient_record->>'full_name',
            patient_record->>'address',
            (patient_record->>'birth_date')::date,
            patient_record->>'medical_notes'
        ) RETURNING id INTO v_patient_id;
        
        -- Lier le patient à l'aidant
        INSERT INTO aidant_patient_links (aidant_id, patient_id)
        VALUES (v_user_id, v_patient_id);
        
        v_patients_created := v_patients_created + 1;
        v_links_created := v_links_created + 1;
    END LOOP;
    
    -- 3. CRÉER LES INTERVENTIONS
    FOR intervention_record IN SELECT * FROM jsonb_array_elements(p_interventions_data)
    LOOP
        -- Pour simplifier, on assigne les interventions au premier patient créé
        SELECT id INTO v_patient_id FROM patients ORDER BY created_at DESC LIMIT 1;
        
        INSERT INTO interventions (
            patient_id,
            intervenant_id,
            created_by_id,
            scheduled_start,
            scheduled_end,
            status,
            notes
        ) VALUES (
            v_patient_id,
            NULL, -- Pas d'intervenant assigné par défaut
            v_user_id,
            (intervention_record->>'scheduled_start')::timestamptz,
            (intervention_record->>'scheduled_end')::timestamptz,
            COALESCE(intervention_record->>'status', 'planned'),
            CASE 
                WHEN intervention_record->'notes' IS NOT NULL 
                THEN ARRAY(SELECT jsonb_array_elements_text(intervention_record->'notes'))
                ELSE ARRAY['intervention_importee']
            END
        );
        
        v_interventions_created := v_interventions_created + 1;
    END LOOP;
    
    -- 4. RÉSULTAT
    result := json_build_object(
        'success', true,
        'message', 'User and calendar imported successfully',
        'data', json_build_object(
            'user_id', v_user_id,
            'email', p_email,
            'patients_created', v_patients_created,
            'interventions_created', v_interventions_created,
            'links_created', v_links_created
        )
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'error_code', SQLSTATE
    );
END;
$$;

-- 5. ACCORDER LES PERMISSIONS
GRANT EXECUTE ON FUNCTION sync_user_auth_id() TO authenticated;
GRANT EXECUTE ON FUNCTION fix_missing_auth_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION import_user_with_calendar(text, text, text, text, text, jsonb, jsonb) TO authenticated;

-- 6. EXEMPLE D'UTILISATION DE LA FONCTION D'IMPORT
/*
SELECT import_user_with_calendar(
    'nouvel.utilisateur@example.com',
    'Nouveau Utilisateur',
    'aidant',
    'famille',
    '06.12.34.56.78',
    '[
        {
            "full_name": "Patient Test",
            "address": "123 rue Example, Paris",
            "birth_date": "1950-01-01",
            "medical_notes": "Notes médicales du patient"
        }
    ]',
    '[
        {
            "scheduled_start": "2025-09-07 09:00:00+00",
            "scheduled_end": "2025-09-07 10:00:00+00",
            "status": "planned",
            "notes": ["toilette", "medicaments"]
        }
    ]'
);
*/