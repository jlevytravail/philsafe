# Exemples d'utilisation du serveur MCP PhilSafe

## 📋 Scénarios d'usage courants

### 1. Consulter le planning du jour pour un aidant

```json
// 1. S'authentifier
{
  "tool": "authenticate",
  "arguments": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

// 2. Lister les interventions d'aujourd'hui
{
  "tool": "list-interventions",
  "arguments": {
    "date": "2025-01-20",
    "status": "planned"
  }
}
```

### 2. Ajouter un nouveau patient et planifier une intervention

```json
// 1. S'authentifier comme aidant
{
  "tool": "authenticate",
  "arguments": {
    "token": "your-aidant-token"
  }
}

// 2. Créer un nouveau patient
{
  "tool": "create-patient",
  "arguments": {
    "full_name": "Marie Durand",
    "address": "45 avenue des Champs, 75008 Paris",
    "birth_date": "1935-12-03",
    "medical_notes": "Mobilité réduite, besoin d'aide pour la toilette"
  }
}

// 3. Créer une intervention pour demain
{
  "tool": "create-intervention",
  "arguments": {
    "patient_id": "uuid-du-patient-créé",
    "created_by_id": "votre-aidant-id",
    "scheduled_start": "2025-01-21T09:00:00Z",
    "scheduled_end": "2025-01-21T10:00:00Z",
    "notes": ["toilette", "aide habillage", "préparation médicaments"]
  }
}
```

### 3. Consulter les notifications en attente

```json
// 1. S'authentifier
{
  "tool": "authenticate",
  "arguments": {
    "token": "your-aidant-token"
  }
}

// 2. Lister les notifications récentes
{
  "tool": "list-notifications",
  "arguments": {
    "aidant_id": "votre-aidant-id",
    "limit": 10
  }
}
```

### 4. Rechercher les interventions d'un patient spécifique

```json
// 1. S'authentifier
{
  "tool": "authenticate",
  "arguments": {
    "token": "your-token"
  }
}

// 2. Obtenir les détails du patient
{
  "tool": "get-patient",
  "arguments": {
    "id": "patient-uuid"
  }
}

// 3. Lister toutes ses interventions
{
  "tool": "list-interventions",
  "arguments": {
    "patient_id": "patient-uuid",
    "limit": 100
  }
}

// 4. Filtrer par statut (optionnel)
{
  "tool": "list-interventions",
  "arguments": {
    "patient_id": "patient-uuid",
    "status": "done"
  }
}
```

## 🔄 Workflows complets

### Workflow 1: Préparation de la tournée d'un intervenant

```json
// 1. Authentification intervenant
{
  "tool": "authenticate",
  "arguments": {
    "token": "intervenant-token"
  }
}

// 2. Voir toutes les interventions du jour
{
  "tool": "list-interventions",
  "arguments": {
    "date": "2025-01-20",
    "status": "planned"
  }
}

// 3. Voir les détails d'un patient spécifique
{
  "tool": "get-patient",
  "arguments": {
    "id": "patient-uuid-from-intervention"
  }
}
```

### Workflow 2: Suivi des patients d'un aidant

```json
// 1. Authentification aidant
{
  "tool": "authenticate",
  "arguments": {
    "token": "aidant-token"
  }
}

// 2. Lister tous mes patients
{
  "tool": "get-aidant-patients",
  "arguments": {
    "aidant_id": "mon-aidant-id"
  }
}

// 3. Pour chaque patient, voir les interventions récentes
{
  "tool": "list-interventions",
  "arguments": {
    "patient_id": "patient-1-uuid",
    "limit": 5
  }
}

// 4. Vérifier les notifications
{
  "tool": "list-notifications",
  "arguments": {
    "aidant_id": "mon-aidant-id"
  }
}
```

## 🎯 Cas d'usage avancés

### Analyser les patterns d'interventions

```json
// Obtenir toutes les interventions de la semaine
{
  "tool": "list-interventions",
  "arguments": {
    "limit": 200
  }
}

// Analyser par patient
{
  "tool": "list-interventions",
  "arguments": {
    "patient_id": "specific-patient",
    "limit": 50
  }
}

// Analyser par intervenant
{
  "tool": "list-interventions",
  "arguments": {
    "intervenant_id": "specific-intervenant",
    "limit": 50
  }
}
```

### Audit et vérifications

```json
// Vérifier les interventions manquées
{
  "tool": "list-interventions",
  "arguments": {
    "status": "missed",
    "limit": 20
  }
}

// Voir les interventions sans intervenant assigné
{
  "tool": "list-interventions",
  "arguments": {
    "status": "planned"
    // Filtrer manuellement les résultats où intervenant_id est null
  }
}
```

## 📊 Exemples de réponses

### Réponse `list-patients`
```json
{
  "patients": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "full_name": "Pierre Durand",
      "address": "123 rue de la Paix, 75001 Paris",
      "birth_date": "1940-05-15",
      "medical_notes": "Diabète type 2, hypertension",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### Réponse `list-interventions`
```json
{
  "interventions": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "patient_id": "123e4567-e89b-12d3-a456-426614174000",
      "intervenant_id": "789e0123-e89b-12d3-a456-426614174002",
      "created_by_id": "abc1234-e89b-12d3-a456-426614174003",
      "scheduled_start": "2025-01-20T09:00:00Z",
      "scheduled_end": "2025-01-20T10:00:00Z",
      "status": "planned",
      "notes": ["toilette", "médicaments"],
      "created_at": "2025-01-19T14:30:00Z",
      "patient": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "full_name": "Pierre Durand",
        "address": "123 rue de la Paix, 75001 Paris",
        "medical_notes": "Diabète type 2, hypertension"
      },
      "intervenant": {
        "id": "789e0123-e89b-12d3-a456-426614174002",
        "full_name": "Dr. Sophie Martin",
        "role": "intervenant",
        "sub_role": "infirmier",
        "phone_number": "+33123456789"
      }
    }
  ]
}
```

## ⚠️ Gestion des erreurs

### Erreur d'authentification
```json
{
  "error": "Authentification échouée: Invalid JWT"
}
```

### Erreur de permissions
```json
{
  "error": "Accès refusé. Rôles requis: aidant"
}
```

### Erreur d'accès patient
```json
{
  "error": "Accès refusé à ce patient"
}
```

## 💡 Tips pour une utilisation optimale

1. **Toujours s'authentifier en premier** avec l'outil `authenticate`
2. **Utiliser les filtres** pour limiter les résultats (date, status, patient_id)
3. **Combiner les outils** pour des analyses complexes
4. **Respecter les rôles** : aidants vs intervenants ont des permissions différentes
5. **Gérer les erreurs** : vérifier les réponses avant de continuer