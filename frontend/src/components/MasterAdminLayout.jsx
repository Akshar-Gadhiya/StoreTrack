import { useState } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    Crown,
    LayoutDashboard,
    Users,
    Building2,
    Activity,
    Settings,
    LogOut,
    Menu,
    X,
    ShieldCheck,
    CircleUser,
    BarChart3,
    TrendingUp,
    Bell,
    ChevronDown
} from 'lucide-react'

const MasterAdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sectionOpen, setSectionOpen] = useState({ insights: true, systems: true })
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        logout()
        navigate('/master-admin-login')
    }

    const isActive = (href) => location.pathname === href

    const sectionClass = (active) => active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                </div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <Crown className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-foreground">Master Admin</h1>
                                <p className="text-xs text-muted-foreground">System Control</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 rounded-md hover:bg-muted"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-5 overflow-y-auto">
                        <div className="space-y-3">
                            <div className="px-3 text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground/70">
                                Management
                            </div>
                            {[
                                { name: 'Dashboard', href: '/master-admin', icon: LayoutDashboard },
                                { name: 'Stores', href: '/master-admin/stores', icon: Building2 },
                                { name: 'Owners', href: '/master-admin/owners', icon: Users },
                                { name: 'Users', href: '/master-admin/users', icon: CircleUser },
                                { name: 'Profile', href: '/master-admin/profile', icon: ShieldCheck }
                            ].map((item) => {
                                const active = isActive(item.href)
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${sectionClass(active)}`}
                                    >
                                        <item.icon className={`h-5 w-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span className="truncate">{item.name}</span>
                                    </Link>
                                )
                            })}
                        </div>

                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => setSectionOpen((prev) => ({ ...prev, insights: !prev.insights }))}
                                className="flex w-full items-center justify-between rounded-2xl bg-muted/70 px-3 py-3 text-left text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-muted"
                            >
                                Insights
                                <ChevronDown className={`h-4 w-4 transition-transform ${sectionOpen.insights ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`${sectionOpen.insights ? 'block' : 'hidden'} space-y-2 pl-1`}>
                                {[
                                    { name: 'Reports', href: '/master-admin/reports', icon: BarChart3 },
                                    { name: 'Analytics', href: '/master-admin/analytics', icon: TrendingUp },
                                    { name: 'Activity Logs', href: '/master-admin/logs', icon: Activity }
                                ].map((item) => {
                                    const active = isActive(item.href)
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${sectionClass(active)}`}
                                        >
                                            <item.icon className={`h-5 w-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <span className="truncate">{item.name}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => setSectionOpen((prev) => ({ ...prev, systems: !prev.systems }))}
                                className="flex w-full items-center justify-between rounded-2xl bg-muted/70 px-3 py-3 text-left text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-muted"
                            >
                                System
                                <ChevronDown className={`h-4 w-4 transition-transform ${sectionOpen.systems ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`${sectionOpen.systems ? 'block' : 'hidden'} space-y-2 pl-1`}>
                                {[
                                    { name: 'Notifications', href: '/master-admin/notifications', icon: Bell },
                                    { name: 'System Settings', href: '/master-admin/settings', icon: Settings },
                                    { name: 'Security', href: '/master-admin/security', icon: ShieldCheck }
                                ].map((item) => {
                                    const active = isActive(item.href)
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${sectionClass(active)}`}
                                        >
                                            <item.icon className={`h-5 w-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <span className="truncate">{item.name}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    </nav>

                    {/* User info and logout */}
                    <div className="border-t p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {user?.name || user?.email}
                                </p>
                                <p className="text-xs text-muted-foreground">Master Administrator</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Mobile header */}
                <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b bg-card">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-md hover:bg-muted"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Master Admin</span>
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                {/* Page content */}
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default MasterAdminLayout