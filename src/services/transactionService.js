  // services/transactionService.js
  const Transaction = require('../models/TransactionModel');
  const ApiError    = require('../utils/apiError');
  const Elderly     = require('../models/ElderiesModel');
  const Contract = require('../models/ContractModel');
const Pricing = require('../models/PricingModel');
  const { v4: uuidv4 } = require('uuid')

  // Helper: Tính toán phí nền tảng dựa trên service level
async function calculatePlatformFee(service_type, amount) {
  const pricing = await Pricing.findOne({ service_level: service_type });
  if (!pricing) throw new ApiError(404, 'Pricing not found for service level');
  
  return amount * (pricing.platform_share_percentage / 100);
}

 // Tạo giao dịch từ hợp đồng
async function createTransactionFromContractService(contractId) {
   const existingTx = await Transaction.findOne({ contract_id: contractId });
  if (existingTx) {
    throw new ApiError(400, 'Transaction already exists for this contract');
  }
  const contract = await Contract.findById(contractId);
  if (!contract) throw new ApiError(404, 'Contract not found');
  
  const { payment_details, service_level } = contract;
  const amount = payment_details.price_per_hour * payment_details.total_hours_booked;
  const currency = contract.payment_details?.currency || 'VND';
  
  const platform_fee = await calculatePlatformFee(service_level, amount);
  const nurse_receive_amount = amount - platform_fee;

  const tx = await Transaction.create({
    transaction_id: uuidv4(),
    elderly_id: contract.elderly_id,
    nurse_id: contract.nurse_id,
    amount,
    currency,
    service_type: service_level,
    platform_fee,
    nurse_receive_amount,
    payment_method: 'bank_transfer',
    contract_id: contractId,
    status: 'pending'
  });

  return tx;
}

// Xử lý thanh toán (mock)
async function processPaymentService(transactionId,userId, role) {
  const tx = await Transaction.findOne({ transaction_id: transactionId });
  if (!tx) throw new ApiError(404, 'Transaction not found');
  
   // Chỉ elderly mới được thực hiện thanh toán
  if (role !== 'elderly' || tx.elderly_id !== userId) {
    throw new ApiError(403, 'Unauthorized payment attempt');
  } 

  if (tx.status !== 'pending') {
    throw new ApiError(400, 'Only pending transactions can be processed');
  }

  // Giả lập gọi API ngân hàng
  const paymentSuccess = mockBankPayment(tx);
  
  if (paymentSuccess) {
    tx.status = 'completed';
    await tx.save();
    
    // Cập nhật hợp đồng
    await Contract.findByIdAndUpdate(
      tx.contract_id,
      { $set: { 'payment_details.transaction_id': tx.transaction_id } }
    );
    
    return tx;
  } else {
    tx.status = 'failed';
    await tx.save();
    throw new ApiError(402, 'Payment failed');
  }
}

// Mock bank payment
function mockBankPayment(transaction) {
  // Trong thực tế sẽ gọi API ngân hàng ở đây
  return Math.random() > 0.1; // 90% thành công
}

function mockBankRefund(transaction) {
  return Math.random() > 0.8; // 80% thành công
}

// Hoàn tiền
async function refundTransactionService(transactionId, reason) {
  const tx = await Transaction.findOne({ transaction_id: transactionId });
  if (!tx) throw new ApiError(404, 'Transaction not found');
  
  if (tx.status !== 'completed') {
    throw new ApiError(400, 'Only completed transactions can be refunded');
  }

  // Giả lập hoàn tiền
  const refundSuccess = mockBankRefund(tx);
  
  if (refundSuccess) {
    tx.status = 'cancelled';
    tx.note = reason;
    await tx.save();
    return tx;
  } else {
    throw new ApiError(500, 'Refund failed');
  }
}

// Lấy giao dịch theo người dùng
async function getUserTransactionsService(userId, role, { page = 1, limit = 20 }) {
  const filter = {};
  filter[`${role}_id`] = userId;
  
  const skip = (page - 1) * limit;
  
  const [items, total] = await Promise.all([
    Transaction.find(filter).skip(skip).limit(limit).sort({ created_at: -1 }),
    Transaction.countDocuments(filter)
  ]);
  
  return { items, total, page, limit };
}

  async function listTransactionsService({ page = 1, limit = 20, status, elderly_id, nurse_id }) {
    const filter = {};
    if (status)      filter.status = status;
    if (elderly_id)  filter.elderly_id = elderly_id;
    if (nurse_id)    filter.nurse_id   = nurse_id;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Transaction.find(filter).skip(skip).limit(limit),
      Transaction.countDocuments(filter)
    ]);

    return { items, total, page, limit };
  }

  async function updateTransactionStatusService(transactionId, newStatus) {
    const allowed = ['pending','completed','failed','cancelled'];
    if (!allowed.includes(newStatus)) {
      throw new ApiError(400, 'Invalid transaction status');
    }
    const tx = await Transaction.findOneAndUpdate(
      { transaction_id: transactionId },
      { status: newStatus },
      { new: true, runValidators: true }
    );
    if (!tx) throw new ApiError(404, 'Transaction not found');
    return tx;
  }


  module.exports = {
    createTransactionFromContractService,
    processPaymentService,
    refundTransactionService,
    getUserTransactionsService,
    listTransactionsService,
    updateTransactionStatusService
  };