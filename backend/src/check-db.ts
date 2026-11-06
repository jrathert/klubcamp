// Provide an opt-in database connectivity check; ordinary server startup never imports this file.
import mariadb from 'mariadb';
import { port, required, runCheck } from './check-support.js';

// Open one connection and verify a read-only query, closing it even if the query fails.
await runCheck('Database', async () => {
  const connection = await mariadb.createConnection({
    host: required('DB_HOST'), port: port('DB_PORT'),
    database: required('DB_NAME'), user: required('DB_USER'), password: required('DB_PASSWORD'),
    connectTimeout: 5000, socketTimeout: 5000,
  });
  try {
    const rows = await connection.query('SELECT 1 AS result');
    if (rows[0]?.result !== 1) throw new Error('Unexpected response');
  } finally {
    await connection.end();
  }
});
