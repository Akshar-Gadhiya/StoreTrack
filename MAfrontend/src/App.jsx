import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AccessProvider } from './contexts/AccessContext'
import { StoreProvider } from './contexts/StoreContext'
import { ItemProvider } from './contexts/ItemContext'
import MasterAdminLogin from './pages/MasterAdminLogin'
import MasterVault from './pages/MasterVault'
import Layout from './components/Layout'
import MasterAdminLayout from './components/MasterAdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import MasterAdminProtectedRoute from './components/MasterAdminProtectedRoute'
import AdminAccountCreation from './pages/AdminAccountCreation'
import MasterAdminDashboard from './pages/MasterAdminDashboard'
import MasterAdminStores from './pages/MasterAdminStores'
import MasterAdminOwners from './pages/MasterAdminOwners'
import ActivityLogs from './pages/ActivityLogs'

function App() {
  return (
    <AuthProvider>
      <AccessProvider>
        <StoreProvider>
          <ItemProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Routes>

                  <Route path="/master-admin-login" element={<MasterAdminLogin />} />
                  <Route path="/createaccount" element={<AdminAccountCreation />} />

                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >

                    <Route path="admin/master-vault" element={<MasterVault />} />

                  </Route>

                  <Route
                    path="/master-admin"
                    element={
                      <MasterAdminProtectedRoute>
                        <MasterAdminLayout />
                      </MasterAdminProtectedRoute>
                    }
                  >
                    <Route index element={<MasterAdminDashboard />} />
                    <Route path="stores" element={<MasterAdminStores />} />
                    <Route path="owners" element={<MasterAdminOwners />} />
                    <Route path="logs" element={<ActivityLogs />} />
                  </Route>
                </Routes>
              </div>
            </Router>
          </ItemProvider>
        </StoreProvider>
      </AccessProvider>
    </AuthProvider>
  )
}

export default App
