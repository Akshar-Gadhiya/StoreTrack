# StoreTrack Pro

A comprehensive multi-store inventory management system built with React, Vite, and Tailwind CSS.

## Features

### 🏪 Multi-Store Management
- Create and manage multiple stores
- Hierarchical storage structure: Section → Rack → Shelf → Bin
- Store switching functionality
- Store-specific inventory tracking

### 📦 Item Management
- Comprehensive item details (name, category, description, images)
- Quantity tracking with low stock alerts
- Price and supplier information
- Expiry date tracking
- Auto-generated QR codes for each item
- Location mapping (Section → Rack → Shelf → Bin)

### 👥 Role-Based Access Control
- **Owner**: Full system access, can manage everything
- **Manager**: Can manage inventory and employees, but cannot delete stores
- **Employee**: Read-only access, can view items and scan QR codes

### 📊 Dashboard & Analytics
- Real-time inventory overview
- Low stock and out-of-stock alerts
- Category distribution charts
- Recent activity logs
- Store performance metrics

### 🔍 Search & Filters
- Search by name, category, item code, or description
- Filter by stock status (low stock, out of stock)
- Category-based filtering
- Store-specific filtering

### 📱 QR Code System
- Auto-generated QR codes for all items
- Mobile-friendly QR scanner
- Manual search by item code
- Offline QR code support

### 📈 Activity Tracking
- Complete audit trail of all actions
- Track item additions, updates, and movements
- Quantity change history
- User activity logs

## Demo Accounts

The application comes with pre-configured demo accounts:

| Role | Email | Password |
|------|--------|----------|
| Owner | owner@demo.com | password |
| Manager | manager@demo.com | password |
| Employee | employee@demo.com | password |

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd my-app
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5174`

### Build for Production

```bash
npm run build
```

## Technology Stack

- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM
- **Icons**: Heroicons
- **QR Code**: @yudiel/react-qr-scanner, qrcode
- **Date Handling**: date-fns
- **Storage**: LocalStorage (for MVP)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main application layout
│   └── ProtectedRoute.jsx # Authentication wrapper
├── contexts/           # React contexts for state management
│   ├── AuthContext.jsx    # User authentication
│   ├── StoreContext.jsx   # Store management
│   └── ItemContext.jsx    # Item/inventory management
├── pages/              # Page components
│   ├── Dashboard.jsx     # Main dashboard
│   ├── Stores.jsx       # Store management
│   ├── Items.jsx        # Item management
│   ├── Employees.jsx    # Employee management
│   ├── QRScanner.jsx    # QR code scanner
│   └── Login.jsx        # Authentication
├── utils/              # Utility functions
│   └── initDemoData.js  # Demo data initialization
└── main.jsx           # Application entry point
```

## Key Features Explained

### Multi-Store Architecture
- Each store can have multiple sections
- Sections contain racks
- Racks contain shelves
- Shelves contain bins
- Items are assigned to specific locations

### Role-Based Permissions

#### Owner
- ✅ Create, edit, delete stores
- ✅ Create, edit, delete items
- ✅ Manage all users
- ✅ View all reports and analytics
- ✅ Export/import data

#### Manager
- ✅ Create, edit items (cannot delete)
- ✅ Manage employees
- ✅ View reports and analytics
- ✅ Update quantities
- ❌ Delete stores
- ❌ Delete items permanently

#### Employee
- ✅ View items and search
- ✅ Scan QR codes
- ✅ View item details
- ❌ Edit any data
- ❌ Access management features

### QR Code System
- Each item gets a unique QR code
- QR codes contain item ID for quick lookup
- Mobile-friendly scanner interface
- Manual search fallback option

### Data Persistence
- Uses localStorage for MVP
- Automatic data initialization
- Export/import functionality
- Activity logging for audit trails

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Features

- ⚡ Fast load times (< 2 seconds)
- 🔄 Real-time updates
- 📱 Mobile-responsive design
- 🎯 Optimized search and filtering
- 💾 Efficient local storage usage

## Security Features

- 🔐 Role-based access control
- 🛡️ Input validation
- 🔒 Secure session management
- 📝 Activity logging

## Future Enhancements (Phase 2 & 3)

### Phase 2
- Cloud sync (Firebase/Supabase)
- Advanced reporting (PDF, Excel export)
- Supplier management
- Purchase order tracking

### Phase 3
- POS/ERP integration
- Voice search
- AI-powered categorization
- Advanced analytics
- Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

---

**StoreTrack Pro** - Smart Multi-Store Inventory & Storage System
