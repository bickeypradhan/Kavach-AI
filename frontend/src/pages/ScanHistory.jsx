import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000'

const STATUS_COLOR = {
  ALLOW: 'text-green-400 bg-green-900/20 border-green-700',
  EXEMPT: 'text-blue-400 bg-blue-900/20 border-blue-700',
  HOLD: 'text-yellow-400 bg-yellow-900/20 border-yellow-700',
  PENDING: 'text-yellow-400 bg-yellow-900/20 border-yellow-700',
  RESOLVED: 'text-green-400 bg-green-900/20 border-green-700',
  ESCALATED: 'text-red-400 bg-red-900/20 border-red-700',
}

function StatusBadge({ status }) {
  return <span className={`text-xs px-2 py-0.5 border rounded ${STATUS_COLOR[status] || 'text-gray-400 border-gray-600'}`}>{status}</span>
}

export default function ScanHistory() {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filters, setFilters] = useState({ department:'', status:'', employee:'', missing_ppe:'' })
  const token = localStorage.getItem('token')

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.department) params.department = filters.department
      if (filters.status)     params.status     = filters.status
      if (filters.employee)   params.employee   = filters.employee
      if (filters.missing_ppe) params.missing_ppe = filters.missing_ppe
      params.limit = 200
      const { data } = await axios.get(`${API}/api/gate/scans`, {
        headers: { Authorization: `Bearer ${token}` }, params
      })
      setScans(data)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [filters])

  const departments = [...new Set(scans.map(s => s.department_name).filter(Boolean))]
  const statuses = ['ALLOW','HOLD','EXEMPT']

  const arr = v => Array.isArray(v) ? v : []

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-mono">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-cyan-400 tracking-widest">📋 GATE SCAN HISTORY</h1>
          <p className="text-xs text-gray-500 mt-0.5">Real-time database records — XAMPP MariaDB</p>
        </div>
        <button onClick={load} className="text-xs text-cyan-400 border border-cyan-700 px-3 py-1.5 rounded hover:bg-cyan-900/20 transition">
          ↻ REFRESH
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-gray-800 flex flex-wrap gap-3">
        <select value={filters.department} onChange={e => setFilters({...filters, department: e.target.value})}
          className="bg-gray-800 border border-gray-600 text-xs rounded px-2 py-1.5 text-gray-300">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}
          className="bg-gray-800 border border-gray-600 text-xs rounded px-2 py-1.5 text-gray-300">
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={filters.employee} onChange={e => setFilters({...filters, employee: e.target.value})}
          placeholder="Search employee…"
          className="bg-gray-800 border border-gray-600 text-xs rounded px-2 py-1.5 text-gray-300 placeholder-gray-600 w-40"/>
        <input value={filters.missing_ppe} onChange={e => setFilters({...filters, missing_ppe: e.target.value})}
          placeholder="Missing PPE…"
          className="bg-gray-800 border border-gray-600 text-xs rounded px-2 py-1.5 text-gray-300 placeholder-gray-600 w-32"/>
        {Object.values(filters).some(Boolean) && (
          <button onClick={() => setFilters({ department:'', status:'', employee:'', missing_ppe:'' })}
            className="text-xs text-gray-500 hover:text-gray-300 transition">✕ Clear</button>
        )}
      </div>

      <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Table */}
        <div className={`${selected ? 'w-1/2' : 'w-full'} overflow-auto`}>
          {loading ? (
            <div className="text-center py-20 text-gray-500 animate-pulse">Loading scans…</div>
          ) : scans.length === 0 ? (
            <div className="text-center py-20 text-gray-600">No scan records found</div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-gray-900 border-b border-gray-700 sticky top-0">
                <tr>
                  {['Time','Employee','Dept','Role','Detected','Missing','Status','Actions'].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-gray-500 font-medium tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scans.map((s, i) => (
                  <tr key={s.id} onClick={() => setSelected(s)} className={`border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 ${selected?.id === s.id ? 'bg-gray-800' : i%2===0 ? 'bg-gray-950' : 'bg-gray-900'}`}>
                    <td className="px-3 py-2 text-gray-400 whitespace-nowrap">
                      {new Date(s.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-gray-200">{s.employee_name}</div>
                      <div className="text-gray-600">{s.employee_code}</div>
                    </td>
                    <td className="px-3 py-2 text-gray-400">{s.department_name}</td>
                    <td className="px-3 py-2 text-gray-400">{s.role_name}</td>
                    <td className="px-3 py-2 text-green-500">{arr(s.detected_ppe).join(', ') || '—'}</td>
                    <td className="px-3 py-2 text-red-400">{arr(s.missing_ppe).join(', ') || '—'}</td>
                    <td className="px-3 py-2"><StatusBadge status={s.compliance_status}/></td>
                    <td className="px-3 py-2">
                      <button onClick={e => { e.stopPropagation(); setSelected(s) }}
                        className="text-cyan-600 hover:text-cyan-400 text-xs">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-1/2 border-l border-gray-700 overflow-auto bg-gray-900">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <span className="text-cyan-400 font-bold text-sm">SCAN DETAIL</span>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-300">✕</button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              {[
                ['Scan ID', selected.id],
                ['Timestamp', selected.timestamp ? new Date(selected.timestamp).toLocaleString() : '—'],
                ['Employee', `${selected.employee_name} (${selected.employee_code})`],
                ['Department', selected.department_name || '—'],
                ['Role', selected.role_name || '—'],
                ['Gate', selected.gate_id || '—'],
                ['Status', selected.compliance_status],
                ['Required PPE', arr(selected.required_ppe).join(', ') || 'None'],
                ['Detected PPE', arr(selected.detected_ppe).join(', ') || 'None'],
                ['Missing PPE', arr(selected.missing_ppe).join(', ') || 'None'],
                ['Deadline', selected.deadline_at ? new Date(selected.deadline_at).toLocaleString() : '—'],
                ['Resolved At', selected.resolved_at ? new Date(selected.resolved_at).toLocaleString() : '—'],
                ['Escalated At', selected.escalated_at ? new Date(selected.escalated_at).toLocaleString() : '—'],
                ['AI Inference', selected.ai_inference_ms ? `${selected.ai_inference_ms}ms` : '—'],
                ['Total Latency', selected.total_ms ? `${selected.total_ms}ms` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500 w-28 flex-shrink-0">{k}</span>
                  <span className="text-gray-200 text-right break-all">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-1 border-t border-gray-800 text-xs text-gray-600 flex justify-between">
        <span>{scans.length} records</span>
        <span>Source: XAMPP MariaDB · factory_safety.gate_scans</span>
      </div>
    </div>
  )
}
