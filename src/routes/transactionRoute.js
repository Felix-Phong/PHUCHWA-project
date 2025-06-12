const express = require('express');
const router  = express.Router();
const { auth, permit } = require('../middleware/auth');
const {
  createFromContract,
  processPayment,
  refund,
  getUserTransactions,
  listTransactions,
  updateTransactionStatus
} = require('../controllers/transactionController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - transaction_id
 *         - elderly_id
 *         - nurse_id
 *         - amount
 *         - currency
 *         - service_type
 *         - platform_fee
 *         - nurse_receive_amount
 *         - status
 *         - payment_method
 *         - created_at
 *         - updated_at
 *       properties:
 *         transaction_id:
 *           type: string
 *           description: ID giao dịch duy nhất (UUIDv4)
 *         elderly_id:
 *           type: string
 *           description: ID elderly thực hiện thanh toán
 *         nurse_id:
 *           type: string
 *           description: ID nurse nhận thanh toán
 *         amount:
 *           type: number
 *           minimum: 0
 *           description: Số tiền thanh toán
 *         currency:
 *           type: string
 *           enum: [VND, ETH, USDT, PlatformToken]
 *           description: Loại tiền tệ
 *         service_type:
 *           type: string
 *           enum: [basic, standard, premium]
 *           description: Loại dịch vụ
 *         platform_fee:
 *           type: number
 *           minimum: 0
 *           description: Phí nền tảng
 *         nurse_receive_amount:
 *           type: number
 *           minimum: 0
 *           description: Số tiền nurse nhận
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *           description: Trạng thái giao dịch
 *         payment_method:
 *           type: string
 *           enum: [bank_transfer]
 *           description: Phương thức thanh toán
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         note:
 *           type: string
 *           nullable: true
 *           description: Ghi chú giao dịch
 *         withdraw_request_id:
 *           type: string
 *           nullable: true
 *           description: ID rút tiền liên quan (nếu có)
 */

/**
 * @swagger
 * /transactions/from-contract/{contractId}:
 *   post:
 *     summary: Tạo giao dịch từ hợp đồng (admin hoặc hệ thống)
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của hợp đồng
 *     responses:
 *       201:
 *         description: Giao dịch đã được tạo từ hợp đồng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Không tìm thấy hợp đồng
 */
router.post('/from-contract/:contractId', auth, createFromContract);

/**
 * @swagger
 * /transactions/process/{transactionId}:
 *   post:
 *     summary: Xử lý thanh toán giao dịch (elderly)
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID giao dịch
 *     responses:
 *       200:
 *         description: Thanh toán thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Giao dịch không hợp lệ
 *       404:
 *         description: Không tìm thấy giao dịch
 */
router.post('/process/:transactionId', auth, processPayment);

/**
 * @swagger
 * /transactions/refund/{transactionId}:
 *   post:
 *     summary: Hoàn tiền giao dịch (admin)
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID giao dịch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Lý do hoàn tiền
 *     responses:
 *       200:
 *         description: Hoàn tiền thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Giao dịch không hợp lệ
 *       404:
 *         description: Không tìm thấy giao dịch
 */
router.post('/refund/:transactionId', auth, permit('admin'), refund);

/**
 * @swagger
 * /transactions/user:
 *   get:
 *     summary: Lấy danh sách giao dịch của user hiện tại (nurse hoặc elderly)
 *     tags: [Transaction]
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
 *     responses:
 *       200:
 *         description: Danh sách giao dịch của user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */
router.get('/user', auth, getUserTransactions);

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Lấy danh sách giao dịch (lọc theo role, phân trang)
 *     tags: [Transaction]
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
 *           enum: [pending, completed, failed, cancelled]
 *       - in: query
 *         name: elderly_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: nurse_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách giao dịch và phân trang
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 */
router.get('/', auth, listTransactions);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Lấy chi tiết giao dịch theo transaction_id
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: transaction_id của giao dịch
 *     responses:
 *       200:
 *         description: Chi tiết giao dịch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Không tìm thấy giao dịch
 */
router.get('/:id', auth, getUserTransactions); // hoặc getTransactionById nếu có

/**
 * @swagger
 * /transactions/{transactionId}/status:
 *   patch:
 *     summary: Cập nhật trạng thái giao dịch (admin)
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: transaction_id của giao dịch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed, cancelled]
 *     responses:
 *       200:
 *         description: Đã cập nhật trạng thái giao dịch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Trạng thái không hợp lệ
 *       404:
 *         description: Không tìm thấy giao dịch
 */
router.patch('/:transactionId/status', auth, updateTransactionStatus);//admin

module.exports = router;