import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Download, 
  Flame, 
  HardHat,
  Layers,
  Award
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts'

export default function Analytics() {
  const [stats, setStats] = useState(null)

  const complianceTrend = [
    { day: 'Mon', compliance: 92, target: 95 },
    { day: 'Tue', compliance: 94, target: 95 },
    { day: 'Wed', compliance: 91, target: 95 },
    { day: 'Thu', compliance: 96, target: 95 },
    { day: 'Fri', compliance: 95, target: 95 },
    { day: 'Sat', compliance: 97, target: 95 },
    { day: 'Sun', compliance: 98, target: 95 },
  ]

  const violationsByZone = [
    { zone: 'Welding', violations: 12 },
    { zone: 'Assembly', violations: 8 },
    { zone: 'Chemical', violations: 4 },
    { zone: 'Loading Bay', violations: 7 },
    { zone: 'Warehouse', violations: 3 },
  ]

  const violationsByType = [
    { name: 'Missing Helmet', value: 45, color: '#EF4444' },
    { name: 'Missing High-Vis Vest', value: 30, color: '#F59E0B' },
    { name: 'Missing Gloves', value: 15, color: '#3B82F6' },
    { name: 'No Safety Boots', value: 10, color: '#8B5CF6' },
  ]

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/api/analytics/overview')
      setStats(res.data)
    } catch (err) {
      console.error('Error fetching analytics', err)
    }
  }

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Zone,ComplianceRate,TotalViolations,FireAlerts,SmokeAlerts,MTTR\n"
      + "2026-09-30,All Zones,94.7%,34,1,3,01:42\n"
      + "2026-09-29,All Zones,93.2%,41,0,2,02:10\n"
      + "2026-09-28,All Zones,95.1%,28,0,1,01:25\n"
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `astra_safety_report_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Safety Compliance & EHS Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Aggregated Intelligence across Shifts, Zones, and Incident Classes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportReport}
            className="px-4 py-2 rounded-lg bg-industrial-800 border border-industrial-600 hover:border-industrial-accent text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <Download className="w-4 h-4 text-industrial-accent" />
            Export EHS Audit Report (CSV)
          </button>
        </div>
      </div>

      {/* Safety Impact & ROI Highlights */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-industrial-800 via-industrial-800 to-industrial-900 border border-industrial-700/80 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-industrial-accent/10 text-industrial-accent">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Operational Safety ROI & Impact Metrics</h2>
            <p className="text-xs text-gray-400">Measured effectiveness of autonomous computer vision deployment</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-industrial-900/60 border border-industrial-700">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Automated Safety Checks</span>
            <div className="text-2xl font-black text-white mt-1">14,280 / day</div>
            <span className="text-[11px] text-emerald-400 font-semibold">100% video stream coverage</span>
          </div>

          <div className="p-4 rounded-xl bg-industrial-900/60 border border-industrial-700">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Manual Inspection Hours Saved</span>
            <div className="text-2xl font-black text-white mt-1">128 hrs / mo</div>
            <span className="text-[11px] text-emerald-400 font-semibold">Equivalent to 0.8 FTE</span>
          </div>

          <div className="p-4 rounded-xl bg-industrial-900/60 border border-industrial-700">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Hazard Intervention Speed</span>
            <div className="text-2xl font-black text-industrial-accent mt-1">&lt; 15 seconds</div>
            <span className="text-[11px] text-gray-400 font-semibold">Instant Supervisor Alert</span>
          </div>

          <div className="p-4 rounded-xl bg-industrial-900/60 border border-industrial-700">
            <span className="text-[11px] font-bold text-gray-400 uppercase">PPE Compliance Gain</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">+18.4%</div>
            <span className="text-[11px] text-emerald-400 font-semibold">Since system onboarding</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Trend Chart */}
        <div className="bg-industrial-800 border border-industrial-700 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
            <span>Weekly PPE Compliance Trajectory</span>
            <span className="text-xs text-emerald-400 font-mono">Current: 94.7%</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={complianceTrend}>
                <defs>
                  <linearGradient id="compGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} domain={[85, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }} />
                <Area type="monotone" dataKey="compliance" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#compGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Violations by Zone Bar Chart */}
        <div className="bg-industrial-800 border border-industrial-700 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
            <span>Total Violations by Industrial Zone</span>
            <span className="text-xs text-red-400 font-mono">Top: Welding Area</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={violationsByZone}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="zone" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }} />
                <Bar dataKey="violations" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Violations Breakdown Pie Chart */}
        <div className="bg-industrial-800 border border-industrial-700 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Non-Compliance Breakdown by Gear Type</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={violationsByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {violationsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', fontSize: '12px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shift Summary Breakdown */}
        <div className="bg-industrial-800 border border-industrial-700 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4">Shift Risk & Compliance Rating</h3>
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-industrial-900 border border-industrial-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Morning Shift (06:00 - 14:00)</div>
                  <div className="text-gray-400">Lead: Supervisor R. Sharma</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400">96.2% Compliant</div>
                  <div className="text-gray-500">4 Incidents</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-industrial-900 border border-industrial-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Evening Shift (14:00 - 22:00)</div>
                  <div className="text-gray-400">Lead: Supervisor A. Jena</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-yellow-400">91.8% Compliant</div>
                  <div className="text-gray-500">9 Incidents</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-industrial-900 border border-industrial-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Night Maintenance Shift (22:00 - 06:00)</div>
                  <div className="text-gray-400">Lead: Supervisor P. Mohanty</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400">97.4% Compliant</div>
                  <div className="text-gray-500">2 Incidents</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
