const bookingRepository = require('../repositories/bookingRepository');
const { logActivity } = require('../utils/logger');

class BookingService {
  async getAllBookings() {
    return await bookingRepository.findAll();
  }

  async getBookingById(id) {
    return await bookingRepository.findById(id);
  }

  async createBooking(booking) {
    const result = await bookingRepository.create(booking);
    return result;
  }

  async updateBookingStatus(id, status, userId) {
    const result = await bookingRepository.updateStatus(id, status);
    if (result) {
      await logActivity(userId, 'UPDATE_STATUS', 'booking', id, { status });
    }
    return result;
  }

  async deleteBooking(id, userId) {
    const result = await bookingRepository.delete(id);
    if (result) {
      await logActivity(userId, 'DELETE', 'booking', id);
    }
    return result;
  }
}

module.exports = new BookingService();
