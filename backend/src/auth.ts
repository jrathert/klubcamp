import * as oidc from 'openid-client';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

export interface Identity { tenantId: string; userId: string }
export interface LoginAttempt { verifier: string; state: string; nonce: string; created: number }
declare module 'express-session' {
  interface SessionData {
    identity?: Identity;
    csrf?: string;
    login?: LoginAttempt;
    authenticatedAt?: number;
  }
}
export interface AuthSettings {
  tenantId: string; clientId: string; clientSecret: string; origin: string;
  allowedUsers: Set<string>; sessionSecret: string; secure: boolean;
}
export interface IdentityProvider {
  begin(): Promise<{ url: string; attempt: LoginAttempt }>;
  finish(url: URL, attempt: LoginAttempt): Promise<Identity>;
}
export const sessionCookieName = 'klubcamp.sid';
// Diagnostic only: express-session remains responsible for authentication.
// Return fixed categories, never cookie contents, session IDs, or signatures.
export function missingLoginSessionReason(req: Pick<Request, 'headers' | 'sessionID'>, secret: string) {
  const cookies = (req.headers.cookie ?? '').split(';').map(value => value.trim())
    .filter(value => value.startsWith(`${sessionCookieName}=`));
  if (!cookies.length) return 'NO_COOKIE';
  if (cookies.length > 1) return 'MULTIPLE_COOKIES';
  let value: string;
  try { value = decodeURIComponent(cookies[0].slice(sessionCookieName.length + 1)); }
  catch { return 'INVALID_COOKIE'; }
  const separator = value.lastIndexOf('.');
  if (!value.startsWith('s:') || separator <= 2) return 'INVALID_COOKIE';
  const id = value.slice(2, separator);
  const signature = value.slice(separator + 1);
  const expected = createHmac('sha256', secret).update(id).digest('base64').replace(/=+$/, '');
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected) ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return 'INVALID_COOKIE';
  return id === req.sessionID ? 'SESSION_WITHOUT_LOGIN' : 'SESSION_NOT_FOUND';
}
// Only fixed, recognized codes may leave the authentication boundary. Never log
// error messages, descriptions, causes, claims, callback URLs, or token responses.
const safeClientCodes = new Set([
  'OAUTH_RESPONSE_BODY_ERROR', 'OAUTH_AUTHORIZATION_RESPONSE_ERROR', 'OAUTH_INVALID_RESPONSE',
  'OAUTH_INVALID_REQUEST', 'OAUTH_RESPONSE_IS_NOT_JSON', 'OAUTH_RESPONSE_IS_NOT_CONFORM',
  'OAUTH_HTTP_REQUEST_FORBIDDEN', 'OAUTH_JWT_TIMESTAMP_CHECK_FAILED', 'OAUTH_JWT_CLAIM_COMPARISON_FAILED',
  'OAUTH_JSON_ATTRIBUTE_COMPARISON_FAILED', 'OAUTH_PARSE_ERROR', 'OAUTH_UNSUPPORTED_OPERATION',
  'OAUTH_TIMEOUT', 'OAUTH_ABORT', 'ERR_JWT_EXPIRED', 'ERR_JWT_CLAIM_VALIDATION_FAILED',
  'ERR_JWS_SIGNATURE_VERIFICATION_FAILED', 'ERR_JWKS_NO_MATCHING_KEY',
]);
const safeProviderCodes = new Set([
  'invalid_client', 'invalid_grant', 'invalid_request', 'unauthorized_client', 'access_denied',
  'interaction_required', 'consent_required', 'login_required', 'server_error', 'temporarily_unavailable',
]);
export function safeAuthErrorCode(error: unknown): string {
  if (!(error instanceof Error)) return 'UNCLASSIFIED';
  const coded = error as Error & { code?: unknown; error?: unknown };
  const code = typeof coded.code === 'string' && safeClientCodes.has(coded.code) ? coded.code : 'UNCLASSIFIED';
  const provider = typeof coded.error === 'string' && safeProviderCodes.has(coded.error) ? `/${coded.error}` : '';
  return `${code}${provider}`;
}
const guid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function readAuthSettings(env = process.env): AuthSettings | undefined {
  if (!env.ENTRA_CLIENT_ID && !env.ENTRA_TENANT_ID && !env.ENTRA_CLIENT_SECRET) return undefined;
  const tenantId = env.ENTRA_TENANT_ID?.toLowerCase() ?? '';
  const clientId = env.ENTRA_CLIENT_ID ?? '';
  const origin = new URL(env.APP_ORIGIN ?? '');
  const local = ['localhost', '127.0.0.1'].includes(origin.hostname);
  if (!guid.test(tenantId) || !guid.test(clientId) || !env.ENTRA_CLIENT_SECRET ||
      !env.SESSION_SECRET || env.SESSION_SECRET.length < 32 || origin.origin !== env.APP_ORIGIN ||
      origin.username || origin.password || (origin.protocol !== 'https:' && !(local && origin.protocol === 'http:' && env.NODE_ENV !== 'production'))) {
    throw new Error('Invalid authentication configuration');
  }
  const allowedUsers = new Set((env.STAFF_ALLOWLIST ?? '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean));
  if (!allowedUsers.size || [...allowedUsers].some(v => {
    const [tenant, user, extra] = v.split(':');
    return tenant !== tenantId || !guid.test(user ?? '') || extra !== undefined;
  })) throw new Error('Invalid staff allowlist');
  return { tenantId, clientId, clientSecret: env.ENTRA_CLIENT_SECRET, sessionSecret: env.SESSION_SECRET,
    origin: origin.origin, secure: origin.protocol === 'https:', allowedUsers };
}

export function identityProvider(settings: AuthSettings): IdentityProvider {
  let configuration: Promise<oidc.Configuration> | undefined;
  async function config() {
    configuration ??= oidc.discovery(new URL(`https://login.microsoftonline.com/${settings.tenantId}/v2.0`),
      settings.clientId, settings.clientSecret, undefined, { execute: [oidc.enableNonRepudiationChecks] });
    try { return await configuration; } catch (error) { configuration = undefined; throw error; }
  }
  return {
    async begin() {
      const attempt = { verifier: oidc.randomPKCECodeVerifier(), state: oidc.randomState(), nonce: oidc.randomNonce(), created: Date.now() };
      const url = oidc.buildAuthorizationUrl(await config(), {
        redirect_uri: `${settings.origin}/api/auth/callback`, scope: 'openid profile', response_mode: 'query',
        code_challenge: await oidc.calculatePKCECodeChallenge(attempt.verifier), code_challenge_method: 'S256',
        state: attempt.state, nonce: attempt.nonce,
      });
      return { url: url.href, attempt };
    },
    async finish(url, attempt) {
      const tokens = await oidc.authorizationCodeGrant(await config(), url, {
        pkceCodeVerifier: attempt.verifier, expectedState: attempt.state, expectedNonce: attempt.nonce, idTokenExpected: true,
      });
      const claims = tokens.claims();
      if (!claims || typeof claims.tid !== 'string' || typeof claims.oid !== 'string' || !guid.test(claims.oid)) throw new Error('Identity unavailable');
      // Tokens are deliberately not persisted or returned to the browser.
      return { tenantId: claims.tid.toLowerCase(), userId: claims.oid.toLowerCase() };
    },
  };
}
export function allowed(settings: AuthSettings, identity: Identity) {
  return identity.tenantId === settings.tenantId && settings.allowedUsers.has(`${identity.tenantId}:${identity.userId}`);
}
export function csrfToken() { return randomBytes(32).toString('hex'); }
export function protectStaff(settings: AuthSettings) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.identity || !allowed(settings, req.session.identity) ||
        !req.session.authenticatedAt || Date.now() - req.session.authenticatedAt > 8 * 60 * 60 * 1000) {
      res.status(401).json({ error: 'Bitte melden Sie sich als berechtigte Person an.' }); return;
    }
    next();
  };
}
export function protectMutation(settings: AuthSettings) {
  return (req: Request, res: Response, next: NextFunction) => {
    const supplied = req.get('x-csrf-token') ?? '';
    const expected = req.session.csrf ?? '';
    if (req.get('origin') !== settings.origin || !expected || Buffer.byteLength(supplied) !== Buffer.byteLength(expected) ||
        !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected)) || !req.is('application/json')) {
      res.status(403).json({ error: 'Die Sicherheitsprüfung ist fehlgeschlagen. Bitte laden Sie die Seite neu.' }); return;
    }
    next();
  };
}
