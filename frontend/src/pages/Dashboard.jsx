import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import { useItem } from '../contexts/ItemContext'
import { Protect } from '../contexts/AccessContext'
import {
  Building2,
  Package,
  AlertTriangle,
  XCircle,
  BarChart3,
  History,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

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

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, subtitle }) => (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="p-2 rounded-lg bg-primary/5">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        {trend && (
          <span className={`text-xs font-medium flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
            {trendValue}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  )

  const ActivityItem = ({ activity }) => {
    const getTimeAgo = (timestamp) => {
      const now = new Date()
      const past = new Date(timestamp)
      const diffInMinutes = Math.floor((now - past) / (1000 * 60))

      if (diffInMinutes < 1) return 'Just now'
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }

    return (
      <div className="flex items-center gap-4 py-3">
        <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <History className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-none">{activity.details}</p>
          <p className="text-xs text-muted-foreground mt-1">{getTimeAgo(activity.timestamp)}</p>
        </div>
      </div>
    )
  }

  if (user?.role === 'employee') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name || 'Employee'}</h1>
          <p className="text-muted-foreground underline decoration-primary/30 underline-offset-4">
            You are currently viewing <span className="font-semibold text-foreground">{currentStore?.name || 'All Stores'}</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Total Items"
            value={stats.totalItems}
            icon={Package}
            trend="up"
            trendValue="+2% since yesterday"
          />
          <StatCard
            title="Current Store"
            value={currentStore?.name || 'None'}
            icon={Building2}
            subtitle="Store coverage"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive overview of your multi-store inventory.</p>
        </div>
        <Protect permission="canViewReports">
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2 transition-colors">
            <TrendingUp className="h-4 w-4" />
            View Reports
          </button>
        </Protect>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Stores"
          value={stats.totalStores}
          icon={Building2}
        />
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={Package}
          trend="up"
          trendValue="+12.5%"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockItems}
          icon={AlertTriangle}
          subtitle="Requires attention"
          trend={stats.lowStockItems > 5 ? 'up' : 'down'}
          trendValue={stats.lowStockItems > 5 ? "+5 new" : "-2 fixed"}
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStockItems}
          icon={XCircle}
          subtitle="Critical items"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Category Distribution */}
        <div className="lg:col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight">Inventory Distribution</h3>
              <p className="text-sm text-muted-foreground">Breakdown by item category</p>
            </div>
            <BarChart3 className="h-4 w-4 text-muted-foreground opacity-50" />
          </div>
          <div className="space-y-6">
            {Object.entries(categoryData).length > 0 ? (
              Object.entries(categoryData).map(([category, count]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category}</span>
                    <span className="text-muted-foreground">{count} items</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(count / stats.totalItems) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground/20 mb-4" />
                <p className="text-sm text-muted-foreground">No data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight">Activity Log</h3>
              <p className="text-sm text-muted-foreground">Latest inventory movements</p>
            </div>
            <History className="h-4 w-4 text-muted-foreground opacity-50" />
          </div>
          <div className="flex-1 divide-y divide-border">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <p className="text-sm text-center text-muted-foreground py-10">No recent activity</p>
            )}
          </div>
          <button className="mt-6 w-full py-2 text-sm font-medium border border-border rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            View All Activity
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {(stats.lowStockItems > 0 || stats.outOfStockItems > 0) && (
        <div className="rounded-xl border-2 border-primary/10 bg-primary/[0.02] p-6">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-lg font-bold">Important Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.outOfStockItems > 0 && (
              <div className="flex items-start p-4 bg-background border border-destructive/20 rounded-lg shadow-sm">
                <XCircle className="h-5 w-5 text-destructive mr-3 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-destructive">Stock Outages</p>
                  <p className="text-xs text-muted-foreground">{stats.outOfStockItems} item(s) are completely depleted and need restocking.</p>
                </div>
              </div>
            )}
            {stats.lowStockItems > 0 && (
              <div className="flex items-start p-4 bg-background border border-amber-500/20 rounded-lg shadow-sm">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-amber-600">Low Stock Warning</p>
                  <p className="text-xs text-muted-foreground">{stats.lowStockItems} item(s) are running below thresholds.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
