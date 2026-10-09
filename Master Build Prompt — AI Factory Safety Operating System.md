# MASTER BUILD PROMPT
## Build From Scratch → Production-Ready Prototype → Deployment

You are my **senior full-stack engineer, AI/computer-vision engineer, product architect, DevOps engineer, UI/UX designer, and technical product strategist**.

Your job is to build a complete working prototype of an **AI-powered Industrial Safety Monitoring Platform** from scratch and take it all the way to a deployable application.

Do not treat this as a simple computer-vision demo.

Build it as the prototype of a **real commercial industrial safety software product** that could eventually be offered to factories, warehouses, manufacturing plants, construction environments, and other industrial facilities.

The immediate objective is a **hackathon/judge-impressive working prototype**, but the architecture must be sensible enough that the prototype can evolve into a real product.

---

# 1. PRODUCT VISION

Build an AI Factory Safety Operating System that converts existing CCTV/video feeds into actionable safety intelligence.

The core value proposition:

> **“Your existing cameras are already watching the factory. Our AI makes them understand safety risks, identify violations, locate incidents, alert the right people, and create an auditable safety record.”**

The system must continuously analyze video and detect:

### PPE / Safety Compliance
- Helmet / hard-hat compliance
- High-visibility vest compliance
- Gloves where applicable
- Safety footwear where applicable
- Optional mask/goggles architecture if supported by the model

### Environmental Hazards
- Smoke
- Fire

### Context
For every meaningful detection, determine as much useful context as possible:

- Camera
- Factory/site
- Zone
- Timestamp
- Event type
- Severity
- Confidence
- Affected area
- Snapshot
- Short evidence clip where technically feasible
- Detection status
- Response status

The official problem statement requires real-time PPE, smoke and fire detection from CCTV/video feeds and alerts containing location/context such as affected area and event type. Treat those as the non-negotiable MVP requirements.

---

# 2. IMPORTANT PRODUCT PRINCIPLE

Do NOT build only:

“Upload video → draw bounding boxes.”

That is insufficient.

Build:

**Detect → Understand → Prioritize → Alert → Respond → Record → Analyze**

The system should feel like a real industrial command center.

A judge should be able to understand in less than one minute:

1. A factory has multiple cameras.
2. AI is monitoring them.
3. AI detects an unsafe worker or fire/smoke.
4. The system identifies the location.
5. The event receives a severity level.
6. The correct personnel are alerted.
7. The incident appears in the command center.
8. A supervisor can acknowledge/resolve it.
9. The event becomes part of the safety history.
10. Management can see compliance and incident trends.

---

# 3. TARGET USERS

Design the product around these roles:

### Safety Officer / EHS Manager
Needs:
- live safety status
- PPE violations
- fire/smoke incidents
- incident investigation
- compliance trends
- reports

### Shift Supervisor
Needs:
- immediate alerts
- affected camera/zone
- evidence
- acknowledge/escalate/resolve workflow

### Plant Manager
Needs:
- high-level safety KPIs
- recurring problem areas
- incident trends
- compliance percentage
- operational risk overview

### System Administrator
Needs:
- sites
- cameras
- users
- zones
- PPE rules
- alert rules
- integrations
- system health

Architect RBAC so these roles can be expanded later.

---

# 4. PRODUCT DIFFERENTIATION

Do not compete merely on “we detect PPE.”

The prototype should demonstrate these differentiators:

### A. Existing CCTV compatibility
Design the architecture around:
- uploaded video
- webcam
- RTSP/IP camera feeds where available

The system should not require factories to replace their existing cameras.

### B. Zone-aware intelligence

Allow a factory floor to contain zones such as:

- Production Line A
- Welding Area
- Chemical Storage
- Loading Bay
- Warehouse
- Restricted Zone
- Emergency Exit
- Assembly Area

Different zones can have different PPE requirements.

Example:

Production Zone:
- helmet required
- vest required
- gloves required

Office/low-risk zone:
- no PPE rule

This rule engine is extremely important.

### C. Evidence-based alerts

Every alert should have:

- event image
- detection boxes
- timestamp
- camera
- zone
- confidence
- event type
- severity
- status

Never show a mysterious “AI detected violation” message without evidence.

### D. Incident workflow

Incident states:

`NEW → ACKNOWLEDGED → INVESTIGATING → RESOLVED`

Also support:

`ESCALATED`

Record:
- who acknowledged it
- when
- who resolved it
- resolution note
- escalation history

### E. Safety intelligence

Turn raw detections into meaningful KPIs.

Examples:

- PPE compliance rate
- PPE violations today
- violations by zone
- violations by shift
- smoke incidents
- fire incidents
- unresolved incidents
- average response time
- most problematic zones
- recurring safety violations
- camera health

---

# 5. BUSINESS-READY PRODUCT THINKING

Do NOT add fake pricing.

Do NOT build payment functionality in the MVP.

But architect the product so it can eventually become a commercial SaaS.

Use concepts such as:

- Organization
- Site
- User
- Role
- Camera
- Zone
- Detection Rule
- Alert Rule
- Incident
- Report
- Notification Channel
- Audit Log

The application should conceptually support:

`Organization → Sites → Cameras → Zones → AI Events → Incidents → Reports`

This makes the prototype feel like a real B2B product rather than a college project.

Eventually the product could support:
- per-site deployment
- per-camera usage
- enterprise plans
- on-premise deployment
- cloud deployment
- hybrid edge deployment
- integrations
- premium analytics

But **do not implement pricing/payment unless required for the prototype**.

---

# 6. RECOMMENDED TECH STACK

Use the following stack unless there is a strong technical reason to change something.

## Frontend

Use:

- React.js
- Vite
- JavaScript or TypeScript
- Tailwind CSS
- React Router
- Axios
- Recharts or another lightweight charting library
- Lucide React icons

Create a professional industrial SaaS interface.

Avoid:
- generic bootstrap-looking UI
- excessive gradients
- childish animations
- unnecessary glassmorphism
- fake futuristic effects everywhere

The design should feel like a serious industrial command center.

---

# 7. BACKEND

Use:

- Node.js
- Express.js
- REST APIs
- JWT authentication
- role-based authorization

Node/Express should handle:

- authentication
- users
- organizations
- sites
- cameras
- zones
- rules
- incidents
- alerts
- reports
- audit logs
- application configuration

---

# 8. AI / COMPUTER VISION BACKEND

Use Python for AI inference.

Recommended:

- Python
- FastAPI
- OpenCV
- Ultralytics YOLO or another appropriate YOLO-family model
- NumPy
- optional tracking such as ByteTrack where useful

Keep the AI service separate from the Node backend.

Architecture:

React
↓
Node/Express API
↓
Python/FastAPI AI service
↓
YOLO/OpenCV inference

This separation must make sense for future model upgrades.

FastAPI is appropriate for the inference service and can be containerized for deployment. Docker/Compose is also appropriate for separating frontend/backend/AI/database services.

---

# 9. DATABASE

Prefer:

**PostgreSQL / Supabase**

Use relational modeling because this application contains relationships between:

- organizations
- sites
- users
- cameras
- zones
- rules
- detections
- incidents
- notifications
- audit records

Do not unnecessarily use multiple databases.

Use Supabase where useful for:
- PostgreSQL
- authentication if appropriate
- storage
- realtime capabilities

Keep the data layer replaceable so the system could later move to self-hosted PostgreSQL.

---

# 10. CORE DATABASE MODEL

Design appropriate tables/models such as:

### organizations
- id
- name
- industry
- created_at

### users
- id
- organization_id
- name
- email
- role
- password/auth reference
- status
- created_at

### sites
- id
- organization_id
- name
- location
- status

### cameras
- id
- site_id
- name
- source_type
- stream_url
- status
- location
- last_seen

### zones
- id
- site_id
- name
- description
- polygon/configuration
- risk_level

### safety_rules
- id
- zone_id
- rule_type
- required_ppe
- enabled

### detections
- id
- camera_id
- zone_id
- event_type
- confidence
- timestamp
- bounding_boxes
- evidence_image
- evidence_video

### incidents
- id
- detection_id
- severity
- status
- assigned_to
- acknowledged_at
- resolved_at
- resolution_note

### notifications
- id
- incident_id
- channel
- recipient
- status
- sent_at

### audit_logs
- id
- organization_id
- user_id
- action
- entity
- entity_id
- timestamp

Adapt the schema where necessary.

---

# 11. AI DETECTION ARCHITECTURE

Create a modular detection pipeline.

Do not tightly couple all detection logic into one giant Python file.

Use something similar to:

`Video Source`
→ `Frame Reader`
→ `Frame Sampling`
→ `Detection Model`
→ `Tracking`
→ `Zone Mapping`
→ `PPE Rule Engine`
→ `Risk Engine`
→ `Event Deduplication`
→ `Incident Generator`
→ `Alert Service`

---

# 12. PPE LOGIC

Do not simply detect:

“helmet object exists.”

Determine whether a person satisfies the safety rule.

Example:

Person detected.

Associated PPE:
- helmet = true
- vest = true
- gloves = false

Zone requires:
- helmet
- vest
- gloves

Result:

`PPE_NON_COMPLIANCE`

Missing:
`gloves`

Create an evidence-backed event.

Where direct person-to-PPE association is difficult, implement a practical prototype heuristic and clearly document its limitations.

Do not pretend the model is more accurate than it actually is.

---

# 13. SMOKE / FIRE LOGIC

Support:

`SMOKE_DETECTED`

`FIRE_DETECTED`

Use confidence thresholds.

Avoid generating hundreds of alerts from the same fire.

Implement temporal confirmation / event deduplication.

For example:

Potential fire:
→ detected in several consecutive frames
→ confidence remains above threshold
→ create incident

Then suppress duplicate events for a configurable cooldown period.

This is important because real-world smoke detection can produce false positives from lighting, haze, steam, and other visual conditions.

---

# 14. RISK ENGINE

Create a simple explainable risk scoring system.

Example:

### Critical
Fire detected

### High
Smoke detected
or
major PPE violation in high-risk zone

### Medium
Repeated PPE violation

### Low
Single PPE violation

Do not make the scoring artificially complicated.

The important thing is that the user understands:

**Why is this incident urgent?**

Show:

`Risk Level: CRITICAL`

`Reason: Fire detected in Welding Area`

---

# 15. ZONE INTELLIGENCE

Create a visual factory map.

The prototype should allow:

- zones
- cameras
- risk levels
- active incidents

Example:

Factory Floor

🟢 Assembly
🟡 Warehouse
🔴 Welding
🟢 Packaging
🔴 Chemical Storage

When an incident occurs, highlight the affected zone.

This directly addresses the requirement for location-specific evidence/context.

---

# 16. DASHBOARD

The main dashboard should feel like an industrial command center.

Top KPI cards:

- Active Incidents
- PPE Compliance
- Critical Alerts
- Cameras Online
- Average Response Time

Main content:

### Live Safety Overview

Camera cards showing:
- camera name
- live/video preview
- AI status
- detection count
- zone
- camera health

### Active Alerts

Show:
- severity
- event
- location
- timestamp
- confidence
- evidence
- status

### Safety Trend

Charts:
- compliance over time
- incidents by category
- violations by zone
- incidents by shift

### Factory Risk Map

Show the zones and their current status.

---

# 17. LIVE MONITORING PAGE

Create a dedicated page:

`/monitoring`

Features:

- multiple camera tiles
- video playback
- AI bounding boxes
- event labels
- confidence score
- zone name
- camera status

Allow the user to click a camera.

Opening a camera should show:

- larger video
- recent detections
- recent incidents
- camera health
- configured rules

For the hackathon demo, support uploaded sample videos and webcam/video simulation if live RTSP is unavailable.

---

# 18. DEMO MODE — VERY IMPORTANT

Build a polished demo mode.

The judges may not have an actual factory CCTV stream.

Therefore support:

### Demo Video Library

Include several sample scenarios:

1. Normal factory operation
2. Worker without helmet
3. Worker without vest
4. Multiple PPE violations
5. Smoke scenario
6. Fire scenario

The demo mode should make it easy to trigger the complete workflow.

Example:

Select:

`Demo Scenario → Fire in Welding Zone`

Then the system should process the video and show:

Detection
↓
Incident
↓
Critical severity
↓
Affected zone
↓
Alert
↓
Incident workflow
↓
Dashboard update

Do not fake the AI detection results in the UI.

The video-processing pipeline should actually generate the event.

If a demo simulation is necessary because model/data limitations prevent reliable detection, clearly separate simulated demo events from genuine AI detections.

---

# 19. INCIDENT MANAGEMENT

Create:

`/incidents`

Filters:

- All
- New
- Critical
- High
- Medium
- Resolved

Filters by:

- site
- camera
- zone
- event type
- date
- severity
- status

Incident detail page should show:

- evidence image
- event type
- confidence
- location
- zone
- timestamp
- camera
- risk level
- detection explanation
- response timeline

Actions:

`Acknowledge`

`Assign`

`Escalate`

`Resolve`

Add resolution notes.

---

# 20. ALERT SYSTEM

Implement an abstraction layer:

`NotificationService`

Channels:

- in-app
- email
- webhook

Structure it so WhatsApp/SMS/Telegram can be added later.

For the prototype, in-app + email/webhook is enough unless an integration is straightforward.

Alert example:

> 🔥 CRITICAL SAFETY ALERT  
> Fire detected  
> Location: Welding Area  
> Camera: CAM-04  
> Confidence: 94%  
> Time: 14:32:08  
> Status: UNACKNOWLEDGED

---

# 21. ESCALATION LOGIC

Build a simple escalation mechanism.

Example:

Incident created.

After configurable period:

If not acknowledged:
→ Supervisor alert

If still unacknowledged:
→ Safety Manager

If critical:
→ immediately notify configured escalation recipients

Make this configurable rather than hardcoded.

---

# 22. COMPLIANCE ANALYTICS

Create:

`/analytics`

Show:

### PPE Compliance

`94.7%`

### Violations

`37`

### Fire/Smoke Events

`4`

### Average Response Time

`01:42`

### Most Frequent Violation

`Missing Helmet`

### Highest-Risk Zone

`Welding Area`

### Trend

Daily/weekly/monthly charts.

The numbers should come from the actual database/event stream, not hardcoded dashboard numbers.

---

# 23. BUSINESS VALUE / ROI VIEW

This is important for impressing judges.

Do not show pricing.

Instead show:

### Safety Impact

Examples:

- Safety checks automated
- Manual monitoring workload reduced
- Average response time
- PPE compliance improvement
- Repeat violations identified
- High-risk zones identified

Create a section:

`Operational Impact`

with metrics such as:

`Incidents detected early`

`Average response time`

`PPE compliance trend`

`Repeated violations`

`Coverage: X cameras / Y zones`

The purpose is to communicate why a factory would eventually pay for the system.

Do not fabricate claims such as “saved ₹10 lakh” unless based on actual user-provided data.

If you need demo values, clearly label them as:

`Demo Data`

---

# 24. REPORTING

Create a report page.

Generate:

### Daily Safety Report

Include:

- total incidents
- PPE compliance
- fire/smoke incidents
- top violations
- high-risk zones
- response times
- unresolved incidents

Allow:

`Export CSV`

and, if practical:

`Export PDF`

Reports should be generated from actual stored data.

---

# 25. ADMIN PANEL

Create:

`/settings`

Sections:

### Organization
- organization name
- industry
- timezone

### Users
- add user
- role
- status

### Sites
- create site
- site status

### Cameras
- add camera
- source
- stream URL
- zone
- status

### Safety Rules
- required PPE
- zone requirements
- confidence thresholds

### Alert Rules
- severity
- recipients
- escalation timing

### System
- AI service status
- backend status
- database status

---

# 26. AUTHENTICATION

Implement:

- Login
- Logout
- Protected routes
- JWT/session authentication
- RBAC

Roles:

`ADMIN`

`SAFETY_MANAGER`

`SUPERVISOR`

`VIEWER`

Users must only see/modify resources they are authorized to access.

Never store passwords as plaintext.

Use environment variables for secrets.

---

# 27. UI/UX REQUIREMENTS

The interface must look like a serious B2B industrial SaaS platform.

Visual direction:

- dark/neutral command-center interface
- strong information hierarchy
- clear severity colors
- professional typography
- responsive layout
- desktop-first
- mobile-friendly for incident review

Use colors consistently for risk:

Critical → red

High → orange

Medium → amber

Normal → green

But do not turn the entire UI into a colorful dashboard.

Use whitespace and hierarchy.

Important screens must look polished enough for a live hackathon demo.

---

# 28. LANDING PAGE

Create a professional public landing page.

Hero:

> **Turn Existing CCTV Into an AI Safety Command Center**

Supporting message:

> Real-time PPE compliance, smoke and fire detection, incident intelligence, and safety analytics for industrial environments.

Sections:

- Problem
- How it works
- AI capabilities
- Existing CCTV integration
- Safety command center
- Analytics
- Incident workflow
- Deployment options
- Product architecture
- CTA

CTA:

`Launch Demo`

Secondary:

`View Safety Dashboard`

Do not use fake customer logos.

Do not claim certifications we don't possess.

Do not claim production-grade safety certification.

---

# 29. ARCHITECTURE PAGE

Create a page or section explaining:

CCTV / Video
↓
AI Vision
↓
Event Intelligence
↓
Risk Engine
↓
Alert Engine
↓
Safety Dashboard
↓
Analytics / Reports

Show:

- React frontend
- Node API
- Python AI service
- PostgreSQL
- object storage
- notification services

This helps judges understand the technical depth.

---

# 30. API DESIGN

Create clean REST APIs.

Examples:

Authentication:

`POST /api/auth/login`

Users:

`GET /api/users`

Cameras:

`GET /api/cameras`

`POST /api/cameras`

Zones:

`GET /api/zones`

Rules:

`GET /api/rules`

Incidents:

`GET /api/incidents`

`GET /api/incidents/:id`

`PATCH /api/incidents/:id`

Analytics:

`GET /api/analytics/overview`

AI:

`POST /api/ai/analyze`

`POST /api/ai/process-video`

Health:

`GET /api/health`

Document the API.

---

# 31. REAL-TIME UPDATES

Use WebSockets or Server-Sent Events where appropriate.

When a new incident is detected:

Backend
→ realtime event
→ frontend dashboard updates

The user should not need to manually refresh the page to see a new critical incident.

---

# 32. PERFORMANCE

Do not process every frame unnecessarily.

Implement configurable frame sampling.

Example:

Video:
30 FPS

AI:
5–10 FPS depending on available compute.

Add:
- confidence thresholds
- event cooldown
- temporal confirmation
- detection batching where useful

The goal is a convincing prototype that can run on realistic hardware.

---

# 33. MODEL ARCHITECTURE

Keep the AI model abstraction modular.

Create an interface similar to:

`Detector`

with implementations such as:

`PPEDetector`

`FireDetector`

`SmokeDetector`

This makes future model replacement easy.

Do not hardcode the entire application to one model.

---

# 34. MODEL/DATASET REALITY

Do not pretend pretrained models automatically provide perfect industrial PPE/fire detection.

If a suitable pretrained model is available, use it.

If custom weights are required:

- clearly define expected classes
- provide dataset configuration
- provide training/fine-tuning instructions
- provide inference configuration
- allow weights to be swapped through configuration

The application must still run in demo mode if trained weights are unavailable.

---

# 35. FALSE POSITIVE HANDLING

Safety AI must not spam users.

Implement:

- confidence threshold
- temporal confirmation
- duplicate suppression
- cooldown period
- zone-specific thresholds where appropriate

Store the detection confidence.

Make thresholds configurable.

---

# 36. PRIVACY / SECURITY

Design for industrial privacy.

Do not use facial recognition.

Do not unnecessarily store continuous video.

Prefer storing:
- event snapshots
- short evidence clips
- metadata

Use:
- HTTPS in deployment
- environment secrets
- access control
- database authorization
- secure authentication
- audit logs

Clearly state in documentation that this prototype is not a certified life-safety system.

---

# 37. DEPLOYMENT ARCHITECTURE

Containerize the application.

Recommended services:

`frontend`

`backend`

`ai-service`

`database` where self-hosted

`reverse-proxy`

Use:

- Docker
- Docker Compose
- environment variables
- health checks
- persistent storage
- production configuration

Docker Compose supports using separate production overrides and restart policies for single-server deployments.

FastAPI can be packaged as a Linux container and deployed behind a proxy/load balancer or cloud infrastructure.

---

# 38. CLOUD DEPLOYMENT

Prepare deployment for AWS.

Preferred architecture for the prototype:

Frontend:
→ Vercel or AWS

Backend/API:
→ AWS EC2 / container service

AI:
→ GPU-capable server when required

Database:
→ Supabase/PostgreSQL

Object storage:
→ Supabase Storage or S3-compatible storage

Reverse proxy:
→ Nginx

HTTPS:
→ Let's Encrypt / cloud-managed TLS

Do not introduce Kubernetes unless genuinely necessary.

For a hackathon prototype, keep infrastructure simple.

---

# 39. ENVIRONMENT CONFIGURATION

Create:

`.env.example`

Include placeholders for:

DATABASE_URL

JWT_SECRET

SUPABASE_URL

SUPABASE_KEY

STORAGE_BUCKET

AI_SERVICE_URL

SMTP configuration

notification configuration

Never commit real secrets.

---

# 40. DOCKER COMPOSE

Create:

`docker-compose.yml`

and:

`docker-compose.prod.yml`

Services should be clearly separated.

Ensure:

- restart policy
- health checks
- environment configuration
- persistent data
- internal networking

---

# 41. TESTING

Do not finish after writing code.

Test:

### Frontend
- navigation
- login
- protected routes
- dashboard
- incident workflow
- responsive behavior

### Backend
- authentication
- RBAC
- CRUD
- incident lifecycle
- API validation

### AI
- image inference
- video inference
- PPE event generation
- smoke event generation
- fire event generation
- duplicate suppression

### Integration
Test:

Video
→ AI detection
→ API
→ database
→ realtime event
→ dashboard
→ incident
→ resolution

---

# 42. DEMO TEST SCENARIO

Create a reproducible judge demonstration.

### Scenario 1 — PPE Violation

Start demo video.

AI detects:

`Worker`

`Missing Helmet`

System creates:

`HIGH PPE VIOLATION`

Show:

camera
→ worker bounding box
→ missing PPE
→ zone
→ alert
→ incident

Then acknowledge and resolve it.

---

### Scenario 2 — Fire

Start fire demo.

System detects:

`FIRE`

Create:

`CRITICAL INCIDENT`

Show:

- red critical alert
- camera
- affected zone
- evidence image
- confidence
- timestamp
- incident timeline

Trigger escalation.

Resolve incident.

---

### Scenario 3 — Management Analytics

Open analytics.

Show that the incident is now included in:

- incident count
- zone analytics
- safety trend
- response time
- report

This demonstrates the complete product loop.

---

# 43. SEED DEMO DATA

Create realistic demo data.

Example:

Organization:
`Astra Manufacturing`

Sites:
`Bhubaneswar Plant`

Zones:
- Assembly
- Welding
- Warehouse
- Loading Bay
- Chemical Storage

Cameras:
- CAM-01
- CAM-02
- CAM-03
- CAM-04
- CAM-05

Users:
- Admin
- Safety Manager
- Supervisor

Use fictional data only.

---

# 44. DEMO ACCOUNT

Provide a development/demo account.

Document the credentials safely in the README only for local development/demo use.

Never hardcode production credentials.

---

# 45. PROJECT STRUCTURE

Use a clean monorepo structure similar to:

```text
factory-safety-ai/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   └── ...
│
├── backend/
│   ├── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── models/
│   └── ...
│
├── ai-service/
│   ├── app/
│   ├── detectors/
│   ├── pipelines/
│   ├── models/
│   ├── utils/
│   └── ...
│
├── database/
│   ├── migrations/
│   └── seed/
│
├── demo/
│   ├── videos/
│   └── scenarios/
│
├── docs/
│
├── docker/
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── README.md
└── ...
```

Adapt the exact structure if a better architecture is justified.

---

# 46. DEVELOPMENT PROCESS

Do not attempt to blindly generate the entire application in one giant response.

Work in milestones.

## Milestone 0 — Understand

First inspect the repository.

Determine:
- existing files
- installed dependencies
- existing code
- current architecture
- available environment

Do not destroy existing working code without reason.

---

## Milestone 1 — Architecture

Produce:

- architecture
- database schema
- API structure
- AI pipeline
- folder structure
- implementation roadmap

Then begin implementation.

---

## Milestone 2 — Foundation

Implement:

- project structure
- database
- authentication
- RBAC
- backend foundation
- frontend foundation
- environment configuration

Verify everything runs.

---

## Milestone 3 — AI Engine

Implement:

- image inference
- video inference
- PPE detection
- smoke detection
- fire detection
- confidence
- event generation

Create clean AI service APIs.

Verify with sample media.

---

## Milestone 4 — Safety Intelligence

Implement:

- zones
- PPE rules
- risk engine
- deduplication
- incident generation
- severity
- event context

---

## Milestone 5 — Dashboard

Build:

- command center
- live monitoring
- incident feed
- camera grid
- factory map
- KPIs
- charts

---

## Milestone 6 — Incident Workflow

Implement:

- acknowledge
- assign
- escalate
- resolve
- audit history
- notifications

---

## Milestone 7 — Analytics

Implement:

- compliance analytics
- incident analytics
- zone analytics
- response-time analytics
- reports
- exports

---

## Milestone 8 — Demo Mode

Implement the polished judge demonstration.

---

## Milestone 9 — Production Hardening

Implement:

- security
- error handling
- logging
- health checks
- performance improvements
- Docker
- production configuration

---

## Milestone 10 — Deployment

Deploy the complete system.

Provide:

- frontend URL
- backend URL
- AI service
- database configuration
- environment variables
- deployment commands
- troubleshooting instructions

---

# 47. IMPORTANT AGENT BEHAVIOR

You are an autonomous engineering agent.

When something is missing:

1. Inspect the repository.
2. Inspect existing configuration.
3. Determine the safest reasonable assumption.
4. Continue where possible.
5. Clearly document assumptions.
6. Ask me only when a decision genuinely blocks implementation.

Do NOT repeatedly stop and ask:

“Should I continue?”

For ordinary engineering decisions, make the decision yourself.

But before destructive actions such as deleting major existing functionality, explain the impact.

---

# 48. NO FAKE FUNCTIONALITY

Do not create fake buttons that do nothing.

Do not create dashboard metrics that are hardcoded.

Do not create fake AI detections disguised as real AI.

Every visible feature should either:

1. actually work, or
2. be explicitly marked as demo/simulation.

The judge should be able to interact with the application and see real state changes.

---

# 49. ERROR HANDLING

Every service should have proper error handling.

The UI should show useful errors.

Examples:

Camera unavailable:

`Camera CAM-04 is currently offline.`

AI unavailable:

`AI inference service unavailable.`

Database unavailable:

`Unable to load incident data.`

Do not show raw stack traces to normal users.

---

# 50. OBSERVABILITY

Add basic:

- structured logs
- request logs
- AI inference logs
- error logs
- camera health
- service health

Create:

`/api/health`

and ideally:

`/api/health/ai`

`/api/health/database`

---

# 51. README

Create a professional README containing:

## Product Overview

## Features

## Architecture

## Tech Stack

## Project Structure

## Local Setup

## Environment Variables

## Database Setup

## AI Model Setup

## Demo Mode

## Running Tests

## Docker Setup

## Production Deployment

## API Documentation

## Known Limitations

## Future Roadmap

---

# 52. TECHNICAL DOCUMENTATION

Create documentation explaining:

### System architecture

### AI pipeline

### PPE detection logic

### Fire/smoke logic

### Zone engine

### Incident lifecycle

### Notification system

### Database schema

### Deployment architecture

### Security model

### Limitations

The documentation should be useful to another developer joining the project.

---

# 53. JUDGE EXPERIENCE

Optimize the prototype specifically for a live demonstration.

Within 30 seconds of opening the application, the judge should understand:

**What is this?**

**What problem does it solve?**

**How does AI work?**

Within 2 minutes, the judge should see:

1. live video
2. PPE violation
3. fire/smoke detection
4. location-aware alert
5. incident workflow
6. analytics
7. business value

The application should tell a coherent story.

---

# 54. PRODUCT STORY

The core narrative should be:

### BEFORE

Factories already have cameras.

But cameras mostly record events.

Safety teams cannot continuously watch everything.

### WITH THE PLATFORM

AI watches the feeds.

AI identifies safety risks.

AI understands where the risk occurred.

AI alerts the right person.

The incident becomes an actionable workflow.

Management gets measurable safety intelligence.

### LONG-TERM

The platform becomes an intelligent safety layer over existing factory infrastructure.

---

# 55. FUTURE-READY ARCHITECTURE

Do not implement all of these now unless easy, but structure the system so they can be added:

- worker fall detection
- restricted-area intrusion
- unsafe proximity
- vehicle/person collision risk
- unsafe behavior
- gas sensor integration
- temperature sensors
- IoT integration
- WhatsApp notifications
- SMS
- Telegram
- ERP integration
- EHS integration
- multi-site command center
- edge AI deployment
- offline-first operation
- model retraining
- custom customer models

The current MVP must remain focused on:

**PPE + Smoke + Fire + Alerts + Incident Management + Analytics**

---

# 56. IMPORTANT SAFETY DISCLAIMER

This is a prototype.

Never describe it as a certified life-safety system.

Do not claim:
- guaranteed detection
- guaranteed prevention
- regulatory certification
- 100% accuracy
- guaranteed evacuation
- guaranteed injury prevention

Clearly state that real deployments require site-specific validation, calibration, appropriate safety systems, and human oversight.

---

# 57. FINAL QUALITY BAR

Before declaring the project finished, perform a complete product review.

Check:

### Product
- Does the product solve the stated problem?
- Is the value immediately understandable?

### AI
- Does detection actually work?
- Are events generated correctly?
- Are duplicate events controlled?

### Backend
- Are APIs functional?
- Is authentication secure?
- Does RBAC work?

### Frontend
- Is the UI polished?
- Are important workflows intuitive?
- Is responsive behavior acceptable?

### Database
- Is real application state persisted?
- Are relationships correct?

### Alerts
- Do incidents reach the dashboard?
- Does escalation work?

### Analytics
- Are metrics generated from real stored events?

### Deployment
- Can another developer reproduce the application?
- Does Docker work?
- Are environment variables documented?
- Are health checks available?

### Demo
- Can I demonstrate the complete story without manually manipulating the database?

---

# 58. FINAL OUTPUT FROM YOU

At the end, provide:

1. What was built
2. Architecture summary
3. Tech stack
4. Database schema
5. AI architecture
6. Features completed
7. Features intentionally deferred
8. Tests performed
9. Test results
10. Known limitations
11. Local run instructions
12. Deployment instructions
13. Production environment requirements
14. Demo walkthrough
15. Judge presentation flow
16. Future product roadmap

Most importantly:

**Do not stop at creating code.**

Take the project from:

`Idea`

→ `Architecture`

→ `Implementation`

→ `AI integration`

→ `UI`

→ `Testing`

→ `Docker`

→ `Deployment`

→ `Working demo`

→ `Documentation`

→ `Judge-ready product`

The final result should look and behave like a serious early-stage **Industrial AI Safety SaaS product**, not a basic college computer-vision project.

Begin by inspecting the current workspace/repository and determining what already exists. Then create the architecture and start implementation milestone-by-milestone.

Do not ask unnecessary questions. Make sensible engineering decisions and keep the project moving.