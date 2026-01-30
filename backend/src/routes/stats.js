const express = require('express');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Cache for stats
let cachedStats = null;
let lastModified = null;

// Calculate stats from items array
function calculateStats(items) {
  if (items.length === 0) {
    return {
      total: 0,
      averagePrice: 0
    };
  }
  
  const total = items.length;
  const sum = items.reduce((acc, cur) => acc + (cur.price || 0), 0);
  const averagePrice = sum / total;
  
  return {
    total,
    averagePrice: Math.round(averagePrice * 100) / 100 // Round to 2 decimal places
  };
}

// Watch for file changes and invalidate cache
fs.watchFile(DATA_PATH, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    cachedStats = null;
    lastModified = null;
  }
});

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    // Check file modification time
    const stats = await fsPromises.stat(DATA_PATH);
    const currentModified = stats.mtime.getTime();
    
    // Return cached stats if file hasn't changed
    if (cachedStats && lastModified === currentModified) {
      return res.json(cachedStats);
    }
    
    // Read file and calculate stats
    const raw = await fsPromises.readFile(DATA_PATH, 'utf8');
    const items = JSON.parse(raw);
    
    // Calculate stats
    cachedStats = calculateStats(items);
    lastModified = currentModified;
    
    res.json(cachedStats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;