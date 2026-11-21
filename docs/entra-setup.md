# Microsoft Entra staff access: repeatable setup

This guide configures the single-tenant staff sign-in required by [change 003](../specs/changes/003-event-publishing/requirements.md). Parents do not need Microsoft accounts. The application allowlist, not an email address or a successful Microsoft login alone, grants staff access.

**Remote setup is an owner/admin task.** These instructions do not authorize an agent to change Entra or deploy to Hetzner. Use synthetic events until the feature checks and [pre-release gates](../specs/release-readiness.md) pass.

## 1. Prepare

1. Sign in at <https://entra.microsoft.com> with an account permitted to register applications. Ask the club's Microsoft 365 administrator if the relevant menus are unavailable; do not create a new tenant or subscription.
2. Check the directory/tenant selector. Select the club's existing Microsoft 365 tenant, not a personal or another organization's directory.
3. For local development use **http://localhost:5173** consistently. Vite binds to `localhost` and prints this URL; it fails if port 5173 is occupied instead of silently selecting another port. Do not replace `localhost` with `127.0.0.1`: browsers keep their cookies separate, so starting sign-in on the IP address loses the login session when Entra returns to the localhost callback. Keep the browser origin, `APP_ORIGIN`, and registered callback aligned. Do not broaden the listener to work around local name-resolution problems.

## 2. Register the application

Menu wording can vary between English and German portal versions.

1. Open **Entra ID → App registrations (App-Registrierungen) → New registration (Neue Registrierung)**.
2. Name: **Klubcamp staff** (a display name, not a secret).
3. Supported account types: **Accounts in this organizational directory only / Single tenant**. Do not select multi-tenant or personal Microsoft accounts.
4. Redirect URI: choose platform **Web**, not **Single-page application (SPA)**, and enter:

   ```text
   http://localhost:5173/api/auth/callback
   ```

5. Click **Register**.
6. On **Overview**, copy **Application (client) ID** and **Directory (tenant) ID** into a private administrator note. These are configuration identifiers, not passwords. Do not confuse either with the application's **Object ID**.
7. Open **Authentication → Add a platform → Web**, or edit the existing Web platform. Add the production callback:

   ```text
   https://camps.schwarzweisskoeln.de/api/auth/callback
   ```

8. To test the local built preview, also add:

   ```text
   http://localhost:3000/api/auth/callback
   ```

9. Save. Keep implicit access-token/ID-token grant checkboxes **off** and public-client flows **off**. This is a confidential server-side authorization-code flow with PKCE, not a browser-token SPA flow. No front-channel logout URL is needed for application-session sign-out.

One registration with these callbacks is sufficient for this initial setup. Use local disposable events and protect the local secret like the production secret. Separate development registrations can be considered later; they are not required here.

## 3. Create a client secret

1. In the app registration, open **Certificates & secrets → Client secrets → New client secret**.
2. Description: e.g. `Klubcamp server`. Select an expiry consistent with club policy.
3. Click **Add**, then immediately copy the **Value**, not the **Secret ID**. The value cannot be retrieved later.
4. Store it in a password manager and the private environment files described below. Never paste it into chat, Git, screenshots, frontend variables, or the konsoleH public settings.
5. Record the expiry and an owner/reminder for rotation. To rotate later, create a replacement, update the private files, restart and test, then remove the old secret. If exposed, revoke it promptly.

Klubcamp requests only `openid profile`, not Graph API access, email, or offline refresh access. Do not add application permissions or broad directory permissions. If the portal added delegated Graph `User.Read` by default, it is not used by Klubcamp and can be removed. Tenant consent policy may still require an administrator to approve the requested sign-in scopes; do not work around that policy.

## 4. Identify allowed staff

1. Open **Entra ID → Users → All users** in the club tenant.
2. Select an intended staff member.
3. Copy that user's **Object ID** from their overview. This is the user object ID, not an email, client ID, application object ID, or the `sub` claim.
4. Build a comma-separated list of `tenant-id:user-object-id` pairs. Repeat the tenant ID for each user:

   ```text
   STAFF_ALLOWLIST=11111111-1111-1111-1111-111111111111:22222222-2222-2222-2222-222222222222,11111111-1111-1111-1111-111111111111:33333333-3333-3333-3333-333333333333
   ```

5. Include only explicitly authorized staff. All listed users have the same publish/cancel permissions for all events. Changing email addresses does not change access. A guest user object can also belong to this tenant; do not allowlist one unless intentionally authorized.

No group synchronization, role hierarchy, or account-management UI is introduced. Removing a user from the configured allowlist and restarting invalidates their authorization on the next request, even if their session remains in the database.

## 5. Configure local development privately

Keep existing DB/SMTP values in the root `.env`. Add/update only these settings:

```dotenv
APP_ORIGIN=http://localhost:5173
ENTRA_TENANT_ID=<directory-tenant-id>
ENTRA_CLIENT_ID=<application-client-id>
ENTRA_CLIENT_SECRET="<secret-value>"
STAFF_ALLOWLIST=<tenant-id>:<user-object-id>
SESSION_SECRET=<random-secret>
```

Angle-bracket values are placeholders, not literal configuration. Generate a session secret locally:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copy the output privately into `.env`. Do not send it to anyone. Restrict file permissions with `chmod 600 .env`. Never use `VITE_*` variables for any of these settings.

Before sign-in, start the local database and explicitly apply migrations as described in [event publishing operations](event-publishing.md). Then run the two development servers and open **http://localhost:5173**. Click **Anmelden für Mitarbeitende**.

For the built local preview instead: set `APP_ORIGIN=http://localhost:3000`, build/start, and open **http://localhost:3000**. Restart after configuration changes. Switch the origin back before returning to Vite. If you change ports, register the matching callback first and keep browser URL and `APP_ORIGIN` aligned.

If all Entra values are empty, staff access stays unavailable; public event views and health checks do not require an Entra registration. Partially configured credentials fail startup rather than weakening authentication.

## 6. Configure production (only during an approved deployment)

1. Add the same Entra identifiers, secret value, and intended allowlist to **`~/klubcamp/production.env`**, not to the upload artifact.
2. Set `APP_ORIGIN=https://camps.schwarzweisskoeln.de` (no trailing slash).
3. Generate a **different** `SESSION_SECRET` for production. Preserve it across ordinary deployments; replacing it invalidates existing cookies.
4. Preserve `NODE_ENV=production`, `HOST=127.0.0.1`, `PORT=3000`, DB/SMTP settings, and private file/directory permissions from the [Hetzner guide](deployment-hetzner.md).
5. Apply reviewed migrations explicitly, then restart through the provider controls.
6. Verify that provider HTTPS requests arrive with trusted HTTPS forwarding information. Express trusts only loopback proxies; secure session cookies are not emitted for unrecognized plaintext requests. The internal listener must remain loopback-only. The provider must overwrite, not merely pass through, client forwarding headers. **This hosted proxy/cookie behavior is not yet verified for staff sign-in.** If cookies are absent or spoofable, stop and investigate; do not disable `Secure` or broadly trust proxies.

Local loopback HTTP is the sole development exception to secure cookies. Production requires HTTPS. Cookies are HTTP-only, SameSite=Lax, and sessions are stored in MariaDB. Successful sign-in rotates the session ID. Login attempts expire after ten minutes; application authorization expires after eight hours without extension by activity.

## 7. Acceptance checklist

Record outcomes in [003 validation](../specs/changes/003-event-publishing/validation.md), without tokens or secrets:

- [ ] An allowlisted club user can sign in locally and publish a synthetic event.
- [ ] A club user **not** on the allowlist is denied (use an authorized test participant).
- [ ] An account outside the tenant cannot gain staff access.
- [ ] Direct anonymous publish/cancel API requests are rejected.
- [ ] In browser developer tools, the production cookie `klubcamp.sid` has **Secure**, **HttpOnly**, **SameSite=Lax**, and no Domain attribute. Do not copy its value.
- [ ] State-changing requests require a matching origin and CSRF token; no Microsoft tokens appear in frontend storage/network API responses or logs. The authorization callback contains a short-lived code; do not capture or share that URL.
- [ ] **Abmelden** invalidates the server session; replaying its previous cookie cannot publish.
- [ ] Production public list/detail and staff flow pass after restart using synthetic data.
- [ ] A trainer completes create → review → publish in under ten minutes; record whether sign-in is included.

Sign-out ends **Klubcamp's application session**, not the user's global Microsoft 365 session. A later sign-in may therefore reuse their Microsoft session; that is expected.

## Troubleshooting and later reference

### Generic callback failure: find the failed step safely

If Microsoft returns to Klubcamp but the page says **Anmeldung fehlgeschlagen oder kein Zugriff**, do not assume the allowlist is wrong. The backend terminal now prints a fixed diagnostic line, for example:

```text
Staff sign-in failed: AUTH_OIDC_RESPONSE; reason=OAUTH_RESPONSE_BODY_ERROR/invalid_client
```

Restart `npm run dev:backend` after updating the code, return to `http://localhost:5173`, and start a **new** sign-in from the homepage. Do not reload or reuse an old callback URL. Share only this diagnostic line, not the callback URL, cookie value, token response, or populated `.env`.

| Stage | Meaning / next check |
| --- | --- |
| `AUTH_LOGIN_MISSING` | The callback could not restore the original login attempt. Check matching hostname, cookie presence, DB session persistence, and a stable session secret. |
| `AUTH_LOGIN_EXPIRED` | More than ten minutes elapsed. Start a fresh sign-in. |
| `AUTH_LOGIN_CONSUME` | Saving one-time login-attempt consumption failed; investigate DB availability/permissions. |
| `AUTH_OIDC_RESPONSE` | Microsoft response, token exchange, or identity-claim validation failed. A recognized library/provider reason narrows this down; this is not an allowlist denial. |
| `AUTH_TENANT_DENIED` | The validated identity's tenant does not match the configured tenant. |
| `AUTH_USER_DENIED` | The validated tenant matches, but the user's object ID is not allowlisted. |
| `AUTH_SESSION_ROTATE` / `AUTH_SESSION_SAVE` | Creating/persisting the authenticated session failed; investigate DB/session storage. |

Only fixed, allowlisted error codes are logged. `UNCLASSIFIED` means no recognized safe code was available; it does not mean a raw error should be printed. Browser error text stays generic and access checks remain unchanged.

For `AUTH_LOGIN_MISSING`, the backend also prints these safe session diagnostics:

```text
Staff sign-in started: session=SAVED; cookie=SET; transport=HTTP
Staff sign-in session: NO_COOKIE
```

The first line confirms that the server saved the temporary login session and emitted a cookie header. It cannot confirm that the browser accepted the cookie. `cookie=NOT_SET` means no session cookie was emitted; with an HTTPS configuration over plain HTTP, this is intentional protection, not a reason to disable Secure cookies.

| Session diagnostic | Meaning |
| --- | --- |
| `NO_COOKIE` | The callback arrived without the Klubcamp cookie. Investigate browser cookie handling and hostname consistency. |
| `MULTIPLE_COOKIES` | More than one Klubcamp cookie arrived, possibly from different paths or domains. Retry in a fresh private window before changing settings. |
| `INVALID_COOKIE` | The cookie is malformed or cannot be verified with this backend's session secret. Possible causes include a changed secret or different backend instances. |
| `SESSION_NOT_FOUND` | A valid signed cookie arrived, but its session was not restored (for example, expired/deleted database data or a different database). |
| `SESSION_WITHOUT_LOGIN` | The cookie and session were restored, but no pending login attempt remained. A repeated callback or overlapping sign-ins may have consumed/replaced it. |

For troubleshooting, restart the backend, start one fresh sign-in at `http://localhost:5173`, and share only the lines beginning `Staff sign-in`. No browser internals or full callback URL are needed. Sessions are stored in MariaDB; normal startup does not reset them.

### Configuration checks

- **AADSTS50011 / reply URL mismatch:** compare the exact browser origin, `APP_ORIGIN`, and Web callback, including scheme, port, hostname, and `/api/auth/callback`. Avoid mixing localhost and 127.0.0.1.
- **Invalid client secret:** use the secret **Value**, check expiry, quote special characters, and restart after editing. Never print the secret to diagnose it.
- **Login denied:** verify the selected tenant and the user's object ID in that tenant, not their email. Check the allowlist and restart after edits.
- **Login loses its session:** verify migrations, DB availability, consistent hostname, cookie settings, and trusted production HTTPS forwarding. Never bypass allowlist, CSRF, or TLS checks.
- **Consent blocked:** ask the tenant administrator to review the minimal sign-in scopes.
- **Secret rotation:** keep the tenant/client IDs and callbacks; replace only the expired/compromised credential, then restart and validate.

Microsoft references (consulted during implementation): [register an application](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app), [redirect URI restrictions](https://learn.microsoft.com/en-us/entra/identity-platform/reply-url), [ID-token claims](https://learn.microsoft.com/en-us/entra/identity-platform/id-token-claims-reference).
