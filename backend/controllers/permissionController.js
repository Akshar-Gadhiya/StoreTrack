const RolePermission = require('../models/RolePermission');
const { PERMISSIONS, ROLE_DEFAULT_PERMISSIONS, getPermissionKeys, getMatchingPermissions, getRoleDefaults, isValidRole } = require('../config/rolePermissions');

const ensureDefaultRolePermissions = async () => {
    const roles = Object.keys(ROLE_DEFAULT_PERMISSIONS);
    for (const role of roles) {
        const existing = await RolePermission.findOne({ role });
        if (!existing) {
            await RolePermission.create({
                role,
                permissions: getRoleDefaults(role),
            });
        }
    }
};

const getRolePermissionMatrix = async (req, res) => {
    try {
        await ensureDefaultRolePermissions();
        const roles = await RolePermission.find().sort({ role: 1 });
        res.json({ roles, permissions: PERMISSIONS });
    } catch (error) {
        console.error('Error fetching role permissions:', error);
        res.status(500).json({ message: 'Failed to fetch role permissions' });
    }
};

const getPermissionCatalog = async (req, res) => {
    try {
        res.json(PERMISSIONS);
    } catch (error) {
        console.error('Error fetching permission catalog:', error);
        res.status(500).json({ message: 'Failed to fetch permission metadata' });
    }
};

const updateRolePermissions = async (req, res) => {
    try {
        const { role } = req.params;
        const { permissions } = req.body;

        if (!isValidRole(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        if (!permissions || typeof permissions !== 'object') {
            return res.status(400).json({ message: 'Permissions payload must be an object' });
        }

        const allowedKeys = getPermissionKeys();
        const normalized = {};

        allowedKeys.forEach((key) => {
            if (permissions[key] !== undefined) {
                normalized[key] = !!permissions[key];
            }
        });

        const rolePermission = await RolePermission.findOneAndUpdate(
            { role },
            { permissions: { ...getRoleDefaults(role), ...normalized } },
            { new: true, upsert: true }
        );

        res.json(rolePermission);
    } catch (error) {
        console.error('Error updating role permissions:', error);
        res.status(500).json({ message: 'Failed to update role permissions' });
    }
};

module.exports = { getRolePermissionMatrix, getPermissionCatalog, updateRolePermissions, getRoleDefaults };
