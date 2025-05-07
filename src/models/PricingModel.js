const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  service_level: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    unique: true
  },
  elderly_benefits: String,
  nurse_rewards: {
    type: Number,
    min: 0
  },
  price: {
    type: Number,
    min: 0
  }
});

const Pricing = mongoose.model('Pricing', pricingSchema);
module.exports = Pricing;