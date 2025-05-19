const express = require('express');
const { auth, permit } = require('../middleware/auth');
const {
  listContracts,
  getContractById,
  updateContractStatus,
  deleteContract
} = require('../controllers/contractController');

const router = express.Router();

router.get('/',    permit('admin'), listContracts);
router.get('/:id', getContractById);
router.patch('/:id/status', permit('admin'), updateContractStatus);
router.delete('/:id',        permit('admin'), deleteContract);
module.exports = router;