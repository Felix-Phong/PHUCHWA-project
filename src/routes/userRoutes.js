const express = require('express');
const {
  getAllUsers,
  handleLogin,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

// Lấy danh sách tất cả users:      GET  /users/
router.get('/', getAllUsers);

// Tạo mới user:                    POST /users/register
router.post('/register', createUser);

router.post('/login', handleLogin);

// Cập nhật user theo ID:           PUT  /users/:id
router.put('/:id', updateUser);

// Xóa user theo ID:                DELETE /users/:id
router.delete('/:id', deleteUser);

module.exports = router;
