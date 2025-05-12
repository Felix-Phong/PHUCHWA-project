const { getNurseByIdService,createNurseProfileService } = require('../services/nurseService');
const ApiError = require('../utils/apiError');

const getNurseById = async (req, res, next) => {
try {
    const nurseId = req.params.id;
    const nurse = await getNurseByIdService(nurseId);

    if (!nurse) {
        return next(new ApiError(404, 'Nurse not found'));
    }

    res.status(200).json({
        success: true,
        data: nurse,
    });
} catch (error) {
    next(new ApiError(500, 'Internal Server Error'));
}
};

const createNurseProfile = async (req, res, next) => {
  try {
    const nurseProfile = await createNurseProfileService(req);

    res.status(201).json({
      success: true,
      data: nurseProfile,
    });
  } catch (error) {
    next(error); // Sử dụng middleware xử lý lỗi
  }
};

module.exports = {
    getNurseById,
    createNurseProfile,
};