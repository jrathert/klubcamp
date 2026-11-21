// Explicit, MUTATING integration check. Never part of npm test or ordinary startup.
// Requires a fresh, disposable database whose name ends in _test; no reset/drop is performed.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { openDatabase } from '../backend/dist/database.js';
import { eventRepository } from '../backend/dist/event-repository.js';
import { MariaSessionStore } from '../backend/dist/session-store.js';

if (process.env.DB_TEST_CONFIRM !== 'isolated-disposable' || !process.env.DB_NAME?.endsWith('_test') || process.env.DB_HOST !== '127.0.0.1') {
  throw new Error('Explicit isolated loopback test database configuration required');
}
let database = openDatabase();
try {
  const [tables] = await database.pool.query('SHOW TABLES');
  assert.equal(tables.length, 0, 'A fresh empty database is required; existing data is never reset');
  for (let run = 0; run < 2; run++) {
    const migrated = spawnSync(process.execPath, ['backend/dist/migrate.js'], { encoding: 'utf8', timeout: 20000 });
    assert.equal(migrated.status, 0, 'Migration must succeed, including a second no-op invocation');
  }
  const input = { name: 'Testcamp 🏑', description: 'Nur synthetische Daten', startDate: '2027-07-12', endDate: '2027-07-16',
    ageGroups: ['mU10', 'wU10'], capacity: 30, minimumParticipants: 10, registrationDeadline: '2027-06-28' };
  let repository = eventRepository(database.db);
  const submission = randomUUID();
  const owner = `${randomUUID()}:${randomUUID()}`;
  const concurrent = await Promise.all(Array.from({ length: 8 }, () => repository.publish(input, submission, owner)));
  assert.ok(concurrent.every(row => row.id === concurrent[0].id));
  assert.equal((await repository.list()).length, 1);
  await assert.rejects(repository.publish({ ...input, minimumParticipants: 11 }, submission, owner));
  assert.deepEqual(concurrent[0], { ...input, id: concurrent[0].id, cancelled: false });
  await assert.rejects(repository.publish({ ...input, name: 'Changed' }, submission, owner));
  await assert.rejects(repository.publish(input, submission, 'another-owner'));

  const sid = randomUUID();
  const sessionData = { cookie: { expires: new Date(Date.now() + 3600000), httpOnly: true, sameSite: 'lax', secure: true },
    identity: { tenantId: owner.split(':')[0], userId: owner.split(':')[1] }, csrf: 'synthetic-csrf' };
  let store = new MariaSessionStore(database.db);
  await new Promise((resolve, reject) => store.set(sid, sessionData, error => error ? reject(error) : resolve()));
  const [stored] = await database.pool.query('SELECT id, data FROM sessions');
  assert.equal(stored.length, 1);
  assert.notEqual(stored[0].id, sid, 'Only a hash of the bearer session ID may be persisted');

  // Closing/reopening all application DB services models process restart persistence.
  await database.pool.end();
  database = openDatabase();
  repository = eventRepository(database.db);
  store = new MariaSessionStore(database.db);
  assert.deepEqual(await repository.find(concurrent[0].id), concurrent[0]);
  const restored = await new Promise((resolve, reject) => store.get(sid, (error, data) => error ? reject(error) : resolve(data)));
  assert.deepEqual(restored.identity, sessionData.identity);
  assert.equal(restored.csrf, sessionData.csrf);
  await new Promise((resolve, reject) => store.destroy(sid, error => error ? reject(error) : resolve()));
  assert.equal(await new Promise((resolve, reject) => store.get(sid, (error, data) => error ? reject(error) : resolve(data))), null);

  const cancelled = await repository.cancel(concurrent[0].id);
  assert.deepEqual(cancelled, { ...concurrent[0], cancelled: true });
  assert.deepEqual(await repository.publish(input, submission, owner), cancelled);
  assert.equal((await repository.list()).length, 1);
  const noMinimum = await repository.publish({ ...input, name: 'Ohne Mindestteilnehmerzahl', minimumParticipants: null, capacity: null }, randomUUID(), owner);
  assert.equal(noMinimum.minimumParticipants, null);
  assert.equal((await repository.find(noMinimum.id)).minimumParticipants, null);
  const [metadata] = await database.pool.query('SELECT VERSION() AS version, @@character_set_connection AS charset, @@collation_connection AS collation, @@sql_mode AS sqlMode, @@time_zone AS timeZone');
  console.log('Isolated database validation passed:', JSON.stringify(metadata[0]));
} finally { await database.pool.end(); }
