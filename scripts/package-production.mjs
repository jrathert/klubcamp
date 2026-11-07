// Package only explicit runtime files; never copy local configuration or node_modules.
import { cp, mkdir, readFile, readdir, lstat, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'release/klubcamp/app');
const marker = '.klubcamp-artifact';
// Do not follow user-created links while replacing generated output.
for (const relative of ['release', 'release/klubcamp']) {
  try {
    const info = await lstat(path.join(root, relative));
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('Unsafe output parent');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
try {
  const info = await lstat(output);
  if (!info.isDirectory() || info.isSymbolicLink() ||
      await readFile(path.join(output, marker), 'utf8') !== 'Generated Klubcamp application\n') {
    throw new Error('Refusing to replace an unrecognized output directory');
  }
  // Only this generated app subtree is replaceable; sibling configuration/logs are preserved.
  await rm(output, { recursive: true });
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  // An existing app directory without a marker is not ours to delete.
  try {
    await lstat(output);
    throw new Error('Refusing to replace an unrecognized output directory');
  } catch (missing) {
    if (missing.code !== 'ENOENT') throw missing;
  }
}

await mkdir(path.join(output, 'backend/dist'), { recursive: true });
await writeFile(path.join(output, marker), 'Generated Klubcamp application\n');
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
// Keep dependency declarations unchanged so the original lockfile supports npm ci --omit=dev.
manifest.scripts = {
  start: 'node app.js',
  'check:db': 'node check-db.js',
  'check:smtp': 'node check-smtp.js',
};
await writeFile(path.join(output, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
await cp(path.join(root, 'package-lock.json'), path.join(output, 'package-lock.json'));
for (const file of ['app.js', 'runtime.js', 'check-db.js', 'check-smtp.js']) {
  await cp(path.join(root, 'deployment', file), path.join(output, file));
}
for (const file of ['app.js', 'server.js', 'check-db.js', 'check-smtp.js', 'check-support.js', 'smtp-config.js']) {
  await cp(path.join(root, 'backend/dist', file), path.join(output, 'backend/dist', file));
}
// Vite's build owns this directory; reject links and unexpected private files before copying.
async function validateFrontend(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    if (item.isSymbolicLink() || item.name.startsWith('.') || item.name.endsWith('.env') || item.name.endsWith('.log')) {
      throw new Error('Unexpected file in frontend build');
    }
    if (item.isDirectory()) await validateFrontend(path.join(directory, item.name));
  }
}
await validateFrontend(path.join(root, 'frontend/dist'));
await cp(path.join(root, 'frontend/dist'), path.join(output, 'frontend/dist'), { recursive: true });
console.log('Production package created: release/klubcamp/app (no configuration or dependencies included).');
