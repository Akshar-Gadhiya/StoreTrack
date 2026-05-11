const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Store = require('../models/Store');

// @desc    Get activity logs with advanced filtering and pagination
// @route   GET /api/logs
// @access  Private (Master Admin only)
const getLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Build filter object
        let filter = {};

        // Date range filtering
        if (req.query.startDate || req.query.endDate) {
            filter.timestamp = {};
            if (req.query.startDate) {
                filter.timestamp.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filter.timestamp.$lte = new Date(req.query.endDate);
            }
        }

        // Category filtering
        if (req.query.category) {
            filter.category = req.query.category;
        }

        // Action filtering
        if (req.query.action) {
            filter.action = req.query.action;
        }

        // Severity filtering
        if (req.query.severity) {
            filter.severity = req.query.severity;
        }

        // User filtering
        if (req.query.userId) {
            filter.userId = req.query.userId;
        }

        // Store filtering
        if (req.query.storeId) {
            filter.storeId = req.query.storeId;
        }

        // Search functionality
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            filter.$or = [
                { details: searchRegex },
                { itemName: searchRegex },
                { storeName: searchRegex },
                { targetUserName: searchRegex }
            ];
        }

        // For non-Master Admin users, only show their own logs
        if (req.user.role !== 'MASTER_ADMIN') {
            filter.userId = req.user._id;
        }

        // Get total count for pagination
        const total = await ActivityLog.countDocuments(filter);

        // Get logs with population
        const logs = await ActivityLog.find(filter)
            .populate('userId', 'name email role')
            .populate('targetUserId', 'name email role')
            .populate('storeId', 'name')
            .populate('itemId', 'name')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Format logs for frontend
        const formattedLogs = logs.map(log => ({
            _id: log._id,
            action: log.action,
            category: log.category,
            severity: log.severity,
            details: log.details,
            timestamp: log.timestamp,
            user: log.userId ? {
                _id: log.userId._id,
                name: log.userId.name,
                email: log.userId.email,
                role: log.userId.role
            } : null,
            targetUser: log.targetUserId ? {
                _id: log.targetUserId._id,
                name: log.targetUserId.name,
                email: log.targetUserId.email,
                role: log.targetUserId.role
            } : null,
            store: log.storeId ? {
                _id: log.storeId._id,
                name: log.storeId.name
            } : null,
            item: log.itemId ? {
                _id: log.itemId._id,
                name: log.itemId.name
            } : null,
            itemName: log.itemName,
            storeName: log.storeName,
            targetUserName: log.targetUserName,
            oldValue: log.oldValue,
            newValue: log.newValue,
            ipAddress: log.ipAddress,
            metadata: log.metadata
        }));

        res.json({
            logs: formattedLogs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get log statistics
// @route   GET /api/logs/stats
// @access  Private (Master Admin only)
const getLogStats = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const stats = await ActivityLog.aggregate([
            {
                $match: {
                    timestamp: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    totalLogs: { $sum: 1 },
                    byCategory: {
                        $push: '$category'
                    },
                    bySeverity: {
                        $push: '$severity'
                    },
                    byAction: {
                        $push: '$action'
                    }
                }
            }
        ]);

        const categoryStats = await ActivityLog.aggregate([
            {
                $match: {
                    timestamp: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const severityStats = await ActivityLog.aggregate([
            {
                $match: {
                    timestamp: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: '$severity',
                    count: { $sum: 1 }
                }
            }
        ]);

        const recentActivity = await ActivityLog.find()
            .populate('userId', 'name email role')
            .sort({ timestamp: -1 })
            .limit(10)
            .lean();

        res.json({
            totalLogs: stats[0]?.totalLogs || 0,
            categoryBreakdown: categoryStats,
            severityBreakdown: severityStats,
            recentActivity: recentActivity.map(log => ({
                _id: log._id,
                action: log.action,
                category: log.category,
                severity: log.severity,
                details: log.details,
                timestamp: log.timestamp,
                user: log.userId ? {
                    name: log.userId.name,
                    role: log.userId.role
                } : null
            }))
        });
    } catch (error) {
        console.error('Error fetching log stats:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Export activity logs
// @route   GET /api/logs/export
// @access  Private (Master Admin only)
const exportLogs = async (req, res) => {
    try {
        const format = req.query.format || 'json';
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

        let filter = {
            timestamp: {
                $gte: startDate,
                $lte: endDate
            }
        };

        // Apply same filters as getLogs
        if (req.query.category) filter.category = req.query.category;
        if (req.query.action) filter.action = req.query.action;
        if (req.query.severity) filter.severity = req.query.severity;
        if (req.query.userId) filter.userId = req.query.userId;
        if (req.query.storeId) filter.storeId = req.query.storeId;

        const logs = await ActivityLog.find(filter)
            .populate('userId', 'name email role')
            .populate('targetUserId', 'name email role')
            .populate('storeId', 'name')
            .populate('itemId', 'name')
            .sort({ timestamp: -1 })
            .lean();

        if (format === 'csv') {
            const csvHeaders = [
                'Timestamp',
                'User',
                'User Role',
                'Action',
                'Category',
                'Severity',
                'Details',
                'Store',
                'Item',
                'Target User',
                'IP Address'
            ];

            const csvData = logs.map(log => [
                log.timestamp.toISOString(),
                log.userId?.name || 'Unknown',
                log.userId?.role || 'Unknown',
                log.action,
                log.category,
                log.severity,
                log.details || '',
                log.storeId?.name || log.storeName || '',
                log.itemId?.name || log.itemName || '',
                log.targetUserId?.name || log.targetUserName || '',
                log.ipAddress || ''
            ]);

            const csvContent = [csvHeaders, ...csvData]
                .map(row => row.map(field => `"${field}"`).join(','))
                .join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=activity-logs-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`);
            res.send(csvContent);
        } else {
            // JSON export
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=activity-logs-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.json`);
            res.json(logs);
        }
    } catch (error) {
        console.error('Error exporting logs:', error);
        res.status(500).json({ message: 'Export failed' });
    }
};

// @desc    Create a log entry
// @route   POST /api/logs
// @access  Private
const createLog = async (req, res) => {
    const {
        action,
        category,
        severity = 'low',
        itemId,
        itemName,
        storeId,
        storeName,
        targetUserId,
        targetUserName,
        details,
        oldValue,
        newValue,
        ipAddress,
        userAgent,
        sessionId,
        metadata
    } = req.body;

    try {
        const log = new ActivityLog({
            action,
            category,
            severity,
            itemId,
            itemName,
            storeId,
            storeName,
            userId: req.user._id,
            targetUserId,
            targetUserName,
            details,
            oldValue,
            newValue,
            ipAddress: ipAddress || req.ip || req.connection.remoteAddress,
            userAgent,
            sessionId,
            metadata
        });

        const createdLog = await log.save();
        res.status(201).json(createdLog);
    } catch (error) {
        console.error('Error creating log:', error);
        res.status(400).json({ message: 'Invalid log data' });
    }
};

// @desc    Get unique filter options
// @route   GET /api/logs/filters
// @access  Private (Master Admin only)
const getFilterOptions = async (req, res) => {
    try {
        const categories = await ActivityLog.distinct('category');
        const actions = await ActivityLog.distinct('action');
        const severities = await ActivityLog.distinct('severity');

        const users = await User.find({}, 'name email role').lean();
        const stores = await Store.find({}, 'name').lean();

        res.json({
            categories,
            actions,
            severities,
            users: users.map(u => ({ _id: u._id, name: u.name, email: u.email, role: u.role })),
            stores: stores.map(s => ({ _id: s._id, name: s.name }))
        });
    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getLogs,
    getLogStats,
    exportLogs,
    createLog,
    getFilterOptions,
};
