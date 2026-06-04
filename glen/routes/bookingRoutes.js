const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { bookingLimiter } = require('../middleware/rateLimiter');

router.get('/', authenticateToken, authorizeRole('editor', 'super_admin'), bookingController.getAllBookings);
router.get('/:id', authenticateToken, authorizeRole('editor', 'super_admin'), bookingController.getBookingById);
router.post('/', bookingLimiter, bookingController.createBooking);
router.patch('/:id/status', authenticateToken, authorizeRole('editor', 'super_admin'), bookingController.updateBookingStatus);
router.delete('/:id', authenticateToken, authorizeRole('super_admin'), bookingController.deleteBooking);

module.exports = router;
