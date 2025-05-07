const mongoose = require('mongoose');

const loginSessionSchema = new mongoose.Schema({
  user_id: {
    type: String,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['nurse', 'elderly'],
    required: true
  },
  card_id: String,
  signature: String,
  token: {
    type: String,
    unique: true
  },
  login_time: {
    type: Date,
    default: Date.now
  },
  logout_time: Date
});

const LoginSession = mongoose.model('LoginSession', loginSessionSchema);
module.exports = LoginSession;