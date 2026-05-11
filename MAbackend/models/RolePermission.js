const mongoose = require('mongoose');
const { getPermissionKeys } = require('../config/rolePermissions');

const permissionSchema = new mongoose.Schema(
    getPermissionKeys().reduce((acc, key) => {
        acc[key] = { type: Boolean, default: false };
        return acc;
    }, {}),
    { _id: false }
);

const rolePermissionSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ['MASTER_ADMIN', 'owner', 'manager', 'employee'],
            required: true,
            unique: true,
        },
        permissions: {
            type: permissionSchema,
            default: () => ({})
        },
    },
    {
        timestamps: true,
    }
);

const RolePermission = mongoose.model('RolePermission', rolePermissionSchema);
module.exports = RolePermission;
