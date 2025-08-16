# 🚨 Configuration Supabase URGENTE

## Problème actuel
- Bouton de connexion ne fonctionne pas
- Emails redirigent vers `localhost:3000` au lieu de l'app

## Solution : Configurer les URLs dans Supabase

### 1. Aller dans Supabase Dashboard

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Allez dans votre projet PhilSafe
3. Sidebar → **Authentication** → **Settings**

### 2. Modifier ces champs EXACTEMENT :

#### Site URL
```
AVANT: http://localhost:3000
APRÈS: philsafe://auth-callback
```

#### Redirect URLs (ajouter ces lignes) :
```
philsafe://auth-callback
exp://192.168.1.8:8081
exp://localhost:8081
http://localhost:8081
```

### 3. Sauvegarder

Cliquer sur **"Save"** ou **"Update"**

### 4. Tester

Après sauvegarde :
- Le bouton "Envoyer le lien" devrait fonctionner
- Les emails devraient rediriger vers l'app au lieu de localhost:3000

## 🔥 NOUVEAU : Configuration pour codes OTP

### Pour recevoir des codes à 6 chiffres au lieu de magic links :

1. **Authentication** → **Settings**
2. **Site URL** : Laisser VIDE ou mettre une URL qui n'existe pas
3. **Redirect URLs** : Laisser VIDE ou supprimer toutes les URLs

### OU personnaliser le template email :
- **Authentication** → **Templates** → **Magic Link**
- Remplacer le contenu par :
```
Votre code PhilSafe : {{ .Token }}

Ce code expire dans 1 heure.
```

## Si ça ne fonctionne toujours pas

Vérifier dans les logs Supabase (Authentication → Logs) s'il y a des erreurs.