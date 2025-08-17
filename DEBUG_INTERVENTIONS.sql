-- 🔍 DEBUG: Vérifier les interventions et dates
-- Remplacez 'YOUR_USER_ID_HERE' par votre UUID

-- 1. Voir toutes vos interventions avec dates
SELECT 
  id,
  scheduled_start,
  scheduled_end,
  status,
  patient_id,
  DATE(scheduled_start) as date_part,
  CURRENT_DATE as today
FROM interventions 
WHERE intervenant_id = 'YOUR_USER_ID_HERE'
ORDER BY scheduled_start;

-- 2. Voir spécifiquement celles d'aujourd'hui
SELECT 
  id,
  scheduled_start,
  status,
  notes
FROM interventions 
WHERE intervenant_id = 'YOUR_USER_ID_HERE'
AND DATE(scheduled_start) = CURRENT_DATE;

-- 3. Vérifier le format exact des dates
SELECT 
  scheduled_start,
  scheduled_start::text as formatted_date,
  DATE(scheduled_start) = CURRENT_DATE as is_today
FROM interventions 
WHERE intervenant_id = 'YOUR_USER_ID_HERE';

-- 4. Tester les filtres du hook
SELECT *
FROM interventions 
WHERE intervenant_id = 'YOUR_USER_ID_HERE'
AND scheduled_start >= CURRENT_DATE::text || 'T00:00:00'
AND scheduled_start <= CURRENT_DATE::text || 'T23:59:59';

-- 5. Voir la date actuelle selon différents formats
SELECT 
  CURRENT_DATE as current_date,
  CURRENT_DATE::text as current_date_text,
  CURRENT_DATE::text || 'T00:00:00' as filter_from,
  CURRENT_DATE::text || 'T23:59:59' as filter_to,
  NOW() as now_timestamp,
  NOW()::date as now_date;