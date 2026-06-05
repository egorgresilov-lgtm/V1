const userTourService = require('../services/userTourService');

function isAdminUser(user) {
    return user && ['super_admin', 'editor', 'admin'].includes(user.role);
}

class UserTourController {
    // Create new tour
    async createTour(req, res) {
        try {
            // Use default user ID 0 for anonymous users
            const userId = req.user?.id || 0;
            const { tour, points } = req.body;

            if (!tour || !tour.title || !tour.short_desc || !tour.duration_days) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const newTour = await userTourService.createTour(userId, tour, points);
            res.status(201).json(newTour);
        } catch (error) {
            console.error('Error creating tour:', error);
            res.status(500).json({ error: 'Failed to create tour' });
        }
    }

    // Get user's tours
    async getUserTours(req, res) {
        try {
            const userId = req.user.id;
            const tours = await userTourService.getUserTours(userId);
            res.json(tours);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch tours' });
        }
    }

    // Get published tours (public)
    async getPublishedTours(req, res) {
        try {
            const filters = {
                difficulty: req.query.difficulty,
                season: req.query.season,
                minRating: req.query.minRating ? parseFloat(req.query.minRating) : null,
                limit: req.query.limit ? parseInt(req.query.limit) : 50,
                offset: req.query.offset ? parseInt(req.query.offset) : 0
            };

            const tours = await userTourService.getPublishedTours(filters);
            res.json(tours);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch tours' });
        }
    }

    // List all community tours (admin)
    async getAllToursAdmin(req, res) {
        try {
            const tours = await userTourService.getAllToursForAdmin();
            res.json(tours);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch tours' });
        }
    }

    // Get tour details
    async getTour(req, res) {
        try {
            const tourId = parseInt(req.params.id);
            const userId = req.user?.id || null;
            const isAdmin = isAdminUser(req.user);

            const tour = await userTourService.getTour(tourId, userId, { isAdmin });
            res.json(tour);
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('not available')) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to fetch tour' });
            }
        }
    }

    // Update tour
    async updateTour(req, res) {
        try {
            const tourId = parseInt(req.params.id);
            const userId = req.user.id;
            const isAdmin = isAdminUser(req.user);
            const { tour, points } = req.body;

            const updatedTour = await userTourService.updateTour(tourId, tour, userId, isAdmin);
            
            if (points) {
                await userTourService.updateTourPoints(tourId, points);
            }

            res.json(updatedTour);
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('Not authorized')) {
                res.status(403).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to update tour' });
            }
        }
    }

    // Delete tour
    async deleteTour(req, res) {
        try {
            const tourId = parseInt(req.params.id);
            const userId = req.user.id;
            const isAdmin = isAdminUser(req.user);

            await userTourService.deleteTour(tourId, userId, isAdmin);
            res.json({ success: true });
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('not authorized')) {
                res.status(403).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to delete tour' });
            }
        }
    }

    // Rate tour
    async rateTour(req, res) {
        try {
            const tourId = parseInt(req.params.id);
            const userId = req.user.id;
            const { rating } = req.body;

            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({ error: 'Rating must be between 1 and 5' });
            }

            await userTourService.rateTour(tourId, userId, rating);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Add review
    async addReview(req, res) {
        try {
            const tourId = parseInt(req.params.id);
            const userId = req.user.id;
            const { text } = req.body;

            if (!text || text.trim().length === 0) {
                return res.status(400).json({ error: 'Review text is required' });
            }

            const review = await userTourService.addReview(tourId, userId, text);
            res.status(201).json(review);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Delete review
    async deleteReview(req, res) {
        try {
            const reviewId = parseInt(req.params.reviewId);
            const userId = req.user.id;
            const isAdmin = isAdminUser(req.user);

            await userTourService.deleteReview(reviewId, userId, isAdmin);
            res.json({ success: true });
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('not authorized')) {
                res.status(403).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to delete review' });
            }
        }
    }
}

module.exports = new UserTourController();
