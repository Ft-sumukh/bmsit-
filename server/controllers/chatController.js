const Document = require('../models/Document');
const ChatMessage = require('../models/ChatMessage');
const StudySession = require('../models/StudySession');
const aiService = require('../services/aiService');

// Helper to perform local RAG (keyword-matching chunk retrieval)
// Splitting text into overlapping chunks, scoring relevance against query keywords
const retrieveLocalContext = (documentText, query, topK = 3) => {
  if (!documentText) return '';

  const chunkSize = 1500;
  const overlap = 200;
  const chunks = [];

  // 1. Generate overlapping chunks
  for (let i = 0; i < documentText.length; i += (chunkSize - overlap)) {
    chunks.push(documentText.slice(i, i + chunkSize));
    // Safe guard to prevent infinite loops if documentText is large and overlap matches chunkSize
    if (chunkSize <= overlap) break;
  }

  // 2. Extract meaningful keywords from query (longer than 3 chars)
  const keywords = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);

  if (keywords.length === 0) {
    // Return first few chunks as fallback
    return chunks.slice(0, topK).join('\n\n');
  }

  // 3. Score chunks based on keyword matching
  const scoredChunks = chunks.map(chunk => {
    let score = 0;
    const lowerChunk = chunk.toLowerCase();

    keywords.forEach(word => {
      // Direct match
      if (lowerChunk.includes(word)) {
        score += 2;
        // Count frequencies for more detail
        const matches = lowerChunk.match(new RegExp(word, 'g'));
        if (matches) score += matches.length * 0.5;
      }
    });

    return { chunk, score };
  });

  // 4. Sort by score descending and return top K
  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => item.chunk)
    .join('\n\n---\n\n');
};

// @desc    Send a question, perform local RAG retrieval, return AI response
// @route   POST /api/chat/:documentId
// @access  Private
const askDocumentQuestion = async (req, res, next) => {
  try {
    const { message } = req.body;
    const { documentId } = req.params;

    if (!message) {
      res.status(400);
      return next(new Error('Message content is required'));
    }

    // 1. Fetch document and confirm user ownership
    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id
    });

    if (!document) {
      res.status(404);
      return next(new Error('Document not found or access denied'));
    }

    // 2. Fetch recent chat history for this document
    const history = await ChatMessage.find({
      userId: req.user._id,
      documentId: documentId
    }).sort({ timestamp: 1 });

    // 3. Save User message to DB
    await ChatMessage.create({
      userId: req.user._id,
      documentId: documentId,
      sender: 'user',
      text: message
    });

    // 4. Retrieve RAG Context locally from parsed document text
    const context = retrieveLocalContext(document.extractedText, message, 3);

    // 5. Query AI engine (OpenAI with mock fallbacks built-in)
    const aiResponse = await aiService.askAI(message, context, history);

    // 6. Save Assistant response to DB
    const assistantMessage = await ChatMessage.create({
      userId: req.user._id,
      documentId: documentId,
      sender: 'assistant',
      text: aiResponse
    });

    // 7. Track study time: log a 2-minute active study session
    await StudySession.create({
      userId: req.user._id,
      documentId: documentId,
      sessionType: 'chat',
      duration: 2
    });

    res.status(201).json(assistantMessage);
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat message streams for a document
// @route   GET /api/chat/:documentId/history
// @access  Private
const getChatHistory = async (req, res, next) => {
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

    const messages = await ChatMessage.find({
      userId: req.user._id,
      documentId: documentId
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all messages related to a document
// @route   DELETE /api/chat/:documentId/history
// @access  Private
const clearChatHistory = async (req, res, next) => {
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

    await ChatMessage.deleteMany({
      userId: req.user._id,
      documentId: documentId
    });

    res.json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Simplify a complex topic using document reference context
// @route   POST /api/chat/simplify
// @access  Private
const simplifyDocumentTopic = async (req, res, next) => {
  try {
    const { topic, documentId } = req.body;

    if (!topic) {
      res.status(400);
      return next(new Error('Please provide the topic title you want to simplify'));
    }

    let context = '';
    let linkedDocId = null;

    if (documentId) {
      const document = await Document.findOne({
        _id: documentId,
        userId: req.user._id
      });
      if (document) {
        context = retrieveLocalContext(document.extractedText, topic, 2);
        linkedDocId = document._id;
      }
    }

    // Call AI simplifier service
    const explanation = await aiService.simplifyTopic(topic, context);

    // Track active revision study time
    await StudySession.create({
      userId: req.user._id,
      documentId: linkedDocId,
      sessionType: 'chat',
      duration: 2
    });

    res.json({
      topic,
      explanation
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  askDocumentQuestion,
  getChatHistory,
  clearChatHistory,
  simplifyDocumentTopic
};
