const express = require('express');
const router = express.Router();
const factController = require('../controllers/factController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { cacheMiddleware } = require('../utils/redis');

router.get('/random', cacheMiddleware('random_fact', 300), factController.getRandomFact);
router.get('/', authenticateToken, authorizeRole('editor', 'super_admin'), factController.getAllFacts);
router.post('/', authenticateToken, authorizeRole('editor', 'super_admin'), factController.createFact);
router.put('/:id', authenticateToken, authorizeRole('editor', 'super_admin'), factController.updateFact);
router.delete('/:id', authenticateToken, authorizeRole('super_admin'), factController.deleteFact);

module.exports = router;
