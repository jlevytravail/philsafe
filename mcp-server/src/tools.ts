import { Tool } from '@modelcontextprotocol/sdk/types.js';

// Outils MCP pour PhilSafe
export const tools: Tool[] = [
  {
    name: 'authenticate',
    description: 'S\'authentifier avec un token JWT Supabase',
    inputSchema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'Token JWT d\'accès Supabase'
        }
      },
      required: ['token']
    }
  },
  {
    name: 'list-patients',
    description: 'Lister tous les patients de PhilSafe (filtré par rôle)',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Nombre maximum de patients à retourner (défaut: 50)',
          default: 50
        }
      }
    }
  },
  {
    name: 'get-patient',
    description: 'Obtenir les détails d\'un patient spécifique',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID unique du patient'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'create-patient',
    description: 'Créer un nouveau patient (aidants seulement)',
    inputSchema: {
      type: 'object',
      properties: {
        full_name: {
          type: 'string',
          description: 'Nom complet du patient'
        },
        address: {
          type: 'string',
          description: 'Adresse du domicile'
        },
        birth_date: {
          type: 'string',
          description: 'Date de naissance (format YYYY-MM-DD)'
        },
        medical_notes: {
          type: 'string',
          description: 'Notes médicales importantes (optionnel)'
        }
      },
      required: ['full_name', 'address', 'birth_date']
    }
  },
  {
    name: 'list-interventions',
    description: 'Lister les interventions avec filtres optionnels',
    inputSchema: {
      type: 'object',
      properties: {
        patient_id: {
          type: 'string',
          description: 'Filtrer par ID patient'
        },
        intervenant_id: {
          type: 'string',
          description: 'Filtrer par ID intervenant'
        },
        aidant_id: {
          type: 'string',
          description: 'Filtrer par ID aidant (via liens patients)'
        },
        date: {
          type: 'string',
          description: 'Filtrer par date (format YYYY-MM-DD)'
        },
        status: {
          type: 'string',
          enum: ['planned', 'done', 'missed'],
          description: 'Filtrer par statut'
        },
        limit: {
          type: 'number',
          description: 'Nombre maximum d\'interventions (défaut: 50)',
          default: 50
        }
      }
    }
  },
  {
    name: 'create-intervention',
    description: 'Créer une nouvelle intervention',
    inputSchema: {
      type: 'object',
      properties: {
        patient_id: {
          type: 'string',
          description: 'ID du patient'
        },
        intervenant_id: {
          type: 'string',
          description: 'ID de l\'intervenant (optionnel)'
        },
        created_by_id: {
          type: 'string',
          description: 'ID du créateur (aidant)'
        },
        scheduled_start: {
          type: 'string',
          description: 'Heure de début prévue (ISO 8601)'
        },
        scheduled_end: {
          type: 'string',
          description: 'Heure de fin prévue (ISO 8601)'
        },
        status: {
          type: 'string',
          enum: ['planned', 'done', 'missed'],
          description: 'Statut de l\'intervention',
          default: 'planned'
        },
        notes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Liste des tags/notes (ex: ["toilette", "médicaments"])'
        }
      },
      required: ['patient_id', 'created_by_id', 'scheduled_start', 'scheduled_end']
    }
  },
  {
    name: 'get-user-profile',
    description: 'Obtenir le profil d\'un utilisateur',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID de l\'utilisateur'
        },
        email: {
          type: 'string',
          description: 'Email de l\'utilisateur (alternative à l\'ID)'
        }
      }
    }
  },
  {
    name: 'list-notifications',
    description: 'Lister les notifications pour un aidant',
    inputSchema: {
      type: 'object',
      properties: {
        aidant_id: {
          type: 'string',
          description: 'ID de l\'aidant'
        },
        limit: {
          type: 'number',
          description: 'Nombre maximum de notifications (défaut: 20)',
          default: 20
        }
      },
      required: ['aidant_id']
    }
  },
  {
    name: 'get-aidant-patients',
    description: 'Obtenir la liste des patients liés à un aidant',
    inputSchema: {
      type: 'object',
      properties: {
        aidant_id: {
          type: 'string',
          description: 'ID de l\'aidant'
        }
      },
      required: ['aidant_id']
    }
  }
];