# Development setup: two servers, one production application

The two-server development setup provides a faster development feedback loop. It does not imply a separate frontend deployment in production.

## During development

Start these commands in separate terminals from the repository root:

```sh
npm run dev:backend
```

```sh
npm run dev:frontend
```

The frontend development server normally listens on **5173**, not port 80. The backend defaults to **3000**.

```text
Browser → Vite :5173
             ├─ frontend code + live updates
             └─ /api/* → Express :3000
```

Each server has a different job:

- **Vite** transforms frontend TypeScript and React as needed and provides **hot module replacement**. Most UI changes appear immediately, often without a full page reload and while preserving component state.
- **Express** runs the backend. The `dev:backend` command uses Node's `--watch`, so backend source changes automatically restart it.

Vite proxies `/api` requests to Express, as configured in [`vite.config.ts`](../vite.config.ts). It reads the backend port from the environment or root `.env`, defaulting to 3000. If you change `PORT`, restart both servers.

The frontend uses relative URLs such as `/api/health` in both development and production. From the browser's perspective, these requests go to the same origin, so no separate frontend API address or CORS setup is needed. Both development servers bind to localhost by default.

## Production and local production-mode preview

For a local preview of the built application:

```sh
npm run build
npm start
```

Open `http://127.0.0.1:3000` with the default listener settings.

```text
Browser → Express :3000
             ├─ prebuilt frontend files
             └─ /api/*
```

Vite has already done its work during the build. Express serves the resulting HTML, JavaScript, and CSS alongside the API; no Vite server runs here.

With these preview commands, source edits do not automatically update the application. Rebuild after changes and restart Express when necessary.

Production uses the same single-Express-process application topology, exposed through the provider's public HTTPS routing. The local preview is not itself a verified production deployment procedure; see the [packaging and startup guide](deployment.md) and [Hetzner deployment and operation guide](deployment-hetzner.md).

## Why keep both workflows?

| Workflow | Main purpose |
| --- | --- |
| Two development servers | Fast editing, live UI updates, and automatic backend restarts |
| One-server production preview | Check the actual build, static assets, routing, and frontend/API integration |

Debugging is supported in both workflows. **Fast automatic updates are the main advantage of the development setup.**

This arrangement is intentional in [change 001, requirement R3](../specs/changes/001-application-bootstrap/requirements.md), and consistent with the one-deployment architecture in the [technology stack](../specs/tech-stack.md).

For feature development, use the two servers for the fast feedback loop, then validate the built application with the single-server preview. As staff authentication is introduced in change 003, callback URLs and cookie protections need explicit validation in both environments.

See the [README](../README.md) for prerequisites, configuration, and the full local development instructions.
