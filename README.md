# 💎 SplitEase — Modern Expense Splitting

[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2.2-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)
[![Expo](https://img.shields.io/badge/Expo-SDK-000020?logo=expo)](https://expo.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**SplitEase** is a premium, production-grade cost-splitting application designed for seamless group expense management. Featuring a stunning **glassmorphic UI**, a **greedy settlement engine**, and **full-stack mobile/web integration**, it's the ultimate tool for friends, families, and travel buddies.

---

## ✨ Features

### 🎨 Premium Glassmorphic UI
- **Modern Aesthetic**: Built with a custom design system featuring glassmorphism, dynamic animations, and curated color tokens.
- **Responsive Dashboard**: Fully optimized for desktops and mobile browsers with consistent branding.
- **Micro-interactions**: Enhanced UX with Framer Motion transitions and Lucide icons.

### 🧠 Smart Settlement Engine
- **Greedy Algorithm**: Automatically calculates the minimum number of transactions required to settle all debts in a group.
- **Multi-Split Support**: Split expenses equally or assign custom amounts/percentages to specific members.
- **Settlement Recommendations**: Real-time advice on "who owes whom" with one-tap settlement recording.

### 📊 Comprehensive Management
- **Group Creation Wizard**: Easily create groups, add members, and manage roles.
- **Receipt Management**: Upload and track receipts for every expense via the integrated file upload API.
- **Activity Feed**: A real-time audit trail of all expense creations, edits, and settlements.
- **Invitation System**: Invite friends to join your groups via email (Nodemailer integration).

### 🚀 Cross-Platform Ready
- **Next.js Web App**: High-performance frontend and backend API.
- **Expo Mobile App**: Native iOS and Android experience with shared business logic.

---

## 🛠️ Technology Stack

### Web & Backend (Next.js)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (Modern design tokens)
- **Animations**: [Framer Motion 12](https://www.framer.com/motion/)
- **Auth**: [NextAuth.js 4](https://next-auth.js.org/)
- **Database**: [Prisma ORM](https://www.prisma.io/) with SQLite (Dev) / PostgreSQL (Prod)
- **Icons**: [Lucide React](https://lucide.dev/)

### Mobile (React Native)
- **Framework**: [Expo SDK](https://expo.dev/)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Network**: Axios with centralized API client

---

## 📂 Project Structure

```bash
SplitEase/
├── web/              # Next.js Full-Stack Application
│   ├── app/          # App Router (Pages, API, Layouts)
│   ├── prisma/       # Database Schema & Migrations
│   ├── lib/          # Balance Algorithms & Utilities
│   └── components/   # Glassmorphic UI Component Library
└── mobile/           # Expo Native Mobile Application
    ├── app/          # Navigation Screens (Expo Router)
    ├── api/          # Shared API Integration
    └── components/   # Cross-platform Mobile Components
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20 or higher
- **npm**: v10 or higher

### 2. Installation & Setup

#### Web App
```bash
cd web
npm install
npm run db:push     # Initialize local SQLite database
npm run dev         # Start web server at http://localhost:3000
```

#### Mobile App
```bash
cd mobile
npm install
npm run start       # Start Expo Development Server
```
*Tip: Press `w` in the Expo terminal for a web preview, or scan the QR code with [Expo Go](https://expo.dev/expo-go).*

---

## 📡 Core API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/users` | `GET` / `POST` | Manage user profiles and registration |
| `/api/groups` | `GET` / `POST` | Create and list expense groups |
| `/api/groups/:id/balances` | `GET` | Fetch real-time debt calculations |
| `/api/groups/:id/expenses` | `POST` | Add new expenses with split logic |
| `/api/upload` | `POST` | Handle receipt image uploads |

---

## 🗺️ Roadmap

- [x] **Phase 1**: Glassmorphic UI & Core Greedy Algorithm.
- [x] **Phase 2**: Mobile App Prototype (Expo).
- [ ] **Phase 3**: Integration of Stripe/Payment APIs.
- [ ] **Phase 4**: Production Database Migration (PostgreSQL).
- [ ] **Phase 5**: Advanced Analytics & Recurring Expenses.

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

> Built with ❤️ by the SplitEase Team. Elevate your expense splitting experience.
