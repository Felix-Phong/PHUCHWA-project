const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); 

const nurseSchema = new mongoose.Schema({
  nurse_id: {
    type: String,
    required: true,
    unique: true,
   default: uuidv4
  },
user_id: {
  type: String,
  ref: 'User', 
  required: true
},
card_id: {
    type: String, // Tham chiếu đến User
    ref: 'User',
    required: true,
    unique: true,
    description: 'ID thẻ QR (tạo từ student_id và user_id, áp dụng cho nurse).'
  },
   student_id: {
    type: String, // Tham chiếu đến User
    ref: 'User',
    required: true,
    unique: true
  },
  school: {
    type: String,
    required: true
  },
  year_of_study: {
    type: Number,
    required: true
  },
  poseidonHash: {
    type: String,
    required: true
  },
  test_score: {
    type: Number,
    min: 0,
    max: 10,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  major: {
    type: String,
    required: true
  },
  isAvailableForMatching: {
    type: Boolean,
    default: true
  },
  matchingResetAt: {
    type: Date
  },
  lastTestAt: {
    type: Date
  },
  isLockedForToday: {
    type: Boolean,
    default: false
  },
  dailyScoreHistory: [{
    timestamp: {
      type: Date,
      required: true
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    }
  }],
  reviews: [{
    elderly_id: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String
    },
    timestamp: {
      type: Date,
      required: true
    }
  }],
  level: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    required: true
  }
}, { timestamps: true });

// Indexes
nurseSchema.index({ user_id: 1 });
nurseSchema.index({ isAvailableForMatching: 1 });

const Nurse = mongoose.model('Nurse', nurseSchema);

module.exports = Nurse;