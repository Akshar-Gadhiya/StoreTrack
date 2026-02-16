import { useState, useRef } from 'react'
import { useItem } from '../contexts/ItemContext'
import { Scanner } from '@yudiel/react-qr-scanner'
import { 
  QrCodeIcon,
  CameraIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CubeIcon
} from '@heroicons/react/24/outline'

const QRScanner = () => {
  const { items } = useItem()
  const [scanning, setScanning] = useState(false)
  const [scannedItem, setScannedItem] = useState(null)
  const [manualCode, setManualCode] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [error, setError] = useState('')
  const videoRef = useRef(null)

  const handleScan = (result) => {
    if (result) {
      try {
        // Parse QR code data
        const qrData = result[0].rawValue
        
        // Handle different QR code formats
        let itemId = null
        
        if (qrData.includes('storetrack://item/')) {
          itemId = qrData.split('storetrack://item/')[1]
        } else if (qrData.startsWith('ITM-')) {
          // Find item by code
          const item = items.find(item => item.itemCode === qrData)
          if (item) {
            setScannedItem(item)
            setScanning(false)
            return
          }
        } else {
          // Assume it's an item ID
          itemId = qrData
        }
        
        if (itemId) {
          const item = items.find(item => item.id === itemId)
          if (item) {
            setScannedItem(item)
            setScanning(false)
            setError('')
          } else {
            setError('Item not found')
          }
        }
      } catch (err) {
        setError('Invalid QR code format')
      }
    }
  }

  const handleError = (error) => {
    console.error('QR Scanner Error:', error)
    setError('Camera access denied or not available')
  }

  const handleManualSearch = () => {
    if (!manualCode.trim()) {
      setError('Please enter an item code or ID')
      return
    }
    
    const item = items.find(item => 
      item.itemCode === manualCode.trim() || 
      item.id === manualCode.trim() ||
      item.name.toLowerCase().includes(manualCode.toLowerCase())
    )
    
    if (item) {
      setScannedItem(item)
      setError('')
      setManualCode('')
      setShowManualInput(false)
    } else {
      setError('Item not found')
    }
  }

  const resetScanner = () => {
    setScannedItem(null)
    setError('')
    setManualCode('')
    setSearchQuery('')
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const ItemCard = ({ item }) => (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{item.name}</h3>
          <p className="text-sm text-gray-500">Code: {item.itemCode}</p>
        </div>
        <div className={`px-2 py-1 text-xs rounded-full ${
          item.quantity === 0 ? 'bg-red-100 text-red-800' :
          item.quantity <= (item.lowStockThreshold || 10) ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {item.quantity === 0 ? 'Out of Stock' : 
           item.quantity <= (item.lowStockThreshold || 10) ? 'Low Stock' : 'In Stock'}
        </div>
      </div>
      
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
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={() => setScannedItem(item)}
          className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">QR Scanner</h1>
        <p className="text-gray-600">Scan QR codes or search for items</p>
      </div>

      {/* Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Scanner */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Scan QR Code</h2>
          
          {scanning ? (
            <div className="space-y-4">
              <div className="relative">
                <Scanner
                  onResult={handleScan}
                  onError={handleError}
                  constraints={{ facingMode: 'environment' }}
                  containerStyle={{ width: '100%', paddingBottom: '100%' }}
                  videoContainerStyle={{ paddingTop: '0px' }}
                />
                <button
                  onClick={() => setScanning(false)}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 text-center">
                Position the QR code within the frame
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <QrCodeIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <button
                onClick={() => setScanning(true)}
                className="flex items-center justify-center mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CameraIcon className="h-5 w-5 mr-2" />
                Start Scanning
              </button>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Manual Search */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Manual Search</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Item Code, ID, or Name
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                  placeholder="Enter item code or name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleManualSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={() => setShowManualInput(!showManualInput)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                {showManualInput ? 'Hide' : 'Show'} All Items
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scanned Item Details */}
      {scannedItem && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-medium text-gray-900">Scanned Item Details</h2>
            <button
              onClick={resetScanner}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {scannedItem.qrCode && (
                <div className="mb-4 text-center">
                  <img src={scannedItem.qrCode} alt="QR Code" className="mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Item QR Code</p>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-900">Name:</span>
                <p className="text-gray-600">{scannedItem.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Item Code:</span>
                <p className="text-gray-600">{scannedItem.itemCode}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Category:</span>
                <p className="text-gray-600">{scannedItem.category || 'Not categorized'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Quantity:</span>
                <p className="text-gray-600">{scannedItem.quantity}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Price:</span>
                <p className="text-gray-600">{scannedItem.price ? `$${scannedItem.price.toFixed(2)}` : 'Not set'}</p>
              </div>
              {scannedItem.location && (
                <div>
                  <span className="font-medium text-gray-900">Location:</span>
                  <p className="text-gray-600">
                    {scannedItem.location.section} → {scannedItem.location.rack} → {scannedItem.location.shelf} → {scannedItem.location.bin}
                  </p>
                </div>
              )}
              {scannedItem.description && (
                <div>
                  <span className="font-medium text-gray-900">Description:</span>
                  <p className="text-gray-600">{scannedItem.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Items Search */}
      {showManualInput && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">All Items</h2>
          
          <div className="mb-4">
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
          
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-500 mt-2">No items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default QRScanner
