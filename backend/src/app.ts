// Define HTTP routes separately from the listening server so tests can use the app directly.
import express from 'express';
import { fileURLToPath } from 'node:url';
import { productApi, productErrorHandler, type ProductServices } from './product-api.js';

const frontendDirectory = fileURLToPath(new URL('../../frontend/dist/', import.meta.url));

// Create a fresh Express application without starting a network listener.
export function createApp(services: ProductServices = {}) {
  const app = express();
  app.disable('x-powered-by');
  // Only the loopback provider connection may supply HTTPS forwarding information.
  app.set('trust proxy', 'loopback');
  app.use((_req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'no-referrer');
    res.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    next();
  });
  // Report application responsiveness without querying the database or mail service.
  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
  });
  app.use('/api', productApi(services));
  app.use('/api', productErrorHandler);
  // Handle unmatched API requests before the frontend fallback can return HTML.
  app.use('/api', (_request, response) => {
    response.status(404).json({ error: 'Not found' });
  });
  app.use(express.static(frontendDirectory));
  // Return the SPA entry page for non-API GET requests not matched by static files.
  app.get('/{*path}', (_request, response) => {
    response.sendFile('index.html', { root: frontendDirectory });
  });
  return app;
}
