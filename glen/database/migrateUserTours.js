const db = require('../database/db');

async function createUserToursTables() {
    console.log('Creating user tours tables...');

    try {
        // Create user_tours table
        await db.query(`
            CREATE TABLE IF NOT EXISTS user_tours (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                title VARCHAR(100) NOT NULL,
                short_desc VARCHAR(200) NOT NULL,
                full_desc TEXT,
                duration_days INTEGER NOT NULL DEFAULT 1,
                difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
                season VARCHAR(50) DEFAULT 'year-round',
                price INTEGER,
                main_photo_url TEXT,
                status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'hidden')),
                avg_rating DECIMAL(3,2) DEFAULT 0.00,
                views_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ user_tours table created');

        // Alter table to remove foreign key constraint if it exists
        try {
            await db.query(`
                ALTER TABLE user_tours
                DROP CONSTRAINT IF EXISTS user_tours_user_id_fkey
            `);
            console.log('✓ Foreign key constraint removed from user_tours.user_id');
        } catch (error) {
            console.log('Note: Foreign key constraint did not exist or could not be removed:', error.message);
        }

        // Create tour_points table
        await db.query(`
            CREATE TABLE IF NOT EXISTS tour_points (
                id SERIAL PRIMARY KEY,
                tour_id INTEGER REFERENCES user_tours(id) ON DELETE CASCADE,
                destination_id INTEGER REFERENCES destinations(id),
                order_index INTEGER NOT NULL,
                stay_hours INTEGER,
                custom_place_name VARCHAR(200),
                custom_description TEXT,
                latitude DECIMAL(9,6),
                longitude DECIMAL(9,6),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ tour_points table created');

        // Create tour_ratings table
        await db.query(`
            CREATE TABLE IF NOT EXISTS tour_ratings (
                id SERIAL PRIMARY KEY,
                tour_id INTEGER REFERENCES user_tours(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(tour_id, user_id)
            )
        `);
        console.log('✓ tour_ratings table created');

        // Create tour_reviews table
        await db.query(`
            CREATE TABLE IF NOT EXISTS tour_reviews (
                id SERIAL PRIMARY KEY,
                tour_id INTEGER REFERENCES user_tours(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ tour_reviews table created');

        // Create indexes for better performance
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_user_tours_user_id ON user_tours(user_id);
            CREATE INDEX IF NOT EXISTS idx_user_tours_status ON user_tours(status);
            CREATE INDEX IF NOT EXISTS idx_tour_points_tour_id ON tour_points(tour_id);
            CREATE INDEX IF NOT EXISTS idx_tour_ratings_tour_id ON tour_ratings(tour_id);
            CREATE INDEX IF NOT EXISTS idx_tour_reviews_tour_id ON tour_reviews(tour_id);
        `);
        console.log('✓ Indexes created');

        console.log('User tours tables created successfully!');
    } catch (error) {
        console.error('Error creating user tours tables:', error);
        throw error;
    }
}

// Run if executed directly
if (require.main === module) {
    createUserToursTables()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

module.exports = { createUserToursTables };
