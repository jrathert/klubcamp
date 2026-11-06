// Test visible connectivity states using mocked requests instead of live backend services.
import React from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { App } from './App';

// Remove rendered components, request mocks, and fake timers so tests remain independent.
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); });

// Verify the initial message while a simulated request remains unresolved.
it('displays loading while the health request is pending', () => {
  // Replace fetch with a function that returns an intentionally pending promise.
  const fetchMock = vi.fn(() => new Promise<Response>(
    // Leave the promise unsettled to simulate a request still in progress.
    () => {},
  ));
  vi.stubGlobal('fetch', fetchMock);
  render(<App />);
  expect(screen.getByRole('status').textContent).toBe('Connecting to the application…');
  expect(fetchMock).toHaveBeenCalledWith('/api/health', expect.objectContaining({ signal: expect.any(AbortSignal) }));
});

// Verify that a valid health response changes the loading message to success.
it('displays success for the documented health response', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'ok' }))));
  render(<App />);
  // Retry the assertion until React has processed the asynchronous response.
  await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Application is available.'));
});

// Run the same failure-state assertion for each supported request failure scenario.
it.each(['network', 'http', 'invalid-json', 'wrong-contract'])('displays failure for %s errors', async (kind) => {
  const fetchMock = kind === 'network' ? vi.fn().mockRejectedValue(new Error('offline')) :
    vi.fn().mockResolvedValue(kind === 'http' ? new Response('', { status: 503 }) :
      new Response(kind === 'invalid-json' ? '<html>' : JSON.stringify({ status: 'unavailable' })));
  vi.stubGlobal('fetch', fetchMock);
  render(<App />);
  // Wait for the rejected request or invalid response to update the rendered message.
  await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Unable to connect to the application.'));
});

// Advance a virtual clock to verify the timeout without waiting five real seconds.
it('displays failure after a stalled request times out', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', vi.fn(
    // Simulate fetch by returning a request promise that responds to cancellation.
    (_url, options: RequestInit) => new Promise(
      // Keep the request pending until its AbortSignal announces cancellation.
      (_resolve, reject) => {
        // Reject the fake request on abort, matching the behavior of a real fetch request.
        options.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      },
    ),
  ));
  render(<App />);
  // Advance timers inside act so React finishes the resulting state updates before assertions.
  await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
  expect(screen.getByRole('status').textContent).toBe('Unable to connect to the application.');
});
