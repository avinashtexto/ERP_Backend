import path from 'path';
import { fileURLToPath } from 'url';

import swaggerJSDoc from 'swagger-jsdoc';

import { logger } from '@/shared/utils/devHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate path strings relative to this file to handle any working directory configurations
const apis = [
  path.resolve(__dirname, '../../../../src/modules/**/*.ts').replace(/\\/g, '/'),
  path.resolve(__dirname, '../../../../src/app.ts').replace(/\\/g, '/'),
  path.resolve(__dirname, '../**/*.js').replace(/\\/g, '/'),
];

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tionix One Pro API',
      version: '1.0.0',
      description: `
Welcome to the **Tionix One Pro ERP API** reference. 

This interactive documentation allows you to explore, test, and integrate with the Tionix One Pro ERP backend modules.
Use the **Authorize** button to authenticate with your Bearer Token to run test requests directly from the browser.

### Key Modules:
- **Auth**: Handle login, registration, and session tokens.
- **Users & User Rights**: Manage users and permissions.
- **Master Contacts**: Configure contact structures, categories, designations, and departments.
- **Attendance**: Geofenced punch-in/out, live tracking, and trails.
- **Account Groups & Book**: Core accounting ledger and double-entry groups.
`,
      contact: {
        name: 'Tionix Support',
        email: 'support@tionix.example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`,
        description: 'Local (browser)',
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Session management, token refresh, and credentials verification.',
      },
      { name: 'Users', description: 'CRUD operations and profile handling for system users.' },
      {
        name: 'User Rights',
        description: 'Configure granular permission controls and role mappings.',
      },
      {
        name: 'Master Contacts',
        description:
          'Database configurations for contacts, departments, titles, and relationships.',
      },
      {
        name: 'Attendance',
        description:
          'Real-time GPS punch coordinates, live trails, geofence validations, and historical logs.',
      },
      {
        name: 'Account Groups',
        description: 'Organizational hierarchy and accounting group definitions.',
      },
      { name: 'Book', description: 'Ledgers, accounting transactions, and bookkeeping logs.' },
      {
        name: 'Master Salary (Nature of Work)',
        description: 'Manage nature of work entries for salary processing.',
      },
      {
        name: 'MasterEmployee',
        description: 'CRUD operations, contact information, and document references for employees.',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Authenticate requests by providing the JWT token inside the Authorization header as: Bearer <token>',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis,
};

// Handle potential ESM default wrapper for swagger-jsdoc
const swaggerSpec =
  typeof swaggerJSDoc === 'function'
    ? swaggerJSDoc(options)
    : (swaggerJSDoc as any).default(options);

logger.info('Scalar Docs Initialized');

export function getOpenApiSpec() {
  return swaggerSpec;
}
