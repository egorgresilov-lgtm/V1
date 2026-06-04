const tourService = require('../services/tourService');

class TourController {
  async getAllTours(req, res) {
    try {
      const tours = await tourService.getAllTours();
      res.json(tours);
    } catch (error) {
      console.error('Error getting tours:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTourById(req, res) {
    try {
      const { id } = req.params;
      const tour = await tourService.getTourById(id);
      
      if (!tour) {
        return res.status(404).json({ error: 'Tour not found' });
      }
      
      res.json(tour);
    } catch (error) {
      console.error('Error getting tour:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createTour(req, res) {
    try {
      const tour = await tourService.createTour(req.body, req.user.id);
      res.status(201).json(tour);
    } catch (error) {
      console.error('Error creating tour:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateTour(req, res) {
    try {
      const { id } = req.params;
      const tour = await tourService.updateTour(id, req.body, req.user.id);
      
      if (!tour) {
        return res.status(404).json({ error: 'Tour not found' });
      }
      
      res.json(tour);
    } catch (error) {
      console.error('Error updating tour:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteTour(req, res) {
    try {
      const { id } = req.params;
      const tour = await tourService.deleteTour(id, req.user.id);
      
      if (!tour) {
        return res.status(404).json({ error: 'Tour not found' });
      }
      
      res.json({ message: 'Tour deleted successfully' });
    } catch (error) {
      console.error('Error deleting tour:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new TourController();
