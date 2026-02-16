import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import { 
  PlusIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

const Stores = () => {
  const { user } = useAuth()
  const { stores, currentStore, createStore, updateStore, deleteStore, selectStore } = useStore()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingStore, setEditingStore] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  })

  // Only owners and managers can access stores
  if (user?.role === 'employee') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-yellow-800">Access Restricted</h3>
        <p className="text-sm text-yellow-600 mt-1">
          Employees do not have permission to manage stores. Please contact your manager or owner.
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
    if (window.confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      await deleteStore(storeId)
    }
  }

  const handleSelectStore = (store) => {
    selectStore(store)
  }

  const StoreCard = ({ store }) => (
    <div className={`bg-white rounded-lg shadow p-6 border-2 transition-all ${
      currentStore?.id === store.id ? 'border-blue-500 bg-blue-50' : 'border-transparent'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <BuildingStorefrontIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">{store.name}</h3>
              <p className="text-sm text-gray-500">Store ID: {store.id}</p>
            </div>
          </div>
          
          {store.address && (
            <div className="mt-3 flex items-center text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {store.address}
            </div>
          )}
          
          {store.phone && (
            <div className="mt-1 text-sm text-gray-600">
              Phone: {store.phone}
            </div>
          )}
          
          {store.email && (
            <div className="mt-1 text-sm text-gray-600">
              Email: {store.email}
            </div>
          )}
          
          <div className="mt-3 text-xs text-gray-500">
            Created: {new Date(store.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 ml-4">
          {currentStore?.id !== store.id && (
            <button
              onClick={() => handleSelectStore(store)}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Select
            </button>
          )}
          
          {user?.role === 'owner' && (
            <>
              <button
                onClick={() => handleEdit(store)}
                className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(store.id)}
                className="p-1 text-gray-600 hover:text-red-600 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
      
      {currentStore?.id === store.id && (
        <div className="mt-3 flex items-center text-sm text-blue-600">
          <CheckIcon className="h-4 w-4 mr-1" />
          Currently selected store
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
          <p className="text-gray-600">Manage your store locations</p>
        </div>
        
        {user?.role === 'owner' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Store
          </button>
        )}
      </div>

      {/* Current Store Indicator */}
      {currentStore && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <BuildingStorefrontIcon className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">
              Currently managing: {currentStore.name}
            </span>
          </div>
        </div>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || editingStore) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingStore ? 'Edit Store' : 'Create New Store'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Store Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                id="address"
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingStore(null)
                  setFormData({ name: '', address: '', phone: '', email: '' })
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingStore ? 'Update Store' : 'Create Store'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.length > 0 ? (
          stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No stores</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first store.
            </p>
            {user?.role === 'owner' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Store
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Stores
