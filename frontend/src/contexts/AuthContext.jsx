import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for existing user session
    const storedUser = localStorage.getItem('storetrack_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    // Mock authentication - in real app, this would be an API call
    const users = JSON.parse(localStorage.getItem('storetrack_users') || '[]')
    const foundUser = users.find(u => u.email === email && u.password === password)
    
    if (foundUser) {
      const userToStore = { ...foundUser, password: undefined }
      setUser(userToStore)
      localStorage.setItem('storetrack_user', JSON.stringify(userToStore))
      return { success: true }
    }
    
    return { success: false, error: 'Invalid email or password' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('storetrack_user')
  }

  const register = (userData) => {
    // Mock registration - in real app, this would be an API call
    const users = JSON.parse(localStorage.getItem('storetrack_users') || '[]')
    
    if (users.find(u => u.email === userData.email)) {
      return { success: false, error: 'Email already exists' }
    }
    
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString()
    }
    
    users.push(newUser)
    localStorage.setItem('storetrack_users', JSON.stringify(users))
    
    return { success: true, user: newUser }
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
