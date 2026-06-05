const bookingService = require('../services/bookingService');

class BookingController {
  async getAllBookings(req, res) {
    try {
      const bookings = await bookingService.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error('Error getting bookings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getBookingById(req, res) {
    try {
      const { id } = req.params;
      const booking = await bookingService.getBookingById(id);
      
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      
      res.json(booking);
    } catch (error) {
      console.error('Error getting booking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createBooking(req, res) {
    try {
      const result = await bookingService.createBooking(req.body);
      
      if (!result.success) {
        return res.status(409).json({ error: result.error });
      }
      
      // TODO: Send email notification to user and admin
      
      res.status(201).json(result.booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const booking = await bookingService.updateBookingStatus(id, status, req.user.id);
      
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      
      res.json(booking);
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteBooking(req, res) {
    try {
      const { id } = req.params;
      const booking = await bookingService.deleteBooking(id, req.user.id);
      
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      
      res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
      console.error('Error deleting booking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new BookingController();
