const ApiError = require('../utils/apiError');
const {
  createMatchingService,
  listMatchingService,
  getMatchingByIdService,
  updateBookingTimeService,
  signContractService,
  reportViolationService,
  completeMatchService,
  resetMatchService,
  deleteMatchingService
} = require('../services/matchingService');

const createMatching = async (req, res, next) => {
  try {
    const { elderly_id, nurse_id, service_level, booking_time } = req.body;
    const match = await createMatchingService({ elderly_id, nurse_id, service_level, booking_time });
    res.status(201).json({ success: true, data: match });
  } catch (err) {
    next(err);
  }
};

const listMatching = async (req, res, next) => {
  try {
    const { page, limit, isMatched, service_level } = req.query;
    const result = await listMatchingService({ page, limit, isMatched, service_level });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getMatchingById = async (req, res, next) => {
  try {
    const match = await getMatchingByIdService(req.params.id);
    res.status(200).json({ success: true, data: match });
  } catch (err) {
    next(err);
  }
};

const updateBookingTime = async (req, res, next) => {
  try {
    const { booking_time } = req.body;
    const match = await updateBookingTimeService(req.params.id, booking_time);
    res.status(200).json({ success: true, data: match });
  } catch (err) {
    next(err);
  }
};

const signContract = async (req, res, next) => {
  try {
    const { signature, contract_hash } = req.body;
    const role = req.user.role; // elderly or nurse
    const match = await signContractService(req.params.id, { role, signature, contract_hash });
    res.status(200).json({ success: true, data: match });
  } catch (err) {
    next(err);
  }
};

const reportViolation = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const reporter = req.user.user_id;
    const match = await reportViolationService(req.params.id, { reported_by: reporter, reason });
    res.status(200).json({ success: true, data: match });
  } catch (err) {
    next(err);
  }
};

const completeMatch = async (req, res, next) => {
  try {
    const match = await completeMatchService(req.params.id);
    res.status(200).json({ success: true, data: match });
  } catch (err) {
    next(err);
  }
};

const resetMatch = async (req, res, next) => {
  try {
    const match = await resetMatchService(req.params.id);
    res.status(200).json({ success: true, data: match });
  } catch (err) {
    next(err);
  }
};

const deleteMatching = async (req, res, next) => {
  try {
    await deleteMatchingService(req.params.id);
    res.status(200).json({ success: true, message: 'Matching cancelled' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createMatching,
  listMatching,
  getMatchingById,
  updateBookingTime,
  signContract,
  reportViolation,
  completeMatch,
  resetMatch,
  deleteMatching
};