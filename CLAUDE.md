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

## 🆕 Gestion des profils utilisateurs - EN COURS

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

### Prochaine session

1. **Tester le flow complet** : Logout → OTP → profil incomplet → completion → home *(PRIORITÉ)*
2. **Amélioration UX :** Ajouter des indicateurs de chargement et animations
3. **Tests :** Ajouter des tests automatisés pour le flow d'authentification
4. **Données réelles :** Remplacer les données mock par de vraies requêtes Supabase
5. **Sécurité :** Validation côté serveur et gestion des erreurs avancée