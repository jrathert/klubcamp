// Exercise the HTTP contract without requiring MariaDB, SMTP, or a deployed server.
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';

// Group the bootstrap API tests in the test runner's output.
describe('bootstrap API', () => {
  // Verify the exact public health response, including its status and content type.
  it('returns only the documented responsiveness response', async () => {
    const response = await request(createApp()).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toEqual({ status: 'ok' });
  });

  // Repeat the same JSON error assertions for several unmatched API paths.
  it.each(['/api', '/api/missing', '/api/missing/nested'])('returns JSON 404 for %s', async (path) => {
    const response = await request(createApp()).get(path);
    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toEqual({ error: 'Not found' });
  });

  // Confirm that POST requests cannot trigger infrastructure checks or write to health.
  it('does not expose infrastructure checks or accept health writes', async () => {
    for (const path of ['/api/check-db', '/api/check-smtp', '/api/health']) {
      const response = await request(createApp()).post(path);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Not found' });
    }
  });
});
