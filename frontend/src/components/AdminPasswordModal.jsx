import { useState } from 'react'
import { Lock, X } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminPasswordModal = ({ isOpen, onPasswordVerified }) => {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const ADMIN_PASSWORD = '303146' // Admin password for account creation access

    const handleVerify = async (e) => {
        e.preventDefault()
        setError('')

        if (!password) {
            setError('Please enter the password')
            return
        }

        setLoading(true)
        
        // Simulate a small delay for security
        setTimeout(() => {
            if (password === ADMIN_PASSWORD) {
                toast.success('Access granted')
                onPasswordVerified()
                setPassword('')
            } else {
                setError('Incorrect password')
                setPassword('')
            }
            setLoading(false)
        }, 500)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-red-100 p-3 rounded-full">
                                <Lock className="h-6 w-6 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Admin Access</h2>
                        </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-6">
                        Enter the admin password to access account creation
                    </p>

                    <form onSubmit={handleVerify} className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter admin password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                disabled={loading}
                                autoFocus
                            />
                            {error && (
                                <p className="text-red-500 text-sm mt-2">{error}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {loading ? 'Verifying...' : 'Verify Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AdminPasswordModal
