const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/', routeController.getAllRoutes);
router.get('/:id', routeController.getRouteById);
router.post('/', authenticateToken, authorizeRole('editor', 'super_admin'), routeController.createRoute);
router.put('/:id', authenticateToken, authorizeRole('editor', 'super_admin'), routeController.updateRoute);
router.delete('/:id', authenticateToken, authorizeRole('editor', 'super_admin'), routeController.deleteRoute);

module.exports = router;
