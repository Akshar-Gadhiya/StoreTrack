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
        <div className={`group flex items-center justify-between p-6 rounded-2xl border transition-all duration-500 ${value ? 'border-primary/20 bg-primary/[0.03] shadow-lg shadow-primary/5' : 'border-border bg-card/50 opacity-60 hover:opacity-100'}`}>
            <div className="flex items-center gap-5">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${value ? 'bg-primary text-primary-foreground scale-110 shadow-primary/20' : 'bg-secondary text-muted-foreground'}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-base font-black tracking-tight text-foreground">{label}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{description}</span>
                </div>
            </div>
            <button
                onClick={onChange}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-500 focus:outline-none ring-4 ring-transparent focus:ring-primary/10 ${value ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-muted-foreground/20'}`}
            >
                <div
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-500 shadow-md ${value ? 'translate-x-[26px]' : 'translate-x-1'}`}
                />
            </button>
        </div>
    )

    return (
        <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Administrative Console</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-foreground">Policies & Access</h1>
                    <p className="text-muted-foreground text-xl font-medium max-w-2xl leading-relaxed">
                        Define granular operational privileges, security protocols, and system-wide clearance for all personnel.
                    </p>
                </div>
            </div>

            {/* Stats/Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 rounded-[2rem] border border-border bg-card shadow-2xl shadow-black/[0.02] flex items-center gap-6 group hover:border-primary/20 transition-all duration-500">
                    <div className="h-16 w-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">System Roles</p>
                        <h4 className="text-3xl font-black tracking-tighter">3 Primary</h4>
                    </div>
                </div>
                <div className="p-8 rounded-[2rem] border border-border bg-card shadow-2xl shadow-black/[0.02] flex items-center gap-6 group hover:border-purple-500/20 transition-all duration-500">
                    <div className="h-16 w-16 bg-purple-500/10 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Lock className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Active Policies</p>
                        <h4 className="text-3xl font-black tracking-tighter">4 Toggles</h4>
                    </div>
                </div>
                <div className="p-8 rounded-[2rem] border border-border bg-card shadow-2xl shadow-black/[0.02] flex items-center gap-6 group hover:border-blue-500/20 transition-all duration-500">
                    <div className="h-16 w-16 bg-blue-500/10 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <UserCheck className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Managed Entities</p>
                        <h4 className="text-3xl font-black tracking-tighter">{users.length} Units</h4>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col xl:flex-row gap-6">
                <div className="relative flex-1 group max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all group-focus-within:scale-110" />
                    <input
                        type="text"
                        placeholder="Filter registry by name or entity identifier..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 bg-card border border-border rounded-2xl pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all shadow-sm hover:border-primary/20"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-[2.5rem] border border-border bg-card shadow-2xl shadow-black/[0.03] overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Entity Profile</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Hierarchy Rank</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Capability Matrix</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 text-right">Utility</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                                            <span className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em]">Synchronizing Directory...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="h-20 w-20 bg-secondary/50 flex items-center justify-center rounded-[2rem]">
                                                <Users className="h-10 w-10 text-muted-foreground/40" />
                                            </div>
                                            <p className="text-muted-foreground text-lg font-medium">No personnel records identified in this sweep.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u._id} className="group hover:bg-muted/40 transition-all border-b border-border/50">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="h-12 w-12 bg-secondary rounded-2xl flex items-center justify-center font-black text-lg italic border border-border/50 group-hover:scale-110 transition-transform duration-500">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-base font-black tracking-tight text-foreground group-hover:text-primary transition-colors">{u.name}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{u.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${u.role === 'manager' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                                }`}>
                                                {u.role === 'manager' ? 'Area Manager' : 'Fleet Personnel'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-2">
                                                <div className={`p-2 rounded-xl border transition-all ${u.permissions?.canEditInventory ? 'border-primary/20 bg-primary/5 text-primary shadow-sm shadow-primary/10' : 'border-border bg-secondary/30 text-muted-foreground/20'}`} title="Modify Inventory">
                                                    <Edit className="h-4 w-4" />
                                                </div>
                                                <div className={`p-2 rounded-xl border transition-all ${u.permissions?.canDeleteItems ? 'border-destructive/20 bg-destructive/5 text-destructive shadow-sm shadow-destructive/10' : 'border-border bg-secondary/30 text-muted-foreground/20'}`} title="Terminate Records">
                                                    <Trash2 className="h-4 w-4" />
                                                </div>
                                                <div className={`p-2 rounded-xl border transition-all ${u.permissions?.canViewReports ? 'border-blue-500/20 bg-blue-500/5 text-blue-500 shadow-sm shadow-blue-500/10' : 'border-border bg-secondary/30 text-muted-foreground/20'}`} title="Oversight Reports">
                                                    <PieChart className="h-4 w-4" />
                                                </div>
                                                <div className={`p-2 rounded-xl border transition-all ${u.permissions?.canManageTeam ? 'border-purple-500/20 bg-purple-500/5 text-purple-500 shadow-sm shadow-purple-500/10' : 'border-border bg-secondary/30 text-muted-foreground/20'}`} title="Personnel Management">
                                                    <Users className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleOpenModal(u)}
                                                className="h-11 inline-flex items-center gap-3 rounded-xl bg-primary px-6 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all group"
                                            >
                                                <Lock className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
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
