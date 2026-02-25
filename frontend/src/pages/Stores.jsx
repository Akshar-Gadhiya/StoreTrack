import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import {
  Plus,
  Store,
  MapPin,
  Pencil,
  Trash2,
  CheckCircle2,
  Phone,
  Mail,
  Calendar,
  MoreVertical,
  X,
  AlertCircle
} from 'lucide-react'

const Stores = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { stores, currentStore, createStore, updateStore, deleteStore, selectStore } = useStore()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingStore, setEditingStore] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  })

  if (user?.role === 'employee') {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 flex flex-col items-center text-center max-w-2xl mx-auto mt-20 animate-in fade-in zoom-in duration-300">
        <div className="p-4 bg-destructive/10 rounded-full mb-6">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h3 className="text-2xl font-black text-destructive tracking-tight">Access Restricted</h3>
        <p className="text-muted-foreground mt-3 leading-relaxed font-medium">
          Limited clearance detected. Store management is restricted to administrative personnel. Please coordinate with your supervisor for node authorization.
        </p>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingStore) {
      await updateStore(editingStore.id, formData)
      setEditingStore(null)
    } else {
      await createStore(formData)
      setShowCreateForm(false)
    }
    setFormData({ name: '', address: '', phone: '', email: '' })
  }

  const handleEdit = (store) => {
    setEditingStore(store)
    setFormData({
      name: store.name,
      address: store.address || '',
      phone: store.phone || '',
      email: store.email || ''
    })
  }

  const handleDelete = async (storeId) => {
    if (window.confirm('Delete this store? All associated data will remain but you won\'t be able to manage it from here.')) {
      await deleteStore(storeId)
    }
  }

  const handleCardClick = (store) => {
    selectStore(store)
    navigate('/items')
  }

  const StoreCard = ({ store }) => (
    <div
      onClick={() => handleCardClick(store)}
      className={`group relative rounded-2xl border p-8 transition-all duration-300 cursor-pointer bg-card card-shadow card-hover ${currentStore?._id === store._id
        ? 'border-primary ring-2 ring-primary/10 shadow-lg shadow-primary/5'
        : 'border-border'
        }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-4 rounded-xl shadow-sm transition-all duration-300 ${currentStore?._id === store._id ? 'bg-primary text-primary-foreground scale-110' : 'bg-secondary text-primary group-hover:bg-primary/10 transition-transform group-hover:scale-105'}`}>
            <Store className="h-7 w-7" />
          </div>
          {user?.role === 'owner' && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
              <button
                onClick={(e) => { e.stopPropagation(); handleEdit(store); }}
                className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all shadow-sm active:scale-95"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(store.id); }}
                className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all shadow-sm active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors leading-tight">{store.name}</h3>
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">Node ID: {store.id || store._id?.slice(-8)}</p>
        </div>

        <div className="mt-8 space-y-4 flex-1">
          {store.address && (
            <div className="flex items-start gap-3 text-sm font-medium text-muted-foreground leading-relaxed">
              <div className="p-1 rounded bg-muted">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <span className="line-clamp-2">{store.address}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-auto">
            {store.phone && (
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/80">
                <Phone className="h-3.5 w-3.5 text-primary/40" />
                {store.phone}
              </div>
            )}
            {store.email && (
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/80">
                <Mail className="h-3.5 w-3.5 text-primary/40" />
                {store.email}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground uppercase font-black tracking-widest bg-muted/50 px-3 py-1.5 rounded-lg">
            <Calendar className="h-3 w-3" />
            {new Date(store.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </div>
          {currentStore?._id === store._id && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.1em] animate-pulse">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Active Node
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Store Network</h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl leading-relaxed">
            Dynamic coordination across your operational fleet. Scale your presence and monitor node performance in real-time.
          </p>
        </div>

        {user?.role === 'owner' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="h-12 inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-8 text-sm font-black text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 group"
          >
            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
            Deploy New Node
          </button>
        )}
      </div>

      {/* Forms Overlay */}
      {(showCreateForm || editingStore) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h3 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  {editingStore ? 'Node Config' : 'Initialize Node'}
                </h3>
                <p className="text-muted-foreground font-medium">Configure operational parameters for the store.</p>
              </div>
              <button
                onClick={() => { setShowCreateForm(false); setEditingStore(null); }}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-muted/50 hover:bg-destructive hover:text-white transition-all text-muted-foreground shadow-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Node Identity</label>
                  <div className="relative group">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      required
                      placeholder="E.g., Flagship Seattle"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-12 rounded-xl border border-border bg-background/50 pl-11 pr-4 text-sm font-bold transition-all focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Geospatial Address</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-4 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <textarea
                      rows={3}
                      placeholder="Global positioning address..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background/50 pl-11 pr-4 py-3.5 text-sm font-bold transition-all focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Comms Link</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-12 rounded-xl border border-border bg-background/50 pl-11 pr-4 text-sm font-bold transition-all focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Secure Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="email"
                        placeholder="node@storetrack.sh"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-12 rounded-xl border border-border bg-background/50 pl-11 pr-4 text-sm font-bold transition-all focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => { setShowCreateForm(false); setEditingStore(null); }}
                  className="flex-1 h-12 rounded-xl border border-border bg-secondary/50 text-sm font-black transition-all hover:bg-muted active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
                >
                  {editingStore ? 'Sync Config' : 'Initialize Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stores Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stores.length > 0 ? (
          stores.map((store) => (
            <StoreCard key={store._id} store={store} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-32 rounded-[32px] border-4 border-dashed border-border/50 bg-card/30 animate-in fade-in duration-500">
            <div className="p-8 rounded-[32px] bg-primary/5 mb-8 relative">
              <div className="absolute inset-0 bg-primary/10 rounded-[32px] animate-ping opacity-20"></div>
              <Store className="h-16 w-16 text-primary" />
            </div>
            <h3 className="text-3xl font-black tracking-tight mb-3">No Nodes Active</h3>
            <p className="text-muted-foreground text-lg mb-10 max-w-sm text-center font-medium leading-relaxed">
              Your store network is currently offline. Deploy your first operational node to begin tracking.
            </p>
            {user?.role === 'owner' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="h-14 inline-flex items-center gap-3 rounded-2xl bg-primary px-10 text-base font-black text-primary-foreground transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/30"
              >
                <Plus className="h-6 w-6" />
                Initialize First Node
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Stores
