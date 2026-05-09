const ActivityLog = require('../models/ActivityLog');

const logAction = async ({ action, itemId, itemName, details, userId, oldValue, newValue }) => {
  try {
    await ActivityLog.create({
      action,
      itemId,
      itemName,
      details,
      userId,
      oldValue,
      newValue,
    });
  } catch (error) {
    console.error('Activity log error:', error);
  }
};

module.exports = { logAction };