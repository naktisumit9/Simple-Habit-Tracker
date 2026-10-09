# Simple Habit Tracker

A minimal full-stack habit tracker designed for a 45-minute workshop.

Built with **React (Vite)** on the frontend and **Node.js (Express)** on the backend, featuring passwordless phone authentication using **OTP via the Minimoth API**.

---

## 🚀 Workshop Architecture & Constraints

To keep the project strictly focused and easy to complete within 45 minutes:

* **3 Frontend Pages**:
  1. `AuthPage`: Phone input + OTP verification via Minimoth
  2. `HabitsPage`: Today's habit tracker, streak counter, and completion toggle
  3. `NewHabitPage`: Add new habit with title and category presets
* **5 Backend API Endpoints**:
  1. `POST /api/auth/send-otp` — Request OTP to phone via Minimoth
  2. `POST /api/auth/verify-otp` — Verify OTP, register/log in user, issue session token
  3. `GET /api/habits` — Get habits with today's status & streaks
  4. `POST /api/habits` — Create new habit
  5. `POST /api/habits/:id/toggle` — Toggle completion for today
* **3 Database Entities / Models**:
  1. `User` (`id`, `phone`, `name`, `createdAt`)
  2. `Habit` (`id`, `userId`, `title`, `category`, `createdAt`)
  3. `HabitLog` (`id`, `habitId`, `date`, `completedAt`)

---

## 🛠️ Prerequisites

* Node.js (v18+ or v20+)
* (Optional) [Minimoth Account](https://minimoth.dev) for live WhatsApp / SMS OTP delivery.

> **💡 Workshop Demo Fallback**: If you do not have a live Minimoth API key configured yet, the backend will automatically enter **Demo Mode**. You can request an OTP and verify instantly using the demo code `123456`.

---

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

Configure environment variables:
```bash
# Windows PowerShell
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

Edit `backend/.env` with your Minimoth API key:
```env
PORT=5000
JWT_SECRET=workshop_super_secret_key_123
MINIMOTH_API_KEY=your_minimoth_api_key_here
```

Start the backend server:
```bash
npm run dev
# or: npm start
```
*Backend runs on `http://localhost:5000`*

---

### 2. Frontend Setup

In a new terminal window:
```bash
cd frontend
npm install
```

Configure environment variables:
```bash
# Windows PowerShell
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

`frontend/.env` content:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 📱 How the Minimoth OTP Flow Works

1. User enters their phone number in E.164 format (e.g. `+919876543210`).
2. Backend calls `POST https://api.minimoth.dev/v1/otp/send` with header `X-Api-Key: MINIMOTH_API_KEY`.
3. Minimoth dispatches the OTP via WhatsApp with automatic SMS fallback.
4. User enters the 6-digit code received.
5. Backend calls `POST https://api.minimoth.dev/v1/otp/verify`. Upon verification, the user is registered or logged in, and a JWT session token is returned.

---

## 📂 Project Structure

```text
simple-habit-tracker/
├── backend/
│   ├── data/             # Local database storage (db.json)
│   ├── src/
│   │   ├── db.js         # 3 Entities: User, Habit, HabitLog + Streaks
│   │   ├── minimoth.js   # Minimoth API integration + demo fallback
│   │   └── server.js     # Express server with exactly 5 endpoints
│   ├── .env
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx       # Page 1: Phone + OTP Login/Register
│   │   │   ├── HabitsPage.jsx     # Page 2: Today's Habits & Streaks
│   │   │   └── NewHabitPage.jsx   # Page 3: Create Habit
│   │   ├── App.jsx                # Page switcher & session state
│   │   ├── api.js                 # API requests helper
│   │   ├── index.css              # Custom minimalist styling
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```

