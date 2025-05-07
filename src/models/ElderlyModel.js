// models/Elderly.js
const mongoose = require('mongoose');

const elderlySchema = new mongoose.Schema({
  user_id: {
    type: String,
    ref: 'User',
    required: true
  },
  service_level: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    default: 'basic'
  },
  reviewsGiven: [{
    nurse_id: { type: String, ref: 'Nurse' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    timestamp: Date
  }]
});

const Elderly = mongoose.model('Elderly', elderlySchema);
module.exports = Elderly;