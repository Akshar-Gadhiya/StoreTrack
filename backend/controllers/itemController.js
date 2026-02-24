const Item = require('../models/Item');

// @desc    Get all items (only ones owned by the logged-in user, optionally filtered by storeId)
// @route   GET /api/items?storeId=<id>
// @access  Private
const getItems = async (req, res) => {
    try {
        let filter = {};

        // Owners see items they own across all or specified stores
        if (req.user.role === 'owner') {
            filter.owner = req.user._id;
            if (req.query.storeId) {
                filter.storeId = req.query.storeId;
            }
        }
        // Managers and employees only see items in their assigned store
        else if (req.user.role === 'manager' || req.user.role === 'employee') {
            if (!req.user.store) {
                return res.status(403).json({ message: 'You are not assigned to any store' });
            }
            filter.storeId = req.user.store;
        }
        else {
            return res.status(401).json({ message: 'User role dynamic not authorized' });
        }

        const items = await Item.find(filter);
        res.json(items);
    } catch (error) {
        console.error('Error in getItems:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get item by ID (only if owned by the logged-in user)
// @route   GET /api/items/:id
// @access  Private
const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if user is authorized to view this item
        const isOwner = req.user.role === 'owner' && item.owner.toString() === req.user._id.toString();
        const isInAssignedStore = (req.user.role === 'manager' || req.user.role === 'employee') &&
            item.storeId.toString() === req.user.store?.toString();

        if (isOwner || isInAssignedStore) {
            res.json(item);
        } else {
            res.status(403).json({ message: 'Not authorized to view this item' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create an item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
    const {
        name,
        category,
        description,
        quantity,
        lowStockThreshold,
        price,
        supplier,
        expiryDate,
        itemCode,
        storeId,
        location,
        images,
        qrCode,
        status,
    } = req.body;

    try {
        // Determine owner ID: if manager, use their creator's ID (the owner)
        let ownerId = req.user._id;
        if (req.user.role === 'manager') {
            ownerId = req.user.createdBy;
        }

        const item = new Item({
            name,
            category,
            description,
            quantity,
            lowStockThreshold,
            price,
            supplier,
            expiryDate,
            itemCode,
            storeId: req.user.role === 'manager' ? req.user.store : storeId, // Managers can only create in their own store
            location,
            images,
            qrCode,
            status,
            owner: ownerId,
        });

        const createdItem = await item.save();
        res.status(201).json(createdItem);
    } catch (error) {
        res.status(400).json({ message: 'Invalid item data' });
    }
};

// @desc    Update an item (only if owned by logged-in user)
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res) => {
    // ... same logic for find and check
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if user is authorized to update this item
        const isOwner = req.user.role === 'owner' && item.owner.toString() === req.user._id.toString();
        const isInAssignedStore = (req.user.role === 'manager' || req.user.role === 'employee') &&
            item.storeId.toString() === req.user.store?.toString();

        if (!isOwner && !isInAssignedStore) {
            return res.status(403).json({ message: 'Not authorized to update this item' });
        }

        const {
            name,
            category,
            description,
            quantity,
            lowStockThreshold,
            price,
            supplier,
            expiryDate,
            itemCode,
            storeId,
            location,
            images,
            qrCode,
            status,
        } = req.body;

        item.name = name || item.name;
        item.category = category || item.category;
        item.description = description || item.description;
        item.quantity = quantity !== undefined ? quantity : item.quantity;
        item.lowStockThreshold = lowStockThreshold !== undefined ? lowStockThreshold : item.lowStockThreshold;
        item.price = price !== undefined ? price : item.price;
        item.supplier = supplier || item.supplier;
        item.expiryDate = expiryDate || item.expiryDate;
        item.itemCode = itemCode || item.itemCode;

        // Only owner can change storeId
        if (req.user.role === 'owner') {
            item.storeId = storeId || item.storeId;
        }

        item.location = location || item.location;
        item.images = images || item.images;
        item.qrCode = qrCode || item.qrCode;
        item.status = status || item.status;

        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (error) {
        console.error('Update item error:', error);
        res.status(400).json({ message: 'Invalid item data' });
    }
};

const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if user is authorized to delete this item
        const isOwner = req.user.role === 'owner' && item.owner.toString() === req.user._id.toString();
        const isManagerInAssignedStore = req.user.role === 'manager' &&
            item.storeId.toString() === req.user.store?.toString();

        if (isOwner || isManagerInAssignedStore) {
            await item.deleteOne();
            res.json({ message: 'Item removed' });
        } else {
            res.status(403).json({ message: 'Not authorized to delete this item' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
};
