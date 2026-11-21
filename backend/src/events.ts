// Calendar dates are Berlin civil dates, never instants or server-local timestamps.
export const ageGroups = [6, 8, 10, 12, 14, 16, 18].flatMap(age => [`mU${age}`, `wU${age}`]);
export interface EventInput {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  ageGroups: string[];
  capacity: number | null;
  minimumParticipants: number | null;
  registrationDeadline: string;
}
export interface PublishedEvent extends EventInput { id: string; cancelled: boolean }
export interface EventRepository {
  list(): Promise<PublishedEvent[]>;
  find(id: string): Promise<PublishedEvent | undefined>;
  publish(input: EventInput, submissionId: string, owner: string): Promise<PublishedEvent>;
  cancel(id: string): Promise<PublishedEvent | undefined>;
}
export class InvalidEvent extends Error {}
export class SubmissionConflict extends Error {}

export function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1000-01-01' || value > '9999-12-31') return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function defaultDeadline(startDate: string): string {
  if (!validDate(startDate)) return '';
  const date = new Date(`${startDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 14);
  return date.toISOString().slice(0, 10);
}

export function validateEvent(value: unknown): EventInput {
  if (!value || typeof value !== 'object') throw new InvalidEvent();
  const v = value as Record<string, unknown>;
  if (typeof v.name !== 'string' || !v.name.trim() || v.name.trim().length > 200 ||
      (v.description !== undefined && (typeof v.description !== 'string' || v.description.length > 10000)) ||
      !validDate(v.startDate) || !validDate(v.endDate) || v.endDate < v.startDate ||
      !validDate(v.registrationDeadline) || v.registrationDeadline >= v.startDate ||
      !Array.isArray(v.ageGroups) || v.ageGroups.length === 0 || v.ageGroups.length > 14 ||
      v.ageGroups.some(group => !ageGroups.includes(group)) || new Set(v.ageGroups).size !== v.ageGroups.length ||
      (v.capacity !== null && v.capacity !== undefined &&
       (typeof v.capacity !== 'number' || !Number.isInteger(v.capacity) || v.capacity < 1 || v.capacity > 2147483647)) ||
      (v.minimumParticipants !== null && v.minimumParticipants !== undefined &&
       (typeof v.minimumParticipants !== 'number' || !Number.isInteger(v.minimumParticipants) ||
        v.minimumParticipants < 1 || v.minimumParticipants > 2147483647 ||
        (typeof v.capacity === 'number' && v.minimumParticipants > v.capacity)))) {
    throw new InvalidEvent();
  }
  return {
    name: v.name.trim(), description: (v.description as string | undefined) ?? '',
    startDate: v.startDate, endDate: v.endDate, registrationDeadline: v.registrationDeadline,
    ageGroups: [...v.ageGroups].sort(), capacity: (v.capacity as number | undefined) ?? null,
    minimumParticipants: (v.minimumParticipants as number | undefined) ?? null,
  };
}
