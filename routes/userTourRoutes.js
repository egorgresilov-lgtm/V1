const express = require('express');
const router = express.Router();
const userTourController = require('../controllers/userTourController');
const { authenticateToken, optionalAuthenticateToken, authorizeRole } = require('../middleware/auth');

// Public routes
router.get('/community', userTourController.getPublishedTours);
router.get('/community/:id', optionalAuthenticateToken, userTourController.getTour);
router.post('/community', userTourController.createTour);

// Protected routes (require authentication)
router.get(
    '/admin/list',
    authenticateToken,
    authorizeRole('super_admin', 'editor'),
    userTourController.getAllToursAdmin
);
router.get('/my-tours', authenticateToken, userTourController.getUserTours);
router.put('/community/:id', authenticateToken, userTourController.updateTour);
router.delete('/community/:id', authenticateToken, userTourController.deleteTour);

// Rating and reviews
router.post('/community/:id/rate', authenticateToken, userTourController.rateTour);
router.post('/community/:id/reviews', authenticateToken, userTourController.addReview);
router.delete('/community/:id/reviews/:reviewId', authenticateToken, userTourController.deleteReview);

module.exports = router;
