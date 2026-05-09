const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireMasterAdmin } = require('../middleware/roleMiddleware');
const {
    getMasterAdminStores,
    getMasterAdminStoreById,
    updateMasterAdminStore,
    deleteMasterAdminStore,
} = require('../controllers/masterAdminStoreController');

router.use(protect);
router.use(requireMasterAdmin);

router.route('/').get(getMasterAdminStores);
router.route('/:id').get(getMasterAdminStoreById).put(updateMasterAdminStore).delete(deleteMasterAdminStore);

module.exports = router;
