import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import {
    Shield,
    Users,
    Search,
    Check,
    X,
    Loader2,
    Lock,
    Eye,
    Edit,
    Trash2,
    PieChart,
    UserCheck,
    ShieldAlert,
    Save,
    ChevronRight
} from 'lucide-react'

const API_URL = 'http://localhost:5000/api'

const Permissions = () => {
    const { user } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUser, setSelectedUser] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [tempPermissions, setTempPermissions] = useState({})

    // Only owners can access this page
    if (user?.role !== 'owner') {
        return (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-12 flex flex-col items-center text-center max-w-2xl mx-auto mt-20 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-destructive/10 p-4 rounded-full mb-6">
                    <ShieldAlert className="h-10 w-10 text-destructive" />
                </div>
                <h3 className="text-2xl font-bold text-destructive">Administrative Lockdown</h3>
                <p className="text-muted-foreground mt-4 leading-relaxed text-lg max-w-md">
                    This secure terminal is reserved for the System Owner. Unauthorized attempts to modify role permissions are logged.
                </p>
            </div>
        )
    }

    const getHeaders = () => {
        const token = localStorage.getItem('storetrack_token')
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${API_URL}/users`, {
                headers: getHeaders()
            })
            const data = await response.json()
            if (response.ok) {
                setUsers(data)
            } else {
                toast.error('Failed to load personnel database')
            }
        } catch (err) {
            toast.error('Security server link unavailable')
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (userToEdit) => {
        setSelectedUser(userToEdit)
        setTempPermissions({
            canEditInventory: userToEdit.permissions?.canEditInventory || false,
            canDeleteItems: userToEdit.permissions?.canDeleteItems || false,
            canViewReports: userToEdit.permissions?.canViewReports || false,
            canManageTeam: userToEdit.permissions?.canManageTeam || false,
        })
        setShowModal(true)
    }

    const handleTogglePermission = (key) => {
        setTempPermissions(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const handleSavePermissions = async () => {
        setUpdating(true)
        try {
            const response = await fetch(`${API_URL}/users/${selectedUser._id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({
                    permissions: tempPermissions
                })
            })

            if (response.ok) {
                toast.success('Access policy updated')
                setShowModal(false)
                loadUsers()
            } else {
                const data = await response.json()
                toast.error(data.message || 'Policy update failed')
            }
        } catch (err) {
            toast.error('Encryption protocol error')
        } finally {
            setUpdating(false)
        }
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const PermissionToggle = ({ label, description, icon: Icon, value, onChange }) => (
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50 hover:bg-card transition-all group">
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-lg ${value ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'} transition-colors group-hover:scale-110 duration-300`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-tight text-foreground">{label}</span>
                    <span className="text-xs text-muted-foreground">{description}</span>
                </div>
            </div>
            <button
                onClick={onChange}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-transparent focus:ring-primary/20 ${value ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`}
                />
            </button>
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-4xl font-extrabold tracking-tight">Team & Access</h1>
                <p className="text-muted-foreground text-lg underline decoration-primary/10 underline-offset-8">Configure granular operational privileges for personnel.</p>
            </div>

            {/* Stats/Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card bg-primary/5 hover:bg-primary/10 transition-colors cursor-default">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/20 rounded-xl">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">System Roles</p>
                            <h4 className="text-2xl font-black">3 Levels</h4>
                        </div>
                    </div>
                </div>
                <div className="glass-card bg-purple-500/5 hover:bg-purple-500/10 transition-colors cursor-default">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                            <Lock className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active Toggles</p>
                            <h4 className="text-2xl font-black">4 Policies</h4>
                        </div>
                    </div>
                </div>
                <div className="glass-card bg-blue-500/5 hover:bg-blue-500/10 transition-colors cursor-default">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <UserCheck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Managed Personnel</p>
                            <h4 className="text-2xl font-black">{users.length} Users</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Filter team by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                />
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-black/[0.03] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User Entity</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">System Designation</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Stock Control</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Access Terminal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center">
                                        <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
                                        <span className="text-muted-foreground font-medium italic">Scanning personnel directory...</span>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center">
                                        <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                                        <p className="text-muted-foreground">No personnel records found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u._id} className="group hover:bg-muted/20 transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 bg-secondary rounded-lg flex items-center justify-center font-bold text-sm border border-border">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold tracking-tight text-foreground">{u.name}</span>
                                                    <span className="text-xs text-muted-foreground font-mono">{u.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === 'manager' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1.5">
                                                <div className={`p-1 rounded-md border ${u.permissions?.canEditInventory ? 'border-primary/20 bg-primary/5 text-primary' : 'border-border bg-muted text-muted-foreground/30'}`} title="Can Edit">
                                                    <Edit className="h-3.5 w-3.5" />
                                                </div>
                                                <div className={`p-1 rounded-md border ${u.permissions?.canDeleteItems ? 'border-destructive/20 bg-destructive/5 text-destructive' : 'border-border bg-muted text-muted-foreground/30'}`} title="Can Delete">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </div>
                                                <div className={`p-1 rounded-md border ${u.permissions?.canViewReports ? 'border-blue-500/20 bg-blue-500/5 text-blue-500' : 'border-border bg-muted text-muted-foreground/30'}`} title="Can View Reports">
                                                    <PieChart className="h-3.5 w-3.5" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleOpenModal(u)}
                                                className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-xs font-bold text-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-sm active:scale-95"
                                            >
                                                <Lock className="h-3.5 w-3.5" />
                                                Manage Access
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Permissions Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-0 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-border bg-muted/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-2xl font-black tracking-tight">{selectedUser.name}</h3>
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Access Protocol Modification</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-4">
                            <PermissionToggle
                                label="Edit Inventory"
                                description="Modify SKU details and stock levels"
                                icon={Edit}
                                value={tempPermissions.canEditInventory}
                                onChange={() => handleTogglePermission('canEditInventory')}
                            />
                            <PermissionToggle
                                label="Destructive Operations"
                                description="Permanently delete items from registry"
                                icon={Trash2}
                                value={tempPermissions.canDeleteItems}
                                onChange={() => handleTogglePermission('canDeleteItems')}
                            />
                            <PermissionToggle
                                label="Analytical Reports"
                                description="View advanced performance metrics"
                                icon={PieChart}
                                value={tempPermissions.canViewReports}
                                onChange={() => handleTogglePermission('canViewReports')}
                            />
                            <PermissionToggle
                                label="Team Management"
                                description="Manage subordinate user accounts"
                                icon={Users}
                                value={tempPermissions.canManageTeam}
                                onChange={() => handleTogglePermission('canManageTeam')}
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 pt-0 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 rounded-2xl bg-secondary py-4 text-sm font-black tracking-tight hover:bg-muted transition-colors"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSavePermissions}
                                disabled={updating}
                                className="flex-[2] rounded-2xl bg-primary py-4 text-sm font-black tracking-tight text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center gap-2"
                            >
                                {updating ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Apply New Policy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Permissions
