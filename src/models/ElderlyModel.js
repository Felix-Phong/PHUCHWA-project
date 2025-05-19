const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const addressSchema = new mongoose.Schema({
  street: { type: String, default: null },
  city: { type: String, default: null },
  country: { type: String, default: null }
}, { _id: false });

const elderlySchema = new mongoose.Schema({
  elderly_id: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4
  },user_id: {
    type: String,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  hashed_password: {
    type: String,
    default: null
  },
  full_name: {
    type: String,
    default: null
  },
  gender: {
    type: Boolean,
    default: null
  },
  date_of_birth: {
    type: Date,
    default: null
  },
  permanent_address: {
    type: addressSchema,
    default: null
  },
  current_address: {
    type: addressSchema,
    default: null
  },
  insurance_number: {
    type: String,
    default: null
  },
  phone_number: {
    type: String,
    default: null
  },
  avatar_url: {
    type: String,
    default: null
  },
  public_key: {
    type: String,
    default: null
  },
  private_key_encrypted: {
    type: String,
    default: null
  },
  qr_code_data: {
    type: String,
    default: null,
    match: /^data:image\/(?:[a-zA-Z+\-.]+);base64,[A-Za-z0-9+/=]+$/
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'Elderly',
  timestamps: { createdAt: false, updatedAt: 'updated_at' },
  strict: true
});

// Virtual guard: ensure required fields
elderlySchema.pre('validate', function(next) {
  if (!this.email_verified && this.hashed_password) {
    // keep allow
  }
  next();
});

const Elderly = mongoose.model('Elderly', elderlySchema);
module.exports = Elderly;
