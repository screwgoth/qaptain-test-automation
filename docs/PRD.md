# Qaptain Test Automation Platform - Product Requirements Document

**Version:** 2.1  
**Date:** 2026-02-12  
**Author:** ScrewMolt  
**Status:** Draft - Revised with pragmatic Phase 1 + Test Recorder  
**Purpose:** Progressive test automation platform - foundation first, AI later

---

## 1. Executive Summary

**Qaptain** (Quality Captain) is a modern test automation platform that centralizes Playwright-based browser testing for multiple web applications. It provides a clean UI for managing tests, executing them in parallel across browsers, and analyzing results - with a roadmap to add AI-powered features (test generation, self-healing) in future phases.

**Phase 1 Value Propositions:**
- **Multi-App Platform**: Manage and test unlimited web applications from one dashboard
- **Test Recorder**: Built-in Playwright Inspector - record tests by clicking through your app (no code required)
- **Playwright Integration**: Leverage modern, reliable browser automation (Chromium, Firefox, WebKit)
- **Parallel Execution**: Run tests concurrently across multiple browsers and workers
- **Centralized Reporting**: All test results, screenshots, and videos in one place
- **CI/CD Ready**: Webhook triggers, API integration, quality gates
- **Developer-Friendly**: TypeScript support, modern UI, fast setup, code or no-code options

**Future Vision (Phase 2+):**
- AI test generation (point at URL → generate tests)
- Self-healing tests (auto-fix broken selectors)
- Natural language interface ("Test login on staging")
- Visual regression with AI analysis
- Predictive failure detection

**Target Market:**
- Development teams needing centralized test management
- Companies with multiple web applications
- DevOps teams wanting quality gates in CI/CD
- Teams transitioning from Selenium to Playwright
- Startups needing fast, reliable testing without SDET overhead

---

## 2. Problem Statement

### Current Pain Points in Test Automation

**Traditional Selenium + Manual SDET Approach:**
- ❌ Requires dedicated SDET engineers (expensive, hard to hire)
- ❌ Tests break on every UI change (maintenance nightmare)
- ❌ Writing tests is slow (days/weeks for comprehensive coverage)
- ❌ Flaky tests waste CI/CD time
- ❌ No intelligence - tests don't adapt or learn
- ❌ Complex test frameworks require training
- ❌ Managing tests across multiple apps is fragmented

**What Teams Need (Phase 1 Focus):**
- ✅ Centralized platform for all web apps
- ✅ Easy test creation (record tests, no code required)
- ✅ Modern, reliable test framework (Playwright > Selenium)
- ✅ Parallel execution for faster feedback
- ✅ Easy test management (upload, organize, version)
- ✅ CI/CD integration out of the box
- ✅ Clear reporting with screenshots and videos
- ✅ Fast setup (5 minutes per app)

**Future Needs (Phase 2+):**
- 🔮 Automated test generation
- 🔮 Self-healing tests
- 🔮 AI-powered insights

---

## 3. Goals & Objectives

### Primary Goals (Phase 1)

1. **Multi-App Testing Platform**
   - Manage unlimited web applications from one dashboard
   - Centralized test execution and reporting
   - Organize tests by app, suite, and environment

2. **Reliable Test Execution**
   - Parallel execution across browsers and workers
   - Built-in retries and error handling
   - Support for headless and headed modes
   - Screenshot and video capture on failures

3. **Developer-Friendly**
   - 5-minute setup per app
   - Upload existing Playwright tests or write new ones
   - TypeScript/JavaScript support
   - Git integration for test versioning

4. **CI/CD Integration**
   - Webhook triggers (GitHub, GitLab, Jenkins)
   - REST API for programmatic access
   - Quality gates (block deploys on test failures)
   - Slack/email notifications

5. **Production-Grade Quality**
   - 99.9% platform uptime
   - Fast execution (parallel workers)
   - Secure credential storage
   - Comprehensive audit logs

### Future Goals (Phase 2+)

6. **AI Test Generation** - Point at URL, get test suite
7. **Self-Healing Tests** - Auto-fix broken selectors
8. **Natural Language Interface** - Chat-based test execution
9. **Visual Regression** - AI-powered screenshot comparison
10. **Predictive Analytics** - AI identifies flaky tests and trends

### Success Metrics

| Metric | Phase 1 Target |
|--------|----------------|
| Setup time (new app) | < 5 minutes |
| Test upload time | < 1 minute for 50 tests |
| Test execution speed | < 30 min for 100 tests (parallel) |
| Platform uptime | 99.9% |
| API response time (p95) | < 200ms |
| False positive rate | < 5% |
| User satisfaction (NPS) | > 40 |

**Phase 2+ Metrics (Future):**
| Metric | Target |
|--------|--------|
| AI test generation time | < 10 minutes per app |
| Self-healing success rate | > 80% |
| Test maintenance reduction | > 70% |

---

## 4. Target Users

| User Type | Description | Primary Needs |
|-----------|-------------|---------------|
| **Developer** | Writes code, needs quality gate | Fast feedback, reliable tests, minimal setup |
| **DevOps Engineer** | Manages CI/CD pipelines | Integration, parallel execution, reporting |
| **QA Engineer** | Ensures quality | Comprehensive coverage, easy test creation |
| **Engineering Manager** | Oversees quality | Metrics, trends, cost reduction |
| **Startup Founder** | Building MVP fast | Zero learning curve, works out of the box |

---

## 5. Features & Roadmap

### 5.1 Phase 1 Features (Foundation - Weeks 1-6)

#### F1: Multi-App Management

**Description:** Centralized dashboard to manage multiple web applications and their test suites

**Features:**
- **App CRUD:**
  - Add/edit/delete web applications
  - Name, description, URLs (dev/staging/prod)
  - App tags/categories (e.g., "internal tools", "customer-facing")
  - App status (active/archived)

- **Environment Configuration:**
  - Multiple environments per app (dev, staging, production)
  - Environment-specific base URLs
  - Environment variables (API keys, etc.)

- **Authentication Setup:**
  - Authentication type selection:
    - None (public app)
    - Basic Auth (username/password)
    - Cookie-based (upload cookies.json)
    - Custom headers (API keys, tokens)
  - Secure credential storage (encrypted at rest)
  - Credential testing (verify before saving)

**UI:**
- **Apps Dashboard:**
  - Grid/list view of all apps
  - Each card shows: name, last run status, pass rate, environment count
  - Quick actions: Run tests, View reports, Configure
  - Search and filter (by tag, status, pass rate)

- **App Detail Page:**
  - Overview tab (app info, quick stats)
  - Environments tab (manage dev/staging/prod configs)
  - Test suites tab (list of test suites)
  - Reports tab (execution history)
  - Settings tab (configuration)

---

#### F2: Test Suite Management

**Description:** Organize and manage Playwright tests within each application

**Features:**
- **Suite CRUD:**
  - Create/edit/delete test suites
  - Suite name, description, type (smoke/regression/custom)
  - Assign tests to suites

- **Test File Upload:**
  - Drag-and-drop or browse to upload
  - Supports `.spec.ts`, `.test.ts`, `.spec.js`, `.test.js`
  - Bulk upload (zip file with multiple tests)
  - Automatic test discovery (scans for Playwright test files)

- **Test Organization:**
  - Folder structure (mirrors uploaded structure)
  - Tagging system (smoke, regression, critical, etc.)
  - Test dependencies (run test A before test B)
  - Enable/disable individual tests

- **Version Control:**
  - Git integration (connect to GitHub/GitLab repo)
  - Pull tests automatically from repo
  - Track test changes over time
  - Rollback to previous test versions

**Test Metadata:**
- Test name, description, author
- Tags (smoke, regression, p0, p1, etc.)
- Estimated duration
  - Browser compatibility flags
  - Environment requirements

**UI:**
- **Test Suites Page:**
  - List of suites with test counts
  - Run entire suite button
  - Edit suite settings

- **Suite Detail Page:**
  - File tree view of tests
  - Individual test cards with metadata
  - Run selected tests button
  - Bulk actions (enable/disable, tag, delete)

---

#### F3: Test Recorder (Playwright Inspector Integration)

**Description:** Built-in test recorder that allows users to create tests by interacting with their web app - no code writing required

**How It Works:**
1. User clicks "Record New Test" button in UI
2. Platform launches Playwright Inspector in headed mode
3. User navigates to app URL and interacts:
   - Click buttons, links, elements
   - Type into input fields
   - Select dropdowns
   - Verify text and elements
4. Playwright Inspector generates test code automatically (TypeScript/JavaScript)
5. User reviews generated code
6. User saves test to suite with name and tags

**Playwright Inspector Features:**
- **Record Mode:** Capture user interactions as test code
- **Explore Mode:** Inspect page elements and generate selectors
- **Assert Mode:** Add assertions (text visible, element present, etc.)
- **Locator Generator:** Auto-generate robust selectors (prefer data-testid, then text, then CSS)
- **Code Preview:** Real-time test code generation
- **Step-by-Step Recording:** Pause, resume, undo steps

**Integration with Qaptain:**
- Launch recorder from app detail page
- Pre-configure with app URL and auth
- Auto-inject authentication (cookies, headers)
- Save generated tests directly to selected suite
- Edit test metadata (name, tags, description) before saving
- Option to run test immediately after recording

**UI Flow:**
```
1. Apps Page → Select App → "Record Test" button
2. Modal: Select suite, enter test name
3. Playwright Inspector opens (new window)
4. User records interactions
5. Click "Save" → code copied to Qaptain
6. Test saved to suite
7. Option: "Run Now" or "Save Only"
```

**Test Code Output:**
```typescript
import { test, expect } from '@playwright/test';

test('User can login with valid credentials', async ({ page }) => {
  // Generated by Qaptain Test Recorder
  await page.goto('https://myapp.com/login');
  await page.fill('[data-testid="email"]', 'user@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('button:has-text("Sign In")');
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('h1')).toContainText('Welcome');
});
```

**Benefits:**
- ✅ No coding required for basic tests
- ✅ Faster test creation than manual writing
- ✅ Learn Playwright selectors by example
- ✅ Reduces barrier to entry for non-developers
- ✅ Good foundation before AI test generation (Phase 2)

**Limitations:**
- Recording works best for simple flows (login, forms, navigation)
- Complex scenarios (conditional logic, loops) still need manual coding
- Generated code may need refinement for edge cases
- AI test generation (Phase 2) will handle complex scenarios better

---

#### F4: Test Execution Engine

**Description:** Reliable test runner with parallel execution and robust error handling

**Features:**
- **Execution Modes:**
  - Manual (run now via UI)
  - Scheduled (cron-based, e.g., "Daily at 2 AM")
  - CI/CD triggered (webhook from GitHub/GitLab)
  - API-triggered (programmatic execution)

- **Parallel Execution:**
  - Run tests across multiple workers concurrently
  - Configurable worker count (default: 4, max: 20)
  - Resource management (CPU/memory limits per worker)
  - Queue management (BullMQ for job distribution)

- **Retry Logic:**
  - Auto-retry failed tests (configurable: 0-3 retries)
  - Exponential backoff between retries
  - Retry on specific error types (timeout, network)
  - Manual retry for individual tests from UI

- **Browser Support:**
  - Chromium (default)
  - Firefox
  - WebKit (Safari)
  - Mobile emulation (Chrome Mobile, Safari Mobile)
  - Headless mode (default for CI/CD)
  - Headed mode (for debugging)

- **Test Configuration:**
  - Per-suite settings (timeout, retries, browsers)
  - Environment selection (dev/staging/prod)
  - Screenshot capture (on failure, always, never)
  - Video recording (on failure, always, never)
  - Trace files for debugging

**Execution Flow:**
```
1. User triggers test run (manual/scheduled/webhook)
2. Job added to BullMQ queue
3. Worker picks up job
4. Playwright executes tests in parallel
5. Screenshots/videos captured on failures
6. Results stored in database
7. Notification sent (Slack/email)
8. Report generated
```

**Run Configuration Options:**
```typescript
{
  app_id: "uuid",
  suite_ids: ["uuid1", "uuid2"], // or "all"
  environment: "staging", // dev/staging/prod
  browsers: ["chromium", "firefox"], // default: ["chromium"]
  workers: 4, // parallel workers
  retries: 2, // retry failed tests
  headless: true,
  screenshot: "on-failure", // on-failure/always/never
  video: "on-failure",
  timeout_ms: 30000 // per-test timeout
}
```

---

#### F5: Test Reporting & Analytics

**Description:** Comprehensive test results and historical analytics

**Features:**
- **Real-Time Run Dashboard:**
  - Active test runs with progress bars
  - Live log streaming (WebSocket updates)
  - Pass/fail count (updating in real-time)
  - Duration and ETA

- **Test Run Results Page:**
  - **Summary Section:**
    - Total tests, Passed, Failed, Skipped
    - Overall duration
    - Environment and browser info
    - Pass rate percentage
  
  - **Test Breakdown:**
    - List of all tests with status (✅/❌/⏭️)
    - Duration per test
    - Browser used
    - Retry count

  - **Failure Details:**
    - Error messages and stack traces
    - Screenshots (before failure)
    - Videos (full test recording)
    - Console logs
    - Network logs (optional)
    - Playwright trace files (for debugging)

- **Historical Analytics:**
  - **Trend Charts:**
    - Pass rate over time (line chart)
    - Test duration trends
    - Failure rate by browser
  
  - **Flaky Test Detection:**
    - Tests that pass/fail intermittently
    - Retry success rate
    - Flagging for review

  - **Performance Metrics:**
    - Average test duration
    - Suite execution time trends
    - Slowest tests identification

- **Export & Notifications:**
  - Download PDF report
  - Export to CSV
  - JSON API for programmatic access
  - Slack notifications (pass/fail, with links)
  - Email notifications (configurable)

**Report Structure:**
```
┌─────────────────────────────────────────────┐
│  Test Run Report - MyApp Staging            │
│  Run ID: abc-123 • Date: 2026-02-12 10:30  │
├─────────────────────────────────────────────┤
│  Summary:                                   │
│  ✅ Passed: 47 (94%)                        │
│  ❌ Failed: 3 (6%)                          │
│  ⏱️  Duration: 12m 34s                      │
│  🌐 Browser: Chromium                       │
├─────────────────────────────────────────────┤
│  Failed Tests:                              │
│  1. ❌ Login with invalid email             │
│     Duration: 2.3s                          │
│     Error: Timeout 30000ms exceeded         │
│     Screenshot: [View] Video: [Watch]      │
│                                             │
│  2. ❌ Checkout - Payment submission        │
│     Duration: 8.1s                          │
│     Error: Element not found: .btn-pay     │
│     Retries: 2/2 (both failed)             │
│     Screenshot: [View] Trace: [Download]   │
└─────────────────────────────────────────────┘
```

---

#### F6: CI/CD Integration

**Description:** Seamless integration with popular CI/CD platforms

**Features:**
- **Webhook Triggers:**
  - GitHub Actions
  - GitLab CI
  - Jenkins
  - CircleCI
  - Any webhook-compatible system

- **Quality Gates:**
  - Block deployment if smoke tests fail
  - Configurable pass threshold (e.g., 95%)
  - Different rules per environment

- **API Integration:**
  - REST API for triggering tests
  - Retrieve results programmatically
  - Update test configurations

- **Notifications:**
  - Slack, Discord, Teams, Email
  - Customizable message templates
  - @mention on failures

**GitHub Actions Example:**
```yaml
name: Qaptain Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Run Qaptain Smoke Tests
        run: |
          curl -X POST https://api.qaptain.app/v1/runs \
            -H "Authorization: Bearer ${{ secrets.QAPTAIN_API_KEY }}" \
            -d '{"app_id": "myapp", "suite": "smoke"}'
      
      - name: Check Results
        run: |
          # Poll for results and exit with failure if tests fail
```

---

### 5.2 Phase 2 Features (AI-Powered Capabilities - Weeks 7-12)

#### F7: AI Test Generation

**Description:** AI agent analyzes a web app and automatically generates test scenarios

**How It Works:**
1. User provides app URL + auth credentials
2. AI crawls the application using browser tool
3. Analyzes HTML structure, identifies interactive elements
4. Generates Page Object Models (TypeScript classes)
5. Creates test scenarios based on common patterns
6. User reviews and approves generated tests

**Generated Artifacts:**
- Page Object Models
- Test scenarios (Playwright tests)
- Test data fixtures

**Example:**
```
User: "Generate tests for https://myapp.com"
AI: "✅ Discovered 15 pages, generated 5 POMs, created 20 tests"
```

---

#### F8: Self-Healing Tests

**Description:** AI automatically fixes broken selectors when tests fail

**How It Works:**
1. Test fails due to missing/changed element
2. AI captures DOM snapshot and analyzes
3. Identifies similar elements using:
   - Text content matching
   - Visual position similarity
   - ARIA labels and semantic HTML
4. Tests new selector and updates test if successful

**Confidence Scoring:**
- High confidence (>90%): Auto-fix and notify
- Medium confidence (70-90%): Suggest fix, require approval
- Low confidence (<70%): Report failure, manual fix required

---

#### F9: Natural Language Interface

**Description:** Chat-based interface for test execution and management

**Commands:**
- "Run smoke tests on MyApp staging"
- "Test login flow with invalid credentials"
- "Show me all failed tests from last week"
- "Generate tests for the new checkout page"

**AI Understanding:**
- Parses intent
- Resolves app names
- Executes appropriate actions
- Provides natural language responses

---

### 5.3 Phase 3 Features (Advanced Capabilities - Weeks 13-18)

#### F10: Visual Regression Testing

**Description:** Screenshot comparison to detect unintended UI changes

**Features:**
- Baseline screenshot capture
- Pixel-by-pixel comparison
- Diff highlighting
- Approve/reject workflow

**AI Enhancements (Future):**
- Ignore dynamic content (timestamps, ads)
- Detect layout shifts vs content changes

---

#### F11: Performance Testing

**Description:** Measure and monitor web performance metrics

**Metrics:**
- Page load time
- Time to interactive
- Largest contentful paint (LCP)
- Cumulative layout shift (CLS)
- Network waterfall analysis

**Integration:**
- Lighthouse integration
- Performance budgets
- Trend tracking over time

---

#### F12: Accessibility Testing

**Description:** Automated WCAG compliance checks

**Features:**
- WCAG 2.1 Level AA compliance
- Keyboard navigation testing
- Screen reader compatibility
- Color contrast validation
- Axe-core integration

---

#### F13: Multi-User Workflows

**Description:** Simulate concurrent users for collaboration and race condition testing

**Use Cases:**
- Concurrent logins
- Real-time collaboration features
- Chat/messaging systems
- Locking and race conditions

---

#### F14: API + UI Hybrid Testing

**Description:** Combine API calls with UI interactions for faster setup

**Example:**
```
1. Create user via API (fast)
2. Login via UI (realistic)
3. Verify dashboard via UI
```

**Benefits:**
- Faster test execution
- Better data setup
- Realistic end-to-end flows

---

## 6. Technical Architecture

### 6.1 Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React + TypeScript + Vite | 18.x / 5.x |
| **Backend** | Node.js + Express + TypeScript | 20.x / 4.x |
| **Database** | PostgreSQL + Prisma ORM | 16.x / 5.x |
| **Queue** | BullMQ + Redis | Latest |
| **Browser Automation** | Playwright | Latest |
| **AI Agent** | OpenClaw + Claude | Latest |
| **Logging** | Winston | 3.x |
| **Monitoring** | Prometheus + Grafana | Latest |
| **Containerization** | Docker + Docker Compose | 24.x |

### 6.2 System Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    Qaptain Test Automation Platform            │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│                         Frontend (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │Dashboard │  │ Apps     │  │ Reports  │  │ Chat AI  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼ (REST API)
┌───────────────────────────────────────────────────────────────┐
│                      Backend API (Express)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │   Apps     │  │   Tests    │  │   Runs     │              │
│  │ Management │  │ Generation │  │ Execution  │              │
│  └────────────┘  └────────────┘  └────────────┘              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │  Reports   │  │    AI      │  │   Webhooks │              │
│  │ Analytics  │  │  Interface │  │   CI/CD    │              │
│  └────────────┘  └────────────┘  └────────────┘              │
└───────────────────────────────────────────────────────────────┘
                              │
                  ┌───────────┴───────────┐
                  ▼                       ▼
┌────────────────────────────┐  ┌────────────────────────────┐
│  PostgreSQL Database       │  │    Redis + BullMQ          │
│  - Apps                    │  │    - Test queue            │
│  - Test suites             │  │    - Job scheduling        │
│  - Test runs               │  │    - Worker management     │
│  - Results                 │  │                            │
│  - Page objects            │  │                            │
└────────────────────────────┘  └────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────────────────────┐
│                    Test Execution Workers                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Worker 1   │  │   Worker 2   │  │   Worker N   │       │
│  │  Playwright  │  │  Playwright  │  │  Playwright  │       │
│  │  + AI Agent  │  │  + AI Agent  │  │  + AI Agent  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└───────────────────────────────────────────────────────────────┘
                  │
                  ▼ (Tests web apps)
┌───────────────────────────────────────────────────────────────┐
│                 Target Web Applications                        │
│  [App 1]  [App 2]  [App 3]  ...  [App N]                     │
└───────────────────────────────────────────────────────────────┘
```

### 6.3 Data Model

**Core Entities:**

```sql
-- Applications
CREATE TABLE apps (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    staging_url VARCHAR(500),
    production_url VARCHAR(500),
    auth_type VARCHAR(50), -- 'none', 'basic', 'oauth', 'cookies', 'jwt'
    auth_credentials JSONB, -- Encrypted credentials
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Test Suites
CREATE TABLE test_suites (
    id UUID PRIMARY KEY,
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- 'smoke', 'regression', 'custom'
    config JSONB, -- Browser, timeout, retries, etc.
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Page Objects
CREATE TABLE page_objects (
    id UUID PRIMARY KEY,
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url_pattern VARCHAR(500),
    selectors JSONB, -- Element selectors
    code TEXT, -- Generated TypeScript class
    ai_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Test Scenarios
CREATE TABLE test_scenarios (
    id UUID PRIMARY KEY,
    suite_id UUID REFERENCES test_suites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code TEXT, -- Playwright test code
    ai_generated BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 1,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Test Runs
CREATE TABLE test_runs (
    id UUID PRIMARY KEY,
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    suite_id UUID REFERENCES test_suites(id) ON DELETE SET NULL,
    trigger VARCHAR(50), -- 'manual', 'scheduled', 'webhook', 'ai'
    status VARCHAR(50), -- 'queued', 'running', 'completed', 'failed'
    environment VARCHAR(50), -- 'dev', 'staging', 'production'
    total_tests INTEGER,
    passed INTEGER,
    failed INTEGER,
    skipped INTEGER,
    duration_ms INTEGER,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Test Results
CREATE TABLE test_results (
    id UUID PRIMARY KEY,
    run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES test_scenarios(id) ON DELETE SET NULL,
    status VARCHAR(50), -- 'passed', 'failed', 'skipped'
    error_message TEXT,
    stack_trace TEXT,
    screenshot_url TEXT,
    video_url TEXT,
    duration_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    self_healed BOOLEAN DEFAULT false,
    ai_insights TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Self-Healing History
CREATE TABLE self_healing_logs (
    id UUID PRIMARY KEY,
    result_id UUID REFERENCES test_results(id) ON DELETE CASCADE,
    original_selector VARCHAR(500),
    new_selector VARCHAR(500),
    strategy VARCHAR(100),
    success BOOLEAN,
    confidence_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI Chat History
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY,
    user_id UUID,
    message TEXT NOT NULL,
    response TEXT,
    action JSONB, -- What AI did (ran tests, generated, etc.)
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 6.4 API Endpoints

**Apps Management:**
- `POST /api/apps` - Create new app
- `GET /api/apps` - List all apps
- `GET /api/apps/:id` - Get app details
- `PUT /api/apps/:id` - Update app
- `DELETE /api/apps/:id` - Delete app

**Test Generation:**
- `POST /api/apps/:id/generate-tests` - AI generates tests for an app
- `GET /api/apps/:id/page-objects` - List generated Page Objects
- `GET /api/apps/:id/scenarios` - List generated test scenarios

**Test Execution:**
- `POST /api/runs` - Trigger a test run
- `GET /api/runs` - List all test runs
- `GET /api/runs/:id` - Get run details
- `GET /api/runs/:id/results` - Get test results for a run
- `DELETE /api/runs/:id` - Cancel a running test

**AI Interface:**
- `POST /api/ai/chat` - Send natural language command
- `GET /api/ai/conversations` - Get chat history

**Webhooks:**
- `POST /api/webhooks/github` - GitHub webhook
- `POST /api/webhooks/gitlab` - GitLab webhook
- `POST /api/webhooks/generic` - Generic webhook

**Reports:**
- `GET /api/reports/:runId` - Get HTML report
- `GET /api/reports/:runId/pdf` - Download PDF report
- `GET /api/analytics/trends` - Get historical trends

---

## 7. AI Agent Integration (Phase 2+)

**Note:** AI features are planned for Phase 2 and beyond. Phase 1 focuses on the core platform without AI.

### 7.1 AI Agent Capabilities (Future)

The AI agent (Claude via OpenClaw) will have three primary modes:

**1. Test Generation Mode:**
- Receives: App URL + auth credentials
- Uses: Browser tool to crawl and analyze
- Outputs: Page Objects + Test Scenarios (TypeScript code)

**2. Self-Healing Mode:**
- Receives: Failed test + DOM snapshot
- Analyzes: DOM changes, visual differences
- Outputs: New selector + confidence score

**3. Insight Generation Mode:**
- Receives: Test results + historical data
- Analyzes: Patterns, trends, anomalies
- Outputs: Natural language insights + recommendations

### 7.2 AI Workflows (Phase 2+)

**Test Generation Workflow (Future):**
```
1. User: "Generate tests for https://myapp.com"
2. AI Agent:
   a. Opens browser with Playwright
   b. Navigates to URL
   c. Authenticates if needed
   d. Crawls pages (follows links, submits forms)
   e. Analyzes each page:
      - Identifies interactive elements
      - Maps user flows
      - Generates assertions
   f. Creates Page Object Models
   g. Writes test scenarios
   h. Saves to database
3. User: Reviews and approves tests
```

**Self-Healing Workflow (Future):**
```
1. Test fails: "Button #submit-btn not found"
2. System captures DOM snapshot
3. AI Agent:
   a. Analyzes current DOM
   b. Identifies similar elements:
      - By position (x, y coordinates)
      - By text content ("Submit", "Save", etc.)
      - By visual appearance
   c. Ranks candidates by confidence
   d. Tests top candidate
   e. If successful, updates Page Object
4. Test retries with new selector
5. Result logged in self_healing_logs
```

---

## 8. User Interface

### 8.1 Key Screens

**1. Dashboard (Home Page):**
- Summary cards:
  - Total apps
  - Active test runs
  - Pass rate (last 24h)
  - Tests auto-healed (last 7 days)
- Recent test runs (table with status, duration, results)
- Quick actions: "Run Tests", "Add App", "Chat with AI"

**2. Apps Page:**
- Grid/list of all apps
- Each card shows:
  - App name + URL
  - Last run status (✅/❌)
  - Pass rate badge
  - Quick action buttons
- "Add New App" button

**3. App Detail Page:**
- App info (name, URLs, auth type)
- Tabs:
  - **Overview**: Summary stats, recent runs
  - **Test Suites**: List of suites with run buttons
  - **Page Objects**: AI-generated POMs
  - **Test Scenarios**: All test cases
  - **Reports**: Historical runs
  - **Settings**: Configuration

**4. Test Run Page:**
- Real-time progress bar
- Live log stream
- Test results table (updating in real-time)
- Screenshots/videos for failures
- AI insights panel

**5. Reports Page:**
- Summary metrics
- Test breakdown (passed/failed/skipped)
- Failure details with screenshots
- AI-generated root cause analysis
- Download PDF/CSV buttons

**6. AI Chat Page:**
- Chat interface (left sidebar or full-screen)
- Natural language input
- AI responses with actions taken
- Links to test runs, reports

**7. Settings Page:**
- User profile
- API keys
- Notification preferences
- Integrations (Slack, GitHub, etc.)

### 8.2 Design Principles

- **Clean and Modern**: Minimalist UI, focus on data
- **Real-Time Updates**: WebSocket for live test runs
- **Responsive**: Works on desktop + tablet
- **Dark Mode**: Optional dark theme
- **Accessibility**: WCAG 2.1 AA compliant

---

## 9. Development Roadmap

### Phase 1: Foundation (Weeks 1-6) - NO AI

**Milestone: Production-ready test automation platform**

**Week 1-2: Project Setup & Database**
- [ ] Monorepo structure (frontend + backend)
- [ ] TypeScript configuration (strict mode)
- [ ] Database schema + migrations (Prisma)
  - Apps, test_suites, test_files, test_runs, test_results tables
- [ ] Docker setup (PostgreSQL + Redis)
- [ ] Basic API scaffolding (Express routes)
- [ ] Authentication (users, JWT)

**Week 3-4: Core Features**
- [ ] Apps management CRUD (create/read/update/delete)
- [ ] Test file upload (drag-and-drop, bulk upload)
- [ ] Test suite organization (folders, tags)
- [ ] **Test Recorder Integration:**
  - [ ] Launch Playwright Inspector from UI
  - [ ] Pre-configure with app URL and auth
  - [ ] Capture recorded test code
  - [ ] Save to suite with metadata
- [ ] Playwright integration (basic test execution)
- [ ] BullMQ job queue setup
- [ ] Worker process (execute Playwright tests)
- [ ] Results storage (screenshots, videos, logs)

**Week 5-6: UI & Reporting**
- [ ] React app with routing and auth
- [ ] Apps dashboard (list, cards, search)
- [ ] Test suite management page
- [ ] Test run page (real-time updates via WebSocket)
- [ ] Results page (pass/fail, screenshots, videos)
- [ ] Historical trends (pass rate over time)
- [ ] Basic CI/CD integration (webhook endpoint)
- [ ] Slack/email notifications

**Phase 1 Deliverable:**
- ✅ Multi-app platform with test management
- ✅ **Test recorder (no-code test creation via Playwright Inspector)**
- ✅ Manual test upload option (for advanced users)
- ✅ Parallel test execution with Playwright
- ✅ Comprehensive reporting and history
- ✅ CI/CD ready (webhooks, API)
- ✅ Production deployment (Docker)

---

### Phase 2: AI Integration (Weeks 7-12) - AI FEATURES

**Milestone: AI-powered test generation and self-healing**

**Week 7-8: AI Test Generation**
- [ ] OpenClaw + Claude AI integration
- [ ] Web crawler (using browser tool)
- [ ] Page analysis (identify elements, forms, buttons)
- [ ] Page Object Model generation (TypeScript classes)
- [ ] Test scenario generation (Playwright tests)
- [ ] Review & approval workflow (UI)

**Week 9-10: Self-Healing Tests**
- [ ] Failure detection and DOM snapshot capture
- [ ] Selector healing algorithms:
  - Text content matching
  - Visual position similarity
  - ARIA label matching
- [ ] Confidence scoring system
- [ ] Auto-fix pipeline (test new selector, update POM)
- [ ] Approval workflow for low-confidence fixes
- [ ] Self-healing logs and reporting

**Week 11-12: Natural Language Interface**
- [ ] Chat UI component
- [ ] Natural language command parsing
- [ ] Intent classification (run tests, generate tests, view reports)
- [ ] App name resolution (fuzzy matching)
- [ ] Action execution (trigger runs, generate tests)
- [ ] Conversational responses
- [ ] Chat history persistence

**Phase 2 Deliverable:**
- ✅ AI can generate tests from any URL
- ✅ Self-healing fixes 70%+ of broken selectors
- ✅ Natural language interface for test management
- ✅ Reduced manual test writing by 60%+

---

### Phase 3: Advanced Features (Weeks 13-18) - OPTIONAL

**Milestone: Enterprise-grade features and analytics**

**Week 13-14: Visual Regression**
- [ ] Screenshot baseline capture
- [ ] Pixel-by-pixel comparison
- [ ] Diff highlighting
- [ ] Approve/reject workflow
- [ ] AI-powered ignore rules (dynamic content)

**Week 15-16: Performance & Accessibility**
- [ ] Lighthouse integration
- [ ] Performance metrics (LCP, CLS, TTI)
- [ ] Performance budgets
- [ ] Axe-core accessibility testing
- [ ] WCAG compliance reports

**Week 17-18: Advanced Analytics & Polish**
- [ ] Flaky test detection (ML-based)
- [ ] Predictive failure analysis
- [ ] Multi-user workflow support
- [ ] API + UI hybrid testing
- [ ] Enterprise features (SSO, RBAC, audit logs)
- [ ] Documentation and tutorials

**Phase 3 Deliverable:**
- ✅ Visual regression testing
- ✅ Performance and accessibility monitoring
- ✅ Advanced analytics and insights
- ✅ Enterprise-ready platform

---

### Post-Launch (Ongoing)

**Month 1-2: Beta Testing & Iteration**
- Beta user feedback
- Bug fixes and stability improvements
- Performance optimization
- Documentation refinement

**Month 3-6: Growth & Expansion**
- Mobile app testing (Appium integration)
- API testing (REST/GraphQL)
- Load testing (k6 integration)
- Third-party integrations (Jira, PagerDuty, etc.)

**Month 6+: Enterprise & Scale**
- Self-hosted deployment option
- Multi-tenancy and team collaboration
- Advanced RBAC and permissions
- SLA and dedicated support
- Marketplace for community-contributed tests

---

## 10. Success Metrics

### Technical Metrics

- **Test Generation Accuracy**: > 80% of generated tests are usable
- **Self-Healing Success Rate**: > 85% of broken tests auto-fixed
- **Test Execution Speed**: < 30 min for 100 tests
- **Platform Uptime**: 99.9%
- **API Response Time**: < 200ms (p95)

### Business Metrics

- **User Acquisition**: 100 beta users in first month
- **Activation Rate**: > 70% of users run first test within 24h
- **Retention**: > 60% monthly active users
- **Test Volume**: 10,000+ tests executed per month
- **Customer Satisfaction**: NPS > 50

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI generates poor tests | High | Human review step, feedback loop to improve |
| Self-healing breaks tests | Medium | Confidence scoring, human approval for low confidence |
| Playwright version changes | Low | Pin versions, automated upgrade testing |
| High infrastructure cost | Medium | Resource limits, auto-scaling, usage-based pricing |
| Security of stored credentials | High | Encryption at rest, vault integration, minimal permissions |
| Complex app structures | High | Iterative AI learning, user hints/configuration |

---

## 12. Pricing Model (Future)

**Free Tier:**
- 1 app
- 100 test runs/month
- Community support

**Pro Tier ($99/month):**
- 10 apps
- Unlimited test runs
- Priority support
- CI/CD integration

**Enterprise Tier (Custom):**
- Unlimited apps
- Self-hosted option
- SLA + dedicated support
- Custom integrations

---

## 13. Future Enhancements (Post-MVP)

- **Mobile App Testing**: iOS/Android with Appium integration
- **API Testing**: REST/GraphQL API test generation
- **Load Testing**: Performance testing with k6 integration
- **Visual Regression**: AI-powered screenshot comparison
- **Multi-User Workflows**: Concurrent user simulation
- **Test Data Management**: Smart test data generation and management
- **Blockchain Testing**: Web3/DApp testing support
- **Accessibility Testing**: WCAG compliance automation

---

## 14. References

- [Playwright Documentation](https://playwright.dev/)
- [OpenClaw Documentation](https://docs.openclaw.ai/)
- [Claude API](https://www.anthropic.com/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Selenium Migration Guide](https://playwright.dev/docs/selenium)

---

*This PRD is a living document and will evolve as we learn from users and iterate on the product.*

**Next Steps:**
1. Review and approve PRD
2. Set up project infrastructure
3. Begin Phase 1 development
4. Weekly progress reviews

---

**Made by screwgoth • Version 1.0.0**
