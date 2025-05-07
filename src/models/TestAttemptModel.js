const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema({
  nurse_id: {
    type: String,
    ref: 'Nurse',
    required: true
  },
  questions: [{
    question: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard']
    },
    options: [String],
    correct_answer: String,
    user_answer: String
  }],
  score: {
    type: Number,
    min: 0,
    max: 10
  }
}, { timestamps: true });

const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);
module.exports = TestAttempt;