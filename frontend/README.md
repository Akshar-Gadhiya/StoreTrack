# StoreTrack Frontend

A modern, high-performance web interface for the StoreTrack inventory system, built with React and optimized for speed and visual excellence.

## Core Tech Stack

- **Framework**: React 18/19 via Vite
- **Styling**: Vanilla CSS + Tailwind Utility Classes
- **Icons**: Lucide React
- **Notifications**: React Hot Toast (Unified Notification System)
- **State Management**: React Context API (Auth, Store, Item, and Access contexts)
- **Routing**: React Router DOM

## Visual & Functional Highlights

### 🎨 Premium Aesthetics (Glassmorphism)
- Minimalist, dark-themed dashboard with deep-layer glassmorphism effects.
- Dynamic micro-animations and smooth page transitions.
- Highly responsive layouts optimized for desktop precision and mobile utility.

### 🛡️ Access Control & RBAC
- **Permission-based Rendering**: UI components automatically adjust based on granular permission flags.
- **Team Management**: Dedicated interface for owners to toggle `canEditInventory`, `canDeleteItems`, `canViewReports`, and `canManageTeam` for personnel.
- **ProtectedRoute Logic**: Component-level route protection for secure administrative paths.

### � The Master Vault (Secret Sector)
- **Hidden Interface**: Secretly triggers a high-clearance administration secteur (`/admin/master-vault`).
- **Silent Navigation**: Design patterns that minimize the visibility of secret routes to unauthorized users.
- **Dual View Support**: Seamlessly toggle between high-density Ledger (Table) and visual Grid modes.

### 🏪 Intelligent Data Isolation
- Context-persistent store selector that isolates data per location.
- Global search system with backend filters to exclude master/restricted items from standard results.

### 📦 Lifecycle Management
- Advanced inventory registries with real-time stock alerts.
- Detail-rich modals for item management, including QR code visualization and spatial data.

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Environment Configuration:
   Ensure your local backend API is running (defaults to `http://localhost:5000`).

3. Start Development Server:
   ```bash
   npm run dev
   ```

4. Build for Production:
   ```bash
   npm run build
   ```

---
**StoreTrack UI** - The Modern Face of Inventory Management
