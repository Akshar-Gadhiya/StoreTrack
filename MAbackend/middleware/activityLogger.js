const ActivityLog = require('../models/ActivityLog');

// Map of actions to categories
const actionCategories = {
    // Inventory
    'add_item': 'inventory',
    'edit_item': 'inventory',
    'delete_item': 'inventory',
    'quantity_change': 'inventory',
    'move_item': 'inventory',
    'low_stock_alert': 'inventory',
    'out_of_stock_alert': 'inventory',

    // Store
    'create_store': 'store',
    'edit_store': 'store',
    'activate_store': 'store',
    'suspend_store': 'store',
    'delete_store': 'store',
    'view_store': 'store',

    // User
    'create_user': 'user',
    'edit_user': 'user',
    'suspend_user': 'user',
    'activate_user': 'user',
    'delete_user': 'user',
    'reset_password': 'user',
    'change_role': 'user',

    // Auth
    'login': 'auth',
    'logout': 'auth',
    'failed_login': 'auth',
    'password_reset_request': 'auth',
    'password_changed': 'auth',

    // Security
    'suspicious_activity': 'security',
    'unauthorized_access': 'security',
    'permission_denied': 'security',
    'api_rate_limit_exceeded': 'security',
    'system_backup': 'system',
    'security_update': 'system',

    // Master Admin
    'master_admin_login': 'auth',
    'owner_created': 'user',
    'owner_suspended': 'user',
    'owner_activated': 'user',
    'bulk_import': 'system',
    'bulk_export': 'system',
    'system_config_change': 'system',

    // General
    'view_dashboard': 'general',
    'export_data': 'general',
    'search_performed': 'general'
};

// Severity levels for different actions
const actionSeverities = {
    'login': 'low',
    'logout': 'low',
    'view_dashboard': 'low',
    'view_store': 'low',
    'search_performed': 'low',
    'export_data': 'low',

    'add_item': 'low',
    'edit_item': 'low',
    'quantity_change': 'low',
    'move_item': 'low',
    'create_store': 'medium',
    'edit_store': 'low',
    'create_user': 'medium',
    'edit_user': 'low',
    'change_role': 'high',

    'delete_item': 'medium',
    'delete_store': 'high',
    'delete_user': 'high',
    'suspend_store': 'high',
    'suspend_user': 'high',
    'reset_password': 'high',

    'failed_login': 'medium',
    'unauthorized_access': 'high',
    'permission_denied': 'medium',
    'suspicious_activity': 'high',
    'api_rate_limit_exceeded': 'medium',

    'master_admin_login': 'high',
    'owner_created': 'high',
    'owner_suspended': 'high',
    'owner_activated': 'high',
    'system_config_change': 'critical',
    'bulk_import': 'high',
    'bulk_export': 'medium',

    'low_stock_alert': 'medium',
    'out_of_stock_alert': 'high',
    'system_backup': 'low',
    'security_update': 'medium'
};

// Activity logging middleware
const logActivity = async (req, res, next) => {
    const originalSend = res.send;
    let logData = null;

    // Store log data for after response
    res.logActivity = (data) => {
        logData = data;
    };

    // Override send to log after response
    res.send = function(data) {
        // Log activity if data was set
        if (logData && req.user) {
            const logEntry = {
                action: logData.action,
                category: actionCategories[logData.action] || 'general',
                severity: actionSeverities[logData.action] || 'low',
                userId: req.user._id,
                details: logData.details,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                sessionId: req.sessionID,
                metadata: logData.metadata,
                ...logData
            };

            // Log asynchronously without blocking response
            ActivityLog.create(logEntry).catch(err => {
                console.error('Failed to log activity:', err);
            });
        }

        // Call original send
        originalSend.call(this, data);
    };

    next();
};

// Helper function to create activity log
const createActivityLog = async (data) => {
    try {
        const logEntry = {
            action: data.action,
            category: actionCategories[data.action] || 'general',
            severity: actionSeverities[data.action] || 'low',
            userId: data.userId,
            details: data.details,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            sessionId: data.sessionId,
            metadata: data.metadata,
            ...data
        };

        await ActivityLog.create(logEntry);
    } catch (error) {
        console.error('Failed to create activity log:', error);
    }
};

// Authentication logging middleware
const logAuthActivity = (action) => {
    return async (req, res, next) => {
        const originalSend = res.send;

        res.send = function(data) {
            if (req.user) {
                const logData = {
                    action,
                    category: 'auth',
                    severity: actionSeverities[action] || 'low',
                    userId: req.user._id,
                    details: `${action.replace('_', ' ')} by ${req.user.name || req.user.email}`,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('User-Agent'),
                    metadata: {
                        endpoint: req.originalUrl,
                        method: req.method
                    }
                };

                ActivityLog.create(logData).catch(err => {
                    console.error('Failed to log auth activity:', err);
                });
            }

            originalSend.call(this, data);
        };

        next();
    };
};

module.exports = {
    logActivity,
    createActivityLog,
    logAuthActivity,
    actionCategories,
    actionSeverities
};