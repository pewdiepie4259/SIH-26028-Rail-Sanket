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

---

## Phase 7 — Employee Report Issue Module Walkthrough

### 1. Summary of Accomplishments
The **Employee “Report Issue” module** has been implemented for the RailDrishti Employee Portal at route `/employee/report`.

It provides railway employees with a streamlined, operational interface to report safety, signal, track, platform, and train hazards directly to the section controller and maintenance teams without accessing backend APIs or live GPS.

---

### 2. Files Created & Modified
- **Created**:
  - [`src/pages/employee/Report.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Report.tsx): Complete frontend operational reporting view with 2-column layout, validation, image picker with preview & removal, success card, status timeline modal, and recent reports drawer.
- **Modified**:
  - [`src/services/employee.ts`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/services/employee.ts): Added Phase 7 TypeScript types (`IssueType`, `IssueSeverity`, `OperationalImpactStatus`, `IssueWorkflowStatus`, `IssueReportItem`) and demo dataset (`demoRecentReports`).
  - [`src/App.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/App.tsx): Registered route `/employee/report`.
  - [`src/pages/employee/Dashboard.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Dashboard.tsx): Activated "Report Issue" link in sidebar.
  - [`src/pages/employee/Duty.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Duty.tsx): Activated "Report Issue" link in sidebar.
  - [`src/pages/employee/Assignment.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Assignment.tsx): Activated "Report Issue" link in sidebar.
  - [`src/pages/employee/Alerts.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Alerts.tsx): Activated "Report Issue" link in sidebar.
  - [`src/pages/employee/Tasks.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Tasks.tsx): Activated "Report Issue" link in sidebar.

---

### 3. Key Features Implemented

#### A. Report Form Fields
1. **Issue Type**: Select dropdown with options: `Signal`, `Track`, `Platform`, `Train`, `Safety`, `Other`. Required.
2. **Location**: Demo location dropdown (`KSR Bengaluru Junction`, `Kengeri`, `Ramanagara`, `Bengaluru Cantonment`, `Other`) with simulated auto-fill and visual `Demo Location` badge. Zero GPS/geolocation calls. Required.
3. **Severity**: Distinct option cards with icons and color indicators for `LOW`, `MEDIUM`, `HIGH`, and `CRITICAL` (prominent red alert styling). Required.
4. **Description**: Multi-line textarea with 500-character counter (`0 / 500`) and live validation. Required.
5. **Attach Image**: Client-side local file picker with instant image preview, file metadata display, and removal action (`URL.revokeObjectURL` cleanup). Optional.
6. **Current Status (Operational Impact)**: Explanatory selectable options: `OPERATIONAL`, `RESTRICTED`, `BLOCKED`. Required.

#### B. Validation & Submission Workflow
- Full client-side validation enforcing all required fields before submission.
- Simulated network submission state (`Submitting...`).
- Dynamic Reference ID generation (e.g. `RD-2026-00142`, `RD-2026-00143`).
- Success confirmation card showing reference ID, status `SUBMITTED`, and assigned role `Section Controller` (Demo Assignment).

#### C. Status Timeline & Recent Reports
- **Status Timeline Modal**: Interactive visual flow showing lifecycle:
  - ● `Submitted` (Issue report received & logged)
  - ○ `Under Review` (Awaiting controller review)
  - ○ `Action Assigned` (Operational action assigned)
  - ○ `In Progress` (Field team attending)
  - ○ `Resolved` (Issue resolved & verified)
- **Recent Reports List**: Displays previous reports and dynamically appends newly submitted reports in local React state.

---

### 4. Verification & Browser Testing Results
---

## Phase 8 — Employee Incident Reporting Module Walkthrough

### 1. Summary of Accomplishments
The **Employee “Incident Reporting” module** has been implemented for the RailDrishti Employee Portal at route `/employee/incidents`.

It provides railway employees with a dedicated, emergency-styled operational interface to report serious or emergency situations (Accidents, Medical Emergencies, Fire, Security Incidents, Track Obstructions, Signal Failures, Equipment Failures) directly to the Section Controller and emergency teams without accessing backend APIs or live GPS.

---

### 2. Files Created & Modified
- **Created**:
  - [`src/pages/employee/Incidents.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Incidents.tsx): Complete frontend emergency incident reporting view with prominent warning panel, pre-submission confirmation modal, emergency-themed form controls, dynamic reference ID generator, success card, 5-step status timeline modal, and recent incidents history drawer.
- **Modified**:
  - [`src/services/employee.ts`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/services/employee.ts): Added Phase 8 TypeScript types (`IncidentType`, `IncidentSeverity`, `IncidentOperationalStatus`, `IncidentWorkflowStatus`, `IncidentReportItem`) and demo dataset (`demoRecentIncidents`).
  - [`src/App.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/App.tsx): Registered route `/employee/incidents`.
  - [`src/pages/employee/Dashboard.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Dashboard.tsx): Activated "Incident Reporting" link in sidebar.
  - [`src/pages/employee/Duty.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Duty.tsx): Activated "Incident Reporting" link in sidebar.
  - [`src/pages/employee/Assignment.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Assignment.tsx): Activated "Incident Reporting" link in sidebar.
  - [`src/pages/employee/Alerts.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Alerts.tsx): Activated "Incident Reporting" link in sidebar.
  - [`src/pages/employee/Tasks.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Tasks.tsx): Activated "Incident Reporting" link in sidebar.
  - [`src/pages/employee/Report.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Report.tsx): Activated "Incident Reporting" link in sidebar.

---

### 3. Key Features & Clear Distinctions from `/employee/report`

#### A. Emergency Atmosphere & Prominent Notice Panel
- **Page Heading**: `EMERGENCY / INCIDENT` with prominent red hazard styling.
- **Top Notice Panel**: High-visibility panel explaining that this form is strictly for serious/emergency incidents, complete with a one-click button `[ Report a Normal Issue ]` routing to `/employee/report`.
- **Reference ID Format**: `INC-2026-XXXXX` (distinct from normal reports `RD-2026-XXXXX`).

#### B. Incident Form Fields
1. **Incident Type**: Select dropdown with options: `Accident`, `Medical Emergency`, `Fire`, `Security Incident`, `Track Obstruction`, `Signal Failure`, `Equipment Failure`, `Other Emergency`. Default: `Select incident type`. Required.
2. **Location**: Demo location dropdown (`KSR Bengaluru – Platform 1-4`, `Kengeri`, `Ramanagara`, `Assigned Section`, `Other`) with `Demo Location (No GPS)` badge and custom entry support. Required.
3. **Severity**: Emphasized options: `CRITICAL` (default & prominently highlighted), `HIGH`, `MEDIUM`, `LOW`. Required.
4. **Description**: Multi-line textarea with 500-character counter (`0 / 500`) and live validation. Required.
5. **Attach Image / Evidence**: Client-side local file picker with instant image preview, metadata display, and removal action (`URL.revokeObjectURL` cleanup). Optional.
6. **Current Operational Status**: Explanatory selectable options: `BLOCKED`, `RESTRICTED`, `OPERATIONAL`. Required.

#### C. Pre-Submission Confirmation Modal
- Intercepts submission after validation passes to display a high-priority confirmation dialog summarizing Incident Type, Location, Severity, and Current Status with `[ Confirm & Submit Incident ]`.

#### D. Success State & 5-Step Status Timeline
- **Success State**: `⚠ INCIDENT REPORTED` with dynamic ID `INC-2026-XXXXX`, status `SUBMITTED`, priority `CRITICAL`, assigned to `Section Controller (Demo Assignment)`.
- **Status Timeline Modal**:
  - ● `Submitted` *(Completed / Active)*
  - ○ `Under Review`
  - ○ `Action Assigned`
  - ○ `Response In Progress`
  - ○ `Resolved`
- **Recent Incidents**: Dynamic local state stream with pre-loaded demo incidents (`INC-2026-00017`, `INC-2026-00018`, `INC-2026-00019`) and newly submitted incidents prepended.

---

### 4. Verification & Browser Testing Results
---

## Phase 9 — Employee Notifications Module Walkthrough

### 1. Summary of Accomplishments
The **Employee “Notifications” module** has been implemented for the RailDrishti Employee Portal at route `/employee/notifications`.

It provides railway employees with a dedicated operational notification center to track updates across duty rosters, task assignments, train ETA modifications, weather advisories, and operational alerts—all powered with dynamic React local state management, real-time unread count badges, category filtering, search, and deep-link navigation actions.

---

### 2. Files Created & Modified
- **Created**:
  - [`src/pages/employee/Notifications.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Notifications.tsx): Complete notification center view with dynamic summary stats (Total, Unread, Read), Mark All as Read button, Read/Unread filters, live search, category chips, card actions, and notification detail modal.
- **Modified**:
  - [`src/services/employee.ts`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/services/employee.ts): Added Phase 9 TypeScript types (`EmployeeNotificationCategory`, `EmployeeNotificationItem`) and demo notifications dataset (`demoEmployeeNotifications`).
  - [`src/App.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/App.tsx): Registered route `/employee/notifications`.
  - [`src/pages/employee/Dashboard.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Dashboard.tsx): Activated "Notifications" link in sidebar.
  - [`src/pages/employee/Duty.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Duty.tsx): Activated "Notifications" link in sidebar.
  - [`src/pages/employee/Assignment.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Assignment.tsx): Activated "Notifications" link in sidebar.
  - [`src/pages/employee/Alerts.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Alerts.tsx): Activated "Notifications" link in sidebar.
  - [`src/pages/employee/Tasks.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Tasks.tsx): Activated "Notifications" link in sidebar.
  - [`src/pages/employee/Report.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Report.tsx): Activated "Notifications" link in sidebar.
  - [`src/pages/employee/Incidents.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Incidents.tsx): Activated "Notifications" link in sidebar.

---

### 3. Key Features Implemented

#### A. Centralized Demo Notification Dataset
Includes the 6 realistic operational notifications:
1. `14:32` | `Train 12627 ETA updated` | Train Update | UNREAD | Action: `/employee/assignment`
2. `14:27` | `New duty assignment received` | Duty | UNREAD | Action: `/employee/duty`
3. `14:10` | `Signal maintenance task assigned` | Task | READ | Action: `/employee/tasks`
4. `13:58` | `Weather warning issued for your section` | Weather | UNREAD | Action: `/employee/alerts`
5. `13:42` | `Platform inspection task updated` | Task | READ | Action: `/employee/tasks`
6. `13:25` | `Operational alert acknowledged` | Operational Alert | READ | Action: `/employee/alerts`

#### B. Dynamic Counters & Summary Metrics
- **Total**: Dynamically calculated (`6`)
- **Unread**: Dynamically calculated (`3` initially $\rightarrow$ `0` when marked all read)
- **Read**: Dynamically calculated (`3` initially $\rightarrow$ `6` when all read)
- **Sidebar Badge**: Dynamically displays unread notification count in real-time.

#### C. Notification Actions & State Transitions
- **`[ Mark as Read ]`**: Directly transitions individual card from `UNREAD` $\rightarrow$ `READ` and decrements unread counter.
- **`[ Mark All as Read ]`**: Header action that immediately marks all notifications as `READ`.
- **Deep-Link Navigation Buttons**: `[ View Duty ]`, `[ View Task ]`, `[ View Assignment ]`, `[ View Alerts ]` routing to the respective existing employee modules.

#### D. Filters, Search & Empty State
- **Status Filter**: `All`, `Unread`, `Read` tabs with live count indicators.
- **Category Filter**: Filter by `Train Update`, `Duty`, `Task`, `Weather`, `Operational Alert`.
- **Search**: Real-time filtering across titles, descriptions, and categories.
- **Empty State**: Displays `"NO UNREAD NOTIFICATIONS - You're all caught up"` when no unread notifications exist.

---

### 4. Verification & Browser Testing Results
---

## Phase 10 — Employee Activity / History Module Walkthrough

### 1. Summary of Accomplishments
The **Employee “Activity / History” module** has been implemented for the RailDrishti Employee Portal at route `/employee/history`.

It provides railway employees with a dedicated, read-only operational activity audit trail to review actions, logged operational events, duty lifecycle changes, and status transitions—all powered by structured React local state, chronological vertical timeline connectors, date grouping, category filters, and live search.

---

### 2. Files Created & Modified
- **Created**:
  - [`src/pages/employee/History.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/History.tsx): Complete activity history view with dynamic summary metrics (Total Activities, Today, Issues Reported, Issues Resolved), vertical timeline layout with status connector line, date grouping, search bar, category filters, and activity detail modal.
- **Modified**:
  - [`src/services/employee.ts`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/services/employee.ts): Added Phase 10 TypeScript types (`EmployeeActivityCategory`, `EmployeeActivityItem`) and demo activities dataset (`demoEmployeeActivities`).
  - [`src/App.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/App.tsx): Registered route `/employee/history`.
  - [`src/pages/employee/Dashboard.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Dashboard.tsx): Activated "Activity / History" link in sidebar.
  - [`src/pages/employee/Duty.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Duty.tsx): Activated "Activity / History" link in sidebar.
  - [`src/pages/employee/Assignment.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Assignment.tsx): Activated "Activity / History" link in sidebar.
  - [`src/pages/employee/Alerts.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Alerts.tsx): Activated "Activity / History" link in sidebar.
  - [`src/pages/employee/Tasks.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Tasks.tsx): Activated "Activity / History" link in sidebar.
  - [`src/pages/employee/Report.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Report.tsx): Activated "Activity / History" link in sidebar.
  - [`src/pages/employee/Incidents.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Incidents.tsx): Activated "Activity / History" link in sidebar.
  - [`src/pages/employee/Notifications.tsx`](file:///c:/Users/06362/Desktop/SIH-26028-Rail-Drishti/src/pages/employee/Notifications.tsx): Activated "Activity / History" link in sidebar.

---

### 3. Key Features Implemented

#### A. Centralized Demo Activity Dataset
Includes 5 chronological audit trail events (newest at the top):
1. `13 Sep` | `16:05` | **Issue resolved** | Category: `ISSUE` | Action: `/employee/report`
2. `13 Sep` | `15:20` | **Issue assigned to Section Controller** | Category: `ISSUE` | Action: `/employee/report`
3. `13 Sep` | `15:04` | **Reported signal issue** | Category: `ISSUE` | Action: `/employee/report`
4. `13 Sep` | `14:25` | **Viewed Train 12627** | Category: `TRAIN` | Action: `/employee/assignment`
5. `13 Sep` | `14:12` | **Duty started** | Category: `DUTY` | Action: `/employee/duty`

#### B. Dynamic Counters & Summary Metrics
- **Total Activities**: Dynamically calculated (`5`)
- **Today**: Current shift records (`5`)
- **Issues Reported**: Dynamically calculated (`1`)
- **Issues Resolved**: Dynamically calculated (`1`)

#### C. Vertical Timeline & Date Grouping
- Visual connector timeline line with pulsing category status dots.
- Date group headers (`13 Sep (Today)`).
- Clear auditability information on each card: Time, Category Badge, Title, Description, Related Entity, and Deep-link Action button.

#### D. Category Filters & Real-Time Search
- **Category Filter Tabs**: `All`, `Duty`, `Train`, `Task`, `Issue`, `Incident`.
- **Search Bar**: Instant filtering across titles, descriptions, categories, and related entities (e.g. searching `"12627"` isolates the train view activity).

#### E. Activity Detail Modal & Read-Only Audit Protection
- Clicking an activity card opens a structured modal with full audit record metadata (Timestamp, Category, Related Entity, Source, Description, and Deep-Link Action).
- Strictly read-only to preserve operational audit integrity.

---

### 4. Verification & Browser Testing Results
- **Automated Build**: `npm run build` (`tsc -b && vite build`) passed with **0 errors**.
- **Browser Subagent Test**:
  - Verified initial state metrics: Total: 5, Today: 5, Issues Reported: 1, Issues Resolved: 1.
  - Verified chronological order (newest 16:05 first, 14:12 last).
  - Verified category filters (`Issue`, `Train`, `Duty`, `All`).
  - Verified live search for `"12627"`.
  - Verified Activity Details modal opening and closing cleanly.
  - Verified regression navigation between all 9 employee routes: `/employee/dashboard`, `/employee/duty`, `/employee/assignment`, `/employee/alerts`, `/employee/tasks`, `/employee/report`, `/employee/incidents`, `/employee/notifications`, and `/employee/history`.
