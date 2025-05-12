const express = require('express');
const { getNurseById, createNurseProfile} = require('../controllers/nurseController');
const auth = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /nurses/{id}:
 *   get:
 *     summary: Lấy thông tin y tá
 *     tags: [Nurses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của y tá
 *     responses:
 *       200:
 *         description: Thông tin y tá
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
 *                     user_id:
 *                       type: string
 *                       description: ID của người dùng liên kết
 *                       example: 64b7f3c2e4b0d6a1f8e4b0d6
 *                     card_id:
 *                       type: string
 *                       description: ID thẻ QR của y tá
 *                       example: 64b7f3c2e4b0d6a1f8e4b0d6
 *                     student_id:
 *                       type: string
 *                       description: ID sinh viên của y tá
 *                       example: 64b7f3c2e4b0d6a1f8e4b0d6
 *                     level:
 *                       type: string
 *                       description: Cấp độ của y tá
 *                       example: standard
 *       404:
 *         description: Y tá không tồn tại
 *       500:
 *         description: Lỗi máy chủ
 */

router.get('/:id', auth, getNurseById);

/**
 * @swagger
 * /nurses/profile:
 *   post:
 *     summary: Tạo hồ sơ y tá
 *     tags: [Nurses]
 *     security:
 *       - bearerAuth: [] # Yêu cầu xác thực bằng Bearer Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               card_id:
 *                 type: string
 *                 description: ID thẻ QR của y tá (phải tham chiếu đến User)
 *                 example: 64b7f3c2e4b0d6a1f8e4b0d6
 *               student_id:
 *                 type: string
 *                 description: ID sinh viên của y tá (phải tham chiếu đến User)
 *                 example: 64b7f3c2e4b0d6a1f8e4b0d6
 *               level:
 *                 type: string
 *                 description: Cấp độ của y tá
 *                 enum: [basic, standard, premium]
 *                 example: standard
 *               experience_years:
 *                 type: number
 *                 description: Số năm kinh nghiệm
 *                 example: 3
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách chuyên môn của y tá
 *                 example: ["Pediatrics", "Geriatrics"]
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách chứng chỉ của y tá
 *                 example: ["BLS", "ACLS"]
 *               location:
 *                 type: string
 *                 description: Địa chỉ của y tá
 *                 example: "123 Main Street, City, Country"
 *               school:
 *                 type: string
 *                 description: Trường học của y tá
 *                 example: "Medical University"
 *               year_of_study:
 *                 type: number
 *                 description: Năm học của y tá
 *                 example: 3
 *               poseidonHash:
 *                 type: string
 *                 description: Hash Poseidon của y tá
 *                 example: "abc123hash"
 *               test_score:
 *                 type: number
 *                 description: Điểm kiểm tra của y tá
 *                 example: 8
 *               class:
 *                 type: string
 *                 description: Lớp học của y tá
 *                 example: "Class A"
 *               course:
 *                 type: string
 *                 description: Khóa học của y tá
 *                 example: "Nursing"
 *               major:
 *                 type: string
 *                 description: Chuyên ngành của y tá
 *                 example: "Pediatrics"
 *     responses:
 *       201:
 *         description: Hồ sơ y tá được tạo thành công
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
 *       400:
 *         description: Hồ sơ đã tồn tại hoặc dữ liệu không hợp lệ
 *       403:
 *         description: Người dùng không có quyền tạo hồ sơ
 *       500:
 *         description: Lỗi máy chủ
 */
router.post('/profile',auth,createNurseProfile);

module.exports = router;