const Nurse = require('../models/NurseModel');
const {User} = require('../models/UserModel');
const ApiError = require('../utils/apiError');

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
    card_id,
    level,
    experience_years,
    specializations,
    certifications,
    location,
    school,
    year_of_study,
    poseidonHash,
    test_score,
    student_id,
    class: nurseClass,
    course,
    major
  } = req.body;


  // Kiểm tra role của người dùng
  if (req.user.role !== 'nurse') {
    throw new ApiError(403, 'Only nurses can create profiles');
  }

  
  // Kiểm tra xem hồ sơ đã tồn tại chưa
  const existingProfile = await Nurse.findOne({ user_id: req.user.user_id });
  if (existingProfile) {
    throw new ApiError(400, 'Profile already exists');
  }

  // Kiểm tra xem card_id và student_id có hợp lệ không
  const userOrProfile = await User.findOne({
    $or: [
      { card_id }, // Kiểm tra card_id
      { student_id } // Kiểm tra student_id
    ]
  });

  // Kiểm tra từng trường hợp
  if (userOrProfile) {
    if (userOrProfile.card_id !== card_id) {
      console.log(`Invalid card_id: expected ${userOrProfile.card_id}, received ${card_id}`);
      throw new ApiError(400, 'Invalid card_id');
    }
    if (userOrProfile.student_id !== student_id) {
      console.log(`Invalid student_id: expected ${userOrProfile.student_id}, received ${student_id}`);
      throw new ApiError(400, 'Invalid student_id');
    }
  }

  // Tạo hồ sơ mới
  const nurseProfile = new Nurse({
     user_id: req.user.user_id, 
    card_id: userOrProfile.card_id , 
    student_id: userOrProfile.student_id, 
    card_id,
    level,
    experience_years,
    specializations,
    certifications,
    location,
    school,
    year_of_study,
    poseidonHash,
    test_score,
    student_id,
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