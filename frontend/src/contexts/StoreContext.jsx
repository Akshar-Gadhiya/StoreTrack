import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'

const StoreContext = createContext()

export const useStore = () => {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}

const API_URL = 'http://localhost:5000/api'

export const StoreProvider = ({ children }) => {
  const { user } = useAuth()
  const [stores, setStores] = useState([])
  const [currentStore, setCurrentStore] = useState(null)
  const [loading, setLoading] = useState(false)

  const getHeaders = () => {
    const token = localStorage.getItem('storetrack_token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  const fetchStores = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/stores`, {
        headers: getHeaders()
      })
      const data = await response.json()
      if (response.ok) {
        setStores(data)
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchStores()
    }
  }, [user])

  useEffect(() => {
    // Load current store from localStorage (still useful for UI state)
    const storedCurrentStore = localStorage.getItem('storetrack_current_store')
    if (storedCurrentStore) {
      setCurrentStore(JSON.parse(storedCurrentStore))
    }
  }, [])

  // Auto-select store for employees and managers
  useEffect(() => {
    // For managers and employees - use user.store (which is set when they log in)
    if ((user?.role === 'manager' || user?.role === 'employee') && user?.store && stores.length > 0) {
      const assignedStore = stores.find(s => s._id === (user.store._id || user.store))
      if (assignedStore && (!currentStore || currentStore._id !== assignedStore._id)) {
        setCurrentStore(assignedStore)
        localStorage.setItem('storetrack_current_store', JSON.stringify(assignedStore))
      }
    }
  }, [user, stores, currentStore])

  const createStore = async (storeData) => {
    try {
      const response = await fetch(`${API_URL}/stores`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(storeData)
      })
      const data = await response.json()
      if (response.ok) {
        setStores([...stores, data])
        toast.success(`Store "${data.name}" initialized successfully`)
        return { success: true, store: data }
      } else {
        toast.error(data.message || 'Failed to create store')
        return { success: false, error: data.message }
      }
    } catch (error) {
      toast.error('Server connection failed')
      return { success: false, error: 'Server connection failed' }
    }
  }

  const updateStore = async (storeId, updates) => {
    try {
      const response = await fetch(`${API_URL}/stores/${storeId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      })
      const data = await response.json()
      if (response.ok) {
        const updatedStores = stores.map(store =>
          store._id === storeId ? data : store
        )
        setStores(updatedStores)
        if (currentStore?._id === storeId) {
          setCurrentStore(data)
          localStorage.setItem('storetrack_current_store', JSON.stringify(data))
        }
        toast.success(`Store "${data.name}" updated`)
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

  const deleteStore = async (storeId) => {
    try {
      const response = await fetch(`${API_URL}/stores/${storeId}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      if (response.ok) {
        setStores(stores.filter(store => store._id !== storeId))
        if (currentStore?._id === storeId) {
          setCurrentStore(null)
          localStorage.removeItem('storetrack_current_store')
        }
        toast.success('Store deleted')
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

  const selectStore = (store) => {
    setCurrentStore(store)
    if (store) {
      localStorage.setItem('storetrack_current_store', JSON.stringify(store))
    } else {
      localStorage.removeItem('storetrack_current_store')
    }
  }

  // Frontend-only section management for now, matching backend's simple implementation
  const addSection = async (storeId, sectionData) => {
    const store = stores.find(s => s._id === storeId)
    if (!store) return { success: false, error: 'Store not found' }

    const updatedSections = [...(store.sections || []), sectionData]
    return await updateStore(storeId, { sections: updatedSections })
  }

  const addRack = async (storeId, sectionId, rackData) => {
    // This would require more complex nested update on backend
    // Simplified for current UI logic
    return { success: false, error: 'Full nesting not supported yet' }
  }

  const addShelf = async (storeId, sectionId, rackId, shelfData) => {
    return { success: false, error: 'Full nesting not supported yet' }
  }

  const value = {
    stores,
    currentStore,
    loading,
    createStore,
    updateStore,
    deleteStore,
    selectStore,
    addSection,
    addRack,
    addShelf
  }

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}
