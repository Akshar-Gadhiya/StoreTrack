const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Master Admin Login
// @route   POST /api/master-admin/auth/login
// @access  Public
const masterAdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists and is MASTER_ADMIN
        const user = await User.findOne({ email, role: 'MASTER_ADMIN' });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                message: 'Master Admin login successful'
            });
        } else {
            res.status(401).json({ message: 'Invalid master admin credentials' });
        }
    } catch (error) {
        console.error('Master Admin login error:', error);
        res.status(500).json({ message: 'Server error during master admin login' });
    }
};

// @desc    Master Admin Logout
// @route   POST /api/master-admin/auth/logout
// @access  Private (Master Admin only)
const masterAdminLogout = async (req, res) => {
    try {
        // In a stateless JWT system, logout is handled on the client side
        // by removing the token from localStorage
        res.json({ message: 'Master Admin logged out successfully' });
    } catch (error) {
        console.error('Master Admin logout error:', error);
        res.status(500).json({ message: 'Server error during master admin logout' });
    }
};

// @desc    Get Master Admin Profile
// @route   GET /api/master-admin/auth/profile
// @access  Private (Master Admin only)
const getMasterAdminProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user && user.role === 'MASTER_ADMIN') {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Master Admin profile not found' });
        }
    } catch (error) {
        console.error('Get master admin profile error:', error);
        res.status(500).json({ message: 'Server error retrieving master admin profile' });
    }
};

module.exports = {
    masterAdminLogin,
    masterAdminLogout,
    getMasterAdminProfile
};