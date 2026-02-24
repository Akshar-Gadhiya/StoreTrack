const User = require('../models/User');
const Store = require('../models/Store');
const bcrypt = require('bcryptjs');

// @desc    Get users based on role hierarchy
// @route   GET /api/users
// @access  Private (Owner sees all non-owners, Manager sees their employees)
const getUsers = async (req, res) => {
    try {
        let users;

        // Owners can see all managers and employees
        if (req.user.role === 'owner') {
            users = await User.find({ role: { $ne: 'owner' } })
                .select('-password')
                .populate('store', 'name');
        }
        // Managers can only see employees they created
        else if (req.user.role === 'manager') {
            users = await User.find({
                role: 'employee',
                createdBy: req.user._id
            }).select('-password').populate('store', 'name');
        }
        // Employees can't see other users
        else {
            return res.status(401).json({ message: 'Not authorized to view users' });
        }

        // Convert createdBy to string for each user
        const usersWithCreatedBy = users.map(user => ({
            ...user.toObject(),
            createdBy: user.createdBy ? user.createdBy.toString() : null,
            store: user.store ? (typeof user.store === 'object' ? user.store._id.toString() : user.store.toString()) : null,
            storeName: user.store ? (typeof user.store === 'object' ? user.store.name : null) : null
        }));

        res.json(usersWithCreatedBy);
    } catch (error) {
        console.error('Error in getUsers:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get users managed by current user (for hierarchy display)
// @route   GET /api/users/managed
// @access  Private (Owner/Manager)
const getManagedUsers = async (req, res) => {
    try {
        let users;

        if (req.user.role === 'owner') {
            // Owners see all managers
            users = await User.find({ role: 'manager' })
                .select('-password')
                .populate('store', 'name');
        } else if (req.user.role === 'manager') {
            // Managers see employees they created
            users = await User.find({
                role: 'employee',
                createdBy: req.user._id
            }).select('-password').populate('store', 'name');
        } else {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new user (employee/manager)
// @route   POST /api/users
// @access  Private (Owner can create manager, Manager can create employee)
const createUser = async (req, res) => {
    try {
        const { name, email, password, role, store } = req.body;
        const currentUserRole = req.user.role;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Owner creates manager - must assign a store
        if (currentUserRole === 'owner' && role === 'manager') {
            if (!store) {
                return res.status(400).json({ message: 'Store is required for manager' });
            }

            // Check if store already has a manager
            const existingManager = await User.findOne({ store: store, role: 'manager' });
            if (existingManager) {
                return res.status(400).json({ message: 'This store already has a manager' });
            }
        }

        // Owner creates manager - validate role
        if (currentUserRole === 'owner' && role === 'owner') {
            return res.status(400).json({ message: 'Cannot create owner accounts' });
        }

        if (currentUserRole === 'owner' && (role === 'employee' || !role)) {
            return res.status(400).json({ message: 'Owners can only create manager accounts' });
        }

        // Managers can only create employees
        if (currentUserRole === 'manager' && role !== 'employee') {
            return res.status(400).json({ message: 'Managers can only create employee accounts' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let userStore = store;

        // If manager creates employee, assign the manager's store
        if (currentUserRole === 'manager' && role === 'employee') {
            userStore = req.user.store;
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'employee',
            createdBy: req.user._id,
            store: userStore,
        });

        // If creating a manager, update the store to reference this manager
        if (role === 'manager' && store) {
            await Store.findByIdAndUpdate(store, { manager: user._id });
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            createdBy: user.createdBy,
            store: user.store,
        });
    } catch (error) {
        console.error('Error in createUser:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private (Owner can update any, Manager can update only their employees)
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent modifying owners
        if (user.role === 'owner') {
            return res.status(403).json({ message: 'Cannot modify owner accounts' });
        }

        // Managers can only modify their own employees
        if (req.user.role === 'manager') {
            if (user.createdBy?.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'You can only modify users you created' });
            }
            // Managers cannot change role to manager
            if (req.body.role === 'manager') {
                return res.status(403).json({ message: 'Managers cannot promote employees to manager' });
            }
        }

        const { name, email, password, role } = req.body;

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            createdAt: updatedUser.createdAt,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private (Owner can delete any, Manager can delete only their employees)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting owners
        if (user.role === 'owner') {
            return res.status(403).json({ message: 'Cannot delete owner accounts' });
        }

        // Managers can only delete their own employees
        if (req.user.role === 'manager') {
            if (user.createdBy?.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'You can only delete users you created' });
            }
        }

        await user.deleteOne();
        res.json({ message: 'User removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getUsers, createUser, updateUser, deleteUser, getManagedUsers };
