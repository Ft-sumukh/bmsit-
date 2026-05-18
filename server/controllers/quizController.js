const Quiz = require('../models/Quiz');
const Document = require('../models/Document');
const StudySession = require('../models/StudySession');
const aiService = require('../services/aiService');

// @desc    Generate MCQ quiz from document content
// @route   POST /api/quiz/generate/:documentId
// @access  Private
const generateDocumentQuiz = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { count = 5, difficulty = 'medium' } = req.body;

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id
    });

    if (!document) {
      res.status(404);
      return next(new Error('Document not found or access denied'));
    }

    if (!document.extractedText) {
      res.status(400);
      return next(new Error('This document does not contain any extracted text to build a quiz from.'));
    }

    // Call AI service to generate standard MCQ quiz
    const generatedQuestions = await aiService.generateQuiz(
      document.extractedText,
      count,
      difficulty
    );

    if (!generatedQuestions || generatedQuestions.length === 0) {
      res.status(500);
      return next(new Error('Failed to generate study questions for this document.'));
    }

    // Save quiz to MongoDB
    const quiz = await Quiz.create({
      userId: req.user._id,
      documentId: documentId,
      title: `${document.title} - ${difficulty.toUpperCase()} Practice Quiz`,
      questions: generatedQuestions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || ''
      })),
      difficulty,
      score: 0,
      attempts: 0
    });

    res.status(201).json(quiz);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all quizzes generated for the current user
// @route   GET /api/quiz
// @access  Private
const getUserQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user._id })
      .populate('documentId', 'title subject')
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    next(error);
  }
};

// @desc    Get details for a specific quiz
// @route   GET /api/quiz/:quizId
// @access  Private
const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      userId: req.user._id
    }).populate('documentId', 'title subject');

    if (!quiz) {
      res.status(404);
      return next(new Error('Quiz not found or access denied'));
    }

    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit answers for a quiz, evaluate score
// @route   POST /api/quiz/:quizId/submit
// @access  Private
const submitQuizAnswers = async (req, res, next) => {
  try {
    const { answers } = req.body; // Array of option strings matching the question indices
    const { quizId } = req.params;

    if (!answers || !Array.isArray(answers)) {
      res.status(400);
      return next(new Error('Please submit answers as an array'));
    }

    const quiz = await Quiz.findOne({
      _id: quizId,
      userId: req.user._id
    });

    if (!quiz) {
      res.status(404);
      return next(new Error('Quiz not found or access denied'));
    }

    let score = 0;
    const results = quiz.questions.map((q, idx) => {
      // Clean leading/trailing spaces for exact match checks
      const submitted = (answers[idx] || '').trim().toLowerCase();
      const correct = (q.correctAnswer || '').trim().toLowerCase();
      
      const isCorrect = submitted === correct || 
                        submitted.substring(0, 2) === correct.substring(0, 2); // Handles A vs A. or full text match

      if (isCorrect) {
        score++;
      }

      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        submittedAnswer: answers[idx] || '',
        isCorrect,
        explanation: q.explanation
      };
    });

    // Update quiz records
    quiz.score = score;
    quiz.attempts += 1;
    await quiz.save();

    // Log study time: 5 minutes of revision
    await StudySession.create({
      userId: req.user._id,
      documentId: quiz.documentId,
      sessionType: 'quiz',
      duration: 5
    });

    res.json({
      _id: quiz._id,
      title: quiz.title,
      score,
      totalQuestions: quiz.questions.length,
      attempts: quiz.attempts,
      results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a quiz record
// @route   DELETE /api/quiz/:quizId
// @access  Private
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      userId: req.user._id
    });

    if (!quiz) {
      res.status(404);
      return next(new Error('Quiz not found or access denied'));
    }

    await Quiz.deleteOne({ _id: quiz._id });
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateDocumentQuiz,
  getUserQuizzes,
  getQuizById,
  submitQuizAnswers,
  deleteQuiz
};
