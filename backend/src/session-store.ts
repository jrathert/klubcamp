import session from 'express-session';
import { createHash } from 'node:crypto';
import { and, eq, gt, lt } from 'drizzle-orm';
import type { Database } from './database.js';
import { sessions } from './schema.js';

// Only hashes of bearer session IDs are stored. Cleanup is lazy and throttled.
export class MariaSessionStore extends session.Store {
  private lastCleanup = 0;
  constructor(private db: Database) { super(); }
  private key(id: string) { return createHash('sha256').update(id).digest('hex'); }
  get(id: string, callback: (error: unknown, data?: session.SessionData | null) => void) {
    void this.db.select().from(sessions).where(and(eq(sessions.id, this.key(id)), gt(sessions.expires, Date.now())))
      .then(rows => callback(null, rows[0] ? JSON.parse(rows[0].data) : null)).catch(() => callback(new Error('Session unavailable')));
  }
  set(id: string, data: session.SessionData, callback: (error?: unknown) => void = () => {}) {
    const expires = data.cookie.expires ? new Date(data.cookie.expires).valueOf() : Date.now() + 8 * 60 * 60 * 1000;
    void this.db.insert(sessions).values({ id: this.key(id), data: JSON.stringify(data), expires })
      .onDuplicateKeyUpdate({ set: { data: JSON.stringify(data), expires } })
      .then(async () => {
        if (Date.now() - this.lastCleanup > 60000) {
          this.lastCleanup = Date.now();
          await this.db.delete(sessions).where(lt(sessions.expires, Date.now()));
        }
        callback();
      }).catch(() => callback(new Error('Session unavailable')));
  }
  destroy(id: string, callback: (error?: unknown) => void = () => {}) {
    void this.db.delete(sessions).where(eq(sessions.id, this.key(id))).then(() => callback()).catch(() => callback(new Error('Session unavailable')));
  }
}
