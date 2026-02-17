import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  BuildingStorefrontIcon,
  CubeIcon,
  UserGroupIcon,
  QrCodeIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'

const Layout = () => {
  const { user, logout } = useAuth()
  const { currentStore } = useStore()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Stores', href: '/stores', icon: BuildingStorefrontIcon },
    { name: 'Items', href: '/items', icon: CubeIcon },
    { name: 'QR Scanner', href: '/scanner', icon: QrCodeIcon },
  ]

  // Only show Employees for Owner and Manager roles
  if (user?.role === 'owner' || user?.role === 'manager') {
    navigation.splice(3, 0, { name: 'Employees', href: '/employees', icon: UserGroupIcon })
  }

  const isActive = (href) => {
    return location.pathname === href
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">StoreTrack</h1>
          </div>

          {/* Current Store Info */}


          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-3">
              <UserCircleIcon className="w-8 h-8 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h2>
              <div className="flex items-center space-x-4">
                {/* Store Selector (for owners/managers) */}
                {(user?.role === 'owner' || user?.role === 'manager') && (
                  <div className="text-sm text-gray-500">
                    {currentStore ? (
                      <span>Managing: {currentStore.name}</span>
                    ) : (
                      <span className="text-orange-600">No store selected</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
