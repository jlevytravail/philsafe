# PhilSafe MCP Server

Ce serveur MCP (Model Context Protocol) permet d'interagir avec la base de données Supabase de PhilSafe depuis Claude Desktop.

## Installation

1. **Installer les dépendances**
```bash
cd mcp-server
npm install
```

2. **Configuration**
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer avec vos clés Supabase
# SUPABASE_URL et SUPABASE_ANON_KEY sont déjà configurées
# Optionnel : SUPABASE_SERVICE_ROLE_KEY pour plus de permissions
```

3. **Compiler**
```bash
npm run build
```

## Configuration Claude Desktop

1. **Copier la configuration MCP**
```bash
# Le fichier claude_desktop_config.json est déjà créé à la racine
# Copiez son contenu dans votre configuration Claude Desktop
```

2. **Redémarrer Claude Desktop**

## Outils disponibles

### 🔐 Authentification

#### `authenticate`
S'authentifier avec un token JWT Supabase.
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 👥 Gestion des patients

#### `list-patients`
Lister tous les patients (filtrés selon le rôle de l'utilisateur).
```json
{
  "limit": 50
}
```

#### `get-patient`
Obtenir les détails d'un patient spécifique.
```json
{
  "id": "patient-uuid"
}
```

#### `create-patient`
Créer un nouveau patient (aidants seulement).
```json
{
  "full_name": "Pierre Dupont",
  "address": "123 rue de la Paix, 75001 Paris",
  "birth_date": "1940-05-15",
  "medical_notes": "Diabète type 2, hypertension"
}
```

### 🏥 Gestion des interventions

#### `list-interventions`
Lister les interventions avec filtres optionnels.
```json
{
  "patient_id": "patient-uuid",
  "date": "2025-01-20",
  "status": "planned",
  "limit": 50
}
```

#### `create-intervention`
Créer une nouvelle intervention.
```json
{
  "patient_id": "patient-uuid",
  "intervenant_id": "intervenant-uuid",
  "created_by_id": "aidant-uuid",
  "scheduled_start": "2025-01-20T09:00:00Z",
  "scheduled_end": "2025-01-20T10:00:00Z",
  "status": "planned",
  "notes": ["toilette", "médicaments", "contrôle tension"]
}
```

### 👤 Gestion des utilisateurs

#### `get-user-profile`
Obtenir le profil d'un utilisateur.
```json
{
  "id": "user-uuid",
  // ou
  "email": "user@example.com"
}
```

### 🔔 Notifications et liens

#### `list-notifications`
Lister les notifications pour un aidant.
```json
{
  "aidant_id": "aidant-uuid",
  "limit": 20
}
```

#### `get-aidant-patients`
Obtenir la liste des patients liés à un aidant.
```json
{
  "aidant_id": "aidant-uuid"
}
```

## Sécurité et permissions

### Contrôle d'accès basé sur les rôles

- **Aidants** : Accès limité à leurs patients liés
- **Intervenants** : Accès à tous les patients et interventions
- **Authentification requise** : Tous les outils (sauf authenticate) nécessitent une session active

### RLS (Row Level Security)

Le serveur respecte les politiques RLS configurées dans Supabase :
- Les aidants ne voient que leurs patients via `aidant_patient_links`
- Les intervenants ont accès complet aux données patient/intervention
- Les utilisateurs ne peuvent modifier que leurs propres données

## Développement

### Structure du projet
```
mcp-server/
├── src/
│   ├── index.ts          # Serveur MCP principal
│   ├── tools.ts          # Définitions des outils
│   ├── handlers.ts       # Logique métier
│   ├── auth.ts          # Gestion de l'authentification
│   ├── supabase.ts      # Client Supabase
│   └── types.ts         # Types TypeScript
├── dist/                # Code compilé
├── package.json
├── tsconfig.json
└── .env
```

### Commandes de développement
```bash
# Mode développement avec rechargement automatique
npm run dev

# Compilation
npm run build

# Démarrage production
npm start
```

### Logs et debugging
- Les logs du serveur sont envoyés sur `stderr` pour ne pas interférer avec MCP
- Utilisez l'outil `authenticate` pour vérifier la connexion
- Les erreurs incluent des messages détaillés

## Exemples d'utilisation

### 1. Authentification et liste des patients
```
1. Utiliser l'outil "authenticate" avec votre token Supabase
2. Utiliser "list-patients" pour voir vos patients
3. Utiliser "get-patient" avec un ID pour voir les détails
```

### 2. Créer une intervention
```
1. S'authentifier comme aidant
2. Utiliser "list-patients" pour obtenir l'ID d'un patient
3. Utiliser "create-intervention" avec les détails
4. Vérifier avec "list-interventions"
```

### 3. Consulter les notifications
```
1. S'authentifier comme aidant
2. Utiliser "list-notifications" avec votre ID
3. Consulter les interventions liées
```

## Troubleshooting

### Erreur "Authentification requise"
- Utilisez d'abord l'outil `authenticate` avec un token valide
- Vérifiez que le token n'est pas expiré

### Erreur "Accès refusé"
- Vérifiez que votre rôle permet l'action demandée
- Les aidants ne peuvent accéder qu'à leurs patients liés

### Erreur de connexion Supabase
- Vérifiez les variables d'environnement dans `.env`
- Confirmez que l'URL et les clés Supabase sont correctes

## Support

Pour tout problème ou question, consultez :
- Les logs du serveur MCP
- La documentation Supabase
- Le code source dans `src/`