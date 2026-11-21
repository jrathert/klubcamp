import express from 'express';
import session from 'express-session';
import type { EventRepository } from './events.js';
import { InvalidEvent, SubmissionConflict, validateEvent } from './events.js';
import { allowed, csrfToken, protectMutation, protectStaff, sessionCookieName, safeAuthErrorCode, missingLoginSessionReason,
  type AuthSettings, type IdentityProvider } from './auth.js';

export interface ProductServices {
  events?: EventRepository;
  auth?: { settings: AuthSettings; provider: IdentityProvider; store: session.Store };
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function productApi(services: ProductServices) {
  const router = express.Router();
  router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  router.get('/events', async (_req, res) => {
    if (!services.events) { res.status(503).json({ error: 'Veranstaltungen sind derzeit nicht verfügbar.' }); return; }
    res.json(await services.events.list());
  });
  router.get('/events/:id', async (req, res) => {
    const event = uuid.test(req.params.id) ? await services.events?.find(req.params.id) : undefined;
    if (!event) { res.status(404).json({ error: 'Veranstaltung nicht gefunden.' }); return; }
    res.json(event);
  });
  if (!services.auth) {
    router.get('/auth/session', (_req, res) => res.json({ authenticated: false, available: false }));
    router.use(['/auth', '/staff'], (_req, res) => { res.status(503).json({ error: 'Der Personalzugang ist noch nicht eingerichtet.' }); });
    return router;
  }
  const { settings, provider, store } = services.auth;
  router.use(session({
    name: sessionCookieName, secret: settings.sessionSecret, store,
    resave: false, saveUninitialized: false,
    cookie: { secure: settings.secure, httpOnly: true, sameSite: 'lax', maxAge: 8 * 60 * 60 * 1000, path: '/' },
  }));
  router.get('/auth/login', async (req, res) => {
    const { url, attempt } = await provider.begin();
    await new Promise<void>((resolve, reject) => req.session.regenerate(error => error ? reject(error) : resolve()));
    req.session.login = attempt;
    req.session.cookie.maxAge = 10 * 60 * 1000;
    await new Promise<void>((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));
    res.once('finish', () => {
      const header = res.getHeader('set-cookie');
      const cookies = Array.isArray(header) ? header : typeof header === 'string' ? [header] : [];
      const emitted = cookies.some(value => value.startsWith(`${sessionCookieName}=`));
      console.info(`Staff sign-in started: session=SAVED; cookie=${emitted ? 'SET' : 'NOT_SET'}; transport=${req.secure ? 'HTTPS' : 'HTTP'}`);
    });
    res.redirect(url);
  });
  router.get('/auth/callback', async (req, res) => {
    const attempt = req.session.login;
    delete req.session.login;
    let stage = 'AUTH_LOGIN_CONSUME';
    try {
      // Persist one-time consumption before exchanging the authorization code.
      await new Promise<void>((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));
      if (!attempt) { stage = 'AUTH_LOGIN_MISSING'; throw new Error('Login unavailable'); }
      if (Date.now() - attempt.created > 10 * 60 * 1000) { stage = 'AUTH_LOGIN_EXPIRED'; throw new Error('Login expired'); }
      stage = 'AUTH_OIDC_RESPONSE';
      const identity = await provider.finish(new URL(req.originalUrl, settings.origin), attempt);
      stage = identity.tenantId !== settings.tenantId ? 'AUTH_TENANT_DENIED' : 'AUTH_USER_DENIED';
      if (!allowed(settings, identity)) throw new Error('Access denied');
      stage = 'AUTH_SESSION_ROTATE';
      await new Promise<void>((resolve, reject) => req.session.regenerate(error => error ? reject(error) : resolve()));
      req.session.identity = identity;
      req.session.authenticatedAt = Date.now();
      req.session.csrf = csrfToken();
      req.session.cookie.maxAge = 8 * 60 * 60 * 1000;
      stage = 'AUTH_SESSION_SAVE';
      await new Promise<void>((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));
      res.redirect('/');
    } catch (error) {
      if (stage === 'AUTH_LOGIN_MISSING') {
        console.warn(`Staff sign-in session: ${missingLoginSessionReason(req, settings.sessionSecret)}`);
      }
      console.warn(`Staff sign-in failed: ${stage}; reason=${safeAuthErrorCode(error)}`);
      await new Promise<void>(resolve => req.session.destroy(() => resolve()));
      res.clearCookie(sessionCookieName, { path: '/', secure: settings.secure, httpOnly: true, sameSite: 'lax' });
      res.status(403).type('text/plain').send('Anmeldung fehlgeschlagen oder kein Zugriff. Bitte starten Sie die Anmeldung erneut.');
    }
  });
  router.get('/auth/session', (req, res) => {
    const authenticated = !!req.session.identity && allowed(settings, req.session.identity) &&
      !!req.session.authenticatedAt && Date.now() - req.session.authenticatedAt < 8 * 60 * 60 * 1000;
    res.json(authenticated ? { authenticated: true, available: true, csrfToken: req.session.csrf } : { authenticated: false, available: true });
  });
  router.post('/auth/logout', protectStaff(settings), express.json({ limit: '64kb' }), protectMutation(settings), async (req, res) => {
    await new Promise<void>((resolve, reject) => req.session.destroy(error => error ? reject(error) : resolve()));
    res.clearCookie(sessionCookieName, { path: '/', secure: settings.secure, httpOnly: true, sameSite: 'lax' });
    res.json({ ok: true });
  });
  router.post('/staff/events', protectStaff(settings), express.json({ limit: '64kb' }), protectMutation(settings), async (req, res) => {
    if (!services.events) { res.status(503).json({ error: 'Veranstaltungen sind derzeit nicht verfügbar.' }); return; }
    if (!uuid.test(req.body?.submissionId ?? '')) throw new InvalidEvent();
    const input = validateEvent(req.body.event);
    const identity = req.session.identity!;
    res.status(201).json(await services.events.publish(input, req.body.submissionId.toLowerCase(), `${identity.tenantId}:${identity.userId}`));
  });
  router.post('/staff/events/:id/cancel', protectStaff(settings), express.json({ limit: '64kb' }), protectMutation(settings), async (req, res) => {
    if (req.body?.confirmed !== true) throw new InvalidEvent();
    const id = req.params.id;
    const event = typeof id === 'string' && uuid.test(id) ? await services.events?.cancel(id) : undefined;
    if (!event) { res.status(404).json({ error: 'Veranstaltung nicht gefunden.' }); return; }
    res.json(event);
  });
  return router;
}

export const productErrorHandler: express.ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof InvalidEvent) { res.status(400).json({ error: 'Bitte prüfen Sie Name, Datumsangaben, Altersklassen und Teilnehmerzahl.' }); return; }
  if (error instanceof SubmissionConflict) { res.status(409).json({ error: 'Diese Veröffentlichung wurde bereits mit anderen Angaben verarbeitet. Bitte laden Sie die Veranstaltungsliste neu.' }); return; }
  const status = (error as { status?: number })?.status;
  res.status(status === 400 || status === 413 ? status : 503).json({ error: 'Die Anfrage konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.' });
};
