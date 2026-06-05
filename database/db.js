// Database stub — PostgreSQL is optional.
// If DB_HOST is not configured, all queries will throw an error
// that controllers can catch and handle gracefully.

let pool = null;

try {
  if (process.env.DB_HOST) {
    const { Pool } = require('pg');
    pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle DB client:', err.message);
    });

    console.log('PostgreSQL pool initialized');
  } else {
    console.log('DB_HOST not set — running without PostgreSQL');
  }
} catch (e) {
  console.error('Failed to initialize DB pool:', e.message);
}

const stub = {
  query: async () => {
    throw new Error('Database not configured');
  }
};

module.exports = pool || stub;
