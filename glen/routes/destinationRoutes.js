const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { cacheMiddleware } = require('../utils/redis');

// Public routes
router.get('/', cacheMiddleware('destinations_all', 3600), destinationController.getAllDestinations);
router.get('/map/points', cacheMiddleware('map_points', 7200), destinationController.getMapPoints);
router.get('/:id', destinationController.getDestinationById);
router.get('/color/:color_palette', destinationController.getDestinationsByColorPalette);

// Protected routes (editor and above)
router.post('/', authenticateToken, authorizeRole('editor', 'super_admin'), destinationController.createDestination);
router.put('/:id', authenticateToken, authorizeRole('editor', 'super_admin'), destinationController.updateDestination);
router.delete('/:id', authenticateToken, authorizeRole('editor', 'super_admin'), destinationController.deleteDestination);

module.exports = router;
