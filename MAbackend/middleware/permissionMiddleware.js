const { getRoleDefaults, getPermissionKeys, isValidRole } = require('../config/rolePermissions');

const authorizePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, no user found' });
        }

        if (!getPermissionKeys().includes(permission)) {
            return res.status(400).json({ message: `Invalid permission: ${permission}` });
        }

        if (req.user.role === 'MASTER_ADMIN' || req.user.role === 'owner') {
            return next();
        }

        const userPermissions = req.user.permissions || {};
        const effectivePermissions = {
            ...getRoleDefaults(req.user.role),
            ...userPermissions,
        };

        if (!effectivePermissions[permission]) {
            return res.status(403).json({ message: `Permission denied: ${permission}` });
        }

        next();
    };
};

const authorizePermissions = (...permissions) => {
    return (req, res, next) => {
        for (const permission of permissions) {
            const middleware = authorizePermission(permission);
            let calledNext = false;
            middleware(req, res, () => {
                calledNext = true;
            });
            if (!calledNext) {
                return; // middleware already responded
            }
        }
        next();
    };
};

const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, no user found' });
        }
        if (req.user.role !== role) {
            return res.status(403).json({ message: `Access denied. Required role: ${role}` });
        }
        next();
    };
};

module.exports = { authorizePermission, authorizePermissions, requireRole, isValidRole };
