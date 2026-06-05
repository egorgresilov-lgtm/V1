const pool = require('../database/db');

class EventRepository {
  async findAll() {
    const result = await pool.query('SELECT * FROM traditional_events ORDER BY event_date ASC');
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query('SELECT * FROM traditional_events WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findUpcoming() {
    const result = await pool.query(
      'SELECT * FROM traditional_events WHERE event_date >= CURRENT_DATE ORDER BY event_date ASC LIMIT 10'
    );
    return result.rows;
  }

  async create(event) {
    const { title_ru, title_buryat, description_ru, description_buryat, event_date, type } = event;

    const result = await pool.query(
      `INSERT INTO traditional_events (title_ru, title_buryat, description_ru, description_buryat, 
       event_date, type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title_ru, title_buryat, description_ru, description_buryat, event_date, type]
    );
    return result.rows[0];
  }

  async update(id, event) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(event).forEach(key => {
      if (event[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(event[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE traditional_events SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM traditional_events WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}

module.exports = new EventRepository();
