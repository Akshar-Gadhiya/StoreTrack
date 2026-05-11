import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { Search, Plus, Pencil, ShieldOff, ShieldCheck, Lock, Unlock, Key, X } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:5000/api'

const statusClasses = {
  active: 'bg-emerald-100 text-emerald-700',
  suspended: 'bg-amber-100 text-amber-800',
}

const MasterAdminOwners = () => {
  const { user } = useAuth()
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [summary, setSummary] = useState({ totalOwners: 0, activeOwners: 0, suspendedOwners: 0, totalStores: 0 })
  const [activeModal, setActiveModal] = useState(null)
  const [currentOwner, setCurrentOwner] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', status: 'active' })
  const [resetPassword, setResetPassword] = useState('')

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('storetrack_token')}`,
  }), [])

  const loadOwners = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 10 })
      if (search) params.set('search', search)
      if (status !== 'all') params.set('status', status)

      const response = await fetch(`${API_URL}/master-admin/owners?${params.toString()}`, { headers })
      const data = await response.json()
      if (response.ok) {
        setOwners(data.owners)
        setPage(data.page)
        setPages(data.pages)
        setTotal(data.total)
        setSummary(data.summary)
      } else {
        toast.error(data.message || 'Could not load owners')
      }
    } catch (error) {
      console.error(error)
      toast.error('Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'MASTER_ADMIN') {
      loadOwners()
    }
  }, [user, page, status])

  const openCreateModal = () => {
    setCurrentOwner(null)
    setFormData({ name: '', email: '', password: '', status: 'active' })
    setActiveModal('create')
  }

  const openEditModal = (owner) => {
    setCurrentOwner(owner)
    setFormData({ name: owner.name, email: owner.email, password: '', status: owner.status || 'active' })
    setActiveModal('edit')
  }

  const openResetModal = (owner) => {
    setCurrentOwner(owner)
    setResetPassword('')
    setActiveModal('reset')
  }

  const openDetailsModal = async (owner) => {
    try {
      const response = await fetch(`${API_URL}/master-admin/owners/${owner._id}`, { headers })
      const data = await response.json()
      if (response.ok) {
        setCurrentOwner(data)
        setActiveModal('details')
      } else {
        toast.error(data.message || 'Unable to load owner details')
      }
    } catch (error) {
      console.error(error)
      toast.error('Could not fetch owner details')
    }
  }

  const closeModal = () => {
    setActiveModal(null)
    setCurrentOwner(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = { name: formData.name, email: formData.email, status: formData.status }
    if (activeModal === 'create') payload.password = formData.password

    try {
      const url = activeModal === 'create'
        ? `${API_URL}/master-admin/owners`
        : `${API_URL}/master-admin/owners/${currentOwner._id}`
      const method = activeModal === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (response.ok) {
        toast.success(activeModal === 'create' ? 'Owner added successfully' : 'Owner updated successfully')
        closeModal()
        loadOwners()
      } else {
        toast.error(data.message || 'Unable to save owner')
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to save owner')
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    if (!resetPassword || resetPassword.length < 6) {
      toast.error('Enter a password with at least 6 characters')
      return
    }

    try {
      const response = await fetch(`${API_URL}/master-admin/owners/${currentOwner._id}/reset-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ password: resetPassword }),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success('Password reset successfully')
        closeModal()
      } else {
        toast.error(data.message || 'Unable to reset password')
      }
    } catch (error) {
      console.error(error)
      toast.error('Unable to connect to server')
    }
  }

  const toggleStatus = async (owner) => {
    const newStatus = owner.status === 'active' ? 'suspended' : 'active'
    try {
      const response = await fetch(`${API_URL}/master-admin/owners/${owner._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(`Owner ${newStatus === 'active' ? 'activated' : 'suspended'}`)
        setOwners((current) => current.map((item) => (item._id === data._id ? data : item)))
      } else {
        toast.error(data.message || 'Unable to change status')
      }
    } catch (error) {
      console.error(error)
      toast.error('Server connection failed')
    }
  }

  const headerText = currentOwner ? `${currentOwner.name} (${currentOwner.email})` : 'Owner details'

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Master Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Owner Management</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Create, update, suspend, and analyze owner accounts with full master admin controls.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Owner
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>{summary.totalOwners}</CardTitle>
            <CardDescription>Total owners</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>{summary.activeOwners}</CardTitle>
            <CardDescription>Active owners</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>{summary.suspendedOwners}</CardTitle>
            <CardDescription>Suspended owners</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>{summary.totalStores}</CardTitle>
            <CardDescription>Total owner stores</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); loadOwners() }} className="flex w-full gap-3 md:w-auto">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search owners"
                className="w-full rounded-3xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <button
              type="submit"
              className="rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-3">
            <label htmlFor="status-filter" className="text-sm font-semibold text-slate-700">Status</label>
            <select
              id="status-filter"
              value={status}
              onChange={(event) => { setStatus(event.target.value); setPage(1) }}
              className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stores</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">Loading owners...</TableCell>
                </TableRow>
              ) : owners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">No owners found.</TableCell>
                </TableRow>
              ) : owners.map((owner) => (
                <TableRow key={owner._id}>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{owner.name}</div>
                  </TableCell>
                  <TableCell>{owner.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[owner.status] || 'bg-slate-100 text-slate-800'}`}>
                      {owner.status}
                    </span>
                  </TableCell>
                  <TableCell>{owner.storeCount ?? '—'}</TableCell>
                  <TableCell>{new Date(owner.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-y-2 sm:space-y-0 sm:flex sm:justify-end sm:gap-2">
                    <button
                      onClick={() => openDetailsModal(owner)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <ShieldCheck className="h-4 w-4" /> Details
                    </button>
                    <button
                      onClick={() => openEditModal(owner)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => toggleStatus(owner)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      {owner.status === 'active' ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      {owner.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      onClick={() => openResetModal(owner)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      <Key className="h-4 w-4" /> Reset
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">Showing {owners.length} of {total} owners</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100"
              >Prev</button>
              <span className="text-sm text-slate-700">Page {page} / {pages}</span>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
                disabled={page >= pages}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-100"
              >Next</button>
            </div>
          </div>
        </div>
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{activeModal === 'create' ? 'Create owner' : activeModal === 'edit' ? 'Edit owner' : activeModal === 'reset' ? 'Reset owner password' : 'Owner details'}</h2>
                <p className="text-sm text-slate-500">{activeModal === 'details' ? headerText : 'Use a secure password and verify owner contact details.'}</p>
              </div>
              <button onClick={closeModal} className="rounded-full p-3 text-slate-500 transition hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6">
              {(activeModal === 'create' || activeModal === 'edit') && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Name</span>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Email</span>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-semibold text-slate-700">Status</span>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-semibold text-slate-700">Password</span>
                      <input
                        type="password"
                        required={activeModal === 'create'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={activeModal === 'create' ? 'Enter password' : 'Leave blank to keep current password'}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </label>
                  </div>
                  <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-3xl border border-slate-200 bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                    >Cancel</button>
                    <button
                      type="submit"
                      className="rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    >{activeModal === 'create' ? 'Create owner' : 'Save changes'}</button>
                  </div>
                </form>
              )}

              {activeModal === 'reset' && currentOwner && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">New password for {currentOwner.name}</label>
                    <input
                      type="password"
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={closeModal} className="rounded-3xl border border-slate-200 bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200">Cancel</button>
                    <button type="submit" className="rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Reset password</button>
                  </div>
                </form>
              )}

              {activeModal === 'details' && currentOwner && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl bg-slate-50 p-5">
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Owner</p>
                      <p className="mt-3 text-lg font-semibold text-slate-900">{currentOwner.name}</p>
                      <p className="text-sm text-slate-500">{currentOwner.email}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-5">
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Status</p>
                      <Badge variant={currentOwner.status === 'active' ? 'default' : 'secondary'} className="mt-3">
                        {currentOwner.status}
                      </Badge>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-5">
                      <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Joined</p>
                      <p className="mt-3 text-lg font-semibold text-slate-900">{new Date(currentOwner.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">Stores managed</p>
                      <p className="text-sm text-slate-500">{currentOwner.storeCount || 0}</p>
                    </div>
                    <div className="space-y-3">
                      {currentOwner.stores?.length > 0 ? (
                        currentOwner.stores.map((store) => (
                          <div key={store._id} className="rounded-3xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="font-semibold text-slate-900">{store.name}</p>
                                <p className="text-sm text-slate-500">{store.email}</p>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[store.status] || 'bg-slate-100 text-slate-800'}`}>
                                {store.status}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">{store.address}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">This owner does not currently manage any stores.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MasterAdminOwners
