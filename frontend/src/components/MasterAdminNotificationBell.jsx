import { useState, useEffect, useRef } from 'react'
import { Bell, AlertTriangle, Package, AlertCircle, Check, Trash2, CheckCheck, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

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

const MasterAdminNotificationBell = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const dropdownRef = useRef(null)

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('storetrack_token')}`,
  })

  useEffect(() => {
    if (!user) return

    loadNotifications()

    // Poll for new notifications every 10 seconds
    const interval = setInterval(loadNotifications, 10000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications?limit=20`, {
        headers: getHeaders(),
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.notifications.filter((n) => !n.read).length)
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
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
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
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
        setUnreadCount(0)
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
      }
    } catch (error) {
      console.error('Failed to dismiss notification:', error)
    }
  }

  const getIcon = (type) => {
    const IconComponent = typeIconMap[type] || AlertCircle
    return <IconComponent className="h-4 w-4" />
  }

  if (!user || user.role !== 'MASTER_ADMIN') {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-muted-foreground hover:bg-muted rounded-xl transition-colors active:scale-95"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-5 w-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-background shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div>
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <p className="text-xs text-muted-foreground">
                {unreadCount} unread • {notifications.length} total
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={markingAll}
                className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                title="Mark all as read"
              >
                {markingAll ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCheck className="h-3 w-3" />
                )}
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-muted/30">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Bell className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  System alerts and updates will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => {
                  const severity = severityConfig[notification.severity] || severityConfig.low
                  return (
                    <div
                      key={notification._id}
                      className={`px-4 py-3 transition-colors hover:bg-muted/50 ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div
                          className={`mt-1 shrink-0 p-2 rounded-lg ${severity.bg} ${severity.text}`}
                        >
                          {getIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-foreground">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              {notification.description && (
                                <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">
                                  {notification.description}
                                </p>
                              )}
                              <p className="text-[10px] text-muted-foreground/60 mt-2">
                                {new Date(notification.createdAt).toLocaleString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification._id)}
                                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => dismissNotification(notification._id)}
                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                title="Dismiss"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Severity Badge */}
                          {notification.severity && (
                            <div className="flex gap-2 mt-2">
                              <span
                                className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full ${severity.bg} ${severity.text} border ${severity.border}`}
                              >
                                {notification.severity.charAt(0).toUpperCase() +
                                  notification.severity.slice(1)}
                              </span>
                              <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-full bg-muted text-muted-foreground border border-border">
                                {notification.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-border bg-muted/20">
              <button
                onClick={() => {
                  setIsOpen(false)
                  // Navigate to notifications page if needed
                }}
                className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MasterAdminNotificationBell
