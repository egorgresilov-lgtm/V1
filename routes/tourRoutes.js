const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/', tourController.getAllTours);
router.get('/:id', tourController.getTourById);
router.post('/', authenticateToken, authorizeRole('editor', 'super_admin'), tourController.createTour);
router.put('/:id', authenticateToken, authorizeRole('editor', 'super_admin'), tourController.updateTour);
router.delete('/:id', authenticateToken, authorizeRole('super_admin'), tourController.deleteTour);

module.exports = router;
