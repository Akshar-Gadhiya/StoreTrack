import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  UserCircleIcon,
  EnvelopeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const API_URL = 'http://localhost:5000/api'

const Employees = () => {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-yellow-800">Access Restricted</h3>
        <p className="text-sm text-yellow-600 mt-1">
          Employees do not have permission to manage other employees. Please contact your manager or owner.
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
        setError(data.message || 'Failed to load employees')
      }
    } catch (err) {
      setError('Server connection failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (editingEmployee) {
      try {
        const payload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        }
        if (formData.password) {
          payload.password = formData.password
        }

        const response = await fetch(`${API_URL}/users/${editingEmployee._id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        })
        const data = await response.json()
        if (response.ok) {
          resetForm()
          loadEmployees()
        } else {
          setError(data.message || 'Failed to update employee')
        }
      } catch (err) {
        setError('Server connection failed')
      }
    } else {
      try {
        const response = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          })
        })
        const data = await response.json()
        if (response.ok) {
          resetForm()
          loadEmployees()
        } else {
          setError(data.message || 'Failed to create employee')
        }
      } catch (err) {
        setError('Server connection failed')
      }
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
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      setError('')
      try {
        const response = await fetch(`${API_URL}/users/${employeeId}`, {
          method: 'DELETE',
          headers: getHeaders()
        })
        if (response.ok) {
          loadEmployees()
        } else {
          const data = await response.json()
          setError(data.message || 'Failed to delete employee')
        }
      } catch (err) {
        setError('Server connection failed')
      }
    }
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'employee' })
    setEditingEmployee(null)
    setShowCreateForm(false)
    setError('')
  }

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'manager':
        return 'bg-purple-100 text-purple-800'
      case 'employee':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const EmployeeCard = ({ employee }) => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <UserCircleIcon className="h-12 w-12 text-gray-400 mr-4" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">{employee.name}</h3>
            <p className="text-sm text-gray-500">{employee.email}</p>
            <div className="mt-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(employee.role)}`}>
                {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          {user?.role === 'owner' && (
            <>
              <button
                onClick={() => handleEdit(employee)}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(employee._id)}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <EnvelopeIcon className="h-4 w-4 mr-2" />
          {employee.email}
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <ShieldCheckIcon className="h-4 w-4 mr-2" />
          {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)} Access
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Joined: {new Date(employee.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600">Manage your team members</p>
        </div>

        {user?.role === 'owner' && (
          <button
            onClick={() => { setShowCreateForm(true); setEditingEmployee(null); setError('') }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Employee
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingEmployee) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password {editingEmployee ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  id="password"
                  required={!editingEmployee}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role *
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingEmployee ? 'Update Employee' : 'Add Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Loading employees...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? 'Try adjusting your search.'
              : 'Get started by adding your first employee.'}
          </p>
          {user?.role === 'owner' && !searchQuery && (
            <div className="mt-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Employee
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <EmployeeCard key={employee._id} employee={employee} />
          ))}
        </div>
      )}

      {/* Role Permissions Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-3">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800">Owner</h4>
            <ul className="mt-2 space-y-1 text-blue-700">
              <li>• Full system access</li>
              <li>• Manage all stores</li>
              <li>• Manage all users</li>
              <li>• Delete stores &amp; items</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800">Manager</h4>
            <ul className="mt-2 space-y-1 text-blue-700">
              <li>• Manage inventory</li>
              <li>• View reports</li>
              <li>• Manage employees</li>
              <li>• Cannot delete stores</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800">Employee</h4>
            <ul className="mt-2 space-y-1 text-blue-700">
              <li>• View items only</li>
              <li>• Scan QR codes</li>
              <li>• Search inventory</li>
              <li>• No edit permissions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Employees
