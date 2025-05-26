const express = require('express');
const router = express.Router();
const {submitTest,getTestHistory} = require('../controllers/testController');
const {auth,permit} = require('../middleware/auth');


/**
 * @swagger
 * /test/submit:
 *   post:
 *     summary: Nộp bài kiểm tra (submit test attempt)
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [questions]
 *             properties:
 *               questions:
 *                 type: array
 *                 description: Danh sách câu hỏi và đáp án người dùng chọn
 *                 items:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                       example: "What is 2 + 2?"
 *                     difficulty:
 *                       type: string
 *                       enum: [easy, medium, hard]
 *                       example: easy
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["1", "2", "3", "4"]
 *                     correct_answer:
 *                       type: string
 *                       example: "4"
 *                     user_answer:
 *                       type: string
 *                       example: "4"
 *     responses:
 *       201:
 *         description: Kết quả bài kiểm tra đã được tính toán và lưu lại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 attempt_id:
 *                   type: string
 *                 user_id:
 *                   type: string
 *                 total_questions:
 *                   type: integer
 *                 correct_answers:
 *                   type: integer
 *                 score:
 *                   type: number
 *                 current_score:
 *                   type: number
 *                 average_score:
 *                   type: number
 *                 question_details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       question:
 *                         type: string
 *                       options:
 *                         type: array
 *                         items:
 *                           type: string
 *                       correct_answer:
 *                         type: string
 *                       user_answer:
 *                         type: string
 *                       is_correct:
 *                         type: boolean
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 */
router.post('/submit', auth, permit('nurse'), submitTest);

/**
 * @swagger
 * /test/history:
 *   get:
 *     summary: Lấy lịch sử kết quả test của user hiện tại (admin)
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách kết quả test của user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   attempt_id:
 *                     type: string
 *                   user_id:
 *                     type: string
 *                   total_questions:
 *                     type: integer
 *                   correct_answers:
 *                     type: integer
 *                   score:
 *                     type: number
 *                   current_score:
 *                     type: number
 *                   average_score:
 *                     type: number
 *                   question_details:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         question:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                         correct_answer:
 *                           type: string
 *                         user_answer:
 *                           type: string
 *                         is_correct:
 *                           type: boolean
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 */
router.get('/history', auth, getTestHistory); //admin

module.exports = router;