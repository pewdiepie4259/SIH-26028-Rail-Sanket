# RailDrishti - End-to-End System Integration Walkthrough

## Executive Summary
RailDrishti has been integrated into a complete, full-stack real-time application connecting the All-India Spatio-Temporal Graph Neural Network (ST-GNN) inference core, Section Controller Decision Support System (DSS), live IoT/RTIS kinematic ingestion worker, SQLite persistence database, AI WhatsApp chatbot, and interactive React web interface.

---

## Architecture & Integration Highlights

### 1. Unified Real-Time Backend (`sih26028-rail-eta/app/main.py`)
- **Single Unified API Surface**: Consolidated the ST-GNN nationwide model, database persistence, Section Controller DSS, and passenger services onto port `8000`.
- **Active Endpoints Verified**:
  - `GET /health`: Core health, active trains count, network node count, active WebSocket subscribers.
  - `GET /api/v1/stations`: Master inventory of Bengaluru & national corridor stations with platform data and GIS coordinates.
  - `GET /api/v1/trains`: Master coaching fleet database with priority tiers and routes.
  - `GET /api/v1/corridors/bengaluru/topology`: Corridor graph nodes and inter-station track links for 2D schematic projection.
  - `POST /api/v1/telemetry`: High-frequency kinematic RTIS ingest updating ST-GNN delay cascade projections and broadcasting over WebSocket.
  - `GET /api/v1/copilot/active-alerts`: Real-time bottleneck detection, cascade risk percentages, and precedence overtake advisories.
  - `POST /api/v1/copilot/execute-directive`: Section Controller interlocking authorization endpoint with audit history logging.
  - `GET /api/v1/copilot/directive-history`: Dispatcher approval audit trail.
  - `GET /api/v1/metrics/eval`: AI Spatio-Temporal Foresight vs Baseline Kinematic Timetable comparative evaluation metrics.
  - `POST /api/v1/whatsapp/query`: AI passenger assistant providing real-time GPS coordinates, current velocity, and schedule delay.
  - `POST /api/v1/gps/update-location`: Real-time geo-fencing and nearest station snapping.
  - `WS /ws/telemetry`: Low-latency WebSocket stream broadcasting telemetry frames to all connected views.

### 2. Live RTIS / Kinematic Ingestion Worker (`sih26028-rail-eta/app/live_ingestion_worker.py`)
- Continuously streams live kinematic velocity, GPS waypoints, and block signaling aspects across premier trains (Vande Bharat `20608`, Howrah Rajdhani `12301`, Bangarapet MEMU `06527`, Karnataka Express `12627`).
- Triggers dynamic cascade prediction in the ST-GNN engine and updates active rake positions.

### 3. Comprehensive Frontend Application (`src/`)
- **Global Navigation Bar (`src/layouts/PublicLayout.tsx`)**:
  - Responsive navigation links for **Dashboard**, **Live Monitor** (with live pulsing RTIS indicator), **Live Map**, **Train Search**, **Stations**, **Controller DSS** (with specialized badge), and **Settings**.
  - Integrated mobile drawer menu, multi-language switcher, and accessibility controls (high contrast, dark contrast, text scaling, color vision deficiency adjustments).
- **Live Corridor Telemetry Monitor (`src/pages/public/LiveTrainStatus.tsx`)**:
  - Connected to live WebSocket stream `ws://127.0.0.1:8000/ws/telemetry`.
  - Supports search query parameters (`?train=...`) from the home dashboard or search pages.
  - Live aspect filtering (GREEN, YELLOW, DOUBLE_YELLOW, RED).
- **Interactive 2D Schematic Live Map (`src/pages/public/LiveMap.tsx`)**:
  - Renders the corridor graph, real-time rake positions, kinematic speed vectors, signal aspects, and GNN bottleneck choke points.
- **Train Search & Fleet Directory (`src/pages/public/TrainSearch.tsx`)**:
  - Search by train number, name, origin, or destination.
  - Class filter chips: All Classes, Vande Bharat / Rajdhani, Superfast Express, Suburban MEMU.
  - Displays live RTIS transmission status, current speed, and one-click actions: "Track Dynamic ETA", "View on Schematic Map", "Ask WhatsApp Bot".
- **Station Directory & Facilities (`src/pages/public/StationInformation.tsx`)**:
  - Search stations by name or code (SBC, BNC, BNCE, BYPL, KJM, WFD, MLO, BWT, etc.).
  - Deep-dive into platform counts, GIS coordinates, Solid State Interlocking classification, and passenger smart station amenities (Wi-Fi, IRCTC Lounges, EV Charging, Escalators).
- **Section Controller Copilot (`src/pages/ControllerDashboard.tsx`)**:
  - Live Precedence & Overtake Advisories displaying downstream cascade risk and impacted rakes.
  - Interactive "Authorize Dispatch" button submitting interlocking directives directly to `POST /api/v1/copilot/execute-directive`.
  - Displays the real-time AI vs Kinematic Baseline Foresight Benchmark banner (`/api/v1/metrics/eval`).
  - Session Interlocking Action Audit Log loaded from backend directive history.
- **Settings & Diagnostics (`src/pages/settings.tsx`)**:
  - Live backend connectivity ping test displaying status, active trains, network nodes, and roundtrip ping latency in milliseconds.
  - Preferences for kinematic update frequency, audio chimes, auto-centering on map, and cache wiping.

---

## Build & Production Verification
- **TypeScript & Build**: `tsc -b && vite build` passed with **0 errors**.
- **Frontend Server**: Vite development server active on `http://localhost:5173/` (HTTP 200 OK).
- **Backend Server**: Uvicorn server active on `http://127.0.0.1:8000/` (HTTP 200 OK, Healthy).
