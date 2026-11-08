# MindCare Pro · Modular Architecture & Folder Structure

This document outlines the proposed modular architectural breakdown of MindCare Pro, refactoring the monolithic `App.jsx` (~3,900 lines) into isolated, maintainable, single-responsibility modules.

---

## 📁 Proposed Clean Directory Structure

```text
src/
├── assets/                         # Static images and brand logos
│   ├── hero.png
│   ├── react.svg
│   └── vite.svg
│
├── data/                           # Seed database and static configurations
│   ├── constants.js                # Mood scales (MOODS, E), navigation menus (NS, NC), Tailwind presets
│   └── seedData.js                 # Initial mock accounts, clients, appointments, care plans, vault files, and visual anchors
│
├── utils/                          # Pure helper functions and media handlers
│   ├── formatters.js               # Date helpers (T, dOff, getNowDateString), uid(), sorting
│   └── mediaUtils.js               # Canvas image compression, Base64 dataURL reader, file download generator
│
├── components/                     # Reusable and shared UI elements
│   ├── common/                     # Micro UI primitives
│   │   ├── Chip.jsx                # Triage, appointment, and care plan status badges
│   │   ├── StatCard.jsx            # Top-row KPI metric tiles
│   │   ├── EmptyState.jsx          # Serene empty state placeholder with icons
│   │   ├── Toast.jsx               # Floating toast notifications
│   │   └── MoodChart.jsx           # SVG 14-day mood trajectory line chart
│   │
│   ├── layout/                     # Application shell and navigation
│   │   ├── Header.jsx              # Sticky top header, 24/7 crisis pill, notifications trigger
│   │   ├── Sidebar.jsx             # Left sidebar navigation menu & quick profile card
│   │   └── ProfileMenu.jsx         # Interactive profile avatar popover, picture updater & live stats
│   │
│   └── modals/                     # Overlay modals
│       ├── ClientDossierModal.jsx  # Full practitioner 5-tab client profile dossier
│       └── FilePreviewModal.jsx    # Universal document & high-res image preview modal
│
├── views/                          # Page views grouped by domain
│   ├── auth/                       # Authentication and onboarding
│   │   └── AuthScreen.jsx          # Consultant / Client tabbed sign-in and intake registration
│   │
│   ├── consultant/                 # Clinical Practitioner workspace
│   │   ├── ConsultantHome.jsx      # Overview KPIs, Practice Sanctuary image showcase, client uploads
│   │   ├── ClientManagement.jsx    # Client directory, search, filter, and dossier access
│   │   ├── ClientDocuments.jsx     # Document vault, client filter, and consultant upload studio
│   │   ├── ConsultantSchedule.jsx  # Appointment booking and session management
│   │   ├── SessionNotes.jsx        # Clinical documentation compose & history
│   │   ├── CarePlans.jsx           # Action steps assignment & progress tracking
│   │   └── ConsultantNotif.jsx     # Practitioner notifications list
│   │
│   └── client/                     # Client Sanctuary workspace
│       ├── ClientHome.jsx          # Sanctuary hero, grounding visual anchor, quick mood check-in
│       ├── MoodJournal.jsx         # 5-state check-in, notes, trajectory curve, biometrics
│       ├── BookSession.jsx         # Intake appointment request form
│       ├── ClientSessions.jsx      # Client session bookings history
│       ├── ClientGoals.jsx         # Care plan checklist with progress bar
│       ├── ClientDocuments.jsx     # Confidential vault, client file uploads & downloads
│       ├── WellbeingToolkit.jsx    # Box breathing (4-4-4-4), 5-4-3-2-1 grounding, SUDS gauge
│       └── ClientNotif.jsx          # Client notifications list
│
├── App.jsx                         # Main orchestrator & routing state (~120 lines)
├── index.css                       # Design tokens, scrollbar, and breathing animation keyframes
└── main.jsx                        # React root entry point
```

---

## 🧩 Architectural Responsibilities

| Layer | Path | Responsibility |
|---|---|---|
| **Data & Seeds** | `src/data/` | Initial seed state (`acc`, `cl`, `ap`, `nt`, `pl`, `fl`, `md`, `dashImages`, `avatars`), navigation menus, mood mappings, and tailwind styling presets. |
| **Utilities** | `src/utils/` | Reusable formatting utilities, date calculators, canvas-based image compressor, dataURL handlers, and synthetic PDF/text file generators. |
| **Common UI** | `src/components/common/` | Pure presentational widgets: status chips, metric tiles, empty states, toast messages, and SVG trajectory charts. |
| **Shell & Layout** | `src/components/layout/` | Header, Sidebar, and the interactive Profile Avatar popover with live picture upload and quick statistics. |
| **Modals** | `src/components/modals/` | Complex overlays: 5-tab Client Dossier and high-resolution File & Image Preview modal. |
| **Consultant Views** | `src/views/consultant/` | 7 practitioner screens isolated by task: Overview, Clients, Documents, Schedule, Notes, Plans, Notifications. |
| **Client Views** | `src/views/client/` | 8 client screens: Sanctuary Home, Mood Journal, Book Session, My Sessions, Goals, Documents, Toolkit, Notifications. |
| **App Root** | `src/App.jsx` | Reduced from ~3,900 lines to ~120 lines; holds root state, localStorage synchronization, theme toggle, and view routing. |

---

## 🛡️ Migration Guarantees
- **Zero Feature Loss**: All features (image uploads, full-screen previews, interactive breathing timer, client dossier, profile popover, notifications, localStorage sync) are preserved intact.
- **Strict Lint & Build Verification**: Every isolated module will pass `oxlint src` and `vite build` without errors or warnings.
- **Safe Version Control**: Changes will remain local and will **not** be pushed to GitHub without your explicit request.
