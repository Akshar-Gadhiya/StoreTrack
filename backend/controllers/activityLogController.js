const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity logs for the logged-in user
// @route   GET /api/logs
// @access  Private
const getLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find({ userId: req.user._id }).sort({ timestamp: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a log
// @route   POST /api/logs
// @access  Private
const createLog = async (req, res) => {
    const { action, itemId, itemName, details, oldValue, newValue } = req.body;

    try {
        const log = new ActivityLog({
            action,
            itemId,
            itemName,
            details,
            userId: req.user._id,
            oldValue,
            newValue,
        });

        const createdLog = await log.save();
        res.status(201).json(createdLog);
    } catch (error) {
        res.status(400).json({ message: 'Invalid log data' });
    }
};

module.exports = {
    getLogs,
    createLog,
};
