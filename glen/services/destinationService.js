const destinationRepository = require('../repositories/destinationRepository');
const { logActivity } = require('../utils/logger');

class DestinationService {
  async getAllDestinations(filters = {}) {
    return await destinationRepository.findAll(filters);
  }

  async getDestinationById(id) {
    return await destinationRepository.findById(id);
  }

  async getDestinationsByColorPalette(colorPalette) {
    return await destinationRepository.findByColorPalette(colorPalette);
  }

  async getMapPoints() {
    return await destinationRepository.findAllWithCoordinates();
  }

  async createDestination(destination, userId) {
    const result = await destinationRepository.create(destination);
    await logActivity(userId, 'CREATE', 'destination', result.id, { name: result.name_ru });
    return result;
  }

  async updateDestination(id, destination, userId) {
    const result = await destinationRepository.update(id, destination);
    if (result) {
      await logActivity(userId, 'UPDATE', 'destination', id, { changes: destination });
    }
    return result;
  }

  async deleteDestination(id, userId) {
    const result = await destinationRepository.delete(id);
    if (result) {
      await logActivity(userId, 'DELETE', 'destination', id);
    }
    return result;
  }
}

module.exports = new DestinationService();
