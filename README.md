# MindCare Pro · Modern Clinical Sanctuary & Practice Portal

MindCare Pro is a trauma-informed, modern React practice management and client wellbeing portal redesigned from the Stitch design system. It bridges mental health practitioners and clients through an empathetic, calm, and distraction-free user experience.

---

## Key Features

### Clinical Practitioner Workspace
- **Practice Overview (`Overview`)**:
  - **Clinical Sanctuary Practice Showcase & Image Uploader**: Upload clinic facility photos, consultation room views, or practitioner badges; live visual overview with customizable title & description, full-screen inspection modal, and multi-image gallery switching.
  - **Client Media & Vault Overview**: Direct dashboard overview of files, questionnaires, and grounding photos submitted by clients with thumbnail previews.
  - Live KPI metric tiles: Total Intake, Active Clients, Pending Triage, and Upcoming Consultations.
  - 7-Day Client Wellbeing Mood tracker with real-time average scoring.
  - Triage Pipeline with quick approval/decline actions.
- **Client Management (`Clients`)**:
  - Searchable client registry with name/email filtering and status tags (`Pending`, `Accepted`, `Rejected`).
  - Longitudinal mood status, session attendance counts, and file counters.
  - Interactive Client Dossier: click on any client to open their full interactive profile (Wellbeing overview, file vault, consultation history, care plan action steps, and clinical notes).
- **Client Document Vault (`Client Files`)**:
  - Full practitioner access to all client documents with storage metrics, client filtering, and file name searching.
  - Secure document downloads and practitioner-to-client upload and file sharing studio.
- **Appointment Scheduling (`Schedule`)**:
  - Direct booking for Online Telehealth, In-Person Sanctuary, and Focused Follow-ups.
  - Instant session confirmation and cancellation workflows.
- **Session Notes (`Session Notes`)**:
  - Secure clinical documentation, category classification, and timestamped history.
- **Care Plans (`Care Plans`)**:
  - Collaborative, achievable action steps with target completion dates.
- **Practice Notifications (`Notifications`)**:
  - Real-time updates on client intake requests and completed milestones.

### Client Wellbeing Sanctuary
- **Sanctuary Dashboard (`Dashboard`)**:
  - **Sanctuary Visual Anchor & Calming Space**: Upload personal grounding photos (nature, artwork, peaceful space, pets); live visual overview with customizable grounding intention/notes, full-screen inspection modal, and multi-anchor gallery switcher.
  - Calming reflection quotes, clinician connect card, and check-in streak tracking.
  - Care journey milestone indicators.
- **Mood Journal (`Mood Journal`)**:
  - 5-state tactile nervous system check-in (Depleted, Guarded, Steady, Grounded, Vital).
  - SVG 7-day emotional energy trajectory chart.
  - Sleep pacing & daily movement biometric context cards.
- **Book a Session (`Book Session`)**:
  - Intake questionnaire, session focus topics, and modality selection.
- **My Goals (`My Goals`)**:
  - Interactive care plan goals with one-click completion toggles and progress bar.
- **Confidential Documents (`Documents`)**:
  - Secure file sharing vault unlocked upon clinical acceptance.
- **Wellbeing Sanctuary Toolkit (`Wellbeing Toolkit`)**:
  - **Guided Box Breathing (4-4-4-4)**: Interactive breathing pacing circle with cycle counters.
  - **5-4-3-2-1 Sensory Grounding**: Step-by-step autonomic nervous system stabilization.
  - **Somatic SUDS Distress Gauge**: 1–10 tactile slider with live therapeutic feedback.
  - **24/7 Crisis Support**: Prominent hotline button linking to the 988 Suicide & Crisis Lifeline.

---

## Design System & Accessibility
- **Typography**: Editorial elegance with `Playfair Display` serif headlines and humanistic `Plus Jakarta Sans` body typography.
- **Icons**: Google Material Symbols Outlined.
- **Theme Modes**: One-click toggling between soothing **Sanctuary Light** and **Sanctuary Dark** palettes.
- **Data Persistence**: Automatic syncing to browser `localStorage` with full JSON backup export.
- **Interactive Header Profile & Avatar Studio**:
  - Live photo avatar in the top header and sidebar for both Consultants and Clients.
  - One-click profile overview popover with role-specific KPI cards (Practitioner stats vs. Client care journey stats).
  - Instant picture upload, canvas compression, change photo, and reset controls right from the header pill.

---

## Project Architecture & Directory Structure

To maintain maximum code cleanliness, readability, and performance, the codebase is architected into modular directories (see [`ARCHITECTURE.md`](file:///c:/Users/USER/Desktop/Shahriar/Project_412/ARCHITECTURE.md) for full specs):

```text
src/
├── assets/                  # Static visual assets
├── components/              # Shared UI components
│   ├── common/              # Micro UI primitives (Chip, StatCard, Toast, MoodChart)
│   ├── layout/              # Shell (Header, Sidebar, ProfileMenu popover)
│   └── modals/              # Overlays (ClientDossierModal, FilePreviewModal)
├── views/                   # Screen views by domain
│   ├── auth/                # Sign-in & intake registration (AuthScreen)
│   ├── consultant/          # Practitioner workspace (Home, Clients, Docs, Schedule, Notes, Plans, Notif)
│   └── client/              # Client Sanctuary workspace (Home, Mood, Book, Sessions, Goals, Docs, Toolkit, Notif)
├── data/                    # Seed database (seedData.js) and constants (constants.js)
├── utils/                   # Pure utilities (formatters.js, mediaUtils.js)
├── App.jsx                  # Root orchestrator & routing (~120 lines)
├── index.css                # Design system styling & animations
└── main.jsx                 # Application entry point
```

---

## Getting Started

### 1. Development Server
```bash
npm run dev
```

### 2. Production Build
```bash
npm run build
```

### 3. Code Linting
```bash
npm run lint
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Consultant** | `demo@mindcare.com` | `MindCare123` |
| **Active Client (Jamie)** | `jamie@example.com` | `Jamie1234` |
| **New Intake Client** | `client@mindcare.com` | `Client123` |
