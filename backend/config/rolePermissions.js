const PERMISSIONS = [
    {
        key: 'canEditInventory',
        label: 'Edit Inventory',
        description: 'Modify item records, stock levels, and product metadata.',
    },
    {
        key: 'canDeleteItems',
        label: 'Delete Items',
        description: 'Permanently delete inventory entries and remove records.',
    },
    {
        key: 'canViewReports',
        label: 'View Reports',
        description: 'Access analytics, sales reports, and audit dashboards.',
    },
    {
        key: 'canManageTeam',
        label: 'Manage Team',
        description: 'Create, update, and remove subordinate team members.',
    },
    {
        key: 'canConfigureRoles',
        label: 'Configure Roles',
        description: 'Assign and edit default permissions for each role.',
    },
];

const ROLE_DEFAULT_PERMISSIONS = {
    MASTER_ADMIN: {
        canEditInventory: true,
        canDeleteItems: true,
        canViewReports: true,
        canManageTeam: true,
        canConfigureRoles: true,
    },
    owner: {
        canEditInventory: true,
        canDeleteItems: true,
        canViewReports: true,
        canManageTeam: true,
        canConfigureRoles: true,
    },
    manager: {
        canEditInventory: true,
        canDeleteItems: false,
        canViewReports: true,
        canManageTeam: true,
        canConfigureRoles: false,
    },
    employee: {
        canEditInventory: false,
        canDeleteItems: false,
        canViewReports: true,
        canManageTeam: false,
        canConfigureRoles: false,
    },
};

const getPermissionKeys = () => PERMISSIONS.map((permission) => permission.key);

const getMatchingPermissions = (rawPermissions = {}) => {
    const keys = getPermissionKeys();
    const result = {};

    keys.forEach((key) => {
        result[key] = rawPermissions[key] === true;
    });

    return result;
};

const getRoleDefaults = (role) => {
    if (!ROLE_DEFAULT_PERMISSIONS[role]) {
        return getMatchingPermissions({});
    }
    return getMatchingPermissions(ROLE_DEFAULT_PERMISSIONS[role]);
};

const isValidRole = (role) => Object.keys(ROLE_DEFAULT_PERMISSIONS).includes(role);

module.exports = {
    PERMISSIONS,
    ROLE_DEFAULT_PERMISSIONS,
    getPermissionKeys,
    getMatchingPermissions,
    getRoleDefaults,
    isValidRole,
};
