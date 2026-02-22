// ============================================================
// config/swagger.ts - OpenAPI / Swagger documentation setup
// ============================================================

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management Dashboard API',
      version: '1.0.0',
      description:
        'A secure RESTful API for managing tasks with JWT authentication. ' +
        'All task endpoints require a valid Bearer token obtained from /auth/login.',
      contact: {
        name: 'API Support',
        email: 'vitasoft.it@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token (obtained from POST /auth/login)',
        },
      },
      schemas: {
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-v4' },
            title: { type: 'string', example: 'Build landing page' },
            description: { type: 'string', example: 'Design and implement the landing page' },
            status: {
              type: 'string',
              enum: ['todo', 'in-progress', 'done'],
              example: 'todo',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              example: 'medium',
            },
            dueDate: { type: 'string', nullable: true, example: '2024-12-31' },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            userId: { type: 'string', example: 'uuid-v4' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-v4' },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'Jane Doe' },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                user: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description' },
            errors: {
              type: 'array',
              items: { type: 'string' },
              example: ['Field is required'],
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
