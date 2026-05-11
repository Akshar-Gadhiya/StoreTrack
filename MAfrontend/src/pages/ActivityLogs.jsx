import { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import {
    Activity,
    Search,
    Filter,
    Download,
    Calendar,
    Clock,
    User,
    Shield,
    AlertTriangle,
    CheckCircle,
    Info,
    X,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Eye,
    RefreshCw,
    BarChart3
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'

const API_URL = 'http://localhost:5000/api'

const severityConfig = {
    low: { color: 'bg-blue-500/10 text-blue-700 border-blue-500/20', icon: Info },
    medium: { color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20', icon: AlertTriangle },
    high: { color: 'bg-orange-500/10 text-orange-700 border-orange-500/20', icon: Shield },
    critical: { color: 'bg-red-500/10 text-red-700 border-red-500/20', icon: AlertTriangle }
}

const categoryConfig = {
    inventory: { color: 'bg-green-500/10 text-green-700', icon: Activity },
    store: { color: 'bg-purple-500/10 text-purple-700', icon: Shield },
    user: { color: 'bg-blue-500/10 text-blue-700', icon: User },
    auth: { color: 'bg-indigo-500/10 text-indigo-700', icon: Shield },
    security: { color: 'bg-red-500/10 text-red-700', icon: AlertTriangle },
    system: { color: 'bg-gray-500/10 text-gray-700', icon: BarChart3 },
    general: { color: 'bg-slate-500/10 text-slate-700', icon: Info }
}

const ActivityLogs = () => {
    const { user } = useAuth()
    const [logs, setLogs] = useState([])
    const [stats, setStats] = useState(null)
    const [filters, setFilters] = useState(null)
    const [loading, setLoading] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [selectedLog, setSelectedLog] = useState(null)

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [actionFilter, setActionFilter] = useState('')
    const [severityFilter, setSeverityFilter] = useState('')
    const [userFilter, setUserFilter] = useState('')
    const [storeFilter, setStoreFilter] = useState('')
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    })
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(50)
    const [totalPages, setTotalPages] = useState(1)
    const [totalLogs, setTotalLogs] = useState(0)

    const isMasterAdmin = user?.role === 'MASTER_ADMIN'

    useEffect(() => {
        if (!isMasterAdmin) return
        loadFilters()
        loadStats()
    }, [isMasterAdmin])

    useEffect(() => {
        if (!isMasterAdmin) return
        loadLogs()
    }, [isMasterAdmin, searchQuery, categoryFilter, actionFilter, severityFilter, userFilter, storeFilter, dateRange, currentPage, pageSize])

    const getHeaders = () => {
        const token = localStorage.getItem('storetrack_token')
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
    }

    const loadFilters = async () => {
        try {
            const response = await fetch(`${API_URL}/logs/filters`, { headers: getHeaders() })
            if (response.ok) {
                const data = await response.json()
                setFilters(data)
            }
        } catch (error) {
            console.error('Failed to load filters:', error)
        }
    }

    const loadStats = async () => {
        try {
            const response = await fetch(`${API_URL}/logs/stats`, { headers: getHeaders() })
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (error) {
            console.error('Failed to load stats:', error)
        }
    }

    const loadLogs = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: pageSize,
                ...(searchQuery && { search: searchQuery }),
                ...(categoryFilter && { category: categoryFilter }),
                ...(actionFilter && { action: actionFilter }),
                ...(severityFilter && { severity: severityFilter }),
                ...(userFilter && { userId: userFilter }),
                ...(storeFilter && { storeId: storeFilter }),
                ...(dateRange.start && { startDate: dateRange.start }),
                ...(dateRange.end && { endDate: dateRange.end })
            })

            const response = await fetch(`${API_URL}/logs?${params}`, { headers: getHeaders() })
            if (response.ok) {
                const data = await response.json()
                setLogs(data.logs)
                setTotalPages(data.pagination.pages)
                setTotalLogs(data.pagination.total)
            }
        } catch (error) {
            console.error('Failed to load logs:', error)
            toast.error('Failed to load activity logs')
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async (format) => {
        setExporting(true)
        try {
            const params = new URLSearchParams({
                format,
                ...(dateRange.start && { startDate: dateRange.start }),
                ...(dateRange.end && { endDate: dateRange.end }),
                ...(categoryFilter && { category: categoryFilter }),
                ...(actionFilter && { action: actionFilter }),
                ...(severityFilter && { severity: severityFilter }),
                ...(userFilter && { userId: userFilter }),
                ...(storeFilter && { storeId: storeFilter })
            })

            const response = await fetch(`${API_URL}/logs/export?${params}`, {
                headers: getHeaders()
            })

            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `activity-logs.${format}`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
                toast.success('Export completed successfully')
            } else {
                toast.error('Export failed')
            }
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Export failed')
        } finally {
            setExporting(false)
        }
    }

    const clearFilters = () => {
        setSearchQuery('')
        setCategoryFilter('')
        setActionFilter('')
        setSeverityFilter('')
        setUserFilter('')
        setStoreFilter('')
        setDateRange({ start: '', end: '' })
        setCurrentPage(1)
    }

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`

        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const getActionDescription = (log) => {
        const actionMap = {
            'login': 'logged in',
            'logout': 'logged out',
            'create_user': 'created a user',
            'edit_user': 'edited user',
            'delete_user': 'deleted user',
            'create_store': 'created a store',
            'edit_store': 'edited store',
            'add_item': 'added an item',
            'edit_item': 'edited item',
            'delete_item': 'deleted item',
            'quantity_change': 'changed item quantity',
            'view_dashboard': 'viewed dashboard',
            'export_data': 'exported data',
            'search_performed': 'performed search'
        }

        return actionMap[log.action] || log.action.replace(/_/g, ' ')
    }

    if (!user) {
        return null
    }

    if (!isMasterAdmin) {
        return (
            <div className="mx-auto mt-20 max-w-3xl rounded-3xl border border-destructive/20 bg-destructive/5 p-12 text-center shadow-lg">
                <Shield className="mx-auto mb-6 h-12 w-12 text-destructive" />
                <h2 className="text-3xl font-bold text-destructive">Access Restricted</h2>
                <p className="mt-3 text-muted-foreground">Activity logs are only accessible to Master Administrators.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-muted-foreground">
                    <Activity className="h-4 w-4 text-primary" />
                    System Activity Logs
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Activity Monitoring</h1>
                <p className="max-w-3xl text-base text-muted-foreground">
                    Comprehensive audit trail of all system activities, user actions, and security events across the StoreTrack platform.
                </p>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Last 30 days</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">
                                {stats.categoryBreakdown[0]?.category || 'N/A'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.categoryBreakdown[0]?.count || 0} activities
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.severityBreakdown.find(s => s.severity === 'high')?.count || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">High severity events</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Set(stats.recentActivity.map(a => a.userId)).size}
                            </div>
                            <p className="text-xs text-muted-foreground">Recent activity</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                    <CardTitle>Filters & Search</CardTitle>
                    <CardDescription>Filter activities by various criteria</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search activities..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All categories</SelectItem>
                                    {filters?.categories?.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Action</label>
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All actions</SelectItem>
                                    {filters?.actions?.map(action => (
                                        <SelectItem key={action} value={action}>
                                            {action.replace(/_/g, ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Severity</label>
                            <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All severities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All severities</SelectItem>
                                    {filters?.severities?.map(sev => (
                                        <SelectItem key={sev} value={sev}>{sev}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">User</label>
                            <Select value={userFilter} onValueChange={setUserFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All users</SelectItem>
                                    {filters?.users?.map(user => (
                                        <SelectItem key={user._id} value={user._id}>
                                            {user.name} ({user.role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Store</label>
                            <Select value={storeFilter} onValueChange={setStoreFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All stores" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All stores</SelectItem>
                                    {filters?.stores?.map(store => (
                                        <SelectItem key={store._id} value={store._id}>
                                            {store.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex gap-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Start Date</label>
                                <Input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">End Date</label>
                                <Input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button disabled={exporting}>
                                        {exporting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleExport('csv')}>
                                        Export as CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport('json')}>
                                        Export as JSON
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Activity Log Table */}
            <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Activity Log</CardTitle>
                            <CardDescription>
                                {totalLogs.toLocaleString()} total activities • Page {currentPage} of {totalPages}
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={loadLogs} disabled={loading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-16 text-center">
                                            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
                                            <p className="mt-2 text-sm text-muted-foreground">Loading activities...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-16 text-center">
                                            <Activity className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                            <p className="mt-2 text-sm text-muted-foreground">No activities found</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => {
                                        const severity = severityConfig[log.severity] || severityConfig.low
                                        const category = categoryConfig[log.category] || categoryConfig.general
                                        const SeverityIcon = severity.icon
                                        const CategoryIcon = category.icon

                                        return (
                                            <TableRow key={log._id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{formatTimestamp(log.timestamp)}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(log.timestamp).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{log.user?.name || 'Unknown'}</span>
                                                        <span className="text-xs text-muted-foreground capitalize">
                                                            {log.user?.role || 'Unknown'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">{getActionDescription(log)}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={category.color}>
                                                        <CategoryIcon className="mr-1 h-3 w-3" />
                                                        {log.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={severity.color}>
                                                        <SeverityIcon className="mr-1 h-3 w-3" />
                                                        {log.severity}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-xs truncate" title={log.details}>
                                                        {log.details || 'No details'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Activity Details</DialogTitle>
                                                                <DialogDescription>
                                                                    Detailed information about this activity
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="text-sm font-medium">Timestamp</label>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {new Date(log.timestamp).toLocaleString()}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-sm font-medium">User</label>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {log.user?.name} ({log.user?.email})
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-sm font-medium">Action</label>
                                                                        <p className="text-sm text-muted-foreground capitalize">
                                                                            {log.action.replace(/_/g, ' ')}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-sm font-medium">Category</label>
                                                                        <p className="text-sm text-muted-foreground capitalize">
                                                                            {log.category}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {log.details && (
                                                                    <div>
                                                                        <label className="text-sm font-medium">Details</label>
                                                                        <p className="text-sm text-muted-foreground mt-1">
                                                                            {log.details}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {log.store && (
                                                                    <div>
                                                                        <label className="text-sm font-medium">Store</label>
                                                                        <p className="text-sm text-muted-foreground mt-1">
                                                                            {log.store.name}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {log.item && (
                                                                    <div>
                                                                        <label className="text-sm font-medium">Item</label>
                                                                        <p className="text-sm text-muted-foreground mt-1">
                                                                            {log.item.name}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {log.ipAddress && (
                                                                    <div>
                                                                        <label className="text-sm font-medium">IP Address</label>
                                                                        <p className="text-sm text-muted-foreground mt-1">
                                                                            {log.ipAddress}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Rows per page:</span>
                                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                                    <SelectTrigger className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default ActivityLogs