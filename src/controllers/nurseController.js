const { getNurseByUserIdService,createNurseProfileService,updateNurseProfileService } = require('../services/nurseService');
const ApiError = require('../utils/apiError');

const getNurseByUserId = async (req, res, next) => {
try {
    const userId = req.params.id;
    const nurse = await getNurseByUserIdService(userId);

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

const updateNurseProfile = async (req, res, next) => {
  try {
    const userId = req.user.user_id; 
    const updatedProfile = await updateNurseProfileService(userId, req.body);
    res.status(200).json({ success: true, data: updatedProfile });
  } catch (error) {
    next(error);
  }
};

module.exports = {
    getNurseByUserId,
    createNurseProfile,
    updateNurseProfile
};