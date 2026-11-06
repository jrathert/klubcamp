// Run backend tests in Node and frontend tests in jsdom, which simulates browser DOM APIs.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      { test: { name: 'backend', environment: 'node', include: ['backend/src/**/*.test.ts'] } },
      { test: { name: 'frontend', environment: 'jsdom', include: ['frontend/src/**/*.test.tsx'] } },
    ],
  },
});
