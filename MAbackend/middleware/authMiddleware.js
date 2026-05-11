const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            return next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'owner') {
        return next();
    } else {
        return res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

// Middleware to check if user can create managers (only owner)
const canCreateManager = (req, res, next) => {
    if (req.user && req.user.role === 'owner') {
        return next();
    } else {
        return res.status(401).json({ message: 'Only owners can create manager accounts' });
    }
};

// Middleware to check if user can create employees (owner or manager)
const canCreateEmployee = (req, res, next) => {
    if (req.user && (req.user.role === 'owner' || req.user.role === 'manager')) {
        return next();
    } else {
        return res.status(401).json({ message: 'Only owners and managers can create employee accounts' });
    }
};

// Middleware to validate role hierarchy for user creation
const validateUserRole = (req, res, next) => {
    const { role } = req.body;
    const currentUserRole = req.user.role;

    // Owners can create managers and employees
    if (currentUserRole === 'owner') {
        if (role === 'owner') {
            return res.status(400).json({ message: 'Cannot create owner accounts' });
        }
        return next();
    }

    // Managers can only create employees
    if (currentUserRole === 'manager') {
        if (role === 'owner' || role === 'manager') {
            return res.status(400).json({ message: 'Managers can only create employee accounts' });
        }
        return next();
    }

    // Employees cannot create any accounts
    return res.status(401).json({ message: 'Not authorized to create accounts' });
};

module.exports = { protect, admin, canCreateManager, canCreateEmployee, validateUserRole };
