const express = require('express');
const router = express.Router();
const {
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const { authorizePermission } = require('../middleware/permissionMiddleware');

router.route('/').get(protect, getItems).post(protect, authorizePermission('canEditInventory'), createItem);
router
    .route('/:id')
    .get(protect, getItemById)
    .put(protect, authorizePermission('canEditInventory'), updateItem)
    .delete(protect, authorizePermission('canDeleteItems'), deleteItem);

module.exports = router;
