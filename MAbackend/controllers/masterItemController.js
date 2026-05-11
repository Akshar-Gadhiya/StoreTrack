const MasterItem = require('../models/MasterItem');
const Notification = require('../models/Notification');

// @desc    Get all master items
// @route   GET /api/master-items
// @access  Private (Owner only)
const getMasterItems = async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Access denied. Owner only.' });
        }
        const items = await MasterItem.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
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

        // Verify ownership
        if (item.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to update this item' });
        }

        const { name, location, details, quantity } = req.body;
        
        const previousQuantity = item.quantity;
        
        item.name = name || item.name;
        item.location = location || item.location;
        item.details = details || item.details;
        item.quantity = quantity !== undefined ? quantity : item.quantity;

        const updatedItem = await item.save();

        if (quantity !== undefined && updatedItem.quantity < previousQuantity) {
            let notificationMessage = '';
            const threshold = 10; // Default threshold for Master Vault

            if (updatedItem.quantity === 0) {
                notificationMessage = `${updatedItem.name} (Master Vault) is out of stock!`;
            } else if (updatedItem.quantity <= threshold && previousQuantity > threshold) {
                notificationMessage = `${updatedItem.name} (Master Vault) has dropped below low stock threshold (${updatedItem.quantity} left).`;
            }

            if (notificationMessage) {
                try {
                    const notification = await Notification.create({
                        recipient: req.user._id,
                        type: 'LOW_STOCK',
                        message: notificationMessage,
                        relatedItemId: updatedItem._id
                    });
                    
                    const io = req.app.get('io');
                    if (io) {
                        io.to(req.user._id.toString()).emit('notification', notification);
                    }
                } catch (notifErr) {
                    console.error('Failed to create notification:', notifErr);
                }
            }
        }
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

        // Verify ownership
        if (item.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this item' });
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
