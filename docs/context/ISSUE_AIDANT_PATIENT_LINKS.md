# Problème: Interventions non visibles après création des données (liens aidant↔patients)

## Symptômes observés
- Après avoir lancé la création de données de test via `/test-data` (RPC), la home n’affiche aucune intervention pour l’aidant connecté.
- Logs côté app:
  - « Liens trouvés … linksCount: 0 » puis « Aucun patient lié pour cet aidant »
  - Résumé RPC: Patients OK, Interventions OK, mais pas d’affichage.

## Cause racine
1. Bug dans la fonction RPC `create_test_data()` (PostgreSQL):
   - Suppression des liens avec une clause toujours vraie:
     - `DELETE FROM aidant_patient_links WHERE aidant_id = aidant_id;`
     - Effet: supprime tous les liens au lieu de ceux de l’utilisateur courant.
   - Insertion des liens avec un identifiant ambigu:
     - `SELECT aidant_id, unnest(patients_ids);` (variable non qualifiée)
     - Risque d’insérer des liens incorrects si l’identifiant n’est pas celui de l’utilisateur courant.
2. Filtrage côté app basé sur les liens:
   - Pour un rôle `aidant`, `getInterventions()` commence par récupérer les `patient_ids` depuis `aidant_patient_links`.
   - Si 0 lien → aucune intervention affichée, même si des interventions existent dans la base.

## Correction SQL (à appliquer dans Supabase > SQL Editor)
Remplacer les blocs concernés dans la fonction `create_test_data()`:

```sql
-- Suppression des anciens liens (seulement ceux de l’utilisateur courant)
DELETE FROM aidant_patient_links
WHERE aidant_id = auth.uid();

-- Insertion des nouveaux liens (qualifier l’aidant)
INSERT INTO aidant_patient_links (aidant_id, patient_id)
SELECT auth.uid(), unnest(patients_ids);
```

Version complète recommandée de la fonction (sécurisée et testée):

```sql
CREATE OR REPLACE FUNCTION public.create_test_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result json;
  v_aidant_id uuid;
  v_intervenants_ids uuid[] := ARRAY[]::uuid[];
  v_patients_ids uuid[] := ARRAY[]::uuid[];
  v_patient_id uuid;
  v_intervenant_id uuid;
  v_interventions_created int := 0;
  v_notifications_created int := 0;
  v_affected int := 0;  -- pour ROW_COUNT
  v_today date := current_date;
BEGIN
  v_aidant_id := auth.uid();
  IF v_aidant_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create test data';
  END IF;

  SELECT COALESCE(ARRAY_AGG(id), ARRAY[]::uuid[]) INTO v_intervenants_ids
  FROM (
    SELECT id FROM users WHERE role = 'intervenant' ORDER BY created_at DESC LIMIT 3
  ) t;

  WITH inserted_patients AS (
    INSERT INTO patients (full_name, address, birth_date, medical_notes)
    VALUES
      ('Pierre Durand','12 rue de la Paix, 75001 Paris','1935-03-15','Diabète type 2, hypertension artérielle, mobilité réduite.'),
      ('Marie Leblanc','45 avenue Victor Hugo, 75016 Paris','1942-07-22','Arthrose sévère genoux/hanches, ostéoporose.'),
      ('Robert Petit','8 place de la République, 75011 Paris','1938-11-08','Post-AVC, hémiparésie gauche, troubles de déglutition.')
    RETURNING id
  ) SELECT ARRAY_AGG(id) INTO v_patients_ids FROM inserted_patients;

  DELETE FROM aidant_patient_links WHERE aidant_id = v_aidant_id;
  INSERT INTO aidant_patient_links (aidant_id, patient_id)
  SELECT v_aidant_id, unnest(v_patients_ids);

  IF COALESCE(array_length(v_patients_ids, 1), 0) > 0 THEN
    v_patient_id := v_patients_ids[1];
    v_intervenant_id := CASE WHEN array_length(v_intervenants_ids, 1) >= 1 THEN v_intervenants_ids[1] ELSE NULL END;

    INSERT INTO interventions (patient_id, intervenant_id, created_by_id, scheduled_start, scheduled_end, status, notes)
    VALUES
      (v_patient_id, v_intervenant_id, v_aidant_id, v_today + time '09:00', v_today + time '10:00', 'planned', ARRAY['toilette','prise_medicaments','surveillance_glycemie']),
      (v_patient_id, v_intervenant_id, v_aidant_id, v_today + time '14:00', v_today + time '15:00', 'planned', ARRAY['soins_infirmiers','controle_tension']),
      (v_patient_id, v_intervenant_id, v_aidant_id, v_today + time '18:00', v_today + time '19:00', 'planned', ARRAY['preparation_repas','aide_mobilite','compagnie']);
    GET DIAGNOSTICS v_affected = ROW_COUNT;
    v_interventions_created := v_interventions_created + v_affected;
  END IF;

  IF COALESCE(array_length(v_patients_ids, 1), 0) > 1 THEN
    v_patient_id := v_patients_ids[2];
    v_intervenant_id := CASE WHEN array_length(v_intervenants_ids, 1) >= 2 THEN v_intervenants_ids[2] ELSE NULL END;

    INSERT INTO interventions (patient_id, intervenant_id, created_by_id, scheduled_start, scheduled_end, status, notes)
    VALUES
      (v_patient_id, v_intervenant_id, v_aidant_id, v_today + time '10:00', v_today + time '11:00', 'planned', ARRAY['toilette','aide_habillage']),
      (v_patient_id, v_intervenant_id, v_aidant_id, v_today + time '16:00', v_today + time '17:00', 'planned', ARRAY['kinesitherapie','exercices_mobilite']);
    GET DIAGNOSTICS v_affected = ROW_COUNT;
    v_interventions_created := v_interventions_created + v_affected;
  END IF;

  INSERT INTO notifications (aidant_id, intervention_id, type, sent_at)
  SELECT v_aidant_id, i.id, 'check_in', now()
  FROM interventions i
  WHERE i.created_by_id = v_aidant_id AND i.scheduled_start::date = v_today
  ORDER BY i.scheduled_start
  LIMIT 2;
  GET DIAGNOSTICS v_notifications_created = ROW_COUNT;

  result := json_build_object(
    'success', true,
    'message', CASE WHEN array_length(v_intervenants_ids, 1) > 0 THEN 'Données de test créées avec intervenants existants' ELSE 'Données de test créées (aucun intervenant assigné)' END,
    'data', json_build_object(
      'intervenants_count', COALESCE(array_length(v_intervenants_ids, 1), 0),
      'patients_count', COALESCE(array_length(v_patients_ids, 1), 0),
      'interventions_count', v_interventions_created,
      'notifications_count', v_notifications_created,
      'aidant_id', v_aidant_id,
      'intervenants_ids', v_intervenants_ids,
      'patients_ids', v_patients_ids
    )
  );
  RETURN result;

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM, 'error_code', SQLSTATE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_test_data() TO authenticated;
```

## Policies RLS recommandées (aidant_patient_links)
```sql
ALTER TABLE public.aidant_patient_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY aidant_links_select ON public.aidant_patient_links
FOR SELECT TO authenticated
USING (aidant_id = auth.uid());

CREATE POLICY aidant_links_insert ON public.aidant_patient_links
FOR INSERT TO authenticated
WITH CHECK (aidant_id = auth.uid());

CREATE POLICY aidant_links_delete ON public.aidant_patient_links
FOR DELETE TO authenticated
USING (aidant_id = auth.uid());
```

## Process de validation
- Exécuter la fonction corrigée dans Supabase (SQL Editor) et lui accorder EXECUTE aux `authenticated`.
- Dans l’app: `/test-data` → « Nettoyer » (RPC) puis « Créer » (RPC).
- Vérifier les logs: `Liens trouvés … linksCount: 3` (ou >0) et la home montre les interventions du jour.

## Amélioration optionnelle côté app
- Ajouter un fallback dans `getInterventions()` (pour rôle `aidant`) afin d’afficher les interventions `created_by_id = aidant` quand `linksCount = 0`. Utile pour éviter l’écran vide si les liens n’existent pas encore.

