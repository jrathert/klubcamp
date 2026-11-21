import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { App, EventDetails, EventForm } from './App';
import { defaultDeadline, validEvent, type EventInput } from './event-form';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); window.history.replaceState({}, '', '/'); });
const event: EventInput = { name: 'Sommercamp', description: '<script>Text</script>', startDate: '2027-07-12',
  endDate: '2027-07-16', ageGroups: ['wU10'], capacity: null, minimumParticipants: null, registrationDeadline: '2027-06-28' };
function fill() {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: event.name } });
  fireEvent.change(screen.getByLabelText('Startdatum'), { target: { value: event.startDate } });
  fireEvent.change(screen.getByLabelText('Enddatum'), { target: { value: event.endDate } });
  fireEvent.click(screen.getByLabelText('wU10'));
}
it('validates calendar dates, groups, capacities and deadline boundaries on the frontend', () => {
  expect(validEvent(event)).toBe(true);
  for (const patch of [{ startDate: '2027-02-29' }, { endDate: '2027-07-01' }, { ageGroups: [] },
    { ageGroups: ['mU20'] }, { capacity: 0 }, { capacity: 1.5 }, { registrationDeadline: event.startDate }, { name: ' ' }]) {
    expect(validEvent({ ...event, ...patch })).toBe(false);
  }
  expect(defaultDeadline('2028-03-10')).toBe('2028-02-25');
  expect(defaultDeadline('2027-01-05')).toBe('2026-12-22');
});
it.each([
  [null, null, true], [1, null, true], [10, 30, true], [30, 30, true], [31, 30, false],
  [0, null, false], [-1, null, false], [1.5, null, false], [2147483648, null, false],
  [2147483647, null, true],
])('validates minimum %s with maximum %s', (minimumParticipants, capacity, expected) => {
  expect(validEvent({ ...event, minimumParticipants, capacity })).toBe(expected);
});
it('shows German validation errors before review instead of browser-language popups', () => {
  const publish = vi.fn();
  render(<EventForm onPublish={publish} />);
  fireEvent.click(screen.getByText('Weiter zur Prüfung'));
  expect(screen.getByRole('alert').textContent).toContain('Bitte prüfen Sie');
  expect(screen.queryByText('Jetzt verbindlich veröffentlichen')).toBeNull();
  expect(publish).not.toHaveBeenCalled();
});
it('asks for the minimum before the maximum and uses the same order in details', () => {
  const form = render(<EventForm onPublish={vi.fn()} />);
  const minimum = screen.getByLabelText('Mindestteilnehmerzahl (leer = kein Minimum)');
  const maximum = screen.getByLabelText('Maximale Teilnehmerzahl (leer = unbegrenzt)');
  expect(minimum.compareDocumentPosition(maximum) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
  form.unmount();
  const details = render(<EventDetails event={event} />);
  const labels = [...details.container.querySelectorAll('dt')].map(label => label.textContent);
  expect(labels.indexOf('Mindestteilnehmerzahl')).toBeLessThan(labels.indexOf('Maximale Teilnehmerzahl'));
});
it('keeps corrections and a chosen deadline through review without publishing early', async () => {
  const publish = vi.fn().mockResolvedValue(undefined);
  render(<EventForm onPublish={publish} />);
  fill();
  fireEvent.change(screen.getByLabelText('Mindestteilnehmerzahl (leer = kein Minimum)'), { target: { value: '12' } });
  fireEvent.change(screen.getByLabelText('Maximale Teilnehmerzahl (leer = unbegrenzt)'), { target: { value: '30' } });
  expect((screen.getByLabelText('Anmeldeschluss') as HTMLInputElement).value).toBe('2027-06-28');
  fireEvent.change(screen.getByLabelText('Anmeldeschluss'), { target: { value: '2027-06-20' } });
  fireEvent.click(screen.getByText('Weiter zur Prüfung'));
  expect(screen.getByText('20.06.2027')).toBeTruthy();
  expect(screen.getByText('12')).toBeTruthy();
  expect(publish).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('Angaben korrigieren'));
  expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Sommercamp');
  expect((screen.getByLabelText('Anmeldeschluss') as HTMLInputElement).value).toBe('2027-06-20');
  expect((screen.getByLabelText('Mindestteilnehmerzahl (leer = kein Minimum)') as HTMLInputElement).value).toBe('12');
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Korrigiertes Camp' } });
  fireEvent.click(screen.getByText('Weiter zur Prüfung'));
  fireEvent.click(screen.getByText('Jetzt verbindlich veröffentlichen'));
  await waitFor(() => expect(publish).toHaveBeenCalledTimes(1));
  expect(publish.mock.calls[0][0]).toMatchObject({ name: 'Korrigiertes Camp', registrationDeadline: '2027-06-20', minimumParticipants: 12, capacity: 30 });
});
it('rejects minimum above maximum before review and permits clearing the minimum', async () => {
  const publish = vi.fn().mockResolvedValue(undefined);
  render(<EventForm onPublish={publish} />);
  fill();
  fireEvent.change(screen.getByLabelText('Mindestteilnehmerzahl (leer = kein Minimum)'), { target: { value: '20' } });
  fireEvent.change(screen.getByLabelText('Maximale Teilnehmerzahl (leer = unbegrenzt)'), { target: { value: '10' } });
  fireEvent.click(screen.getByText('Weiter zur Prüfung'));
  expect(screen.getByRole('alert').textContent).toContain('Bitte prüfen Sie');
  expect(publish).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Mindestteilnehmerzahl (leer = kein Minimum)'), { target: { value: '' } });
  fireEvent.click(screen.getByText('Weiter zur Prüfung'));
  expect(screen.getByText('Keine Mindestteilnehmerzahl')).toBeTruthy();
  fireEvent.click(screen.getByText('Jetzt verbindlich veröffentlichen'));
  await waitFor(() => expect(publish).toHaveBeenCalledTimes(1));
  expect(publish.mock.calls[0][0]).toMatchObject({ minimumParticipants: null, capacity: 10 });
});
it('retries an uncertain publication with the same key and prevents editing it', async () => {
  const publish = vi.fn().mockRejectedValue(new Error('timeout'));
  render(<EventForm onPublish={publish} />);
  fill(); fireEvent.click(screen.getByText('Weiter zur Prüfung'));
  fireEvent.click(screen.getByText('Jetzt verbindlich veröffentlichen'));
  await screen.findByRole('alert');
  expect((screen.getByText('Angaben korrigieren') as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByText('Jetzt verbindlich veröffentlichen'));
  await waitFor(() => expect(publish).toHaveBeenCalledTimes(2));
  expect(publish.mock.calls[1]).toEqual(publish.mock.calls[0]);
});
it('renders cancellation, unlimited capacity, German dates and descriptions as plain text', () => {
  const { container } = render(<EventDetails event={{ ...event, cancelled: true }} />);
  expect(screen.getByText('Abgesagt')).toBeTruthy();
  expect(screen.getByText('Unbegrenzt')).toBeTruthy();
  expect(screen.getByText('Keine Mindestteilnehmerzahl')).toBeTruthy();
  expect(screen.getByText('12.07.2027 – 16.07.2027')).toBeTruthy();
  expect(screen.getByText('<script>Text</script>')).toBeTruthy();
  expect(container.querySelector('script')).toBeNull();
});
it.each([null, 12])('browses the public list without sign-in and displays minimum %s', async minimumParticipants => {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => new Response(JSON.stringify(url.endsWith('/events')
    ? [{ ...event, minimumParticipants, id: '11111111-1111-1111-1111-111111111111', cancelled: true }] : { authenticated: false, available: true }))));
  render(<App />);
  expect(await screen.findByRole('link', { name: 'Sommercamp' })).toHaveProperty('href', expect.stringContaining('/events/'));
  expect(screen.getByText('Abgesagt')).toBeTruthy();
  expect(screen.getByText(`Mindestteilnehmerzahl: ${minimumParticipants ?? 'Keine Mindestteilnehmerzahl'}`)).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Veranstaltung erstellen' })).toBeNull();
});
