const pool = require('../database/db');

class BookingRepository {
  async findAll() {
    const result = await pool.query(`
      SELECT b.*, t.title as tour_title 
      FROM bookings b 
      LEFT JOIN tours t ON b.tour_id = t.id 
      ORDER BY b.created_at DESC
    `);
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(`
      SELECT b.*, t.title as tour_title 
      FROM bookings b 
      LEFT JOIN tours t ON b.tour_id = t.id 
      WHERE b.id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  async create(booking) {
    const { full_name, email, phone, tour_id, booking_date, number_of_people, wishes } = booking;

    try {
      const result = await pool.query(
        `INSERT INTO bookings (full_name, email, phone, tour_id, booking_date, 
         number_of_people, wishes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [full_name, email, phone, tour_id, booking_date, number_of_people, wishes]
      );
      return { success: true, booking: result.rows[0] };
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        return { success: false, error: 'Duplicate booking detected for this date and tour' };
      }
      throw error;
    }
  }

  async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM bookings WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}

module.exports = new BookingRepository();
