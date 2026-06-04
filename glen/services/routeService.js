const routeRepository = require('../repositories/routeRepository');
const { logActivity } = require('../utils/logger');

class RouteService {
    async getAllRoutes() {
        return routeRepository.findAll();
    }

    async getRouteById(id) {
        return routeRepository.findById(id);
    }

    async createRoute(route, userId) {
        const result = await routeRepository.create(route);
        await logActivity(userId, 'CREATE', 'route', result.id, { slug: result.slug });
        return result;
    }

    async updateRoute(id, route, userId) {
        const result = await routeRepository.update(id, route);
        if (result) {
            await logActivity(userId, 'UPDATE', 'route', id, { slug: result.slug });
        }
        return result;
    }

    async deleteRoute(id, userId) {
        const result = await routeRepository.delete(id);
        if (result) {
            await logActivity(userId, 'DELETE', 'route', id, { slug: result.slug });
        }
        return result;
    }
}

module.exports = new RouteService();
