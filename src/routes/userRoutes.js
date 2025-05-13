const express = require('express');
const auth = require('../middleware/auth');
const {
  getAllUsers,
  handleLogin,
  createUser,
  updateLogout,
  getAccount,
  updateUser,
  deleteUser,
  sendVerifyEmail,
  verifyAccount
} = require('../controllers/userController');

const router = express.Router();

// Lấy danh sách tất cả users:      GET  /users/
router.get('/', getAllUsers);

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Tạo mới một người dùng
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email của người dùng
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: Mật khẩu của người dùng
 *                 example: password123
 *               role:
 *                 type: string
 *                 description: Vai trò của người dùng (nurse hoặc elderly)
 *                 example: nurse
 *               student_id:
 *                 type: string
 *                 description: ID sinh viên (bắt buộc nếu role là nurse)
 *                 example: STU123456
 *               card_id:
 *                 type: string
 *                 description: ID thẻ liên kết với người dùng
 *                 example: CARD123456
 *     responses:
 *       201:
 *         description: Người dùng đã được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: User created successfully
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 64b7f3c2e4b0d6a1f8e4b0d6
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         role:
 *                           type: string
 *                           example: nurse
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       409:
 *         description: Email hoặc ID đã tồn tại
 */
// Tạo mới user:                    POST /users/register
router.post('/register', createUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Đăng nhập người dùng
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email của người dùng
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: Mật khẩu của người dùng
 *                 example: password123
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                       description: JWT token để xác thực
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 64b7f3c2e4b0d6a1f8e4b0d6
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         role:
 *                           type: string
 *                           example: nurse
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       401:
 *         description: Email hoặc mật khẩu không chính xác
 */
router.post('/login', handleLogin);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Đăng xuất người dùng
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         description: Không có quyền truy cập (Unauthorized)
 */
router.post('/logout', auth, updateLogout);

/**
 * @swagger
 * /users/send-verify-email:
 *   post:
 *     summary: Gửi mã OTP xác thực email cho người dùng
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email của người dùng
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Gửi OTP thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP sent to email
 *       400:
 *         description: Thiếu email hoặc dữ liệu không hợp lệ
 */
router.post('/send-verify-email', sendVerifyEmail);

/**
 * @swagger
 * /users/verify-account:
 *   post:
 *     summary: Xác thực tài khoản người dùng bằng mã OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email của người dùng
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 description: Mã OTP đã gửi về email
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Xác thực thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     email_verified:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: OTP không hợp lệ hoặc đã hết hạn
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.post('/verify-account', verifyAccount);

router.get('/account',auth,getAccount);

// Cập nhật user theo ID:           PUT  /users/:id
router.put('/:id',auth, updateUser);

// Xóa user theo ID:                DELETE /users/:id
router.delete('/:id', auth,deleteUser);

module.exports = router;
