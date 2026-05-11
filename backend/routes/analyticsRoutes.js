const express = require('express');
const router = express.Router();
const {
  getOverviewMetrics,
  getStoreGrowth,
  getUserGrowth,
  getUserRoles,
  getLoginStatistics,
  getInventoryActivity,
  getActiveUsers,
  getTopStores,
  getActivitySummary,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication and Master Admin role
router.use(protect);

// Check Master Admin role
router.use((req, res, next) => {
  if (req.user.role !== 'MASTER_ADMIN') {
    return res.status(403).json({ message: 'Access denied. Master Admin required.' });
  }
  next();
});

// Analytics endpoints
router.get('/overview', getOverviewMetrics);
router.get('/store-growth', getStoreGrowth);
router.get('/user-growth', getUserGrowth);
router.get('/user-roles', getUserRoles);
router.get('/login-stats', getLoginStatistics);
router.get('/inventory-activity', getInventoryActivity);
router.get('/active-users', getActiveUsers);
router.get('/top-stores', getTopStores);
router.get('/activity-summary', getActivitySummary);

module.exports = router;
