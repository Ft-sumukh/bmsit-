const mongoose = require('mongoose');

const StudySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  sessionType: {
    type: String,
    enum: ['chat', 'quiz', 'flashcard', 'summary', 'studyplan'],
    required: true
  },
  duration: {
    type: Number, // In minutes
    required: true,
    default: 1
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudySession', StudySessionSchema);
