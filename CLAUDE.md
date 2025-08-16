# PhilSafe - Contexte de développement Claude

## Statut actuel du projet

### Authentification Supabase - En cours de debugging

**Contexte :** Implémentation de l'authentification OTP (codes à 6 chiffres) pour remplacer les magic links qui ne fonctionnent pas avec Expo Go.

**Problème actuel :** Le champ email ne capture pas les données saisies par l'utilisateur lors de la validation du formulaire.

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

### 3. Debugging du formulaire d'email
- ✅ Ajout de logs de debug dans app/auth.tsx
- ✅ Ajout de logs de debug dans components/AuthInput.tsx
- ✅ Ajout de logs de debug complets dans hooks/useForm.ts
- ⏳ **En cours :** Identification de la cause du problème de capture d'email

## Tests à effectuer pour avancer

### Test immédiat (priorité 1)
1. **Lancer l'app et tester la saisie email :**
   ```bash
   cd C:\Users\33612\PhilSafe\philsafe
   npx expo start
   ```

2. **Observer les logs de debug suivants :**
   - `[AuthInput] Email input changed: <text>` (quand on tape)
   - `[AuthInput] Email input blurred, current value: <value>` (quand on sort du champ)
   - `[useForm] handleChange called: {fieldName, value}` (dans useForm)
   - `[useForm] Updated formData: <object>` (état du formulaire)
   - `[useForm] validateForm called with formData: <object>` (lors de validation)

3. **Scénarios de test :**
   - Taper un email dans le champ → vérifier les logs onChange
   - Sortir du champ email → vérifier les logs onBlur
   - Cliquer sur le bouton debug rouge → vérifier la validation

### Problèmes potentiels à vérifier

1. **AuthInput component :**
   - L'événement `onChangeText` se déclenche-t-il ?
   - Les props sont-elles correctement passées au TextInput ?

2. **useForm hook :**
   - La fonction `handleChange` reçoit-elle les bonnes données ?
   - Le state `formData` est-il mis à jour correctement ?

3. **Liaison AuthInput ↔ useForm :**
   - La callback `loginForm.handleChange('email', text)` fonctionne-t-elle ?

### Une fois le problème identifié

1. **Corriger le bug de capture d'email**
2. **Tester le flow complet :**
   - Saisir email valide → Envoyer code OTP
   - Vérifier réception email avec code 6 chiffres
   - Saisir code → Connexion réussie
3. **Supprimer les boutons de debug**
4. **Commit des corrections**

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
# Démarrer le serveur de développement
npx expo start

# Arrêter les processus en cours
npx kill-port 8081

# Logs en temps réel
# Les logs apparaissent automatiquement dans la console Expo
```

## Notes importantes

- **Ne pas oublier** de killer le serveur après les tests avec `npx kill-port 8081`
- Les **codes OTP sont à 6 chiffres** et expirent en 1 heure
- L'app **redirige automatiquement** selon le rôle après connexion :
  - aidant → `/(tabs)`
  - intervenant → `/(caregiver)`

## Prochaine session

1. Démarrer par tester l'app avec les logs de debug en place
2. Identifier pourquoi l'email n'est pas capturé
3. Corriger le problème
4. Valider le flow OTP complet
5. Nettoyer le code (supprimer les debug)
6. Passer aux étapes suivantes : remplacer les données mock par de vraies requêtes Supabase