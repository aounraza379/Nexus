# Business Nexus — Investor & Entrepreneur Collaboration Platform

A full-featured frontend platform connecting entrepreneurs with investors.

**Live Demo:** https://business-nexus-sable.vercel.app/

---

## Tech Stack

- React 18 + TypeScript
- Vite
- React Router v6
- Tailwind CSS
- FullCalendar
- React Joyride
- Lucide React

---

## Phase 2 Features

### Week 1
- **UI Theme** — CSS design tokens, consistent color system
- **Meeting Calendar** — FullCalendar with availability slots, meeting requests (accept/decline), confirmed meetings view

### Week 2
- **Video Calls** — WebRTC mock UI with start/end, mic/camera/screen share toggles, in-call chat, contact status
- **Document Chamber** — Upload, preview, e-signature pad, status labels (Draft / In Review / Signed)

### Week 3
- **Payments** — Wallet balance dashboard widget, Deposit/Withdraw/Transfer simulation, transaction history table
- **Security** — Password strength meter, 2FA OTP mockup, active session management
- **Guided Tour** — React Joyride 8-step walkthrough, auto-starts on first login

---

## Getting Started
```bash
git clone https://github.com/aounraza379/Nexus.git
cd Nexus
npm install
npm run dev
```

Visit `http://localhost:5173`

### Demo Accounts
- **Entrepreneur Demo** — via login page
- **Investor Demo** — via login page

---

## Project Structure
```
src/
├── pages/
│   ├── calendar/      # Meeting calendar (Week 1)
│   ├── video/         # Video call UI (Week 2)
│   ├── documents/     # Document chamber (Week 2)
│   ├── payments/      # Payments & wallet (Week 3)
│   ├── security/      # Security & 2FA (Week 3)
│   └── dashboard/     # Enhanced with wallet + tour
├── components/
│   └── layout/        # Sidebar with all Phase 2 nav
└── index.css          # Design tokens (--nexus-*)
```

---

## Deployment

Deployed on **Vercel** — auto-deploys on `git push origin main`.
```bash
npx vercel --prod
```