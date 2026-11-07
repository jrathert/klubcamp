// Shared production-only bootstrap. Local development keeps its existing configuration loading.
import { loadEnvFile } from 'node:process';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export async function launch(entry) {
  try {
    const config = fileURLToPath(new URL('../production.env', import.meta.url));
    const info = statSync(config);
    if (!info.isFile() || (info.mode & 0o077) !== 0) throw new Error('Private file required');
    loadEnvFile(config);
    if (process.env.NODE_ENV !== 'production') throw new Error('Production mode required');
    // Require an intentional listener choice, rather than silently using development defaults.
    if (entry === 'server' && (!process.env.HOST || !process.env.PORT)) {
      throw new Error('Listener settings required');
    }
  } catch {
    console.error('Production configuration failed. Check the private file, permissions, and required settings.');
    process.exitCode = 1;
    return;
  }
  try {
    await import(`./backend/dist/${entry}.js`);
  } catch {
    console.error('Production command failed. Check deployment files and configuration.');
    process.exitCode = 1;
  }
}
