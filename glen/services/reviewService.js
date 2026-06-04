const reviewRepository = require('../repositories/reviewRepository');
const { logActivity } = require('../utils/logger');

class ReviewService {
  async getAllReviews(status = null) {
    return await reviewRepository.findAll(status);
  }

  async getApprovedReviews() {
    return await reviewRepository.findApproved();
  }

  async createReview(review) {
    return await reviewRepository.create(review);
  }

  async updateReviewStatus(id, status, userId) {
    const result = await reviewRepository.updateStatus(id, status);
    if (result) {
      await logActivity(userId, 'MODERATE_REVIEW', 'review', id, { status });
    }
    return result;
  }

  async deleteReview(id, userId) {
    const result = await reviewRepository.delete(id);
    if (result) {
      await logActivity(userId, 'DELETE', 'review', id);
    }
    return result;
  }
}

module.exports = new ReviewService();
