const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, getManagedUsers } = require('../controllers/userController');
const { protect, admin, validateUserRole } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getUsers)
    .post(protect, validateUserRole, createUser);

router.route('/managed')
    .get(protect, getManagedUsers);

router.route('/:id')
    .put(protect, validateUserRole, updateUser)
    .delete(protect, deleteUser);

module.exports = router;
