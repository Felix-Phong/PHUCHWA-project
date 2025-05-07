 const jwt = require('jsonwebtoken');
 require('dotenv').config();
 const ApiError = require('../utils/apiError');

 const auth = (req, res, next) => {
    const token = req.headers['Authorization']?.replace('Bearer ', '');
    
    if(!token)
    {
        throw new ApiError(401, 'Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        throw new ApiError(401, 'Invalid token.');
    }
};
    
    
    module.exports = auth;