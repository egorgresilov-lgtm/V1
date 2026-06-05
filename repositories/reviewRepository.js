const pool = require('../database/db');

class ReviewRepository {
  async findAll(status = null) {
    let query = 'SELECT * FROM reviews';
    const values = [];

    if (status) {
      query += ' WHERE status = $1';
      values.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findApproved() {
    const result = await pool.query(
      'SELECT * FROM reviews WHERE status = \'approved\' ORDER BY created_at DESC LIMIT 20'
    );
    return result.rows;
  }

  async create(review) {
    const { author, text, rating } = review;

    const result = await pool.query(
      `INSERT INTO reviews (author, text, rating, status) 
       VALUES ($1, $2, $3, 'pending') RETURNING *`,
      [author, text, rating]
    );
    return result.rows[0];
  }

  async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE reviews SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}

module.exports = new ReviewRepository();
