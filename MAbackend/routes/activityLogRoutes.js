const express = require('express');
const router = express.Router();
const {
    getLogs,
    getLogStats,
    exportLogs,
    createLog,
    getFilterOptions
} = require('../controllers/activityLogController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Master Admin only routes
router.get('/stats', (req, res, next) => {
    if (req.user.role !== 'MASTER_ADMIN') {
        return res.status(403).json({ message: 'Access denied. Master Admin required.' });
    }
    next();
}, getLogStats);

router.get('/export', (req, res, next) => {
    if (req.user.role !== 'MASTER_ADMIN') {
        return res.status(403).json({ message: 'Access denied. Master Admin required.' });
    }
    next();
}, exportLogs);

router.get('/filters', (req, res, next) => {
    if (req.user.role !== 'MASTER_ADMIN') {
        return res.status(403).json({ message: 'Access denied. Master Admin required.' });
    }
    next();
}, getFilterOptions);

// General routes (filtered by user role in controller)
router.route('/').get(getLogs).post(createLog);

module.exports = router;
