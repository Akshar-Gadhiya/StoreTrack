import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    Package,
    ArrowRight,
    ShieldCheck,
    Mail,
    Lock,
    User,
    Loader2,
    Crown
} from 'lucide-react'
import toast from 'react-hot-toast'

const MasterAdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { user, masterAdminLogin } = useAuth()
    const navigate = useNavigate()

    // Redirect if already logged in as master admin
    if (user && user.role === 'MASTER_ADMIN') {
        return <Navigate to="/master-admin" replace />
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!formData.email || !formData.password) {
            return setError('Please fill in all fields')
        }

        setLoading(true)
        try {
            const result = await masterAdminLogin(formData.email, formData.password)

            if (result.success) {
                toast.success('Master Admin access granted')
                navigate('/master-admin')
            } else {
                setError(result.error || 'Invalid master admin credentials')
            }
        } catch (err) {
            setError('Authentication failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex bg-background">
            {/* Left Side: Visual/Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 -left-20 w-80 h-80 bg-white rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-0 -right-20 w-80 h-80 bg-white rounded-full blur-[100px]"></div>
                </div>

                <div className="relative z-10 px-12 text-center">
                    <div className="flex justify-center mb-8">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
                            <Crown className="h-16 w-16 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Master Admin</h1>
                    <p className="text-primary-foreground/80 text-lg max-w-md mx-auto leading-relaxed">
                        System-wide administrative control for StoreTrack enterprise management platform.
                    </p>

                    <div className="mt-12 grid grid-cols-2 gap-4 text-left">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <ShieldCheck className="h-5 w-5 text-white mb-2" />
                            <p className="text-xs font-semibold text-white uppercase tracking-wider">Supreme Access</p>
                            <p className="text-[10px] text-white/60">Complete system oversight</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <Package className="h-5 w-5 text-white mb-2" />
                            <p className="text-xs font-semibold text-white uppercase tracking-wider">Global Control</p>
                            <p className="text-[10px] text-white/60">All stores, all users</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 relative overflow-hidden">
                {/* Decorative elements for mobile */}
                <div className="lg:hidden absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="lg:hidden absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

                <div className="w-full max-w-md space-y-8 relative z-10">
                    <div className="flex flex-col items-center lg:items-start space-y-2">
                        <div className="lg:hidden bg-primary/10 p-3 rounded-xl mb-4">
                            <Crown className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-4xl font-black tracking-tight text-foreground text-center lg:text-left">Master Access</h2>
                        <p className="text-muted-foreground text-center lg:text-left">
                            Enter system administrator credentials.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-destructive"></div>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Email */}
                            <div className="group space-y-2">
                                <label className="text-sm font-semibold text-foreground group-focus-within:text-primary transition-colors">
                                    Admin Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="admin@storetrack.com"
                                        className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="group space-y-2">
                                <label className="text-sm font-semibold text-foreground group-focus-within:text-primary transition-colors">
                                    Access Code
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter master password"
                                        className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !formData.email || !formData.password}
                            className="w-full bg-primary text-white py-2.5 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <Crown className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                    Grant Master Access
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            ← Back to regular login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MasterAdminLogin