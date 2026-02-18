import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const StoreContext = createContext()

export const useStore = () => {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}

export const StoreProvider = ({ children }) => {
  const { user } = useAuth()
  const [stores, setStores] = useState([])
  const [currentStore, setCurrentStore] = useState(null)

  useEffect(() => {
    // Load stores from localStorage
    const storedStores = localStorage.getItem('storetrack_stores')
    if (storedStores) {
      setStores(JSON.parse(storedStores))
    }

    // Load current store
    const storedCurrentStore = localStorage.getItem('storetrack_current_store')
    if (storedCurrentStore) {
      setCurrentStore(JSON.parse(storedCurrentStore))
    }
  }, [])

  // Auto-select store for employees
  useEffect(() => {
    if (user?.role === 'employee' && user?.storeId && stores.length > 0) {
      const assignedStore = stores.find(s => s.id === user.storeId)
      if (assignedStore && (!currentStore || currentStore.id !== assignedStore.id)) {
        setCurrentStore(assignedStore)
        localStorage.setItem('storetrack_current_store', JSON.stringify(assignedStore))
      }
    }
  }, [user, stores, currentStore])

  const createStore = (storeData) => {
    const newStore = {
      id: Date.now().toString(),
      ...storeData,
      createdAt: new Date().toISOString(),
      sections: []
    }

    const updatedStores = [...stores, newStore]
    setStores(updatedStores)
    localStorage.setItem('storetrack_stores', JSON.stringify(updatedStores))

    return { success: true, store: newStore }
  }

  const updateStore = (storeId, updates) => {
    const updatedStores = stores.map(store =>
      store.id === storeId ? { ...store, ...updates } : store
    )
    setStores(updatedStores)
    localStorage.setItem('storetrack_stores', JSON.stringify(updatedStores))

    if (currentStore?.id === storeId) {
      const updatedCurrentStore = { ...currentStore, ...updates }
      setCurrentStore(updatedCurrentStore)
      localStorage.setItem('storetrack_current_store', JSON.stringify(updatedCurrentStore))
    }

    return { success: true }
  }

  const deleteStore = (storeId) => {
    const updatedStores = stores.filter(store => store.id !== storeId)
    setStores(updatedStores)
    localStorage.setItem('storetrack_stores', JSON.stringify(updatedStores))

    if (currentStore?.id === storeId) {
      setCurrentStore(null)
      localStorage.removeItem('storetrack_current_store')
    }

    return { success: true }
  }

  const selectStore = (store) => {
    setCurrentStore(store)
    if (store) {
      localStorage.setItem('storetrack_current_store', JSON.stringify(store))
    } else {
      localStorage.removeItem('storetrack_current_store')
    }
  }

  const addSection = (storeId, sectionData) => {
    const newSection = {
      id: Date.now().toString(),
      ...sectionData,
      racks: []
    }

    const updatedStores = stores.map(store =>
      store.id === storeId
        ? { ...store, sections: [...store.sections, newSection] }
        : store
    )

    setStores(updatedStores)
    localStorage.setItem('storetrack_stores', JSON.stringify(updatedStores))

    return { success: true, section: newSection }
  }

  const addRack = (storeId, sectionId, rackData) => {
    const newRack = {
      id: Date.now().toString(),
      ...rackData,
      shelves: []
    }

    const updatedStores = stores.map(store => {
      if (store.id === storeId) {
        return {
          ...store,
          sections: store.sections.map(section =>
            section.id === sectionId
              ? { ...section, racks: [...section.racks, newRack] }
              : section
          )
        }
      }
      return store
    })

    setStores(updatedStores)
    localStorage.setItem('storetrack_stores', JSON.stringify(updatedStores))

    return { success: true, rack: newRack }
  }

  const addShelf = (storeId, sectionId, rackId, shelfData) => {
    const newShelf = {
      id: Date.now().toString(),
      ...shelfData,
      bins: []
    }

    const updatedStores = stores.map(store => {
      if (store.id === storeId) {
        return {
          ...store,
          sections: store.sections.map(section => {
            if (section.id === sectionId) {
              return {
                ...section,
                racks: section.racks.map(rack =>
                  rack.id === rackId
                    ? { ...rack, shelves: [...rack.shelves, newShelf] }
                    : rack
                )
              }
            }
            return section
          })
        }
      }
      return store
    })

    setStores(updatedStores)
    localStorage.setItem('storetrack_stores', JSON.stringify(updatedStores))

    return { success: true, shelf: newShelf }
  }

  const value = {
    stores,
    currentStore,
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
