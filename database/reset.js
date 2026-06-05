const { Client } = require('pg');
require('dotenv').config();

async function resetDatabase() {
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

    // Drop existing database
    await client.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`);
    console.log(`🗑️  Dropped existing database "${process.env.DB_NAME}"`);

    // Create fresh database
    await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    console.log(`✅ Created fresh database "${process.env.DB_NAME}"`);

    await client.end();
    console.log('\n✨ Database recreated successfully!');
    console.log('\n🔄 Now running migrations...\n');
    
    // Run migrations
    require('./migrate');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

resetDatabase();
