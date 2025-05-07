const mongoose = require('mongoose');

// models/Nurse.js
const mongoose = require('mongoose');

const nurseSchema = new mongoose.Schema({
  user_id: {
    type: String,
    ref: 'User',
    required: true
  },
  card_id: {
    type: String,
    unique: true
  },
  dailyScoreHistory: [{
    timestamp: Date,
    score: { type: Number, min: 0, max: 10 }
  }],
  reviews: [{
    elderly_id: { type: String, ref: 'Elderly' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    timestamp: Date
  }],
  level: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    default: 'basic'
  }
});

// Indexes
nurseSchema.index({ user_id: 1 });
nurseSchema.index({ level: 1 });

const Nurse = mongoose.model('Nurse', nurseSchema);

module.exports = Nurse;