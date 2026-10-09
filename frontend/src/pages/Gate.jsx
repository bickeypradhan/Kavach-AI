import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { Camera, RefreshCw, AlertCircle } from 'lucide-react'
import jsQR from 'jsqr'

const API = import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000'
const AI  = 'http://localhost:8000'

const PPE_ICONS = {
  helmet:'⛑️', vest:'🦺', boots:'👟', gloves:'🧤',
  goggles:'🥽', mask:'😷', ear_protection:'🎧', footwear:'👟'
}

// ── OCR Scanner (Tesseract) via canvas + rAF ─────────────────────────────────
function useOCRScanner(videoRef, onDetect) {
  const rafRef    = useRef(null)
  const canvas    = useRef(document.createElement('canvas'))
  const lastOcr   = useRef(0)
  const activeRef = useRef(false)
  const onDetectRef = useRef(onDetect)
  onDetectRef.current = onDetect

  // Load Tesseract.js from CDN once
  useEffect(() => {
    if (!window.Tesseract) {
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js'
      document.head.appendChild(s)
    }
  }, [])

  const scan = useCallback(async () => {
    if (!activeRef.current) return
    const video = videoRef.current
    if (!video || video.readyState < 2) { rafRef.current = requestAnimationFrame(scan); return }
    const w = video.videoWidth, h = video.videoHeight
    if (!w || !h) { rafRef.current = requestAnimationFrame(scan); return }
    const ctx = canvas.current.getContext('2d')
    canvas.current.width = w; canvas.current.height = h
    ctx.drawImage(video, 0, 0, w, h)
    // OCR every 2 seconds (heavy operation)
    if (window.Tesseract && Date.now() - lastOcr.current > 2000) {
      lastOcr.current = Date.now()
      try {
        const { data: { text } } = await window.Tesseract.recognize(canvas.current, 'eng')
        const match = text.match(/\b\d{8,12}\b/)
        if (match && match[0] && activeRef.current) { onDetectRef.current(match[0], 'OCR'); return }
      } catch (_) {}
    }
    if (activeRef.current) rafRef.current = requestAnimationFrame(scan)
  }, [videoRef])

  const start = useCallback(() => { activeRef.current = true; rafRef.current = requestAnimationFrame(scan) }, [scan])
  const stop  = useCallback(() => { activeRef.current = false; if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])
  return { start, stop }
}

// ── QR Scanner (Dual Engine: Native BarcodeDetector + Bundled jsQR) ──────────
function useQRScanner(videoRef, onDetect) {
  const rafRef      = useRef(null)
  const canvasRef   = useRef(document.createElement('canvas'))
  const activeRef   = useRef(false)
  const onDetectRef = useRef(onDetect)
  onDetectRef.current = onDetect
  const lastScan    = useRef(0)
  const isScanning  = useRef(false)
  const detectorRef = useRef(null)

  // Initialize native BarcodeDetector if supported by the browser (Chrome / Edge)
  useEffect(() => {
    if ('BarcodeDetector' in window) {
      try {
        detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] })
        console.log('[SafeGate QR] Native hardware-accelerated BarcodeDetector active')
      } catch (err) {
        console.warn('[SafeGate QR] Native BarcodeDetector initialization warning:', err)
      }
    }
  }, [])

  const scan = useCallback(async () => {
    if (!activeRef.current) return
    const video = videoRef.current
    if (!video || video.readyState < 2) {
      if (activeRef.current) rafRef.current = requestAnimationFrame(scan)
      return
    }

    const vw = video.videoWidth
    const vh = video.videoHeight
    if (!vw || !vh) {
      if (activeRef.current) rafRef.current = requestAnimationFrame(scan)
      return
    }

    // High frequency scan (every ~50ms) without frame piling
    const now = Date.now()
    if (now - lastScan.current >= 50 && !isScanning.current) {
      lastScan.current = now
      isScanning.current = true

      try {
        // Strategy 1: Instant native hardware-accelerated BarcodeDetector
        if (detectorRef.current) {
          try {
            const detected = await detectorRef.current.detect(video)
            if (detected && detected.length > 0 && activeRef.current) {
              const raw = (detected[0].rawValue || '').trim()
              if (raw) {
                console.log('[SafeGate QR] Native detector decoded code:', raw)
                onDetectRef.current(raw, 'QR')
                isScanning.current = false
                return
              }
            }
          } catch (_) {}
        }

        // Strategy 2: Bundled jsQR with both normal and inverted polarity support
        // Normalize resolution to maximum 720px for optimal CPU performance and high accuracy
        const scale = Math.min(1, 720 / Math.max(vw, vh))
        const cw = Math.max(320, Math.round(vw * scale))
        const ch = Math.max(240, Math.round(vh * scale))

        const canvas = canvasRef.current
        canvas.width = cw
        canvas.height = ch
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(video, 0, 0, cw, ch)

        const imageData = ctx.getImageData(0, 0, cw, ch)
        const code = jsQR(imageData.data, cw, ch, {
          inversionAttempts: 'attemptBoth'
        })

        if (code && code.data && activeRef.current) {
          const val = code.data.trim()
          if (val) {
            console.log('[SafeGate QR] jsQR decoded successfully:', val)
            onDetectRef.current(val, 'QR')
            isScanning.current = false
            return
          }
        }
      } catch (err) {
        console.warn('[SafeGate QR] Scan loop warning:', err)
      } finally {
        isScanning.current = false
      }
    }

    if (activeRef.current) {
      rafRef.current = requestAnimationFrame(scan)
    }
  }, [videoRef])

  const start = useCallback(() => {
    activeRef.current = true
    isScanning.current = false
    rafRef.current = requestAnimationFrame(scan)
  }, [scan])

  const stop = useCallback(() => {
    activeRef.current = false
    isScanning.current = false
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  return { start, stop }
}

// ── Countdown timer (server-deadline based) ───────────────────────────────────
function CountdownTimer({ deadline }) {
  const [sec, setSec] = useState(0)
  useEffect(() => {
    if (!deadline) return
    const tick = () => setSec(Math.max(0, Math.floor((new Date(deadline) - Date.now()) / 1000)))
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t)
  }, [deadline])
  const m = String(Math.floor(sec / 60)).padStart(2,'0')
  const s = String(sec % 60).padStart(2,'0')
  const urgent = sec < 300
  return (
    <div className={`text-center ${urgent ? 'text-red-400' : 'text-yellow-300'}`}>
      <div className={`text-6xl font-mono font-bold tracking-widest ${urgent ? 'animate-pulse' : ''}`}>{m}:{s}</div>
      <div className="text-xs mt-1 opacity-60 tracking-widest">COMPLIANCE WINDOW</div>
    </div>
  )
}

// ── Main Gate Component ────────────────────────────────────────────────────────
export default function Gate() {
  const videoRef  = useRef(null)
  const streamRef = useRef(null)
  const loopRef   = useRef(null)

  const [camReady,         setCamReady]         = useState(false)
  const [videoDevices,     setVideoDevices]     = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState(() => localStorage.getItem('safegate_camera_id') || '')
  const [cameraError,      setCameraError]      = useState('')
  const [isSwitchingCam,   setIsSwitchingCam]   = useState(false)

  const [manualId,     setManualId]     = useState('')
  // 'OCR' | 'QR' | 'MANUAL'
  const [idMode,       setIdMode]       = useState('OCR')
  const [qrActive,     setQrActive]     = useState(false)

  // State machine: IDLE → ID_SCAN → PPE_SCAN → RESULT
  const [phase,        setPhase]        = useState('IDLE')
  const [employee,     setEmployee]     = useState(null)
  const [idMethod,     setIdMethod]     = useState('')  // 'OCR' | 'QR' | 'MANUAL'
  const [scanResult,   setScanResult]   = useState(null)
  const [aiState,      setAiState]      = useState(null)
  const [bboxScale,    setBboxScale]    = useState({ x: 1, y: 1 })
  const [stableCount,  setStableCount]  = useState(0)
  const [error,        setError]        = useState('')
  const [isVerifying,  setIsVerifying]  = useState(false)

  // ── Helper to format device labels nicely ────────────────────────────────────
  const formatCameraLabel = (device, index) => {
    const raw = device.label || `Camera ${index + 1}`
    if (/droidcam/i.test(raw)) {
      return `📱 ${raw} (DroidCam / Phone)`
    }
    if (/i2302/i.test(raw)) {
      return `📱 ${raw} (Android USB Phone)`
    }
    if (/integrated|built-in|facetime|internal|webcam/i.test(raw)) {
      return `💻 ${raw} (Laptop Webcam)`
    }
    return `📷 ${raw}`
  }

  // ── Stop current video tracks safely ─────────────────────────────────────────
  const stopCurrentStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try { track.stop() } catch (_) {}
      })
      streamRef.current = null
    }
  }, [])

  // ── Update scale for bounding boxes ──────────────────────────────────────────
  const updateScale = useCallback(() => {
    if (videoRef.current && videoRef.current.videoWidth) {
      setBboxScale({
        x: videoRef.current.clientWidth  / videoRef.current.videoWidth,
        y: videoRef.current.clientHeight / videoRef.current.videoHeight
      })
    }
  }, [])

  // ── Enumerate video input devices ───────────────────────────────────────────
  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return []
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoInputs = devices.filter(d => d.kind === 'videoinput')
      console.log('[SafeGate Camera] Available video devices:', videoInputs.map((d, i) => ({
        index: i,
        label: d.label || `Camera ${i + 1}`,
        deviceId: d.deviceId
      })))
      setVideoDevices(videoInputs)
      return videoInputs
    } catch (err) {
      console.error('[SafeGate Camera] enumerateDevices failed:', err)
      return []
    }
  }, [])

  // ── Start video stream with selected deviceId ────────────────────────────────
  const startCameraStream = useCallback(async (requestedDeviceId) => {
    stopCurrentStream()
    setCameraError('')
    setIsSwitchingCam(true)

    console.log('[SafeGate Camera] Requesting camera stream for deviceId:', requestedDeviceId || '(auto/default)')

    let stream = null
    try {
      const constraints = {
        video: requestedDeviceId 
          ? { deviceId: { exact: requestedDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } }
      }
      stream = await navigator.mediaDevices.getUserMedia(constraints)
    } catch (err) {
      console.warn('[SafeGate Camera] Exact deviceId failed, attempting loose constraint:', err)
      if (requestedDeviceId) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: requestedDeviceId, width: { ideal: 1280 }, height: { ideal: 720 } }
          })
        } catch (err2) {
          console.warn('[SafeGate Camera] Loose constraint failed, falling back to default camera:', err2)
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true })
          } catch (err3) {
            console.error('[SafeGate Camera] Camera open failed completely:', err3)
            setCamReady(false)
            setCameraError(`Unable to open camera: ${err3.name || 'Error'} — ${err3.message || 'Permission or device unavailable'}`)
            setIsSwitchingCam(false)
            return null
          }
        }
      } else {
        setCamReady(false)
        setCameraError(`Unable to open camera: ${err.name || 'Error'} — ${err.message || 'Permission or device unavailable'}`)
        setIsSwitchingCam(false)
        return null
      }
    }

    if (stream) {
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
        } catch (playErr) {
          console.warn('[SafeGate Camera] video.play() warning:', playErr)
        }
      }
      setCamReady(true)
      setIsSwitchingCam(false)

      const activeTrack = stream.getVideoTracks()[0]
      const settings = activeTrack?.getSettings?.()
      const activeId = settings?.deviceId || requestedDeviceId
      console.log(`[SafeGate Camera] Camera active! Track label: "${activeTrack?.label}", deviceId: ${activeId}`)
      updateScale()
      return { stream, activeId }
    }

    setIsSwitchingCam(false)
    return null
  }, [stopCurrentStream, updateScale])

  // ── Camera initialization & auto DroidCam detection ──────────────────────────
  useEffect(() => {
    let mounted = true

    const initCamera = async () => {
      // 1. Enumerate devices
      let devices = await refreshDevices()

      // 2. Identify preferred camera
      const savedId = localStorage.getItem('safegate_camera_id')
      let targetId = ''

      if (savedId && devices.some(d => d.deviceId === savedId)) {
        targetId = savedId
      } else {
        // Auto-detect DroidCam or Android USB
        const droidCam = devices.find(d => /droidcam|i2302/i.test(d.label))
        if (droidCam) {
          targetId = droidCam.deviceId
          console.log('[SafeGate Camera] Auto-selected DroidCam device:', droidCam.label)
        } else if (devices.length > 0 && devices[0].deviceId) {
          targetId = devices[0].deviceId
        }
      }

      // 3. Request stream
      const result = await startCameraStream(targetId)
      if (!mounted) return

      // 4. Once camera permissions are granted, labels become visible. Re-enumerate devices:
      const populatedDevices = await refreshDevices()
      if (!mounted) return

      // 5. If user had no explicit manual choice and DroidCam was just discovered, switch to it:
      if (!savedId) {
        const foundDroid = populatedDevices.find(d => /droidcam|i2302/i.test(d.label))
        if (foundDroid && foundDroid.deviceId !== result?.activeId) {
          console.log('[SafeGate Camera] Auto-switching to detected DroidCam:', foundDroid.label)
          setSelectedDeviceId(foundDroid.deviceId)
          localStorage.setItem('safegate_camera_id', foundDroid.deviceId)
          await startCameraStream(foundDroid.deviceId)
          return
        }
      }

      if (result?.activeId) {
        setSelectedDeviceId(result.activeId)
      }
    }

    initCamera()

    // ── Listen for devices plugged in / unplugged (DroidCam USB connect) ───────
    const handleDeviceChange = async () => {
      console.log('[SafeGate Camera] Device change detected, refreshing device list...')
      const updated = await refreshDevices()
      const droid = updated.find(d => /droidcam|i2302/i.test(d.label))
      const currentTrackLabel = streamRef.current?.getVideoTracks()[0]?.label || ''
      // If DroidCam was plugged in and not currently active, auto-select it if no manual override
      if (droid && !/droidcam/i.test(currentTrackLabel) && !localStorage.getItem('safegate_camera_id')) {
        console.log('[SafeGate Camera] DroidCam connected, auto-switching:', droid.label)
        setSelectedDeviceId(droid.deviceId)
        startCameraStream(droid.deviceId)
      }
    }

    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange)

    return () => {
      mounted = false
      navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange)
      stopCurrentStream()
    }
  }, [refreshDevices, startCameraStream, stopCurrentStream])

  // ── Handle manual camera change from dropdown ────────────────────────────────
  const handleCameraChange = async (e) => {
    const newId = e.target.value
    if (!newId || newId === selectedDeviceId) return
    console.log('[SafeGate Camera] User manually selected camera:', newId)
    setSelectedDeviceId(newId)
    localStorage.setItem('safegate_camera_id', newId)
    await startCameraStream(newId)
  }

  // ── Bbox scale resize listener ──────────────────────────────────────────────
  useEffect(() => {
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [camReady, updateScale])

  // ── OCR Scanner hook ────────────────────────────────────────────────────────
  const { start: startOCR, stop: stopOCR } = useOCRScanner(videoRef, (code, method) => {
    stopOCR()
    handleEmployeeLookup(code, method || 'OCR')
  })

  // ── Auto-start OCR when in OCR mode + IDLE ──────────────────────────────────
  useEffect(() => {
    if (phase === 'IDLE' && idMode === 'OCR' && camReady) {
      startOCR()
    } else {
      stopOCR()
    }
  }, [phase, idMode, camReady])

  // ── QR Scanner hook ─────────────────────────────────────────────────────────
  const { start: startQR, stop: stopQR } = useQRScanner(videoRef, (code, method) => {
    stopQR()
    handleEmployeeLookup(code, method || 'QR')
  })

  // ── Auto-start QR when in QR mode + IDLE ───────────────────────────────────
  useEffect(() => {
    if (phase === 'IDLE' && idMode === 'QR' && camReady) {
      setQrActive(true)
      startQR()
    } else {
      setQrActive(false)
      stopQR()
    }
  }, [phase, idMode, camReady])

  // ── Mode switch handler ─────────────────────────────────────────────────────
  const switchMode = (mode) => {
    stopOCR()
    stopQR()
    setQrActive(false)
    setIdMode(mode)
    setError('')
  }

  // ── Employee lookup (shared across all 3 modes) ─────────────────────────────
  const handleEmployeeLookup = async (code, method = 'MANUAL') => {
    let trimmed = (code || '').trim()
    if (!trimmed) return

    // If QR contains a JSON object e.g. {"card_number":"2401292298"}, extract the card_number
    try {
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const parsed = JSON.parse(trimmed)
        if (parsed.card_number || parsed.id || parsed.code) {
          trimmed = String(parsed.card_number || parsed.id || parsed.code).trim()
        }
      }
    } catch (_) {}

    // If QR contains a URL with code as path
    if (trimmed.includes('/') && !trimmed.includes(' ')) {
      const parts = trimmed.split('/')
      const last = parts[parts.length - 1]
      if (last && last.length >= 4) trimmed = last
    }

    setError(''); setPhase('ID_SCAN'); setIdMethod(method)
    try {
      const { data: emp } = await axios.get(`${API}/api/employees/${encodeURIComponent(trimmed)}`)
      setEmployee(emp)
      setPhase('PPE_SCAN')
    } catch {
      setError(`Employee "${trimmed}" not found in database.`)
      setPhase('IDLE')
    }
  }

  // ── Frame capture (for PPE AI) ──────────────────────────────────────────────
  const captureFrame = () => new Promise((resolve) => {
    if (!videoRef.current) return resolve(null)
    const c = document.createElement('canvas')
    c.width  = videoRef.current.videoWidth  || 640
    c.height = videoRef.current.videoHeight || 480
    c.getContext('2d').drawImage(videoRef.current, 0, 0, c.width, c.height)
    c.toBlob(b => resolve(b), 'image/jpeg', 0.7)
  })

  // ── Finalize scan → write to DB ────────────────────────────────────────────
  const finalizeScan = async (finalAiState) => {
    if (isVerifying) return
    setIsVerifying(true)
    try {
      const { data: result } = await axios.post(`${API}/api/gate/scan`, {
        employee_id:     employee.card_number,
        gate_id:         'gate-1',
        detected_ppe:    finalAiState.detected_ppe || [],
        ai_inference_ms: finalAiState.inference_ms,
        identification_method: idMethod,
      })
      setScanResult({ ...result, ai_confidence: finalAiState.confidence, raw_detections: finalAiState.raw_detections })
      setPhase('RESULT')
      setAiState(null)
    } catch(e) {
      setError(`Database write error: ${e.response?.data?.error || e.message}`)
      setPhase('PPE_SCAN')
    } finally {
      setIsVerifying(false)
    }
  }

  // ── Real-time PPE AI loop ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'RESULT') { clearTimeout(loopRef.current); return }
    let mounted = true
    let consecutiveMatches = 0
    let lastDecision = null

    const runLoop = async () => {
      if (!mounted) return
      try {
        const blob = await captureFrame()
        if (blob) {
          const form = new FormData()
          form.append('file', blob, 'frame.jpg')
          form.append('required_ppe', JSON.stringify(employee?.required_ppe || []))
          form.append('employee_id', employee?.card_number || '')
          const { data: ai } = await axios.post(`${AI}/gate/scan`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 5000,
          })
          if (mounted) {
            setAiState(ai)
            if (phase === 'PPE_SCAN' && ai.person_detected && ai.confidence > 0.4) {
              if (ai.decision === lastDecision) { consecutiveMatches++ }
              else { consecutiveMatches = 1; lastDecision = ai.decision }
              setStableCount(consecutiveMatches)
              if (consecutiveMatches >= 4) {
                mounted = false
                clearTimeout(loopRef.current)
                await finalizeScan(ai)
                return
              }
            } else { consecutiveMatches = 0; setStableCount(0) }
          }
        }
      } catch (err) { console.warn('AI Loop dropped frame:', err.message) }
      if (mounted) loopRef.current = setTimeout(runLoop, 400)
    }

    runLoop()
    return () => { mounted = false; clearTimeout(loopRef.current) }
  }, [phase, employee])

  // ── Reset all state ─────────────────────────────────────────────────────────
  const reset = () => {
    stopOCR(); stopQR()
    setPhase('IDLE'); setEmployee(null); setScanResult(null)
    setManualId(''); setError(''); setAiState(null)
    setStableCount(0); setIsVerifying(false); setIdMethod('')
  }

  // ── Derived overlay styling ─────────────────────────────────────────────────
  let boxColor = 'border-yellow-500'
  let statusText = '🟡 VERIFYING PPE...'
  if (aiState?.person_detected) {
    if (aiState.decision === 'ALLOW') { boxColor = 'border-green-500 bg-green-500/10'; statusText = '🟢 PPE COMPLIANT' }
    else if (aiState.decision === 'HOLD') { boxColor = 'border-red-500 bg-red-500/10'; statusText = '🔴 PPE VIOLATION' }
  }

  const methodBadge = { OCR: '📷 OCR', QR: '🔳 QR', MANUAL: '⌨️ MANUAL' }

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-mono flex flex-col">
      {/* Top bar */}
      <div className="bg-gray-900 border-b border-cyan-800 px-6 py-3 flex items-center justify-between flex-shrink-0 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse inline-block"/>
          <span className="text-cyan-400 font-bold tracking-widest text-sm">🏭 SMART SAFETY GATE — BHUBANESWAR PLANT</span>
        </div>
        <div className="flex items-center gap-4 text-xs flex-wrap">
          {/* Camera Selection Dropdown */}
          <div className="flex items-center gap-1.5 bg-gray-950 border border-cyan-700/60 rounded-lg px-2.5 py-1.5 shadow-inner">
            <Camera className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <select
              value={selectedDeviceId}
              onChange={handleCameraChange}
              disabled={isSwitchingCam}
              className="bg-transparent text-gray-200 text-xs font-semibold focus:outline-none cursor-pointer max-w-[260px] truncate"
              title="Choose active camera device"
            >
              {videoDevices.length === 0 ? (
                <option value="" className="bg-gray-900 text-gray-400">Default Camera</option>
              ) : (
                videoDevices.map((dev, idx) => (
                  <option key={dev.deviceId || idx} value={dev.deviceId} className="bg-gray-900 text-gray-200">
                    {formatCameraLabel(dev, idx)}
                  </option>
                ))
              )}
            </select>
            <button
              onClick={() => refreshDevices()}
              title="Refresh camera devices"
              className="p-1 hover:text-cyan-400 text-gray-400 transition ml-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSwitchingCam ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>

          <span className={camReady ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
            {camReady ? '● CAM ONLINE' : '○ CAM OFFLINE'}
          </span>
          <span className="text-gray-500">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Camera Error Banner */}
      {cameraError && (
        <div className="bg-red-950 border-b border-red-700 text-red-200 px-6 py-2.5 text-xs flex items-center justify-between z-30">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{cameraError}</span>
          </div>
          <button
            onClick={() => startCameraStream(selectedDeviceId)}
            className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded font-bold text-[10px] tracking-wider uppercase transition"
          >
            Retry Camera
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative bg-black">

        {/* ── CAMERA BACKGROUND ────────────────────────────────────────────── */}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="relative" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <video ref={videoRef} onLoadedMetadata={updateScale} className="max-w-full max-h-full object-contain" muted playsInline/>

            {/* ── Person bounding box overlay ────────────────────────────── */}
            {(phase === 'PPE_SCAN' || phase === 'IDLE') && aiState?.person_detected && aiState.bbox && !aiState.is_simulated && (
              <div className="absolute z-10 pointer-events-none" style={{
                left: `calc(50% - ${(videoRef.current?.clientWidth  || 0)/2}px + ${aiState.bbox[0] * bboxScale.x}px)`,
                top:  `calc(50% - ${(videoRef.current?.clientHeight || 0)/2}px + ${aiState.bbox[1] * bboxScale.y}px)`,
                width:  `${(aiState.bbox[2] - aiState.bbox[0]) * bboxScale.x}px`,
                height: `${(aiState.bbox[3] - aiState.bbox[1]) * bboxScale.y}px`,
              }}>
                <div className={`w-full h-full border-2 ${boxColor} shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-200 relative`}>
                  <div className={`absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 ${boxColor}`}/>
                  <div className={`absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 ${boxColor}`}/>
                  <div className={`absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 ${boxColor}`}/>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 ${boxColor}`}/>
                  <div className="absolute -top-7 left-0 bg-gray-900/90 text-white text-xs font-bold px-2 py-1 whitespace-nowrap shadow">
                    {statusText} {aiState.confidence > 0 ? `(${(aiState.confidence*100).toFixed(0)}%)` : ''}
                  </div>
                  {employee && (
                    <div className="absolute -bottom-10 left-0 bg-gray-900/90 text-white text-[10px] px-2 py-1 whitespace-nowrap shadow">
                      <span className="text-cyan-400 font-bold">{employee.name}</span> | {employee.card_number}<br/>
                      <span className="text-gray-400">{employee.department_name} • {employee.category || 'Worker'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QR scanning zone overlay */}
            {phase === 'IDLE' && idMode === 'QR' && qrActive && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                <div className="w-64 h-64 border-2 border-yellow-400 rounded-lg opacity-80 animate-pulse"/>
                <div className="text-yellow-400 text-xs font-bold text-center mt-2 drop-shadow-md">ALIGN QR CODE HERE</div>
              </div>
            )}

            {/* OCR scanning zone overlay */}
            {phase === 'IDLE' && idMode === 'OCR' && camReady && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                <div className="w-72 h-44 border-2 border-cyan-400 border-dashed rounded-xl opacity-70 animate-pulse"/>
                <div className="text-cyan-400 text-xs font-bold text-center mt-2 drop-shadow-md">SHOW ID CARD HERE</div>
              </div>
            )}
          </div>
        </div>

        {/* ── OVERLAY: UI PANELS ─────────────────────────────────────────────── */}
        <div className="absolute inset-0 z-20 flex p-6 pointer-events-none">

          {/* LEFT PANEL — Identification */}
          <div className="w-80 flex flex-col pointer-events-auto">
            {(phase === 'IDLE' || phase === 'ID_SCAN') && (
              <div className="bg-gray-900/92 border border-cyan-800 rounded-xl p-5 shadow-2xl backdrop-blur-sm mt-auto mb-auto">
                
                {/* Title */}
                <div className="text-center mb-4">
                  <div className="text-3xl mb-1">🪪</div>
                  <div className="text-sm text-cyan-400 font-bold tracking-widest">IDENTIFY EMPLOYEE</div>
                </div>

                {/* Mode selector — 3 buttons */}
                <div className="grid grid-cols-3 gap-1.5 mb-4">
                  {[
                    { mode: 'OCR',    icon: '📷', label: 'ID CARD' },
                    { mode: 'QR',     icon: '🔳', label: 'QR CODE' },
                    { mode: 'MANUAL', icon: '⌨️', label: 'MANUAL'  },
                  ].map(({ mode, icon, label }) => (
                    <button key={mode} onClick={() => switchMode(mode)}
                      className={`py-2 rounded text-xs font-bold border transition ${
                        idMode === mode
                          ? 'bg-cyan-700 border-cyan-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}>
                      <div className="text-lg">{icon}</div>
                      <div>{label}</div>
                    </button>
                  ))}
                </div>

                {/* OCR Mode */}
                {idMode === 'OCR' && (
                  <div className={`w-full py-2.5 rounded text-sm border text-center font-bold tracking-widest ${
                    camReady ? 'bg-cyan-900/30 border-cyan-700 text-cyan-400 animate-pulse' : 'bg-gray-800 border-gray-700 text-gray-500'
                  }`}>
                    {camReady ? '🔍 SCANNING AUTOMATICALLY…' : '⏳ CAMERA INITIALIZING…'}
                  </div>
                )}

                {/* QR Mode */}
                {idMode === 'QR' && (
                  <div className={`w-full py-2.5 rounded text-sm border text-center font-bold tracking-widest ${
                    camReady ? 'bg-yellow-900/30 border-yellow-700 text-yellow-400 animate-pulse' : 'bg-gray-800 border-gray-700 text-gray-500'
                  }`}>
                    {camReady ? '🔳 SCANNING QR CODE…' : '⏳ CAMERA INITIALIZING…'}
                  </div>
                )}

                {/* Manual Mode */}
                {idMode === 'MANUAL' && (
                  <form onSubmit={e => { e.preventDefault(); handleEmployeeLookup(manualId, 'MANUAL') }} className="flex gap-2">
                    <input value={manualId} onChange={e => setManualId(e.target.value)}
                      placeholder="e.g. 2401292298"
                      className="flex-1 bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-center tracking-widest text-cyan-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500"/>
                    <button type="submit" className="bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded text-sm font-bold transition">GO</button>
                  </form>
                )}

                {/* Error */}
                {error && <div className="text-red-400 text-xs text-center mt-3 bg-red-900/20 rounded p-2">{error}</div>}

                {/* Loading state */}
                {phase === 'ID_SCAN' && (
                  <div className="text-cyan-400 text-xs text-center mt-3 animate-pulse">🔎 Looking up employee…</div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT PANEL — PPE / Result */}
          <div className="w-80 ml-auto flex flex-col pointer-events-auto">

            {/* PPE Scan Panel */}
            {phase === 'PPE_SCAN' && employee && (
              <div className="bg-gray-900/95 border border-cyan-800 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden">
                <div className="bg-cyan-900/30 px-4 py-2 border-b border-cyan-800 flex justify-between items-center">
                  <div className="text-[10px] text-cyan-400 tracking-widest font-bold">AI SAFETY TRACKING</div>
                  {idMethod && <div className="text-[9px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">{methodBadge[idMethod]}</div>}
                </div>

                <div className="p-4 border-b border-gray-800">
                  <div className="text-sm font-bold text-white">{employee.name}</div>
                  <div className="text-xs text-gray-400">{employee.card_number} • {employee.department_name}</div>
                  <div className="text-xs text-gray-500">{employee.category || 'Worker'}</div>
                </div>

                <div className="p-4">
                  <div className="text-[10px] text-gray-500 tracking-widest mb-2">LIVE PPE ANALYSIS</div>
                  {employee.is_exempt ? (
                    <div className="text-blue-400 text-sm font-bold bg-blue-900/20 p-2 rounded text-center">🏅 EXEMPT ROLE</div>
                  ) : (
                    <div className="space-y-2">
                      {(employee.required_ppe || []).map(item => {
                        const isDetected = aiState?.detected_ppe?.includes(item)
                        return (
                          <div key={item} className={`flex items-center justify-between p-2 rounded border ${isDetected ? 'bg-green-900/20 border-green-800/50' : 'bg-gray-800 border-gray-700'}`}>
                            <div className="flex items-center gap-2 text-sm">
                              <span>{PPE_ICONS[item]||'🔧'}</span>
                              <span className={isDetected ? 'text-gray-200' : 'text-gray-400'}>{item.replace('_',' ')}</span>
                            </div>
                            <div className={`text-xs font-bold ${isDetected ? 'text-green-400' : 'text-gray-600'}`}>
                              {isDetected ? '✓' : 'PENDING'}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {!employee.is_exempt && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <div className="text-[10px] text-gray-500 tracking-widest text-center mb-2">
                        {isVerifying ? 'SAVING RECORD...' : 'STABILIZING AI DECISION'}
                      </div>
                      <div className="w-full h-1 bg-gray-800 rounded overflow-hidden">
                        <div className="h-full bg-cyan-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, (stableCount / 4) * 100)}%` }}/>
                      </div>
                    </div>
                  )}
                  {employee.is_exempt && (
                    <button onClick={() => finalizeScan({ detected_ppe: [], inference_ms: 0, confidence: 1.0, is_simulated: false })}
                      className="w-full mt-4 bg-cyan-700 hover:bg-cyan-600 text-white py-2 rounded text-sm font-bold transition">
                      PROCEED
                    </button>
                  )}
                </div>
                <button onClick={reset} className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-xs text-gray-400 transition">CANCEL</button>
              </div>
            )}

            {/* Result Panel */}
            {phase === 'RESULT' && scanResult && (
              <div className="bg-gray-900/95 border border-cyan-800 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden">
                <div className={`px-4 py-3 border-b border-gray-800 ${
                  scanResult.decision === 'ALLOW'  ? 'bg-green-900/30' :
                  scanResult.decision === 'EXEMPT' ? 'bg-blue-900/30'  : 'bg-red-900/30'}`}>
                  <div className={`text-xl font-bold tracking-widest text-center ${
                    scanResult.decision === 'ALLOW'  ? 'text-green-400' :
                    scanResult.decision === 'EXEMPT' ? 'text-blue-400'  : 'text-red-400'}`}>
                    {scanResult.decision === 'ALLOW'  ? '🟢 ENTRY ALLOWED' :
                     scanResult.decision === 'EXEMPT' ? '🏅 EXEMPT — ALLOWED' :
                     '🔴 PPE VIOLATION — HOLD'}
                  </div>
                  <div className="text-center text-xs text-gray-300 mt-1">{scanResult.message}</div>
                  {idMethod && (
                    <div className="text-center mt-1">
                      <span className="text-[9px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded">via {methodBadge[idMethod]}</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  {/* Employee summary */}
                  <div className="text-xs text-gray-400 mb-3 border-b border-gray-800 pb-2">
                    <div className="font-bold text-white">{employee?.name}</div>
                    <div>{employee?.card_number} • {employee?.department_name}</div>
                  </div>

                  {/* 30-min timer if HOLD */}
                  {scanResult.decision === 'HOLD' && scanResult.incident && (
                    <div className="mb-4 bg-gray-950 border border-red-900/50 rounded-lg p-4 shadow-inner">
                      <CountdownTimer deadline={scanResult.incident.deadline}/>
                      <div className="text-center text-[10px] text-gray-500 mt-2">
                        Incident: <span className="text-red-400">{scanResult.incident.id?.slice(0,8)}</span>
                      </div>
                    </div>
                  )}

                  {/* PPE checklist */}
                  {(scanResult.required_ppe?.length > 0) && (
                    <div className="space-y-1 mb-4">
                      {scanResult.required_ppe.map(item => {
                        const ok = (scanResult.detected_ppe||[]).map(d=>d.toLowerCase()).includes(item.toLowerCase())
                        return (
                          <div key={item} className="flex items-center justify-between text-xs py-1 px-2 border-b border-gray-800">
                            <span className="text-gray-400">{PPE_ICONS[item]||'🔧'} {item.replace('_',' ').toUpperCase()}</span>
                            <span className={ok ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{ok ? '✓' : '✗ MISSING'}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {scanResult.decision === 'HOLD' && (
                      <button onClick={() => { setPhase('PPE_SCAN'); setScanResult(null) }}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded text-xs font-bold tracking-widest transition">
                        RESCAN
                      </button>
                    )}
                    <button onClick={reset}
                      className="flex-1 bg-cyan-700 hover:bg-cyan-600 text-white py-3 rounded text-xs font-bold tracking-widest transition shadow-lg">
                      DONE / NEXT
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
