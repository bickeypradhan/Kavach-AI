import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { 
  ArrowLeft, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck,
  FileText,
  Send
} from 'lucide-react'

export default function IncidentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [incident, setIncident] = useState(null)
  const [resolutionNote, setResolutionNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchIncident()
  }, [id])

  const fetchIncident = async () => {
    try {
      const res = await axios.get(`/api/incidents/${id}`)
      setIncident(res.data)
      if (res.data.resolution_note) setResolutionNote(res.data.resolution_note)
    } catch (err) {
      console.error('Error fetching incident', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status) => {
    setUpdating(true)
    try {
      await axios.patch(`/api/incidents/${id}`, {
        status,
        resolution_note: resolutionNote
      })
      fetchIncident()
    } catch (err) {
      console.error('Error updating status', err)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading incident dossier...</div>
  }

  if (!incident) {
    return <div className="text-center py-20 text-red-400">Incident not found.</div>
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/incidents')}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Incidents
        </button>

        <div className="flex items-center gap-2 font-mono text-xs text-gray-400">
          <span>INCIDENT_ID: <strong>{incident.id}</strong></span>
        </div>
      </div>

      {/* Main Dossier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Evidence Snapshot & AI Context */}
        <div className="md:col-span-2 space-y-6">
          {/* Evidence Frame */}
          <div className="bg-industrial-800 border border-industrial-700 rounded-xl overflow-hidden">
            <div className="p-4 bg-industrial-900/80 border-b border-industrial-700 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-industrial-accent" />
                CCTV Evidence Frame Capture
              </span>
              <span className="text-xs text-industrial-accent font-mono font-semibold">
                AI Confidence: {Math.round((incident.confidence || 0.9) * 100)}%
              </span>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center p-2">
              {incident.evidence_image ? (
                <img
                  src={incident.evidence_image}
                  alt="Evidence capture"
                  className="w-full h-full object-contain rounded"
                />
              ) : (
                <div className="text-gray-500 text-xs font-mono">No visual snapshot attached</div>
              )}
            </div>
          </div>

          {/* Incident Timeline / Audit */}
          <div className="bg-industrial-800 border border-industrial-700 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-industrial-accent" />
              Incident Resolution Timeline
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold">1</div>
                <div>
                  <div className="font-bold text-white">Threat Detected by AI Vision Model</div>
                  <div className="text-gray-400">{new Date(incident.created_at).toLocaleString()} • Event: {incident.event_type}</div>
                </div>
              </div>

              {incident.acknowledged_at && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold">2</div>
                  <div>
                    <div className="font-bold text-white">Incident Acknowledged by Shift Supervisor</div>
                    <div className="text-gray-400">{new Date(incident.acknowledged_at).toLocaleString()}</div>
                  </div>
                </div>
              )}

              {incident.resolved_at && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">3</div>
                  <div>
                    <div className="font-bold text-white">Incident Resolved & Audited</div>
                    <div className="text-gray-400">{new Date(incident.resolved_at).toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Details & Action Controls */}
        <div className="space-y-6">
          <div className="bg-industrial-800 border border-industrial-700 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-industrial-700 pb-3">
              Telemetry & Location
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block">Severity Classification</span>
                <span className="font-bold text-white text-sm">{incident.severity}</span>
              </div>

              <div>
                <span className="text-gray-400 block">Target Zone</span>
                <span className="font-bold text-white">{incident.zone_name || 'Welding Area'}</span>
              </div>

              <div>
                <span className="text-gray-400 block">Camera Feed Source</span>
                <span className="font-bold text-white">{incident.camera_name || 'CAM-02 Welding Booth 3'}</span>
              </div>

              <div>
                <span className="text-gray-400 block">Current Status</span>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-industrial-accent/20 text-industrial-accent font-bold">
                  {incident.status}
                </span>
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="pt-4 border-t border-industrial-700 space-y-3">
              <span className="text-xs font-bold text-gray-300 block">Supervisor Action Panel</span>

              {incident.status === 'NEW' && (
                <button
                  onClick={() => updateStatus('ACKNOWLEDGED')}
                  disabled={updating}
                  className="w-full py-2 rounded-lg bg-yellow-500 text-industrial-900 font-bold text-xs hover:bg-yellow-400 transition-all"
                >
                  Acknowledge Incident
                </button>
              )}

              {incident.status !== 'RESOLVED' && (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Enter resolution notes / corrective actions taken..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-industrial-900 border border-industrial-600 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-industrial-accent"
                  />
                  <button
                    onClick={() => updateStatus('RESOLVED')}
                    disabled={updating}
                    className="w-full py-2 rounded-lg bg-emerald-500 text-industrial-900 font-bold text-xs hover:bg-emerald-400 transition-all"
                  >
                    Mark as Resolved & Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
