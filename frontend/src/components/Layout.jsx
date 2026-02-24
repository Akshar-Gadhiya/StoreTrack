import { useState, useEffect } from 'react'
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import {
    LayoutDashboard,
    Store,
    Package,
    Users,
    QrCode,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    ChevronRight,
    Settings,
    CircleUser,
    PanelLeft
} from 'lucide-react'

const Layout = () => {
    const { user, logout } = useAuth()
    const { stores, currentStore, selectStore } = useStore()
    const location = useLocation()
    const navigate = useNavigate()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Auto-collapse sidebar on smaller screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false)
            } else {
                setIsSidebarOpen(true)
            }
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Stores', href: '/stores', icon: Store },
        { name: 'Items', href: '/items', icon: Package },
        { name: 'Employees', href: '/employees', icon: Users },
        { name: 'QR Scanner', href: '/scanner', icon: QrCode },
    ].filter(item => {
        if (user?.role === 'employee' && (item.name === 'Stores' || item.name === 'Employees')) {
            return false
        }
        return true
    })

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const NavItem = ({ item, isMobile = false }) => {
        const isActive = location.pathname === item.href
        return (
            <Link
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group ${isActive
                    ? 'bg-secondary text-secondary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                    }`}
                onClick={() => isMobile && setIsMobileMenuOpen(false)}
            >
                <item.icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                <span className={`text-sm font-medium ${!isSidebarOpen && !isMobile ? 'hidden' : 'block'}`}>
                    {item.name}
                </span>
            </Link>
        )
    }

    return (
        <div className="h-screen overflow-hidden bg-background flex text-foreground">
            {/* Sidebar for Desktop */}
            <aside
                className={`hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-[70px]'
                    }`}
            >
                <div className="h-14 flex items-center px-4 border-b border-border">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
                            <Package className="h-5 w-5 text-primary-foreground" />
                        </div>
                        {isSidebarOpen && (
                            <span className="font-bold text-lg tracking-tight truncate">StoreTrack</span>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
                    <div className="space-y-1">
                        {isSidebarOpen && (
                            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Main Menu</p>
                        )}
                        {navigation.map((item) => (
                            <NavItem key={item.name} item={item} />
                        ))}
                    </div>

                    <div className="space-y-1">
                        {isSidebarOpen && (
                            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">System</p>
                        )}
                        <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-muted-foreground hover:bg-secondary/50 hover:text-foreground`}>
                            <Settings className="h-4 w-4" />
                            <span className={`text-sm font-medium ${!isSidebarOpen ? 'hidden' : 'block'}`}>Settings</span>
                        </button>
                    </div>
                </div>

                <div className="p-3 border-t border-border mt-auto">
                    <div className={`flex items-center gap-3 p-2 rounded-lg bg-muted/30 ${!isSidebarOpen ? 'flex-col' : ''}`}>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <CircleUser className="h-5 w-5 text-primary" />
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-semibold truncate">{user?.name || user?.email?.split('@')[0]}</p>
                                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                                {user?.storeName && (
                                    <p className="text-xs text-primary truncate">{user?.storeName}</p>
                                )}
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className={`text-muted-foreground hover:text-destructive transition-colors shrink-0 ${!isSidebarOpen ? 'pb-1' : ''}`}
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar (Sheet) */}
            <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                <aside className={`absolute top-0 left-0 bottom-0 w-[280px] bg-card border-r border-border transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="h-14 flex items-center justify-between px-4 border-b border-border">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center">
                                <Package className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">StoreTrack</span>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(false)}>
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>
                    <div className="flex flex-col h-[calc(100%-3.5rem)] py-4 px-3">
                        <div className="space-y-1">
                            {navigation.map((item) => (
                                <NavItem key={item.name} item={item} isMobile={true} />
                            ))}
                        </div>
                        <div className="mt-auto pt-4 border-t border-border flex items-center gap-3 p-2">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <CircleUser className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-semibold truncate">{user?.name || user?.email}</p>
                                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                            </div>
                            <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0">
                <header className="h-14 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40 flex items-center px-4 md:px-6 justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-muted-foreground"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="hidden lg:flex p-2 -ml-2 text-muted-foreground hover:bg-secondary rounded-md"
                        >
                            <PanelLeft className="h-5 w-5" />
                        </button>
                        <nav className="flex items-center gap-2 text-sm font-medium text-muted-foreground overflow-hidden">
                            <Link to="/dashboard" className="hover:text-foreground whitespace-nowrap">Dashboard</Link>
                            <ChevronRight className="h-4 w-4 shrink-0" />
                            <span className="text-foreground font-semibold truncate">
                                {location.pathname.split('/').pop().charAt(0).toUpperCase() + location.pathname.split('/').pop().slice(1)}
                            </span>
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex relative group">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                            />
                        </div>
                        <button className="p-2 text-muted-foreground hover:bg-secondary rounded-md relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-background"></span>
                        </button>
                        {user?.role === 'owner' ? (
                            <div className="hidden sm:flex gap-2 ml-2">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <Store className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <select
                                        value={currentStore?._id || ''}
                                        onChange={(e) => {
                                            const store = stores.find(s => s._id === e.target.value)
                                            selectStore(store)
                                            toast.success(`Switched to ${store.name}`)
                                        }}
                                        className="h-9 w-24 pl-9 pr-8 rounded-full border border-border bg-muted/50 text-xs font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 cursor-pointer transition-all hover:bg-muted/80 text-ellipsis overflow-hidden"
                                    >
                                        <option value="" disabled>Select Core Node</option>
                                        {stores.map((store) => (
                                            <option key={store._id} value={store._id}>
                                                {store.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                        <ChevronRight className="h-3 w-3 text-muted-foreground rotate-90" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 ml-2 shadow-sm">
                                <Store className="h-4 w-4 text-primary" />
                                <span className="text-xs font-bold tracking-tight text-foreground/80 truncate max-w-[120px]">
                                    {user?.storeName || currentStore?.name || "Central Hub"}
                                </span>
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Layout
