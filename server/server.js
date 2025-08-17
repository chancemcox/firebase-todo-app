const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Import routes
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://todo-list-e7788.web.app',
    'https://todo.chancecox.com'
  ],
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo API',
      version: '1.0.0',
      description: 'A comprehensive REST API for managing todos with OAuth2 authentication',
      contact: {
        name: 'Chance Cox',
        email: 'chance.cox@gmail.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server'
      },
      {
        url: 'https://todo-list-e7788.web.app',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Todo: {
          type: 'object',
          required: ['title', 'userId'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the todo'
            },
            title: {
              type: 'string',
              description: 'Todo title',
              minLength: 1
            },
            description: {
              type: 'string',
              description: 'Todo description'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              default: 'medium',
              description: 'Todo priority level'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of tags for the todo'
            },
            completed: {
              type: 'boolean',
              default: false,
              description: 'Todo completion status'
            },
            userId: {
              type: 'string',
              description: 'ID of the user who owns this todo'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Todo creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Todo last update timestamp'
            }
          }
        },
        OAuthClient: {
          type: 'object',
          required: ['name', 'clientId', 'clientSecret'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the OAuth client'
            },
            name: {
              type: 'string',
              description: 'Client application name'
            },
            clientId: {
              type: 'string',
              description: 'OAuth client ID'
            },
            clientSecret: {
              type: 'string',
              description: 'OAuth client secret'
            },
            redirectUris: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of redirect URIs'
            },
            grants: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['password', 'refresh_token', 'authorization_code']
              },
              description: 'Supported grant types'
            },
            active: {
              type: 'boolean',
              description: 'Whether the client is active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Client creation timestamp'
            }
          }
        },
        TokenResponse: {
          type: 'object',
          properties: {
            access_token: {
              type: 'string',
              description: 'OAuth2 access token'
            },
            token_type: {
              type: 'string',
              example: 'Bearer',
              description: 'Token type'
            },
            expires_in: {
              type: 'integer',
              description: 'Token expiration time in seconds'
            },
            refresh_token: {
              type: 'string',
              description: 'OAuth2 refresh token'
            },
            scope: {
              type: 'string',
              description: 'Granted scopes'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'string',
              description: 'Additional error details'
            }
          }
        }
      }
    }
  },
  apis: ['./server/routes/*.js']
};

const specs = swaggerJsdoc(swaggerOptions);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Todo API Documentation'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Todo API Server',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
    endpoints: {
      auth: '/api/auth',
      todos: '/api/todos'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api-docs',
      'POST /api/auth/token',
      'POST /api/auth/clients',
      'GET /api/auth/clients',
      'DELETE /api/auth/clients/:id',
      'POST /api/auth/revoke',
      'GET /api/todos',
      'GET /api/todos/:id',
      'POST /api/todos',
      'PUT /api/todos/:id',
      'DELETE /api/todos/:id',
      'PATCH /api/todos/:id/toggle'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Todo API Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔐 OAuth Endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`📝 Todo Endpoints: http://localhost:${PORT}/api/todos`);
});

module.exports = app;
