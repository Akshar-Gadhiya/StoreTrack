import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

const API_URL = 'http://localhost:5000/api'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('storetrack_user')
    const token = localStorage.getItem('storetrack_token')
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data)
        localStorage.setItem('storetrack_user', JSON.stringify(data))
        localStorage.setItem('storetrack_token', data.token)
        toast.success(`Welcome back, ${data.name || data.email.split('@')[0]}!`)
        return { success: true }
      } else {
        toast.error(data.message || 'Login failed')
        return { success: false, error: data.message || 'Login failed' }
      }
    } catch (error) {
      toast.error('Server connection failed')
      return { success: false, error: 'Server connection failed' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('storetrack_user')
    localStorage.removeItem('storetrack_token')
    toast.success('Logged out successfully')
  }

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        // Automatically login after registration if desired, or just return success
        // For now, let's just return success so the user can be redirected to login
        toast.success('Account created successfully!')
        return { success: true, user: data }
      } else {
        toast.error(data.message || 'Registration failed')
        return { success: false, error: data.message || 'Registration failed' }
      }
    } catch (error) {
      toast.error('Server connection failed')
      return { success: false, error: 'Server connection failed' }
    }
  }

  const value = {
    user,
    login,
    logout,
    register,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
