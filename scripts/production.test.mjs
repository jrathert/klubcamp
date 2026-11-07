import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, cp, writeFile, readFile, readdir, chmod, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

async function fixture(t) {
  const directory = await mkdtemp(path.join(tmpdir(), 'klubcamp-production-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const app = path.join(directory, 'app');
  await mkdir(path.join(app, 'backend/dist'), { recursive: true });
  await writeFile(path.join(app, 'package.json'), '{"type":"module"}');
  for (const name of ['app.js', 'runtime.js', 'check-db.js', 'check-smtp.js']) {
    await cp(new URL(`../deployment/${name}`, import.meta.url), path.join(app, name));
  }
  const config = path.join(directory, 'production.env');
  const env = { ...process.env };
  for (const key of ['NODE_ENV', 'HOST', 'PORT', 'PRODUCTION_TEST_VALUE']) delete env[key];
  return {
    app, config,
    configure: (text = 'NODE_ENV=production\nHOST=127.0.0.1\nPORT=3000\nPRODUCTION_TEST_VALUE=file\n') =>
      writeFile(config, text, { mode: 0o600 }),
    module: (entry, source) => writeFile(path.join(app, `backend/dist/${entry}.js`), source),
    run: (entry = 'app.js', args = [], overrides = {}) => spawnSync(process.execPath, [path.join(app, entry), ...args], {
      cwd: directory, env: { ...env, ...overrides }, encoding: 'utf8', timeout: 5000,
    }),
  };
}

test('loads file relative to launcher before import, honors environment precedence, reloads after restart', async (t) => {
  const f = await fixture(t);
  await f.configure();
  await f.module('server', 'console.log(process.env.PRODUCTION_TEST_VALUE)');
  assert.equal(f.run().stdout.trim(), 'file');
  assert.equal(f.run('app.js', [], { PRODUCTION_TEST_VALUE: 'existing' }).stdout.trim(), 'existing');
  await f.configure('NODE_ENV=production\nHOST=127.0.0.1\nPORT=3000\nPRODUCTION_TEST_VALUE=edited\n');
  assert.equal(f.run().stdout.trim(), 'edited');
});

test('missing/private-file permissions and non-production mode fail before backend import', async (t) => {
  const f = await fixture(t);
  await f.module('server', 'console.log("BACKEND_EXECUTED")');
  assert.equal(f.run().status, 1);
  await f.configure();
  await chmod(f.config, 0o644);
  assert.equal(f.run().status, 1);
  await chmod(f.config, 0o600);
  await f.configure('NODE_ENV=development\nPRODUCTION_TEST_VALUE=secret-canary\n');
  const result = f.run();
  assert.equal(result.status, 1);
  assert.doesNotMatch(result.stdout + result.stderr, /secret-canary|BACKEND_EXECUTED/);
});

test('production server requires explicit listener settings', async (t) => {
  const f = await fixture(t);
  await f.configure('NODE_ENV=production\n');
  assert.equal(f.run().status, 1);
});

test('checks are opt-in and preserve SMTP recipient arguments', async (t) => {
  const f = await fixture(t);
  await f.configure();
  await f.module('server', 'console.log("SERVER_ONLY")');
  await f.module('check-db', 'console.log("DB_ONLY")');
  await f.module('check-smtp', 'console.log(process.argv.slice(2).join(","))');
  assert.equal(f.run().stdout.trim(), 'SERVER_ONLY');
  assert.equal(f.run('check-db.js').stdout.trim(), 'DB_ONLY');
  assert.equal(f.run('check-smtp.js', ['authorized@example.test']).stdout.trim(), 'authorized@example.test');
});

test('import errors are sanitized', async (t) => {
  const f = await fixture(t);
  await f.configure();
  await f.module('server', 'throw new Error("secret-canary")');
  const result = f.run();
  assert.equal(result.status, 1);
  assert.doesNotMatch(result.stderr, /secret-canary/);
});

test('packaging allowlist excludes private/development files and preserves sibling configuration', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'klubcamp-package-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const directory of ['scripts', 'deployment', 'backend/dist', 'frontend/dist', 'release/klubcamp']) {
    await mkdir(path.join(root, directory), { recursive: true });
  }
  await cp(new URL('./package-production.mjs', import.meta.url), path.join(root, 'scripts/package-production.mjs'));
  await cp(new URL('../deployment/', import.meta.url), path.join(root, 'deployment'), { recursive: true });
  await writeFile(path.join(root, 'package.json'), '{"type":"module","scripts":{"dev":"unused"}}');
  await writeFile(path.join(root, 'package-lock.json'), '{}');
  for (const name of ['app', 'server', 'check-db', 'check-smtp', 'check-support', 'smtp-config', 'stale.test']) {
    await writeFile(path.join(root, `backend/dist/${name}.js`), '// fixture');
  }
  await writeFile(path.join(root, 'frontend/dist/index.html'), '<html></html>');
  await writeFile(path.join(root, '.env'), 'SECRET=not-for-deployment');
  const config = path.join(root, 'release/klubcamp/production.env');
  await writeFile(config, 'KEEP=private');
  const run = () => spawnSync(process.execPath, [path.join(root, 'scripts/package-production.mjs')], { encoding: 'utf8' });
  assert.equal(run().status, 0);
  assert.equal(run().status, 0);
  const app = path.join(root, 'release/klubcamp/app');
  assert.deepEqual((await readdir(app)).sort(), [
    '.klubcamp-artifact', 'app.js', 'backend', 'check-db.js', 'check-smtp.js',
    'frontend', 'package-lock.json', 'package.json', 'runtime.js',
  ]);
  assert.equal((await readdir(path.join(app, 'backend/dist'))).includes('stale.test.js'), false);
  assert.equal(await readFile(config, 'utf8'), 'KEEP=private');
  assert.equal(JSON.parse(await readFile(path.join(app, 'package.json'), 'utf8')).scripts['check:db'], 'node check-db.js');
  await rm(path.join(app, '.klubcamp-artifact'));
  assert.notEqual(run().status, 0);
  assert.equal(await readFile(path.join(app, 'app.js'), 'utf8'), await readFile(new URL('../deployment/app.js', import.meta.url), 'utf8'));
  await rm(app, { recursive: true });
  await symlink(path.join(root, 'deployment'), app);
  assert.notEqual(run().status, 0);
  assert.equal(await readFile(config, 'utf8'), 'KEEP=private');
});
