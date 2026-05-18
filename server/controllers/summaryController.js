const Document = require('../models/Document');
const StudySession = require('../models/StudySession');
const aiService = require('../services/aiService');

// @desc    Generate or fetch a cached summary of the document
// @route   POST /api/summary/generate/:documentId
// @access  Private
const generateDocumentSummary = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id
    });

    if (!document) {
      res.status(404);
      return next(new Error('Document not found or access denied'));
    }

    // 1. Return cached summary if it already exists
    if (document.summary) {
      return res.json({
        documentId: document._id,
        title: document.title,
        summary: document.summary
      });
    }

    if (!document.extractedText) {
      res.status(400);
      return next(new Error('This document does not contain extracted text to summarize.'));
    }

    // 2. Generate new summary via AI
    const summaryText = await aiService.generateSummary(document.extractedText);

    // 3. Cache it in MongoDB Document
    document.summary = summaryText;
    await document.save();

    // 4. Record study session: log 3 minutes of summary study time
    await StudySession.create({
      userId: req.user._id,
      documentId: documentId,
      sessionType: 'summary',
      duration: 3
    });

    res.json({
      documentId: document._id,
      title: document.title,
      summary: summaryText
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get an existing summary (without regenerating)
// @route   GET /api/summary/:documentId
// @access  Private
const getDocumentSummary = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id
    });

    if (!document) {
      res.status(404);
      return next(new Error('Document not found or access denied'));
    }

    res.json({
      documentId: document._id,
      title: document.title,
      summary: document.summary || '' // Returns empty if not generated yet
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateDocumentSummary,
  getDocumentSummary
};
