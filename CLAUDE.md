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

## 🚀 Intégration données réelles - Session du 17 août 2025

### ✅ Objectif accompli : Remplacer les données mockées par de vraies données Supabase

**Implémentation système de données temps réel :**
- ✅ **Architecture complète** : Hooks spécialisés avec filtrage par rôle
- ✅ **Base de données** : Schéma complet avec foreign keys et RLS policies
- ✅ **Abonnements temps réel** : Mise à jour automatique via Supabase subscriptions
- ✅ **Documentation complète** : Guides de test et scripts SQL

### Hooks créés (src/hooks/)

**useInterventions.ts** : Hook principal avec options avancées
- Filtrage par rôle (aidant via patient_links / intervenant direct)
- Fenêtres de dates configurables (today, week, custom)
- Pagination et tri automatique
- Abonnement temps réel postgres_changes

**usePatients.ts** : Gestion des patients par rôle
- Intervenants : patients avec interventions assignées
- Aidants : patients liés via aidant_patient_links

**useInterventionsDebug.ts** : Version debug avec logs détaillés

### Composants mis à jour

**Dashboard aidants** (`app/(tabs)/index.tsx`) :
- ✅ Remplacement du VisitContext par useInterventions
- ✅ Transformation des données pour compatibilité composants existants
- ✅ États de loading/error intégrés

**Dashboard intervenants** (`app/(caregiver)/index.tsx`) :
- ✅ Écran "Tournée" avec vraies interventions d'aujourd'hui
- ✅ Format compatible avec les composants appointment existants
- ✅ Gestion des statuts (planned/done/missed)

**Liste patients** (`app/(caregiver)/patients.tsx`) :
- ✅ Données réelles avec calcul automatique des âges
- ✅ Notes médicales dynamiques depuis la base
- ✅ Recherche sur nom et adresse

### Base de données

**Types Supabase étendus** (`src/lib/supabase.ts`) :
- patients, interventions, intervention_logs
- aidant_patient_links, notifications
- Foreign keys et relations correctement typées

**Scripts SQL fournis :**
- `COMPLETE_TEST_DATA.sql` : Données complètes pour test
- `FINAL_TEST_WITH_YOUR_UUID.sql` : Script personnalisé
- `FIX_RLS_POLICIES.sql` : Correction des policies de sécurité
- `DEBUG_INTERVENTIONS.sql` : Diagnostic des problèmes

### 🔧 Status actuel : Problème RLS identifié

**Symptômes diagnostiqués :**
- ✅ **SQL direct** : Fonctionne (3 interventions visibles)
- ❌ **Hook app** : 0 interventions récupérées
- 🔍 **Cause** : Row Level Security policies bloquent l'accès API

**UUID utilisateur identifié :** `06192242-9578-4ca5-adf5-c305c42937b5`

**Solution préparée :**
- Scripts de correction RLS prêts (`FIX_RLS_POLICIES.sql`)
- Hook debug avec tests progressifs
- Logs détaillés pour diagnostic

### 📁 Nouveaux fichiers créés

**Documentation :**
- `INTEGRATION_GUIDE.md` : Guide complet d'intégration
- `QUICK_TEST_GUIDE.md` : Guide de test rapide
- `DEBUG_HOOKS.md` : Outils de diagnostic

**Scripts SQL :**
- `SAMPLE_DATA.sql` : Données génériques
- `COMPLETE_TEST_DATA.sql` : Dataset complet avec 5 patients, 12 interventions
- `FINAL_TEST_WITH_YOUR_UUID.sql` : Script personnalisé pour UUID utilisateur
- `FIX_RLS_POLICIES.sql` : Correction policies Supabase

### Prochaine session

1. **Résoudre problème RLS** : Exécuter `FIX_RLS_POLICIES.sql` *(PRIORITÉ)*
2. **Finaliser tests** : Valider le fonctionnement complet temps réel
3. **Nettoyage** : Retirer les hooks debug et logs temporaires
4. **Optimisation** : Performance et gestion d'erreurs avancée
5. **Tests cross-rôles** : Validation aidant ↔ intervenant