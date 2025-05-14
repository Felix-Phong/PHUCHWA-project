const express = require('express');
const { createCard,getCardByCardId,getCardByUserId,updateCard,deleteCard } = require('../controllers/cardController');
const router = express.Router();

/**
 * @swagger
 * /cards:
 *   post:
 *     summary: Tạo mới một card (dùng nội bộ)
 *     tags: [Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hashed_student_id:
 *                 type: string
 *               user_id:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [nurse, elderly]
 *               public_key:
 *                 type: string
 *               private_key_encrypted:
 *                 type: string
 *               qr_code_data:
 *                 type: string
 *     responses:
 *       201:
 *         description: Card created
 */
router.post('/', createCard);

/**
 * @swagger
 * /cards/card/{card_id}:
 *   get:
 *     summary: Lấy thông tin card theo card_id
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: card_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của card
 *     responses:
 *       200:
 *         description: Thông tin card
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
 *       404:
 *         description: Không tìm thấy card
 */
router.get('/card/:card_id', getCardByCardId);

/**
 * @swagger
 * /cards/user/{user_id}:
 *   get:
 *     summary: Lấy thông tin card theo user_id
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Thông tin card
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
 *       404:
 *         description: Không tìm thấy card
 */
router.get('/user/:user_id', getCardByUserId);

/**
 * @swagger
 * /cards/card/{card_id}:
 *   put:
 *     summary: Cập nhật thông tin card theo card_id
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: card_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của card
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hashed_student_id:
 *                 type: string
 *               user_id:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [nurse, elderly]
 *               public_key:
 *                 type: string
 *               private_key_encrypted:
 *                 type: string
 *               qr_code_data:
 *                 type: string
 *     responses:
 *       200:
 *         description: Card đã được cập nhật
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
 *       404:
 *         description: Không tìm thấy card
 */
router.put('/card/:card_id', updateCard);

/**
 * @swagger
 * /cards/card/{card_id}:
 *   delete:
 *     summary: Xóa card theo card_id
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: card_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của card
 *     responses:
 *       200:
 *         description: Card đã được xóa
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
 *                   example: Card deleted
 *       404:
 *         description: Không tìm thấy card
 */
router.delete('/card/:card_id', deleteCard);
module.exports = router;