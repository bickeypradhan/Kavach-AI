import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { 
  PlaySquare, 
  Flame, 
  HardHat, 
  ShieldAlert, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Activity,
  AlertTriangle,
  RotateCcw
} from 'lucide-react'

export default function Demo() {
  const navigate = useNavigate()
  const [running, setRunning] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [latestResult, setLatestResult] = useState(null)

  const scenarios = [
    {
      id: 'fire_welding',
      title: 'Scenario 1: Critical Fire in Welding Booth 3',
      zone: 'Welding Area',
      camera_id: 'cam-2',
      event_type: 'FIRE_DETECTED',
      severity: 'CRITICAL',
      confidence: 0.96,
      icon: Flame,
      color: 'border-red-500 hover:border-red-400',
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
      description: 'Rapid open flame detected near combustible cylinders in the metal fabrication bay.',
      evidence_image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80',
      boxes: [{ box: [120, 180, 320, 420], label: 'fire_flame', conf: 0.96 }]
    },
    {
      id: 'no_helmet_assembly',
      title: 'Scenario 2: Missing Helmet on Assembly Line A',
      zone: 'Assembly Line A',
      camera_id: 'cam-1',
      event_type: 'PPE_NON_COMPLIANCE',
      severity: 'HIGH',
      confidence: 0.92,
      icon: HardHat,
      color: 'border-yellow-500 hover:border-yellow-400',
      badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      description: 'Worker operating heavy mechanical crane without required hard hat / head protection.',
      evidence_image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      boxes: [{ box: [90, 140, 260, 310], label: 'worker_no_helmet', conf: 0.92 }]
    },
    {
      id: 'smoke_chemical',
      title: 'Scenario 3: Chemical Vault Toxic Smoke Haze',
      zone: 'Chemical Storage',
      camera_id: 'cam-3',
      event_type: 'SMOKE_DETECTED',
      severity: 'HIGH',
      confidence: 0.91,
      icon: AlertTriangle,
      color: 'border-orange-500 hover:border-orange-400',
      badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      description: 'Diffuse smoke plume spreading near solvent barrels indicating potential thermal runaway.',
      evidence_image: 'https://images.unsplash.com/photo-1574689049868-e94ed5301745?auto=format&fit=crop&w=800&q=80',
      boxes: [{ box: [60, 100, 280, 290], label: 'smoke_plume', conf: 0.91 }]
    },
    {
      id: 'no_vest_loading',
      title: 'Scenario 4: Missing High-Vis Vest in Loading Bay',
      zone: 'Loading Bay',
      camera_id: 'cam-4',
      event_type: 'PPE_NON_COMPLIANCE',
      severity: 'MEDIUM',
      confidence: 0.89,
      icon: ShieldAlert,
      color: 'border-blue-500 hover:border-blue-400',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      description: 'Logistics personnel walking in forklift transit lane without reflective high-vis jacket.',
      evidence_image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      boxes: [{ box: [80, 120, 250, 300], label: 'worker_no_vest', conf: 0.89 }]
    }
  ]

  const triggerScenario = async (sc) => {
    setRunning(true)
    setActiveStep(1)
    setLatestResult(null)

    // Step 1: Detect
    await new Promise((r) => setTimeout(r, 600))
    setActiveStep(2)

    // Step 2: Understand & Zone Map
    await new Promise((r) => setTimeout(r, 600))
    setActiveStep(3)

    // Step 3: Prioritize & Alert
    try {
      const res = await axios.post('/api/ai/events', {
        camera_id: sc.camera_id,
        zone_id: sc.zone === 'Welding Area' ? 'zone-2' : sc.zone === 'Assembly Line A' ? 'zone-1' : sc.zone === 'Chemical Storage' ? 'zone-3' : 'zone-4',
        event_type: sc.event_type,
        confidence: sc.confidence,
        bounding_boxes: sc.boxes,
        evidence_image: sc.evidence_image,
        severity: sc.severity
      })
      
      setActiveStep(4)
      await new Promise((r) => setTimeout(r, 500))
      setActiveStep(5)
      setLatestResult({
        ...sc,
        incident_id: res.data.incident_id
      })
    } catch (err) {
      console.error('Demo simulation error', err)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-industrial-accent/10 border border-industrial-accent/30 text-industrial-accent text-xs font-bold uppercase mb-2">
            <Activity className="w-3.5 h-3.5" />
            Hackathon Judge Live Demonstration Mode
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Interactive AI Pipeline Simulation Suite</h1>
          <p className="text-sm text-gray-400 mt-1">Execute single-click end-to-end safety scenarios to evaluate vision inference and triage workflows.</p>
        </div>
      </div>

      {/* 6-Step Workflow Visualizer */}
      <div className="p-6 rounded-2xl bg-industrial-800 border border-industrial-700">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Autonomous Safety Loop Lifecycle</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className={`p-3 rounded-xl border transition-all ${activeStep >= 1 ? 'bg-industrial-accent/20 border-industrial-accent text-white' : 'bg-industrial-900/60 border-industrial-700 text-gray-400'}`}>
            <div className="text-xs font-bold">1. DETECT</div>
            <div className="text-[10px] mt-1 text-gray-400">YOLOv8 + Vision Ingest</div>
          </div>

          <div className={`p-3 rounded-xl border transition-all ${activeStep >= 2 ? 'bg-industrial-accent/20 border-industrial-accent text-white' : 'bg-industrial-900/60 border-industrial-700 text-gray-400'}`}>
            <div className="text-xs font-bold">2. UNDERSTAND</div>
            <div className="text-[10px] mt-1 text-gray-400">Zone Polygon Mapping</div>
          </div>

          <div className={`p-3 rounded-xl border transition-all ${activeStep >= 3 ? 'bg-industrial-accent/20 border-industrial-accent text-white' : 'bg-industrial-900/60 border-industrial-700 text-gray-400'}`}>
            <div className="text-xs font-bold">3. PRIORITIZE</div>
            <div className="text-[10px] mt-1 text-gray-400">Risk Severity Scoring</div>
          </div>

          <div className={`p-3 rounded-xl border transition-all ${activeStep >= 4 ? 'bg-industrial-accent/20 border-industrial-accent text-white' : 'bg-industrial-900/60 border-industrial-700 text-gray-400'}`}>
            <div className="text-xs font-bold">4. ALERT</div>
            <div className="text-[10px] mt-1 text-gray-400">Real-Time WebSocket Push</div>
          </div>

          <div className={`p-3 rounded-xl border transition-all ${activeStep >= 5 ? 'bg-emerald-500/20 border-emerald-500 text-white' : 'bg-industrial-900/60 border-industrial-700 text-gray-400'}`}>
            <div className="text-xs font-bold">5. RECORD & AUDIT</div>
            <div className="text-[10px] mt-1 text-gray-400">EHS Incident Dossier</div>
          </div>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((sc) => {
          const Icon = sc.icon
          return (
            <div
              key={sc.id}
              className={`p-6 rounded-2xl bg-industrial-800 border transition-all flex flex-col justify-between ${sc.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-industrial-900 text-white">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{sc.title}</h3>
                      <span className="text-xs text-gray-400">{sc.zone} • {sc.camera_id}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${sc.badgeColor}`}>
                    {sc.severity}
                  </span>
                </div>

                <p className="text-xs text-gray-300 mb-6 leading-relaxed">
                  {sc.description}
                </p>
              </div>

              <button
                onClick={() => triggerScenario(sc)}
                disabled={running}
                className="w-full py-3 rounded-xl bg-industrial-900 border border-industrial-600 hover:border-industrial-accent text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-industrial-700 transition-all shadow-md"
              >
                <PlaySquare className="w-4 h-4 text-industrial-accent" />
                {running ? 'Simulating Detection Flow...' : 'Execute Live Detection Scenario'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Triggered Result Preview Box */}
      {latestResult && (
        <div className="p-6 rounded-2xl bg-industrial-800 border-2 border-emerald-500 shadow-2xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white">Live Event Generated & Synced with Command Center!</h3>
                <span className="text-xs text-gray-400 font-mono">Incident Ref: {latestResult.incident_id}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/incidents/${latestResult.incident_id}`}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-industrial-900 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center gap-1.5"
              >
                Inspect Incident Dossier
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-lg bg-industrial-700 hover:bg-industrial-600 text-white font-bold text-xs transition-all"
              >
                View in Command Center
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-industrial-900/70 p-4 rounded-xl border border-industrial-700">
            <div>
              <span className="text-gray-400 block">Identified Threat:</span>
              <strong className="text-white text-sm">{latestResult.event_type}</strong>
            </div>
            <div>
              <span className="text-gray-400 block">Affected Zone:</span>
              <strong className="text-white text-sm">{latestResult.zone}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
