import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Search, Eye, Trash2, Lock, Unlock, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:5000/api'

const statusStyles = {
  active: 'bg-emerald-100 text-emerald-700',
  suspended: 'bg-amber-100 text-amber-800',
  pending: 'bg-slate-100 text-slate-800',
}

const MasterAdminStores = () => {
  const { user } = useAuth()
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedStore, setSelectedStore] = useState(null)

  const token = localStorage.getItem('storetrack_token')
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const loadStores = async () => {
    setLoading(true)

    try {
      const params = new URLSearchParams({ page, limit: 10 })
      if (search) params.set('search', search)
      if (status !== 'all') params.set('status', status)

      const response = await fetch(`${API_URL}/master-admin/stores?${params.toString()}`, {
        headers,
      })
      const data = await response.json()

      if (response.ok) {
        setStores(data.stores)
        setPages(data.pages)
        setTotal(data.total)
      } else {
        toast.error(data.message || 'Unable to load stores')
      }
    } catch (error) {
      console.error('Error loading stores:', error)
      toast.error('Server connection failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'MASTER_ADMIN') {
      loadStores()
    }
  }, [user, page, status])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setPage(1)
    loadStores()
  }

  const toggleStoreStatus = async (store) => {
    const newStatus = store.status === 'active' ? 'suspended' : 'active'
    try {
      const response = await fetch(`${API_URL}/master-admin/stores/${store._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await response.json()

      if (response.ok) {
        toast.success(`Store ${newStatus === 'active' ? 'activated' : 'suspended'}`)
        setStores((prev) => prev.map((row) => (row._id === data._id ? data : row)))
      } else {
        toast.error(data.message || 'Unable to update status')
      }
    } catch (error) {
      console.error('Status update failed:', error)
      toast.error('Server connection failed')
    }
  }

  const deleteStore = async (storeId) => {
    const confirmed = window.confirm('Delete this store permanently?')
    if (!confirmed) return

    try {
      const response = await fetch(`${API_URL}/master-admin/stores/${storeId}`, {
        method: 'DELETE',
        headers,
      })
      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Store deleted')
        setStores((prev) => prev.filter((store) => store._id !== storeId))
        setTotal((prev) => Math.max(0, prev - 1))
      } else {
        toast.error(data.message || 'Unable to delete store')
      }
    } catch (error) {
      console.error('Delete store failed:', error)
      toast.error('Server connection failed')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="max-w-full mx-auto space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Master Admin</p>
              <h1 className="text-3xl font-semibold text-slate-900">Store Management</h1>
              <p className="mt-1 text-sm text-slate-600">View, search, filter, and manage all stores across the platform.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <form onSubmit={handleSearchSubmit} className="flex w-full gap-2 sm:w-auto">
                <label className="sr-only" htmlFor="store-search">Search stores</label>
                <div className="relative w-full sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="store-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search stores"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button type="submit" className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
                  Search
                </button>
              </form>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <label htmlFor="status-filter" className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Status</label>
                <select
                  id="status-filter"
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value)
                    setPage(1)
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-[0.18em] text-slate-500">Store</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-[0.18em] text-slate-500">Owner</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-[0.18em] text-slate-500">Phone</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-[0.18em] text-slate-500">Status</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-[0.18em] text-slate-500">Created</th>
                  <th className="px-6 py-4 text-right font-semibold uppercase tracking-[0.18em] text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-slate-500">Loading stores...</td>
                  </tr>
                ) : stores.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-slate-500">No stores found.</td>
                  </tr>
                ) : (
                  stores.map((store) => (
                    <tr key={store._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900">{store.name}</div>
                        <div className="text-xs text-slate-500">{store.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">{store.owner?.name || '—'}</div>
                        <div className="text-xs text-slate-500">{store.owner?.email || '—'}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{store.phone}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[store.status] || 'bg-slate-100 text-slate-800'}`}>
                          {store.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(store.createdAt).toLocaleDateString()}</td>
                      <td className="flex flex-col gap-2 px-6 py-4 text-right sm:flex-row sm:justify-end sm:items-center">
                        <button
                          onClick={() => setSelectedStore(store)}
                          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 transition hover:bg-slate-100"
                          title="View details"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => toggleStoreStatus(store)}
                          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-700 transition hover:bg-slate-50"
                          title={store.status === 'active' ? 'Suspend store' : 'Activate store'}
                        >
                          {store.status === 'active' ? <Lock className="mr-2 h-4 w-4" /> : <Unlock className="mr-2 h-4 w-4" />}
                          {store.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteStore(store._id)}
                          className="inline-flex items-center justify-center rounded-2xl bg-rose-500 px-3 py-2 text-white transition hover:bg-rose-600"
                          title="Delete store"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Showing {stores.length} of {total} stores
            </p>
            <div className="inline-flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-slate-700">Page {page} of {pages}</span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
                disabled={page >= pages}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Store details</h2>
                <p className="text-sm text-slate-600">{selectedStore.name}</p>
              </div>
              <button
                onClick={() => setSelectedStore(null)}
                className="rounded-full bg-slate-100 px-3 py-2 text-slate-700 transition hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Owner</h3>
                  <p className="mt-2 text-sm text-slate-900">{selectedStore.owner?.name || '—'}</p>
                  <p className="text-sm text-slate-500">{selectedStore.owner?.email || '—'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Contact</h3>
                  <p className="mt-2 text-sm text-slate-900">{selectedStore.phone}</p>
                  <p className="text-sm text-slate-500">{selectedStore.email}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Status</h3>
                  <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selectedStore.status] || 'bg-slate-100 text-slate-800'}`}>
                    {selectedStore.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Created</h3>
                  <p className="mt-2 text-sm text-slate-900">{new Date(selectedStore.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Address</h3>
                <p className="mt-2 text-sm text-slate-700">{selectedStore.address}</p>
              </div>

              {selectedStore.manager && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Assigned manager</h3>
                  <p className="mt-2 text-sm text-slate-700">{selectedStore.manager?.name || '—'}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Sections</h3>
                <div className="mt-2 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {selectedStore.sections?.length > 0 ? (
                    selectedStore.sections.map((section) => (
                      <div key={section.id || section.name}>
                        <p className="font-semibold text-slate-900">{section.name}</p>
                        <p className="text-slate-500">{section.racks?.length || 0} racks</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500">No section data available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MasterAdminStores
