-- 🔧 CORRECTION DES RLS POLICIES
-- Le problème : les policies bloquent l'accès aux données pour votre UUID

-- 1. Vérifier les policies actuelles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('interventions', 'patients', 'users');

-- 2. Vérifier que vous existez bien dans la table users
SELECT id, email, role FROM users WHERE id = '06192242-9578-4ca5-adf5-c305c42937b5';

-- 3. OPTION A: Désactiver temporairement RLS pour tester
-- ALTER TABLE interventions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE patients DISABLE ROW LEVEL SECURITY;

-- 4. OPTION B: Créer des policies plus permissives (RECOMMANDÉ)

-- Supprimer les anciennes policies sur interventions
DROP POLICY IF EXISTS "Intervenants can view their interventions" ON interventions;
DROP POLICY IF EXISTS "Intervenants can update their interventions" ON interventions;
DROP POLICY IF EXISTS "Aidants can view interventions for their patients" ON interventions;

-- Créer des policies plus simples et permissives
CREATE POLICY "Intervenants can access their interventions" ON interventions
  FOR ALL USING (intervenant_id = auth.uid());

CREATE POLICY "Aidants can access interventions via patient links" ON interventions
  FOR ALL USING (
    patient_id IN (
      SELECT patient_id FROM aidant_patient_links 
      WHERE aidant_id = auth.uid()
    )
  );

-- Policies pour patients
DROP POLICY IF EXISTS "Aidants can view their patients" ON patients;
DROP POLICY IF EXISTS "Intervenants can view patients with interventions" ON patients;

CREATE POLICY "Users can view relevant patients" ON patients
  FOR ALL USING (
    -- Intervenants : patients avec qui ils ont des interventions
    id IN (
      SELECT DISTINCT patient_id FROM interventions 
      WHERE intervenant_id = auth.uid()
    )
    OR
    -- Aidants : patients liés via aidant_patient_links
    id IN (
      SELECT patient_id FROM aidant_patient_links 
      WHERE aidant_id = auth.uid()
    )
  );

-- 5. Vérifier que l'UUID de session correspond à l'UUID en base
SELECT 
  'Session UUID from auth.uid()' as source,
  auth.uid() as uuid
UNION ALL
SELECT 
  'Your user record' as source,
  id as uuid
FROM users 
WHERE id = '06192242-9578-4ca5-adf5-c305c42937b5';

-- 6. Test des policies avec votre UUID
-- Cette requête simule ce que fait l'app
SET SESSION "request.jwt.claims" = '{"sub": "06192242-9578-4ca5-adf5-c305c42937b5"}';

-- Test de récupération des interventions (comme dans l'app)
SELECT 
  i.*,
  p.full_name as patient_name
FROM interventions i
JOIN patients p ON i.patient_id = p.id
WHERE i.intervenant_id = '06192242-9578-4ca5-adf5-c305c42937b5';

-- Remettre la session normale
RESET ALL;