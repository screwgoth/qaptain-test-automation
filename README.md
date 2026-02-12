# Qaptain Test Automation Platform

**Modern Browser Automation for Multiple Web Applications**

[![Status](https://img.shields.io/badge/status-planning-blue.svg)](https://github.com/screwgoth/qaptain-test-automation)
[![Version](https://img.shields.io/badge/version-2.0--PRD-orange.svg)](docs/PRD.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🎯 Vision

Qaptain (Quality Captain) is a centralized test automation platform that manages Playwright tests for multiple web applications, with a progressive roadmap to add AI-powered features over time.

**Phase 1 (Foundation):** Solid platform for managing and executing tests  
**Phase 2+ (AI Features):** Test generation, self-healing, natural language interface

## ✨ Phase 1 Features (No AI - Foundation)

- 🌐 **Multi-App Platform** - Manage unlimited web applications from one dashboard
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

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js 20 + Express + TypeScript
- **Database**: PostgreSQL 16 + Prisma ORM
- **Queue**: BullMQ + Redis
- **Browser**: Playwright
- **AI**: OpenClaw + Claude
- **DevOps**: Docker + Docker Compose

## 📚 Documentation

- [**Product Requirements Document**](docs/PRD.md) - Complete technical specification
- More docs coming as we build...

## 🚧 Project Status

**Phase**: Planning & Design  
**PRD Version**: 2.0 (Pragmatic, Phase 1 without AI)  
**Next**: Begin Phase 1 Development

## 🎯 Roadmap

- [x] PRD v2.0 Complete (Realistic, foundation-first approach)
- [ ] **Phase 1: Foundation (Weeks 1-6)** - NO AI
  - [ ] Multi-app management
  - [ ] Test file upload & organization
  - [ ] Playwright execution engine (parallel, retries)
  - [ ] Reporting and analytics
  - [ ] CI/CD integration (webhooks, API)
  - [ ] UI (Dashboard, Apps, Runs, Reports)
  
- [ ] **Phase 2: AI Integration (Weeks 7-12)** - AI FEATURES
  - [ ] AI test generation (crawl URL → generate tests)
  - [ ] Self-healing tests (auto-fix selectors)
  - [ ] Natural language interface (chat)
  
- [ ] **Phase 3: Advanced (Weeks 13-18)** - OPTIONAL
  - [ ] Visual regression testing
  - [ ] Performance & accessibility testing
  - [ ] Advanced analytics and insights

## 🤝 Contributing

This is currently a private project. Contributions will be opened after initial release.

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

**Made with ❤️ by screwgoth**
