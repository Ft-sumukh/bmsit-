const express = require('express');
const router = express.Router();
const {
  generateDocumentSummary,
  getDocumentSummary
} = require('../controllers/summaryController');
const { protect } = require('../middleware/authMiddleware');

// Mount protected summary routes
router.post('/generate/:documentId', protect, generateDocumentSummary);
router.get('/:documentId', protect, getDocumentSummary);

module.exports = router;
