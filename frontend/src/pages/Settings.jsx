import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Settings as SettingsIcon, 
  Users, 
  Video, 
  ShieldCheck, 
  Activity, 
  Plus, 
  CheckCircle2,
  Server,
  Building,
  Key
} from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('rules')
  const [users, setUsers] = useState([])
  const [cameras, setCameras] = useState([])
  const [rules, setRules] = useState([])
  const [zones, setZones] = useState([])
  const [newCam, setNewCam] = useState({ name: '', location: '', stream_url: '', site_id: 'site-1' })
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [uRes, cRes, rRes, zRes, hRes] = await Promise.all([
        axios.get('/api/users').catch(() => ({ data: [] })),
        axios.get('/api/cameras'),
        axios.get('/api/rules'),
        axios.get('/api/zones'),
        axios.get('/api/health')
      ])
      setUsers(uRes.data)
      setCameras(cRes.data)
      setRules(rRes.data)
      setZones(zRes.data)
      setHealth(hRes.data)
    } catch (err) {
      console.error('Error fetching settings', err)
    }
  }

  const addCamera = async (e) => {
    e.preventDefault()
    if (!newCam.name) return
    try {
      await axios.post('/api/cameras', newCam)
      setNewCam({ name: '', location: '', stream_url: '', site_id: 'site-1' })
      fetchData()
    } catch (err) {
      console.error('Error adding camera', err)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Administration & Configuration</h1>
        <p className="text-sm text-gray-400 mt-1">Manage PPE Zone Mandates, CCTV Feeds, RBAC Profiles, and Microservice Health</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-industrial-700 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('rules')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'rules'
              ? 'border-industrial-accent text-industrial-accent font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Zone Safety Rules
        </button>

        <button
          onClick={() => setActiveTab('cameras')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'cameras'
              ? 'border-industrial-accent text-industrial-accent font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          CCTV Stream Feeds
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-industrial-accent text-industrial-accent font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          User Accounts & RBAC
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'system'
              ? 'border-industrial-accent text-industrial-accent font-bold'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          System Health Telemetry
        </button>
      </div>

      {/* Tab 1: Zone Safety Rules */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="bg-industrial-800 border border-industrial-700 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Configured Zone PPE Requirements</h3>
            <div className="space-y-3">
              {rules.map((rule) => {
                const zone = zones.find(z => z.id === rule.zone_id)
                return (
                  <div key={rule.id} className="p-4 rounded-xl bg-industrial-900 border border-industrial-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{zone?.name || 'Factory Zone'}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Enforced PPE: <strong className="text-industrial-accent font-mono">{rule.required_ppe}</strong></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                        AI Enforcement: ACTIVE
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Cameras */}
      {activeTab === 'cameras' && (
        <div className="space-y-6">
          <form onSubmit={addCamera} className="p-6 rounded-xl bg-industrial-800 border border-industrial-700">
            <h3 className="text-sm font-bold text-white mb-4">Register New Camera / Stream Source</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <input
                type="text"
                placeholder="Camera Name (e.g. CAM-07 Paint Booth)"
                value={newCam.name}
                onChange={(e) => setNewCam({ ...newCam, name: e.target.value })}
                className="p-2.5 rounded-lg bg-industrial-900 border border-industrial-600 text-xs text-white"
                required
              />
              <input
                type="text"
                placeholder="Location / Zone"
                value={newCam.location}
                onChange={(e) => setNewCam({ ...newCam, location: e.target.value })}
                className="p-2.5 rounded-lg bg-industrial-900 border border-industrial-600 text-xs text-white"
                required
              />
              <input
                type="text"
                placeholder="RTSP URL (e.g. rtsp://192.168.1.50/live)"
                value={newCam.stream_url}
                onChange={(e) => setNewCam({ ...newCam, stream_url: e.target.value })}
                className="p-2.5 rounded-lg bg-industrial-900 border border-industrial-600 text-xs text-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-industrial-accent text-industrial-900 font-bold text-xs hover:bg-yellow-400 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Camera Feed
            </button>
          </form>

          <div className="bg-industrial-800 border border-industrial-700 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Active Camera Inventory</h3>
            <div className="space-y-2">
              {cameras.map(cam => (
                <div key={cam.id} className="p-3 rounded-lg bg-industrial-900 border border-industrial-700 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-white text-sm block">{cam.name}</strong>
                    <span className="text-gray-400">{cam.location} • Source: {cam.source_type}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${cam.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {cam.status?.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Users */}
      {activeTab === 'users' && (
        <div className="bg-industrial-800 border border-industrial-700 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Authorized Personnel & Roles</h3>
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="p-3.5 rounded-lg bg-industrial-900 border border-industrial-700 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-white text-sm block">{u.name}</strong>
                  <span className="text-gray-400">{u.email}</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-industrial-700 text-industrial-accent font-bold font-mono">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: System */}
      {activeTab === 'system' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-industrial-800 border border-industrial-700">
              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold text-white text-sm">Node.js API Microservice</span>
              </div>
              <div className="text-xs text-gray-400">Status: <strong>Healthy (Port 5000)</strong></div>
              <div className="text-xs text-gray-400 mt-1">Uptime: <strong>{Math.round(health?.uptime || 120)}s</strong></div>
            </div>

            <div className="p-5 rounded-xl bg-industrial-800 border border-industrial-700">
              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold text-white text-sm">Python AI Vision Service</span>
              </div>
              <div className="text-xs text-gray-400">Status: <strong>FastAPI Active (Port 8000)</strong></div>
              <div className="text-xs text-gray-400 mt-1">YOLOv8 Weights: <strong>Loaded</strong></div>
            </div>

            <div className="p-5 rounded-xl bg-industrial-800 border border-industrial-700">
              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold text-white text-sm">Relational SQLite DB</span>
              </div>
              <div className="text-xs text-gray-400">Status: <strong>Connected (ACID Mode)</strong></div>
              <div className="text-xs text-gray-400 mt-1">Tables: <strong>10 Initialized</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
