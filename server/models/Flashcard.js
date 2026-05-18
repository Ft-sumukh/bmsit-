const mongoose = require('mongoose');

const FlashcardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  cards: [{
    front: {
      type: String,
      required: true
    },
    back: {
      type: String,
      required: true
    },
    mastered: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Flashcard', FlashcardSchema);
