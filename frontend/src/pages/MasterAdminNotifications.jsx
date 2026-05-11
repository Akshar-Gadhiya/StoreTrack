import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import {
    Bell,
    AlertTriangle,
    Package,
    AlertCircle,
    Check,
    Trash2,
    CheckCheck,
    Filter,
    Loader2,
    RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select'

const API_URL = 'http://localhost:5000/api'

const severityConfig = {
    low: { bg: 'bg-blue-500/10', text: 'text-blue-700', border: 'border-blue-500/20' },
    medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-700', border: 'border-yellow-500/20' },
    high: { bg: 'bg-orange-500/10', text: 'text-orange-700', border: 'border-orange-500/20' },
    critical: { bg: 'bg-red-500/10', text: 'text-red-700', border: 'border-red-500/20' },
}

const typeIconMap = {
    LOW_STOCK: Package,
    OUT_OF_STOCK: AlertTriangle,
    SECURITY_ALERT: AlertTriangle,
    SYSTEM_ALERT: AlertCircle,
    USER_ACTION: AlertCircle,
    STORE_UPDATE: AlertCircle,
    ADMIN_NOTICE: AlertCircle,
    INVENTORY_CHANGE: Package,
}

const NotificationsPage = () => {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(false)
    const [markingAll, setMarkingAll] = useState(false)
    const [typeFilter, setTypeFilter] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [severityFilter, setSeverityFilter] = useState('')
    const [unreadOnly, setUnreadOnly] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [stats, setStats] = useState({
        total: 0,
        unread: 0,
        critical: 0,
    })

    const getHeaders = () => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('storetrack_token')}`,
    })

    useEffect(() => {
        loadNotifications()
    }, [typeFilter, categoryFilter, severityFilter, unreadOnly, page])

    const loadNotifications = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page,
                limit: 15,
                ...(typeFilter && { type: typeFilter }),
                ...(categoryFilter && { category: categoryFilter }),
                ...(unreadOnly && { unreadOnly: 'true' }),
            })

            const response = await fetch(`${API_URL}/notifications?${params}`, {
                headers: getHeaders(),
            })
            if (response.ok) {
                const data = await response.json()
                setNotifications(data.notifications)
                setTotalPages(data.pagination.pages)

                // Calculate stats
                const unreadCount = data.notifications.filter((n) => !n.read).length
                const criticalCount = data.notifications.filter(
                    (n) => n.severity === 'critical'
                ).length
                setStats({
                    total: data.pagination.total,
                    unread: unreadCount,
                    critical: criticalCount,
                })
            }
        } catch (error) {
            console.error('Failed to load notifications:', error)
            toast.error('Failed to load notifications')
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: getHeaders(),
            })
            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
                )
                setStats((prev) => ({
                    ...prev,
                    unread: Math.max(0, prev.unread - 1),
                }))
                toast.success('Marked as read')
            }
        } catch (error) {
            console.error('Failed to mark as read:', error)
            toast.error('Failed to mark as read')
        }
    }

    const markAllAsRead = async () => {
        setMarkingAll(true)
        try {
            const response = await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PUT',
                headers: getHeaders(),
            })
            if (response.ok) {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                setStats((prev) => ({
                    ...prev,
                    unread: 0,
                }))
                toast.success('All notifications marked as read')
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error)
            toast.error('Failed to mark all as read')
        } finally {
            setMarkingAll(false)
        }
    }

    const dismissNotification = async (notificationId) => {
        try {
            const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: getHeaders(),
            })
            if (response.ok) {
                setNotifications((prev) => prev.filter((n) => n._id !== notificationId))
                setStats((prev) => ({
                    ...prev,
                    total: prev.total - 1,
                }))
                toast.success('Notification dismissed')
            }
        } catch (error) {
            console.error('Failed to dismiss notification:', error)
            toast.error('Failed to dismiss notification')
        }
    }

    const getIcon = (type) => {
        const IconComponent = typeIconMap[type] || AlertCircle
        return <IconComponent className="h-5 w-5" />
    }

    if (!user || user.role !== 'MASTER_ADMIN') {
        return (
            <div className="mx-auto mt-20 max-w-3xl rounded-3xl border border-destructive/20 bg-destructive/5 p-12 text-center shadow-lg">
                <Bell className="mx-auto mb-6 h-12 w-12 text-destructive" />
                <h2 className="text-3xl font-bold text-destructive">Access Restricted</h2>
                <p className="mt-3 text-muted-foreground">
                    Notifications are only accessible to Master Administrators.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-muted-foreground">
                    <Bell className="h-4 w-4 text-primary" />
                    System Notifications
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    Notification Center
                </h1>
                <p className="max-w-3xl text-base text-muted-foreground">
                    View and manage all system alerts, security events, and system notifications.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">All notifications</p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unread</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
                        <p className="text-xs text-muted-foreground">Awaiting action</p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
                        <p className="text-xs text-muted-foreground">Require immediate action</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Actions */}
            <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                    <CardDescription>Filter notifications by type, category, and severity</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All types</SelectItem>
                                    <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                                    <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                                    <SelectItem value="SECURITY_ALERT">Security Alert</SelectItem>
                                    <SelectItem value="SYSTEM_ALERT">System Alert</SelectItem>
                                    <SelectItem value="USER_ACTION">User Action</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All categories</SelectItem>
                                    <SelectItem value="inventory">Inventory</SelectItem>
                                    <SelectItem value="security">Security</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="store">Store</SelectItem>
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
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <button
                                onClick={() => setUnreadOnly(!unreadOnly)}
                                className={`w-full px-3 py-2 text-sm rounded-xl border transition-colors ${
                                    unreadOnly
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background border-border hover:bg-muted'
                                }`}
                            >
                                {unreadOnly ? 'Unread Only' : 'All Notifications'}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setTypeFilter('')
                                setCategoryFilter('')
                                setSeverityFilter('')
                                setUnreadOnly(false)
                                setPage(1)
                            }}
                        >
                            Clear Filters
                        </Button>
                        {stats.unread > 0 && (
                            <Button onClick={markAllAsRead} disabled={markingAll}>
                                {markingAll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <CheckCheck className="mr-2 h-4 w-4" />
                                Mark All as Read
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={loadNotifications}
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications List */}
            <Card className="border-border bg-card shadow-sm">
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                        {notifications.length === 0
                            ? 'No notifications'
                            : `Showing ${notifications.length} of ${stats.total}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">No notifications found</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                                Try adjusting your filters
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notification) => {
                                const severity = severityConfig[notification.severity] || severityConfig.low
                                return (
                                    <div
                                        key={notification._id}
                                        className={`flex gap-4 rounded-2xl border transition-colors p-4 ${
                                            !notification.read
                                                ? `bg-primary/5 border-primary/20`
                                                : 'bg-muted/20 border-border hover:bg-muted/40'
                                        }`}
                                    >
                                        {/* Icon */}
                                        <div
                                            className={`mt-1 shrink-0 p-3 rounded-lg ${severity.bg} ${severity.text}`}
                                        >
                                            {getIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {notification.message}
                                                    </p>
                                                    {notification.description && (
                                                        <p className="text-xs text-muted-foreground/70 mt-1">
                                                            {notification.description}
                                                        </p>
                                                    )}
                                                    <div className="flex gap-2 mt-3 flex-wrap">
                                                        <Badge variant="secondary" className={severity.bg + ' ' + severity.text}>
                                                            {notification.severity}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {notification.category}
                                                        </Badge>
                                                        {notification.type && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {notification.type.replace(/_/g, ' ')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground/60 mt-3">
                                                        {new Date(notification.createdAt).toLocaleString()}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() =>
                                                                markAsRead(notification._id)
                                                            }
                                                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() =>
                                                            dismissNotification(notification._id)
                                                        }
                                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                        title="Dismiss"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default NotificationsPage
