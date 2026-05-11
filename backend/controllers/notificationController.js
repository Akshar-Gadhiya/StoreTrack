const Notification = require('../models/Notification');

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type;
    const category = req.query.category;
    const unreadOnly = req.query.unreadOnly === 'true';

    let filter = { recipient: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (unreadOnly) filter.read = false;

    const total = await Notification.countDocuments(filter);
    const notifications = await Notification.find(filter)
      .populate('relatedUserId', 'name email role')
      .populate('relatedStoreId', 'name')
      .populate('relatedItemId', 'name')
      .populate('relatedMasterItemId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/count/unread
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Verify user is the recipient
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    notification.read = true;
    const updated = await notification.save();
    res.json(updated);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mark multiple notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Dismiss/delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const dismissNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Verify user is the recipient
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    notification.dismissedAt = new Date();
    await notification.save();

    res.json({ message: 'Notification dismissed' });
  } catch (error) {
    console.error('Error dismissing notification:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a notification (internal use)
// @route   POST /api/notifications
// @access  Private
const createNotification = async (req, res) => {
  try {
    const {
      recipient,
      type,
      category,
      severity = 'low',
      title,
      message,
      description,
      actionUrl,
      relatedUserId,
      relatedStoreId,
      relatedItemId,
      relatedMasterItemId,
      metadata = {},
    } = req.body;

    if (!recipient || !type || !category || !title || !message) {
      return res.status(400).json({
        message: 'Missing required fields: recipient, type, category, title, message',
      });
    }

    const notification = new Notification({
      recipient,
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
    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  createNotification,
};