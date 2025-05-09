const {getAllUsersService,createUserService,loginService,deleteUserService,updateUserService} = require('../services/userService')
const {createLoggingSession,updateLogoutTime} = require('../services/logginSessionService')
const createUser = async (req, res, next) => {
  try {
 
    const { email, password, role, student_id, card_id } = req.body;

    const user = await createUserService({ email, password, role, student_id, card_id });

    return res.status(201).json({ success: true, data: user });
  } catch (error) {
  
    next(error);
  }
};

const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email và password là bắt buộc' });
    }

    // Gọi service để xử lý đăng nhập
    const data = await loginService(email, password);

     // Lưu phiên đăng nhập
     await createLoggingSession({
      user_id: data.user.id,
      role: data.user.role,
      token: data.access_token,
      card_id: req.body.card_id || null // Nếu có card_id
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateLogout = async (req, res, next) => {
 try {
  const token = req.headers.authorization.split(' ')[1]; // Lấy token từ header
  await updateLogoutTime(token); // Cập nhật thời gian đăng xuất
  return res.status(200).json({ success: true, message: 'Logout time updated successfully' });
 } catch (error) {
   next(error);
 }
}

const getAccount = async (req, res,next) => {
return res.status(200).json(req.user);
}

const getAllUsers = async (req, res,next) => {
  try {
      const users = await getAllUsersService()
      res.status(200).json({success: true, data: users})
  } catch (error) {
      next(error)
  }
}

const updateUser = async (req, res,next) => {
  try {
      const user = await updateUserService(req.params.id, req.body)
      res.status(200).json({success: true, data: user})
  } catch (error) {
      next(error)
  }
}

const deleteUser = async (req, res,next) => {
  try {
      await deleteUserService(req.params.id)
      res.status(200).json({success: true, message: 'User deleted successfully'})
  } catch (error) {
      next(error)
  }
}

module.exports = {
  getAllUsers,
  createUser,
  handleLogin,
  updateLogout,
  getAccount,
  updateUser,
  deleteUser
}

