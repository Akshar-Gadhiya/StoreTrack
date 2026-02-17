import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import { useItem } from '../contexts/ItemContext'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  TableCellsIcon,
  CubeIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  QrCodeIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

const Items = () => {
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
  const [showStoreWarning, setShowStoreWarning] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    quantity: 0,
    lowStockThreshold: 10,
    price: '',
    supplier: '',
    expiryDate: '',
    location: {
      section: '',
      rack: '',
      shelf: '',
      bin: ''
    },
    images: []
  })

  useEffect(() => {
    const searchOptions = {
      ...filters
    }

    if (currentStore) {
      searchOptions.storeId = currentStore.id
    }

    const filtered = searchItems(searchQuery, searchOptions)
    setFilteredItems(filtered)
  }, [searchQuery, filters, items, currentStore, searchItems])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const itemData = {
      ...formData,
      storeId: currentStore?.id,
      itemCode: `ITM-${Date.now().toString().slice(-6)}`,
      quantity: parseInt(formData.quantity),
      lowStockThreshold: parseInt(formData.lowStockThreshold),
      price: formData.price ? parseFloat(formData.price) : null
    }

    if (editingItem) {
      await updateItem(editingItem.id, itemData)
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
      description: '',
      quantity: 0,
      lowStockThreshold: 10,
      price: '',
      supplier: '',
      expiryDate: '',
      location: {
        section: '',
        rack: '',
        shelf: '',
        bin: ''
      },
      images: []
    })
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category || '',
      description: item.description || '',
      quantity: item.quantity,
      lowStockThreshold: item.lowStockThreshold || 10,
      price: item.price || '',
      supplier: item.supplier || '',
      expiryDate: item.expiryDate || '',
      location: item.location || { section: '', rack: '', shelf: '', bin: '' },
      images: item.images || []
    })
  }

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteItem(itemId)
    }
  }

  const handleQuantityUpdate = async (itemId, change) => {
    await updateQuantity(itemId, Math.abs(change), change > 0 ? 'add' : 'subtract')
  }

  const viewItemDetails = (item) => {
    setSelectedItem(item)
    setShowItemModal(true)
  }

  const ItemCard = ({ item }) => (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{item.name}</h3>
          <p className="text-sm text-gray-500">Code: {item.itemCode}</p>
        </div>
        <div className={`px-2 py-1 text-xs rounded-full ${item.quantity === 0 ? 'bg-red-100 text-red-800' :
          item.quantity <= (item.lowStockThreshold || 10) ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
          {item.quantity === 0 ? 'Out of Stock' :
            item.quantity <= (item.lowStockThreshold || 10) ? 'Low Stock' : 'In Stock'}
        </div>
      </div>

      {item.images && item.images.length > 0 && (
        <div className="mb-3">
          <img
            src={item.images[0]}
            alt={item.name}
            className="w-full h-32 object-cover rounded"
          />
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Quantity:</span>
          <span className="font-medium">{item.quantity}</span>
        </div>
        {item.category && (
          <div className="flex justify-between">
            <span className="text-gray-600">Category:</span>
            <span>{item.category}</span>
          </div>
        )}
        {item.price && (
          <div className="flex justify-between">
            <span className="text-gray-600">Price:</span>
            <span>${item.price.toFixed(2)}</span>
          </div>
        )}
        {item.location && (
          <div className="text-xs text-gray-500">
            📍 {item.location.section} → {item.location.rack} → {item.location.shelf} → {item.location.bin}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between">
        <div className="flex space-x-1">
          <button
            onClick={() => viewItemDetails(item)}
            className="p-1 text-gray-600 hover:text-blue-600"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          {user?.role !== 'employee' && (
            <>
              <button
                onClick={() => handleEdit(item)}
                className="p-1 text-gray-600 hover:text-blue-600"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1 text-gray-600 hover:text-red-600"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        {user?.role !== 'employee' && (
          <div className="flex space-x-1">
            <button
              onClick={() => handleQuantityUpdate(item.id, -1)}
              className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              -
            </button>
            <button
              onClick={() => handleQuantityUpdate(item.id, 1)}
              className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const ItemTableRow = ({ item }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {item.images && item.images.length > 0 ? (
            <img src={item.images[0]} alt={item.name} className="h-10 w-10 rounded object-cover mr-3" />
          ) : (
            <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center mr-3">
              <PhotoIcon className="h-6 w-6 text-gray-400" />
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{item.name}</div>
            <div className="text-sm text-gray-500">{item.itemCode}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {item.category || '-'}
      </td>
      {!currentStore && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {stores.find(s => s.id === item.storeId)?.name || '-'}
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${item.quantity === 0 ? 'bg-red-100 text-red-800' :
          item.quantity <= (item.lowStockThreshold || 10) ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
          {item.quantity}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {item.price ? `$${item.price.toFixed(2)}` : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {item.location ? `${item.location.section} → ${item.location.rack}` : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex space-x-2">
          <button
            onClick={() => viewItemDetails(item)}
            className="text-blue-600 hover:text-blue-900"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          {user?.role !== 'employee' && (
            <>
              <button
                onClick={() => handleEdit(item)}
                className="text-blue-600 hover:text-blue-900"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:text-red-900"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Items</h1>
          <p className="text-gray-600">Manage your inventory items</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={currentStore?.id || ''}
              onChange={(e) => {
                const val = e.target.value
                if (val === "") {
                  selectStore(null)
                } else {
                  const store = stores.find(s => s.id === val)
                  if (store) selectStore(store)
                }
              }}
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Stores</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {user?.role !== 'employee' && (
            <button
              onClick={() => {
                if (!currentStore) {
                  setShowStoreWarning(true)
                  setTimeout(() => setShowStoreWarning(false), 3000)
                  return
                }
                setShowCreateForm(true)
              }}
              className={`flex items-center px-4 py-2 text-white rounded-lg transition-all duration-200 ${!currentStore
                  ? 'bg-slate-400 cursor-pointer hover:bg-slate-500'
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Item
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>

            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 ${viewMode === 'card' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <TableCellsIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.lowStock}
                onChange={(e) => setFilters({ ...filters, lowStock: e.target.checked })}
                className="mr-2"
              />
              Low Stock Only
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.outOfStock}
                onChange={(e) => setFilters({ ...filters, outOfStock: e.target.checked })}
                className="mr-2"
              />
              Out of Stock Only
            </label>
          </div>
        )}
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingItem) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                <input
                  type="number"
                  min="0"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                <input
                  type="text"
                  placeholder="Section"
                  value={formData.location.section}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, section: e.target.value }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Rack"
                  value={formData.location.rack}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, rack: e.target.value }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Shelf"
                  value={formData.location.shelf}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, shelf: e.target.value }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Bin"
                  value={formData.location.bin}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, bin: e.target.value }
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingItem(null)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items Display */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || filters.category || filters.lowStock || filters.outOfStock
              ? 'Try adjusting your search or filters.'
              : 'Get started by adding your first item.'}
          </p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                {!currentStore && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <ItemTableRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Item Details Modal */}
      {showItemModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedItem.name}</h2>
                <button
                  onClick={() => setShowItemModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {selectedItem.qrCode && (
                <div className="mb-4 text-center">
                  <img src={selectedItem.qrCode} alt="QR Code" className="mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">QR Code for scanning</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Item Code:</span> {selectedItem.itemCode}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {selectedItem.category || '-'}
                </div>
                <div>
                  <span className="font-medium">Quantity:</span> {selectedItem.quantity}
                </div>
                <div>
                  <span className="font-medium">Price:</span> {selectedItem.price ? `$${selectedItem.price.toFixed(2)}` : '-'}
                </div>
                <div>
                  <span className="font-medium">Supplier:</span> {selectedItem.supplier || '-'}
                </div>
                <div>
                  <span className="font-medium">Expiry Date:</span> {selectedItem.expiryDate || '-'}
                </div>
              </div>

              {selectedItem.description && (
                <div className="mt-4">
                  <span className="font-medium">Description:</span>
                  <p className="text-gray-600 mt-1">{selectedItem.description}</p>
                </div>
              )}

              {selectedItem.location && (
                <div className="mt-4">
                  <span className="font-medium">Location:</span>
                  <p className="text-gray-600 mt-1">
                    {selectedItem.location.section} → {selectedItem.location.rack} → {selectedItem.location.shelf} → {selectedItem.location.bin}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Store Selection Warning Popup */}
      <div
        className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${showStoreWarning
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
      >
        <div className="bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 border border-slate-700">
          <div className="bg-yellow-500 rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-900" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium">Please select a store first</span>
        </div>
      </div>
    </div>
  )
}

export default Items
