const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  // Connect to default postgres database to create our database
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: 'postgres',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server...');

    // Check if database exists
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );

    if (res.rows.length === 0) {
      // Database doesn't exist, create it
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`✅ Database "${process.env.DB_NAME}" created successfully!`);
    } else {
      console.log(`ℹ️  Database "${process.env.DB_NAME}" already exists.`);
    }

    await client.end();
    console.log('Database setup complete!');
    
    // Now run migrations
    console.log('\n🔄 Running migrations...');
    require('./migrate');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

createDatabase();
