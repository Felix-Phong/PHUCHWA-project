const swaggerJSdoc = require('swagger-jsdoc');

const PORT = process.env.PORT || 3030; // Default port if not set in environment variables
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Docs',
      version: '1.0.0'
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api`
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT' // Optional, just for documentation purposes
        }
      }
    },
    security: [
      {
        bearerAuth: [] // Apply Bearer Token globally
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpecs = swaggerJSdoc(options);
module.exports = swaggerSpecs;