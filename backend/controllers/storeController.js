const Store = require('../models/Store');

// @desc    Get all stores
// @route   GET /api/stores
// @access  Private
const getStores = async (req, res) => {
    try {
        const stores = await Store.find({});
        res.json(stores);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get store by ID
// @route   GET /api/stores/:id
// @access  Private
const getStoreById = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);
        if (store) {
            res.json(store);
        } else {
            res.status(404).json({ message: 'Store not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a store
// @route   POST /api/stores
// @access  Private/Owner
const createStore = async (req, res) => {
    const { name, address, phone, email, sections } = req.body;

    try {
        const store = new Store({
            name,
            address,
            phone,
            email,
            sections,
        });

        const createdStore = await store.save();
        res.status(201).json(createdStore);
    } catch (error) {
        res.status(400).json({ message: 'Invalid store data' });
    }
};

// @desc    Update a store
// @route   PUT /api/stores/:id
// @access  Private/Owner
const updateStore = async (req, res) => {
    const { name, address, phone, email, sections } = req.body;

    try {
        const store = await Store.findById(req.params.id);

        if (store) {
            store.name = name || store.name;
            store.address = address || store.address;
            store.phone = phone || store.phone;
            store.email = email || store.email;
            store.sections = sections || store.sections;

            const updatedStore = await store.save();
            res.json(updatedStore);
        } else {
            res.status(404).json({ message: 'Store not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid store data' });
    }
};

// @desc    Delete a store
// @route   DELETE /api/stores/:id
// @access  Private/Owner
const deleteStore = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);

        if (store) {
            await store.deleteOne();
            res.json({ message: 'Store removed' });
        } else {
            res.status(404).json({ message: 'Store not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getStores,
    getStoreById,
    createStore,
    updateStore,
    deleteStore,
};
