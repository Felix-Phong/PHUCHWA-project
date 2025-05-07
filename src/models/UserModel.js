const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  card_id: {
    type: String,
    unique: true,
    sparse: true 
  },
  role: {
    type: String,
    required: true,
    enum: ['nurse', 'elderly']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: function() {
      return this.role === 'elderly';
    }
  },
  student_id: {
    type: String,
    required: function() {
      return this.role === 'nurse';
    },
    unique: true
  }
}, { discriminatorKey: 'role' });

// Hash password trước khi lưu
userSchema.pre('save', async function(next) {
  if (this.role === 'elderly' && this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const User = mongoose.model('User', userSchema);

// Discriminators cho từng role
const Nurse = User.discriminator('Nurse', new mongoose.Schema({
  student_id: { type: String, required: true }
}));

const Elderly = User.discriminator('Elderly', new mongoose.Schema({
  password: { type: String, required: true }
}));

module.exports = { User, Nurse, Elderly };