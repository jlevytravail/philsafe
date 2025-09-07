#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { tools } from './tools.js';
import { PhilSafeHandlers } from './handlers.js';
import { authManager } from './auth.js';

const server = new Server(
  {
    name: 'philsafe-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const handlers = new PhilSafeHandlers();

// Handler pour lister les outils disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handler principal pour appeler les outils
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'authenticate':
        if (!args || typeof args.token !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, 'Token requis');
        }
        const user = await authManager.authenticateWithToken(args.token);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ 
                success: true, 
                user: {
                  id: user.id,
                  full_name: user.full_name,
                  email: user.email,
                  role: user.role,
                  sub_role: user.sub_role
                }
              }, null, 2),
            },
          ],
        };

      case 'list-patients':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await handlers.listPatients(args || {}), null, 2),
            },
          ],
        };

      case 'get-patient':
        if (!args || typeof args.id !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, 'ID patient requis');
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await handlers.getPatient(args as { id: string }), null, 2),
            },
          ],
        };

      case 'create-patient':
        if (!args || !args.full_name || !args.address || !args.birth_date) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'full_name, address et birth_date requis'
          );
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await handlers.createPatient(args as any), null, 2),
            },
          ],
        };

      case 'list-interventions':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await handlers.listInterventions(args || {}), null, 2),
            },
          ],
        };

      case 'create-intervention':
        if (!args || !args.patient_id || !args.created_by_id || !args.scheduled_start || !args.scheduled_end) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'patient_id, created_by_id, scheduled_start et scheduled_end requis'
          );
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await handlers.createIntervention(args as any), null, 2),
            },
          ],
        };

      case 'get-user-profile':
        if (!args || (!args.id && !args.email)) {
          throw new McpError(ErrorCode.InvalidParams, 'ID ou email requis');
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await handlers.getUserProfile(args), null, 2),
            },
          ],
        };

      case 'list-notifications':
        if (!args || typeof args.aidant_id !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, 'aidant_id requis');
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await handlers.listNotifications(args as { aidant_id: string }), null, 2),
            },
          ],
        };

      case 'get-aidant-patients':
        if (!args || typeof args.aidant_id !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, 'aidant_id requis');
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await handlers.getAidantPatients(args as { aidant_id: string }), null, 2),
            },
          ],
        };

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Outil inconnu: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: errorMessage }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Logs de démarrage (sur stderr pour ne pas interférer avec MCP)
  console.error('PhilSafe MCP Server démarré');
}

main().catch((error) => {
  console.error('Erreur de démarrage du serveur MCP:', error);
  process.exit(1);
});