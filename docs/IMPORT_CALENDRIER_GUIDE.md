# 📅 Guide d'Import de Calendriers PhilSafe

## 🎯 Vue d'ensemble

Ce guide explique comment importer des calendriers utilisateur dans PhilSafe de manière robuste, en évitant les problèmes de permissions RLS rencontrés précédemment.

## 🛠️ Architecture de la Solution

### Composants Créés

1. **`supabase_auth_fix.sql`** : Triggers et fonctions pour synchroniser automatiquement les `auth_id`
2. **`supabase_rls_policies_robust.sql`** : Policies RLS robustes avec fallbacks
3. **`importService.ts`** : Service TypeScript pour les imports côté client
4. **`import-diagnostic.tsx`** : Interface de diagnostic et test des imports

## 📋 Procédure d'Import Standard

### 1. Installation du Système

Exécutez dans l'ordre dans Supabase SQL Editor :

```sql
-- 1. Installer les triggers et fonctions de synchronisation
-- Contenu de supabase_auth_fix.sql

-- 2. Installer les policies RLS robustes  
-- Contenu de supabase_rls_policies_robust.sql
```

### 2. Import via l'Interface (Recommandé)

1. **Accéder à l'interface de diagnostic** : `/import-diagnostic`
2. **Tester le système** avec le diagnostic utilisateur actuel
3. **Importer un utilisateur** avec le formulaire de test
4. **Valider** que les données sont visibles

### 3. Import via Code

```typescript
import { importService } from '@/services/importService';

// Préparer les données
const userData = {
  email: 'utilisateur@example.com',
  full_name: 'Nom Utilisateur',
  role: 'aidant' as const,
  patients: [
    {
      full_name: 'Patient Test',
      address: '123 rue Example',
      birth_date: '1950-01-01',
      medical_notes: 'Notes médicales'
    }
  ],
  interventions: [
    {
      scheduled_start: '2025-09-07T09:00:00.000Z',
      scheduled_end: '2025-09-07T10:00:00.000Z',
      status: 'planned' as const,
      notes: ['toilette', 'medicaments']
    }
  ]
};

// Importer
const result = await importService.importUserCalendar(userData);

// Valider
const validation = await importService.validateImportSuccess(userData.email);
```

### 4. Import SQL Direct (Déconseillé)

Si vous devez importer via SQL direct, utilisez la fonction RPC :

```sql
SELECT import_user_with_calendar(
    'email@example.com',
    'Nom Utilisateur',
    'aidant',
    'famille',
    '06.12.34.56.78',
    '[{"full_name": "Patient Test", "address": "123 rue", "birth_date": "1950-01-01"}]',
    '[{"scheduled_start": "2025-09-07T09:00:00+00", "scheduled_end": "2025-09-07T10:00:00+00", "notes": ["toilette"]}]'
);
```

## 🔍 Diagnostic des Problèmes

### Utiliser l'Interface de Diagnostic

1. Aller sur `/import-diagnostic`
2. Cliquer "Lancer Diagnostic"
3. Analyser les résultats :
   - ✅ **Auth Match: YES** = RLS fonctionne
   - ❌ **Auth Match: NO** = Problème d'auth_id
   - **Liens Patients: 0** = Aucun patient lié
   - **Interventions: 0** = Aucune intervention visible

### Résolution des Problèmes Courants

#### Problème : Auth ID NULL

**Symptôme** : `Auth Match: NO`, `auth_id: NULL`

**Solution** :
```sql
-- Corriger l'auth_id pour un utilisateur spécifique
UPDATE users 
SET auth_id = (SELECT id FROM auth.users WHERE email = 'user@example.com')
WHERE email = 'user@example.com';
```

#### Problème : Aucune Donnée Visible

**Symptôme** : `Liens Patients: 0`, `Interventions: 0`

**Solutions** :
1. Vérifier les RLS policies actives
2. Utiliser l'outil "Corriger Auth IDs"
3. Recréer les liens patient si nécessaire

## 📊 Fonctions de Validation

### Test de Visibilité

```typescript
// Vérifier qu'un utilisateur voit ses données
const validation = await importService.validateImportSuccess('user@example.com');
console.log(validation);
// {
//   success: true,
//   auth_id_configured: true,
//   patients_linked: 2,
//   interventions_accessible: 5,
//   issues: []
// }
```

### Diagnostic RLS

```typescript
// Diagnostiquer l'utilisateur actuel
const diagnostic = await importService.diagnoseCurrentUser();
console.log(diagnostic);
// {
//   success: true,
//   user_found: true,
//   user_info: { auth_id_matches: true },
//   data_access: { links_count: 3, interventions_count: 7 }
// }
```

## 🔧 Maintenance et Dépannage

### Scripts de Maintenance

```sql
-- Lister les utilisateurs sans auth_id
SELECT id, email, full_name, created_at 
FROM users 
WHERE auth_id IS NULL 
ORDER BY created_at DESC;

-- Vérifier les policies RLS actives
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('aidant_patient_links', 'interventions', 'patients')
ORDER BY tablename, policyname;

-- Test de diagnostic pour tous les utilisateurs
SELECT email, (
    SELECT jsonb_extract_path_text(diagnose_rls_for_user(), 'success')
) as rls_works
FROM users 
WHERE role = 'aidant';
```

### Logs de Debug

Les services incluent des logs détaillés :
- `🔄 Import en cours`
- `✅ Import réussi`
- `🔍 Diagnostic RLS`
- `❌ Erreur lors de...`

## 📈 Bonnes Pratiques

### Pour les Imports

1. **Toujours tester** avec l'interface de diagnostic
2. **Valider après import** avec `validateImportSuccess()`
3. **Utiliser la fonction RPC** plutôt que des INSERT manuels
4. **Documenter** les imports problématiques

### Pour la Maintenance

1. **Monitorer** les utilisateurs sans `auth_id`
2. **Tester régulièrement** les policies RLS
3. **Maintenir** la documentation à jour
4. **Backup** avant modifications des policies

## 🚀 Migration des Données Existantes

Si vous avez déjà des utilisateurs avec des problèmes d'affichage :

1. **Exécuter le système** sur votre base existante
2. **Corriger les auth_id** avec la fonction de réparation
3. **Valider** que tous les utilisateurs voient leurs données
4. **Documenter** les cas edge rencontrés

## ⚠️ Points d'Attention

- **Ne pas désactiver RLS** en production
- **Tester en staging** avant déploiement
- **Monitorer** les performances après déploiement des nouvelles policies
- **Conserver** une sauvegarde des anciennes policies

## 📞 Support

En cas de problème :
1. Utiliser l'interface `/import-diagnostic`
2. Consulter les logs de l'app
3. Vérifier les policies RLS actives
4. Contacter le support avec les résultats du diagnostic