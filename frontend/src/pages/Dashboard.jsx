import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { 
  AlertTriangle, 
  ShieldCheck, 
  Activity,
  HardHat,
  Ban,
  Clock,
  ArrowUpRight
} from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    // Poll every 5s for realtime live stats
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, incRes] = await Promise.all([
        axios.get('/api/gate/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/gate/compliance-incidents', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ])
      setStats(statsRes.data)
      setIncidents(incRes.data || [])
    } catch (err) {
      console.error('Error loading dashboard data', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-0.5 text-xs font-bold bg-industrial-warning/20 text-industrial-warning border border-industrial-warning/30 rounded">PENDING</span>
      case 'ESCALATED':
        return <span className="px-2 py-0.5 text-xs font-bold bg-industrial-danger/20 text-industrial-danger border border-industrial-danger/30 rounded">ESCALATED</span>
      case 'RESOLVED':
        return <span className="px-2 py-0.5 text-xs font-bold bg-industrial-success/20 text-industrial-success border border-industrial-success/30 rounded">RESOLVED</span>
      default:
        return <span className="px-2 py-0.5 text-xs font-bold bg-industrial-info/20 text-industrial-info border border-industrial-info/30 rounded">{status}</span>
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Bar Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">System Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time Scanner Intelligence & Incident Triage</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-industrial-800 border border-industrial-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Scans (Today)</span>
            <Activity className="w-5 h-5 text-industrial-accent" />
          </div>
          <div className="text-3xl font-black text-white mt-3">{stats?.today_scans || 0}</div>
          <div className="text-xs text-gray-400 mt-1 font-semibold flex items-center gap-1">
            <span>Overall: {stats?.total_scans || 0} scans</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-industrial-800 border border-industrial-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Access Allowed</span>
            <ShieldCheck className="w-5 h-5 text-industrial-success" />
          </div>
          <div className="text-3xl font-black text-white mt-3">{stats?.allowed || 0}</div>
          <div className="text-xs text-industrial-success mt-1 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Compliant Entrances</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-industrial-800 border border-industrial-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Access Denied</span>
            <Ban className="w-5 h-5 text-industrial-danger" />
          </div>
          <div className="text-3xl font-black text-industrial-danger mt-3">{stats?.violations || 0}</div>
          <div className="text-xs text-gray-400 mt-1 font-medium">PPE Violations</div>
        </div>

        <div className="p-5 rounded-xl bg-industrial-800 border border-industrial-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Incidents</span>
            <AlertTriangle className="w-5 h-5 text-industrial-warning" />
          </div>
          <div className="text-3xl font-black text-white mt-3">{stats?.pending_incidents || 0}</div>
          <div className="text-xs text-industrial-warning mt-1 font-semibold">Requires Supervisor Triage</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Incidents */}
        <div className="bg-industrial-800 border border-industrial-700 rounded-xl flex flex-col">
          <div className="p-5 border-b border-industrial-700 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-industrial-warning" />
                Recent Incidents
              </h2>
            </div>
            <Link to="/incidents" className="text-xs text-industrial-accent hover:underline font-semibold">View All</Link>
          </div>
          <div className="p-0 overflow-y-auto max-h-96">
            {incidents.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No active incidents found.
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-industrial-900/50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Employee</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Missing PPE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-industrial-700/50">
                  {incidents.slice(0, 8).map((inc) => (
                    <tr key={inc.id} className="hover:bg-industrial-700/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{inc.employee_name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{inc.employee_code || '---'}</div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(inc.status)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-industrial-danger/20 text-industrial-danger px-2 py-1 rounded">
                          {Array.isArray(inc.missing_ppe) ? inc.missing_ppe.join(', ') : (inc.missing_ppe || 'None')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
