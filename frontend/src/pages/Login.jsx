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
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 lg:p-24 relative overflow-hidden bg-[#0a0a0a]">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -ml-64 -mb-64"></div>

        <div className="w-full max-w-md space-y-10 relative z-10 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="flex flex-col items-center lg:items-start space-y-4">
            <div className="lg:hidden bg-purple-500/20 p-4 rounded-2xl mb-4">
              <Package className="h-10 w-10 text-purple-400" />
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-white text-center lg:text-left">
              Login
            </h2>
            <p className="text-gray-400 text-center lg:text-left text-lg font-medium">
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
                  <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-1 group-focus-within:text-purple-400 transition-colors">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-all group-focus-within:scale-110" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full h-14 bg-gray-900/50 border border-gray-800 rounded-2xl pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-purple-500/20 outline-none transition-all hover:border-gray-700"
                    />
                  </div>
                </div>

                <div className="group space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-purple-400 transition-colors">
                      Password
                    </label>
                    <a href="#" className="text-[10px] font-black uppercase tracking-[0.1em] text-purple-400 hover:underline underline-offset-4">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-all group-focus-within:scale-110" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-14 bg-gray-900/50 border border-gray-800 rounded-2xl pl-12 pr-12 text-sm font-bold focus:ring-2 focus:ring-purple-500/20 outline-none transition-all hover:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-1 py-1">
                <div className="flex items-center space-x-3">
                  <input id="remember" type="checkbox" className="h-5 w-5 rounded-lg border-gray-800 text-purple-500 focus:ring-purple-500/20 transition-all cursor-pointer" />
                  <label htmlFor="remember" className="text-xs font-bold text-gray-500 cursor-pointer select-none uppercase tracking-widest">Remember me</label>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Secure connection</span>
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="px-4 bg-[#0a0a0a] text-gray-500 font-bold">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="h-12 bg-gray-900/50 border border-gray-800 rounded-xl text-xs font-black uppercase tracking-wider text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all flex items-center justify-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.76 11.2c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className="h-12 bg-gray-900/50 border border-gray-800 rounded-xl text-xs font-black uppercase tracking-wider text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all flex items-center justify-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            <div className="text-center space-y-3">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Don't have an account?</p>
              <Link to="/admin-account-creation" className="text-xs font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 hover:underline underline-offset-4 transition-all">Create account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login