const express = require('express');
const router = express.Router();
const {
  generateUserStudyPlan,
  getUserStudyPlan
} = require('../controllers/studyPlanController');
const { protect } = require('../middleware/authMiddleware');

// Mount protected study plan routes
router.post('/generate', protect, generateUserStudyPlan);
router.get('/', protect, getUserStudyPlan);

module.exports = router;
