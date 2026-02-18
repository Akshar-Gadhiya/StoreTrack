
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserPlusIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

const AdminAccountCreation = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const { register } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match')
        }

        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters long')
        }

        setLoading(true)
        try {
            // Force role to 'owner' (admin level in this system)
            const result = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'owner'
            })

            if (result.success) {
                setSuccess('Admin account created successfully! Redirecting to login...')
                setTimeout(() => {
                    navigate('/login')
                }, 2000)
            } else {
                setError(result.error || 'Failed to create account')
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 rotate-3">
                        <ShieldCheckIcon className="h-10 w-10 text-white -rotate-3" />
                    </div>
                    <h2 className="mt-8 text-4xl font-black text-gray-900 tracking-tight">
                        System Setup
                    </h2>
                    <p className="mt-3 text-sm text-gray-500 font-semibold uppercase tracking-widest">
                        Create Master Admin
                    </p>
                </div>

                <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-pulse">
                            <div className="flex">
                                <div className="flex-shrink-0 text-red-500">
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-800">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                            <div className="flex">
                                <div className="flex-shrink-0 text-green-500">
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">{success}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                            <input
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-100 text-gray-900 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none"
                                placeholder="Administrator Name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-100 text-gray-900 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none"
                                placeholder="admin@storetrack.com"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-100 text-gray-900 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Confirm</label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-100 text-gray-900 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-sm outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group w-full flex items-center justify-center py-4 px-6 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <UserPlusIcon className="h-5 w-5 mr-3 text-blue-300 group-hover:text-blue-100 transition-colors" />
                                    <span>Finalize Administrator</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-widest">
                        Security Protocol Restricted Area
                    </div>
                    <p className="mt-3 text-[11px] text-gray-400 leading-relaxed max-w-[240px] mx-auto">
                        This endpoint is restricted to initial system initialization or authorized master overrides.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AdminAccountCreation
