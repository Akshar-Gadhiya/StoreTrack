/**
 * Middleware to authorize specific roles
 * @param  {...string} roles - Allowed roles for the route
 * @returns {Function} Express middleware function
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, no user found' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Required role(s): ${roles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Middleware specifically for Master Admin role
 */
const requireMasterAdmin = authorizeRoles('MASTER_ADMIN');

/**
 * Middleware for Owner or Master Admin roles
 */
const requireOwnerOrMasterAdmin = authorizeRoles('owner', 'MASTER_ADMIN');

/**
 * Middleware for Manager, Owner, or Master Admin roles
 */
const requireManagerOrHigher = authorizeRoles('manager', 'owner', 'MASTER_ADMIN');

module.exports = {
    authorizeRoles,
    requireMasterAdmin,
    requireOwnerOrMasterAdmin,
    requireManagerOrHigher
};