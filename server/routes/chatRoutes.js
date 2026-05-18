const express = require('express');
const router = express.Router();
const {
  askDocumentQuestion,
  getChatHistory,
  clearChatHistory,
  simplifyDocumentTopic
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// Mount protected chat endpoints
router.post('/simplify', protect, simplifyDocumentTopic);
router.post('/:documentId', protect, askDocumentQuestion);
router.get('/:documentId/history', protect, getChatHistory);
router.delete('/:documentId/history', protect, clearChatHistory);

module.exports = router;
