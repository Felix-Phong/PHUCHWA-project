// services/contractService.js
const ApiError = require('../utils/apiError');
const Contract = require('../models/ContractModel');
const {requestSignOtpService} = require('./matchingService')
const {User} = require('../models/UserModel');
const Nurse = require('../models/NurseModel');


const listContractsService = async ({ page=1, limit=20, status }) => {
  const skip = (page-1)*limit;
  const filter = {};
  if (status) filter.status = status;
  const [contracts, total] = await Promise.all([
    Contract.find(filter).skip(skip).limit(limit),
    Contract.countDocuments(filter)
  ]);
  return { contracts, total, page, limit };
};

const getContractByIdService = async (id) => {
  const contract = await Contract.findById(id);
  if (!contract) throw new ApiError(404, 'Contract not found');
  return contract;
};

const updateContractStatusService = async (id, status) => {
  if (!['pending','active','violated','terminated'].includes(status)) {
    throw new ApiError(400, 'Invalid status');
  }
  const contract = await Contract.findByIdAndUpdate(
    id, { status }, { new: true, runValidators: true }
  );
  if (!contract) throw new ApiError(404, 'Contract not found');

  

  return contract;
};

const deleteContractService = async (id) => {
  const contract = await Contract.findByIdAndDelete(id);
  if (!contract) throw new ApiError(404, 'Contract not found');
  return { message: 'Contract deleted' };
};

async function fillContractService(contractId, data, userId) {
  // 1. Lấy hợp đồng
  const contract = await Contract.findById(contractId);
  if (!contract) throw new ApiError(404, 'Contract not found');
  if (contract.status !== 'pending') {
    throw new ApiError(400, 'Chỉ hợp đồng pending mới có thể fill detail');
  }

  // 2. Điền chi tiết hợp đồng
  contract.terms = data.terms || contract.terms;
  contract.payment_details = {
    ...contract.payment_details.toObject(),
    ...data.payment_details
  };
  contract.effective_date = data.effective_date;
  contract.expiry_date    = data.expiry_date;

  // 3. Ghi log fill details
  contract.history_logs.push({
    action: 'filled_details',
    modified_by: userId,
    timestamp: new Date()
  });

  // 4. Cập nhật last_modified
  contract.last_modified_at = new Date();

  // 5. Lưu
  await contract.save();

  // 6. Gửi OTP cho Elderly
  try {
    const elderlyUser = await User.findOne({ user_id: contract.elderly_id });
    if (elderlyUser) {
      await requestSignOtpService(
        contract.matching_id,
        'elderly',
        elderlyUser.email
      );
    }
  } catch (e) {
    console.error('Failed to send OTP to Elderly:', e);
  }

  // 7. Gửi OTP cho Nurse
  try {
    const nurseProfile = await Nurse.findOne({ nurse_id: contract.nurse_id });
    if (nurseProfile) {
      const nurseUser = await User.findOne({ user_id: nurseProfile.user_id });
      if (nurseUser) {
        await requestSignOtpService(
          contract.matching_id,
          'nurse',
          nurseUser.email
        );
      }
    }
  } catch (e) {
    console.error('Failed to send OTP to Nurse:', e);
  }

  return contract;
}



module.exports = {
  fillContractService,
  listContractsService,
  getContractByIdService,
  updateContractStatusService,
  deleteContractService
};
