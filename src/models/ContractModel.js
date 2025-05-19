const mongoose = require('mongoose');

// Sub-schema cho lịch sử thay đổi trạng thái
const historyLogSchema = new mongoose.Schema({
  action:      { type: String, required: true },
  modified_by: { type: String, required: true },
  timestamp:   { type: Date,   required: true }
}, { _id: false });

// Sub-schema cho chi tiết thanh toán
const paymentDetailsSchema = new mongoose.Schema({
  service_level:            { type: String, enum: ['basic','standard','premium'], required: true },
  price_per_hour:           { type: Number, required: true },
  total_hours_booked:       { type: Number, required: true },
  deposit_amount:           { type: Number, required: true },
  remaining_payment:        { type: Number, required: true },
  nurse_share_percentage:   { type: Number, required: true },
  platform_share_percentage:{ type: Number, required: true },
  nurse_total_earnings:     { type: Number, required: true },
  platform_total_earnings:  { type: Number, required: true }
}, { _id: false });

const contractSchema = new mongoose.Schema({
  matching_id:       { type: String, ref: 'Matching', required: true },
  elderly_id:        { type: String, ref: 'Elderly',  required: true },
  nurse_id:          { type: String, ref: 'Nurse',    required: true },
  contract_hash:     { type: String, required: true },
  signed_at:         { type: Date,   required: true, default: Date.now },
  status:            { type: String, enum: ['pending','active','violated','terminated'], required: true, default: 'pending' },
  signed_by_elderly: { type: Date,   default: null },
  signed_by_nurse:   { type: Date,   default: null },
  elderly_signature: { type: String, default: null },
  nurse_signature:   { type: String, default: null },
  effective_date:    { type: Date,   required: true },
  expiry_date:       { type: Date,   default: null },
  created_by:        { type: String, required: true, default: 'system' },
  last_modified_at:  { type: Date,   required: true, default: Date.now },
  history_logs:      { type: [historyLogSchema], default: [] },
  payment_details:   { type: paymentDetailsSchema, required: true },
  terms:             { type: [String], required: true }
}, {
  collection: 'contracts',
  timestamps: { createdAt: false, updatedAt: 'last_modified_at' },
  strict: true
});

// Mỗi lần lưu, nếu signed_by_* được cập nhật, thêm log tương ứng vào history_logs
contractSchema.pre('save', function(next) {
  const now = new Date();
  if (this.isModified('status')) {
    this.history_logs.push({ action: this.status, modified_by: this.created_by, timestamp: now });
  }
  next();
});

module.exports = mongoose.model('Contract', contractSchema);
