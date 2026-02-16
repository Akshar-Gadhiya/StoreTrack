// Initialize demo data for StoreTrack Pro
export const initDemoData = () => {
  // Initialize demo users if none exist
  const users = JSON.parse(localStorage.getItem('storetrack_users') || '[]')
  if (users.length === 0) {
    const demoUsers = [
      {
        id: '1',
        name: 'John Owner',
        email: 'owner@demo.com',
        password: 'password',
        role: 'owner',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Jane Manager',
        email: 'manager@demo.com',
        password: 'password',
        role: 'manager',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Bob Employee',
        email: 'employee@demo.com',
        password: 'password',
        role: 'employee',
        createdAt: new Date().toISOString()
      }
    ]
    localStorage.setItem('storetrack_users', JSON.stringify(demoUsers))
  }

  // Initialize demo stores if none exist
  const stores = JSON.parse(localStorage.getItem('storetrack_stores') || '[]')
  if (stores.length === 0) {
    const demoStores = [
      {
        id: '1',
        name: 'Main Store',
        address: '123 Main St, City, State 12345',
        phone: '+1 (555) 123-4567',
        email: 'main@storetrack.com',
        createdAt: new Date().toISOString(),
        sections: [
          {
            id: '1',
            name: 'Electronics',
            racks: [
              {
                id: '1',
                name: 'Rack A',
                shelves: [
                  {
                    id: '1',
                    name: 'Shelf 1',
                    bins: ['Bin 1', 'Bin 2', 'Bin 3']
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: '2',
        name: 'Warehouse',
        address: '456 Warehouse Ave, City, State 67890',
        phone: '+1 (555) 987-6543',
        email: 'warehouse@storetrack.com',
        createdAt: new Date().toISOString(),
        sections: []
      }
    ]
    localStorage.setItem('storetrack_stores', JSON.stringify(demoStores))
  }

  // Initialize demo items if none exist
  const items = JSON.parse(localStorage.getItem('storetrack_items') || '[]')
  if (items.length === 0) {
    const demoItems = [
      {
        id: '1',
        name: 'Laptop Pro 15"',
        category: 'Electronics',
        description: 'High-performance laptop with 16GB RAM and 512GB SSD',
        quantity: 15,
        lowStockThreshold: 5,
        price: 1299.99,
        supplier: 'TechSupplier Inc',
        expiryDate: '',
        itemCode: 'ITM-123456',
        storeId: '1',
        location: {
          section: 'Electronics',
          rack: 'Rack A',
          shelf: 'Shelf 1',
          bin: 'Bin 1'
        },
        images: [],
        qrCode: null,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Wireless Mouse',
        category: 'Electronics',
        description: 'Ergonomic wireless mouse with USB receiver',
        quantity: 50,
        lowStockThreshold: 10,
        price: 29.99,
        supplier: 'TechSupplier Inc',
        expiryDate: '',
        itemCode: 'ITM-234567',
        storeId: '1',
        location: {
          section: 'Electronics',
          rack: 'Rack A',
          shelf: 'Shelf 1',
          bin: 'Bin 2'
        },
        images: [],
        qrCode: null,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'USB-C Cable',
        category: 'Electronics',
        description: '1-meter USB-C charging cable',
        quantity: 3,
        lowStockThreshold: 10,
        price: 12.99,
        supplier: 'CableCo',
        expiryDate: '',
        itemCode: 'ITM-345678',
        storeId: '1',
        location: {
          section: 'Electronics',
          rack: 'Rack A',
          shelf: 'Shelf 1',
          bin: 'Bin 3'
        },
        images: [],
        qrCode: null,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Office Chair',
        category: 'Furniture',
        description: 'Ergonomic office chair with lumbar support',
        quantity: 8,
        lowStockThreshold: 3,
        price: 299.99,
        supplier: 'Furniture Plus',
        expiryDate: '',
        itemCode: 'ITM-456789',
        storeId: '2',
        location: {
          section: 'Furniture',
          rack: 'Rack B',
          shelf: 'Shelf 1',
          bin: 'Bin 1'
        },
        images: [],
        qrCode: null,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Desk Lamp',
        category: 'Furniture',
        description: 'LED desk lamp with adjustable brightness',
        quantity: 0,
        lowStockThreshold: 5,
        price: 45.99,
        supplier: 'Lighting Co',
        expiryDate: '',
        itemCode: 'ITM-567890',
        storeId: '2',
        location: {
          section: 'Furniture',
          rack: 'Rack B',
          shelf: 'Shelf 2',
          bin: 'Bin 1'
        },
        images: [],
        qrCode: null,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    localStorage.setItem('storetrack_items', JSON.stringify(demoItems))
  }

  // Initialize activity logs if none exist
  const logs = JSON.parse(localStorage.getItem('storetrack_activity_logs') || '[]')
  if (logs.length === 0) {
    const demoLogs = [
      {
        id: '1',
        action: 'add',
        itemId: '1',
        itemName: 'Laptop Pro 15"',
        details: 'Added new item: Laptop Pro 15"',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        userId: '1'
      },
      {
        id: '2',
        action: 'add',
        itemId: '2',
        itemName: 'Wireless Mouse',
        details: 'Added new item: Wireless Mouse',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        userId: '1'
      },
      {
        id: '3',
        action: 'quantity_change',
        itemId: '3',
        itemName: 'USB-C Cable',
        details: 'Quantity changed from 10 to 3',
        oldValue: 10,
        newValue: 3,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        userId: '2'
      },
      {
        id: '4',
        action: 'move',
        itemId: '4',
        itemName: 'Office Chair',
        details: 'Moved from Main Store to Warehouse',
        oldValue: { storeId: '1' },
        newValue: { storeId: '2' },
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        userId: '2'
      },
      {
        id: '5',
        action: 'add',
        itemId: '5',
        itemName: 'Desk Lamp',
        details: 'Added new item: Desk Lamp',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        userId: '1'
      }
    ]
    localStorage.setItem('storetrack_activity_logs', JSON.stringify(demoLogs))
  }
}

// Clear all data (for testing purposes)
export const clearAllData = () => {
  localStorage.removeItem('storetrack_users')
  localStorage.removeItem('storetrack_stores')
  localStorage.removeItem('storetrack_items')
  localStorage.removeItem('storetrack_activity_logs')
  localStorage.removeItem('storetrack_user')
  localStorage.removeItem('storetrack_current_store')
}

// Export data to JSON
export const exportData = () => {
  const data = {
    users: JSON.parse(localStorage.getItem('storetrack_users') || '[]'),
    stores: JSON.parse(localStorage.getItem('storetrack_stores') || '[]'),
    items: JSON.parse(localStorage.getItem('storetrack_items') || '[]'),
    activityLogs: JSON.parse(localStorage.getItem('storetrack_activity_logs') || '[]'),
    exportDate: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `storetrack-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Import data from JSON
export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        
        if (data.users) {
          localStorage.setItem('storetrack_users', JSON.stringify(data.users))
        }
        if (data.stores) {
          localStorage.setItem('storetrack_stores', JSON.stringify(data.stores))
        }
        if (data.items) {
          localStorage.setItem('storetrack_items', JSON.stringify(data.items))
        }
        if (data.activityLogs) {
          localStorage.setItem('storetrack_activity_logs', JSON.stringify(data.activityLogs))
        }
        
        resolve({ success: true })
      } catch (error) {
        reject({ success: false, error: 'Invalid file format' })
      }
    }
    reader.onerror = () => reject({ success: false, error: 'Failed to read file' })
    reader.readAsText(file)
  })
}
