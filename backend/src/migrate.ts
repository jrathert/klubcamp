import { migrate } from 'drizzle-orm/mysql2/migrator';
import { fileURLToPath } from 'node:url';
import { openDatabase } from './database.js';

let database: ReturnType<typeof openDatabase> | undefined;
try {
  database = openDatabase();
  // Advisory lock prevents concurrent migration invocations on this database.
  const connection = await database.pool.getConnection();
  try {
    const [rows] = await connection.query<import('mysql2').RowDataPacket[]>("SELECT GET_LOCK(CONCAT(DATABASE(), ':klubcamp-migrations'), 10) AS acquired");
    if (rows[0]?.acquired !== 1) throw new Error('Migration lock unavailable');
    try {
      await migrate(database.db, { migrationsFolder: fileURLToPath(new URL('../migrations/', import.meta.url)) });
      console.log('Database migrations completed.');
    } finally { await connection.query("SELECT RELEASE_LOCK(CONCAT(DATABASE(), ':klubcamp-migrations'))"); }
  } finally { connection.release(); }
} catch {
  console.error('Database migration failed. Check configuration and migration state before retrying.');
  process.exitCode = 1;
} finally { await database?.pool.end(); }
