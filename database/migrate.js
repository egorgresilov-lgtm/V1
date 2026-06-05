const pool = require('./db');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'guest' CHECK (role IN ('guest', 'user', 'editor', 'super_admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Destinations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS destinations (
        id SERIAL PRIMARY KEY,
        name_ru VARCHAR(255) NOT NULL,
        name_buryat VARCHAR(255),
        description_ru TEXT,
        description_buryat TEXT,
        banner_title TEXT,
        full_description TEXT,
        activities TEXT[],
        tip TEXT,
        color_palette VARCHAR(50) CHECK (color_palette IN ('baikal', 'datsan', 'steppe', 'sun')),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        image_url TEXT,
        type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Backward-compatible schema updates (for existing DBs)
    await client.query(`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS banner_title TEXT`);
    await client.query(`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS full_description TEXT`);
    await client.query(`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS activities TEXT[]`);
    await client.query(`ALTER TABLE destinations ADD COLUMN IF NOT EXISTS tip TEXT`);

    // Tours table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tours (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        duration VARCHAR(100),
        difficulty VARCHAR(50) CHECK (difficulty IN ('easy', 'medium', 'hard')),
        destination_ids INTEGER[],
        price DECIMAL(10, 2),
        season VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Traditional Events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS traditional_events (
        id SERIAL PRIMARY KEY,
        title_ru VARCHAR(255) NOT NULL,
        title_buryat VARCHAR(255),
        description_ru TEXT,
        description_buryat TEXT,
        event_date DATE,
        type VARCHAR(50) CHECK (type IN ('holiday', 'food', 'ritual')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        author VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bookings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        tour_id INTEGER REFERENCES tours(id),
        booking_date DATE NOT NULL,
        number_of_people INTEGER NOT NULL,
        wishes TEXT,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(email, tour_id, booking_date)
      )
    `);

    // Random Facts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS random_facts (
        id SERIAL PRIMARY KEY,
        fact_ru TEXT NOT NULL,
        fact_buryat TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Refresh Tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Activity Log table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(100),
        entity_id INTEGER,
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_destinations_name_unique ON destinations(name_ru)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_destinations_color ON destinations(color_palette)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_destinations_type ON destinations(type)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_email_tour_date ON bookings(email, tour_id, booking_date)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_events_date ON traditional_events(event_date)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status)`);

    await client.query('COMMIT');
    console.log('Database tables created successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

createTables()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
