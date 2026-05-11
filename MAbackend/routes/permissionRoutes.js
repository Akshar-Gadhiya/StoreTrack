const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizePermission } = require('../middleware/permissionMiddleware');
const { getRolePermissionMatrix, getPermissionCatalog, updateRolePermissions } = require('../controllers/permissionController');

router.route('/roles').get(protect, getRolePermissionMatrix);
router.route('/catalog').get(protect, getPermissionCatalog);
router.route('/roles/:role').put(protect, authorizePermission('canConfigureRoles'), updateRolePermissions);

module.exports = router;
