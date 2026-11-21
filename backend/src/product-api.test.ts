import request from 'supertest';
import session from 'express-session';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHmac, randomUUID } from 'node:crypto';
import { createApp } from './app.js';
import { missingLoginSessionReason, readAuthSettings, safeAuthErrorCode, type Identity, type IdentityProvider } from './auth.js';
import { SubmissionConflict, type EventRepository, type PublishedEvent } from './events.js';

const tenantId = '11111111-1111-1111-1111-111111111111';
const userId = '22222222-2222-2222-2222-222222222222';
const otherUser = '33333333-3333-3333-3333-333333333333';
const input = { name: 'Sommercamp', description: '<script>alert(1)</script>', startDate: '2027-07-12', endDate: '2027-07-16',
  ageGroups: ['mU10'], capacity: null, minimumParticipants: 10, registrationDeadline: '2027-06-28' };
const env = { ENTRA_TENANT_ID: tenantId, ENTRA_CLIENT_ID: otherUser, ENTRA_CLIENT_SECRET: 'private-client-secret',
  SESSION_SECRET: 'x'.repeat(64), APP_ORIGIN: 'http://localhost:5173', STAFF_ALLOWLIST: `${tenantId}:${userId}` };

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
});
afterEach(() => { vi.restoreAllMocks(); });

function fixture(identity: Identity = { tenantId, userId }, secure = false) {
  const rows = new Map<string, { event: PublishedEvent; payload: string; owner: string }>();
  const events: EventRepository = {
    async list() { return [...rows.values()].map(row => row.event); },
    async find(id) { return [...rows.values()].find(row => row.event.id === id)?.event; },
    async publish(event, key, owner) {
      const existing = rows.get(key);
      if (existing) {
        if (existing.payload !== JSON.stringify(event) || existing.owner !== owner) throw new SubmissionConflict();
        return existing.event;
      }
      const published = { ...event, id: randomUUID(), cancelled: false };
      rows.set(key, { event: published, payload: JSON.stringify(event), owner });
      return published;
    },
    async cancel(id) {
      const row = [...rows.values()].find(row => row.event.id === id);
      if (row) row.event = { ...row.event, cancelled: true };
      return row?.event;
    },
  };
  // The test boundary is the identity-provider adapter; live token validation is separate.
  const provider: IdentityProvider = {
    async begin() { return { url: 'https://login.microsoftonline.com/test', attempt: { state: 'state', verifier: 'verifier', nonce: 'nonce', created: Date.now() } }; },
    async finish(url, attempt) {
      if (url.searchParams.get('state') !== attempt.state || url.searchParams.get('code') !== 'valid') throw new Error('Invalid callback');
      return identity;
    },
  };
  const settings = readAuthSettings({ ...env, APP_ORIGIN: secure ? 'https://camps.example.test' : env.APP_ORIGIN })!;
  const store = new session.MemoryStore();
  const app = createApp({ events, auth: { settings, provider, store } });
  const agent = request.agent(app);
  async function login() {
    await agent.get('/api/auth/login').expect(302);
    await agent.get('/api/auth/callback?state=state&code=valid').expect(302);
    return (await agent.get('/api/auth/session')).body.csrfToken as string;
  }
  return { app, agent, login, settings, provider, store };
}

describe('staff access and public API', () => {
  it('distinguishes a missing login cookie from an identity-provider failure without leaking errors', async () => {
    const { agent, provider } = fixture();
    await agent.get('/api/auth/callback?code=secret-callback-code').expect(403);
    expect(console.warn).toHaveBeenCalledWith('Staff sign-in session: NO_COOKIE');
    expect(console.warn).toHaveBeenLastCalledWith('Staff sign-in failed: AUTH_LOGIN_MISSING; reason=UNCLASSIFIED');
    await agent.get('/api/auth/login').expect(302);
    vi.spyOn(provider, 'finish').mockRejectedValue(Object.assign(new Error('secret-token-response'), {
      code: 'OAUTH_RESPONSE_BODY_ERROR', error: 'invalid_client', error_description: 'private-client-secret',
      cause: { token: 'secret-token', url: 'secret-callback-url' },
    }));
    const response = await agent.get('/api/auth/callback?state=state&code=valid').expect(403);
    expect(console.warn).toHaveBeenLastCalledWith('Staff sign-in failed: AUTH_OIDC_RESPONSE; reason=OAUTH_RESPONSE_BODY_ERROR/invalid_client');
    const output = JSON.stringify(vi.mocked(console.warn).mock.calls) + response.text;
    expect(output).not.toMatch(/secret-token|private-client-secret|secret-callback/);
    expect((await agent.get('/api/auth/session')).body.authenticated).toBe(false);
  });
  it('reports a saved login and emitted cookie without printing either value', async () => {
    const { agent } = fixture();
    const response = await agent.get('/api/auth/login').expect(302);
    expect(console.info).toHaveBeenLastCalledWith('Staff sign-in started: session=SAVED; cookie=SET; transport=HTTP');
    const logs = JSON.stringify(vi.mocked(console.info).mock.calls);
    expect(logs).not.toContain(response.headers['set-cookie'][0].split(';')[0]);
    expect(logs).not.toMatch(/private-client-secret|verifier|nonce|state|https:/);
  });
  it('distinguishes a lost database session from a missing browser cookie', async () => {
    const { agent, store } = fixture();
    await agent.get('/api/auth/login').expect(302);
    await new Promise<void>((resolve, reject) => store.clear(error => error ? reject(error) : resolve()));
    await agent.get('/api/auth/callback?code=secret-callback-code').expect(403);
    expect(console.warn).toHaveBeenCalledWith('Staff sign-in session: SESSION_NOT_FOUND');
    expect(JSON.stringify(vi.mocked(console.warn).mock.calls)).not.toContain('secret-callback-code');
  });
  it('reports invalid cookie signatures without accepting the callback', async () => {
    const { app, agent } = fixture();
    const start = await agent.get('/api/auth/login').expect(302);
    const cookie = start.headers['set-cookie'][0].split(';')[0] + 'tampered';
    await request(app).get('/api/auth/callback?code=secret-callback-code').set('Cookie', cookie).expect(403);
    expect(console.warn).toHaveBeenCalledWith('Staff sign-in session: INVALID_COOKIE');
    expect(JSON.stringify(vi.mocked(console.warn).mock.calls)).not.toContain(cookie);
  });
  it('keeps public browsing anonymous and rejects anonymous staff operations', async () => {
    const { app } = fixture();
    expect((await request(app).get('/api/events')).body).toEqual([]);
    await request(app).post('/api/staff/events').send({ event: input, submissionId: randomUUID() }).expect(401);
    await request(app).post(`/api/staff/events/${randomUUID()}/cancel`).send({ confirmed: true }).expect(401);
    await request(app).get('/api/auth/callback?state=state&code=valid').expect(403);
  });
  it.each([{ tenantId, userId: otherUser }, { tenantId: otherUser, userId }])('denies identity %j', async identity => {
    const { agent } = fixture(identity);
    await agent.get('/api/auth/login').expect(302);
    await agent.get('/api/auth/callback?state=state&code=valid').expect(403);
    expect(console.warn).toHaveBeenLastCalledWith(`Staff sign-in failed: ${identity.tenantId === tenantId ? 'AUTH_USER_DENIED' : 'AUTH_TENANT_DENIED'}; reason=UNCLASSIFIED`);
    expect((await agent.get('/api/auth/session')).body.authenticated).toBe(false);
  });
  it('rejects altered and replayed callbacks and rotates the login session', async () => {
    const { agent } = fixture();
    const start = await agent.get('/api/auth/login');
    await agent.get('/api/auth/callback?state=wrong&code=valid').expect(403);
    await agent.get('/api/auth/callback?state=state&code=valid').expect(403);
    await agent.get('/api/auth/login');
    const callback = await agent.get('/api/auth/callback?state=state&code=valid').expect(302);
    expect(callback.headers['set-cookie'][0]).not.toBe(start.headers['set-cookie'][0]);
    expect(callback.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(callback.headers['set-cookie'][0]).toContain('SameSite=Lax');
  });
  it('emits Secure cookies only for trusted HTTPS requests', async () => {
    const { app } = fixture(undefined, true);
    const plaintext = await request(app).get('/api/auth/login');
    expect(plaintext.headers['set-cookie']).toBeUndefined();
    expect(console.info).toHaveBeenLastCalledWith('Staff sign-in started: session=SAVED; cookie=NOT_SET; transport=HTTP');
    const https = await request(app).get('/api/auth/login').set('X-Forwarded-Proto', 'https');
    expect(https.headers['set-cookie'][0]).toContain('Secure');
    expect(https.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(https.headers['set-cookie'][0]).not.toContain('Domain=');
    expect(console.info).toHaveBeenLastCalledWith('Staff sign-in started: session=SAVED; cookie=SET; transport=HTTPS');
  });
  it('rejects expired login attempts and the absolute eight-hour session limit', async () => {
    const { agent, login } = fixture();
    await agent.get('/api/auth/login');
    let clock = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 11 * 60 * 1000);
    try { await agent.get('/api/auth/callback?state=state&code=valid').expect(403); } finally { clock.mockRestore(); }
    const token = await login();
    clock = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 9 * 60 * 60 * 1000);
    try {
      expect((await agent.get('/api/auth/session')).body.authenticated).toBe(false);
      await agent.post('/api/staff/events').set('Origin', env.APP_ORIGIN).set('X-CSRF-Token', token)
        .send({ submissionId: randomUUID(), event: input }).expect(401);
    } finally { clock.mockRestore(); }
  });
  it('rechecks the allowlist on every protected request', async () => {
    const { agent, login, settings } = fixture();
    const token = await login();
    settings.allowedUsers.clear();
    expect((await agent.get('/api/auth/session')).body.authenticated).toBe(false);
    await agent.post('/api/staff/events').set('Origin', env.APP_ORIGIN).set('X-CSRF-Token', token)
      .send({ submissionId: randomUUID(), event: input }).expect(401);
  });
  it('requires origin, CSRF and JSON; publishes once and preserves cancelled events', async () => {
    const { agent, app, login } = fixture();
    const token = await login();
    const body = { submissionId: randomUUID(), event: input };
    await agent.post('/api/staff/events').send(body).expect(403);
    await agent.post('/api/staff/events').set('Origin', 'http://evil.test').set('X-CSRF-Token', token).send(body).expect(403);
    await agent.post('/api/staff/events').set('Origin', env.APP_ORIGIN).set('X-CSRF-Token', 'é'.repeat(64)).send(body).expect(403);
    await agent.post('/api/staff/events').set('Origin', env.APP_ORIGIN).set('X-CSRF-Token', token).type('form').send({ name: 'Camp' }).expect(403);
    const publish = () => agent.post('/api/staff/events').set('Origin', env.APP_ORIGIN).set('X-CSRF-Token', token).send(body);
    const first = await publish().expect(201);
    expect(first.body.minimumParticipants).toBe(10);
    expect((await publish().expect(201)).body.id).toBe(first.body.id);
    await agent.post('/api/staff/events').set('Origin', env.APP_ORIGIN).set('X-CSRF-Token', token)
      .send({ ...body, event: { ...input, name: 'Changed' } }).expect(409);
    const list = await request(app).get('/api/events');
    expect(list.body).toHaveLength(1);
    expect(JSON.stringify(list.body)).not.toMatch(/submissionId|owner|private-client-secret|csrfToken/);
    expect((await request(app).get(`/api/events/${first.body.id}`)).body).toEqual(first.body);
    for (const method of ['put', 'patch', 'delete'] as const) {
      await agent[method](`/api/staff/events/${first.body.id}`).expect(404);
    }
    await agent.post(`/api/staff/events/${first.body.id}/cancel`).set('Origin', env.APP_ORIGIN).set('X-CSRF-Token', token).send({}).expect(400);
    const cancelled = await agent.post(`/api/staff/events/${first.body.id}/cancel`).set('Origin', env.APP_ORIGIN).set('X-CSRF-Token', token).send({ confirmed: true }).expect(200);
    expect(cancelled.body).toEqual({ ...first.body, cancelled: true });
    expect((await request(app).get('/api/events')).body).toEqual([cancelled.body]);
  });
  it('invalidates the old server session on sign-out', async () => {
    const { agent, app, login } = fixture();
    const token = await login();
    // Sign in again to capture the authenticated session cookie for a replay attempt.
    await agent.get('/api/auth/login');
    const callback = await agent.get('/api/auth/callback?state=state&code=valid');
    const cookie = callback.headers['set-cookie'][0].split(';')[0];
    const currentToken = (await agent.get('/api/auth/session')).body.csrfToken;
    await agent.post('/api/auth/logout').set('Origin', env.APP_ORIGIN).set('X-CSRF-Token', currentToken).send({}).expect(200);
    expect((await agent.get('/api/auth/session')).body.authenticated).toBe(false);
    await request(app).post('/api/staff/events').set('Cookie', cookie).set('Origin', env.APP_ORIGIN).set('X-CSRF-Token', token)
      .send({ submissionId: randomUUID(), event: input }).expect(401);
  });
  it('rejects malformed payloads and never returns raw errors', async () => {
    const { agent, login } = fixture();
    const token = await login();
    for (const body of [{ submissionId: 'bad', event: input }, { submissionId: randomUUID(), event: { ...input, ageGroups: [] } },
      { submissionId: randomUUID(), event: { ...input, minimumParticipants: 20, capacity: 10 } }]) {
      await agent.post('/api/staff/events').set('Origin', env.APP_ORIGIN).set('X-CSRF-Token', token).send(body).expect(400);
    }
    await agent.post('/api/staff/events').set('Origin', env.APP_ORIGIN).set('X-CSRF-Token', token).set('Content-Type', 'application/json').send('{').expect(400);
  });
  it('sanitizes repository failures without returning driver diagnostics', async () => {
    const app = createApp({ events: { async list() { throw new Error('private-driver-secret'); } } as unknown as EventRepository });
    const response = await request(app).get('/api/events').expect(503);
    expect(response.body.error).toBe('Die Anfrage konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.');
    expect(response.text).not.toContain('private-driver-secret');
  });
});

describe('authentication configuration', () => {
  it('classifies missing-attempt sessions using fixed categories only', () => {
    const id = 'private-session-id';
    const signature = createHmac('sha256', env.SESSION_SECRET).update(id).digest('base64').replace(/=+$/, '');
    const cookie = `klubcamp.sid=${encodeURIComponent(`s:${id}.${signature}`)}`;
    const classify = (value: string | undefined, sessionID = id, secret = env.SESSION_SECRET) =>
      missingLoginSessionReason({ headers: { cookie: value }, sessionID }, secret);
    expect(classify(undefined)).toBe('NO_COOKIE');
    expect(classify('other=private-cookie')).toBe('NO_COOKIE');
    expect(classify(`${cookie}; ${cookie}`)).toBe('MULTIPLE_COOKIES');
    expect(classify('klubcamp.sid=%broken')).toBe('INVALID_COOKIE');
    expect(classify('klubcamp.sid=private-cookie')).toBe('INVALID_COOKIE');
    expect(classify(cookie, id, 'changed-private-secret')).toBe('INVALID_COOKIE');
    expect(classify(cookie, 'new-session-id')).toBe('SESSION_NOT_FOUND');
    expect(classify(cookie)).toBe('SESSION_WITHOUT_LOGIN');
  });
  it('never echoes unknown error codes, objects, descriptions or causes', () => {
    expect(safeAuthErrorCode(Object.assign(new Error('secret'), { code: 'secret-code', error: 'secret-error', cause: 'secret-cause' }))).toBe('UNCLASSIFIED');
    expect(safeAuthErrorCode({ code: 'secret-code' })).toBe('UNCLASSIFIED');
  });
  it('permits an unconfigured bootstrap but rejects incomplete or unsafe setup', () => {
    expect(readAuthSettings({})).toBeUndefined();
    for (const patch of [{ STAFF_ALLOWLIST: 'someone@example.org' }, { SESSION_SECRET: 'short' },
      { APP_ORIGIN: 'http://example.org' }, { APP_ORIGIN: 'http://localhost:5173', NODE_ENV: 'production' },
      { APP_ORIGIN: 'https://example.org/' }, { ENTRA_CLIENT_SECRET: '' }]) {
      expect(() => readAuthSettings({ ...env, ...patch })).toThrow();
    }
    expect(readAuthSettings({ ...env, APP_ORIGIN: 'https://camps.example.test', NODE_ENV: 'production' })?.secure).toBe(true);
  });
});
