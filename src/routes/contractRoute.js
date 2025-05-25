const express = require('express');
const { auth, permit } = require('../middleware/auth');
const {
  listContracts,
  getContractById,
  updateContractStatus,
  deleteContract,
  fillContract
} = require('../controllers/contractController');

const router = express.Router();

/**
 * @swagger
 * /contract:
 *   get:
 *     summary: Lấy danh sách hợp đồng (admin)
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, active, violated, terminated]
 *     responses:
 *       200:
 *         description: Danh sách hợp đồng và phân trang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 contracts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contract'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */
router.get('/', listContracts);//admin

/**
 * @swagger
 * /contract/{id}:
 *   get:
 *     summary: Lấy thông tin hợp đồng theo id
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của hợp đồng
 *     responses:
 *       200:
 *         description: Thông tin hợp đồng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Contract'
 *       404:
 *         description: Không tìm thấy hợp đồng
 */
router.get('/:id', getContractById);

/**
 * @swagger
 * /contract/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái hợp đồng (admin)
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của hợp đồng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, active, violated, terminated]
 *                 example: active
 *     responses:
 *       200:
 *         description: Trạng thái hợp đồng đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Contract'
 *       404:
 *         description: Không tìm thấy hợp đồng
 */
router.patch('/:id/status', permit('admin'), updateContractStatus);

/**
 * @swagger
 * /contract/{id}:
 *   delete:
 *     summary: Xóa hợp đồng (admin)
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của hợp đồng
 *     responses:
 *       200:
 *         description: Đã xóa hợp đồng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Contract deleted
 *       404:
 *         description: Không tìm thấy hợp đồng
 */
router.delete('/:id', permit('admin'), deleteContract);

/**
 * @swagger
 * /contract/{id}/fill:
 *   put:
 *     summary: Điền chi tiết hợp đồng (nurse hoặc admin)
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của hợp đồng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               terms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách điều khoản hợp đồng
 *                 example: ["Elderly phải thanh toán trước 50% giá trị hợp đồng."]
 *               payment_details:
 *                 type: object
 *                 properties:
 *                   service_level:
 *                     type: string
 *                     enum: [basic, standard, premium]
 *                   price_per_hour:
 *                     type: number
 *                   total_hours_booked:
 *                     type: number
 *                   deposit_amount:
 *                     type: number
 *                   remaining_payment:
 *                     type: number
 *                   nurse_share_percentage:
 *                     type: number
 *                   platform_share_percentage:
 *                     type: number
 *                   nurse_total_earnings:
 *                     type: number
 *                   elderly_total_payment:
 *                     type: number
 *                   paid:
 *                     type: boolean
 *                 description: Thông tin thanh toán
 *               effective_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-06-01"
 *               expiry_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-01"
 *     responses:
 *       200:
 *         description: Hợp đồng đã được điền chi tiết và gửi OTP ký cho elderly/nurse
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Contract'
 *       400:
 *         description: Chỉ hợp đồng pending mới có thể fill detail
 *       404:
 *         description: Không tìm thấy hợp đồng
 */
router.put('/:id/fill', permit('nurse','admin'), fillContract);
module.exports = router;