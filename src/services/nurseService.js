const Nurse = require('../models/NurseModel');
const {User} = require('../models/UserModel');
const ApiError = require('../utils/apiError');
const {createCardService} = require('../services/cardService');

const getNurseByIdService = async (nurseId) => {
  try {
    // Tìm nurse bằng nurse_id và populate thông tin từ User
    const nurse = await Nurse.findOne({ nurse_id: nurseId });

    if (!nurse) {
      throw new ApiError(404, 'Nurse not found');
    }

    return nurse;
  } catch (error) {
    console.error('Error in getNurseByIdService:', error); // Log lỗi chi tiết
    throw new ApiError(500, `Error fetching nurse: ${error.message}`);
  }
};

const createNurseProfileService = async (req) => {
  const {
    level,
    experience_years,
    specializations,
    certifications,
    location,
    school,
    year_of_study,
    poseidonHash,
    test_score,
    class: nurseClass,
    course,
    major
  } = req.body;

  // Kiểm tra role của người dùng
  if (req.user.role !== 'nurse') {
    throw new ApiError(403, 'Only nurses can create profiles');
  }

  // Lấy user từ DB để kiểm tra email_verified
  const user = await User.findOne({ user_id: req.user.user_id });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  if (!user.email_verified) {
    throw new ApiError(403, 'Email must be verified before creating profile');
  }

  // Kiểm tra xem hồ sơ đã tồn tại chưa
  const existingProfile = await Nurse.findOne({ user_id: req.user.user_id });
  if (existingProfile) {
    throw new ApiError(400, 'Profile already exists');
  }

   // Tạo card tự động (card_id sẽ tự sinh trong service)
  const card = await createCardService({
    user_id: req.user.user_id,
    student_id: user.student_id,
    role: req.user.role
  });

  // Tạo hồ sơ mới
  const nurseProfile = new Nurse({
    user_id: req.user.user_id,
    student_id: user.student_id,
    card_id: card.card_id,
    level,
    experience_years,
    specializations,
    certifications,
    location,
    school,
    year_of_study,
    poseidonHash,
    test_score,
    class: nurseClass,
    course,
    major,
    profile_completed: true
  });

  await nurseProfile.save();

 
  return nurseProfile;
};

module.exports = {
  getNurseByIdService,
  createNurseProfileService,
};