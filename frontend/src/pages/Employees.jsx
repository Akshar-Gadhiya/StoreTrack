import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
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
  Briefcase
} from 'lucide-react'

const API_URL = 'http://localhost:5000/api'

const Employees = () => {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
  })

  // Only owners and managers can access employees
  if (user?.role === 'employee') {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-12 flex flex-col items-center text-center max-w-2xl mx-auto mt-20 shadow-sm animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-destructive/10 p-4 rounded-full mb-6">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="text-2xl font-bold text-destructive">Unauthorized Access</h3>
        <p className="text-muted-foreground mt-4 leading-relaxed text-lg max-w-md">
          Team management is reserved for administrators and executives. Please consult your supervisor for role modifications.
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
    loadEmployees()
  }, [])

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
    setFormData({ name: '', email: '', password: '', role: 'employee' })
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Shield className="h-3 w-3" /> Owner
          </span>
        )
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider">
            <Briefcase className="h-3 w-3" /> Manager
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <Users className="h-3 w-3" /> Employee
          </span>
        )
    }
  }

  const EmployeeRow = ({ employee }) => (
    <tr className="group hover:bg-muted/30 transition-colors border-b border-border">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 flex-shrink-0 bg-secondary rounded-full flex items-center justify-center border border-border group-hover:border-primary/20 transition-all">
            <span className="text-secondary-foreground font-bold text-sm">
              {employee.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">{employee.name}</span>
            <span className="text-xs text-muted-foreground font-mono">ID: {employee._id.slice(-6)}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          <Mail className="h-3 w-3" />
          {employee.email}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getRoleBadge(employee.role)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-xs text-muted-foreground">
          Joined {new Date(employee.createdAt).toLocaleDateString()}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {user?.role === 'owner' && (
            <>
              <button
                onClick={() => handleEdit(employee)}
                className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                title="Edit Access"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(employee._id)}
                className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                title="Revoke Access"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
          <button className="p-2 rounded-md hover:bg-secondary text-muted-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight">Team Personnel</h1>
          <p className="text-muted-foreground text-lg underline decoration-primary/10 underline-offset-8">Manage organizational access and personnel roles.</p>
        </div>

        {user?.role === 'owner' && (
          <button
            onClick={() => { setShowCreateForm(true); setEditingEmployee(null); }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-0"
          >
            <UserPlus className="h-5 w-5" />
            Add Member
          </button>
        )}
      </div>



      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-input rounded-lg pl-10 pr-4 py-2 text-sm transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-all">
            <Filter className="h-4 w-4" />
            Category
          </button>
          <button className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-all text-nowrap">
            <ArrowUpDown className="h-4 w-4" />
            Sorted by Name
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xl shadow-black/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Team Member</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Contact</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">System Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Since</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-10 w-10 text-primary animate-spin" />
                      <span className="text-muted-foreground font-medium">Synchronizing personnel data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="bg-secondary p-4 rounded-full">
                        <Users className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-bold tracking-tight">Empty Roster</h4>
                        <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                          {searchQuery ? "No members match your criteria." : "Start populating your team registry to begin collaboration."}
                        </p>
                      </div>
                      {user?.role === 'owner' && !searchQuery && (
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="mt-2 rounded-lg bg-primary px-6 py-2 text-sm font-bold text-primary-foreground transition-all hover:scale-105"
                        >
                          Initialize First User
                        </button>
                      )}
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
          <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Total Personnel: <span className="text-foreground">{filteredEmployees.length}</span>
            </p>
            <div className="flex gap-2">
              <button className="h-8 w-8 rounded-md border border-border bg-background flex items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-50" disabled>
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
              <button className="h-8 w-8 rounded-md border border-border bg-background flex items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-50" disabled>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Permissions Guide */}
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.01] p-8 shadow-inner">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Access Control & Permissions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-all">
                <Shield className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-all" />
              </div>
              <h4 className="font-bold uppercase text-xs tracking-widest">System Owner</h4>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">• <span className="text-foreground font-semibold italic underline decoration-primary/20">Absolute</span> control over all facets</li>
              <li className="flex items-start gap-2">• Full organizational management</li>
              <li className="flex items-start gap-2">• Destructive data capabilities</li>
            </ul>
          </div>
          <div className="space-y-4 border-x border-border/50 px-8">
            <div className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-600 transition-all">
                <Briefcase className="h-4 w-4 text-purple-600 group-hover:text-white transition-all" />
              </div>
              <h4 className="font-bold uppercase text-xs tracking-widest">Area Manager</h4>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">• Complete inventory oversight</li>
              <li className="flex items-start gap-2">• Operational metric visibility</li>
              <li className="flex items-start gap-2">• Staff coordination privileges</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-all">
                <Users className="h-4 w-4 text-blue-600 group-hover:text-white transition-all" />
              </div>
              <h4 className="font-bold uppercase text-xs tracking-widest">Floor Personnel</h4>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">• Read-only registry visibility</li>
              <li className="flex items-start gap-2">• Active QR synchronization</li>
              <li className="flex items-start gap-2">• Inventory search capability</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Forms Modal */}
      {(showCreateForm || editingEmployee) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-10 shadow-2xl shadow-black/20 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-3xl font-bold tracking-tight">
                  {editingEmployee ? 'Adjust Personnel' : 'Initialize Member'}
                </h3>
                <p className="text-sm text-muted-foreground">Configure system credentials and access levels.</p>
              </div>
              <button
                onClick={resetForm}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Full Display Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter legal name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Corporate Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">System Access Pass</label>
                  <input
                    type="password"
                    required={!editingEmployee}
                    placeholder={editingEmployee ? "Leave empty for no change" : "Minimum 8 characters"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Assigned Rank</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm appearance-none"
                  >
                    <option value="employee">Standard Personnel</option>
                    <option value="manager">Regional Manager</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-xl border border-border bg-secondary py-3.5 text-sm font-bold tracking-tight hover:bg-secondary/70 transition-colors"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-3.5 text-sm font-bold tracking-tight text-primary-foreground shadow-lg shadow-primary/20 hover:translate-y-[-2px] hover:shadow-primary/30 active:translate-y-0 transition-all"
                >
                  {editingEmployee ? 'Commit Adjustments' : 'Authorize Member'}
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
