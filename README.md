# Qaptain Test Automation Platform

**Modern Browser Automation for Multiple Web Applications**

[![Status](https://img.shields.io/badge/status-active--development-brightgreen.svg)](https://github.com/screwgoth/qaptain-test-automation)
[![Version](https://img.shields.io/badge/version-2.1--PRD-orange.svg)](docs/PRD.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🎯 Vision

Qaptain (Quality Captain) is a centralized test automation platform that manages Playwright tests for multiple web applications, with a progressive roadmap to add AI-powered features over time.

**Phase 1 (Foundation):** Solid platform for managing and executing tests  
**Phase 2+ (AI Features):** Test generation, self-healing, natural language interface

## ✨ Phase 1 Features (Foundation + Test Recorder)

- 🌐 **Multi-App Platform** - Manage unlimited web applications from one dashboard
- 🎬 **Test Recorder** - Record tests by clicking through your app (no code required!)
- 📤 **Test Upload & Organization** - Upload Playwright tests, organize into suites
- ⚡ **Parallel Execution** - Run tests concurrently across browsers and workers
- 🔄 **Smart Retries** - Auto-retry failed tests with configurable strategies
- 📊 **Comprehensive Reporting** - Screenshots, videos, logs, historical trends
- 🔗 **CI/CD Integration** - Webhooks, API triggers, quality gates
- 🔔 **Notifications** - Slack, email alerts on pass/fail

## 🔮 Phase 2+ Features (Future - AI Powered)

- 🤖 **AI Test Generation** - Point at URL, get test suite
- 🔧 **Self-Healing Tests** - AI auto-fixes broken selectors
- 💬 **Natural Language Interface** - "Test login on staging"
- 📸 **Visual Regression** - AI-powered screenshot comparison
- 🎯 **Predictive Analytics** - Flaky test detection, insights

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS (nginx in production)
- **Backend**: Node.js 20 + Express + TypeScript
- **Database**: PostgreSQL 16 + Prisma ORM
- **Queue**: BullMQ + Redis 7
- **Browser**: Playwright
- **DevOps**: Docker + Docker Compose (fully containerized)

## 🚀 Quick Start

### Using Docker (Recommended)

**Prerequisites:**
- Docker & Docker Compose installed
- Ports 80, 3000, 5432, 6379 available

**Start Qaptain:**
```bash
git clone https://github.com/screwgoth/qaptain-test-automation.git
cd qaptain-test-automation
./start.sh
```

That's it! Qaptain will:
- Build all Docker images
- Start PostgreSQL, Redis, Backend, and Frontend
- Run database migrations automatically
- Seed demo users

**Access:**
- **Frontend UI:** http://localhost
- **Backend API:** http://localhost:3000

**Demo Login:**
- Email: `demo@qaptain.app`
- Password: `demo123`

**Stop Qaptain:**
```bash
./stop.sh
```

### Manual Setup (Development)

See [SETUP.md](SETUP.md) for detailed development setup instructions.

## 📚 Documentation

- **[PRD.md](docs/PRD.md)** - Complete Product Requirements Document
- **[SETUP.md](SETUP.md)** - Development setup guide
- **[DOCKER.md](DOCKER.md)** - Docker deployment guide
- **[API Documentation](#)** - Coming soon

## 🚧 Project Status

**Phase**: Active Development  
**PRD Version**: 2.1 (Pragmatic, Phase 1 with Test Recorder)  
**Current**: Week 1-2 Complete (Foundation + Database)  
**Next**: Week 3-4 (Core Features + Test Recorder)

## 🎯 Roadmap

- [x] PRD v2.1 Complete (Foundation + Test Recorder)
- [x] **Week 1-2: Foundation** ✅
  - [x] Monorepo structure (frontend + backend)
  - [x] Database schema + migrations (Prisma)
  - [x] Authentication system (JWT)
  - [x] Docker setup (PostgreSQL + Redis)
  - [x] BullMQ job queue
  - [x] Playwright integration
  - [x] Frontend foundation (React + Vite + Tailwind)
  - [x] **Full stack Dockerized** (nginx + Node.js)
  - [x] **Start/stop scripts**

- [ ] **Week 3-4: Core Features**
  - [ ] Apps management UI
  - [ ] Test suite management UI
  - [ ] Test file upload (drag & drop, bulk)
  - [ ] **Test recorder (Playwright Inspector integration)**
  - [ ] Enhanced test execution engine
  - [ ] Results storage (screenshots, videos)
  
- [ ] **Week 5-6: UI & Reporting**
  - [ ] Real-time test run page (WebSocket updates)
  - [ ] Results page (media viewer, analytics)
  - [ ] Historical trends & charts
  - [ ] CI/CD webhooks
  - [ ] Notifications (Slack, email)
  
- [ ] **Phase 2: AI Integration (Weeks 7-12)** - AI FEATURES
  - [ ] AI test generation (crawl URL → generate tests)
  - [ ] Self-healing tests (auto-fix selectors)
  - [ ] Natural language interface (chat)
  
- [ ] **Phase 3: Advanced (Weeks 13-18)** - OPTIONAL
  - [ ] Visual regression testing
  - [ ] Performance & accessibility testing
  - [ ] Advanced analytics and insights

## 🏛️ Architecture

```
┌─────────────────────────────────────────────┐
│  Browser → http://localhost                 │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Frontend (nginx)                           │
│  - React SPA                                │
│  - Proxies /api → backend                   │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Backend (Node.js + Express)                │
│  - REST API (25+ endpoints)                 │
│  - WebSocket (real-time updates)            │
│  - Playwright execution                     │
└─────────────────────────────────────────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│  PostgreSQL 16  │    │  Redis 7        │
│  - 10 tables    │    │  - Job queue    │
│  - Prisma ORM   │    │  - BullMQ       │
└─────────────────┘    └─────────────────┘
```

## 🤝 Contributing

This is currently a private project. Contributions will be opened after initial release.

### Git Workflow

- `master` - Production (manual merges only)
- `dev` - Development integration
- `feature/*` - Feature branches (all work happens here)

**Branch Strategy:**
1. Create feature branch from `dev`
2. Commit frequently with descriptive messages
3. Push feature branch to GitHub
4. Merge to `dev` when complete
5. Manual merge `dev` → `master` for releases

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

Built with:
- [Playwright](https://playwright.dev/) - Browser automation
- [Prisma](https://www.prisma.io/) - Database ORM
- [BullMQ](https://docs.bullmq.io/) - Job queue
- [React](https://react.dev/) - Frontend framework
- [Express](https://expressjs.com/) - Backend framework

---

**Made with ❤️ by screwgoth**
