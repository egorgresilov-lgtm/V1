const fs = require('fs');
const path = require('path');
const destinationRepo = require('./destinationRepository');
const attractionCoords = require('../utils/attractionCoordinates');

const DATA_FILE = path.join(
  __dirname,
  "..",
  "database",
  "user_tours_data.json",
);

// Initialize data file if it doesn't exist
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = {
      tours: [],
      points: [],
      ratings: [],
      reviews: [],
      nextId: 1,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (e) {
    const initial = {
      tours: [],
      points: [],
      ratings: [],
      reviews: [],
      nextId: 1,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

class UserTourRepository {
  // Create a new user tour
  async createTour(tourData, userId) {
    const data = loadData();

    const tour = {
      id: data.nextId++,
      user_id: userId || 0,
      title: tourData.title,
      short_desc: tourData.short_desc,
      full_desc: tourData.full_desc || "",
      duration_days: tourData.duration_days,
      difficulty: tourData.difficulty || "medium",
      season: tourData.season || "year-round",
      price: tourData.price || null,
      main_photo_url: tourData.main_photo_url || null,
      status: tourData.status || "draft",
      avg_rating: 0,
      views_count: 0,
      author_name: "Аноним",
      author_email: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    data.tours.push(tour);
    saveData(data);
    return tour;
  }

  // Get tour by ID
  async getTourById(tourId) {
    const data = loadData();
    return data.tours.find((t) => t.id === tourId) || null;
  }

  // Get user's tours
  async getUserTours(userId, status = null) {
    const data = loadData();
    let tours = data.tours.filter((t) => t.user_id === userId);
    if (status) tours = tours.filter((t) => t.status === status);
    return tours.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  }

  // Get all tours (admin)
  async getAllTours() {
    const data = loadData();
    return data.tours
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Get published tours (for public listing)
  async getPublishedTours(filters = {}) {
    const data = loadData();
    let tours = data.tours.filter((t) => t.status === "published");

    if (filters.difficulty)
      tours = tours.filter((t) => t.difficulty === filters.difficulty);
    if (filters.season)
      tours = tours.filter((t) => t.season === filters.season);
    if (filters.minRating)
      tours = tours.filter((t) => t.avg_rating >= filters.minRating);

    tours.sort(
      (a, b) =>
        b.avg_rating - a.avg_rating ||
        new Date(b.created_at) - new Date(a.created_at),
    );

    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    return tours.slice(offset, offset + limit);
  }

  // Update tour
  async updateTour(tourId, updates, userId, isAdmin = false) {
    const data = loadData();
    const idx = data.tours.findIndex((t) => t.id === tourId);
    if (idx === -1) return null;

    if (!isAdmin && data.tours[idx].user_id !== userId) return null;

    data.tours[idx] = {
      ...data.tours[idx],
      ...updates,
      id: tourId,
      updated_at: new Date().toISOString(),
    };
    saveData(data);
    return data.tours[idx];
  }

  // Delete tour
  async deleteTour(tourId, userId, isAdmin = false) {
    const data = loadData();
    const idx = data.tours.findIndex((t) => t.id === tourId);
    if (idx === -1) return null;

    if (!isAdmin && data.tours[idx].user_id !== userId) return null;

    const deleted = data.tours.splice(idx, 1)[0];
    // Also remove related points, ratings, reviews
    data.points = data.points.filter((p) => p.tour_id !== tourId);
    data.ratings = data.ratings.filter((r) => r.tour_id !== tourId);
    data.reviews = data.reviews.filter((r) => r.tour_id !== tourId);
    saveData(data);
    return { id: deleted.id };
  }

  // Add point to tour
  async addPoint(tourId, pointData) {
      const data = loadData();

      // Enrich with destination data if available
      let dest_name = pointData.custom_place_name || null;
      let dest_desc  = pointData.custom_description || null;
      let dest_image = null;
      let lat = pointData.latitude || null;
      let lon = pointData.longitude || null;

      if (pointData.destination_id) {
          try {
              const dest = await destinationRepo.findById(pointData.destination_id);
              if (dest) {
                  dest_name  = dest_name  || dest.name_ru;
                  dest_desc  = dest_desc  || dest.description_ru;
                  dest_image = dest.image_url || null;
              }
          } catch(e) {}
      }

      const resolved = attractionCoords.resolveTourPointCoordinates({
          destination_name: dest_name,
          custom_place_name: pointData.custom_place_name,
          latitude: lat,
          longitude: lon
      });
      if (resolved) {
          lat = resolved.lat;
          lon = resolved.lng;
      }

      const point = {
          id: Date.now() + Math.random(),
          tour_id: tourId,
          destination_id: pointData.destination_id || null,
          destination_name: dest_name,
          destination_description: dest_desc,
          destination_image: dest_image,
          order_index: pointData.order_index || 0,
          stay_hours: pointData.stay_hours || 2,
          custom_place_name: pointData.custom_place_name || null,
          custom_description: pointData.custom_description || null,
          latitude: lat,
          longitude: lon,
      };
      data.points.push(point);
      saveData(data);
      return point;
  }

  // Get tour points — enrich with destination data on the fly
  async getTourPoints(tourId) {
      const data = loadData();
      const points = data.points
          .filter((p) => p.tour_id === tourId)
          .sort((a, b) => a.order_index - b.order_index);

      // For points that already have cached names/images — use them.
      // For legacy points (id from old DB) — try to look up by destination_id.
      for (const p of points) {
          if (!p.destination_name && p.destination_id) {
              try {
                  const dest = await destinationRepo.findById(p.destination_id);
                  if (dest) {
                      p.destination_name        = dest.name_ru;
                      p.destination_description = dest.description_ru;
                      p.destination_image       = dest.image_url || null;
                  }
              } catch(e) {}
          }

          const resolved = attractionCoords.resolveTourPointCoordinates(p);
          if (resolved) {
              p.latitude = resolved.lat;
              p.longitude = resolved.lng;
          }
      }
      return points;
  }

  // Update tour points (replace all)
  async updateTourPoints(tourId, points) {
    const data = loadData();
    data.points = data.points.filter((p) => p.tour_id !== tourId);
    saveData(data);

    const inserted = [];
    for (const point of points) {
      const result = await this.addPoint(tourId, point);
      inserted.push(result);
    }
    return inserted;
  }

  // Rate a tour
  async rateTour(tourId, userId, rating) {
    const data = loadData();
    const idx = data.ratings.findIndex(
      (r) => r.tour_id === tourId && r.user_id === userId,
    );
    const ratingObj = { tour_id: tourId, user_id: userId, rating };

    if (idx !== -1) {
      data.ratings[idx] = ratingObj;
    } else {
      data.ratings.push(ratingObj);
    }
    saveData(data);
    await this.updateAverageRating(tourId);
    return ratingObj;
  }

  // Update average rating
  async updateAverageRating(tourId) {
    const data = loadData();
    const tourRatings = data.ratings.filter((r) => r.tour_id === tourId);
    const avg =
      tourRatings.length > 0
        ? tourRatings.reduce((sum, r) => sum + r.rating, 0) / tourRatings.length
        : 0;

    const idx = data.tours.findIndex((t) => t.id === tourId);
    if (idx !== -1) {
      data.tours[idx].avg_rating = avg;
      saveData(data);
    }
    return avg;
  }

  // Get tour rating by user
  async getUserRating(tourId, userId) {
    const data = loadData();
    return (
      data.ratings.find((r) => r.tour_id === tourId && r.user_id === userId) ||
      null
    );
  }

  // Add review
  async addReview(tourId, userId, text) {
    const data = loadData();
    const review = {
      id: Date.now(),
      tour_id: tourId,
      user_id: userId,
      text,
      author_name: "Аноним",
      created_at: new Date().toISOString(),
    };
    data.reviews.push(review);
    saveData(data);
    return review;
  }

  // Get tour reviews
  async getTourReviews(tourId) {
    const data = loadData();
    return data.reviews
      .filter((r) => r.tour_id === tourId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Delete review
  async deleteReview(reviewId, userId, isAdmin = false) {
    const data = loadData();
    const idx = data.reviews.findIndex((r) => r.id === reviewId);
    if (idx === -1) return null;

    if (!isAdmin && data.reviews[idx].user_id !== userId) return null;

    const deleted = data.reviews.splice(idx, 1)[0];
    saveData(data);
    return { id: deleted.id };
  }

  // Increment views
  async incrementViews(tourId) {
    const data = loadData();
    const idx = data.tours.findIndex((t) => t.id === tourId);
    if (idx !== -1) {
      data.tours[idx].views_count = (data.tours[idx].views_count || 0) + 1;
      saveData(data);
    }
  }
}

module.exports = new UserTourRepository();
