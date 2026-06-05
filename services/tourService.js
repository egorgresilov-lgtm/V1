const tourRepository = require('../repositories/tourRepository');
const { logActivity } = require('../utils/logger');

class TourService {
  async getAllTours() {
    return await tourRepository.findAll();
  }

  async getTourById(id) {
    return await tourRepository.findById(id);
  }

  async createTour(tour, userId) {
    const result = await tourRepository.create(tour);
    await logActivity(userId, 'CREATE', 'tour', result.id, { title: result.title });
    return result;
  }

  async updateTour(id, tour, userId) {
    const result = await tourRepository.update(id, tour);
    if (result) {
      await logActivity(userId, 'UPDATE', 'tour', id, { changes: tour });
    }
    return result;
  }

  async deleteTour(id, userId) {
    const result = await tourRepository.delete(id);
    if (result) {
      await logActivity(userId, 'DELETE', 'tour', id);
    }
    return result;
  }
}

module.exports = new TourService();
