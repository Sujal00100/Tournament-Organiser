# 🏆 Tournament Organizer

A modern, full-featured web platform for organizing, hosting, and tracking competitive tournaments across eSports and sports. Built with **Next.js 16 (App Router)**, **TypeScript**, **MongoDB Atlas**, **Supabase**, and **Tailwind CSS**.

---

## ✨ Features

- **🏆 Bracket & Tournament Engine**:
  - **Single Elimination** (Automatic seeding & progression)
  - **Double Elimination** (Winner & Loser brackets)
  - **Round Robin** (Points table, wins/draws/losses)
  - **Group Stage + Knockout** (Custom groups & playoff qualification)

- **👤 Auth & User Roles**:
  - Host vs. Player roles
  - Quick Guest demo login
  - User profiles with custom avatars & handles

- **⚡ Realtime Match Management**:
  - Dynamic score updates & winner declaration
  - Automated bracket progression upon match completion
  - System & Web Push notifications for upcoming matches

- **📊 Leaderboards & Analytics**:
  - Global player rankings based on tournament performance
  - Win/Loss rates, total matches played, and history tracking

- **🛡️ Admin & Moderation**:
  - Host controls for dispute resolution & score overrides
  - Detailed Audit Logging for administrative actions

- **🎨 Modern Responsive UI**:
  - Sleek dark/light theme support powered by `next-themes`
  - Fully mobile-responsive layout built with Tailwind CSS & Shadcn UI

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Mongoose ODM) & [Supabase](https://supabase.com/) (SQL Migrations & RLS)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Lucide Icons
- **Testing**: [Vitest](https://vitest.dev/) (Unit tests) & [Playwright](https://playwright.dev/) (E2E tests)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.x or later
- **npm**: v9.x or later
- **MongoDB**: Atlas Cluster URI or local MongoDB instance

---

### 1. Clone the Repository

```bash
git clone https://github.com/Sujal00100/Tournament-Organiser.git
cd Tournament-Organiser
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/tournament-organizer?retryWrites=true&w=majority

# Secret Keys
JWT_SECRET=your-32-character-secret-key-here
CRON_SECRET=your-cron-secret-key-here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## 🧪 Running Tests

- **Run Unit Tests (Vitest)**:
  ```bash
  npm run test:unit
  ```

- **Run End-to-End Tests (Playwright)**:
  ```bash
  npx playwright test
  ```

---

## 📁 Project Structure

```text
├── src/
│   ├── actions/          # Next.js Server Actions (Auth, Tournaments, Matches, Admin)
│   ├── app/              # Next.js App Router Pages & API Routes
│   ├── components/       # UI Components & Layouts (Header, Sidebar, Modals)
│   ├── hooks/            # Custom React Hooks (Realtime, Auth, Notifications)
│   ├── lib/              # Database Models, Bracket Algorithms & Utilities
│   └── providers/        # React Context Providers (Theme, Auth, Notifications)
├── supabase/             # Database SQL Migrations & RLS Policies
├── tests/                # Unit & E2E Test Suites
└── public/               # Static Assets & Service Workers
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
