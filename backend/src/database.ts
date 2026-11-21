import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';

export function openDatabase(env = process.env) {
  if (!env.DB_HOST || !env.DB_NAME || !env.DB_USER || !env.DB_PASSWORD) throw new Error('Database configuration required');
  const port = Number(env.DB_PORT ?? 3306);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid database port');
  const pool = mysql.createPool({
    host: env.DB_HOST, port, database: env.DB_NAME, user: env.DB_USER, password: env.DB_PASSWORD,
    connectionLimit: 5, connectTimeout: 5000, charset: 'utf8mb4', dateStrings: true,
    // Explicit TLS verification, when enabled. No insecure certificate bypass.
    ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  });
  if (env.DB_SSL && !['true', 'false'].includes(env.DB_SSL)) throw new Error('Invalid database TLS setting');
  return { pool, db: drizzle(pool) };
}
export type Database = ReturnType<typeof openDatabase>['db'];
