import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
} from 'recharts'
import {
    BarChart3,
    Users,
    Store,
    TrendingUp,
    Calendar,
    Download,
    RefreshCw,
    Loader2,
    Activity,
    LogIn,
    Package,
    Filter,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'

const API_URL = 'http://localhost:5000/api'

const COLORS = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#06b6d4'
]

const MasterAdminAnalytics = () => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')

    // Date filters
    const [period, setPeriod] = useState('month')
    const [startDate, setStartDate] = useState(
        new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    )
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

    // Data states
    const [overview, setOverview] = useState(null)
    const [storeGrowth, setStoreGrowth] = useState([])
    const [userGrowth, setUserGrowth] = useState([])
    const [userRoles, setUserRoles] = useState([])
    const [loginStats, setLoginStats] = useState([])
    const [inventoryActivity, setInventoryActivity] = useState([])
    const [activeUsers, setActiveUsers] = useState([])
    const [topStores, setTopStores] = useState([])
    const [activitySummary, setActivitySummary] = useState([])

    const getHeaders = () => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('storetrack_token')}`,
    })

    const loadData = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                startDate,
                endDate,
                period,
            })

            const [
                overviewRes,
                storeGrowthRes,
                userGrowthRes,
                userRolesRes,
                loginStatsRes,
                inventoryRes,
                activeUsersRes,
                topStoresRes,
                activityRes,
            ] = await Promise.all([
                fetch(`${API_URL}/analytics/overview?${params}`, { headers: getHeaders() }),
                fetch(`${API_URL}/analytics/store-growth?${params}`, { headers: getHeaders() }),
                fetch(`${API_URL}/analytics/user-growth?${params}`, { headers: getHeaders() }),
                fetch(`${API_URL}/analytics/user-roles`, { headers: getHeaders() }),
                fetch(`${API_URL}/analytics/login-stats?${params}`, { headers: getHeaders() }),
                fetch(`${API_URL}/analytics/inventory-activity?${params}`, { headers: getHeaders() }),
                fetch(`${API_URL}/analytics/active-users?${params}`, { headers: getHeaders() }),
                fetch(`${API_URL}/analytics/top-stores?${params}`, { headers: getHeaders() }),
                fetch(`${API_URL}/analytics/activity-summary?${params}`, { headers: getHeaders() }),
            ])

            if (overviewRes.ok) setOverview(await overviewRes.json())
            if (storeGrowthRes.ok) setStoreGrowth(await storeGrowthRes.json())
            if (userGrowthRes.ok) setUserGrowth(await userGrowthRes.json())
            if (userRolesRes.ok) setUserRoles(await userRolesRes.json())
            if (loginStatsRes.ok) setLoginStats(await loginStatsRes.json())
            if (inventoryRes.ok) setInventoryActivity(await inventoryRes.json())
            if (activeUsersRes.ok) setActiveUsers(await activeUsersRes.json())
            if (topStoresRes.ok) setTopStores(await topStoresRes.json())
            if (activityRes.ok) setActivitySummary(await activityRes.json())

            toast.success('Analytics updated')
        } catch (error) {
            console.error('Failed to load analytics:', error)
            toast.error('Failed to load analytics')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user?.role === 'MASTER_ADMIN') {
            loadData()
        }
    }, [user, period, startDate, endDate])

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadData()
        setRefreshing(false)
    }

    const exportAsCSV = () => {
        let csv = 'Analytics Report\n'
        csv += `Generated: ${new Date().toLocaleString()}\n`
        csv += `Period: ${startDate} to ${endDate}\n\n`

        if (overview) {
            csv += 'Overview Metrics\n'
            csv += `Total Users,${overview.totalUsers}\n`
            csv += `Total Stores,${overview.totalStores}\n`
            csv += `Total Items,${overview.totalItems}\n`
            csv += `Active Users,${overview.activeUsers}\n`
            csv += `Total Logins,${overview.totalLogins}\n\n`
        }

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Report exported successfully')
    }

    if (!user || user.role !== 'MASTER_ADMIN') {
        return (
            <div className="mx-auto mt-20 max-w-3xl rounded-3xl border border-destructive/20 bg-destructive/5 p-12 text-center shadow-lg">
                <BarChart3 className="mx-auto mb-6 h-12 w-12 text-destructive" />
                <h2 className="text-3xl font-bold text-destructive">Access Restricted</h2>
                <p className="mt-3 text-muted-foreground">
                    Analytics are only accessible to Master Administrators.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-muted-foreground">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Analytics & Reporting
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    Analytics Dashboard
                </h1>
                <p className="max-w-3xl text-base text-muted-foreground">
                    Comprehensive insights into system growth, user activity, inventory management, and platform health.
                </p>
            </div>

            {/* Filters and Actions */}
            <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters & Options
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Period</label>
                            <Select value={period} onValueChange={setPeriod}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="day">Daily</SelectItem>
                                    <SelectItem value="month">Monthly</SelectItem>
                                    <SelectItem value="year">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background"
                            />
                        </div>

                        <div className="flex items-end gap-2">
                            <Button onClick={handleRefresh} disabled={refreshing} className="flex-1">
                                {refreshing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                )}
                                Refresh
                            </Button>
                        </div>

                        <div className="flex items-end gap-2">
                            <Button variant="outline" onClick={exportAsCSV} className="flex-1">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Overview Metrics */}
            {overview && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overview.totalUsers}</div>
                            <p className="text-xs text-muted-foreground">Registered users</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
                            <Store className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overview.totalStores}</div>
                            <p className="text-xs text-muted-foreground">Active stores</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                            <Package className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overview.totalItems}</div>
                            <p className="text-xs text-muted-foreground">Inventory items</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <Activity className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overview.activeUsers}</div>
                            <p className="text-xs text-muted-foreground">With activity</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Logins</CardTitle>
                            <LogIn className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overview.totalLogins}</div>
                            <p className="text-xs text-muted-foreground">In period</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Charts */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Growth</TabsTrigger>
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                        <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    </TabsList>

                    {/* Growth Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Store Growth */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader>
                                <CardTitle>Store Growth</CardTitle>
                                <CardDescription>New stores created over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {storeGrowth.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={storeGrowth}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="totalStores"
                                                stroke="#3b82f6"
                                                dot={false}
                                                name="Cumulative Stores"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="newStores"
                                                stroke="#10b981"
                                                dot={false}
                                                name="New Stores"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                                        No data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* User Growth */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader>
                                <CardTitle>User Growth</CardTitle>
                                <CardDescription>New users registered over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {userGrowth.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={userGrowth}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="totalUsers"
                                                stroke="#3b82f6"
                                                dot={false}
                                                name="Cumulative Users"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="newUsers"
                                                stroke="#ef4444"
                                                dot={false}
                                                name="New Users"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                                        No data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users" className="space-y-6">
                        {/* User Roles Distribution */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader>
                                <CardTitle>User Role Distribution</CardTitle>
                                <CardDescription>Breakdown of users by role</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {userRoles.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={userRoles}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ role, percentage }) =>
                                                    `${role}: ${percentage}%`
                                                }
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="count"
                                            >
                                                {userRoles.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                                        No data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Login Statistics */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader>
                                <CardTitle>Login Statistics</CardTitle>
                                <CardDescription>Daily logins and unique users</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loginStats.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ComposedChart data={loginStats}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar
                                                dataKey="logins"
                                                fill="#3b82f6"
                                                name="Total Logins"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="uniqueUsers"
                                                stroke="#ef4444"
                                                name="Unique Users"
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                                        No data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity" className="space-y-6">
                        {/* Active Users */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader>
                                <CardTitle>Active Users Trend</CardTitle>
                                <CardDescription>Daily active users over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {activeUsers.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={activeUsers}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar
                                                dataKey="activeUsers"
                                                fill="#10b981"
                                                name="Active Users"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                                        No data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Top Stores */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader>
                                <CardTitle>Top Stores by Activity</CardTitle>
                                <CardDescription>Most active stores</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {topStores.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            data={topStores}
                                            layout="vertical"
                                            margin={{ left: 150 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis
                                                dataKey="storeName"
                                                type="category"
                                                width={140}
                                            />
                                            <Tooltip />
                                            <Bar
                                                dataKey="activityCount"
                                                fill="#8b5cf6"
                                                name="Activity Count"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                                        No data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Inventory Tab */}
                    <TabsContent value="inventory" className="space-y-6">
                        {/* Inventory Activity */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader>
                                <CardTitle>Inventory Activity Breakdown</CardTitle>
                                <CardDescription>Types of inventory operations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {inventoryActivity.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={inventoryActivity}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="action"
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                            />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar
                                                dataKey="count"
                                                fill="#f59e0b"
                                                name="Count"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                                        No data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Activity Summary */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader>
                                <CardTitle>Activity Summary by Category</CardTitle>
                                <CardDescription>Distribution of activities by category</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {activitySummary.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={activitySummary}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ category, count }) =>
                                                    `${category}: ${count}`
                                                }
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="count"
                                            >
                                                {activitySummary.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                                        No data available
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    )
}

export default MasterAdminAnalytics
