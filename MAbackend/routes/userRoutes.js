const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, getManagedUsers } = require('../controllers/userController');
const { protect, admin, validateUserRole } = require('../middleware/authMiddleware');
const { authorizePermission } = require('../middleware/permissionMiddleware');

router.route('/')
    .get(protect, getUsers)
    .post(protect, authorizePermission('canManageTeam'), validateUserRole, createUser);

router.route('/managed')
    .get(protect, getManagedUsers);

router.route('/:id')
    .put(protect, authorizePermission('canManageTeam'), validateUserRole, updateUser)
    .delete(protect, authorizePermission('canManageTeam'), deleteUser);

module.exports = router;
