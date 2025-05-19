const ApiError = require('../utils/apiError');
const Contract = require('../models/ContractModel');


const listContractsService = async ({ page = 1, limit = 20, status }) => {
  const skip = (page - 1) * limit;
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
  if (!['pending', 'active', 'violated', 'terminated'].includes(status)) {
    throw new ApiError(400, 'Invalid contract status');
  }
  const contract = await Contract.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );
  if (!contract) throw new ApiError(404, 'Contract not found');
  return contract;
};

const deleteContractService = async (id) => {
  const contract = await Contract.findByIdAndDelete(id);
  if (!contract) throw new ApiError(404, 'Contract not found');
  return { message: 'Contract deleted' };
};


module.exports = {
  listContractsService,
  getContractByIdService,
  updateContractStatusService,
  deleteContractService
};