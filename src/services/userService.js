require('dotenv').config()
const {User, Nurse, Elderly} = require('../models/UserModel')
const ApiError = require('../utils/apiError')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const saltRounds = 10;
const {sendVerificationEmail} = require('./helperService')
const redis = require('../../config/redisClient') 

const getAllUsersService = async () => {
  return await User.find()
}

const getUserByIdService = async (userId) => {
  const user = await User.findById(userId)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }
  return user
}

const createUserService = async ({ email, password, role, student_id, card_id }) => {
  // 1. Kiểm tra dữ liệu đầu vào
  if (!email || !password || !role) {
    throw new ApiError(400, 'Email, password và role đều bắt buộc');
  }
  if (!['nurse', 'elderly'].includes(role)) {
    throw new ApiError(400, 'Role không hợp lệ (phải là nurse hoặc elderly)');
  }
  if (role === 'nurse' && !student_id) {
    throw new ApiError(400, 'student_id là bắt buộc khi role = nurse');
  }

  // 2. Kiểm tra email, student_id, và card_id trùng lặp
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email đã tồn tại');
  }
  if (student_id) {
    const existingStudent = await User.findOne({ student_id });
    if (existingStudent) {
      throw new ApiError(409, 'Student ID đã tồn tại');
    }
  }
  if (card_id) {
    const existingCard = await User.findOne({ card_id });
    if (existingCard) {
      throw new ApiError(409, 'Card ID đã tồn tại');
    }
  }

  try {
    // 3. Hash mật khẩu
    const hashPassword = await bcrypt.hash(password, saltRounds);
  
    // 4. Tạo user dựa trên role
    let created;
    if (role === 'nurse') {
      created = await Nurse.create({
        email,
        password: hashPassword,
        student_id,
        card_id
      });
    } else if (role === 'elderly') {
      created = await Elderly.create({
        email,
        password: hashPassword,
        card_id
      });
    }
  
    // 5. Xóa password trước khi trả về
    created.password = undefined;
  
    return {
      message: 'User created successfully',
      user: created
    };
  } catch (err) {

    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      throw new ApiError(409, `${field} đã tồn tại`);
    }
    if (err.name === 'ValidationError') {
      throw new ApiError(400, err.message);
    }
    throw new ApiError(500, 'Internal server error');
  }
};

const loginService = async (email, password) => {
  try {
    // 1. Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, 'Invalid Email/Password');
    }

    // 2. So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid Email/Password');
    }

    // 3. Tạo payload cho JWT
    const payload = {
      user_id: user.user_id,
      email: user.email,
      role: user.role, // Thêm role nếu cần
    };

    // 4. Tạo access token
    const access_token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // 5. Trả về token và thông tin user
    return {
      access_token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role, // Thêm role nếu cần
      },
    };
  } catch (err) {
    // 6. Xử lý lỗi
    console.error(err);
    throw new ApiError(500, 'Internal Server Error');
  }
};

const sendVerifyEmailService = async (email) => {
  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

 
  const otp = crypto.randomInt(100000, 999999).toString();


  const otpKey = `otp:${email}`;
  await redis.set(otpKey, otp, 'EX', 300); // EX: thời gian hết hạn là 300 giây (5 phút)

  await sendVerificationEmail(email,otp);
}

const verifyAccountService = async (email, otp) => {

  if (!email || !otp) {
    throw new ApiError(400, 'Email and OTP are required');
  }

  const otpKey = `otp:${email}`;
  const storedOtp = await redis.get(otpKey);

  if (!storedOtp) {
    throw new ApiError(400, 'OTP has expired or is invalid');
  }

  if (storedOtp !== otp) {
    throw new ApiError(400, 'Invalid OTP');
  }

  // Xóa OTP sau khi xác thực thành công
  await redis.del(otpKey);
  
  const user = await User.findOneAndUpdate(
    { email },
    { email_verified: true },
    { new: true }
  );

   if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return { message: 'Email verified successfully', user };
}

const updateUserService = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true })
  if (!user) {
    throw new ApiError(404, 'User not found')
  }
  return user
}

const deleteUserService = async (userId) => {
  const user = await User.findByIdAndDelete(userId)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }
  return user
}

module.exports = {
  getAllUsersService,
  getUserByIdService,
  createUserService,
  loginService,
  verifyAccountService,
  sendVerifyEmailService,
  updateUserService,
  deleteUserService
}
