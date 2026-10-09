import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldAlert, KeyRound, Mail, ArrowRight, Lock } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('admin@kavach.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or connection error.')
    } finally {
      setLoading(false)
    }
  }

  const selectRole = (roleEmail) => {
    setEmail(roleEmail)
    setPassword('password123')
  }

  return (
    <div className="min-h-screen bg-industrial-900 flex items-center justify-center p-6 selection:bg-industrial-accent selection:text-industrial-900">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-24 h-24 items-center justify-center mb-4">
            <img src="/logo.jpg" alt="Kavach Logo" className="w-full h-full rounded-2xl object-cover" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">KAVACH <span className="text-industrial-accent">SAFETY OS</span></h1>
          <p className="text-sm text-gray-400 mt-1">Industrial Safety Intelligence & AI Command</p>
        </div>

        {/* Login Box */}
        <div className="bg-industrial-800 border border-industrial-700/80 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-6">Authenticate Session</h2>

          {error && (
            <div className="mb-6 p-3.5 rounded-lg bg-industrial-danger/10 border border-industrial-danger/20 text-industrial-danger text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">EHS Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-industrial-900 border border-industrial-600 text-white placeholder-gray-500 focus:outline-none focus:border-industrial-accent text-sm"
                  placeholder="name@kavach.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Passkey</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-industrial-900 border border-industrial-600 text-white placeholder-gray-500 focus:outline-none focus:border-industrial-accent text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-lg bg-industrial-accent text-industrial-900 font-bold text-sm hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-industrial-accent/20"
            >
              {loading ? 'Authenticating...' : 'Access Command Center'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-industrial-700/80">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">1-Click Demo Profiles</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => selectRole('admin@kavach.com')}
                className="px-2.5 py-1.5 rounded-lg bg-industrial-900 border border-industrial-700 hover:border-industrial-accent text-left text-xs transition-colors"
              >
                <div className="font-bold text-white">System Admin</div>
                <div className="text-[10px] text-gray-400 truncate">admin@kavach.com</div>
              </button>

              <button
                type="button"
                onClick={() => selectRole('safety@kavach.com')}
                className="px-2.5 py-1.5 rounded-lg bg-industrial-900 border border-industrial-700 hover:border-industrial-accent text-left text-xs transition-colors"
              >
                <div className="font-bold text-white">Safety Officer</div>
                <div className="text-[10px] text-gray-400 truncate">safety@kavach.com</div>
              </button>

              <button
                type="button"
                onClick={() => selectRole('supervisor@kavach.com')}
                className="px-2.5 py-1.5 rounded-lg bg-industrial-900 border border-industrial-700 hover:border-industrial-accent text-left text-xs transition-colors"
              >
                <div className="font-bold text-white">Shift Supervisor</div>
                <div className="text-[10px] text-gray-400 truncate">supervisor@kavach.com</div>
              </button>

              <button
                type="button"
                onClick={() => selectRole('viewer@kavach.com')}
                className="px-2.5 py-1.5 rounded-lg bg-industrial-900 border border-industrial-700 hover:border-industrial-accent text-left text-xs transition-colors"
              >
                <div className="font-bold text-white">Plant Viewer</div>
                <div className="text-[10px] text-gray-400 truncate">viewer@kavach.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
