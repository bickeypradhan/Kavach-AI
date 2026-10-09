# Kavach AI — Industrial Safety & Smart Gate OS 🛡️

**Kavach AI** is an enterprise-grade Industrial Safety Operating System and Automated Gate Access Control solution designed for manufacturing plants, refineries, and hazardous industrial sites.

It provides real-time personal protective equipment (PPE) compliance detection, multi-modal employee identification (OCR ID card & High-Speed QR Code), live video streaming (laptop webcam or Android phone via DroidCam), and automated compliance incident lifecycle tracking.

---

## 🚀 Key Highlights & Features

- **🚪 Smart Safety Gate**: Automated entry turnstile simulation that verifies employee identity and enforces mandatory PPE before granting access.
- **🪪 Two-Way Employee Identification**:
  - **OCR Scanning**: Optical character recognition automatically detects 8–12 digit card numbers from physical ID cards.
  - **High-Speed QR Scanning**: Hardware-accelerated (via native Chromium `BarcodeDetector` + bundled `jsQR`) reading employee card numbers instantly.
  - **Manual Fallback**: Quick numeric lookup for supervisor overrides.
- **📱 Phone Camera Support (DroidCam)**:
  - Dynamically enumerates video devices and auto-detects connected Android phone cameras / DroidCam.
  - Live in-app camera selector with one-click refresh and memory persistence.
- **🦺 Real-Time PPE Computer Vision**:
  - YOLO-powered detection of mandatory gear: Helmets, Safety Vests, Gloves, Goggles, Boots, Masks, and Ear Protection.
  - Employee-specific PPE policy enforcement based on assigned roles and departments.
- **📊 Real-Time Operations Dashboard**:
  - Live statistics: Total scans today, allowed entrances, PPE violations, and supervisor triage queues.
  - Automatic 30-minute escalation for unresolved safety incidents.
- **⚡ Automated One-Click Windows Scripts**:
  - `bat/check-requirements.bat`: Verifies Node.js, Python, and Git.
  - `bat/setup.bat`: Installs all dependencies across frontend, backend, and AI service.
  - `bat/start.bat`: Starts all microservices in coordinated background windows.
  - `bat/stop.bat`: Safely halts all processes.

---

## 🏗️ System Architecture

```
Kavach-AI/
├── frontend/        # React 18, Vite, Tailwind CSS, Lucide Icons, jsQR
├── backend/         # Node.js, Express, MySQL / MariaDB (port 3307/5000), JWT
├── ai-service/      # Python FastAPI, OpenCV, Ultralytics YOLOv8 (port 8000)
├── bat/             # Windows batch automation scripts (check, setup, start, stop)
└── data/            # Local data storage and schema migrations
```

---

## 🛠️ Quick Start

### 1. Requirements
- **Node.js**: v18+ or v20+
- **Python**: v3.10+
- **Database**: XAMPP (MariaDB / MySQL) or standalone MySQL on port `3307`

### 2. Automatic One-Click Launch (Recommended)
Navigate to the `bat/` folder:
```cmd
cd bat
check-requirements.bat
setup.bat
start.bat
```

### 3. Manual Start

#### Backend
```bash
cd backend
npm install
npm start
```

#### AI Service
```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Default Access Endpoints
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **AI Inference Engine**: [http://localhost:8000](http://localhost:8000)

### Demo Accounts
- **Admin**: `admin@kavach.com` / `admin123`
- **Safety Officer**: `safety@kavach.com` / `safety123`
- **Supervisor**: `supervisor@kavach.com` / `super123`
- **Security Guard**: `guard@kavach.com` / `guard123`

---

## 🔒 Security & Privacy
- Sensitive credentials (`.env`, secrets, and database binaries) are excluded via `.gitignore`.
- Template configurations are provided in `.env.example` and `backend/.env.example`.

---

## 📄 License
ISC / Proprietary — Kavach AI
