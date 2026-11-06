// Share configuration validation, sanitized diagnostics, and deadlines between the CLI checks.

// Read a required environment variable, failing rather than using an empty setting.
export function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error('Missing configuration');
  return value;
}

// Convert a required environment setting into a valid TCP port number.
export function port(name: string): number {
  const value = Number(required(name));
  if (!Number.isInteger(value) || value < 1 || value > 65535) throw new Error('Invalid port');
  return value;
}

// Run an asynchronous check with a total deadline and consistent, secret-safe results.
export async function runCheck(label: string, action: () => Promise<void>) {
  // Terminate even if DNS, a library call, or connection cleanup never finishes.
  const deadline = setTimeout(() => {
    console.error(`${label} check failed: 10 second deadline exceeded.`);
    process.exit(1);
  }, 10_000);
  try {
    await action();
    console.log(`${label} check succeeded.`);
  } catch {
    // Never print driver errors: they may include credentials or infrastructure details.
    console.error(`${label} check failed. Verify configuration and connectivity.`);
    process.exitCode = 1;
  } finally {
    clearTimeout(deadline);
  }
}
