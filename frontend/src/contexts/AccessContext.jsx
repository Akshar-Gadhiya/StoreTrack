import { createContext, useContext } from 'react'
import { useAuth } from './AuthContext'

const AccessContext = createContext()

export const useAccess = () => {
    const context = useContext(AccessContext)
    if (!context) {
        throw new Error('useAccess must be used within an AccessProvider')
    }
    return context
}

/**
 * Custom hook to check for a specific permission
 * @param {string} permissionName - The name of the permission to check (e.g., 'canDeleteItems')
 * @returns {boolean} - Whether the current user has the permission
 */
export const usePermission = (permissionName) => {
    const { hasPermission } = useAccess()
    return hasPermission(permissionName)
}

export const AccessProvider = ({ children }) => {
    const { user } = useAuth()

    /**
     * Checks if the user has a specific permission.
     * Owners always have all permissions.
     */
    const hasPermission = (permissionName) => {
        if (!user) return false
        // Owners have absolute power
        if (user.role === 'owner') return true

        // Check specific permission toggle
        return !!user.permissions?.[permissionName]
    }

    const value = {
        hasPermission,
        userRole: user?.role,
        permissions: user?.permissions || {},
    }

    return (
        <AccessContext.Provider value={value}>
            {children}
        </AccessContext.Provider>
    )
}

/**
 * Component-level wrapper for conditional rendering based on permissions
 */
export const Protect = ({ permission, children, fallback = null }) => {
    const { hasPermission } = useAccess()

    if (hasPermission(permission)) {
        return <>{children}</>
    }

    return fallback
}
