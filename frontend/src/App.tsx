// Display the result of a browser request to the application's public health endpoint.
import React, { useEffect, useState } from 'react';

// Render the connectivity page and track its loading, success, or failure state.
export function App() {
  const [state, setState] = useState<'loading' | 'success' | 'failure'>('loading');
  // Start a health request when the component mounts; the empty array avoids reruns on updates.
  useEffect(() => {
    const controller = new AbortController();
    // Abort a stalled request so the loading state does not last indefinitely.
    const timeout = setTimeout(() => controller.abort(), 5000);
    let active = true;
    // `void` marks this promise as intentionally unawaited; the chain handles its errors.
    void fetch('/api/health', { signal: controller.signal })
      // Accept only a successful HTTP response containing the documented JSON status.
      .then(async (response) => {
        if (!response.ok || (await response.json()).status !== 'ok') throw new Error('Health check failed');
        if (active) setState('success');
      })
      // Convert network, parsing, contract, and timeout errors into the same visible failure.
      .catch(() => { if (active) setState('failure'); })
      // Remove the timeout after the request settles, whether it succeeds or fails.
      .finally(() => clearTimeout(timeout));
    // On unmount, prevent state updates and cancel work; StrictMode also tests this cleanup.
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, []);

  return <main>
    <h1>Klubcamp</h1>
    <p role="status">{state === 'loading' ? 'Connecting to the application…' : state === 'success' ? 'Application is available.' : 'Unable to connect to the application.'}</p>
  </main>;
}
