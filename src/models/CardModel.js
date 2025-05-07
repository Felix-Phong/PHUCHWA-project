// models/Card.js
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  card_id: {
    type: String,
    required: true,
    unique: true
  },
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
  public_key: String,
  private_key_encrypted: String
});

const Card = mongoose.model('Card', cardSchema);
module.exports = Card;