const Matching = require('../models/MatchingModel');
const Contract = require('../models/ContractModel');
const ApiError = require('../utils/apiError');
const {sendVerificationEmail} = require('../services/helperService');
const {User} = require('../models/UserModel');
const Nurse = require('../models/NurseModel');
const redis = require('../../config/redisClient') 
const crypto = require('crypto');
const Elderly = require('../models/ElderiesModel');

const OTP_EXPIRE_SEC = 3600; // 1 hour

const createMatchingService = async (user, { nurse_id, service_level, booking_time }) => {
  if (user.role !== 'elderly') {
    throw new ApiError(403, 'Only elderly can create matching');
  }
  if (!nurse_id || !service_level || !booking_time) {
    throw new ApiError(400, 'Missing required fields');
  }
  if (!Array.isArray(booking_time) ||
      booking_time.some(bt => !bt.start_time || !bt.end_time)) {
    throw new ApiError(400, 'Invalid booking_time format');
  }
  // Kiểm tra nurse_id có tồn tại không
  const nurse = await Nurse.findOne({ nurse_id });
  if (!nurse) throw new ApiError(404, 'Nurse not found');

  const elderly = await Elderly.findOne({ user_id: user.user_id });
  

  const newMatch = await Matching.create({
    nurse_id,
    elderly_id:   elderly.elderly_id,
    service_level,
    booking_time,
    contract_status: {
      elderly_signature: null,
      nurse_signature:   null,
      contract_hash:     null,
      is_signed:         false
    },
    violation_report: null,
    isMatched:       false,
    matchedAt:       null,
    resetAt:         new Date()
  });

  return newMatch;
};

const listMatchingService = async ({ page = 1, limit = 20, isMatched, service_level }) => {
  const skip = (page - 1) * limit;
  const filter = {};
  if (typeof isMatched !== 'undefined') filter.isMatched = isMatched === 'true';
  if (service_level) filter.service_level = service_level;

  const [matches, total] = await Promise.all([
    Matching.find(filter).skip(skip).limit(limit),
    Matching.countDocuments(filter)
  ]);
  return { matches, total, page, limit };
};

const getMatchingByIdService = async (id) => {
  const match = await Matching.findById(id);
  if (!match) throw new ApiError(404, 'Matching not found');
  return match;
};

const updateBookingTimeService = async (id, booking_time) => {
  if (!Array.isArray(booking_time)) {
    throw new ApiError(400, 'booking_time must be an array');
  }
  const match = await Matching.findByIdAndUpdate(
    id,
    { booking_time },
    { new: true, runValidators: true }
  );
  if (!match) throw new ApiError(404, 'Matching not found');
  return match;
};

const signContractService = async (id, { role, signature, contract_hash }) => {
  if (!['nurse', 'elderly'].includes(role)) {
    throw new ApiError(400, 'Invalid role for signing');
  }
  const match = await Matching.findById(id);
  if (!match) throw new ApiError(404, 'Matching not found');

  // update appropriate signature
  if (!match.contract_status) {
    match.contract_status = {};
  }
  if (role === 'elderly') {
    match.contract_status.elderly_signature = signature;
  } else {
    match.contract_status.nurse_signature = signature;
  }
  match.contract_status.contract_hash = contract_hash;

  // set is_signed if both present
  if (match.contract_status.elderly_signature && match.contract_status.nurse_signature) {
    match.contract_status.is_signed = true;
  }
  await match.save();
  return match;
};

const reportViolationService = async (id, { reported_by, reason }) => {
  const match = await Matching.findById(id);
  if (!match) throw new ApiError(404, 'Matching not found');
  match.violation_report = { reported_by, reason, timestamp: new Date() };
  // optionally unmatch
  match.isMatched = false;
  await match.save();
  return match;
};

const completeMatchService = async (id) => {
  const match = await Matching.findById(id);
  if (!match) throw new ApiError(404, 'Matching not found');
  if (!match.contract_status || !match.contract_status.is_signed) {
    throw new ApiError(400, 'Contract must be signed by both parties');
  }
  match.isMatched = true;
  match.matchedAt = new Date();
  await match.save();
  return match;
};

const resetMatchService = async (id) => {
  const match = await Matching.findById(id);
  if (!match) throw new ApiError(404, 'Matching not found');
  match.isMatched = false;
  match.resetAt = new Date();
  await match.save();
  return match;
};

const deleteMatchingService = async (id) => {
  const match = await Matching.findByIdAndDelete(id);
  if (!match) throw new ApiError(404, 'Matching not found');
  return { message: 'Matching deleted' };
};

async function requestSignOtpService(matchingId, role, email) {
  if (!['elderly','nurse'].includes(role)) {
    throw new ApiError(400,'Role phải là elderly hoặc nurse');
  }
  // Tạo OTP 6 chữ số
  const otp = crypto.randomInt(100000, 1000000).toString();
  // Lưu Redis: key = matching:{id}:sign:{role}, value = otp
  const key = `matching:${matchingId}:sign:${role}`;
  await redis.set(key, otp, 'EX', OTP_EXPIRE_SEC);
  // Gửi email
  await sendVerificationEmail(email, otp);
  return { message: `OTP đã gửi đến email của ${role}` };
}

async function confirmSignContractService(matchingId, role, otp, userId) {
  if (!['elderly','nurse'].includes(role)) {
    throw new ApiError(400, 'Role phải là "elderly" hoặc "nurse"');
  }

  // 1. Kiểm tra OTP
  const key = `matching:${matchingId}:sign:${role}`;
  const storedOtp = await redis.get(key);
  if (!storedOtp) throw new ApiError(400, 'OTP đã hết hạn hoặc không tồn tại');
  if (storedOtp !== otp) throw new ApiError(400, 'OTP không hợp lệ');
  await redis.del(key);

  // 2. Cập nhật Matching.contract_status
  const match = await Matching.findById(matchingId);
  if (!match) throw new ApiError(404, 'Matching không tìm thấy');

  match.contract_status = match.contract_status || {
    elderly_signature: false,
    nurse_signature:   false,
    contract_hash:     null,
    is_signed:         false
  };

  match.contract_status[`${role}_signature`] = true;
  // nếu cần bật is_signed ở matching, giữ nguyên logic
  const now = new Date();
  if (match.contract_status.elderly_signature && match.contract_status.nurse_signature) {
    match.contract_status.is_signed = true;
    match.isMatched = true; // nếu cả 2 đã ký, coi như đã matched
    match.matchedAt = now;
  }
  await match.save();

  // 3. Cập nhật Contract: chỉ set chữ ký và log
  
  const updateFields = {
    last_modified_at: now,
    [`signed_by_${role}`]: now,
    [`${role}_signature`]: true,
  };
  const historyEntry = {
    action: `${role}_signed`,
    modified_by: userId,
    timestamp: now
  };

  await Contract.findOneAndUpdate(
    { matching_id: matchingId },
    {
      $set: updateFields,
      $push: { history_logs: historyEntry }
    },
    { new: true }
  );

  

  return match;
}

module.exports = {
  createMatchingService,
  listMatchingService,
  getMatchingByIdService,
  updateBookingTimeService,
  signContractService,
  reportViolationService,
  completeMatchService,
  resetMatchService,
  deleteMatchingService,
  requestSignOtpService,
  confirmSignContractService
};