// Public event API contract; no server implementation or private configuration is imported.
export const ageGroups = [6, 8, 10, 12, 14, 16, 18].flatMap(age => [`mU${age}`, `wU${age}`]);
export interface EventInput {
  name: string; description: string; startDate: string; endDate: string;
  ageGroups: string[]; capacity: number | null; minimumParticipants: number | null; registrationDeadline: string;
}
export interface PublishedEvent extends EventInput { id: string; cancelled: boolean }
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1000-01-01' || value > '9999-12-31') return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
export function defaultDeadline(startDate: string) {
  if (!validDate(startDate)) return '';
  const date = new Date(`${startDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 14);
  return date.toISOString().slice(0, 10);
}
export function validEvent(event: EventInput) {
  return !!event.name.trim() && event.name.trim().length <= 200 && event.description.length <= 10000 &&
    validDate(event.startDate) && validDate(event.endDate) && event.endDate >= event.startDate &&
    validDate(event.registrationDeadline) && event.registrationDeadline < event.startDate &&
    event.ageGroups.length > 0 && event.ageGroups.every(group => ageGroups.includes(group)) &&
    new Set(event.ageGroups).size === event.ageGroups.length &&
    (event.capacity === null || (Number.isInteger(event.capacity) && event.capacity > 0 && event.capacity <= 2147483647)) &&
    (event.minimumParticipants === null || (Number.isInteger(event.minimumParticipants) &&
      event.minimumParticipants > 0 && event.minimumParticipants <= 2147483647 &&
      (event.capacity === null || event.minimumParticipants <= event.capacity)));
}
export function formatDate(date: string) {
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin' })
    .format(new Date(`${date}T12:00:00Z`));
}
