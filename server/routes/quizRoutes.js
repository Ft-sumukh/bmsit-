const express = require('express');
const router = express.Router();
const {
  generateDocumentQuiz,
  getUserQuizzes,
  getQuizById,
  submitQuizAnswers,
  deleteQuiz
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

// Mount protected quiz routes
router.post('/generate/:documentId', protect, generateDocumentQuiz);
router.get('/', protect, getUserQuizzes);
router.get('/:quizId', protect, getQuizById);
router.post('/:quizId/submit', protect, submitQuizAnswers);
router.delete('/:quizId', protect, deleteQuiz);

module.exports = router;
