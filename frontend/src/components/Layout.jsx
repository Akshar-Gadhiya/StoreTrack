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
    PanelLeft,
    Shield
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
        { name: 'Permissions', href: '/permissions', icon: Shield },
        { name: 'QR Scanner', href: '/scanner', icon: QrCode },
    ].filter(item => {
        if (item.name === 'Permissions') return user?.role === 'owner'
        if (user?.role === 'employee') {
            return !['Stores', 'Employees', 'Permissions'].includes(item.name)
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
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                onClick={() => isMobile && setIsMobileMenuOpen(false)}
            >
                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary-foreground' : 'group-hover:text-foreground transition-colors'}`} />
                <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${!isSidebarOpen && !isMobile ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    {item.name}
                </span>
            </Link>
        )
    }

    return (
        <div className="h-screen overflow-hidden bg-background flex text-foreground font-sans">
            {/* Sidebar for Desktop */}
            <aside
                className={`hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out relative ${isSidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-primary h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                            <Package className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className={`font-bold text-xl tracking-tight transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                            StoreTrack
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6 scrollbar-hide">
                    <div className="space-y-1">
                        <p className={`px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2 transition-opacity duration-300 ${!isSidebarOpen ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                            Overview
                        </p>
                        {navigation.map((item) => (
                            <NavItem key={item.name} item={item} />
                        ))}
                    </div>

                    <div className="space-y-1">
                        <p className={`px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2 transition-opacity duration-300 ${!isSidebarOpen ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                            Tools & Settings
                        </p>
                        <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground group`}>
                            <Settings className="h-4 w-4 shrink-0 group-hover:text-foreground transition-colors" />
                            <span className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${!isSidebarOpen ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                                Settings
                            </span>
                        </button>
                    </div>
                </div>

                <div className="p-4 border-t border-border mt-auto">
                    <div className={`flex items-center gap-3 p-2 rounded-xl transition-all duration-300 ${isSidebarOpen ? 'bg-muted/50' : 'bg-transparent'}`}>
                        <div className="h-10 w-10 rounded-full border-2 border-primary/10 bg-primary/5 flex items-center justify-center shrink-0">
                            <CircleUser className="h-6 w-6 text-primary" />
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold truncate leading-none mb-1">{user?.name || user?.email?.split('@')[0]}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{user?.role}</p>
                            </div>
                        )}
                        {isSidebarOpen && (
                            <button
                                onClick={handleLogout}
                                className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10"
                                title="Logout"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    {!isSidebarOpen && (
                        <button
                            onClick={handleLogout}
                            className="w-full mt-2 flex justify-center text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-destructive/10"
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </aside>

            {/* Mobile Sidebar (Sheet) */}
            <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                <aside className={`absolute top-0 left-0 bottom-0 w-[280px] bg-card border-r border-border transition-transform duration-300 ease-in-out shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary h-9 w-9 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <Package className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">StoreTrack</span>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>
                    <div className="flex flex-col h-[calc(100%-4rem)] py-6 px-4">
                        <div className="space-y-1">
                            {navigation.map((item) => (
                                <NavItem key={item.name} item={item} isMobile={true} />
                            ))}
                        </div>
                        <div className="mt-auto pt-6 border-t border-border flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/5">
                                <CircleUser className="h-7 w-7 text-primary" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold truncate leading-none mb-1">{user?.name || user?.email}</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{user?.role}</p>
                            </div>
                            <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-background">
                <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-40 flex items-center px-4 md:px-8 justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="hidden lg:flex p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                            <PanelLeft className={`h-5 w-5 transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <div className="h-6 w-[1px] bg-border mx-2 hidden md:block"></div>

                        {!location.pathname.includes('master-vault') && (
                            <nav className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
                                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                                <span className="text-foreground font-bold truncate">
                                    {location.pathname.split('/').pop().charAt(0).toUpperCase() + location.pathname.split('/').pop().slice(1)}
                                </span>
                            </nav>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                className="h-10 w-72 rounded-xl border border-border bg-background/50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all group-hover:bg-background"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-muted border border-border rounded text-muted-foreground">⌘</kbd>
                                <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-muted border border-border rounded text-muted-foreground">K</kbd>
                            </div>
                        </div>

                        <button className="p-2.5 text-muted-foreground hover:bg-muted rounded-xl relative transition-all active:scale-95">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full ring-2 ring-card"></span>
                        </button>

                        <div className="h-8 w-[1px] bg-border mx-1 hidden sm:block"></div>

                        {user?.role === 'owner' ? (
                            <div className="hidden sm:flex items-center gap-2 ml-1">
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
                                        className="h-10 min-w-32 pl-9 pr-10 rounded-xl border border-border bg-muted/30 text-xs font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 cursor-pointer transition-all hover:bg-muted/50 text-ellipsis overflow-hidden"
                                    >
                                        <option value="" disabled>Select Store</option>
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
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-muted/30 ml-1 shadow-sm">
                                <Store className="h-4 w-4 text-primary" />
                                <span className="text-xs font-bold tracking-tight text-foreground/80 truncate max-w-[140px]">
                                    {user?.storeName || currentStore?.name || "Central Hub"}
                                </span>
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 bg-muted/10 scroll-smooth">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Layout
