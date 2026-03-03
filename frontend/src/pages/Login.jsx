import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Package, ArrowRight, ShieldCheck, Mail, Lock, Loader2, User, Eye, EyeOff } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="min-h-screen flex bg-[#0a0a0a] font-sans overflow-hidden">
      {/* Left Side: Visual/Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] items-center justify-center overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[150px]"></div>
          <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[150px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border-[1px] border-white/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] border-[1px] border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
        </div>

        <div className="relative z-10 px-16 text-center max-w-2xl">
          <div className="flex justify-center mb-10">
            <div className="bg-white/10 p-6 rounded-[2rem] backdrop-blur-xl border border-white/20 shadow-2xl animate-bounce-subtle">
              <Package className="h-20 w-20 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-black text-white mb-6 tracking-tighter italic">StoreTrack</h1>
          <p className="text-white/80 text-xl font-medium leading-relaxed mb-12">
            The nexus of intelligent commerce. Manage multi-node inventories, personnel hierarchies, and global logistics within a high-fidelity interface.
          </p>

          <div className="grid grid-cols-2 gap-6 text-left">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/10 hover:bg-white/10 transition-all group">
              <ShieldCheck className="h-6 w-6 text-white mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-black text-white uppercase tracking-[0.2em] mb-1">Encrypted Access</p>
              <p className="text-xs text-white/50 leading-relaxed font-medium">Biometric-grade role-based security protocols.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/10 hover:bg-white/10 transition-all group">
              <Package className="h-6 w-6 text-white mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-black text-white uppercase tracking-[0.2em] mb-1">Optical Links</p>
              <p className="text-xs text-white/50 leading-relaxed font-medium">Real-time QR synchronization and asset tracking.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 lg:p-24 relative overflow-hidden bg-white">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -ml-64 -mb-64"></div>

        <div className="w-full max-w-md space-y-10 relative z-10 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="flex flex-col items-center lg:items-start space-y-4">
            <div className="lg:hidden bg-purple-500/20 p-4 rounded-2xl mb-4">
              <Package className="h-10 w-10 text-purple-400" />
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-gray-900 text-center lg:text-left">
              Login
            </h2>
            <p className="text-gray-600 text-center lg:text-left text-lg font-medium">
              Sign in to your account to continue
            </p>
          </div>

          <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-4 animate-in fade-in zoom-in-95">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div className="group space-y-2.5">
                  <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 px-1 group-focus-within:text-purple-600 transition-colors">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-focus-within:text-purple-600 transition-all group-focus-within:scale-110" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-purple-500/20 outline-none transition-all hover:border-gray-300"
                    />
                  </div>
                </div>

                <div className="group space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 group-focus-within:text-purple-600 transition-colors">
                      Password
                    </label>
                    <a href="#" className="text-[10px] font-black uppercase tracking-[0.1em] text-purple-600 hover:underline underline-offset-4">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-focus-within:text-purple-600 transition-all group-focus-within:scale-110" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-12 text-sm font-bold focus:ring-2 focus:ring-purple-500/20 outline-none transition-all hover:border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-1 py-1">
                <div className="flex items-center space-x-3">
                  <input id="remember" type="checkbox" className="h-5 w-5 rounded-lg border-gray-300 text-purple-600 focus:ring-purple-500/20 transition-all cursor-pointer" />
                  <label htmlFor="remember" className="text-xs font-bold text-gray-600 cursor-pointer select-none uppercase tracking-widest">Remember me</label>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Secure connection</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2rem] shadow-2xl shadow-purple-500/20 hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
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