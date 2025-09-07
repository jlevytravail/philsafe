# 🚀 Guide d'installation MCP PhilSafe

Ce guide vous accompagne dans la configuration complète du serveur MCP pour accéder à votre base de données PhilSafe depuis Claude Desktop.

## 📋 Prérequis

- Node.js 18+ installé
- Claude Desktop installé
- Accès à votre projet Supabase PhilSafe

## 🛠️ Installation étape par étape

### Étape 1: Installation des dépendances

```bash
cd C:\Users\jlevy\PhilSafe\philsafe\mcp-server
npm install
```

### Étape 2: Configuration des variables d'environnement

Le fichier `.env` est déjà créé avec vos identifiants Supabase :
```env
SUPABASE_URL=https://yrkjdoynzcvagcqmzmgw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Étape 3: Compilation du serveur

```bash
npm run build
```

Cette commande génère le code JavaScript dans le dossier `dist/`.

### Étape 4: Configuration de Claude Desktop

1. **Localiser votre fichier de configuration Claude Desktop :**
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. **Copier la configuration suivante :**
```json
{
  "mcpServers": {
    "philsafe": {
      "command": "node",
      "args": ["C:\\Users\\jlevy\\PhilSafe\\philsafe\\mcp-server\\dist\\index.js"],
      "env": {
        "SUPABASE_URL": "https://yrkjdoynzcvagcqmzmgw.supabase.co",
        "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya2pkb3luemN2YWdjcW16bWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTc0ODEsImV4cCI6MjA3MDIzMzQ4MX0.Q-Jyw6EPsrKkFpepFaUI8Czt3DP_kbrVwSVLxRSld5U"
      }
    }
  }
}
```

### Étape 5: Redémarrer Claude Desktop

Fermez complètement Claude Desktop et relancez-le.

## ✅ Test de l'installation

### 1. Vérifier que MCP est actif

Dans Claude Desktop, vous devriez voir une indication que le serveur MCP est connecté.

### 2. Test d'authentification

Demandez à Claude d'utiliser l'outil d'authentification :
```
Peux-tu t'authentifier avec PhilSafe en utilisant le token : [votre-token-supabase]
```

### 3. Test basique

Une fois authentifié, testez une requête simple :
```
Peux-tu lister mes patients PhilSafe ?
```

## 🔑 Obtenir un token d'authentification

### Option 1: Via l'application PhilSafe

1. Connectez-vous à votre application PhilSafe
2. Ouvrez les outils de développeur (F12)
3. Console → Tapez : `supabase.auth.session()?.access_token`
4. Copiez le token affiché

### Option 2: Via l'interface de debug

1. Lancez votre app PhilSafe : `npx expo start`
2. Allez sur `/test-data`
3. Utilisez "Debug Console AuthContext" pour voir le token

## 🚀 Outils MCP disponibles

Une fois configuré, vous aurez accès à ces outils :

- `authenticate` - S'authentifier avec un token
- `list-patients` - Lister vos patients
- `get-patient` - Détails d'un patient
- `create-patient` - Créer un nouveau patient
- `list-interventions` - Lister les interventions
- `create-intervention` - Créer une intervention
- `get-user-profile` - Profil utilisateur
- `list-notifications` - Vos notifications
- `get-aidant-patients` - Patients d'un aidant

## 🔧 Résolution des problèmes

### Le serveur MCP ne se connecte pas

1. **Vérifier la compilation :**
```bash
cd mcp-server
npm run build
```

2. **Tester le serveur manuellement :**
```bash
node dist/index.js
```

3. **Vérifier les chemins dans `claude_desktop_config.json`**

### Erreurs d'authentification

1. **Vérifier que le token n'est pas expiré**
2. **Confirmer les variables d'environnement Supabase**
3. **Tester la connexion Supabase directe**

### Permissions refusées

1. **Vérifier votre rôle dans la base de données**
2. **Confirmer les liens aidant-patient pour les aidants**
3. **Vérifier les RLS policies Supabase**

## 📚 Documentation complète

- `README.md` - Documentation technique complète
- `EXAMPLES.md` - Exemples d'utilisation détaillés
- Code source dans `src/` pour customisation

## 🎯 Utilisation avec Claude

### Exemple de conversation type :

```
Utilisateur: "Peux-tu m'aider à gérer mes patients PhilSafe ?"

Claude: "Je vais vous aider ! D'abord, je dois m'authentifier avec votre compte PhilSafe. Pouvez-vous me donner votre token d'authentification ?"

Utilisateur: [fournit le token]

Claude: "Parfait ! Je suis maintenant connecté. Voulez-vous que je liste vos patients ou que nous regardions les interventions prévues aujourd'hui ?"

Utilisateur: "Montre-moi les interventions d'aujourd'hui"

Claude: [utilise list-interventions avec la date du jour]
```

## 🔄 Mise à jour

Pour mettre à jour le serveur MCP :

1. Modifier le code dans `src/`
2. Recompiler : `npm run build`
3. Redémarrer Claude Desktop

## 📞 Support

En cas de problème :
1. Vérifier les logs dans les outils de développeur de Claude Desktop
2. Tester les requêtes Supabase directement
3. Consulter la documentation Supabase et MCP