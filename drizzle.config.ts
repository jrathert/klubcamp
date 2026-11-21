import { defineConfig } from 'drizzle-kit';

// Generation is offline. Applying migrations is a separate, explicit operation.
export default defineConfig({ dialect: 'mysql', schema: './backend/src/schema.ts', out: './backend/migrations' });
