const eventService = require('../services/eventService');

class EventController {
  async getAllEvents(req, res) {
    try {
      const events = await eventService.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error('Error getting events:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUpcomingEvents(req, res) {
    try {
      const events = await eventService.getUpcomingEvents();
      res.json(events);
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createEvent(req, res) {
    try {
      const event = await eventService.createEvent(req.body, req.user.id);
      res.status(201).json(event);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const event = await eventService.updateEvent(id, req.body, req.user.id);
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      res.json(event);
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteEvent(req, res) {
    try {
      const { id } = req.params;
      const event = await eventService.deleteEvent(id, req.user.id);
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new EventController();
