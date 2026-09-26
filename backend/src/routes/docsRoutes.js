import express from 'express';

const router = express.Router();

const openAPISpec = {
  openapi: '3.0.0',
  info: {
    title: 'MarketLink REST API Documentation',
    version: '1.0.0',
    description: 'Complete API documentation for MarketLink - Farm Fresh Just a Click Away (TechWiz 7 SRS v1.0).'
  },
  servers: [
    { url: '/api', description: 'Current Server' }
  ],
  paths: {
    '/auth/login': {
      post: {
        summary: 'User Authentication Login',
        description: 'Authenticates Customer, Farmer, or Admin user and returns JWT Token.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'customer1@marketlink.com' },
                  password: { type: 'string', example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'JWT Token and user object returned successfully' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/markets': {
      get: {
        summary: 'List Farmers Markets',
        description: 'Retrieves all active Farmers Markets with geolocation map pins and farmer counts.',
        responses: { 200: { description: 'Array of markets' } }
      }
    },
    '/products': {
      get: {
        summary: 'Filter Fresh Harvest Products',
        description: 'Search & filter produce by category, price, market day, stock status.',
        responses: { 200: { description: 'Array of products with rating and farmer stall details' } }
      }
    },
    '/orders': {
      post: {
        summary: 'Place Pre-Order for Pickup',
        description: 'Submits a pre-order with selected pickup date and time window.',
        responses: { 201: { description: 'Order created with status placed' } }
      }
    },
    '/ai/chat': {
      post: {
        summary: 'Greenie AI Assistant Chatbot',
        description: 'Database-connected natural language query engine supporting English and Roman Urdu.',
        responses: { 200: { description: 'AI assistant reply' } }
      }
    },
    '/ai/forecast': {
      get: {
        summary: 'AI Demand Forecast Engine',
        description: 'Calculates predicted demand ranges and recommended harvest quantities.',
        responses: { 200: { description: 'Product demand forecast array' } }
      }
    }
  }
};

router.get('/json', (req, res) => {
  res.json(openAPISpec);
});

// Serve clean HTML interactive API docs page
router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>MarketLink API Documentation</title>
        <meta charset="utf-8"/>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
        <style>body { margin: 0; padding: 0; font-family: sans-serif; }</style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"></script>
        <script>
          window.onload = function() {
            SwaggerUIBundle({
              url: '/api/docs/json',
              dom_id: '#swagger-ui',
            });
          };
        </script>
      </body>
    </html>
  `);
});

export default router;
