const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Mount protected statistics endpoints
router.get('/stats', protect, getDashboardStats);

module.exports = router;
