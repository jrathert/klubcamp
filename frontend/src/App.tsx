import React, { useEffect, useState } from 'react';
import { Connectivity } from './Connectivity';
import { ageGroups, defaultDeadline, formatDate, validEvent, type EventInput, type PublishedEvent } from './event-form';

interface StaffSession { authenticated: boolean; available: boolean; csrfToken?: string }
const emptyEvent: EventInput = { name: '', description: '', startDate: '', endDate: '', ageGroups: [], capacity: null, minimumParticipants: null, registrationDeadline: '' };

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, { ...options, signal: AbortSignal.timeout(10000) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? 'Die Anfrage ist fehlgeschlagen.');
  return body;
}

export function EventDetails({ event }: { event: EventInput & { cancelled?: boolean } }) {
  return <dl>
    <dt>Name</dt><dd>{event.name}</dd>
    {event.cancelled && <><dt>Status</dt><dd><strong>Abgesagt</strong></dd></>}
    <dt>Beschreibung</dt><dd className="plain-text">{event.description || 'Keine Beschreibung'}</dd>
    <dt>Zeitraum (einschließlich)</dt><dd>{formatDate(event.startDate)} – {formatDate(event.endDate)}</dd>
    <dt>Altersklassen</dt><dd>{event.ageGroups.join(', ')}</dd>
    <dt>Mindestteilnehmerzahl</dt><dd>{event.minimumParticipants ?? 'Keine Mindestteilnehmerzahl'}</dd>
    <dt>Maximale Teilnehmerzahl</dt><dd>{event.capacity ?? 'Unbegrenzt'}</dd>
    <dt>Anmeldeschluss</dt><dd>{formatDate(event.registrationDeadline)}</dd>
  </dl>;
}

export function EventForm({ onPublish }: { onPublish: (event: EventInput, submissionId: string) => Promise<void> }) {
  const [event, setEvent] = useState<EventInput>({ ...emptyEvent, ageGroups: [] });
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());
  const [attempted, setAttempted] = useState(false);
  function update<K extends keyof EventInput>(key: K, value: EventInput[K]) {
    setEvent(current => ({ ...current, [key]: value }));
    // Reusing an uncertain publication key with changed data is never allowed.
    if (!attempted) setSubmissionId(crypto.randomUUID());
  }
  if (review) return <section aria-labelledby="review-title">
    <h2 id="review-title">Veranstaltung prüfen</h2>
    <EventDetails event={event} />
    <p>Nach der Veröffentlichung sind Bearbeitung und Löschung nicht möglich. Die Veranstaltung kann nur abgesagt werden.</p>
    {error && <p role="alert">{error}</p>}
    <button disabled={busy || attempted} onClick={() => setReview(false)}>Angaben korrigieren</button>
    <button disabled={busy} onClick={() => {
      setBusy(true); setError(''); setAttempted(true);
      void onPublish(event, submissionId).catch(() => {
        setError('Veröffentlichung nicht bestätigt. Bitte versuchen Sie es mit denselben Angaben erneut oder prüfen Sie die Veranstaltungsliste.');
      }).finally(() => setBusy(false));
    }}>{busy ? 'Wird veröffentlicht…' : 'Jetzt verbindlich veröffentlichen'}</button>
  </section>;
  return <section aria-labelledby="form-title">
    <h2 id="form-title">Veranstaltung erstellen</h2>
    <p>Die Angaben bleiben bis zur Veröffentlichung nur in dieser Seite. Beim Verlassen gehen sie verloren.</p>
    <form noValidate onSubmit={e => {
      e.preventDefault();
      if (!validEvent(event)) { setError('Bitte prüfen Sie Name, Datumsangaben, Altersklassen und Teilnehmerzahl.'); return; }
      setError(''); setReview(true);
    }}>
      <label>Name<input required maxLength={200} value={event.name} onChange={e => update('name', e.target.value)} /></label>
      <label>Beschreibung (optional)<textarea maxLength={10000} value={event.description} onChange={e => update('description', e.target.value)} /></label>
      <label>Startdatum<input type="date" required min="1000-01-01" max="9999-12-31" value={event.startDate} onChange={e => {
        const startDate = e.target.value;
        setEvent(current => ({ ...current, startDate, registrationDeadline:
          !current.registrationDeadline || current.registrationDeadline === defaultDeadline(current.startDate) ? defaultDeadline(startDate) : current.registrationDeadline }));
      }} /></label>
      <label>Enddatum<input type="date" required min={event.startDate || '1000-01-01'} max="9999-12-31" value={event.endDate} onChange={e => update('endDate', e.target.value)} /></label>
      <fieldset><legend>Altersklassen (mindestens eine)</legend><div className="age-groups">{ageGroups.map(group => <label key={group}>
        <input type="checkbox" checked={event.ageGroups.includes(group)} onChange={e => update('ageGroups',
          e.target.checked ? [...event.ageGroups, group] : event.ageGroups.filter(item => item !== group))} />{group}
      </label>)}</div></fieldset>
      <label>Mindestteilnehmerzahl (leer = kein Minimum)<input type="number" min="1" max={event.capacity ?? 2147483647} step="1" value={event.minimumParticipants ?? ''} onChange={e => update('minimumParticipants', e.target.value === '' ? null : Number(e.target.value))} /></label>
      <label>Maximale Teilnehmerzahl (leer = unbegrenzt)<input type="number" min="1" max="2147483647" step="1" value={event.capacity ?? ''} onChange={e => update('capacity', e.target.value === '' ? null : Number(e.target.value))} /></label>
      <p>Die Mindestteilnehmerzahl darf die maximale Teilnehmerzahl nicht überschreiten. Diese Angabe löst keine automatische Absage aus.</p>
      <label>Anmeldeschluss<input type="date" required min="1000-01-01" max="9999-12-31" value={event.registrationDeadline} onChange={e => update('registrationDeadline', e.target.value)} /></label>
      <p>Alle Datumsangaben gelten als Kalendertage in Europe/Berlin. Der Anmeldeschluss muss vor dem Startdatum liegen.</p>
      {error && <p role="alert">{error}</p>}
      <button type="submit">Weiter zur Prüfung</button>
    </form>
  </section>;
}

export function App() {
  const [session, setSession] = useState<StaffSession>({ authenticated: false, available: false });
  const [events, setEvents] = useState<PublishedEvent[]>([]);
  const [selected, setSelected] = useState<PublishedEvent>();
  const [creating, setCreating] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isConnectivity = window.location.pathname === '/connectivity';
  useEffect(() => {
    if (isConnectivity) return;
    let active = true;
    const id = /^\/events\/([0-9a-f-]{36})$/i.exec(window.location.pathname)?.[1];
    void Promise.all([api<PublishedEvent[]>('/events'), api<StaffSession>('/auth/session'),
      id ? api<PublishedEvent>(`/events/${id}`) : Promise.resolve(undefined)])
      .then(([list, staff, event]) => { if (active) { setEvents(list); setSession(staff); setSelected(event); } })
      .catch(() => { if (active) setError('Die Veranstaltungen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isConnectivity]);
  if (isConnectivity) return <Connectivity />;
  async function mutate<T>(path: string, body: unknown): Promise<T> {
    return api<T>(path, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': session.csrfToken ?? '' }, body: JSON.stringify(body) });
  }
  return <main>
    <header><h1><a href="/">Klubcamp</a></h1><nav aria-label="Personalzugang">
      {session.authenticated ? <>
        <button onClick={() => { setCreating(true); setSelected(undefined); setError(''); }}>Veranstaltung erstellen</button>
        <button disabled={busy} onClick={() => {
          setBusy(true);
          void mutate('/auth/logout', {}).then(() => { setSession({ authenticated: false, available: true }); setCreating(false); setConfirmCancel(false); })
            .catch(() => setError('Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.')).finally(() => setBusy(false));
        }}>Abmelden</button>
      </> : session.available && <a href="/api/auth/login">Anmelden für Mitarbeitende</a>}
    </nav></header>
    {error && <p role="alert">{error}</p>}
    {loading ? <p role="status">Veranstaltungen werden geladen…</p> : creating && session.authenticated ? <EventForm onPublish={async (event, submissionId) => {
      const published = await mutate<PublishedEvent>('/staff/events', { event, submissionId });
      setEvents(current => [...current.filter(item => item.id !== published.id), published]);
      setCreating(false); setSelected(published); setConfirmCancel(false);
    }} /> : selected ? <section>
      <h2>{selected.name}</h2><EventDetails event={selected} />
      {session.authenticated && !selected.cancelled && (!confirmCancel ? <button onClick={() => setConfirmCancel(true)}>Veranstaltung absagen</button> : <div>
        <p>„{selected.name}“ wirklich absagen? Die Veranstaltung bleibt öffentlich als „Abgesagt“ sichtbar.</p>
        <button disabled={busy} onClick={() => setConfirmCancel(false)}>Nicht absagen</button>
        <button disabled={busy} onClick={() => {
          setBusy(true); setError('');
          void mutate<PublishedEvent>(`/staff/events/${selected.id}/cancel`, { confirmed: true }).then(event => {
            setSelected(event); setEvents(current => current.map(item => item.id === event.id ? event : item)); setConfirmCancel(false);
          }).catch(() => setError('Die Absage konnte nicht bestätigt werden. Bitte versuchen Sie es erneut.')).finally(() => setBusy(false));
        }}>Ja, verbindlich absagen</button>
      </div>)}
      <p><a href="/">Alle Veranstaltungen</a></p>
    </section> : <section><h2>Veranstaltungen</h2>
      {!events.length && !error && <p>Derzeit sind keine Veranstaltungen veröffentlicht.</p>}
      <ul className="events">{events.map(event => <li key={event.id}>
        <h3><a href={`/events/${event.id}`}>{event.name}</a></h3>
        {event.cancelled && <strong>Abgesagt</strong>}
        <p>{formatDate(event.startDate)} – {formatDate(event.endDate)}</p>
        <p>{event.ageGroups.join(', ')}</p>
        <p>Mindestteilnehmerzahl: {event.minimumParticipants ?? 'Keine Mindestteilnehmerzahl'}</p>
        <p>Maximale Teilnehmerzahl: {event.capacity ?? 'Unbegrenzt'}</p>
      </li>)}</ul>
    </section>}
  </main>;
}
