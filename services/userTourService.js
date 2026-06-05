const userTourRepository = require('../repositories/userTourRepository');
const logger = require('../utils/logger');

class UserTourService {
    async createTour(userId, tourData, points = []) {
        try {
            const tour = await userTourRepository.createTour(tourData, userId);

            if (points.length > 0) {
                await userTourRepository.updateTourPoints(tour.id, points);
            }

            // If no cover photo — use the first point's destination image
            if (!tour.main_photo_url && points.length > 0) {
                const destRepo = require('../repositories/destinationRepository');
                for (const p of points) {
                    if (p.destination_id) {
                        const dest = await destRepo.findById(p.destination_id);
                        if (dest && dest.image_url) {
                            await userTourRepository.updateTour(tour.id, { main_photo_url: dest.image_url }, userId, true);
                            tour.main_photo_url = dest.image_url;
                            break;
                        }
                    }
                }
            }

            logger.info(`User ${userId} created tour ${tour.id}`);
            return tour;
        } catch (error) {
            logger.error('Error creating tour:', error);
            throw error;
        }
    }

    async getAllToursForAdmin() {
        const tours = await userTourRepository.getAllTours();
        const data = await Promise.all(
            tours.map(async (tour) => {
                const points = await userTourRepository.getTourPoints(tour.id);
                return { ...tour, points_count: points.length };
            })
        );
        return data;
    }

    async getTour(tourId, userId = null, options = {}) {
        const { isAdmin = false } = options;
        const tour = await userTourRepository.getTourById(tourId);

        if (!tour) {
            throw new Error('Tour not found');
        }

        // Only allow viewing if published, user is owner, or admin
        if (
            tour.status !== 'published' &&
            !isAdmin &&
            (!userId || tour.user_id !== userId)
        ) {
            throw new Error('Tour not available');
        }

        if (!isAdmin) {
            await userTourRepository.incrementViews(tourId);
        }

        const points = await userTourRepository.getTourPoints(tourId);
        const reviews = await userTourRepository.getTourReviews(tourId);

        let userRating = null;
        if (userId) {
            userRating = await userTourRepository.getUserRating(tourId, userId);
        }

        return {
            ...tour,
            points,
            reviews,
            user_rating: userRating?.rating || null
        };
    }

    async getUserTours(userId) {
        return await userTourRepository.getUserTours(userId);
    }

    async getPublishedTours(filters = {}) {
        return await userTourRepository.getPublishedTours(filters);
    }

    async updateTour(tourId, updates, userId, isAdmin = false) {
        const tour = await userTourRepository.getTourById(tourId);

        if (!tour) {
            throw new Error('Tour not found');
        }

        if (!isAdmin && tour.user_id !== userId) {
            throw new Error('Not authorized');
        }

        return await userTourRepository.updateTour(tourId, updates, userId, isAdmin);
    }

    async updateTourPoints(tourId, points) {
        return await userTourRepository.updateTourPoints(tourId, points);
    }

    async deleteTour(tourId, userId, isAdmin = false) {
        const result = await userTourRepository.deleteTour(tourId, userId, isAdmin);

        if (!result) {
            throw new Error('Tour not found or not authorized');
        }

        logger.info(`Tour ${tourId} deleted by user ${userId}`);
        return result;
    }

    async rateTour(tourId, userId, rating) {
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        const tour = await userTourRepository.getTourById(tourId);
        if (!tour || tour.status !== 'published') {
            throw new Error('Tour not available');
        }

        return await userTourRepository.rateTour(tourId, userId, rating);
    }

    async addReview(tourId, userId, text) {
        if (!text || text.trim().length === 0) {
            throw new Error('Review text is required');
        }

        const tour = await userTourRepository.getTourById(tourId);
        if (!tour || tour.status !== 'published') {
            throw new Error('Tour not available');
        }

        return await userTourRepository.addReview(tourId, userId, text);
    }

    async deleteReview(reviewId, userId, isAdmin = false) {
        const result = await userTourRepository.deleteReview(reviewId, userId, isAdmin);

        if (!result) {
            throw new Error('Review not found or not authorized');
        }

        return result;
    }
}

module.exports = new UserTourService();
