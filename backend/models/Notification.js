const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'LOW_STOCK',
        'OUT_OF_STOCK',
        'SECURITY_ALERT',
        'SYSTEM_ALERT',
        'USER_ACTION',
        'STORE_UPDATE',
        'ADMIN_NOTICE',
        'INVENTORY_CHANGE',
      ],
      required: true,
    },
    category: {
      type: String,
      enum: ['inventory', 'security', 'system', 'user', 'store', 'admin'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    description: String,
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    actionUrl: String,
    relatedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    relatedStoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
    },
    relatedItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
    relatedMasterItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MasterItem',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    dismissedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
