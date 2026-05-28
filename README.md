# 🔥 RoutineBoss

> **Duolingo + Habitica + Notion + Funny Life Coach** — Your ultimate habit & task manager

RoutineBoss is a feature-packed, offline-first habit and task manager with a hilarious AI motivation system, XP levels, achievement badges, and a productivity pet that judges you.

---

## ✨ Features

- **Daily Task Management** — Morning, Afternoon, Evening, Night sections
- **Habit Tracking** — Streaks, progress bars, 7-day mini calendar
- **Funny AI Motivation** — 100+ roast messages when you skip tasks
- **XP & Level System** — Earn XP, level up, unlock achievements
- **Pomodoro Timer** — Built-in focus sessions
- **Daily Journal** — Write your thoughts, earn XP
- **Mood Tracker** — Track your daily mood with calendar heatmap
- **Achievements** — 15 unlockable badges
- **Dark/Light Mode** — Dynamic backgrounds based on time of day
- **Voice Input** — Add tasks with your voice
- **Export/Import** — Full JSON backup support
- **EmailJS Reminders** — Email reminders for upcoming tasks
- **Productivity Pet** — Animated mascot that evolves with your level

---

## 🚀 Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/routineboss.git
cd routineboss
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📦 Deploy to GitHub Pages

1. Update `vite.config.js` — set `base` to your repo name:
   ```js
   base: '/YOUR-REPO-NAME/',
   ```

2. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Add to `package.json` scripts:
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

5. Enable GitHub Pages in repo Settings → Pages → Source: `gh-pages` branch

---

## 📧 EmailJS Setup (Optional)

1. Sign up at [emailjs.com](https://www.emailjs.com)
2. Create a service (Gmail, Outlook, etc.)
3. Create an email template with variables: `{{to_email}}`, `{{task_name}}`, `{{task_time}}`
4. Add your Service ID, Template ID, and Public Key in **Settings** inside the app

---

## 🛠 Tech Stack

| Tech | Purpose |
|------|---------|
| React 18 | UI Framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Recharts | Charts |
| @hello-pangea/dnd | Drag & drop |
| EmailJS | Email reminders |
| canvas-confetti | Confetti effect |
| uuid | Unique IDs |
| localStorage | Data persistence |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/     # Dashboard component
│   ├── modals/        # Task modal
│   └── ui/            # Sidebar, XPBar, Confetti, Mascot, Notification
├── context/           # AppContext (global state)
├── data/              # Messages, categories, achievements
├── hooks/             # Custom hooks (pomodoro, voice, clock)
├── pages/             # All page components
└── utils/             # localStorage utilities
```

---

## 🧠 Motivation System

- **Roast Mode** 🔥 — Brutal, funny messages when tasks are skipped
- **Friendly Mode** 🤗 — Supportive, encouraging messages

Each category (coding, fitness, study, meditation, etc.) has 15+ unique messages.

---

Made with ❤️, caffeine, and way too many motivational quotes.
