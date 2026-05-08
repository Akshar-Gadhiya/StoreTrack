import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AccessProvider } from './contexts/AccessContext'
import { StoreProvider } from './contexts/StoreContext'
import { ItemProvider } from './contexts/ItemContext'
import Login from './pages/Login'
import MasterAdminLogin from './pages/MasterAdminLogin'
import Dashboard from './pages/Dashboard'
import Stores from './pages/Stores'
import Items from './pages/Items'
import Employees from './pages/Employees'
import Permissions from './pages/Permissions'
import MasterVault from './pages/MasterVault'
import QRScanner from './pages/QRScanner'
import Layout from './components/Layout'
import MasterAdminLayout from './components/MasterAdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import MasterAdminProtectedRoute from './components/MasterAdminProtectedRoute'
import AdminAccountCreation from './pages/AdminAccountCreation'
import SettingsPage from './pages/SettingsPage'
import MasterAdminDashboard from './pages/MasterAdminDashboard'

function App() {
  return (
    <AuthProvider>
      <AccessProvider>
        <StoreProvider>
          <ItemProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/master-admin-login" element={<MasterAdminLogin />} />
                  <Route path="/createaccount" element={<AdminAccountCreation />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="stores" element={<Stores />} />
                    <Route path="items" element={<Items />} />
                    <Route path="employees" element={<Employees />} />
                    <Route path="permissions" element={<Permissions />} />
                    <Route path="admin/master-vault" element={<MasterVault />} />
                    <Route path="scanner" element={<QRScanner />} />
                    <Route path="settings" element={<SettingsPage />} />
                  <Route path="/master-admin" element={
                    <MasterAdminProtectedRoute>
                      <MasterAdminLayout />
                    </MasterAdminProtectedRoute>
                  }>
                    <Route index element={<MasterAdminDashboard />} />
                    {/* Additional master admin routes can be added here */}
                  </Route>
              </div>
            </Router>
          </ItemProvider>
        </StoreProvider>
      </AccessProvider>
    </AuthProvider>
  )
}

export default App
