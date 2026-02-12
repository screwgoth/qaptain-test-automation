# 🧪 Qaptain Test Automation Platform

**Version:** 1.0.0 (Phase 1)  
**Status:** In Development

Modern test automation platform built with Playwright, React, TypeScript, and AI capabilities (coming in Phase 2).

---

## 🚀 What is Qaptain?

Qaptain (Quality Captain) is a **centralized test automation platform** that helps teams manage and execute Playwright-based browser tests across multiple applications. It provides:

✅ **Multi-App Management** - Test unlimited web applications from one dashboard  
✅ **Test Recorder** - Built-in Playwright Inspector for no-code test creation  
✅ **Parallel Execution** - Run tests concurrently across browsers  
✅ **Real-Time Reporting** - Live test results with screenshots and videos  
✅ **CI/CD Ready** - Webhook triggers, API integration, quality gates  
✅ **Modern Stack** - TypeScript, React, Prisma, BullMQ, Playwright

**Future (Phase 2+):** AI test generation, self-healing tests, natural language interface

---

## 📋 Phase 1 Features (Current)

### Core Platform
- 🏗️ **Monorepo structure** (backend + frontend)
- 💾 **PostgreSQL + Prisma ORM** for database
- ⚡ **Redis + BullMQ** for job queue
- 🔐 **JWT Authentication** (users, roles, sessions)
- 🎭 **Playwright Integration** (Chromium, Firefox, WebKit)
- 📡 **WebSocket** for real-time updates

### Apps & Test Management
- 📱 **Apps CRUD** (create, read, update, delete)
- 🌍 **Environments** (dev, staging, production)
- 🗂️ **Test Suites** (organize tests by type)
- 📄 **Test File Upload** (drag-and-drop, bulk upload)
- ✏️ **Test Recorder** (Playwright Inspector integration - coming soon)

### Test Execution
- ▶️ **Run tests** manually, scheduled, or via webhook
- 🔄 **Parallel execution** with configurable workers
- 🔁 **Auto-retry** on failures
- 📸 **Screenshots** on failure
- 🎥 **Video recording** on failure
- 📊 **Real-time progress** via WebSocket

### Reporting & Analytics
- 📈 **Test run reports** (pass/fail, duration, details)
- 📉 **Historical trends** (pass rate over time)
- 🐛 **Failure details** (screenshots, videos, stack traces)
- 📬 **Notifications** (Slack, email - coming soon)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | PostgreSQL 16 + Prisma ORM |
| **Queue** | BullMQ + Redis |
| **Browser Automation** | Playwright |
| **Real-Time** | Socket.IO |
| **Deployment** | Docker + Docker Compose |

---

## 📦 Project Structure

```
qaptain-test-automation/
├── backend/                 # Express API
│   ├── src/
│   │   ├── config/         # Configuration (database, logger)
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, error handling
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── workers/        # BullMQ workers
│   │   └── index.ts        # Entry point
│   ├── prisma/             # Database schema & migrations
│   └── package.json
│
├── frontend/               # React UI
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API clients
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript types
│   │   ├── styles/         # CSS (Tailwind)
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   └── package.json
│
├── docs/                   # Documentation
│   └── PRD.md              # Product requirements
│
├── docker-compose.yml      # PostgreSQL + Redis setup
└── package.json            # Root workspace config
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ (LTS)
- **npm** 10+
- **Docker** 24+ (for PostgreSQL & Redis)

### Installation

1. **Clone the repository**
   ```bash
   cd /path/to/qaptain-test-automation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Docker services** (PostgreSQL + Redis)
   ```bash
   npm run docker:up
   ```

4. **Setup database**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   # In root directory
   npm run dev
   ```

   This starts:
   - Backend API: http://localhost:3000
   - Frontend UI: http://localhost:5173

6. **Login**
   - Open http://localhost:5173
   - Use demo credentials:
     - Email: `demo@qaptain.app`
     - Password: `demo123`

---

## 📖 Detailed Setup

See [SETUP.md](./SETUP.md) for detailed installation and configuration instructions.

---

## 🧑‍💻 Development

### Run Backend Only
```bash
npm run dev:backend
```

### Run Frontend Only
```bash
npm run dev:frontend
```

### Build for Production
```bash
npm run build
```

### Database Commands
```bash
npm run db:migrate      # Run migrations
npm run db:seed         # Seed database
npm run db:studio       # Open Prisma Studio (GUI)
```

### Run Test Worker
```bash
cd backend
npm run worker
```

---

## 🔐 Default Users (Seeded)

| Email | Password | Role |
|-------|----------|------|
| admin@qaptain.app | admin123 | ADMIN |
| demo@qaptain.app | demo123 | USER |

**⚠️ Change these passwords in production!**

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Apps
- `POST /api/apps` - Create app
- `GET /api/apps` - List apps
- `GET /api/apps/:id` - Get app details
- `PUT /api/apps/:id` - Update app
- `DELETE /api/apps/:id` - Delete app

### Test Suites
- `POST /api/test-suites` - Create test suite
- `GET /api/test-suites` - List test suites
- `POST /api/test-suites/:id/files` - Upload test file

### Test Runs
- `POST /api/test-runs` - Create test run
- `GET /api/test-runs` - List test runs
- `GET /api/test-runs/:id` - Get run details
- `GET /api/test-runs/:id/results` - Get test results

### Reports
- `GET /api/reports/:runId` - Get test run report
- `GET /api/reports/analytics/trends` - Get historical trends

---

## 🐳 Docker Setup

The project uses Docker Compose for PostgreSQL and Redis:

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

---

## 🛠️ Environment Variables

Backend (`.env`):
```env
DATABASE_URL="postgresql://qaptain:password@localhost:5432/qaptain_db"
REDIS_HOST="localhost"
REDIS_PORT=6379
PORT=3000
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"
```

See `backend/.env.example` for all options.

---

## 📝 Git Branching Strategy

- **master** - Production branch (DO NOT COMMIT DIRECTLY)
- **dev** - Development integration branch
- **feature/*** - Feature branches (all work happens here)

**Workflow:**
1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push to GitHub: `git push origin feature/my-feature`
4. Merge to dev: `git checkout dev && git merge feature/my-feature`
5. User manually merges dev → master

---

## 🗺️ Roadmap

### ✅ Phase 1 (Current) - Foundation
- [x] Project setup & monorepo structure
- [x] Database schema & Prisma
- [x] Authentication system (JWT)
- [x] Apps & test suite management
- [x] Test file upload
- [x] BullMQ job queue
- [x] Playwright integration
- [x] Real-time updates (WebSocket)
- [ ] Test recorder UI (Playwright Inspector)
- [ ] CI/CD webhooks
- [ ] Notifications (Slack, email)

### 🔮 Phase 2 (Future) - AI Features
- [ ] AI test generation (point at URL → generate tests)
- [ ] Self-healing tests (auto-fix broken selectors)
- [ ] Natural language interface ("Run smoke tests on staging")
- [ ] AI insights and recommendations

### 🚀 Phase 3 (Future) - Advanced
- [ ] Visual regression testing
- [ ] Performance testing (Lighthouse)
- [ ] Accessibility testing (WCAG)
- [ ] Multi-user workflows
- [ ] API + UI hybrid testing

---

## 🤝 Contributing

This is currently a private project. Contribution guidelines coming soon.

---

## 📄 License

MIT

---

## 🆘 Support

For issues or questions:
- Check [SETUP.md](./SETUP.md) for troubleshooting
- Review [docs/PRD.md](./docs/PRD.md) for product details
- Open an issue on GitHub

---

**Built with ❤️ by ScrewMolt**

*Qaptain - Your Quality Captain for modern test automation*
