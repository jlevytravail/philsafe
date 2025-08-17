# 🔍 Debug des hooks d'interventions

## Problème identifié
L'écran "Tournée" (intervenant) ne montre pas les interventions.

## Diagnostics à vérifier

### 1. Vérifier que les données sont bien insérées
```sql
-- Dans Supabase SQL Editor
SELECT * FROM interventions WHERE intervenant_id = 'VOTRE_UUID';
SELECT * FROM patients;
SELECT id, email, role FROM users;
```

### 2. Vérifier les RLS policies
```sql
-- Tester la requête du hook directement
SELECT 
  interventions.*,
  patients.full_name as patient_name,
  users.full_name as intervenant_name
FROM interventions
JOIN patients ON interventions.patient_id = patients.id
LEFT JOIN users ON interventions.intervenant_id = users.id
WHERE interventions.intervenant_id = 'VOTRE_UUID'
  AND DATE(interventions.scheduled_start) = CURRENT_DATE;
```

### 3. Vérifier la foreign key dans le hook
Le hook utilise cette relation :
```typescript
intervenant:users!interventions_intervenant_id_fkey(...)
```

Cela suppose qu'il existe une foreign key `interventions_intervenant_id_fkey`. Vérifions si elle existe :

```sql
-- Vérifier les contraintes de foreign key
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='interventions'
    AND kcu.column_name='intervenant_id';
```

## Solutions possibles

### Solution 1 : Ajouter la foreign key manquante
```sql
ALTER TABLE interventions 
ADD CONSTRAINT interventions_intervenant_id_fkey 
FOREIGN KEY (intervenant_id) REFERENCES users(id);

ALTER TABLE interventions 
ADD CONSTRAINT interventions_created_by_id_fkey 
FOREIGN KEY (created_by_id) REFERENCES users(id);
```

### Solution 2 : Modifier le hook pour ne pas utiliser la foreign key
Dans `/src/hooks/useInterventions.ts`, remplacer :
```typescript
intervenant:users!interventions_intervenant_id_fkey(...)
```
Par :
```typescript
intervenant:users(...)
```
Et ajouter un filtre manuel.

### Solution 3 : Debug avec console.log
Ajouter des logs dans le hook pour voir ce qui se passe.