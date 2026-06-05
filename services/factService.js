const factRepository = require('../repositories/factRepository');
const { logActivity } = require('../utils/logger');

class FactService {
  async getRandomFact() {
    return await factRepository.findRandom();
  }

  async getAllFacts() {
    return await factRepository.findAll();
  }

  async createFact(fact, userId) {
    const result = await factRepository.create(fact);
    await logActivity(userId, 'CREATE', 'fact', result.id);
    return result;
  }

  async updateFact(id, fact, userId) {
    const result = await factRepository.update(id, fact);
    if (result) {
      await logActivity(userId, 'UPDATE', 'fact', id, { changes: fact });
    }
    return result;
  }

  async deleteFact(id, userId) {
    const result = await factRepository.delete(id);
    if (result) {
      await logActivity(userId, 'DELETE', 'fact', id);
    }
    return result;
  }
}

module.exports = new FactService();
