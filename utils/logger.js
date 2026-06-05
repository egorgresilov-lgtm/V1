const pool = require('../database/db');

const logActivity = async (userId, action, entityType, entityId, details = {}) => {
  try {
    await pool.query(
      `INSERT INTO activity_log (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, action, entityType, entityId, JSON.stringify(details)]
    );
  } catch (error) {
    // Ignore DB logging errors silently
  }
};

// Simple console-based logger methods used throughout services
const info = (message, ...args) => {
  console.log(`[INFO] ${message}`, ...args);
};

const error = (message, ...args) => {
  console.error(`[ERROR] ${message}`, ...args);
};

const warn = (message, ...args) => {
  console.warn(`[WARN] ${message}`, ...args);
};

module.exports = { logActivity, info, error, warn };
