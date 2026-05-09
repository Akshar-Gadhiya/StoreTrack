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
    Clock,
    Eye,
    UserCheck,
    UserX,
    BarChart3,
    PieChart,
    Activity as ActivityIcon,
    Bell,
    Settings,
    Download,
    RefreshCw,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    MapPin,
    DollarSign,
    ShoppingCart
} from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '../components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { ScrollArea } from '../components/ui/scroll-area'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, Area, AreaChart } from 'recharts'

const MasterAdminDashboard = () => {
    const [stats, setStats] = useState({
        totalStores: 1247,
        totalOwners: 892,
        totalManagers: 2156,
        totalEmployees: 8943,
        activeStores: 1189,
        suspendedStores: 58,
        totalItems: 45672,
        lowStockItems: 234,
        outOfStockItems: 67,
        totalActivities: 15643,
        systemHealth: 'Excellent',
        lastBackup: '1 hour ago',
        revenue: 2847590,
        ordersToday: 1247
    })

    const [recentActivities, setRecentActivities] = useState([
        {
            id: 1,
            type: 'store_created',
            message: 'New store "Downtown Mall" registered by John Smith',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            severity: 'info'
        },
        {
            id: 2,
            type: 'user_suspended',
            message: 'Manager account suspended: Sarah Johnson (Policy violation)',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            severity: 'warning'
        },
        {
            id: 3,
            type: 'system_backup',
            message: 'Automated system backup completed successfully',
            timestamp: new Date(Date.now() - 65 * 60 * 1000),
            severity: 'success'
        },
        {
            id: 4,
            type: 'inventory_alert',
            message: 'Critical: 15 items out of stock across 8 stores',
            timestamp: new Date(Date.now() - 120 * 60 * 1000),
            severity: 'error'
        },
        {
            id: 5,
            type: 'user_login',
            message: 'Master Admin login from IP 192.168.1.100',
            timestamp: new Date(Date.now() - 180 * 60 * 1000),
            severity: 'info'
        }
    ])

    const [latestLogins, setLatestLogins] = useState([
        { user: 'John Smith', role: 'owner', store: 'Downtown Mall', time: '2 min ago', status: 'active' },
        { user: 'Sarah Johnson', role: 'manager', store: 'Central Plaza', time: '5 min ago', status: 'active' },
        { user: 'Mike Davis', role: 'employee', store: 'North Branch', time: '8 min ago', status: 'active' },
        { user: 'Lisa Chen', role: 'owner', store: 'East Side', time: '12 min ago', status: 'suspended' },
        { user: 'Tom Wilson', role: 'manager', store: 'West Mall', time: '15 min ago', status: 'active' }
    ])

    const [systemAlerts, setSystemAlerts] = useState([
        {
            type: 'critical',
            title: 'Database Performance',
            message: 'Query response time exceeded 2 seconds for 15 minutes',
            time: '5 min ago',
            status: 'active'
        },
        {
            type: 'warning',
            title: 'Storage Capacity',
            message: 'System storage at 85% capacity',
            time: '1 hour ago',
            status: 'active'
        },
        {
            type: 'info',
            title: 'Security Update',
            message: 'Security patches applied successfully',
            time: '2 hours ago',
            status: 'resolved'
        }
    ])

    // Chart data
    const storeGrowthData = [
        { month: 'Jan', stores: 1150, revenue: 2400000 },
        { month: 'Feb', stores: 1180, revenue: 2520000 },
        { month: 'Mar', stores: 1205, revenue: 2650000 },
        { month: 'Apr', stores: 1220, revenue: 2750000 },
        { month: 'May', stores: 1235, revenue: 2800000 },
        { month: 'Jun', stores: 1247, revenue: 2847590 }
    ]

    const userDistributionData = [
        { name: 'Employees', value: stats.totalEmployees, color: '#3b82f6' },
        { name: 'Managers', value: stats.totalManagers, color: '#10b981' },
        { name: 'Owners', value: stats.totalOwners, color: '#f59e0b' }
    ]

    const inventoryData = [
        { category: 'Electronics', items: 12500, lowStock: 45 },
        { category: 'Clothing', items: 8900, lowStock: 67 },
        { category: 'Home & Garden', items: 7800, lowStock: 34 },
        { category: 'Sports', items: 6200, lowStock: 28 },
        { category: 'Books', items: 4100, lowStock: 15 },
        { category: 'Beauty', items: 7172, lowStock: 45 }
    ]

    const StatCard = ({ title, value, icon: Icon, trend, trendValue, subtitle, color = 'primary' }) => (
        <Card className="group relative overflow-hidden border border-border bg-card p-6 shadow-2xl shadow-black/[0.02] hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 transition-all duration-500">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-all duration-700 -translate-y-2 translate-x-2 group-hover:translate-x-0 group-hover:translate-y-0">
                <Icon className={`h-20 w-20 text-${color}`} />
            </div>
            <div className="flex items-center gap-4 mb-4">
                <div className={`p-3.5 rounded-2xl bg-${color}/10 text-${color} group-hover:scale-110 transition-transform duration-500 shadow-sm shadow-${color}/10`}>
                    <Icon className="h-6 w-6" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{title}</p>
            </div>
            <div className="flex items-baseline gap-4">
                <h3 className="text-3xl font-black tracking-tighter">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
                {trend && (
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 border ${
                        trend === 'up' ? 'bg-green-500/10 text-green-600 border-green-500/20 shadow-sm shadow-green-500/10' :
                        trend === 'down' ? 'bg-red-500/10 text-red-600 border-red-500/20 shadow-sm shadow-red-500/10' :
                        'bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-sm shadow-blue-500/10'
                    }`}>
                        {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> :
                         trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> :
                         <ActivityIcon className="h-3 w-3" />}
                        {trendValue}
                    </span>
                )}
            </div>
            {subtitle && (
                <p className="text-[10px] font-bold text-muted-foreground/40 mt-4 flex items-center gap-2 uppercase tracking-widest italic">
                    <AlertTriangle className="h-3 w-3 animate-pulse" /> {subtitle}
                </p>
            )}
        </Card>
    )

    const getTimeAgo = (timestamp) => {
        const now = new Date()
        const past = new Date(timestamp)
        const diffInMinutes = Math.floor((now - past) / (1000 * 60))

        if (diffInMinutes < 1) return 'Just now'
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
        return `${Math.floor(diffInMinutes / 1440)}d ago`
    }

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'error': return 'destructive'
            case 'warning': return 'yellow'
            case 'success': return 'green'
            default: return 'blue'
        }
    }

    const statCards = [
        {
            title: 'Active Stores',
            value: stats.activeStores.toLocaleString(),
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

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
                        <Crown className="h-8 w-8 text-primary" />
                        Master Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Complete system oversight and control
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        System: {stats.systemHealth}
                    </Badge>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Actions
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>System Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh Data
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Export Report
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                System Settings
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Stores"
                    value={stats.totalStores}
                    icon={Building2}
                    trend="up"
                    trendValue="+2.1%"
                    subtitle="12 new this month"
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalOwners + stats.totalManagers + stats.totalEmployees}
                    icon={Users}
                    trend="up"
                    trendValue="+5.7%"
                    subtitle="Active workforce"
                />
                <StatCard
                    title="Revenue"
                    value={`$${(stats.revenue / 1000000).toFixed(1)}M`}
                    icon={DollarSign}
                    trend="up"
                    trendValue="+8.2%"
                    subtitle="Monthly recurring"
                />
                <StatCard
                    title="Orders Today"
                    value={stats.ordersToday}
                    icon={ShoppingCart}
                    trend="up"
                    trendValue="+12.5%"
                    subtitle="Peak performance"
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Active Stores</p>
                            <p className="text-2xl font-bold">{stats.activeStores}</p>
                        </div>
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <Building2 className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Suspended</p>
                            <p className="text-2xl font-bold">{stats.suspendedStores}</p>
                        </div>
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <UserX className="h-5 w-5 text-red-600" />
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                            <p className="text-2xl font-bold">{stats.totalItems.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Package className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                            <p className="text-2xl font-bold">{stats.lowStockItems}</p>
                        </div>
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                            <p className="text-2xl font-bold">{stats.outOfStockItems}</p>
                        </div>
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <UserX className="h-5 w-5 text-red-600" />
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Activities</p>
                            <p className="text-2xl font-bold">{stats.totalActivities.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Activity className="h-5 w-5 text-purple-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Charts Section */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Store Growth & Revenue
                                </CardTitle>
                                <CardDescription>Monthly growth trends over the past 6 months</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={storeGrowthData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip />
                                        <Area yAxisId="left" type="monotone" dataKey="stores" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                                        <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* User Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="h-5 w-5" />
                                    User Distribution
                                </CardTitle>
                                <CardDescription>Breakdown by role type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RechartsPieChart>
                                        <Pie
                                            data={userDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {userDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                                <div className="mt-4 space-y-2">
                                    {userDistributionData.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                <span>{item.name}</span>
                                            </div>
                                            <span className="font-semibold">{item.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activities & Latest Logins */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Activities */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Recent Activities
                                </CardTitle>
                                <CardDescription>Latest system events and user actions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-80">
                                    <div className="space-y-4">
                                        {recentActivities.map((activity) => (
                                            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                                                <div className={`p-2 rounded-lg ${
                                                    activity.severity === 'error' ? 'bg-red-500/10' :
                                                    activity.severity === 'warning' ? 'bg-yellow-500/10' :
                                                    activity.severity === 'success' ? 'bg-green-500/10' :
                                                    'bg-blue-500/10'
                                                }`}>
                                                    {activity.severity === 'error' ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
                                                     activity.severity === 'warning' ? <Clock className="h-4 w-4 text-yellow-600" /> :
                                                     activity.severity === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                                                     <Activity className="h-4 w-4 text-blue-600" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground">{activity.message}</p>
                                                    <p className="text-xs text-muted-foreground">{getTimeAgo(activity.timestamp)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        {/* Latest Logins */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="h-5 w-5" />
                                    Latest Logins
                                </CardTitle>
                                <CardDescription>Recent user authentication activity</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-80">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Store</TableHead>
                                                <TableHead>Time</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {latestLogins.map((login, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{login.user}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={login.role === 'owner' ? 'default' : login.role === 'manager' ? 'secondary' : 'outline'}>
                                                            {login.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{login.store}</TableCell>
                                                    <TableCell className="text-muted-foreground">{login.time}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={login.status === 'active' ? 'default' : 'destructive'}>
                                                            {login.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Analytics</CardTitle>
                                <CardDescription>Monthly revenue trends and projections</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={storeGrowthData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                                        <Bar dataKey="revenue" fill="#3b82f6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>User Growth</CardTitle>
                                <CardDescription>User acquisition and retention metrics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <p className="font-semibold">Monthly Active Users</p>
                                            <p className="text-2xl font-bold">12,847</p>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-green-600" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <p className="font-semibold">New Registrations</p>
                                            <p className="text-2xl font-bold">1,234</p>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <p className="font-semibold">Churn Rate</p>
                                            <p className="text-2xl font-bold">2.3%</p>
                                        </div>
                                        <ArrowDownRight className="h-8 w-8 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Overview</CardTitle>
                            <CardDescription>Stock levels across all categories</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Total Items</TableHead>
                                        <TableHead>Low Stock</TableHead>
                                        <TableHead>Stock Level</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventoryData.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.category}</TableCell>
                                            <TableCell>{item.items.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.lowStock > 50 ? 'destructive' : item.lowStock > 25 ? 'secondary' : 'default'}>
                                                    {item.lowStock}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="w-full bg-secondary rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-2 rounded-full"
                                                        style={{ width: `${Math.max(10, (item.items - item.lowStock) / item.items * 100)}%` }}
                                                    ></div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="p-2 hover:bg-muted rounded">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                                        <DropdownMenuItem>Restock Alert</DropdownMenuItem>
                                                        <DropdownMenuItem>Export Data</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5" />
                                System Alerts & Security
                            </CardTitle>
                            <CardDescription>Critical system notifications and security events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-96">
                                <div className="space-y-4">
                                    {systemAlerts.map((alert, index) => (
                                        <div key={index} className={`flex items-start gap-4 p-4 rounded-lg border ${
                                            alert.type === 'critical' ? 'bg-red-500/5 border-red-500/20' :
                                            alert.type === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20' :
                                            'bg-blue-500/5 border-blue-500/20'
                                        }`}>
                                            <div className={`p-2 rounded-lg ${
                                                alert.type === 'critical' ? 'bg-red-500/10' :
                                                alert.type === 'warning' ? 'bg-yellow-500/10' :
                                                'bg-blue-500/10'
                                            }`}>
                                                {alert.type === 'critical' ? <AlertTriangle className="h-5 w-5 text-red-600" /> :
                                                 alert.type === 'warning' ? <Clock className="h-5 w-5 text-yellow-600" /> :
                                                 <CheckCircle className="h-5 w-5 text-blue-600" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold">{alert.title}</h4>
                                                    <Badge variant={alert.status === 'active' ? 'destructive' : 'secondary'}>
                                                        {alert.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                                                <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default MasterAdminDashboard