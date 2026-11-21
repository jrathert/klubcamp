import { asc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { Database } from './database.js';
import { events } from './schema.js';
import { SubmissionConflict, type EventInput, type EventRepository, type PublishedEvent } from './events.js';

function publicEvent(row: typeof events.$inferSelect): PublishedEvent {
  return { id: row.id, name: row.name, description: row.description, startDate: row.startDate,
    endDate: row.endDate, ageGroups: JSON.parse(row.ageGroups), capacity: row.capacity, minimumParticipants: row.minimumParticipants,
    registrationDeadline: row.registrationDeadline, cancelled: row.cancelled };
}

export function eventRepository(db: Database): EventRepository {
  async function find(id: string) {
    const [row] = await db.select().from(events).where(eq(events.id, id));
    return row ? publicEvent(row) : undefined;
  }
  return {
    async list() { return (await db.select().from(events).orderBy(asc(events.startDate), asc(events.id))).map(publicEvent); },
    find,
    async publish(input: EventInput, submissionId: string, owner: string) {
      const payload = JSON.stringify(input);
      // A unique key serializes concurrent retries. The duplicate path never updates event data.
      await db.insert(events).values({ ...input, id: randomUUID(), submissionId, owner, payload,
        ageGroups: JSON.stringify(input.ageGroups) }).onDuplicateKeyUpdate({ set: { submissionId } });
      const [row] = await db.select().from(events).where(eq(events.submissionId, submissionId));
      if (!row || row.owner !== owner || row.payload !== payload) throw new SubmissionConflict();
      return publicEvent(row);
    },
    async cancel(id: string) {
      await db.update(events).set({ cancelled: true }).where(eq(events.id, id));
      return find(id);
    },
  };
}
