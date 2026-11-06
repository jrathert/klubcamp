// Start the HTTP listener and handle startup failures and graceful process shutdown.
import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '127.0.0.1';
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('Invalid PORT configuration.');
  process.exit(1);
}
// Announce readiness only after Node has successfully opened the listening socket.
const server = createApp().listen(port, host, () => {
  console.log('Klubcamp server started.');
});
// Report listener failures without printing raw errors or sensitive configuration.
server.on('error', () => {
  console.error('Server startup failed. Check host and port configuration.');
  process.exitCode = 1;
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  // Stop accepting new requests when Ctrl+C or a termination signal arrives.
  process.on(signal, () => {
    // Force an unsuccessful exit if open connections prevent shutdown for five seconds.
    const timeout = setTimeout(() => process.exit(1), 5000);
    // Allow Node to exit naturally rather than staying alive solely for this timer.
    timeout.unref();
    // Exit successfully once the HTTP server has finished closing.
    server.close(() => process.exit(0));
  });
}
