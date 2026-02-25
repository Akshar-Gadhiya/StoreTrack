import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import { useItem } from '../contexts/ItemContext'
import { Protect, usePermission } from '../contexts/AccessContext'
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  Package,
  Pencil,
  Trash2,
  Eye,
  QrCode,
  Image as ImageIcon,
  MoreVertical,
  Minus,
  ChevronDown,
  X,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  LocateFixed,
  Info,
  ExternalLink,
  ChevronRight,
  Calendar,
  Layers,
  MapPin,
  Circle
} from 'lucide-react'

const Items = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentStore, stores, selectStore } = useStore()
  const {
    items,
    viewMode,
    setViewMode,
    addItem,
    updateItem,
    deleteItem,
    updateQuantity,
    searchItems
  } = useItem()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    lowStock: false,
    outOfStock: false
  })
  const [filteredItems, setFilteredItems] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showItemModal, setShowItemModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    lowStockThreshold: 10,
    price: '',
    rack: '',
    storeId: ''
  })

  useEffect(() => {
    const searchOptions = { ...filters }
    if (currentStore) searchOptions.storeId = currentStore._id
    const filtered = searchItems(searchQuery, searchOptions)
    setFilteredItems(filtered)
  }, [searchQuery, filters, items, currentStore, searchItems])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const itemData = {
      name: formData.name,
      category: formData.category || 'General',
      storeId: currentStore?._id,
      itemCode: editingItem ? editingItem.itemCode : `ITM-${Date.now().toString().slice(-6)}`,
      quantity: parseInt(formData.quantity),
      lowStockThreshold: parseInt(formData.lowStockThreshold),
      price: formData.price ? parseFloat(formData.price) : 0,
      location: {
        rack: formData.rack
      }
    }

    if (editingItem) {
      await updateItem(editingItem._id, itemData)
      setEditingItem(null)
    } else {
      await addItem(itemData)
      setShowCreateForm(false)
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: 0,
      lowStockThreshold: 10,
      price: '',
      rack: '',
      storeId: ''
    })
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name || '',
      category: item.category || '',
      quantity: item.quantity || 0,
      lowStockThreshold: item.lowStockThreshold || 10,
      price: item.price || '',
      rack: item.location?.rack || '',
      storeId: item.storeId || ''
    })
  }

  const handleDelete = async (itemId) => {
    if (window.confirm('Erase this item from inventory?')) await deleteItem(itemId)
  }

  const handleQuantityUpdate = async (itemId, change) => {
    await updateQuantity(itemId, Math.abs(change), change > 0 ? 'add' : 'subtract')
  }

  const viewItemDetails = (item) => {
    setSelectedItem(item)
    setShowItemModal(true)
  }

  const getStatusBadge = (item) => {
    const isOutOfStock = item.quantity === 0
    const isLowStock = item.quantity <= (item.lowStockThreshold || 10)

    if (isOutOfStock) return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider">
        <Circle className="h-2 w-2 fill-current" /> Out of Stock
      </span>
    )
    if (isLowStock) return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
        <AlertTriangle className="h-2 w-2" /> Low Stock
      </span>
    )
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">
        <Circle className="h-2 w-2 fill-current" /> In Stock
      </span>
    )
  }

  const ItemCard = ({ item }) => (
    <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full card-shadow card-hover">
      <div className="aspect-[16/10] w-full bg-muted relative overflow-hidden">
        {item.images && item.images.length > 0 ? (
          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/30">
            <Package className="h-12 w-12 text-muted-foreground/20 group-hover:scale-110 transition-transform duration-500" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          {getStatusBadge(item)}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
          <p className="text-white text-xs font-medium line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
            {item.description || 'No technical specifications provided for this inventory entity.'}
          </p>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <h3 className="font-black text-xl tracking-tight group-hover:text-primary transition-colors leading-tight">{item.name}</h3>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">{item.itemCode}</p>
          </div>
          <div className="text-right bg-secondary/50 px-3 py-1.5 rounded-xl border border-border/50">
            <p className="text-2xl font-black tracking-tighter text-primary">{item.quantity}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Units</p>
          </div>
        </div>

        <div className="mt-4 space-y-3 flex-1 text-sm font-medium">
          <div className="flex items-center justify-between py-2.5 border-y border-border/30">
            <span className="text-muted-foreground/70 flex items-center gap-2"><Layers className="h-3.5 w-3.5" /> Category</span>
            <span className="font-bold">{item.category || 'Uncategorized'}</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-muted-foreground/70 flex items-center gap-2"><ArrowUpRight className="h-3.5 w-3.5" /> Valuation</span>
            <span className="font-black text-lg text-foreground">{item.price ? `$${item.price.toFixed(2)}` : 'N/A'}</span>
          </div>
          <div className="flex items-start gap-3 text-xs text-muted-foreground/80 bg-muted/50 p-3 rounded-xl border border-border/30">
            <MapPin className="h-4 w-4 shrink-0 text-primary/40" />
            <span className="truncate font-bold uppercase tracking-tight">
              {item.location ? `${item.location.section || 'SEC'} • ${item.location.rack || 'RCK'} • ${item.location.shelf || 'SHL'}` : 'No Location Assigned'}
            </span>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <button onClick={() => viewItemDetails(item)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-sm active:scale-95">
              <Eye className="h-4.5 w-4.5" />
            </button>
            <Protect permission="canEditInventory">
              <button onClick={() => handleEdit(item)} className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all shadow-sm active:scale-95">
                <Pencil className="h-4 w-4" />
              </button>
            </Protect>
          </div>

          <Protect permission="canEditInventory">
            <div className="flex items-center bg-secondary/80 rounded-xl p-1 border border-border shadow-inner">
              <button
                onClick={() => handleQuantityUpdate(item._id, -1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-card text-muted-foreground transition-all active:scale-90"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Adjust</span>
              <button
                onClick={() => handleQuantityUpdate(item._id, 1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-card text-muted-foreground transition-all active:scale-90"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </Protect>

          <Protect permission="canDeleteItems">
            <button onClick={() => handleDelete(item._id)} className="h-10 w-10 flex items-center justify-center rounded-xl border border-destructive/10 text-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-all active:scale-95">
              <Trash2 className="h-4 w-4" />
            </button>
          </Protect>
        </div>
      </div>
    </div>
  )

  const ItemTableRow = ({ item }) => (
    <tr className="group hover:bg-muted/40 transition-all border-b border-border/50">
      <td className="px-8 py-5 whitespace-nowrap">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
            {item.images?.[0] ? <img src={item.images[0]} className="object-cover w-full h-full" /> : <Package className="h-6 w-6 text-muted-foreground/30" />}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-foreground group-hover:text-primary transition-colors tracking-tight leading-tight">{item.name}</span>
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">{item.itemCode}</span>
          </div>
        </div>
      </td>
      <td className="px-8 py-5 whitespace-nowrap">
        <span className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-secondary/80 border border-border/50 text-muted-foreground">
          {item.category || '-'}
        </span>
      </td>
      {!currentStore && (
        <td className="px-8 py-5 whitespace-nowrap">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <StoreIcon className="h-3.5 w-3.5 text-primary/40" />
            {stores.find(s => s._id === item.storeId)?.name || '-'}
          </div>
        </td>
      )}
      <td className="px-8 py-5 whitespace-nowrap">
        <div className="flex flex-col gap-1.5">
          <span className="text-lg font-black tracking-tighter leading-none">{item.quantity}</span>
          {getStatusBadge(item)}
        </div>
      </td>
      <td className="px-8 py-5 whitespace-nowrap">
        <span className="text-lg font-black text-foreground tracking-tighter">{item.price ? `$${item.price.toFixed(2)}` : '-'}</span>
      </td>
      <td className="px-8 py-5 whitespace-nowrap">
        <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 bg-muted/30 px-3 py-1.5 rounded-xl border border-border/20 w-fit">
          <LocateFixed className="h-3.5 w-3.5 text-primary/40" />
          <span className="truncate">{item.location?.section ? `${item.location.section} • ${item.location.rack}` : 'UNASSIGNED'}</span>
        </div>
      </td>
      <td className="px-8 py-5 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
          <button onClick={() => viewItemDetails(item)} className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all shadow-sm active:scale-95"><Eye className="h-4 w-4" /></button>
          <Protect permission="canEditInventory">
            <button onClick={() => handleEdit(item)} className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all shadow-sm active:scale-95"><Pencil className="h-4 w-4" /></button>
          </Protect>
          <Protect permission="canDeleteItems">
            <button onClick={() => handleDelete(item._id)} className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all shadow-sm active:scale-95"><Trash2 className="h-4 w-4" /></button>
          </Protect>
        </div>
      </td>
    </tr>
  )

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Operational Intelligence</span>
          </div>
          <h1
            onDoubleClick={() => {
              if (user?.role === 'owner') {
                navigate('/admin/master-vault')
              }
            }}
            className="text-5xl font-black tracking-tighter flex items-center gap-4 cursor-default select-none text-foreground"
          >
            Inventory Registry
            <span className="text-sm font-bold bg-secondary/80 px-4 py-1.5 rounded-2xl border border-border/50 text-muted-foreground shadow-sm">{filteredItems.length} Nodes</span>
          </h1>
          <p className="text-muted-foreground text-xl font-medium max-w-2xl leading-relaxed">
            Manage global SKU lifecycles, geospatial distribution, and automated fulfillment thresholds across the enterprise fleet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {(user?.role === 'owner') && (
            <div className="relative group min-w-[220px]">
              <StoreIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <select
                value={currentStore?._id || ''}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === "") selectStore(null)
                  else {
                    const store = stores.find(s => s._id === val)
                    if (store) selectStore(store)
                  }
                }}
                className="w-full bg-card/50 backdrop-blur-md border border-border rounded-xl pl-11 pr-11 py-3 text-sm font-black appearance-none focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer shadow-sm hover:border-primary/30"
              >
                <option value="">Fleet: All Storefronts</option>
                {stores.map(store => <option key={store._id} value={store._id}>{store.name}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          )}

          <Protect permission="canEditInventory">
            <button
              onClick={() => {
                if (!currentStore) {
                  toast.error('Store authorization required. Please select a node first.')
                  return
                }
                setShowCreateForm(true)
              }}
              className="h-12 inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-8 text-sm font-black text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-1 active:scale-95 group"
            >
              <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
              Initialize SKU
            </button>
          </Protect>
        </div>
      </div>

      {/* Navigation & Controls */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 flex gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all group-focus-within:scale-110" />
            <input
              type="text"
              placeholder="Search by SKU name, identifier code or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 bg-card border border-border rounded-2xl pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all shadow-sm hover:border-primary/20"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-14 px-6 rounded-2xl border border-border flex items-center gap-3 text-sm font-black transition-all ${showFilters ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20' : 'bg-card hover:bg-secondary hover:border-primary/20 shadow-sm'}`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden md:inline">Parameters</span>
          </button>
        </div>

        <div className="flex items-center gap-2 bg-card/50 backdrop-blur-md p-2 rounded-2xl border border-border shadow-sm self-start">
          <button onClick={() => setViewMode('card')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'card' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10' : 'text-muted-foreground hover:bg-secondary'}`}>
            <LayoutGrid className="h-4 w-4" /> Grid
          </button>
          <button onClick={() => setViewMode('table')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10' : 'text-muted-foreground hover:bg-secondary'}`}>
            <TableIcon className="h-4 w-4" /> Ledger
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded-3xl border border-primary/20 bg-primary/[0.02] backdrop-blur-sm animate-in slide-in-from-top-4 duration-500 shadow-inner">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 px-1">Category Classification</label>
            <input type="text" placeholder="E.g. Electronics, Tools..." value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full h-12 bg-background/50 border border-border rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all" />
          </div>
          <div className="flex flex-col justify-center gap-4">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className={`h-6 w-6 rounded-lg border-2 transition-all flex items-center justify-center ${filters.lowStock ? 'bg-primary border-primary rotate-0' : 'border-border group-hover:border-primary rotate-45 group-hover:rotate-0'}`}>
                {filters.lowStock && <Plus className="h-4 w-4 text-primary-foreground" />}
              </div>
              <input type="checkbox" className="hidden" checked={filters.lowStock} onChange={(e) => setFilters({ ...filters, lowStock: e.target.checked })} />
              <span className="text-sm font-black text-foreground/80 group-hover:text-primary transition-colors">Priority: Critical Reserves Only</span>
            </label>
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className={`h-6 w-6 rounded-lg border-2 transition-all flex items-center justify-center ${filters.outOfStock ? 'bg-destructive border-destructive rotate-0' : 'border-border group-hover:border-destructive rotate-45 group-hover:rotate-0'}`}>
                {filters.outOfStock && <Plus className="h-4 w-4 text-destructive-foreground" />}
              </div>
              <input type="checkbox" className="hidden" checked={filters.outOfStock} onChange={(e) => setFilters({ ...filters, outOfStock: e.target.checked })} />
              <span className="text-sm font-black text-destructive/80 group-hover:text-destructive transition-colors">Alert: Zero Inventory Registry</span>
            </label>
          </div>
          <div className="flex items-end">
            <button onClick={() => setFilters({ category: '', lowStock: false, outOfStock: false })} className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-2 px-6 py-3 hover:bg-primary/5 rounded-xl transition-all active:scale-95 group">
              <X className="h-4 w-4 transition-transform group-hover:rotate-90" /> Reset All Parameters
            </button>
          </div>
        </div>
      )}

      {/* Main Registry Display */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 rounded-[2rem] border-4 border-dashed border-border/50 bg-card/30 text-center px-8 animate-in fade-in duration-1000">
          <div className="h-24 w-24 bg-secondary/50 flex items-center justify-center rounded-[2rem] mb-8 relative">
            <div className="absolute inset-0 bg-primary/10 rounded-[2rem] animate-ping opacity-10"></div>
            <Package className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-3xl font-black tracking-tighter mb-3">Registry Void Detected</h3>
          <p className="max-w-md text-muted-foreground text-lg font-medium leading-relaxed">
            No stock entities identified within these parameters. Adjust your search query or synchronize your inventory database.
          </p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item) => <ItemCard key={item._id} item={item} />)}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl shadow-black/[0.03] backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Entity Profile</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Classification</th>
                  {!currentStore && <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Node Assignment</th>}
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Operational Volume</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Economic Value</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Spatial Coordinates</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 text-right">Utility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredItems.map((item) => <ItemTableRow key={item._id} item={item} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Item Config Overlay */}
      {(showCreateForm || editingItem) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-4xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex bg-muted/30 border-b border-border p-6">
              <div className="flex-1 space-y-1">
                <h3 className="text-2xl font-black tracking-tight">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                <p className="text-muted-foreground">Enter item details below.</p>
              </div>
              <button onClick={() => { setShowCreateForm(false); setEditingItem(null); resetForm(); }} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-destructive hover:text-white transition-all text-muted-foreground">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Store Display */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Store</p>
                <p className="text-lg font-bold text-primary">{currentStore?.name || 'No store selected'}</p>
              </div>

              {/* Simplified Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Item Name */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter item name"
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Electronics, Tools"
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                {/* Rack No */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">Rack No</label>
                  <input
                    type="text"
                    value={formData.rack}
                    onChange={(e) => setFormData({ ...formData, rack: e.target.value })}
                    placeholder="e.g., A1, B2"
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                {/* Qty */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">Qty *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                {/* Min Qty (Low Stock Threshold) */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">Min Qty (Low Stock Alert)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    placeholder="10"
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                {/* Price per Item */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-muted-foreground">Price per Item ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => { setShowCreateForm(false); setEditingItem(null); resetForm(); }} className="flex-1 rounded-xl bg-secondary py-3 text-sm font-bold tracking-tight hover:bg-secondary/70 transition-all">Cancel</button>
                <button type="submit" className="flex-[2] rounded-xl bg-primary py-3 text-sm font-bold tracking-tight text-primary-foreground shadow-lg shadow-primary/20 hover:translate-y-[-2px] transition-all">{editingItem ? 'Update Item' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Analytics / Detail Modal */}
      {showItemModal && selectedItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-5xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95">
            <div className="md:w-2/5 bg-secondary relative">
              {selectedItem.images?.[0] ? <img src={selectedItem.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-muted"><Package className="h-32 w-32 text-muted-foreground/20" /></div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                <h2 className="text-4xl font-black mb-1">{selectedItem.name}</h2>
                <p className="text-white/60 font-mono text-sm tracking-widest">{selectedItem.itemCode}</p>
              </div>
              <button onClick={() => setShowItemModal(false)} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="md:w-3/5 p-10 space-y-10 overflow-y-auto max-h-[80vh]">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Inventory Status</p>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-black tracking-tighter">{selectedItem.quantity} <span className="text-2xl font-medium text-muted-foreground">SKUs</span></span>
                    {getStatusBadge(selectedItem)}
                  </div>
                </div>
                {selectedItem.qrCode && <img src={selectedItem.qrCode} className="h-20 w-20 rounded-lg p-1 bg-white border border-border shadow-sm" />}
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Layers className="h-3 w-3" /> System Category</p>
                  <p className="text-lg font-bold">{selectedItem.category || 'Standard Entity'}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><ArrowUpRight className="h-3 w-3" /> Economic Value</p>
                  <p className="text-lg font-black text-primary">{selectedItem.price ? `$${selectedItem.price.toFixed(2)}` : 'N/A'}</p>
                </div>
                <div className="space-y-1.5 text-nowrap">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Expiry Protocol</p>
                  <p className="text-lg font-bold">{selectedItem.expiryDate || 'Indefinite'}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Info className="h-3 w-3" /> Supply Chain</p>
                  <p className="text-lg font-bold">{selectedItem.supplier || 'Internal Acquisition'}</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-muted/30 border border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-4 flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Warehouse Placement</p>
                <div className="flex items-center justify-between">
                  {['Section', 'Rack', 'Shelf', 'Bin'].map(l => (
                    <div key={l} className="text-center">
                      <p className="text-[10px] text-muted-foreground mb-1">{l}</p>
                      <p className="font-black text-lg">{selectedItem.location?.[l.toLowerCase()] || 'Ø'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pb-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Info className="h-3 w-3" /> Technical Analysis</p>
                <p className="text-muted-foreground leading-relaxed leading-relaxed">{selectedItem.description || 'No technical specifications provided for this inventory entity.'}</p>
              </div>

              <div className="pt-6 border-t border-border flex gap-4">
                <button onClick={() => setShowItemModal(false)} className="flex-1 py-3 text-sm font-bold bg-secondary rounded-xl hover:bg-secondary/70 transition-all">Close Analytics</button>
                {user?.role !== 'employee' && (
                  <button onClick={() => { setShowItemModal(false); handleEdit(selectedItem); }} className="flex-[2] py-3 text-sm font-bold bg-primary text-primary-foreground rounded-xl flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/20 transition-all">
                    <Pencil className="h-4 w-4" /> Edit Specifications
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}

function StoreIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="10" rx="2" /><path d="m22 10-3.1-6.1a2 2 0 0 0-1.8-0.9H7a2 2 0 0 0-1.8 0.9L2 10" /><path d="M12 10v12" /><path d="M15 22H9" /></svg>
  )
}

export default Items
