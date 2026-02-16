import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import { useItem } from '../contexts/ItemContext'
import { 
  BuildingStorefrontIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const { user } = useAuth()
  const { stores, currentStore } = useStore()
  const { items, getLowStockItems, getOutOfStockItems, getItemsByCategory, getActivityLogs } = useItem()
  const [stats, setStats] = useState({
    totalStores: 0,
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [categoryData, setCategoryData] = useState({})

  useEffect(() => {
    // Calculate stats
    const lowStock = getLowStockItems()
    const outOfStock = getOutOfStockItems()
    const categories = getItemsByCategory()
    
    setStats({
      totalStores: stores.length,
      totalItems: items.length,
      lowStockItems: lowStock.length,
      outOfStockItems: outOfStock.length
    })
    
    setCategoryData(categories)
    setRecentActivity(getActivityLogs(10))
  }, [stores, items, getLowStockItems, getOutOfStockItems, getItemsByCategory, getActivityLogs])

  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  )

  const ActivityItem = ({ activity }) => {
    const getTimeAgo = (timestamp) => {
      const now = new Date()
      const past = new Date(timestamp)
      const diffInMinutes = Math.floor((now - past) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'Just now'
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }

    return (
      <div className="flex items-start space-x-3 py-2">
        <div className="flex-shrink-0">
          <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900">{activity.details}</p>
          <p className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</p>
        </div>
      </div>
    )
  }

  if (user?.role === 'employee') {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800">Employee Dashboard</h3>
          <p className="text-sm text-yellow-600 mt-1">
            As an employee, you can view items and scan QR codes. Use the navigation to access these features.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Total Items"
            value={items.length}
            icon={CubeIcon}
            color="blue"
          />
          <StatCard
            title="Current Store"
            value={currentStore?.name || 'None selected'}
            icon={BuildingStorefrontIcon}
            color="green"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your inventory and store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Stores"
          value={stats.totalStores}
          icon={BuildingStorefrontIcon}
          color="blue"
        />
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={CubeIcon}
          color="green"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={ExclamationTriangleIcon}
          color="yellow"
          subtitle="Items need restocking"
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStockItems}
          icon={XCircleIcon}
          color="red"
          subtitle="Items completely depleted"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Category Distribution</h3>
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {Object.entries(categoryData).length > 0 ? (
              Object.entries(categoryData).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{category}</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / stats.totalItems) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No items categorized yet</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <ClockIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-1">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {(stats.lowStockItems > 0 || stats.outOfStockItems > 0) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Alerts</h3>
          <div className="space-y-3">
            {stats.outOfStockItems > 0 && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <XCircleIcon className="h-5 w-5 text-red-600 mr-3" />
                <span className="text-sm text-red-800">
                  {stats.outOfStockItems} item(s) are out of stock and need immediate attention
                </span>
              </div>
            )}
            {stats.lowStockItems > 0 && (
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-3" />
                <span className="text-sm text-yellow-800">
                  {stats.lowStockItems} item(s) are running low on stock
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
