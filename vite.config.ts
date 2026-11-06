// Configure frontend development, the local API proxy, and production static-file output.
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Build settings for the selected mode, reading the backend port without exposing its secrets.
export default defineConfig(({ mode }) => ({
  root: 'frontend',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    proxy: { '/api': `http://127.0.0.1:${process.env.PORT ?? loadEnv(mode, process.cwd(), 'PORT').PORT ?? '3000'}` },
  },
  build: { outDir: 'dist', emptyOutDir: true },
}));
