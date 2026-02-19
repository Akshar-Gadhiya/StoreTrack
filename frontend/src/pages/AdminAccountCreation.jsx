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
    ChevronDown,
    UserCheck,
    Briefcase,
    Users
} from 'lucide-react'

const AdminAccountCreation = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'owner'
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false)

    const { user, register } = useAuth()
    const navigate = useNavigate()

    if (user) {
        return <Navigate to="/dashboard" replace />
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, role })
        setIsRoleDropdownOpen(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match')
        }

        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters long')
        }

        setLoading(true)
        try {
            const result = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            })

            if (result.success) {
                navigate('/login')
            } else {
                setError(result.error || 'Failed to create account')
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const roles = [
        { id: 'owner', name: 'System Owner', icon: ShieldCheck, desc: 'Full administrative access' },
        { id: 'manager', name: 'Area Manager', icon: Briefcase, desc: 'Inventory & staff management' },
        { id: 'employee', name: 'Floor Personnel', icon: Users, desc: 'Basic scanning & tracking' }
    ]

    const selectedRole = roles.find(r => r.id === formData.role)

    return (
        <div className="min-h-screen flex bg-background">
            {/* Left Side: Visual/Branding (Identical to Login) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
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

            {/* Right Side: Account Creation Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 relative overflow-hidden">
                {/* Decorative elements for mobile */}
                <div className="lg:hidden absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="lg:hidden absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

                <div className="w-full max-w-md space-y-8 relative z-10">
                    <div className="flex flex-col items-center lg:items-start space-y-2">
                        <div className="lg:hidden bg-primary/10 p-3 rounded-xl mb-4">
                            <Package className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-foreground text-center lg:text-left">Initialize Account</h2>
                        <p className="text-muted-foreground text-center lg:text-left">
                            Join the network and start managing your assets.
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
                            {/* Full Name */}
                            <div className="group space-y-2">
                                <label className="text-sm font-semibold text-foreground group-focus-within:text-primary transition-colors">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Administrator Name"
                                        className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="group space-y-2">
                                <label className="text-sm font-semibold text-foreground group-focus-within:text-primary transition-colors">
                                    Email Address
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

                            {/* Role Dropdown (Shadcn-like) */}
                            <div className="space-y-2 relative">
                                <label className="text-sm font-semibold text-foreground">Account Rank</label>
                                <button
                                    type="button"
                                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                    className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5 text-sm hover:border-primary transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-1.5 rounded-lg">
                                            <selectedRole.icon className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold leading-none">{selectedRole.name}</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">{selectedRole.desc}</p>
                                        </div>
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isRoleDropdownOpen && (
                                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-200">
                                        {roles.map((role) => (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => handleRoleSelect(role.id)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${formData.role === role.id ? 'bg-primary/5 text-primary' : 'hover:bg-secondary'}`}
                                            >
                                                <div className={`p-1.5 rounded-lg ${formData.role === role.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                    <role.icon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{role.name}</p>
                                                    <p className="text-[10px] opacity-70">{role.desc}</p>
                                                </div>
                                                {formData.role === role.id && <UserCheck className="h-4 w-4 ml-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Password */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="group space-y-2">
                                    <label className="text-sm font-semibold text-foreground group-focus-within:text-primary transition-colors">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="group space-y-2">
                                    <label className="text-sm font-semibold text-foreground group-focus-within:text-primary transition-colors">
                                        Confirm
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <input
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 transition-all flex items-center justify-center gap-2 group mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-6 border-t border-border mt-8">
                        <p className="text-xs text-muted-foreground">
                            Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign in instead</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminAccountCreation
