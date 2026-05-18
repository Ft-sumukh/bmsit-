const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  refreshAccessToken
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public auth endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshAccessToken);

// Protected auth endpoints
router.get('/me', protect, getUserProfile);

module.exports = router;
