const routeService = require('../services/routeService');

class RouteController {
    async getAllRoutes(req, res) {
        try {
            const routes = await routeService.getAllRoutes();
            res.json(routes);
        } catch (error) {
            console.error('Error getting routes:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getRouteById(req, res) {
        try {
            const route = await routeService.getRouteById(req.params.id);
            if (!route) return res.status(404).json({ error: 'Route not found' });
            res.json(route);
        } catch (error) {
            console.error('Error getting route:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async createRoute(req, res) {
        try {
            const route = await routeService.createRoute(req.body, req.user.id);
            res.status(201).json(route);
        } catch (error) {
            console.error('Error creating route:', error);
            const msg = error.message || 'Internal server error';
            res.status(msg.includes('slug') ? 400 : 500).json({ error: msg });
        }
    }

    async updateRoute(req, res) {
        try {
            const route = await routeService.updateRoute(req.params.id, req.body, req.user.id);
            if (!route) return res.status(404).json({ error: 'Route not found' });
            res.json(route);
        } catch (error) {
            console.error('Error updating route:', error);
            const msg = error.message || 'Internal server error';
            res.status(msg.includes('slug') ? 400 : 500).json({ error: msg });
        }
    }

    async deleteRoute(req, res) {
        try {
            const route = await routeService.deleteRoute(req.params.id, req.user.id);
            if (!route) return res.status(404).json({ error: 'Route not found' });
            res.json({ message: 'Route deleted successfully' });
        } catch (error) {
            console.error('Error deleting route:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new RouteController();
