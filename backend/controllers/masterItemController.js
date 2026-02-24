const MasterItem = require('../models/MasterItem');

// @desc    Get all master items
// @route   GET /api/master-items
// @access  Private (Owner only)
const getMasterItems = async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Access denied. Owner only.' });
        }
        const items = await MasterItem.find({}).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a master item
// @route   POST /api/master-items
// @access  Private (Owner only)
const createMasterItem = async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Access denied. Owner only.' });
        }
        const { name, location, details, quantity } = req.body;
        const item = await MasterItem.create({
            name,
            location,
            details,
            quantity: quantity || 0,
            createdBy: req.user._id
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a master item
// @route   PUT /api/master-items/:id
// @access  Private (Owner only)
const updateMasterItem = async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Access denied. Owner only.' });
        }
        const item = await MasterItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const { name, location, details, quantity } = req.body;
        item.name = name || item.name;
        item.location = location || item.location;
        item.details = details || item.details;
        item.quantity = quantity !== undefined ? quantity : item.quantity;

        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a master item
// @route   DELETE /api/master-items/:id
// @access  Private (Owner only)
const deleteMasterItem = async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Access denied. Owner only.' });
        }
        const item = await MasterItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        await item.deleteOne();
        res.json({ message: 'Item removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getMasterItems,
    createMasterItem,
    updateMasterItem,
    deleteMasterItem
};
