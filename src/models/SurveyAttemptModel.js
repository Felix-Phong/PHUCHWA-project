const mongoose = require('mongoose');

const surveyAttemptSchema = new mongoose.Schema({
  elderly_id: {
    type: String,
    ref: 'Elderly',
    required: true
  },
  questions: [{
    question: String,
    answer: String
  }],
  verified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const SurveyAttempt = mongoose.model('SurveyAttempt', surveyAttemptSchema);
module.exports = SurveyAttempt;