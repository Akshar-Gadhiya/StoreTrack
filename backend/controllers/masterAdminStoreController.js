const Store = require('../models/Store');
const ActivityLog = require('../models/ActivityLog');

const createActivityLog = async ({ action, store, user, details, oldValue, newValue }) => {
    try {
        await ActivityLog.create({
            action,
            itemId: store?._id,
            itemName: store?.name,
            details,
            userId: user?._id,
            oldValue,
            newValue,
        });
    } catch (error) {
        console.error('Failed to create activity log:', error);
    }
};

const getMasterAdminStores = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status, owner } = req.query;
        const query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        if (owner) {
            query.owner = owner;
        }

        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));

        const total = await Store.countDocuments(query);
        const stores = await Store.find(query)
            .populate('owner', 'name email')
            .populate('manager', 'name email')
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        return res.json({
            stores,
            page: pageNumber,
            pages: Math.ceil(total / pageSize),
            total,
        });
    } catch (error) {
        console.error('Master Admin get stores error:', error);
        return res.status(500).json({ message: 'Server error retrieving stores' });
    }
};

const getMasterAdminStoreById = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id)
            .populate('owner', 'name email')
            .populate('manager', 'name email');

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        return res.json(store);
    } catch (error) {
        console.error('Master Admin get store by id error:', error);
        return res.status(500).json({ message: 'Server error retrieving store' });
    }
};

const updateMasterAdminStore = async (req, res) => {
    const { name, address, phone, email, status, manager, sections } = req.body;

    try {
        const store = await Store.findById(req.params.id);

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        const previousValues = {
            name: store.name,
            address: store.address,
            phone: store.phone,
            email: store.email,
            status: store.status,
            manager: store.manager,
            sections: store.sections,
        };

        store.name = name ?? store.name;
        store.address = address ?? store.address;
        store.phone = phone ?? store.phone;
        store.email = email ?? store.email;
        store.status = status ?? store.status;
        store.manager = manager ?? store.manager;
        store.sections = sections ?? store.sections;

        const updatedStore = await store.save();

        const action = status && status !== previousValues.status
            ? status === 'suspended' ? 'suspend_store' : 'activate_store'
            : 'edit_store';

        await createActivityLog({
            action,
            store: updatedStore,
            user: req.user,
            details: `Master Admin ${req.user.name || req.user.email} updated store ${updatedStore.name}`,
            oldValue: previousValues,
            newValue: {
                name: updatedStore.name,
                address: updatedStore.address,
                phone: updatedStore.phone,
                email: updatedStore.email,
                status: updatedStore.status,
                manager: updatedStore.manager,
                sections: updatedStore.sections,
            },
        });

        return res.json(updatedStore);
    } catch (error) {
        console.error('Master Admin update store error:', error);
        return res.status(400).json({ message: 'Invalid store data' });
    }
};

const deleteMasterAdminStore = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        await store.deleteOne();

        await createActivityLog({
            action: 'delete_store',
            store,
            user: req.user,
            details: `Master Admin ${req.user.name || req.user.email} deleted store ${store.name}`,
            oldValue: {
                name: store.name,
                address: store.address,
                phone: store.phone,
                email: store.email,
                status: store.status,
                owner: store.owner,
                manager: store.manager,
            },
        });

        return res.json({ message: 'Store removed' });
    } catch (error) {
        console.error('Master Admin delete store error:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getMasterAdminStores,
    getMasterAdminStoreById,
    updateMasterAdminStore,
    deleteMasterAdminStore,
};
