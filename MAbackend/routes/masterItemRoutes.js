const express = require('express');
const router = express.Router();
const {
    getMasterItems,
    createMasterItem,
    updateMasterItem,
    deleteMasterItem
} = require('../controllers/masterItemController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getMasterItems)
    .post(protect, createMasterItem);

router.route('/:id')
    .put(protect, updateMasterItem)
    .delete(protect, deleteMasterItem);

module.exports = router;
