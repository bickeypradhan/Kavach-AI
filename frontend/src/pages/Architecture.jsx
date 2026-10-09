import { 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Flame, 
  Eye, 
  Database, 
  Server, 
  Radio, 
  GitBranch,
  Activity,
  CheckCircle2
} from 'lucide-react'

export default function Architecture() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-industrial-accent/10 border border-industrial-accent/30 text-industrial-accent text-xs font-bold uppercase mb-2">
          <Cpu className="w-3.5 h-3.5" />
          Technical Blueprint & Engineering Specs
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">System Architecture & AI Vision Pipeline</h1>
        <p className="text-sm text-gray-400 mt-1">Multi-Tier Microservice Topology for Real-Time Industrial Computer Vision</p>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="p-6 rounded-2xl bg-industrial-800 border border-industrial-700 space-y-6">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-industrial-accent" />
          End-to-End Vision Ingestion & Triage Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Tier 1 */}
          <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-700 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold mb-3">1</div>
              <h3 className="font-bold text-white text-sm mb-1">CCTV Stream Ingestion</h3>
              <p className="text-gray-400">RTSP / WebRTC / Video upload feeds sampled at 5-10 FPS for optimal compute efficiency.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-industrial-800 font-mono text-[10px] text-gray-500">
              Tech: OpenCV / FFmpeg
            </div>
          </div>

          {/* Tier 2 */}
          <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-700 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold mb-3">2</div>
              <h3 className="font-bold text-white text-sm mb-1">AI Vision Inferencing</h3>
              <p className="text-gray-400">YOLOv8 person & gear detection, flame HSV/YCrCb thresholds, smoke optical density filtering.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-industrial-800 font-mono text-[10px] text-gray-500">
              Tech: Python FastAPI / PyTorch
            </div>
          </div>

          {/* Tier 3 */}
          <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-700 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold mb-3">3</div>
              <h3 className="font-bold text-white text-sm mb-1">Zone Rules & Risk Engine</h3>
              <p className="text-gray-400">Point-in-polygon mapping evaluates zone-specific PPE mandates and scores event severity (CRITICAL to LOW).</p>
            </div>
            <div className="mt-4 pt-3 border-t border-industrial-800 font-mono text-[10px] text-gray-500">
              Tech: Dedup Engine / Risk Scorer
            </div>
          </div>

          {/* Tier 4 */}
          <div className="p-4 rounded-xl bg-industrial-900 border border-industrial-700 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-3">4</div>
              <h3 className="font-bold text-white text-sm mb-1">Command Triage & Push</h3>
              <p className="text-gray-400">WebSocket broadcast to Command Center, EHS notification dispatch, and immutable incident audit logging.</p>
            </div>
            <div className="mt-4 pt-3 border-t border-industrial-800 font-mono text-[10px] text-gray-500">
              Tech: Node.js / WebSockets / SQLite
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-industrial-800 border border-industrial-700">
          <div className="flex items-center gap-3 mb-4 text-industrial-accent">
            <Layers className="w-6 h-6" />
            <h3 className="font-bold text-white text-base">Frontend Layer</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-gray-300">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> React 18 & Vite SPA</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Tailwind CSS Industrial Dark Palette</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Recharts EHS Compliance Engine</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-Time WebSocket Client</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-industrial-800 border border-industrial-700">
          <div className="flex items-center gap-3 mb-4 text-industrial-info">
            <Server className="w-6 h-6" />
            <h3 className="font-bold text-white text-base">Backend Microservice</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-gray-300">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Node.js & Express REST APIs</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> SQLite Relational DB (ACID compliant)</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> JWT Auth with 4-Tier RBAC</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automated Incident Escalation Engine</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-industrial-800 border border-industrial-700">
          <div className="flex items-center gap-3 mb-4 text-industrial-danger">
            <Cpu className="w-6 h-6" />
            <h3 className="font-bold text-white text-base">AI Vision Engine</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-gray-300">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Python FastAPI High-Throughput Service</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ultralytics YOLOv8 Architecture</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multi-Spectral Fire & Smoke Detectors</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Temporal False-Positive Deduplication</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
