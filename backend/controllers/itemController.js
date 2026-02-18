const Item = require('../models/Item');

// @desc    Get all items
// @route   GET /api/items
// @access  Private
const getItems = async (req, res) => {
    try {
        const items = await Item.find({});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get item by ID
// @route   GET /api/items/:id
// @access  Private
const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
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
            storeId,
            location,
            images,
            qrCode,
            status,
        });

        const createdItem = await item.save();
        res.status(201).json(createdItem);
    } catch (error) {
        res.status(400).json({ message: 'Invalid item data' });
    }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res) => {
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
        const item = await Item.findById(req.params.id);

        if (item) {
            item.name = name || item.name;
            item.category = category || item.category;
            item.description = description || item.description;
            item.quantity = quantity !== undefined ? quantity : item.quantity;
            item.lowStockThreshold =
                lowStockThreshold !== undefined ? lowStockThreshold : item.lowStockThreshold;
            item.price = price !== undefined ? price : item.price;
            item.supplier = supplier || item.supplier;
            item.expiryDate = expiryDate || item.expiryDate;
            item.itemCode = itemCode || item.itemCode;
            item.storeId = storeId || item.storeId;
            item.location = location || item.location;
            item.images = images || item.images;
            item.qrCode = qrCode || item.qrCode;
            item.status = status || item.status;

            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid item data' });
    }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (item) {
            await item.deleteOne();
            res.json({ message: 'Item removed' });
        } else {
            res.status(404).json({ message: 'Item not found' });
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
