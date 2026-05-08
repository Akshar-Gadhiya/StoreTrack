const express = require('express');
const router = express.Router();
const { masterAdminLogin, masterAdminLogout, getMasterAdminProfile } = require('../controllers/masterAdminController');
const { protect } = require('../middleware/authMiddleware');
const { requireMasterAdmin } = require('../middleware/roleMiddleware');

// Master Admin login (separate from regular login)
router.post('/login', masterAdminLogin);

// Protected routes for Master Admin
router.use(protect);
router.use(requireMasterAdmin);

router.post('/logout', masterAdminLogout);
router.get('/profile', getMasterAdminProfile);

module.exports = router;