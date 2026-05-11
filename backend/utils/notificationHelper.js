const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 * @param {Object} options
 * @param {String} options.userId - Recipient user ID
 * @param {String} options.type - Notification type
 * @param {String} options.category - Notification category
 * @param {String} options.title - Notification title
 * @param {String} options.message - Notification message
 * @param {String} options.severity - 'low', 'medium', 'high', 'critical'
 * @param {String} options.description - Optional description
 * @param {String} options.actionUrl - Optional URL to related action
 * @param {String} options.relatedUserId - Optional related user
 * @param {String} options.relatedStoreId - Optional related store
 * @param {String} options.relatedItemId - Optional related item
 * @param {String} options.relatedMasterItemId - Optional related master item
 * @param {Object} options.metadata - Optional metadata
 */
async function createNotification(options) {
  try {
    const {
      userId,
      type,
      category,
      title,
      message,
      severity = 'low',
      description,
      actionUrl,
      relatedUserId,
      relatedStoreId,
      relatedItemId,
      relatedMasterItemId,
      metadata = {},
    } = options;

    if (!userId || !type || !category || !title || !message) {
      console.error('Missing required notification fields:', options);
      return null;
    }

    const notification = new Notification({
      recipient: userId,
      type,
      category,
      severity,
      title,
      message,
      description,
      actionUrl,
      relatedUserId,
      relatedStoreId,
      relatedItemId,
      relatedMasterItemId,
      metadata,
    });

    const created = await notification.save();
    return created;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Create system alert notifications for Master Admins
 * @param {Array} masterAdminIds - Array of Master Admin user IDs
 * @param {Object} options - Notification options
 */
async function createSystemAlert(masterAdminIds, options) {
  try {
    const {
      title,
      message,
      severity = 'high',
      description,
      metadata = {},
    } = options;

    const notifications = await Promise.all(
      masterAdminIds.map((userId) =>
        createNotification({
          userId,
          type: 'SYSTEM_ALERT',
          category: 'system',
          title,
          message,
          severity,
          description,
          metadata,
        })
      )
    );

    return notifications.filter((n) => n !== null);
  } catch (error) {
    console.error('Error creating system alerts:', error);
    return [];
  }
}

/**
 * Create security alert for Master Admins
 * @param {Array} masterAdminIds - Array of Master Admin user IDs
 * @param {Object} options - Notification options
 */
async function createSecurityAlert(masterAdminIds, options) {
  try {
    const {
      title,
      message,
      severity = 'critical',
      description,
      relatedUserId,
      actionUrl,
      metadata = {},
    } = options;

    const notifications = await Promise.all(
      masterAdminIds.map((userId) =>
        createNotification({
          userId,
          type: 'SECURITY_ALERT',
          category: 'security',
          title,
          message,
          severity,
          description,
          actionUrl,
          relatedUserId,
          metadata,
        })
      )
    );

    return notifications.filter((n) => n !== null);
  } catch (error) {
    console.error('Error creating security alerts:', error);
    return [];
  }
}

/**
 * Create inventory alert
 * @param {String} userId - Recipient user ID
 * @param {Object} options - Notification options
 */
async function createInventoryAlert(userId, options) {
  try {
    const {
      itemName,
      itemId,
      quantity,
      threshold,
      storeId,
    } = options;

    let type = 'OUT_OF_STOCK';
    let severity = 'high';
    let title = `${itemName} is out of stock`;
    let message = `${itemName} quantity is 0`;

    if (quantity > 0 && quantity <= threshold) {
      type = 'LOW_STOCK';
      severity = 'medium';
      title = `${itemName} is running low`;
      message = `${itemName} quantity: ${quantity} (threshold: ${threshold})`;
    }

    return createNotification({
      userId,
      type,
      category: 'inventory',
      title,
      message,
      severity,
      relatedItemId: itemId,
      relatedStoreId: storeId,
      metadata: {
        itemName,
        quantity,
        threshold,
      },
    });
  } catch (error) {
    console.error('Error creating inventory alert:', error);
    return null;
  }
}

/**
 * Create user action notification for Master Admin
 * @param {String} masterAdminId - Master Admin user ID
 * @param {Object} options - Notification options
 */
async function createUserActionNotification(masterAdminId, options) {
  try {
    const {
      actionType,
      userName,
      userId,
      storeId,
      details,
      metadata = {},
    } = options;

    const titleMap = {
      user_created: `New user created: ${userName}`,
      user_updated: `User updated: ${userName}`,
      user_deleted: `User deleted: ${userName}`,
      store_created: 'New store created',
      store_updated: 'Store updated',
      store_deleted: 'Store deleted',
    };

    const title = titleMap[actionType] || `User action: ${actionType}`;

    return createNotification({
      userId: masterAdminId,
      type: 'USER_ACTION',
      category: 'user',
      title,
      message: details || `Action: ${actionType}`,
      severity: 'low',
      relatedUserId: userId,
      relatedStoreId: storeId,
      metadata: {
        actionType,
        userName,
        ...metadata,
      },
    });
  } catch (error) {
    console.error('Error creating user action notification:', error);
    return null;
  }
}

module.exports = {
  createNotification,
  createSystemAlert,
  createSecurityAlert,
  createInventoryAlert,
  createUserActionNotification,
};
