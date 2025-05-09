 const jwt = require('jsonwebtoken');
 require('dotenv').config();
 const ApiError = require('../utils/apiError');

 const auth = (req, res, next) => {
  const whiteList = ['/', '/users/login', '/users/register'];

  // Bỏ qua kiểm tra auth cho các route trong danh sách whiteList
  if (whiteList.includes(req.originalUrl.replace('/api', ''))) {
    return next();
  }

  // Lấy token từ header Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authorization token is missing or invalid'));
  }

  const token = authHeader.split(' ')[1];

  try {
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      email: decoded.email,
      id: decoded.id
    };
    next();
  } catch (err) {
    return next(new ApiError(401, 'Token is invalid or expired'));
  }
};
 
    
    
    module.exports = auth;