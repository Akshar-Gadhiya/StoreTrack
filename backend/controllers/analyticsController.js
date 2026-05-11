const User = require('../models/User');
const Store = require('../models/Store');
const Item = require('../models/Item');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get overview metrics
// @route   GET /api/analytics/overview
// @access  Private (Master Admin)
const getOverviewMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const [totalUsers, totalStores, totalItems, activeUsers, totalLogins] = await Promise.all([
      User.countDocuments(),
      Store.countDocuments(),
      Item.countDocuments(),
      User.countDocuments({ lastLoginAt: { $exists: true } }),
      ActivityLog.countDocuments({ action: 'login', ...dateFilter }),
    ]);

    res.json({
      totalUsers,
      totalStores,
      totalItems,
      activeUsers,
      totalLogins,
    });
  } catch (error) {
    console.error('Error fetching overview metrics:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get store growth data
// @route   GET /api/analytics/store-growth
// @access  Private (Master Admin)
const getStoreGrowth = async (req, res) => {
  try {
    const { startDate, endDate, period = 'month' } = req.query;

    let dateFilter = {
      createdAt: {
        $gte: new Date(startDate || new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000)),
        $lte: new Date(endDate || new Date()),
      },
    };

    // Group by period (day, month, year)
    let groupBy;
    if (period === 'day') {
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
      };
    } else if (period === 'month') {
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      };
    } else {
      groupBy = {
        year: { $year: '$createdAt' },
      };
    }

    const storeGrowth = await Store.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Get cumulative count
    let cumulativeCount = 0;
    const formattedData = storeGrowth.map((item) => {
      cumulativeCount += item.count;
      const dateStr =
        period === 'day'
          ? `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`
          : `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;

      return {
        date: dateStr,
        newStores: item.count,
        totalStores: cumulativeCount,
      };
    });

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching store growth:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user growth data
// @route   GET /api/analytics/user-growth
// @access  Private (Master Admin)
const getUserGrowth = async (req, res) => {
  try {
    const { startDate, endDate, period = 'month' } = req.query;

    let dateFilter = {
      createdAt: {
        $gte: new Date(startDate || new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000)),
        $lte: new Date(endDate || new Date()),
      },
    };

    let groupBy;
    if (period === 'day') {
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
      };
    } else if (period === 'month') {
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      };
    } else {
      groupBy = {
        year: { $year: '$createdAt' },
      };
    }

    const userGrowth = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    let cumulativeCount = 0;
    const formattedData = userGrowth.map((item) => {
      cumulativeCount += item.count;
      const dateStr =
        period === 'day'
          ? `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`
          : `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;

      return {
        date: dateStr,
        newUsers: item.count,
        totalUsers: cumulativeCount,
      };
    });

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching user growth:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user role distribution
// @route   GET /api/analytics/user-roles
// @access  Private (Master Admin)
const getUserRoles = async (req, res) => {
  try {
    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const formatted = roleDistribution.map((item) => ({
      role: item._id || 'Unknown',
      count: item.count,
      percentage: 0,
    }));

    const total = formatted.reduce((sum, item) => sum + item.count, 0);
    formatted.forEach((item) => {
      item.percentage = ((item.count / total) * 100).toFixed(1);
    });

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get login statistics
// @route   GET /api/analytics/login-stats
// @access  Private (Master Admin)
const getLoginStatistics = async (req, res) => {
  try {
    const { startDate, endDate, period = 'day' } = req.query;

    let dateFilter = {
      timestamp: {
        $gte: new Date(startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        $lte: new Date(endDate || new Date()),
      },
      action: 'login',
    };

    let groupBy;
    if (period === 'day') {
      groupBy = {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' },
        day: { $dayOfMonth: '$timestamp' },
      };
    } else if (period === 'month') {
      groupBy = {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' },
      };
    } else {
      groupBy = {
        year: { $year: '$timestamp' },
      };
    }

    const loginStats = await ActivityLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: groupBy,
          logins: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
        },
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const formattedData = loginStats.map((item) => {
      const dateStr =
        period === 'day'
          ? `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`
          : `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;

      return {
        date: dateStr,
        logins: item.logins,
        uniqueUsers: item.uniqueUserCount,
      };
    });

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching login stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get inventory activity
// @route   GET /api/analytics/inventory-activity
// @access  Private (Master Admin)
const getInventoryActivity = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    // Get inventory-related activities
    const inventoryActivities = await ActivityLog.aggregate([
      {
        $match: {
          ...dateFilter,
          action: { $in: ['add_item', 'edit_item', 'delete_item', 'quantity_change'] },
        },
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
    ]);

    const formatted = inventoryActivities.map((item) => ({
      action: item._id,
      count: item.count,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching inventory activity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get active users (last 30 days)
// @route   GET /api/analytics/active-users
// @access  Private (Master Admin)
const getActiveUsers = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const activeUsersData = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
          },
          uniqueUsers: { $addToSet: '$userId' },
        },
      },
      {
        $addFields: {
          activeUserCount: { $size: '$uniqueUsers' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const formattedData = activeUsersData.map((item) => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      activeUsers: item.activeUserCount,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get top stores by activity
// @route   GET /api/analytics/top-stores
// @access  Private (Master Admin)
const getTopStores = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    const topStores = await ActivityLog.aggregate([
      { $match: { ...dateFilter, storeId: { $exists: true } } },
      {
        $group: {
          _id: '$storeId',
          activityCount: { $sum: 1 },
          storeName: { $first: '$storeName' },
        },
      },
      { $sort: { activityCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'stores',
          localField: '_id',
          foreignField: '_id',
          as: 'storeData',
        },
      },
    ]);

    const formatted = topStores.map((item) => ({
      storeId: item._id,
      storeName: item.storeData[0]?.name || item.storeName || 'Unknown',
      activityCount: item.activityCount,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching top stores:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get activity summary
// @route   GET /api/analytics/activity-summary
// @access  Private (Master Admin)
const getActivitySummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    const activitySummary = await ActivityLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const formatted = activitySummary.map((item) => ({
      category: item._id || 'other',
      count: item.count,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching activity summary:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getOverviewMetrics,
  getStoreGrowth,
  getUserGrowth,
  getUserRoles,
  getLoginStatistics,
  getInventoryActivity,
  getActiveUsers,
  getTopStores,
  getActivitySummary,
};
