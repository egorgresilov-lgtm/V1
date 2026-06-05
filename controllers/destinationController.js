const destinationService = require('../services/destinationService');

class DestinationController {
  async getAllDestinations(req, res) {
    try {
      const { color_palette, type } = req.query;
      const filters = {};
      
      if (color_palette) filters.color_palette = color_palette;
      if (type) filters.type = type;

      const destinations = await destinationService.getAllDestinations(filters);
      res.json(destinations);
    } catch (error) {
      console.error('Error getting destinations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getDestinationById(req, res) {
    try {
      const { id } = req.params;
      const destination = await destinationService.getDestinationById(id);
      
      if (!destination) {
        return res.status(404).json({ error: 'Destination not found' });
      }
      
      res.json(destination);
    } catch (error) {
      console.error('Error getting destination:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getDestinationsByColorPalette(req, res) {
    try {
      const { color_palette } = req.params;
      const destinations = await destinationService.getDestinationsByColorPalette(color_palette);
      res.json(destinations);
    } catch (error) {
      console.error('Error getting destinations by color:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMapPoints(req, res) {
    try {
      const points = await destinationService.getMapPoints();
      res.json(points);
    } catch (error) {
      console.error('Error getting map points:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createDestination(req, res) {
    try {
      const destination = await destinationService.createDestination(req.body, req.user.id);
      res.status(201).json(destination);
    } catch (error) {
      console.error('Error creating destination:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateDestination(req, res) {
    try {
      const { id } = req.params;
      const destination = await destinationService.updateDestination(id, req.body, req.user.id);
      
      if (!destination) {
        return res.status(404).json({ error: 'Destination not found' });
      }
      
      res.json(destination);
    } catch (error) {
      console.error('Error updating destination:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteDestination(req, res) {
    try {
      const { id } = req.params;
      const destination = await destinationService.deleteDestination(id, req.user.id);
      
      if (!destination) {
        return res.status(404).json({ error: 'Destination not found' });
      }
      
      res.json({ message: 'Destination deleted successfully' });
    } catch (error) {
      console.error('Error deleting destination:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new DestinationController();
