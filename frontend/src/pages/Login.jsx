import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Package, ArrowRight, ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const isLogin = true;
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { user, login } = useAuth()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = login(email, password)
      if (!result.success) {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side: Visual/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-20 w-80 h-80 bg-white rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 -right-20 w-80 h-80 bg-white rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 px-12 text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
              <Package className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">StoreTrack</h1>
          <p className="text-primary-foreground/80 text-lg max-w-md mx-auto leading-relaxed">
            The intelligent way to manage your multi-store inventory, staff, and storage hierarchies in one seamless interface.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <ShieldCheck className="h-5 w-5 text-white mb-2" />
              <p className="text-xs font-semibold text-white uppercase tracking-wider">Secure</p>
              <p className="text-[10px] text-white/60">Role-based access control</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <Package className="h-5 w-5 text-white mb-2" />
              <p className="text-xs font-semibold text-white uppercase tracking-wider">Efficient</p>
              <p className="text-[10px] text-white/60">QR-code item tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 lg:p-24 relative overflow-hidden">
        {/* Decorative elements for mobile */}
        <div className="lg:hidden absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="lg:hidden absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="flex flex-col items-center lg:items-start space-y-2">
            <div className="lg:hidden bg-primary/10 p-3 rounded-xl mb-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground text-center lg:text-left">Welcome Back</h2>
            <p className="text-muted-foreground text-center lg:text-left">
              Please enter your credentials to access your dashboard.
            </p>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive"></div>
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="group space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-foreground group-focus-within:text-primary transition-colors">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-background border border-input rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="group space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-semibold text-foreground group-focus-within:text-primary transition-colors">
                      Password
                    </label>
                    <a href="#" className="text-xs font-medium text-primary hover:underline">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-background border border-input rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 py-2">
                <input id="remember" type="checkbox" className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20" />
                <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">Remember this device</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>


          </div>


        </div>
      </div>
    </div>
  )
}

export default Login
