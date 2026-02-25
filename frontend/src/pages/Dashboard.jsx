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
  ArrowDownRight,
  ArrowRight
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
    <div className="group relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-2xl shadow-black/[0.02] hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 transition-all duration-500">
      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-all duration-700 -translate-y-2 translate-x-2 group-hover:translate-x-0 group-hover:translate-y-0">
        <Icon className="h-20 w-20 text-primary rotate-12" />
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3.5 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500 shadow-sm shadow-primary/10">
          <Icon className="h-6 w-6" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{title}</p>
      </div>
      <div className="flex items-baseline gap-4">
        <h3 className="text-4xl font-black tracking-tighter">{value}</h3>
        {trend && (
          <span className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 border ${trend === 'up' ? 'bg-green-500/10 text-green-600 border-green-500/20 shadow-sm shadow-green-500/10' : 'bg-red-500/10 text-red-600 border-red-500/20 shadow-sm shadow-red-500/10'}`}>
            {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trendValue}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-[10px] font-bold text-muted-foreground/40 mt-4 flex items-center gap-2 uppercase tracking-widest italic">
          <AlertTriangle className="h-3 w-3 animate-pulse" /> {subtitle}
        </p>
      )}
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
      <div className="group flex items-center gap-4 py-4 transition-all hover:bg-muted/30 px-2 rounded-xl">
        <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 border border-border transition-transform group-hover:scale-110">
          <History className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground leading-snug">{activity.details}</p>
          <p className="text-xs font-medium text-muted-foreground mt-1 flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-primary/40"></span>
            {getTimeAgo(activity.timestamp)}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
      </div>
    )
  }

  if (user?.role === 'employee') {
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Welcome back, {user.name || 'Team Member'}!</h1>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-muted-foreground font-medium">
              Inventory Access: <span className="text-primary font-bold">{currentStore?.name || 'All Active Nodes'}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StatCard
            title="Total Items"
            value={stats.totalItems}
            icon={Package}
            trend="up"
            trendValue="+2% Today"
          />
          <StatCard
            title="Assigned Store"
            value={currentStore?.name || 'Central'}
            icon={Building2}
            subtitle="Secure access enabled"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Live Operational Pulse</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground">
            System Overdrive
          </h1>
          <p className="text-muted-foreground text-xl font-medium max-w-2xl leading-relaxed">
            Real-time multi-node synchronization, high-fidelity inventory metrics, and predictive stock performance analysis.
          </p>
        </div>
        <Protect permission="canViewReports">
          <button className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group">
            <TrendingUp className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            Generate Intelligence Report
          </button>
        </Protect>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Stores"
          value={stats.totalStores}
          icon={Building2}
          trend="up"
          trendValue="Live"
        />
        <StatCard
          title="Catalog Size"
          value={stats.totalItems}
          icon={Package}
          trend="up"
          trendValue="+12.5% MTD"
        />
        <StatCard
          title="Attention Required"
          value={stats.lowStockItems}
          icon={AlertTriangle}
          subtitle="Inventory threshold alerts"
          trend={stats.lowStockItems > 5 ? 'up' : 'down'}
          trendValue={stats.lowStockItems > 5 ? "+5 NEW" : "STABLE"}
        />
        <StatCard
          title="Critical Shortages"
          value={stats.outOfStockItems}
          icon={XCircle}
          subtitle="Action required immediately"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Distribution */}
        <div className="lg:col-span-12 xl:col-span-7 rounded-3xl border border-border bg-card p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight">Catalog Distribution</h3>
              <p className="text-sm text-muted-foreground font-medium">Inventory breakdown by vertical</p>
            </div>
            <div className="p-3 bg-secondary rounded-2xl">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 relative z-10">
            {Object.entries(categoryData).length > 0 ? (
              Object.entries(categoryData).map(([category, count]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-foreground capitalize tracking-tight">{category}</span>
                    <span className="text-muted-foreground font-bold px-2 py-0.5 bg-secondary rounded-lg">{count} units</span>
                  </div>
                  <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden border border-border/50">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{ width: `${(count / stats.totalItems) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Package className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <p className="text-sm font-bold text-muted-foreground">Digital catalog is currently empty.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-12 xl:col-span-5 rounded-3xl border border-border bg-card p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight">Live Pulse</h3>
              <p className="text-sm text-muted-foreground font-medium">Latest inventory interactions</p>
            </div>
            <div className="p-3 bg-secondary rounded-2xl">
              <History className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex-1 divide-y divide-border/50">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center opacity-50">
                <History className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm font-bold text-muted-foreground italic">System idling...</p>
              </div>
            )}
          </div>
          <button className="mt-8 w-full h-12 text-sm font-bold text-primary bg-primary/5 rounded-xl hover:bg-primary/10 transition-all flex items-center justify-center gap-2">
            Audit Full Log
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {(stats.lowStockItems > 0 || stats.outOfStockItems > 0) && (
        <div className="rounded-3xl border-2 border-primary/10 bg-primary/[0.02] p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertTriangle className="h-24 w-24 text-primary -mr-8 -mt-8" />
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 bg-primary/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">System Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {stats.outOfStockItems > 0 && (
              <div className="flex items-start p-5 bg-card border border-destructive/20 rounded-2xl shadow-sm hover:border-destructive/40 transition-colors">
                <div className="p-2.5 bg-destructive/10 rounded-xl mr-4 shrink-0">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-destructive">Critical Outages</p>
                  <p className="text-sm font-medium text-muted-foreground">{stats.outOfStockItems} item(s) are completely depleted and halting operations.</p>
                </div>
              </div>
            )}
            {stats.lowStockItems > 0 && (
              <div className="flex items-start p-5 bg-card border border-amber-500/20 rounded-2xl shadow-sm hover:border-amber-500/40 transition-colors">
                <div className="p-2.5 bg-amber-500/10 rounded-xl mr-4 shrink-0">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-amber-600">Low Stock Advisory</p>
                  <p className="text-sm font-medium text-muted-foreground">{stats.lowStockItems} item(s) are approaching critical depletion levels.</p>
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
