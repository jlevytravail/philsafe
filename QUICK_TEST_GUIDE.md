# 🚀 Guide de test rapide - Compte unique ✨

## ⚡ Solution rapide complète

### Étape 1 : Récupérer votre UUID
```sql
SELECT id, email, role FROM users;
```
**→ Notez votre UUID**

### Étape 2 : Utiliser le script complet
1. **Ouvrir** le fichier `COMPLETE_TEST_DATA.sql`
2. **Remplacer** toutes les occurrences de `YOUR_USER_ID_HERE` par votre UUID
3. **Exécuter** le script complet dans Supabase Dashboard > SQL Editor

**Ce script créé automatiquement :**
- ✅ 5 patients variés
- ✅ 12 interventions (passées, aujourd'hui, futures)
- ✅ Foreign keys manquantes
- ✅ Logs d'intervention
- ✅ Liens aidant-patient
- ✅ Vérifications automatiques

### Étape 3 : Tester les deux rôles

#### Mode INTERVENANT :
```sql
UPDATE users SET role = 'intervenant' WHERE id = 'VOTRE_UUID';
```
**→ Relancez l'app → Allez dans "Tournée" → Vous devriez voir 5 interventions aujourd'hui**

#### Mode AIDANT :
```sql
UPDATE users SET role = 'aidant' WHERE id = 'VOTRE_UUID';
```
**→ Relancez l'app → Allez dans "Accueil" → Vous devriez voir les mêmes interventions**

### Étape 4 : Debug si ça ne marche pas

#### Vérifications dans la console navigateur :
```
🔍 [useInterventions] User role: intervenant User ID: votre-uuid
🔍 [useInterventions] Filtering for intervenant with ID: votre-uuid
✅ [useInterventions] Data fetched: 5 interventions
```

#### Vérifications SQL :
```sql
-- Voir vos interventions
SELECT COUNT(*) FROM interventions WHERE intervenant_id = 'VOTRE_UUID';

-- Voir les interventions d'aujourd'hui
SELECT COUNT(*) FROM interventions 
WHERE intervenant_id = 'VOTRE_UUID' 
AND DATE(scheduled_start) = CURRENT_DATE;
```

### Étape 5 : Tester le temps réel
```sql
-- Marquer une intervention comme terminée
UPDATE interventions 
SET status = 'done' 
WHERE status = 'planned' 
AND intervenant_id = 'VOTRE_UUID'
LIMIT 1;
```
**→ L'app se met à jour automatiquement !**

## 🎯 Ce que vous devriez voir

### Écran "Tournée" (intervenant) :
- **5 interventions aujourd'hui** avec heures et patients différents
- **États :** "Prévu", "En cours", "Terminé"
- **Patients :** Marie, Jean, Pierre, Françoise, Lucie

### Écran "Patients" (intervenant) :
- **5 patients** avec âges calculés automatiquement
- **Adresses** parisiennes variées
- **Notes médicales** détaillées

### Dashboard "Accueil" (aidant) :
- **Même vue** mais depuis perspective famille
- **Événements** générés automatiquement

## 🚨 Si ça ne marche toujours pas
Consultez `DEBUG_HOOKS.md` pour diagnostic avancé.

## ❗ Important
**Remplacez `YOUR_USER_ID_HERE` dans le script avant de l'exécuter !**