import { useState, useEffect } from 'react'
import {
    Crown,
    Users,
    Building2,
    Package,
    Activity,
    TrendingUp,
    ShieldCheck,
    AlertTriangle,
    CheckCircle,
    Clock
} from 'lucide-react'

const MasterAdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStores: 0,
        totalItems: 0,
        totalActivities: 0,
        systemHealth: 'Good',
        lastBackup: '2 hours ago'
    })

    // Mock data - in real app, fetch from API
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setStats({
                totalUsers: 1247,
                totalStores: 89,
                totalItems: 15432,
                totalActivities: 8921,
                systemHealth: 'Excellent',
                lastBackup: '1 hour ago'
            })
        }, 1000)
    }, [])

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers.toLocaleString(),
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            change: '+12%'
        },
        {
            title: 'Active Stores',
            value: stats.totalStores.toLocaleString(),
            icon: Building2,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            change: '+3%'
        },
        {
            title: 'Total Items',
            value: stats.totalItems.toLocaleString(),
            icon: Package,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            change: '+8%'
        },
        {
            title: 'Activities Today',
            value: stats.totalActivities.toLocaleString(),
            icon: Activity,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            change: '+15%'
        }
    ]

    const systemAlerts = [
        {
            type: 'success',
            message: 'All systems operational',
            time: '5 min ago',
            icon: CheckCircle
        },
        {
            type: 'warning',
            message: 'Database backup scheduled',
            time: '1 hour ago',
            icon: Clock
        },
        {
            type: 'info',
            message: 'New store registered: Downtown Mall',
            time: '2 hours ago',
            icon: Building2
        }
    ]

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Crown className="h-8 w-8 text-primary" />
                        Master Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Complete system oversight and control
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">System Status: {stats.systemHealth}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                                <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    {stat.change} from last month
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* System Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Health */}
                <div className="bg-card border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">System Health</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="font-medium text-green-800">Database</span>
                            </div>
                            <span className="text-sm text-green-600">Operational</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="font-medium text-green-800">API Services</span>
                            </div>
                            <span className="text-sm text-green-600">99.9% uptime</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-yellow-600" />
                                <span className="font-medium text-yellow-800">Backup Status</span>
                            </div>
                            <span className="text-sm text-yellow-600">{stats.lastBackup}</span>
                        </div>
                    </div>
                </div>

                {/* Recent Alerts */}
                <div className="bg-card border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Recent System Alerts</h3>
                    <div className="space-y-3">
                        {systemAlerts.map((alert, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                                <alert.icon className={`h-5 w-5 mt-0.5 ${
                                    alert.type === 'success' ? 'text-green-600' :
                                    alert.type === 'warning' ? 'text-yellow-600' :
                                    'text-blue-600'
                                }`} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">{alert.message}</p>
                                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center gap-3 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium text-foreground">Create System User</p>
                            <p className="text-sm text-muted-foreground">Add new administrator</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium text-foreground">System Backup</p>
                            <p className="text-sm text-muted-foreground">Manual backup now</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium text-foreground">System Settings</p>
                            <p className="text-sm text-muted-foreground">Configure platform</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MasterAdminDashboard