const eventRepository = require('../repositories/eventRepository');
const { logActivity } = require('../utils/logger');

class EventService {
  async getAllEvents() {
    return await eventRepository.findAll();
  }

  async getUpcomingEvents() {
    return await eventRepository.findUpcoming();
  }

  async createEvent(event, userId) {
    const result = await eventRepository.create(event);
    await logActivity(userId, 'CREATE', 'event', result.id, { title: result.title_ru });
    return result;
  }

  async updateEvent(id, event, userId) {
    const result = await eventRepository.update(id, event);
    if (result) {
      await logActivity(userId, 'UPDATE', 'event', id, { changes: event });
    }
    return result;
  }

  async deleteEvent(id, userId) {
    const result = await eventRepository.delete(id);
    if (result) {
      await logActivity(userId, 'DELETE', 'event', id);
    }
    return result;
  }
}

module.exports = new EventService();
