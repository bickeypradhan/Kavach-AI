import { Link } from 'react-router-dom'
import { 
  ShieldCheck, 
  Flame, 
  Eye, 
  Cpu, 
  Activity, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  HardHat,
  BellRing,
  BarChart,
  Video
} from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-industrial-900 text-gray-100 flex flex-col selection:bg-industrial-accent selection:text-industrial-900">
      {/* Top Navigation */}
      <nav className="border-b border-industrial-700/60 bg-industrial-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/logo.jpg" alt="Kavach Logo" className="w-full h-full rounded-xl object-cover" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">KAVACH <span className="text-industrial-accent">SAFETY OS</span></span>
              <span className="block text-[10px] text-gray-400 font-mono tracking-widest">ENTERPRISE AI SAFETY PLATFORM</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-industrial-accent transition-colors">Capabilities</a>
            <a href="#architecture" className="hover:text-industrial-accent transition-colors">Architecture</a>
            <a href="#workflow" className="hover:text-industrial-accent transition-colors">Incident Workflow</a>
            <a href="#roi" className="hover:text-industrial-accent transition-colors">Safety ROI</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-gray-300 hover:text-white px-4 py-2">
              Sign In
            </Link>
            <Link 
              to="/dashboard" 
              className="px-5 py-2.5 rounded-lg bg-industrial-accent text-industrial-900 font-bold text-sm hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-lg shadow-industrial-accent/20 hover:scale-105 active:scale-95"
            >
              Command Center
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto flex-1 flex flex-col justify-center items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-industrial-accent/30 bg-industrial-accent/10 text-industrial-accent text-xs font-semibold uppercase tracking-wider mb-8">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          Real-Time Computer Vision & Edge Intelligence
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-tight mb-6">
          Turn Existing Factory CCTV Into an <span className="text-transparent bg-clip-text bg-gradient-to-r from-industrial-accent via-yellow-400 to-amber-500">Autonomous Safety Command Center</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mb-10 leading-relaxed">
          Continuous AI monitoring for safety gear compliance (helmets, vests, gloves, footwear) and instantaneous early-stage smoke and fire detection across complex industrial zones.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link 
            to="/demo" 
            className="px-8 py-4 rounded-xl bg-industrial-accent text-industrial-900 font-extrabold text-base hover:bg-yellow-400 transition-all flex items-center gap-2.5 shadow-xl shadow-industrial-accent/25 hover:scale-105"
          >
            Launch Interactive Demo
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            to="/monitoring" 
            className="px-8 py-4 rounded-xl border border-industrial-600 bg-industrial-800/80 text-gray-200 font-semibold text-base hover:bg-industrial-700 transition-all flex items-center gap-2 hover:border-gray-500"
          >
            <Video className="w-5 h-5 text-industrial-accent" />
            Live CCTV Feeds Matrix
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="p-6 rounded-2xl bg-industrial-800/60 border border-industrial-700 hover:border-industrial-accent/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-industrial-accent/10 flex items-center justify-center mb-4 text-industrial-accent">
              <HardHat className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">PPE Compliance Guard</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Detects helmets, high-vis vests, safety goggles, gloves, and boots with person-level bounding box association and zone-specific rules.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-industrial-800/60 border border-industrial-700 hover:border-industrial-danger/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-industrial-danger/10 flex items-center justify-center mb-4 text-industrial-danger">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Fire & Smoke Early Alert</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Multi-spectral color thresholding and optical density tracking catch flame flickers and diffuse smoke plumes before conventional alarms trip.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-industrial-800/60 border border-industrial-700 hover:border-industrial-info/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-industrial-info/10 flex items-center justify-center mb-4 text-industrial-info">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Zone Risk Intelligence</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Point-in-polygon mapping links detections to exact factory floor zones (Welding, Chemical, Assembly) for contextualized risk triage.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-industrial-700/60 py-8 px-6 bg-industrial-900/90 text-center text-xs text-gray-500">
        © 2026 Kavach Safety Operating System. Industrial AI Safety Prototype. Hackathon Edition.
      </footer>
    </div>
  )
}
