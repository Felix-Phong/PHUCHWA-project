const mongoose = require('mongoose');

const matchingSchema = new mongoose.Schema({
  nurse_id: {
    type: String,
    ref: 'Nurse',
    required: true
  },
  elderly_id: {
    type: String,
    ref: 'Elderly',
    required: true
  },
  service_level: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    required: true
  },
  isMatched: {
    type: Boolean,
    default: false
  },
  matchedAt: Date,
  resetAt: Date
}, { timestamps: true });

const Matching = mongoose.model('Matching', matchingSchema);
module.exports = Matching;