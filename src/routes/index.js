const express = require('express');
const userRoutes = require('./userRoutes');
const nurseRoutes = require('./nurseRoute'); 
const delay = require('../middleware/delay');
const auth = require('../middleware/auth'); // Import middleware auth nếu cần
// Nếu có thêm routes khác, import ở đây
// const productRoutes = require('./productRoutes');

const routerAPI = express.Router();

// Áp dụng delay cho tất cả các request vào router này
routerAPI.use(delay);

// Định nghĩa các route con
routerAPI.use('/users', userRoutes);
routerAPI.use('/nurses', auth, nurseRoutes); 
// Ví dụ thêm nếu có productRoutes
// routerAPI.use('/products', productRoutes);

module.exports = routerAPI;
