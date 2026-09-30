# 🏆 Tournament Organizer

A fast, lightweight web platform for organizing, hosting, and tracking competitive tournaments across eSports and sports. Built with **Next.js 16 (App Router)**, **TypeScript**, **MongoDB Atlas (Mongoose)**, and **Tailwind CSS**.

---

## ✨ Key Features

- **🏆 Dynamic Bracket Engine**:
  - **Single Elimination** (Automatic bracket generation & progression)
  - **Double Elimination** (Winners & Losers bracket tracking)
  - **Round Robin** (Points table, wins/draws/losses)
  - **Group Stage + Knockout** (Custom groups & playoff qualification)

- **👤 Zero-Friction Guest Identity System**:
  - **No Password/Email Required**: Quick onboarding by selecting a username.
  - **Cookie-Based Sessions**: Fast identity persistence using secure HTTP cookies (`arena_uid` & `arena_name`) backed by MongoDB.
  - **Tournament Host Distinction**: Creator-based authorization for tournament hosts.

- **⚡ Realtime Match Management**:
  - Dynamic score reporting and match verification
  - Automated bracket advancement upon match completion
  - System and browser notification center

- **📊 Leaderboards & Player Stats**:
  - Global rankings calculated from tournament placements
  - Win/Loss rates, total matches played, and history tracking

- **🎨 Modern Dark UI**:
  - Sleek dark/light theme switcher powered by `next-themes`
  - Responsive layout optimized for mobile and desktop

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) with Mongoose ODM (No SQL/Supabase runtime dependency)
- **Authentication**: Cookie-based Guest Identity (`cookies()` + MongoDB User store)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Lucide Icons
- **Testing**: [Vitest](https://vitest.dev/) (Unit tests) & [Playwright](https://playwright.dev/) (E2E tests)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.x or later
- **npm**: v9.x or later
- **MongoDB**: Atlas Cluster URI or local MongoDB instance (`localhost:27017`)

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
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/tournament-organizer?retryWrites=true&w=majority

# App Secrets
JWT_SECRET=dev-jwt-secret-min32chars
CRON_SECRET=dev-cron-secret
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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
│   ├── app/              # App Router Pages & API Routes
│   ├── components/       # UI Components & Layouts
│   ├── hooks/            # Custom React Hooks (Realtime, Notifications)
│   ├── lib/              # MongoDB Models, Bracket Algorithms & Guest Auth
│   └── providers/        # Theme & App Providers
├── tests/                # Vitest & Playwright Test Suites
└── public/               # Static Assets & Service Worker
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
