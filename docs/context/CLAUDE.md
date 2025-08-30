# PhilSafe - Contexte de développement Claude

## Statut actuel du projet

### Authentification Supabase - ✅ TERMINÉ

**Contexte :** Implémentation de l'authentification OTP (codes à 6 chiffres) pour remplacer les magic links qui ne fonctionnent pas avec Expo Go.

**Statut :** ✅ L'authentification OTP fonctionne parfaitement. L'utilisateur est redirigé vers la home de l'app après connexion.

## Travail effectué aujourd'hui (16 août 2025)

### 1. Configuration Supabase 
- ✅ Client Supabase configuré pour React Native/Expo
- ✅ RLS policies configurées dans Supabase Dashboard
- ✅ Deep links configurés (philsafe://auth-callback)
- ✅ Passage des magic links aux codes OTP 6 chiffres

### 2. Implémentation authentification OTP
- ✅ Méthodes `signInWithOtp` et `verifyOtp` dans AuthContext
- ✅ Interface utilisateur adaptée avec écran de saisie de code
- ✅ Gestion des états OTP (otpSent, otpEmail, otpCode)

### 3. Debugging et correction du problème de redirection
- ✅ Identification du problème : états OTP locaux perdus lors des reloads
- ✅ Déplacement des états OTP dans AuthContext pour persistence
- ✅ Correction de la gestion des états et redirection après connexion
- ✅ Nettoyage complet des logs et boutons de debug

## ✅ Flow OTP complet fonctionnel

### Comment tester l'authentification :
1. **Lancer l'app :**
   ```bash
   cd C:\Users\33612\PhilSafe\philsafe
   npx expo start
   ```

2. **Tester le flow complet :**
   - ✅ Saisir email valide dans le formulaire de connexion
   - ✅ Cliquer sur "Envoyer le lien de connexion"
   - ✅ Vérifier réception email avec code 6 chiffres
   - ✅ Saisir le code dans l'écran de vérification
   - ✅ Connexion réussie avec redirection vers la home de l'app

### Fonctionnalités validées :
- ✅ Capture d'email fonctionnelle
- ✅ Envoi de codes OTP par Supabase
- ✅ Écran de saisie de code qui s'affiche correctement
- ✅ Vérification des codes et connexion
- ✅ Redirection automatique vers la home après connexion
- ✅ Code nettoyé (plus de logs de debug)

## Architecture actuelle

```
app/auth.tsx                 # Interface de connexion avec états OTP
├── components/AuthInput.tsx # Composant input avec validation
├── hooks/useForm.ts        # Hook de gestion de formulaire
└── context/AuthContext.tsx # Logique authentification Supabase
```

## Configuration Supabase

- **URL :** https://yrkjdoynzcvagcqmzmgw.supabase.co
- **Site URL :** philsafe://auth-callback (configuré pour codes OTP)
- **RLS Policies :** Configurées pour table users
- **Email Template :** Modifié pour codes 6 chiffres

## Commandes utiles

```bash
# Démarrer le serveur de développement (à faire manuellement)
npx expo start

# Arrêter les processus en cours si nécessaire
npx kill-port 8081
```

## Notes importantes

- **Préférence utilisateur :** L'utilisateur lance le serveur Expo manuellement
- **Si Claude lance des tests :** Toujours killer le serveur à la fin avec KillBash
- Les **codes OTP sont à 6 chiffres** et expirent en 1 heure
- L'app **redirige automatiquement** selon le rôle après connexion :
  - aidant → `/(tabs)`
  - intervenant → `/(caregiver)`

## ✅ Gestion des profils utilisateurs - TERMINÉ

### Architecture implémentée (17 août 2025)

**Nouveau système de gestion des profils :**
- ✅ **UserContext** : Contexte dédié pour la gestion des profils utilisateurs
- ✅ **useSessionUser()** : Hook combiné pour session + profil
- ✅ **Écran de completion** : `/complete-profile` pour profils incomplets
- ✅ **Navigation intelligente** : Redirection automatique selon l'état du profil

### Fonctionnalités

1. **Fetch automatique du profil** après SIGNED_IN (SELECT id, email, full_name, role, sub_role, phone_number)
2. **Détection des profils incomplets** (full_name/role manquants)
3. **Écran de completion** obligatoire si profil incomplet
4. **UPDATE automatique** en base de données lors de la completion
5. **Redirection intelligente** selon le rôle après completion

### Flow utilisateur

```
Connexion OTP → UserContext fetch profil → 
├── Profil complet → Redirection selon rôle (aidant/intervenant)
└── Profil incomplet → Écran "/complete-profile" → Completion → Redirection
```

## 🎯 Navigation par rôles - TERMINÉ (17 août 2025)

### Objectif accompli : Router vers les bons écrans en fonction de users.role

**RoleGuard implémenté :**
- ✅ **RoleGuard component** : Contrôle d'accès basé sur le rôle utilisateur
- ✅ **États de loading** : Gestion pendant que session/profil se chargent
- ✅ **Navigation conditionnelle** : Redirection automatique selon le rôle

### Stacks définies par rôle

**Stack Aidant (`(tabs)`)** - role='aidant' :
- ✅ **Accueil** : Dashboard avec visites et événements
- ✅ **Notifications** : Alertes en temps réel  
- ✅ **Calendrier** : Planning des visites
- ✅ **Historique** : Visites passées et rapports
- ✅ **Paramètres** : Configuration utilisateur

**Stack Intervenant (`(caregiver)`)** - role='intervenant' :
- ✅ **Tournée** : Tournée du jour avec RDV
- ✅ **Patients** : Fiches patients avec détails médicaux
- ✅ **Calendrier** : Planning professionnel
- ✅ **Rapports** : Création et gestion des rapports de soins
- ✅ **Paramètres** : Configuration professionnelle

### Navigation intelligente

**AuthNavigator amélioré :**
- ✅ **Détection automatique** du rôle utilisateur
- ✅ **Protection croisée** : Redirection si utilisateur dans mauvaise stack
- ✅ **useRoleNavigation hook** : Utilitaires pour navigation basée sur les rôles

### Tests et développement

**Panel de test DEV :**
- ✅ **RoleTestingPanel** : Visible uniquement en développement (__DEV__)
- ✅ **Changement dynamique** : Boutons pour basculer aidant ↔ intervenant
- ✅ **Navigation automatique** : Redirection immédiate après changement
- ✅ **Logs détaillés** : Traçabilité complète du processus

### Comment tester le changement de rôle

1. **Aller dans Paramètres** (n'importe quelle stack)
2. **Panel de test** affiché automatiquement en mode DEV
3. **Cliquer "Basculer vers X"** → Navigation automatique vers nouvelle stack
4. **Critère validé** : Le changement de rôle change de stack instantanément

### Issues résolues (17 août 2025)

**Problèmes Metro/TypeScript corrigés :**
- ✅ Erreurs TypeScript dans AuthInput.tsx (conflits d'interface onBlur)
- ✅ Erreurs dans settings.tsx (migration vers UserContext)
- ✅ Erreurs `ENOENT: <anonymous>` (résolues avec `expo start --clear`)
- ✅ Import paths corrigés dans UserContext.tsx

**Architecture finalisée :**
- ✅ Séparation claire AuthContext ↔ UserContext
- ✅ Navigation intelligente avec détection profil incomplet
- ✅ Hooks exposés : `useAuth()`, `useUser()`, `useSessionUser()`

### Issues web - Session persistante (17 août 2025)

**Problème observé :**
- Sur le web, l'utilisateur atterrit directement sur la home (comme s'il était connecté)
- Supabase persiste automatiquement la session dans le navigateur (localStorage)

**Explications techniques :**
1. **Persistance Supabase :** `persistSession: true` dans la config maintient la session entre les rechargements
2. **AuthNavigator :** Détecte la session persistante et redirige automatiquement 
3. **Web vs Mobile :** Comportement normal sur web, différent sur mobile (session plus volatile)

**Solutions de debug ajoutées :**
- ✅ Logs détaillés dans AuthNavigator et UserContext
- ✅ Bouton "Debug/Logout" temporaire sur la home
- ✅ Nettoyage des caches Metro/Expo

**Comment tester le flow complet :**
1. Ouvrir l'app web → Cliquer "Debug/Logout" 
2. Sera redirigé vers `/auth` 
3. Tester le flow : Email → OTP → Completion profil → Home

## 📋 Architecture actuelle (17 août 2025)

### Fichiers clés ajoutés/modifiés

**Navigation et rôles :**
- ✅ `components/RoleGuard.tsx` : Contrôleur d'accès par rôle
- ✅ `hooks/useRoleNavigation.ts` : Utilitaires navigation basée sur les rôles
- ✅ `components/RoleTestingPanel.tsx` : Panel de test DEV pour changement de rôle

**Nouvelles pages :**
- ✅ `app/(tabs)/history.tsx` : Historique des visites pour aidants
- ✅ `app/(caregiver)/patients.tsx` : Gestion des patients pour intervenants  
- ✅ `app/(caregiver)/reports.tsx` : Rapports de soins pour intervenants
- ✅ `context/UserContext.tsx` : Gestion des profils utilisateur
- ✅ `app/complete-profile.tsx` : Écran de complétion de profil

**Layouts modifiés :**
- ✅ `app/(tabs)/_layout.tsx` : Stack aidants avec RoleGuard
- ✅ `app/(caregiver)/_layout.tsx` : Stack intervenants avec RoleGuard
- ✅ `app/_layout.tsx` : Navigation intelligente avec détection de rôle

### État actuel du système

**✅ Authentification OTP** : Complètement fonctionnelle avec codes 6 chiffres
**✅ Gestion des profils** : UserContext avec complétion automatique
**✅ Navigation par rôles** : RoleGuard et redirection automatique
**✅ Stacks spécialisées** : Interfaces dédiées aidants vs intervenants

## 🗄️ Architecture de base de données Supabase - EXISTANTE (22 août 2025)

### Tables créées et opérationnelles

**Table : `users`**
- `id` (UUID PK) : Généré automatiquement
- `full_name` (TEXT) : Nom complet
- `email` (TEXT) : Unique
- `phone_number` (TEXT) : Optionnel
- `role` (TEXT) : Enum: intervenant, aidant
- `sub_role` (TEXT) : Ex: infirmier, fils, voisine...
- `created_at` (TIMESTAMP) : Par défaut à `now()`

**Table : `patients`**
- `id` (UUID PK)
- `full_name` (TEXT) : Nom complet
- `address` (TEXT) : Adresse du domicile
- `birth_date` (DATE) : Date de naissance
- `medical_notes` (TEXT) : Infos médicales importantes
- `created_at` (TIMESTAMP)

**Table : `interventions`**
- `id` (UUID PK)
- `patient_id` (UUID FK) : Réf. `patients.id`
- `intervenant_id` (UUID FK) : Réf. `users.id` (peut être null)
- `created_by_id` (UUID FK) : Réf. `users.id` (créateur)
- `scheduled_start` (TIMESTAMP) : Heure prévue d'arrivée
- `scheduled_end` (TIMESTAMP) : Heure prévue de départ
- `status` (TEXT) : Enum: planned, done, missed
- `notes` (TEXT[]) : Liste de tags (ex: toilette, médicaments)
- `created_at` (TIMESTAMP)

**Table : `intervention_logs`**
- `id` (UUID PK)
- `intervention_id` (UUID FK) : Réf. `interventions.id`
- `check_in` (TIMESTAMP) : Horodatage de début réel
- `check_out` (TIMESTAMP) : Horodatage de fin réel
- `remarks` (TEXT) : Remarques sur l'intervention
- `created_at` (TIMESTAMP)

**Table : `aidant_patient_links`**
- `id` (UUID PK)
- `aidant_id` (UUID FK) : Réf. `users.id`
- `patient_id` (UUID FK) : Réf. `patients.id`
- `created_at` (TIMESTAMP)

**Table : `notifications`**
- `id` (UUID PK)
- `aidant_id` (UUID FK) : Réf. `users.id`
- `intervention_id` (UUID FK) : Réf. `interventions.id`
- `type` (TEXT) : check_in, check_out, missed
- `sent_at` (TIMESTAMP)

### Mapping mock → Supabase
- `mockData.visits` → `interventions` + `intervention_logs`
- `mockData.caregivers` → `users` (role='intervenant')
- `mockData.events` → déduit des `intervention_logs`
- `mockData.notifications` → table `notifications`

## 🎯 Migration Supabase - TERMINÉE (22 août 2025)

### ✅ Infrastructure complète

1. **✅ Architecture existante** : Tables créées et opérationnelles
2. **✅ Services et hooks Supabase** : Système complet d'accès aux données
3. **✅ Migration dashboard aidant** : Premier écran entièrement migré
4. **✅ Système de test** : Outils pour insérer/nettoyer les données
5. **🚧 En cours** : Tests collaboratifs avec données réelles

### Fichiers créés/modifiés aujourd'hui

**Services & Hooks :**
- ✅ `services/supabaseService.ts` : Service principal avec toutes les requêtes
- ✅ `hooks/useInterventions.ts` : Hook pour gérer les interventions (remplace VisitContext)
- ✅ `hooks/usePatients.ts` : Hook pour gérer les patients
- ✅ `hooks/useNotifications.ts` : Hook pour notifications temps réel
- ✅ `hooks/useCaregivers.ts` : Hook pour gérer les intervenants

**Composants :**
- ✅ `components/InterventionCard.tsx` : Carte d'intervention adaptée aux données Supabase

**Écrans :**
- ✅ `app/(tabs)/index.tsx` : Dashboard aidant entièrement migré vers Supabase
- ✅ `app/test-data.tsx` : Interface pour gérer les données de test

**Outils de développement :**
- ✅ `scripts/seedTestData.ts` : Insertion automatique de données réalistes

## 🚀 Prêt pour les tests ! (22 août 2025)

### Comment tester le nouveau système

1. **Lancer l'application :**
   ```bash
   npx expo start
   ```

2. **Insérer des données de test :**
   - Se connecter avec votre compte aidant
   - Naviguer vers `/test-data` (bouton "Test Data" en mode DEV)
   - Cliquer "Créer les données de test"
   - Cela créera : 3 patients, 3 intervenants, planning 7 jours, notifications

3. **Tester le dashboard migré :**
   - Retourner au dashboard `/(tabs)`
   - Vérifier l'affichage des interventions d'aujourd'hui depuis Supabase
   - Tester le rafraîchissement des données
   - Vérifier les notifications temps réel

### Fonctionnalités validées
- ✅ **Service Supabase** : Toutes les requêtes fonctionnelles
- ✅ **Hooks spécialisés** : Gestion des états et subscriptions temps réel
- ✅ **Dashboard migré** : Affichage des vraies données au lieu des mocks
- ✅ **Système de test** : Insertion/nettoyage automatique des données
- ✅ **Interface moderne** : Nouveaux composants adaptés aux données Supabase

## 🔧 Système de Debug et Sessions - TERMINÉ (22 août 2025)

### ✅ Problèmes résolus durant cette session

**1. Connexion Debug fonctionnelle**
- ✅ Fonction `signInAsDebugUser()` ajoutée dans AuthContext
- ✅ Bouton "🔧 Connexion Debug" sur l'écran auth
- ✅ Flow OTP standard avec email : `jlevy.travail@gmail.com`
- ✅ Plus besoin d'attendre les emails pour tester

**2. Sessions synchronisées AuthContext ↔ Supabase**
- ✅ **Problème identifié** : Deux configurations Supabase différentes
  - `utils/supabase.ts` - utilisé par AuthContext
  - `src/lib/supabase.ts` - utilisé par services et scripts
- ✅ **Solution** : Synchronisation complète des configurations
  - AsyncStorage configuré dans les deux fichiers
  - Même storage key : `philsafe-auth-token`
  - Mêmes URL et clés Supabase
- ✅ **Validation** : Sessions parfaitement synchronisées

**3. Script d'insertion ultra-robuste**
- ✅ Gestion des erreurs de session avec 5 tentatives
- ✅ Attentes progressives (3.5s, 5s, 6.5s, 8s, 9.5s)
- ✅ Refresh session automatique en cas d'échec
- ✅ Messages d'erreur détaillés avec solutions

**4. Interface de diagnostic complète**
- ✅ Page `/test-data` avec diagnostic détaillé
- ✅ 4 boutons de diagnostic :
  - "Vérifier la session" → Diagnostic complet
  - "Forcer refresh session" → Force la synchronisation
  - "Tester la configuration" → Validation avant insertion
  - "Debug Console AuthContext" → Logs console détaillés
- ✅ Affichage AsyncStorage et détails de session

### Fichiers modifiés durant cette session

**Configurations Supabase :**
- `utils/supabase.ts` → AsyncStorage configuré
- `src/lib/supabase.ts` → Synchronisé avec utils/supabase.ts

**AuthContext amélioré :**
- `context/AuthContext.tsx` → Connexion debug + logs détaillés + diagnostic

**Scripts d'insertion :**
- `scripts/seedTestData.ts` → Robustesse RLS + fallbacks + résumés

**Interface de diagnostic :**
- `app/test-data.tsx` → 4 boutons diagnostic + AsyncStorage reader + tests

**Page auth :**
- `app/auth.tsx` → Bouton "🔧 Connexion Debug"

### Configuration Supabase finale

```typescript
// Configuration validée et synchronisée
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: 'philsafe-auth-token',
    storage: AsyncStorage,
    ...__DEV__ && { debug: true }
  },
});
```

## ✅ Problème RLS résolu - Fonctions RPC implémentées (30 août 2025)

### Solution RPC appliquée avec succès
La solution **fonction RPC avec SECURITY DEFINER** a été implémentée pour contourner les restrictions RLS.

### Problèmes résolus

#### 1. ✅ Erreur RLS contournée
```
AVANT: ERROR: "new row violates row-level security policy for table \"users\""
APRÈS: ✅ Fonction RPC bypasse les RLS avec SECURITY DEFINER
```

#### 2. ✅ Contrainte FK résolue  
```
AVANT: ERROR: "insert or update on table \"users\" violates foreign key constraint \"users_id_fkey\""
APRÈS: ✅ Plus de création d'utilisateurs - utilise seulement les intervenants existants
```

#### 3. ✅ Interventions aujourd'hui garanties
```
AVANT: Aucune intervention visible le 30/08/2025
APRÈS: ✅ 5 interventions créées pour aujourd'hui (9h, 10h, 14h, 16h, 18h)
```

### Architecture RPC finale

**Fichiers créés/modifiés :**
- ✅ `supabase_rpc_function.sql` - Fonctions PostgreSQL complètes
  - `create_test_data()` - Crée patients, interventions, liens sans violer RLS
  - `clean_test_data()` - Nettoie les données de test
- ✅ `scripts/seedTestData.ts` - Nouvelles fonctions TypeScript
  - `seedTestDataWithRPC()` - Utilise les fonctions RPC
  - `cleanTestDataWithRPC()` - Nettoie via RPC
- ✅ `app/test-data.tsx` - Interface mise à jour pour RPC

### Stratégie adaptative implémentée

1. **Recherche d'intervenants existants** - Utilise les intervenants déjà en base
2. **Création de patients garantie** - Toujours 3 patients créés
3. **Interventions flexibles** - Avec ou sans intervenants assignés
4. **Dates optimisées** - 5 interventions pour aujourd'hui minimum

### Données de test créées

**Patients (3) :**
- Pierre Durand - Diabète, hypertension (75001 Paris)
- Marie Leblanc - Arthrose, ostéoporose (75016 Paris)  
- Robert Petit - Post-AVC, déglutition (75011 Paris)

**Interventions aujourd'hui (5) :**
- 09h-10h : Toilette, médicaments, surveillance glycémie
- 10h-11h : Toilette, aide habillage (patient 2)
- 14h-15h : Soins infirmiers, contrôle tension
- 16h-17h : Kinésithérapie, exercices mobilité (patient 2)
- 18h-19h : Préparation repas, aide mobilité, compagnie

**Autres données :**
- Interventions demain (2)
- Intervention hier avec logs (1) 
- Notifications (2)
- Liens aidant-patient (3)

### État validé (30 août 2025)
- ✅ **Sessions parfaitement fonctionnelles** - AuthContext ↔ Supabase synchronisés
- ✅ **Connexion debug opérationnelle** - Plus de problèmes de session
- ✅ **RLS Policies contournées** - Fonctions RPC avec SECURITY DEFINER
- ✅ **Contraintes FK respectées** - Pas de création d'utilisateurs auth
- ✅ **Données de test complètes** - Interventions visibles aujourd'hui
- ✅ **Interface fonctionnelle** - Création et nettoyage via RPC

### Commandes opérationnelles

```bash
# Application fonctionnelle
cd C:\Users\33612\PhilSafe\philsafe
npx expo start --tunnel  # Pour iOS

# Tests validés
# 1. Connexion debug : jlevy.travail@gmail.com ✅
# 2. /test-data → Création RPC ✅  
# 3. Dashboard → Interventions aujourd'hui visibles ✅
# 4. Nettoyage RPC ✅
```

## 📁 Documentation organisée

**Structure créée :**
```
philsafe/docs/
├── README.md
└── context/
    ├── README.md
    ├── CLAUDE.md (ce fichier)
    └── PROGRESSION_SESSION.md
```

## 🎯 Prochaine session

1. **Analyser les RLS policies** dans Supabase Dashboard
2. **Choisir une stratégie** pour contourner les restrictions
3. **Finaliser l'insertion** des données de test
4. **Continuer la migration** des autres écrans