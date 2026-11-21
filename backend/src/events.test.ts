import { describe, expect, it } from 'vitest';
import { defaultDeadline, validateEvent } from './events.js';

export const sampleEvent = {
  name: 'Sommercamp', description: 'Hockey und Spaß', startDate: '2027-07-12', endDate: '2027-07-16',
  ageGroups: ['mU10', 'wU10'], capacity: 30, minimumParticipants: null, registrationDeadline: '2027-06-28',
};

describe('event validation', () => {
  it('accepts a complete event and optional fields', () => {
    expect(validateEvent(sampleEvent)).toEqual(sampleEvent);
    expect(validateEvent({ ...sampleEvent, description: undefined, capacity: undefined, minimumParticipants: undefined })).toMatchObject({ description: '', capacity: null, minimumParticipants: null });
  });
  it.each([
    { minimumParticipants: null, capacity: null }, { minimumParticipants: 1, capacity: null },
    { minimumParticipants: 10, capacity: 30 }, { minimumParticipants: 30, capacity: 30 },
    { minimumParticipants: 2147483647, capacity: null },
  ])('accepts valid participant limits %j', limits => {
    expect(validateEvent({ ...sampleEvent, ...limits })).toMatchObject(limits);
  });
  it.each([
    { name: '' }, { name: '   ' }, { name: 'x'.repeat(201) }, { description: '<x>'.repeat(4000) },
    { startDate: '2027-02-29' }, { endDate: '2027-07-11' }, { startDate: '2027-7-12' },
    { registrationDeadline: '2027-07-12' }, { registrationDeadline: '2027-07-13' },
    { registrationDeadline: '2027-02-30' }, { ageGroups: [] }, { ageGroups: ['U10'] },
    { ageGroups: ['mU10', 'mU10'] }, { ageGroups: ['mU20'] }, { capacity: 0 }, { capacity: -1 },
    { capacity: 1.5 }, { capacity: '30' }, { capacity: 2147483648 }, { startDate: '0999-01-01' },
    { minimumParticipants: 0 }, { minimumParticipants: -1 }, { minimumParticipants: 1.5 },
    { minimumParticipants: '10' }, { minimumParticipants: 31 }, { minimumParticipants: 2147483648 },
  ])('rejects invalid fields %j', patch => {
    expect(() => validateEvent({ ...sampleEvent, ...patch })).toThrow();
  });
  it.each([
    ['2027-01-05', '2026-12-22'], ['2028-03-10', '2028-02-25'],
    ['2027-03-10', '2027-02-24'], ['2027-04-05', '2027-03-22'],
    ['2027-11-01', '2027-10-18'],
  ])('defaults fourteen calendar days before %s', (start, expected) => {
    expect(defaultDeadline(start)).toBe(expected);
  });
});
