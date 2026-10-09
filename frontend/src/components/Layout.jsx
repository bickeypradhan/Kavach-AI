import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Video, 
  AlertTriangle, 
  BarChart3, 
  PlaySquare, 
  Settings, 
  LogOut,
  Bell,
  Cpu,
  DoorOpen,
  FileClock,
  Users
} from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { label: '📊 Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: '🚪 Smart Safety Gate', path: '/gate', icon: DoorOpen },
    { label: 'Gate Scan History', path: '/history', icon: FileClock },
    { label: 'Incident Response', path: '/incidents', icon: AlertTriangle },
    { label: 'Employee Management', path: '/employees', icon: Users },
    { label: 'Interactive Demo', path: '/demo', icon: PlaySquare },
    { label: 'System Architecture', path: '/architecture', icon: Cpu },
    { label: 'Platform Settings', path: '/settings', icon: Settings },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-industrial-900 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-industrial-800 border-r border-industrial-700 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-industrial-700 bg-industrial-900/50">
            <img src="/logo.jpg" alt="Kavach Logo" className="w-8 h-8 rounded mr-3 object-contain" />
            <div>
              <span className="font-bold text-lg text-white tracking-wide">KAVACH</span>
              <span className="text-xs ml-1 px-1.5 py-0.5 rounded bg-industrial-accent/20 text-industrial-accent font-semibold">SAFETY OS</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-industrial-accent/15 text-industrial-accent border-l-4 border-industrial-accent'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-industrial-700/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-industrial-accent' : 'text-gray-400'}`} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-industrial-700 bg-industrial-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-8 h-8 rounded-full bg-industrial-700 flex items-center justify-center font-bold text-sm text-gray-200">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="truncate">
                <div className="text-sm font-medium text-gray-200 truncate">{user?.name}</div>
                <div className="text-xs text-gray-400 truncate">{user?.role}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-industrial-danger hover:bg-industrial-700 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-industrial-800 border-b border-industrial-700 flex items-center justify-between px-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-industrial-success animate-pulse"></span>
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">AI Inference Engine: Active</span>
            </div>
            <span className="text-gray-600">|</span>
            <span className="text-xs text-gray-400">Site: <span className="text-gray-200 font-medium">Bhubaneswar Plant</span></span>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/demo" className="px-3 py-1 text-xs font-semibold rounded bg-industrial-accent text-industrial-900 hover:bg-yellow-400 transition-colors flex items-center gap-1.5 shadow-sm">
              <PlaySquare className="w-3.5 h-3.5" />
              Judge Quick Demo
            </Link>
            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-industrial-700 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-industrial-danger"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-8 bg-industrial-900">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
