import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Eye,
  ShieldAlert,
  Flame,
  UserCheck
} from 'lucide-react'

export default function Incidents() {
  const [incidents, setIncidents] = useState([])
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterSeverity, setFilterSeverity] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    try {
      const res = await axios.get('/api/incidents')
      setIncidents(res.data)
    } catch (err) {
      console.error('Error fetching incidents', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledge = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await axios.patch(`/api/incidents/${id}`, { status: 'ACKNOWLEDGED' })
      fetchIncidents()
    } catch (err) {
      console.error('Error acknowledging', err)
    }
  }

  const handleResolve = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await axios.patch(`/api/incidents/${id}`, { status: 'RESOLVED', resolution_note: 'Verified and resolved by shift supervisor.' })
      fetchIncidents()
    } catch (err) {
      console.error('Error resolving', err)
    }
  }

  const filteredIncidents = incidents.filter((inc) => {
    const matchStatus = filterStatus === 'ALL' || inc.status === filterStatus
    const matchSeverity = filterSeverity === 'ALL' || inc.severity === filterSeverity
    const matchSearch = searchQuery === '' || 
      inc.event_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.zone_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.camera_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSeverity && matchSearch
  })

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2.5 py-1 text-xs font-bold bg-industrial-danger/20 text-industrial-danger border border-industrial-danger/30 rounded-lg">CRITICAL</span>
      case 'HIGH':
        return <span className="px-2.5 py-1 text-xs font-bold bg-industrial-warning/20 text-industrial-warning border border-industrial-warning/30 rounded-lg">HIGH</span>
      case 'MEDIUM':
        return <span className="px-2.5 py-1 text-xs font-bold bg-industrial-accent/20 text-industrial-accent border border-industrial-accent/30 rounded-lg">MEDIUM</span>
      default:
        return <span className="px-2.5 py-1 text-xs font-bold bg-industrial-info/20 text-industrial-info border border-industrial-info/30 rounded-lg">LOW</span>
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2 py-0.5 text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded">NEW</span>
      case 'ACKNOWLEDGED':
        return <span className="px-2 py-0.5 text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded">ACKNOWLEDGED</span>
      case 'INVESTIGATING':
        return <span className="px-2 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">INVESTIGATING</span>
      case 'RESOLVED':
        return <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">RESOLVED</span>
      default:
        return <span className="px-2 py-0.5 text-xs font-bold bg-gray-500/20 text-gray-400 rounded">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Incident Lifecycle & Investigation</h1>
          <p className="text-sm text-gray-400 mt-1">Audit Trail • Evidence Snapshots • Supervisor Escalation & Resolution</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-industrial-800 border border-industrial-700 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event, zone, or camera..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-industrial-900 border border-industrial-600 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-industrial-accent"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg bg-industrial-900 border border-industrial-600 text-xs text-white focus:outline-none focus:border-industrial-accent"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Severity:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 rounded-lg bg-industrial-900 border border-industrial-600 text-xs text-white focus:outline-none focus:border-industrial-accent"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Table / List */}
      <div className="bg-industrial-800 border border-industrial-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-industrial-900/60 border-b border-industrial-700 text-xs text-gray-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Severity / Event</th>
                <th className="px-6 py-4">Zone & Camera</th>
                <th className="px-6 py-4">Confidence</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-700">
              {filteredIncidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-industrial-700/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getSeverityBadge(inc.severity)}
                      <div>
                        <Link to={`/incidents/${inc.id}`} className="font-bold text-white hover:text-industrial-accent transition-colors block">
                          {inc.event_type?.replace(/_/g, ' ')}
                        </Link>
                        <span className="text-xs text-gray-400 font-mono">ID: {inc.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-200">{inc.zone_name || 'Assembly Line A'}</div>
                    <div className="text-xs text-gray-400">{inc.camera_name || 'CAM-01'}</div>
                  </td>

                  <td className="px-6 py-4 font-mono text-xs text-industrial-accent">
                    {Math.round((inc.confidence || 0.9) * 100)}%
                  </td>

                  <td className="px-6 py-4">
                    {getStatusBadge(inc.status)}
                  </td>

                  <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                    {new Date(inc.created_at).toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {inc.status === 'NEW' && (
                        <button
                          onClick={(e) => handleAcknowledge(inc.id, e)}
                          className="px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/40 text-xs font-semibold"
                        >
                          Acknowledge
                        </button>
                      )}
                      {inc.status !== 'RESOLVED' && (
                        <button
                          onClick={(e) => handleResolve(inc.id, e)}
                          className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-semibold"
                        >
                          Resolve
                        </button>
                      )}
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="p-1.5 rounded-lg bg-industrial-700 hover:bg-industrial-600 text-gray-300"
                        title="View Incident Dossier"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
