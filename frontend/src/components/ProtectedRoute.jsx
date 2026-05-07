import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

/**
 * ProtectedRoute ensures that a user is authenticated before rendering children.
 * It can also enforce role-based access when `allowedRoles` is provided.
 *
 * @param {{children: React.ReactNode, allowedRoles?: string[]}} props
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Not authenticated – redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Role check – if allowedRoles is specified, ensure user.role matches one of them
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    toast.error('You do not have permission to access this page')
    // Redirect to a safe location, e.g., dashboard
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
