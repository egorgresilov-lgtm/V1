const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { cacheMiddleware } = require('../utils/redis');

router.get('/', cacheMiddleware('events_all', 3600), eventController.getAllEvents);
router.get('/upcoming', cacheMiddleware('events_upcoming', 1800), eventController.getUpcomingEvents);
router.post('/', authenticateToken, authorizeRole('editor', 'super_admin'), eventController.createEvent);
router.put('/:id', authenticateToken, authorizeRole('editor', 'super_admin'), eventController.updateEvent);
router.delete('/:id', authenticateToken, authorizeRole('super_admin'), eventController.deleteEvent);

module.exports = router;
