import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { useItem } from '../contexts/ItemContext'
import { Scanner } from '@yudiel/react-qr-scanner'
import {
  QrCode,
  Camera,
  Search,
  X,
  Package,
  History,
  Maximize2,
  ScanLine,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  MapPin,
  TrendingUp,
  Layout
} from 'lucide-react'

const QRScanner = () => {
  const { items } = useItem()
  const [scanning, setScanning] = useState(false)
  const [scannedItem, setScannedItem] = useState(null)
  const [manualCode, setManualCode] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [recentScans, setRecentScans] = useState([])

  const handleScan = (result) => {
    if (result) {
      try {
        const qrData = result[0].rawValue
        let itemId = null

        if (qrData.includes('storetrack://item/')) {
          itemId = qrData.split('storetrack://item/')[1]
        } else if (qrData.startsWith('ITM-')) {
          const item = items.find(item => item.itemCode === qrData)
          if (item) {
            processScannedItem(item)
            toast.success(`Identifier Linked: ${item.name}`)
            return
          }
        } else {
          itemId = qrData
        }

        if (itemId) {
          const item = items.find(item => item.id === itemId)
          if (item) {
            processScannedItem(item)
            toast.success(`Identifier Linked: ${item.name}`)
          } else {
            toast.error('Electronic identifier not recognized in current inventory.')
          }
        }
      } catch (err) {
        toast.error('Invalid encoded data format.')
      }
    }
  }

  const processScannedItem = (item) => {
    setScannedItem(item)
    setScanning(false)
    // Add to recent scans if not already at the top
    setRecentScans(prev => {
      const filtered = prev.filter(p => p.id !== item.id)
      return [item, ...filtered].slice(0, 5)
    })
  }

  const handleError = (error) => {
    console.error('QR Scanner Error:', error)
    toast.error('Optical sensor synchronization failed.')
  }

  const handleManualSearch = () => {
    if (!manualCode.trim()) {
      toast.error('Numerical or textual identifier required.')
      return
    }

    const item = items.find(item =>
      item.itemCode === manualCode.trim() ||
      item.id === manualCode.trim() ||
      item.name.toLowerCase().includes(manualCode.toLowerCase())
    )

    if (item) {
      processScannedItem(item)
      toast.success(`Entity Identified: ${item.name}`)
      setManualCode('')
      setShowManualInput(false)
    } else {
      toast.error('No matching entity found in the registry.')
    }
  }

  const resetScanner = () => {
    setScannedItem(null)
    setManualCode('')
    setSearchQuery('')
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const ItemCardSmall = ({ item }) => (
    <div
      onClick={() => processScannedItem(item)}
      className="group bg-card border border-border p-4 rounded-xl hover:shadow-lg transition-all cursor-pointer hover:border-primary/50"
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-secondary rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
          <Package className="h-5 w-5 text-secondary-foreground group-hover:text-primary-foreground transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm truncate">{item.name}</h4>
          <p className="text-[10px] font-mono text-muted-foreground uppercase">{item.itemCode}</p>
        </div>
        <div className={`h-2 w-2 rounded-full ${item.quantity === 0 ? 'bg-destructive' :
          item.quantity <= (item.lowStockThreshold || 10) ? 'bg-amber-500' :
            'bg-green-500'
          }`} />
      </div>
    </div>
  )

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Optical Intelligence Registry</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground">Lens Scanner</h1>
          <p className="text-muted-foreground text-xl font-medium max-w-2xl leading-relaxed">
            Synchronize physical assets with the digital twin via precision optical scanning and real-time ledger verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className={`h-12 inline-flex items-center gap-3 px-8 rounded-xl text-sm font-black transition-all shadow-xl ${showManualInput ? 'bg-primary text-primary-foreground shadow-primary/20' : 'bg-card border border-border text-muted-foreground hover:bg-secondary shadow-black/[0.02]'}`}
          >
            <Layout className="h-5 w-5" />
            {showManualInput ? 'Hide Registry' : 'Registry View'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Scanning Terminal */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Camera Feed Context */}
            <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-black/[0.02]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Camera className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-nowrap">Optical Interface</h2>
                </div>
                {scanning && (
                  <span className="flex items-center gap-2 text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-full animate-pulse border border-red-200 uppercase tracking-widest whitespace-nowrap">
                    <Circle className="h-1.5 w-1.5 fill-current" /> Live Feed
                  </span>
                )}
              </div>

              <div className="relative aspect-square max-w-[400px] mx-auto group">
                {scanning ? (
                  <div className="rounded-2xl overflow-hidden border-4 border-black/5 bg-black shadow-2xl relative">
                    <Scanner
                      onResult={handleScan}
                      onError={handleError}
                      constraints={{ facingMode: 'environment' }}
                      containerStyle={{ width: '100%', height: '100%', aspectRatio: '1/1' }}
                      videoStyle={{ objectFit: 'cover' }}
                    />
                    {/* Overlay FX */}
                    <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20" />
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-primary/50 shadow-[0_0_15px_rgba(var(--color-primary),0.5)] animate-scan-line" />
                    <div className="absolute top-4 left-4 h-8 w-8 border-t-2 border-l-2 border-primary" />
                    <div className="absolute top-4 right-4 h-8 w-8 border-t-2 border-r-2 border-primary" />
                    <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-primary" />
                    <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-primary" />

                    <button
                      onClick={() => setScanning(false)}
                      className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-destructive transition-all"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full bg-muted/30 rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center p-8 text-center transition-all group-hover:border-primary/50 group-hover:bg-primary/[0.02]">
                    <div className="h-20 w-20 bg-card rounded-full flex items-center justify-center mb-6 shadow-xl border border-border group-hover:scale-110 transition-transform">
                      <QrCode className="h-10 w-10 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Initialize Scanner</h3>
                    <p className="text-sm text-muted-foreground mb-8 max-w-[200px]">Synchronize your optical sensor to decode entity identifiers.</p>
                    <button
                      onClick={() => setScanning(true)}
                      className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center gap-2 shadow-2xl shadow-primary/20 hover:translate-y-[-2px] transition-all"
                    >
                      <Camera className="h-5 w-5" />
                      Boot Vision
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Manual Input Context */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-xl shadow-black/[0.02] flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 bg-secondary rounded-xl flex items-center justify-center">
                  <Search className="h-5 w-5 text-secondary-foreground" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Manual Proxy</h2>
              </div>

              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Identifier Input</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                      placeholder="Enter SKU, ID or Name..."
                      className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12"
                    />
                    <button
                      onClick={handleManualSearch}
                      className="absolute right-2 top-2 h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground hover:scale-105 transition-all shadow-lg shadow-primary/20"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <History className="h-3 w-3" /> Recent Session Syncs
                  </p>
                  <div className="space-y-2">
                    {recentScans.length > 0 ? (
                      recentScans.map(item => (
                        <button
                          key={item.id}
                          onClick={() => processScannedItem(item)}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-all text-left group"
                        >
                          <div>
                            <p className="text-sm font-bold group-hover:text-primary transition-colors">{item.name}</p>
                            <p className="text-[10px] font-mono text-muted-foreground">{item.itemCode}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-all" />
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic py-4 text-center">No recent activity detected.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Pane */}
          {scannedItem && (
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
              <div className="bg-muted/30 border-b border-border p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-green-500/10 text-green-600 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">Entity Identification Successful</h3>
                </div>
                <button onClick={resetScanner} className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground transition-all">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 bg-muted aspect-square md:aspect-auto border-r border-border relative">
                  {scannedItem.images?.[0] ? (
                    <img src={scannedItem.images[0]} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-20 w-20 text-muted-foreground/20" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-black/60 backdrop-blur-md text-[10px] font-black text-white px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">Active SKU</span>
                  </div>
                </div>

                <div className="md:w-2/3 p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2 mb-1">
                        <ScanLine className="h-3 w-3" /> Encoded Identifier
                      </p>
                      <h2 className="text-4xl font-black tracking-tighter">{scannedItem.name}</h2>
                      <p className="font-mono text-primary text-sm font-bold mt-1">{scannedItem.itemCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black uppercase text-muted-foreground mb-1">Stock Level</p>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-4xl font-black">{scannedItem.quantity}</span>
                        <TrendingUp className={`h-6 w-6 ${scannedItem.quantity > (scannedItem.lowStockThreshold || 10) ? 'text-green-500' : 'text-amber-500'}`} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-muted/30 border border-border">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Class</p>
                      <p className="text-sm font-bold">{scannedItem.category || 'Standard'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Valuation</p>
                      <p className="text-sm font-bold text-primary">{scannedItem.price ? `$${scannedItem.price.toFixed(2)}` : 'N/A'}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Spatial Placement</p>
                      <p className="text-sm font-bold">{scannedItem.location ? `${scannedItem.location.section} • ${scannedItem.location.rack} • ${scannedItem.location.bin}` : 'Unassigned'}</p>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button className="flex-[2] bg-primary text-primary-foreground font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-2xl shadow-primary/20 hover:translate-y-[-2px] transition-all">
                      Allocate Units <Maximize2 className="h-4 w-4" />
                    </button>
                    <button onClick={resetScanner} className="flex-1 bg-secondary text-secondary-foreground font-bold py-4 rounded-2xl hover:bg-secondary/70 transition-all">
                      Discard Result
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Registry Lookup Context */}
        {showManualInput && (
          <div className="lg:col-span-12 xl:col-span-4 space-y-6 max-h-[800px] flex flex-col animate-in slide-in-from-right-4 duration-500">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold tracking-tight">Registry Database</h2>
                <span className="text-[10px] font-black text-muted-foreground bg-secondary px-2 py-1 rounded-full">{items.length} Entries</span>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter all assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-muted">
                {filteredItems.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">No Matches Identified</p>
                  </div>
                ) : (
                  filteredItems.map(item => <ItemCardSmall key={item.id} item={item} />)
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Circle(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /></svg>
  )
}

export default QRScanner
