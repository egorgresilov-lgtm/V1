const pool = require('../database/db');

class UserRepository {
  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  async findById(id) {
    const result = await pool.query('SELECT id, email, role, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(email, passwordHash, role = 'user') {
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
      [email, passwordHash, role]
    );
    return result.rows[0];
  }

  async updateRole(id, role) {
    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, role',
      [role, id]
    );
    return result.rows[0];
  }

  async findAll() {
    const result = await pool.query('SELECT id, email, role, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  }
}

module.exports = new UserRepository();
