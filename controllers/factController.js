const factService = require('../services/factService');

class FactController {
  async getRandomFact(req, res) {
    try {
      const fact = await factService.getRandomFact();
      
      if (!fact) {
        return res.status(404).json({ error: 'No facts available' });
      }
      
      res.json(fact);
    } catch (error) {
      console.error('Error getting random fact:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAllFacts(req, res) {
    try {
      const facts = await factService.getAllFacts();
      res.json(facts);
    } catch (error) {
      console.error('Error getting facts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createFact(req, res) {
    try {
      const fact = await factService.createFact(req.body, req.user.id);
      res.status(201).json(fact);
    } catch (error) {
      console.error('Error creating fact:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateFact(req, res) {
    try {
      const { id } = req.params;
      const fact = await factService.updateFact(id, req.body, req.user.id);

      if (!fact) {
        return res.status(404).json({ error: 'Fact not found' });
      }

      res.json(fact);
    } catch (error) {
      console.error('Error updating fact:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteFact(req, res) {
    try {
      const { id } = req.params;
      const fact = await factService.deleteFact(id, req.user.id);

      if (!fact) {
        return res.status(404).json({ error: 'Fact not found' });
      }

      res.json({ message: 'Fact deleted successfully' });
    } catch (error) {
      console.error('Error deleting fact:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new FactController();
