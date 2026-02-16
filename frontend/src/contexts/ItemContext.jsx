import { createContext, useContext, useState, useEffect } from 'react'
import QRCode from 'qrcode'

const ItemContext = createContext()

export const useItem = () => {
  const context = useContext(ItemContext)
  if (!context) {
    throw new Error('useItem must be used within an ItemProvider')
  }
  return context
}

export const ItemProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const [viewMode, setViewMode] = useState('card') // 'card' or 'table'

  useEffect(() => {
    // Load items from localStorage
    const storedItems = localStorage.getItem('storetrack_items')
    if (storedItems) {
      setItems(JSON.parse(storedItems))
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
    const itemId = Date.now().toString()
    const qrCodeUrl = await generateQRCode(itemId)
    
    const newItem = {
      id: itemId,
      ...itemData,
      qrCode: qrCodeUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    }
    
    const updatedItems = [...items, newItem]
    setItems(updatedItems)
    localStorage.setItem('storetrack_items', JSON.stringify(updatedItems))
    
    // Add to activity log
    addActivityLog({
      action: 'add',
      itemId: newItem.id,
      itemName: newItem.name,
      details: `Added new item: ${newItem.name}`
    })
    
    return { success: true, item: newItem }
  }

  const updateItem = (itemId, updates, userId) => {
    const existingItem = items.find(item => item.id === itemId)
    if (!existingItem) {
      return { success: false, error: 'Item not found' }
    }
    
    const updatedItems = items.map(item =>
      item.id === itemId 
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item
    )
    
    setItems(updatedItems)
    localStorage.setItem('storetrack_items', JSON.stringify(updatedItems))
    
    // Add to activity log
    addActivityLog({
      action: 'update',
      itemId: itemId,
      itemName: existingItem.name,
      details: `Updated item: ${existingItem.name}`,
      oldValue: existingItem,
      newValue: { ...existingItem, ...updates }
    })
    
    return { success: true }
  }

  const deleteItem = (itemId) => {
    const existingItem = items.find(item => item.id === itemId)
    if (!existingItem) {
      return { success: false, error: 'Item not found' }
    }
    
    const updatedItems = items.filter(item => item.id !== itemId)
    setItems(updatedItems)
    localStorage.setItem('storetrack_items', JSON.stringify(updatedItems))
    
    // Add to activity log
    addActivityLog({
      action: 'delete',
      itemId: itemId,
      itemName: existingItem.name,
      details: `Deleted item: ${existingItem.name}`
    })
    
    return { success: true }
  }

  const updateQuantity = (itemId, newQuantity, operation = 'set') => {
    const existingItem = items.find(item => item.id === itemId)
    if (!existingItem) {
      return { success: false, error: 'Item not found' }
    }
    
    const oldQuantity = existingItem.quantity
    let updatedQuantity = newQuantity
    
    if (operation === 'add') {
      updatedQuantity = oldQuantity + newQuantity
    } else if (operation === 'subtract') {
      updatedQuantity = Math.max(0, oldQuantity - newQuantity)
    }
    
    const updatedItems = items.map(item =>
      item.id === itemId 
        ? { ...item, quantity: updatedQuantity, updatedAt: new Date().toISOString() }
        : item
    )
    
    setItems(updatedItems)
    localStorage.setItem('storetrack_items', JSON.stringify(updatedItems))
    
    // Add to activity log
    addActivityLog({
      action: 'quantity_change',
      itemId: itemId,
      itemName: existingItem.name,
      details: `Quantity changed from ${oldQuantity} to ${updatedQuantity}`,
      oldValue: oldQuantity,
      newValue: updatedQuantity
    })
    
    return { success: true, oldQuantity, newQuantity: updatedQuantity }
  }

  const moveItem = (itemId, newLocation) => {
    const existingItem = items.find(item => item.id === itemId)
    if (!existingItem) {
      return { success: false, error: 'Item not found' }
    }
    
    const oldLocation = existingItem.location
    
    const updatedItems = items.map(item =>
      item.id === itemId 
        ? { ...item, location: newLocation, updatedAt: new Date().toISOString() }
        : item
    )
    
    setItems(updatedItems)
    localStorage.setItem('storetrack_items', JSON.stringify(updatedItems))
    
    // Add to activity log
    addActivityLog({
      action: 'move',
      itemId: itemId,
      itemName: existingItem.name,
      details: `Moved from ${JSON.stringify(oldLocation)} to ${JSON.stringify(newLocation)}`,
      oldValue: oldLocation,
      newValue: newLocation
    })
    
    return { success: true }
  }

  const addActivityLog = (logData) => {
    const logs = JSON.parse(localStorage.getItem('storetrack_activity_logs') || '[]')
    const newLog = {
      id: Date.now().toString(),
      ...logData,
      timestamp: new Date().toISOString(),
      userId: logData.userId || 'current_user' // This would come from auth context
    }
    
    logs.unshift(newLog) // Add to beginning
    
    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.splice(1000)
    }
    
    localStorage.setItem('storetrack_activity_logs', JSON.stringify(logs))
  }

  const getActivityLogs = (limit = 50) => {
    const logs = JSON.parse(localStorage.getItem('storetrack_activity_logs') || '[]')
    return logs.slice(0, limit)
  }

  const searchItems = (query, filters = {}) => {
    let filteredItems = [...items]
    
    // Text search
    if (query) {
      const lowerQuery = query.toLowerCase()
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.category?.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery) ||
        item.itemCode?.toLowerCase().includes(lowerQuery)
      )
    }
    
    // Apply filters
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
