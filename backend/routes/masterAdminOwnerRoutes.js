const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireMasterAdmin } = require('../middleware/roleMiddleware');
const {
  getOwners,
  getOwnerById,
  createOwner,
  updateOwner,
  resetOwnerPassword,
} = require('../controllers/masterAdminOwnerController');

router.use(protect);
router.use(requireMasterAdmin);

router.route('/').get(getOwners).post(createOwner);
router.route('/:id').get(getOwnerById).put(updateOwner);
router.post('/:id/reset-password', resetOwnerPassword);

module.exports = router;
