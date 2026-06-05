const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/', reviewController.getAllReviews);
router.get('/approved', reviewController.getApprovedReviews);
router.post('/', reviewController.createReview);
router.patch('/:id/status', authenticateToken, authorizeRole('editor', 'super_admin'), reviewController.updateReviewStatus);
router.delete('/:id', authenticateToken, authorizeRole('editor', 'super_admin'), reviewController.deleteReview);

module.exports = router;
