// Define HTTP routes separately from the listening server so tests can use the app directly.
import express from 'express';
import { fileURLToPath } from 'node:url';

const frontendDirectory = fileURLToPath(new URL('../../frontend/dist/', import.meta.url));

// Create a fresh Express application without starting a network listener.
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  // Report application responsiveness without querying the database or mail service.
  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
  });
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
