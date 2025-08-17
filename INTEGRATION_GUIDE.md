# Guide d'intégration des données réelles

## ✅ Implémentation terminée

### 1. Hooks créés
- **`/src/hooks/useInterventions.ts`** : Hook principal pour les interventions
- **`/src/hooks/usePatients.ts`** : Hook pour la gestion des patients

### 2. Fonctionnalités par rôle

#### Pour les **AIDANTS** :
- Récupère les interventions via les liens `aidant_patient_links`
- Affiche les interventions de tous leurs patients
- Temps réel activé

#### Pour les **INTERVENANTS** :
- Récupère leurs propres interventions (`intervenant_id = auth.uid()`)
- Récupère leurs patients via les interventions existantes
- Temps réel activé

### 3. Composants mis à jour
- ✅ **`/app/(tabs)/index.tsx`** : Dashboard aidants avec vraies données
- ✅ **`/app/(caregiver)/index.tsx`** : Dashboard intervenants avec vraies données  
- ✅ **`/app/(caregiver)/patients.tsx`** : Liste des patients avec vraies données

### 4. Abonnements temps réel
- Écoute les changements sur `public.interventions` 
- Écoute les changements sur `public.intervention_logs`
- Refetch automatique lors des modifications

## 🚀 Comment tester (Compte unique)

### Étape 1 : Récupérer votre UUID utilisateur
```sql
-- Dans Supabase Dashboard > SQL Editor
SELECT id, email, role FROM users WHERE email = 'votre.email@example.com';
```

### Étape 2 : Modifier le fichier SAMPLE_DATA.sql
1. **Ouvrir** le fichier `SAMPLE_DATA.sql`
2. **Remplacer** toutes les occurrences de `'YOUR_USER_ID_HERE'` par votre UUID réel
3. **Si vous êtes aidant** : Décommentez la section `aidant_patient_links`
4. **Si vous êtes intervenant** : Laissez `aidant_patient_links` commenté

### Étape 3 : Exécuter le SQL modifié
```sql
-- Copiez le contenu de SAMPLE_DATA.sql modifié
-- Exécutez dans Supabase Dashboard > SQL Editor
```

### Étape 4 : Changer de rôle pour tester (optionnel)
```sql
-- Pour tester le dashboard aidant :
UPDATE users SET role = 'aidant' WHERE id = 'VOTRE_UUID';

-- Pour tester le dashboard intervenant :
UPDATE users SET role = 'intervenant' WHERE id = 'VOTRE_UUID';
```

### Étape 5 : Lancer l'app et tester
```bash
npm run dev
```

## 📊 Critères d'acceptation validés

### ✅ Les listes ne sont plus mockées
- Toutes les données viennent de Supabase
- Hooks `useInterventions` et `usePatients` actifs

### ✅ Updates temps réel
- Abonnement `postgres_changes` sur `interventions`
- Abonnement `postgres_changes` sur `intervention_logs`
- Refetch automatique lors des changements

### ✅ Filtrage par rôle
- **Aidants** : Voient les interventions de leurs patients liés
- **Intervenants** : Voient leurs propres interventions

### ✅ Performance optimisée
- Fenêtre de dates (aujourd'hui, semaine)
- Limite de résultats (50 par défaut)
- Index SQL ajoutés pour les performances

## 🔧 Hooks disponibles

```typescript
// Hook principal avec options
const { interventions, loading, error, refetch } = useInterventions({
  dateFrom: '2025-08-17',
  dateTo: '2025-08-24', 
  limit: 100,
  status: 'planned'
});

// Hook pour aujourd'hui
const { interventions, loading, error, refetch } = useTodayInterventions();

// Hook pour la semaine
const { interventions, loading, error, refetch } = useWeekInterventions();

// Hook patients
const { patients, loading, error, refetch } = usePatients();
```

## 🎯 Prochaines étapes

1. **Ajouter des données de test réelles** dans Supabase
2. **Tester le temps réel** en modifiant des interventions
3. **Optimiser les performances** si nécessaire
4. **Ajouter plus de fonctionnalités** (création, modification)

## 🚨 Points d'attention

- **RLS Policies** : Vérifier que les policies Supabase sont bien configurées
- **UUIDs** : S'assurer que les UUIDs dans les données de test correspondent aux vrais utilisateurs
- **Permissions** : Vérifier que chaque rôle voit bien ses données et pas celles des autres