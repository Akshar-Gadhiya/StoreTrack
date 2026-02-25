import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { Protect } from '../contexts/AccessContext'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  UserCircle,
  Mail,
  ShieldCheck,
  MoreVertical,
  ChevronRight,
  Filter,
  ArrowUpDown,
  X,
  Loader2,
  AlertCircle,
  UserPlus,
  Shield,
  Briefcase,
  Store
} from 'lucide-react'

const API_URL = 'http://localhost:5000/api'

const Employees = () => {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    store: '',
  })
  const [error, setError] = useState('')

  // Only owners and managers can access employees
  if (user?.role === 'employee') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 animate-in fade-in duration-700">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <div className="relative bg-card border border-destructive/20 p-8 rounded-[2.5rem] shadow-2xl">
            <ShieldAlert className="h-20 w-20 text-destructive animate-bounce-subtle" />
          </div>
        </div>
        <h3 className="text-4xl font-black text-foreground tracking-tighter mb-4">Access Denied</h3>
        <p className="text-muted-foreground text-center text-xl max-w-lg leading-relaxed font-medium">
          The <span className="text-destructive font-black underline decoration-destructive/20 underline-offset-8 italic">Personnel Registry</span> is restricted to administrative clearance levels only.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-12 px-10 py-4 bg-secondary text-foreground font-black rounded-2xl border border-border hover:bg-muted transition-all active:scale-95 flex items-center gap-3"
        >
          <ArrowLeft className="h-5 w-5" />
          Retreat to Dashboard
        </button>
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
    loadEmployees()
    if (user?.role === 'owner') {
      loadStores()
    }
  }, [user])

  const loadStores = async () => {
    try {
      const response = await fetch(`${API_URL}/stores`, {
        headers: getHeaders()
      })
      const data = await response.json()
      if (response.ok) {
        setStores(data)
      }
    } catch (err) {
      console.error('Failed to load stores:', err)
    }
  }

  const loadEmployees = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: getHeaders()
      })
      const data = await response.json()
      if (response.ok) {
        setEmployees(data)
      } else {
        toast.error(data.message || 'Failed to load team database')
      }
    } catch (err) {
      toast.error('Connection to security server failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      let response;
      if (editingEmployee) {
        const payload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        }
        if (formData.password) payload.password = formData.password

        response = await fetch(`${API_URL}/users/${editingEmployee._id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        })
      } else {
        response = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(formData)
        })
      }

      if (response.ok) {
        toast.success(editingEmployee ? 'Personnel updated' : 'Member authorized')
        resetForm()
        loadEmployees()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Operation failed')
      }
    } catch (err) {
      toast.error('Communication error')
    }
  }

  const handleEdit = (employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      password: '',
      role: employee.role,
    })
    setShowCreateForm(false)
  }

  const handleDelete = async (employeeId) => {
    if (window.confirm('Erase this user from the system permanently?')) {
      setError('')
      try {
        const response = await fetch(`${API_URL}/users/${employeeId}`, {
          method: 'DELETE',
          headers: getHeaders()
        })
        if (response.ok) {
          toast.success('Access revoked')
          loadEmployees()
        } else {
          const data = await response.json()
          toast.error(data.message || 'Deletion failed')
        }
      } catch (err) {
        toast.error('Network interruption')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: user?.role === 'owner' ? 'manager' : 'employee',
      store: ''
    })
    setEditingEmployee(null)
    setShowCreateForm(false)
  }

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
            <Shield className="h-3 w-3" /> System Owner
          </span>
        )
      case 'manager':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-600 text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
            <Briefcase className="h-3 w-3" /> Area Manager
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
            <Users className="h-3 w-3" /> Fleet Personnel
          </span>
        )
    }
  }

  const EmployeeRow = ({ employee }) => (
    <tr className="group hover:bg-muted/40 transition-all border-b border-border/50">
      <td className="px-8 py-5 whitespace-nowrap">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 flex-shrink-0 bg-secondary rounded-2xl flex items-center justify-center border border-border/50 group-hover:scale-110 group-hover:border-primary/30 transition-all duration-500 shadow-inner overflow-hidden">
            {employee.avatar ? (
              <img src={employee.avatar} className="w-full h-full object-cover" />
            ) : (
              <span className="text-foreground font-black text-lg italic">
                {employee.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight">{employee.name}</span>
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">{employee._id.slice(-8)}</span>
          </div>
        </div>
      </td>
      <td className="px-8 py-5 whitespace-nowrap">
        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
          <Mail className="h-4 w-4 text-primary/40" />
          {employee.email}
        </div>
      </td>
      <td className="px-8 py-5 whitespace-nowrap">
        {getRoleBadge(employee.role)}
      </td>
      <td className="px-8 py-5 whitespace-nowrap">
        <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-foreground/70 bg-secondary/50 px-3 py-1.5 rounded-xl border border-border/50 w-fit">
          <Store className="h-3.5 w-3.5 text-primary/40" />
          {employee.storeName || 'GLOBAL'}
        </div>
      </td>
      <td className="px-8 py-5 whitespace-nowrap">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60 uppercase tracking-tight">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(employee.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
        </div>
      </td>
      <td className="px-8 py-5 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
          {(user?.role === 'owner' || (user?.role === 'manager' && employee.createdBy === user?._id)) && (
            <>
              <Protect permission="canManageTeam">
                <button
                  onClick={() => handleEdit(employee)}
                  className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all shadow-sm active:scale-95"
                  title="Edit Status"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </Protect>
              <Protect permission="canManageTeam">
                <button
                  onClick={() => handleDelete(employee._id)}
                  className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all shadow-sm active:scale-95"
                  title="Revoke Protocol"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Protect>
            </>
          )}
          <button className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:bg-secondary transition-all">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Fleet Coordination</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground">Personnel Registry</h1>
          <p className="text-muted-foreground text-xl font-medium max-w-2xl leading-relaxed">
            Manage administrative access protocols, regional staff assignments, and organizational hierarchy across all nodes.
          </p>
        </div>

        {(user?.role === 'owner' || user?.role === 'manager') && (
          <button
            onClick={() => { resetForm(); setShowCreateForm(true); }}
            className="h-12 inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-8 text-sm font-black text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-1 active:scale-95 group"
          >
            <UserPlus className="h-5 w-5 transition-transform group-hover:rotate-12" />
            Initialize Member
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 flex gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all group-focus-within:scale-110" />
            <input
              type="text"
              placeholder="Filter by name, email or assigned rank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 bg-card border border-border rounded-2xl pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all shadow-sm hover:border-primary/20"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 bg-card/50 backdrop-blur-md p-2 rounded-2xl border border-border shadow-sm self-start">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-all">
            <Filter className="h-4 w-4" /> Parameters
          </button>
          <div className="h-4 w-px bg-border/50 mx-2" />
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-all">
            <ArrowUpDown className="h-4 w-4" /> Sorted by Name
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-3xl border border-border bg-card shadow-2xl shadow-black/[0.03] overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Entity Profile</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Communication Bridge</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">System Clearance</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Node Assignment</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Session History</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 text-right">Utility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                      <span className="text-muted-foreground font-black text-xs uppercase tracking-[0.2em]">Synchronizing Registry...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <div className="h-20 w-20 bg-secondary/50 flex items-center justify-center rounded-[2rem] relative">
                        <div className="absolute inset-0 bg-primary/10 rounded-[2rem] animate-ping opacity-10"></div>
                        <Users className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-3xl font-black tracking-tighter">Registry Void</h4>
                        <p className="text-muted-foreground text-lg font-medium max-w-md mx-auto leading-relaxed">
                          {searchQuery ? "No members match your criteria. Adjust your search parameters." : "Start populating your team registry to begin fleet-wide collaboration."}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <EmployeeRow key={employee._id} employee={employee} />
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filteredEmployees.length > 0 && (
          <div className="px-8 py-6 border-t border-border/30 bg-muted/20 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              Active Personnel Units: <span className="text-foreground">{filteredEmployees.length}</span>
            </p>
            <div className="flex gap-3">
              <button className="h-10 w-10 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-30 transition-all" disabled>
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
              <button className="h-10 w-10 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-30 transition-all" disabled>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Permissions Guide - Restricted to Owner */}
      {user?.role === 'owner' && (
        <div className="rounded-[2.5rem] border border-primary/20 bg-primary/[0.01] p-12 shadow-inner relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
            <ShieldCheck className="h-64 w-64" />
          </div>
          <div className="relative space-y-10">
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30">
                <ShieldCheck className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-tighter">Clearance Hierarchy</h3>
                <p className="text-muted-foreground font-medium">Standardized operational access protocols for the enterprise.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-black uppercase text-xs tracking-widest">System Owner</h4>
                </div>
                <ul className="space-y-3 text-sm font-medium text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span><strong className="text-foreground">Unrestricted</strong> operational control</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Global personnel management</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Security protocol configuration</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-6 border-x border-border/50 px-12">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                  </div>
                  <h4 className="font-black uppercase text-xs tracking-widest">Area Manager</h4>
                </div>
                <ul className="space-y-3 text-sm font-medium text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>Total inventory oversight</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>Local staff management</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>Node performance metrics</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-black uppercase text-xs tracking-widest">Floor Personnel</h4>
                </div>
                <ul className="space-y-3 text-sm font-medium text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>Real-time registry lookup</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>Active QR synchronization</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>Stock allocation requests</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forms Modal */}
      {(showCreateForm || editingEmployee) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-500">
          <div className="w-full max-w-2xl rounded-[2.5rem] border border-border bg-card p-12 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-2">
                <h3 className="text-4xl font-black tracking-tighter">
                  {editingEmployee ? 'Adjust Identity' : 'Initialize Personnel'}
                </h3>
                <p className="text-muted-foreground font-medium italic underline decoration-primary/10 underline-offset-4">Configure system credentials and administrative clearance levels.</p>
              </div>
              <button
                onClick={resetForm}
                className="p-3 rounded-full hover:bg-secondary transition-all active:rotate-90"
              >
                <X className="h-7 w-7" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-1">Legal Entity Display Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-12 bg-secondary/30 border border-border rounded-xl px-5 py-3 text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-1">Communication Bridge (Email)</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-12 bg-secondary/30 border border-border rounded-xl px-5 py-3 text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-1">Access Cipher (Password)</label>
                  <input
                    type="password"
                    required={!editingEmployee}
                    placeholder={editingEmployee ? "Leave empty to maintain" : "Minimum 8 characters"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-12 bg-secondary/30 border border-border rounded-xl px-5 py-3 text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-1">Clearance Designation</label>
                  <div className="relative">
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full h-12 bg-secondary/30 border border-border rounded-xl px-5 py-3 text-sm font-black focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none"
                    >
                      {user?.role === 'owner' && (
                        <>
                          <option value="manager">Regional Manager</option>
                          {editingEmployee?.role === 'employee' && (
                            <option value="employee">Fleet Personnel</option>
                          )}
                        </>
                      )}
                      {user?.role === 'manager' && (
                        <option value="employee">Fleet Personnel</option>
                      )}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {user?.role === 'owner' && formData.role === 'manager' && (
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 px-1">Primary Node Assignment</label>
                    <div className="relative">
                      <select
                        value={formData.store}
                        onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                        required
                        className="w-full h-12 bg-secondary/30 border border-border rounded-xl px-5 py-3 text-sm font-black focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none"
                      >
                        <option value="">Select Target Node</option>
                        {stores.map((store) => (
                          <option key={store._id} value={store._id}>
                            {store.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-6 pt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 h-14 rounded-2xl bg-secondary text-foreground font-black text-sm uppercase tracking-widest hover:bg-muted transition-all active:scale-95"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-[2] h-14 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all"
                >
                  {editingEmployee ? 'Commit Adjustments' : 'Initialize Protocol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees
