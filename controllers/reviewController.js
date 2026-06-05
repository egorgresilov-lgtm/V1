const reviewService = require('../services/reviewService');

class ReviewController {
  async getAllReviews(req, res) {
    try {
      const { status } = req.query;
      const reviews = await reviewService.getAllReviews(status);
      res.json(reviews);
    } catch (error) {
      console.error('Error getting reviews:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getApprovedReviews(req, res) {
    try {
      const reviews = await reviewService.getApprovedReviews();
      res.json(reviews);
    } catch (error) {
      console.error('Error getting approved reviews:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createReview(req, res) {
    try {
      const { author, text, rating } = req.body;

      if (!author || !text || !rating) {
        return res.status(400).json({ error: 'Author, text, and rating are required' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      const review = await reviewService.createReview({ author, text, rating });
      res.status(201).json(review);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateReviewStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const review = await reviewService.updateReviewStatus(id, status, req.user.id);

      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      res.json(review);
    } catch (error) {
      console.error('Error updating review status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteReview(req, res) {
    try {
      const { id } = req.params;
      const review = await reviewService.deleteReview(id, req.user.id);

      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new ReviewController();
