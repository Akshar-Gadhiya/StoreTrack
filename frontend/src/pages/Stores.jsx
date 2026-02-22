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
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 flex flex-col items-center text-center max-w-2xl mx-auto mt-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-bold text-destructive">Access Restricted</h3>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          Employees do not have permission to manage stores. Please contact your manager or system administrator for access.
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
      className={`group relative rounded-xl border p-6 transition-all duration-300 cursor-pointer bg-card hover:shadow-lg ${currentStore?.id === store.id
          ? 'border-primary ring-1 ring-primary shadow-sm shadow-primary/10'
          : 'border-border hover:border-primary/50'
        }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-lg transition-colors ${currentStore?.id === store.id ? 'bg-primary text-primary-foreground' : 'bg-secondary group-hover:bg-primary/10 group-hover:text-primary transition-all'}`}>
            <Store className="h-6 w-6" />
          </div>
          {user?.role === 'owner' && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); handleEdit(store); }}
                className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(store.id); }}
                className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">{store.name}</h3>
          <p className="text-xs text-muted-foreground font-mono">ID: {store.id}</p>
        </div>

        <div className="mt-6 space-y-3 flex-1">
          {store.address && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="line-clamp-2 leading-snug">{store.address}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-4 mt-auto">
            {store.phone && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                {store.phone}
              </div>
            )}
            {store.email && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                {store.email}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            <Calendar className="h-3 w-3" />
            {new Date(store.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </div>
          {currentStore?.id === store.id && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wide">
              <CheckCircle2 className="h-3 w-3" />
              Active
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight">Store Fleet</h1>
          <p className="text-muted-foreground text-lg italic decoration-primary/20 decoration-2 underline underline-offset-8">Coordinate and manage your multi-location operations.</p>
        </div>

        {user?.role === 'owner' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            New Store
          </button>
        )}
      </div>

      {/* Forms Overlay */}
      {(showCreateForm || editingStore) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-2xl shadow-black/20 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold tracking-tight">
                {editingStore ? 'Store Configuration' : 'Launch New Store'}
              </h3>
              <button
                onClick={() => { setShowCreateForm(false); setEditingStore(null); }}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary" />
                    Identity
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Flagship Seattle"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Location Details
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Full street address..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      Contact
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="store@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowCreateForm(false); setEditingStore(null); }}
                  className="flex-1 rounded-lg border border-border bg-secondary py-2.5 text-sm font-bold transition-all hover:bg-secondary/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                >
                  {editingStore ? 'Save Changes' : 'Initialize Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stores Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.length > 0 ? (
          stores.map((store) => (
            <StoreCard key={store._id} store={store} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-border bg-card/30">
            <div className="p-6 rounded-full bg-secondary/50 mb-6">
              <Store className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">Establishing Footprint</h3>
            <p className="text-muted-foreground mb-8 max-w-sm text-center">
              You haven't registered any stores yet. Create your first location to start tracking inventory.
            </p>
            {user?.role === 'owner' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition-all hover:scale-105 shadow-xl shadow-primary/20"
              >
                <Plus className="h-5 w-5" />
                Get Started
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Stores
