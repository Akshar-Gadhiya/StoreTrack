import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'

const ItemContext = createContext()

export const useItem = () => {
  const context = useContext(ItemContext)
  if (!context) {
    throw new Error('useItem must be used within an ItemProvider')
  }
  return context
}

const API_URL = 'http://localhost:5000/api'

export const ItemProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [viewMode, setViewMode] = useState('card')
  const [loading, setLoading] = useState(false)

  const getHeaders = () => {
    const token = localStorage.getItem('storetrack_token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/items`, {
        headers: getHeaders()
      })
      const data = await response.json()
      if (response.ok) {
        setItems(data)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/logs`, {
        headers: getHeaders()
      })
      const data = await response.json()
      if (response.ok) {
        setActivityLogs(data)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('storetrack_token')
    if (token) {
      fetchItems()
      fetchLogs()
    }
  }, [])

  const generateQRCode = async (itemId) => {
    try {
      const qrData = `storetrack://item/${itemId}`
      const qrCodeUrl = await QRCode.toDataURL(qrData)
      return qrCodeUrl
    } catch (error) {
      console.error('Error generating QR code:', error)
      return null
    }
  }

  const addItem = async (itemData) => {
    try {
      const response = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(itemData)
      })
      const data = await response.json()
      if (response.ok) {
        // Generate QR code with real ID
        const qrCode = await generateQRCode(data._id)
        const updatedItem = { ...data, qrCode }

        // Update item with QR code on backend
        await updateItem(data._id, { qrCode })

        setItems([...items, updatedItem])

        addActivityLog({
          action: 'add',
          itemId: data._id,
          itemName: data.name,
          details: `Added new item: ${data.name}`
        })

        toast.success(`SKU "${data.name}" initialized`)
        return { success: true, item: updatedItem }
      } else {
        toast.error(data.message || 'Initialization failed')
        return { success: false, error: data.message }
      }
    } catch (error) {
      toast.error('Server connection failed')
      return { success: false, error: 'Server connection failed' }
    }
  }

  const updateItem = async (itemId, updates) => {
    try {
      const response = await fetch(`${API_URL}/items/${itemId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      })
      const data = await response.json()
      if (response.ok) {
        const existingItem = items.find(item => item._id === itemId)
        const updatedItems = items.map(item =>
          item._id === itemId ? data : item
        )
        setItems(updatedItems)

        if (existingItem && !updates.qrCode) { // Only log if not just updating QR code
          addActivityLog({
            action: 'update',
            itemId: itemId,
            itemName: data.name,
            details: `Updated item: ${data.name}`,
            oldValue: existingItem,
            newValue: data
          })
          toast.success(`SKU "${data.name}" re-configured`)
        }

        return { success: true }
      } else {
        toast.error(data.message || 'Update failed')
        return { success: false, error: data.message }
      }
    } catch (error) {
      toast.error('Server connection failed')
      return { success: false, error: 'Server connection failed' }
    }
  }

  const deleteItem = async (itemId) => {
    try {
      const existingItem = items.find(item => item._id === itemId)
      const response = await fetch(`${API_URL}/items/${itemId}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      if (response.ok) {
        setItems(items.filter(item => item._id !== itemId))

        if (existingItem) {
          addActivityLog({
            action: 'delete',
            itemId: itemId,
            itemName: existingItem.name,
            details: `Deleted item: ${existingItem.name}`
          })
        }
        toast.success('SKU entity erased')
        return { success: true }
      } else {
        const data = await response.json()
        toast.error(data.message || 'Deletion failed')
        return { success: false, error: data.message }
      }
    } catch (error) {
      toast.error('Server connection failed')
      return { success: false, error: 'Server connection failed' }
    }
  }

  const updateQuantity = async (itemId, newQuantity, operation = 'set') => {
    const existingItem = items.find(item => item._id === itemId)
    if (!existingItem) {
      return { success: false, error: 'Item not found' }
    }

    let updatedQuantity = newQuantity
    if (operation === 'add') {
      updatedQuantity = existingItem.quantity + newQuantity
    } else if (operation === 'subtract') {
      updatedQuantity = Math.max(0, existingItem.quantity - newQuantity)
    }

    const result = await updateItem(itemId, { quantity: updatedQuantity })
    if (result.success) {
      addActivityLog({
        action: 'quantity_change',
        itemId: itemId,
        itemName: existingItem.name,
        details: `Quantity changed from ${existingItem.quantity} to ${updatedQuantity}`,
        oldValue: existingItem.quantity,
        newValue: updatedQuantity
      })
    }
    return result
  }

  const moveItem = async (itemId, newLocation) => {
    const existingItem = items.find(item => item._id === itemId)
    if (!existingItem) {
      return { success: false, error: 'Item not found' }
    }

    const result = await updateItem(itemId, { location: newLocation })
    if (result.success) {
      addActivityLog({
        action: 'move',
        itemId: itemId,
        itemName: existingItem.name,
        details: `Moved to new location`,
        oldValue: existingItem.location,
        newValue: newLocation
      })
    }
    return result
  }

  const addActivityLog = async (logData) => {
    try {
      const response = await fetch(`${API_URL}/logs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(logData)
      })
      const data = await response.json()
      if (response.ok) {
        setActivityLogs([data, ...activityLogs].slice(0, 1000))
      }
    } catch (error) {
      console.error('Error adding activity log:', error)
    }
  }

  const getActivityLogs = (limit = 50) => {
    return activityLogs.slice(0, limit)
  }

  const searchItems = (query, filters = {}) => {
    let filteredItems = [...items]

    if (query) {
      const lowerQuery = query.toLowerCase()
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.category?.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery) ||
        item.itemCode?.toLowerCase().includes(lowerQuery)
      )
    }

    if (filters.category) {
      filteredItems = filteredItems.filter(item => item.category === filters.category)
    }

    if (filters.storeId) {
      filteredItems = filteredItems.filter(item => item.storeId === filters.storeId)
    }

    if (filters.lowStock) {
      filteredItems = filteredItems.filter(item => item.quantity <= (item.lowStockThreshold || 10))
    }

    if (filters.outOfStock) {
      filteredItems = filteredItems.filter(item => item.quantity === 0)
    }

    if (filters.status) {
      filteredItems = filteredItems.filter(item => item.status === filters.status)
    }

    return filteredItems
  }

  const getLowStockItems = () => {
    return items.filter(item => item.quantity <= (item.lowStockThreshold || 10))
  }

  const getOutOfStockItems = () => {
    return items.filter(item => item.quantity === 0)
  }

  const getItemsByCategory = () => {
    const categoryCount = {}
    items.forEach(item => {
      const category = item.category || 'Uncategorized'
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })
    return categoryCount
  }

  const value = {
    items,
    loading,
    viewMode,
    setViewMode,
    addItem,
    updateItem,
    deleteItem,
    updateQuantity,
    moveItem,
    searchItems,
    getLowStockItems,
    getOutOfStockItems,
    getItemsByCategory,
    getActivityLogs
  }

  return (
    <ItemContext.Provider value={value}>
      {children}
    </ItemContext.Provider>
  )
}
