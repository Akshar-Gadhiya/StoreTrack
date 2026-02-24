const User = require('../models/User');
const Store = require('../models/Store');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();
    console.log(`Login attempt for email: ${email}`);

    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } }).populate('store', 'name');
    console.log(`User found in DB: ${user ? 'YES' : 'NO'}`);

    if (user && (await bcrypt.compare(password, user.password))) {
        console.log('Password match: YES');

        // Build response object
        const responseData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            permissions: user.role === 'owner' ? {
                canEditInventory: true,
                canDeleteItems: true,
                canViewReports: true,
                canManageTeam: true
            } : user.permissions
        };

        // Add store info for managers and employees
        if ((user.role === 'manager' || user.role === 'employee') && user.store) {
            responseData.store = user.store._id;
            responseData.storeName = user.store.name;
        }

        res.json(responseData);
    } else {
        console.log('Password match or user check: NO');
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    let { name, email, password, role } = req.body;
    email = email.trim().toLowerCase();

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'owner', // Always set to owner for initial account creation
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

module.exports = { authUser, registerUser };
