const Flashcard = require('../models/Flashcard');
const Document = require('../models/Document');
const StudySession = require('../models/StudySession');
const aiService = require('../services/aiService');

// @desc    Generate flashcard deck from document content
// @route   POST /api/flashcards/generate/:documentId
// @access  Private
const generateDocumentFlashcards = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { count = 6 } = req.body;

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
      return next(new Error('This document does not contain extracted text to generate flashcards from.'));
    }

    // Call AI service to generate flashcards
    const generatedCards = await aiService.generateFlashcards(
      document.extractedText,
      count
    );

    if (!generatedCards || generatedCards.length === 0) {
      res.status(500);
      return next(new Error('Failed to generate flashcards for this document.'));
    }

    // Save flashcard deck to MongoDB
    const deck = await Flashcard.create({
      userId: req.user._id,
      documentId: documentId,
      title: `${document.title} - Study Flashcards`,
      cards: generatedCards.map(c => ({
        front: c.front,
        back: c.back,
        mastered: false
      }))
    });

    // Log study time: 3 minutes of setup and review
    await StudySession.create({
      userId: req.user._id,
      documentId: documentId,
      sessionType: 'flashcard',
      duration: 3
    });

    res.status(201).json(deck);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all flashcard decks for the current user
// @route   GET /api/flashcards
// @access  Private
const getUserFlashcards = async (req, res, next) => {
  try {
    const decks = await Flashcard.find({ userId: req.user._id })
      .populate('documentId', 'title subject')
      .sort({ createdAt: -1 });

    res.json(decks);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle card mastery state
// @route   PATCH /api/flashcards/:deckId/card/:cardId
// @access  Private
const updateCardMastery = async (req, res, next) => {
  try {
    const { deckId, cardId } = req.params;
    const { mastered } = req.body;

    const deck = await Flashcard.findOne({
      _id: deckId,
      userId: req.user._id
    });

    if (!deck) {
      res.status(404);
      return next(new Error('Flashcard deck not found or access denied'));
    }

    // Locate subdocument inside mongoose array
    const card = deck.cards.id(cardId);
    if (!card) {
      res.status(404);
      return next(new Error('Flashcard item not found in this deck'));
    }

    // Set mastery status (defaults to true or toggles)
    card.mastered = mastered !== undefined ? mastered : !card.mastered;
    await deck.save();

    // Log 1 minute of active micro-learning
    await StudySession.create({
      userId: req.user._id,
      documentId: deck.documentId,
      sessionType: 'flashcard',
      duration: 1
    });

    res.json(deck);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a flashcard deck
// @route   DELETE /api/flashcards/:deckId
// @access  Private
const deleteFlashcardDeck = async (req, res, next) => {
  try {
    const deck = await Flashcard.findOne({
      _id: req.params.deckId,
      userId: req.user._id
    });

    if (!deck) {
      res.status(404);
      return next(new Error('Flashcard deck not found or access denied'));
    }

    await Flashcard.deleteOne({ _id: deck._id });
    res.json({ message: 'Flashcard deck deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateDocumentFlashcards,
  getUserFlashcards,
  updateCardMastery,
  deleteFlashcardDeck
};
