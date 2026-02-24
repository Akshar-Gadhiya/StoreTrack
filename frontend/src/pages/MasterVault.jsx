import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import {
    Lock,
    Plus,
    Trash2,
    Edit,
    MapPin,
    Package,
    X,
    Loader2,
    Database,
    Search,
    LayoutGrid,
    Table as TableIcon
} from 'lucide-react'

const API_URL = 'http://localhost:5000/api'

const MasterVault = () => {
    const { user } = useAuth()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'
    const [showModal, setShowModal] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        details: '',
        quantity: 0
    })

    // Strict role check: Owner only (Admin)
    if (user?.role !== 'owner') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="max-w-md w-full glass-card p-12 text-center animate-in zoom-in-95 duration-300 border-destructive/20 bg-destructive/5">
                    <div className="bg-destructive/10 p-4 rounded-full w-fit mx-auto mb-6">
                        <Lock className="h-10 w-10 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-black text-destructive tracking-tight">403: Vault Secured</h2>
                    <p className="text-muted-foreground mt-4 leading-relaxed font-medium">
                        This repository is locked behind high-level encryption. Your clearance level is insufficient for this sector.
                    </p>
                </div>
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
        loadItems()
    }, [])

    const loadItems = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${API_URL}/master-items`, {
                headers: getHeaders()
            })
            const data = await response.json()
            if (response.ok) {
                setItems(data)
            } else {
                toast.error('Vault synchronization failed')
            }
        } catch (err) {
            toast.error('Neural link interrupted')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const method = editingItem ? 'PUT' : 'POST'
            const url = editingItem ? `${API_URL}/master-items/${editingItem._id}` : `${API_URL}/master-items`

            const response = await fetch(url, {
                method,
                headers: getHeaders(),
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                toast.success(editingItem ? 'Protocol updated' : 'Entity initialized')
                setShowModal(false)
                setEditingItem(null)
                resetForm()
                loadItems()
            } else {
                toast.error('System write error')
            }
        } catch (err) {
            toast.error('Communication protocol failed')
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Erase this entity from the Master Vault?')) {
            try {
                const response = await fetch(`${API_URL}/master-items/${id}`, {
                    method: 'DELETE',
                    headers: getHeaders()
                })
                if (response.ok) {
                    toast.success('Entity purged')
                    loadItems()
                }
            } catch (err) {
                toast.error('Purge sequence aborted')
            }
        }
    }

    const handleEdit = (item) => {
        setEditingItem(item)
        setFormData({
            name: item.name,
            location: item.location,
            details: item.details || '',
            quantity: item.quantity || 0
        })
        setShowModal(true)
    }

    const resetForm = () => {
        setFormData({ name: '', location: '', details: '', quantity: 0 })
    }

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-background text-foreground animate-in fade-in duration-1000 pb-20">
            {/* Silent Header */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 group hover:rotate-12 transition-transform duration-500">
                            <Database className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Master Vault</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Restricted Administration Sector</p>
                        </div>
                    </div>
                </div>

                {/* Search & Actions Bar */}
                <div className="flex flex-col xl:flex-row items-center justify-between gap-6 mb-12">
                    <div className="relative group w-full max-w-md">
                        <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search vault entities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-card/50 backdrop-blur-md border border-border rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        {/* View Toggles */}
                        <div className="flex items-center gap-2 bg-card p-1.5 rounded-xl border border-border shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary'}`}
                            >
                                <LayoutGrid className="h-3.5 w-3.5" /> Grid
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary'}`}
                            >
                                <TableIcon className="h-3.5 w-3.5" /> Ledger
                            </button>
                        </div>

                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-px"
                        >
                            <Plus className="h-5 w-5" />
                            Initialize Entity
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                {loading ? (
                    <div className="py-32 flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Decrypting Records...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="py-32 text-center border border-dashed border-border rounded-3xl bg-card/10 backdrop-blur-sm">
                        <div className="bg-secondary p-4 rounded-full w-fit mx-auto mb-4">
                            <Package className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Repository Empty</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredItems.map((item) => (
                            <div key={item._id} className="glass-card p-8 group relative hover:translate-y-[-4px] transition-all duration-500">
                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">{item.name}</h3>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-primary">{item.quantity || 0}</p>
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Units</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">
                                        <MapPin className="h-3.5 w-3.5 text-primary" />
                                        {item.location}
                                    </div>
                                    <div className="h-px w-full bg-border/50" />
                                    <p className="text-sm text-foreground/70 leading-relaxed italic line-clamp-3">{item.details || 'No additional technical data provided.'}</p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-border/30 flex justify-between items-center">
                                    <span className="text-[10px] font-mono text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/[0.02] backdrop-blur-md">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Entity Name</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">Volume</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Coordinate</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Logs</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Utility</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map((item) => (
                                        <tr key={item._id} className="group hover:bg-muted/30 transition-colors border-b border-border">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{item.name}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className="text-sm font-black bg-primary/10 text-primary px-3 py-1 rounded-full">{item.quantity || 0}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                                                    <MapPin className="h-3 w-3 text-primary" />
                                                    {item.location}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <p className="text-xs text-muted-foreground italic truncate">{item.details || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(item)} className="p-2 rounded-md hover:bg-secondary text-muted-foreground transition-all"><Edit className="h-4 w-4" /></button>
                                                    <button onClick={() => handleDelete(item._id)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-all"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Secret Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="w-full max-w-lg glass-card p-0 overflow-hidden shadow-2xl border-primary/20 animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-border bg-muted/30 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase">{editingItem ? 'Protocol Mod' : 'Entity Initialize'}</h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Master Vault Entry</p>
                            </div>
                            <button onClick={() => { setShowModal(false); setEditingItem(null); resetForm(); }} className="p-2 hover:bg-secondary rounded-full transition-colors"><X className="h-6 w-6" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Entity Identity</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Master Unit Name"
                                        className="w-full bg-secondary/50 border border-border rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Spatial Coordinate</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Vault Sector / Rack"
                                        className="w-full bg-secondary/50 border border-border rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Current Volume</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                        placeholder="0"
                                        className="w-full bg-secondary/50 border border-border rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Technical Specifications</label>
                                <textarea
                                    value={formData.details}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                    placeholder="Detailed logs..."
                                    rows="4"
                                    className="w-full bg-secondary/50 border border-border rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium resize-none"
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => { setShowModal(false); setEditingItem(null); resetForm(); }} className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-secondary hover:bg-secondary/70 rounded-2xl transition-all">Abort</button>
                                <button type="submit" className="flex-[2] py-4 text-xs font-black uppercase tracking-widest bg-foreground text-background hover:scale-[1.02] active:scale-100 rounded-2xl transition-all shadow-xl">Commit Entity</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MasterVault
