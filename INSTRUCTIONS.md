# Developer & Collaboration Instructions

Welcome to **Project 412: Trauma-Informed Mental Health & Sanctuary Platform**. This document provides guidelines, standards, and a master task checklist for developers collaborating on this project.

---

## 1. Getting Started

### 1.1 Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **Git**: Installed and configured with your name and email (`git config user.name`, `git config user.email`)

### 1.2 Local Setup
Clone the repository and install dependencies:
```bash
# Clone the repository
git clone https://github.com/Hridil/Project_412.git
cd Project_412

# Install dependencies
npm install

# Run the local development server (Vite)
npm run dev
```
Open `http://localhost:5173` in your browser.

### 1.3 Code Quality Commands
Before committing or creating a pull request, always ensure both of the following pass without errors or warnings:
```bash
# 1. Check code quality with oxlint
npm run lint

# 2. Verify production build with vite
npm run build
```

---

## 2. Git Collaboration Workflow

To maintain a clean and reliable codebase across multiple contributors, adhere to the following workflow:

### 2.1 Branching Strategy
* **`main`**: Production-ready branch. Direct pushes to `main` are strictly prohibited without pull request reviews.
* **`Shahriar` / Feature branches**: Work should be done on dedicated branches.
* **Branch Naming Conventions**:
  * `feature/<feature-name>` (e.g., `feature/webrtc-video-call`)
  * `fix/<bug-description>` (e.g., `fix/mood-chart-responsive`)
  * `docs/<topic>` (e.g., `docs/api-specs`)
  * `<dev-name>/<task-name>` (e.g., `shahriar/auth-jwt`)

### 2.2 Commit Message Standard
Follow [Conventional Commits](https://www.conventionalcommits.org/):
* `feat:` A new feature or screen
* `fix:` A bug fix
* `refactor:` Code restructuring without behavioral change
* `docs:` Documentation changes
* `style:` Formatting or UI styling polish
* `test:` Adding or updating tests
* `chore:` Build scripts or dependency updates

*Example:*
```bash
git commit -m "feat(telehealth): add WebRTC room connection state and video controls"
```

### 2.3 Pull Request (PR) Checklist
Before requesting review on your pull request:
1. Ensure your branch is up to date with `main` (`git merge origin/main` or `git rebase origin/main`).
2. Run `npm run lint` and resolve all warnings and errors.
3. Run `npm run build` and verify that the production build completes cleanly.
4. Test in both **Light Mode** and **Dark Mode**.
5. Test responsive behavior on mobile (`<640px`) and desktop (`>1024px`).

---

## 3. Code Architecture & Conventions

The codebase follows a modular, domain-driven structure outlined in [`ARCHITECTURE.md`](./ARCHITECTURE.md):

```text
src/
├── data/          # Reusable tokens (constants.js) and initial mock database (seedData.js)
├── utils/         # Pure helper functions (formatters.js, mediaUtils.js)
├── components/
│   ├── common/    # Generic UI elements (Chip, StatCard, Toast, EmptyState, MoodChart)
│   ├── layout/    # Structural components (Header, Sidebar, ProfileMenu)
│   └── modals/    # Floating dialogs (ClientDossierModal, FilePreviewModal)
├── views/
│   ├── auth/      # Authentication & intake onboarding
│   ├── consultant/# Clinical management, scheduling, care plans, dossiers
│   └── client/    # Client sanctuary, mood journal, booking, wellbeing toolkit
└── App.jsx        # Root component coordinating state and active view
```

### 3.1 Key Architectural Rules
1. **No Monolithic Files**: Do not add monolithic screens into `App.jsx`. New screens must be created under `src/views/consultant/` or `src/views/client/`.
2. **Design Token Consistency**: Use the styling tokens from `src/data/constants.js` (`clsInput`, `clsCard`, `clsBtnPrimary`, etc.) rather than writing arbitrary inline colors.
3. **Trauma-Informed Design**: Strictly avoid abrupt flash animations, harsh alarm reds, or disruptive full-screen overlays. See [`DESIGN.md`](./DESIGN.md) for UX guidelines.

---

## 4. Master Project Task Roadmap

Below is the comprehensive checklist of tasks required to bring this platform to full production. 
*(Note: Tasks are currently unassigned. The repository owner will assign specific tasks to developers in `assigned_work.md`).*

### Phase 1: Authentication & User Management
- [ ] Implement backend authentication API (Express/Node.js or Supabase Auth).
- [ ] Add JWT access and refresh token rotation with secure HTTP-only cookies.
- [ ] Implement secure password hashing (Argon2 / bcrypt) and validation rules.
- [ ] Add OAuth2 social authentication (Google / Apple).
- [ ] Implement Multi-Factor Authentication (MFA) via TOTP authenticator apps.
- [ ] Role-Based Access Control (RBAC) middleware verifying `client` vs `consultant` roles.
- [ ] Account password reset and email verification flows.

### Phase 2: Database & Persistent Storage
- [ ] Design and migrate database schema to PostgreSQL / Supabase / Prisma.
- [ ] Create database migrations for Users, Profiles, Appointments, CarePlans, Files, and MoodLogs.
- [ ] Implement Row-Level Security (RLS) ensuring clients can only access their own records.
- [ ] Set up secure cloud storage bucket (AWS S3 / Supabase Storage / Cloudinary) for client documents.
- [ ] Implement server-side client-side encryption for sensitive therapy documents and clinical notes.
- [ ] Add audit logging for access to sensitive client medical dossiers (HIPAA / GDPR alignment).

### Phase 3: Telehealth & Consultation Features
- [ ] Integrate real-time WebRTC or Daily.co / Agora video room for client-consultant sessions.
- [ ] In-session clinical notes scratchpad with automatic draft autosave.
- [ ] Session scheduling calendar synchronization (Google Calendar / Outlook Calendar API).
- [ ] Timezone auto-detection and conversion for international consultations.
- [ ] Client intake questionnaire customizable form builder for consultants.
- [ ] Automated export of client care plans and session notes to branded PDF dossiers.

### Phase 4: Client Sanctuary & Wellbeing Toolkit
- [ ] Audio player engine with soothing ambient soundscapes and guided audio meditations.
- [ ] Interactive Somatic body-map tracker for somatic experiencing and pain check-ins.
- [ ] Mood journaling analytics: weekly/monthly mood trend reports and trigger correlations.
- [ ] Goal achievement milestone animations and positive reinforcement streaks.
- [ ] Emergency Crisis SOS button with regional hotline directory and geolocated support contacts.
- [ ] Push notification service for gentle daily mindfulness and mood check-in reminders.

### Phase 5: Communication & Notifications
- [ ] Real-time end-to-end encrypted direct messaging between consultant and client (WebSockets / Socket.io).
- [ ] File sharing and attachment previews directly inside the chat interface.
- [ ] Automated email/SMS appointment reminders (via SendGrid / Twilio).
- [ ] In-app notification center with real-time status updates and unread badges.

### Phase 6: Billing, Invoicing & Payments
- [ ] Payment gateway integration (Stripe / LemonSqueezy) for booking consultation sessions.
- [ ] Automated invoice generation and PDF receipt downloads for insurance reimbursement.
- [ ] Sliding-scale payment tier support for community and pro-bono sessions.
- [ ] Consultant payout account management (Stripe Connect).

### Phase 7: Testing, DevOps & Deployment
- [ ] Set up unit and integration test suite using Vitest and React Testing Library.
- [ ] Implement End-to-End (E2E) testing suite with Playwright.
- [ ] Configure GitHub Actions CI/CD pipeline running lint, unit tests, and build checks on every PR.
- [ ] Deploy staging and production environments on Vercel / Netlify / Railway.
- [ ] Setup monitoring and error tracking (Sentry).

---

## 5. Next Steps for Contributors

Once the repository owner assigns your tasks in `assigned_work.md`:
1. Check `assigned_work.md` for your designated items.
2. Create your feature branch from `main`.
3. Read [`DESIGN.md`](./DESIGN.md) for UI/UX specifications.
4. Implement, verify with `npm run lint` and `npm run build`, and open a Pull Request.
