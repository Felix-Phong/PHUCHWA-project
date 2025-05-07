require('dotenv').config()
const User = require('../models/UserModel')
const ApiError = require('../utils/apiError')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const saltRounds = 10;

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

const createUserService = async (email,password) => {
 try{

  const hashPassword = await bcrypt.hash(password, saltRounds)

  let result = await User.create({
    email:email,
    password:hashPassword
  })
  return result
 } catch(err){
  if (err.code === 11000) {
    throw new ApiError(409, 'Email already exists')
  } else if (err.name === 'ValidationError') {
    throw new ApiError(400, err.message)
  } else {
    throw new ApiError(500, 'Internal server error')
  }
}
}

const loginService = async (email, password) => {
 try{
  const user = await User.find ({ email: email});
  if(user)
  {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const payload = {
        id: user._id,
        email: user.email, 
      }


      const access_token   = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE } 
      )

      return {
        access_token,
        user:{
          id: user._id,
          email: user.email, 
        }
      };
      } else {
      throw new ApiError(401, 'Invalid Email/Password')
    }

  }else{
    throw new ApiError(401, 'Invalid Email/Password')
  }
}
catch(err){

}
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
  updateUserService,
  deleteUserService
}
