const pool = require('../database/db');

class TourRepository {
  async findAll() {
    const result = await pool.query('SELECT * FROM tours ORDER BY created_at DESC');
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query('SELECT * FROM tours WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(tour) {
    const { title, duration, difficulty, destination_ids, price, season } = tour;

    const result = await pool.query(
      `INSERT INTO tours (title, duration, difficulty, destination_ids, price, season) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, duration, difficulty, destination_ids, price, season]
    );
    return result.rows[0];
  }

  async update(id, tour) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(tour).forEach(key => {
      if (tour[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(tour[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE tours SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM tours WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}

module.exports = new TourRepository();
