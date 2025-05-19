const express = require('express');
const { auth, permit } = require('../middleware/auth');
const {
  createMatching,
  listMatching,
  getMatchingById,
  updateBookingTime,
  signContract,
  reportViolation,
  completeMatch,
  resetMatch,
  deleteMatching
} = require('../controllers/matchingController');

const router = express.Router();

router.post('/', permit('elderly'), createMatching);
router.get('/', listMatching);//admin
router.get('/:id', getMatchingById);
router.patch('/:id/booking', permit('elderly'), updateBookingTime);
router.post('/:id/sign', signContract);
router.post('/:id/violation', reportViolation);
router.post('/:id/complete', completeMatch);//admin
router.post('/:id/reset', resetMatch);//admin
router.delete('/:id', deleteMatching);//admin

module.exports = router;