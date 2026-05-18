const express = require('express');
const router = express.Router();
const {
  generateDocumentFlashcards,
  getUserFlashcards,
  updateCardMastery,
  deleteFlashcardDeck
} = require('../controllers/flashcardController');
const { protect } = require('../middleware/authMiddleware');

// Mount protected flashcard routes
router.post('/generate/:documentId', protect, generateDocumentFlashcards);
router.get('/', protect, getUserFlashcards);
router.patch('/:deckId/card/:cardId', protect, updateCardMastery);
router.delete('/:deckId', protect, deleteFlashcardDeck);

module.exports = router;
