const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    min: 0,
    required: true
  },
  service_level: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    required: true
  },
  nurse_commission: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;