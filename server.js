const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

// Multer storage for tour photos
const TOURS_UPLOAD_DIR = path.join(__dirname, 'public', 'images', 'tours');
if (!fs.existsSync(TOURS_UPLOAD_DIR)) fs.mkdirSync(TOURS_UPLOAD_DIR, { recursive: true });

const tourPhotoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, TOURS_UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `tour_${Date.now()}${ext}`);
    }
});
const uploadTourPhoto = multer({
    storage: tourPhotoStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images allowed'));
    }
});

const ATTRACTIONS_UPLOAD_DIR = path.join(__dirname, 'public', 'images', 'attractions');
if (!fs.existsSync(ATTRACTIONS_UPLOAD_DIR)) fs.mkdirSync(ATTRACTIONS_UPLOAD_DIR, { recursive: true });

const attractionPhotoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, ATTRACTIONS_UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, `attr_${Date.now()}${ext}`);
    }
});
const uploadAttractionPhoto = multer({
    storage: attractionPhotoStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images allowed'));
    }
});

const ROUTES_UPLOAD_DIR = path.join(__dirname, 'public', 'images', 'routes');
if (!fs.existsSync(ROUTES_UPLOAD_DIR)) fs.mkdirSync(ROUTES_UPLOAD_DIR, { recursive: true });

const routePhotoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, ROUTES_UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, `route_${Date.now()}${ext}`);
    }
});
const uploadRoutePhoto = multer({
    storage: routePhotoStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images allowed'));
    }
});

const { authenticateToken, authorizeRole } = require('./middleware/auth');

const { generalLimiter } = require('./middleware/rateLimiter');

// Load routes with error handling
let authRoutes, destinationRoutes, tourRoutes, eventRoutes, bookingRoutes, reviewRoutes, factRoutes, userTourRoutes, routeRoutes;

try { authRoutes = require('./routes/authRoutes'); } catch (e) { console.error('Failed to load authRoutes:', e.message); authRoutes = (req,res) => res.status(500).json({error: 'auth route error'}); }
try { destinationRoutes = require('./routes/destinationRoutes'); } catch (e) { console.error('Failed to load destinationRoutes:', e.message); destinationRoutes = (req,res) => res.status(500).json({error: 'destination route error'}); }
try { tourRoutes = require('./routes/tourRoutes'); } catch (e) { console.error('Failed to load tourRoutes:', e.message); tourRoutes = (req,res) => res.status(500).json({error: 'tour route error'}); }
try { eventRoutes = require('./routes/eventRoutes'); } catch (e) { console.error('Failed to load eventRoutes:', e.message); eventRoutes = (req,res) => res.status(500).json({error: 'event route error'}); }
try { bookingRoutes = require('./routes/bookingRoutes'); } catch (e) { console.error('Failed to load bookingRoutes:', e.message); bookingRoutes = (req,res) => res.status(500).json({error: 'booking route error'}); }
try { reviewRoutes = require('./routes/reviewRoutes'); } catch (e) { console.error('Failed to load reviewRoutes:', e.message); reviewRoutes = (req,res) => res.status(500).json({error: 'review route error'}); }
try { factRoutes = require('./routes/factRoutes'); } catch (e) { console.error('Failed to load factRoutes:', e.message); factRoutes = (req,res) => res.status(500).json({error: 'fact route error'}); }
try { userTourRoutes = require('./routes/userTourRoutes'); } catch (e) { console.error('Failed to load userTourRoutes:', e.message); userTourRoutes = (req,res) => res.status(500).json({error: 'userTour route error'}); }
try { routeRoutes = require('./routes/routeRoutes'); } catch (e) { console.error('Failed to load routeRoutes:', e.message); routeRoutes = (req,res) => res.status(500).json({error: 'route route error'}); }

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
// app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
// app.use(generalLimiter);

// Static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/фотки', express.static(path.join(__dirname, '..', 'фотки')));
app.use('/photos', express.static(path.join(__dirname, '..', 'фотки')));

// Health check endpoint (first!)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(), 
    port: PORT,
    env: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/facts', factRoutes);
app.use('/api/user-tours', userTourRoutes);

// Tour photo upload
app.post('/api/upload/tour-photo', uploadTourPhoto.single('photo'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: `/images/tours/${req.file.filename}` });
});

// Attraction photo upload (admin)
app.post(
    '/api/upload/attraction-photo',
    authenticateToken,
    authorizeRole('editor', 'super_admin'),
    uploadAttractionPhoto.single('photo'),
    (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
        res.json({ url: `/images/attractions/${req.file.filename}` });
    }
);

// Route card photo upload (admin)
app.post(
    '/api/upload/route-photo',
    authenticateToken,
    authorizeRole('editor', 'super_admin'),
    uploadRoutePhoto.single('photo'),
    (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
        res.json({ url: `/images/routes/${req.file.filename}` });
    }
);

// Config endpoint for frontend
app.get('/api/config', (req, res) => {
  res.json({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    yandexMapsApiKey: process.env.YANDEX_MAPS_API_KEY || ''
  });
});

// OpenStreetMap Nominatim proxy endpoint (avoid browser CORS/rate issues)
app.get('/api/geocode', async (req, res) => {
  const term = String(req.query.term || '').trim();
  if (!term) {
    return res.status(400).json({ error: 'Missing term query parameter' });
  }

  const queries = [`${term}, Бурятия, Россия`, `${term}, Улан-Удэ, Россия`, `${term}, Россия`];

  for (const query of queries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&accept-language=ru&q=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'buryatia-tourism/1.0 (local-dev)',
          'Accept-Language': 'ru'
        }
      });
      if (!response.ok) continue;

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) continue;

      const isBuryatiaResult = (item) =>
        String(item?.display_name || '').toLowerCase().includes('бурят');

      const best = data.find((item) => isBuryatiaResult(item) && item?.lat && item?.lon) ||
        data.find((item) => item?.lat && item?.lon);
      if (!best) continue;

      const lat = parseFloat(best.lat);
      const lng = parseFloat(best.lon);
      if (isNaN(lat) || isNaN(lng)) continue;

      return res.json({
        lat,
        lng,
        value: best.display_name || '',
        source: 'openstreetmap'
      });
    } catch (error) {
      console.warn('[GEOCODE] Query failed:', query, error.message);
    }
  }

  return res.status(404).json({ error: 'Coordinates not found' });
});

// SPA fallback (do not swallow /api/* — old clients need a real 404, not index.html)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Database initialization (optional)
/*
try {
  const { initializeDatabase } = require('./database/setup');
  initializeDatabase().catch(err => console.log('Database not available, running in static mode'));
} catch (e) {
  console.log('Database setup not available, running in static mode');
}
*/

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
