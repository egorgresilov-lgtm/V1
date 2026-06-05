const pool = require('../database/db');

class FactRepository {
  async findAll() {
    const result = await pool.query('SELECT * FROM random_facts ORDER BY created_at DESC');
    return result.rows;
  }

  async findRandom() {
    const result = await pool.query(
      'SELECT * FROM random_facts WHERE is_active = true ORDER BY RANDOM() LIMIT 1'
    );
    return result.rows[0] || null;
  }

  async create(fact) {
    const { fact_ru, fact_buryat, is_active = true } = fact;

    const result = await pool.query(
      'INSERT INTO random_facts (fact_ru, fact_buryat, is_active) VALUES ($1, $2, $3) RETURNING *',
      [fact_ru, fact_buryat, is_active]
    );
    return result.rows[0];
  }

  async update(id, fact) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(fact).forEach(key => {
      if (fact[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(fact[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE random_facts SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM random_facts WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}

module.exports = new FactRepository();
