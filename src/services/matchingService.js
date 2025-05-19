const Matching = require('../models/MatchingModel');
const ApiError = require('../utils/apiError');

const createMatchingService = async () => ({nurse_id, elderly_id,service_level,booking_time}) => {
  try {
    if (!nurse_id || !elderly_id || !service_level || !booking_time) {
    throw new ApiError(400, 'Missing required fields for matching creation');
  }
  if (!Array.isArray(booking_time) || booking_time.some(bt => !bt.start_time || !bt.end_time)) {
    throw new ApiError(400, 'Invalid booking_time format');
  }

    const newMatching = new Matching.create({
      nurse_id,
      elderly_id,
      service_level,
      booking_time,
      resetAt: new Date()
    });
   
    return newMatching;
  } catch (error) {
    throw new ApiError(500, 'Error creating matching');
  }
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

module.exports = {
  createMatchingService,
  listMatchingService,
  getMatchingByIdService,
  updateBookingTimeService,
  signContractService,
  reportViolationService,
  completeMatchService,
  resetMatchService,
  deleteMatchingService
};