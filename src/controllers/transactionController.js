const {
      createTransactionFromContractService,
    processPaymentService,
    refundTransactionService,
    getUserTransactionsService,
    listTransactionsService,
    updateTransactionStatusService
} = require('../services/transactionService');
const ApiError = require('../utils/apiError');

const createFromContract = async (req, res, next) => {
  try {
    const tx = await createTransactionFromContractService(
      req.params.contractId
    );
    res.status(201).json(tx);
  } catch (error) {
    next(error);
  }
};

const processPayment = async (req, res, next) => {
  try {
    const tx = await processPaymentService(
      req.params.transactionId
    );
    res.json(tx);
  } catch (error) {
    next(error);
  }
};

const refund = async (req, res, next) => {
  try {
    const tx = await refundTransactionService(
      req.params.transactionId,
      req.body.reason
    );
    res.json(tx);
  } catch (error) {
    next(error);
  }
};

const getUserTransactions = async (req, res, next) => {
  try {
    const result = await getUserTransactionsService(
      req.user.user_id,
      req.user.role,
      req.query
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

async function listTransactions(req, res, next) {
  try {
    const { page, limit, status, elderly_id, nurse_id } = req.query;
    const result = await transactionService.listTransactionsService({ 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 20,
      status,
      elderly_id,
      nurse_id
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

// Sửa hàm updateTransactionStatus
async function updateTransactionStatus(req, res, next) {
  try {
    const tx = await transactionService.updateTransactionStatusService(
      req.params.transactionId, // Sử dụng transactionId thay vì id
      req.body.status
    );
    res.json({ success: true, data: tx });
  } catch (err) { next(err); }
}


module.exports = {
  createFromContract,
  processPayment,
  refund,
  getUserTransactions,
  listTransactions,
  updateTransactionStatus
};