const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            // Inventory actions
            'add_item',
            'edit_item',
            'delete_item',
            'quantity_change',
            'move_item',
            'low_stock_alert',
            'out_of_stock_alert',
            // Store actions
            'create_store',
            'edit_store',
            'activate_store',
            'suspend_store',
            'delete_store',
            'view_store',
            // User actions
            'create_user',
            'edit_user',
            'suspend_user',
            'activate_user',
            'delete_user',
            'reset_password',
            'change_role',
            // Authentication actions
            'login',
            'logout',
            'failed_login',
            'password_reset_request',
            'password_changed',
            // Security events
            'suspicious_activity',
            'unauthorized_access',
            'permission_denied',
            'api_rate_limit_exceeded',
            'system_backup',
            'security_update',
            // Master Admin actions
            'master_admin_login',
            'owner_created',
            'owner_suspended',
            'owner_activated',
            'bulk_import',
            'bulk_export',
            'system_config_change',
            // General
            'view_dashboard',
            'export_data',
            'search_performed'
        ],
    },
    category: {
        type: String,
        enum: ['inventory', 'store', 'user', 'auth', 'security', 'system', 'general'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
    },
    itemName: String,
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
    },
    storeName: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    targetUserName: String,
    details: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    sessionId: String,
    metadata: mongoose.Schema.Types.Mixed,
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ category: 1, timestamp: -1 });
activityLogSchema.index({ severity: 1, timestamp: -1 });
activityLogSchema.index({ storeId: 1, timestamp: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
module.exports = ActivityLog;
