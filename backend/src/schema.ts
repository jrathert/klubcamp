import { boolean, char, date, int, mysqlTable, text, varchar, bigint } from 'drizzle-orm/mysql-core';

export const events = mysqlTable('events', {
  id: char('id', { length: 36 }).primaryKey(),
  submissionId: char('submission_id', { length: 36 }).notNull().unique(),
  owner: varchar('owner', { length: 73 }).notNull(),
  // A canonical payload is retained for retry comparison even after cancellation.
  payload: text('payload').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description').notNull(),
  startDate: date('start_date', { mode: 'string' }).notNull(),
  endDate: date('end_date', { mode: 'string' }).notNull(),
  ageGroups: text('age_groups').notNull(),
  capacity: int('capacity'),
  minimumParticipants: int('minimum_participants'),
  registrationDeadline: date('registration_deadline', { mode: 'string' }).notNull(),
  cancelled: boolean('cancelled').notNull().default(false),
});

export const sessions = mysqlTable('sessions', {
  id: char('id', { length: 64 }).primaryKey(),
  data: text('data').notNull(),
  expires: bigint('expires', { mode: 'number' }).notNull(),
});
