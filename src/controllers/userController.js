const {getAllUsersService,createUserService,deleteUserService,updateUserService} = require('../services/userService')

const createUser = async (req, res,next) => {
  try {
    const {email,password} = req.body;
    const user = await createUserService(email,password);
    return res.status(201).json({success: true, data: user});
  } catch (error) {
      next(error)
  }
}

const handleLogin = async (req, res,next) => {
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
  updateUser,
  deleteUser
}

