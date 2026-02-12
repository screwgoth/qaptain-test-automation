# 🛠️ Qaptain Setup Guide

Detailed installation and configuration instructions for the Qaptain Test Automation Platform.

---

## 📋 Prerequisites

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| **Node.js** | 20.x LTS or higher | https://nodejs.org/ |
| **npm** | 10.x or higher | Comes with Node.js |
| **Docker** | 24.x or higher | https://www.docker.com/ |
| **Git** | Latest | https://git-scm.com/ |

### Optional Tools

- **Prisma Studio** (comes with Prisma, GUI for database)
- **PostgreSQL Client** (psql, pgAdmin, DBeaver, etc.)
- **Redis Client** (RedisInsight, redis-cli)

---

## 🚀 Installation Steps

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd qaptain-test-automation
```

### Step 2: Install Dependencies

Install all workspace dependencies (backend + frontend):

```bash
npm install
```

This will install dependencies for both the backend and frontend workspaces.

### Step 3: Start Docker Services

Start PostgreSQL and Redis using Docker Compose:

```bash
npm run docker:up
```

This command starts:
- **PostgreSQL** on port 5432
- **Redis** on port 6379

Verify services are running:

```bash
docker ps
```

You should see `qaptain-postgres` and `qaptain-redis` containers running.

### Step 4: Configure Environment Variables

The backend already has a `.env` file, but you can customize it:

```bash
cd backend
cp .env.example .env  # Optional: if you want to start fresh
```

Edit `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://qaptain:qaptain_dev_password@localhost:5432/qaptain_db?schema=public"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# Server
PORT=3000
NODE_ENV="development"

# JWT (⚠️ CHANGE IN PRODUCTION!)
JWT_SECRET="dev-jwt-secret-change-in-production"
JWT_EXPIRATION="7d"

# Frontend URL
FRONTEND_URL="http://localhost:5173"
```

### Step 5: Setup Database

Run Prisma migrations to create database tables:

```bash
cd backend
npm run db:generate   # Generate Prisma Client
npm run db:migrate    # Run migrations
npm run db:seed       # Seed database with demo data
```

Expected output:
```
✅ Admin user created: admin@qaptain.app
✅ Demo user created: demo@qaptain.app
✅ Sample app created: Sample Web App
✅ Environments created
✅ Sample test suite created: Smoke Tests
🎉 Database seeded successfully!
```

### Step 6: Start Development Servers

From the root directory, start both backend and frontend:

```bash
npm run dev
```

This starts:
- **Backend API** on http://localhost:3000
- **Frontend UI** on http://localhost:5173

Or start them separately:

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

### Step 7: Verify Installation

1. **Check Backend Health**
   ```bash
   curl http://localhost:3000/health
   ```

   Expected response:
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-02-12T07:15:00.000Z",
     "uptime": 12.34,
     "environment": "development"
   }
   ```

2. **Open Frontend**
   - Navigate to http://localhost:5173
   - You should see the login page

3. **Login with Demo Account**
   - Email: `demo@qaptain.app`
   - Password: `demo123`

---

## 🔧 Configuration

### Database Configuration

**Connection String Format:**
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?schema=public
```

**Default Credentials:**
- User: `qaptain`
- Password: `qaptain_dev_password`
- Database: `qaptain_db`
- Port: `5432`

**Change PostgreSQL Password:**

Edit `docker-compose.yml`:
```yaml
environment:
  POSTGRES_PASSWORD: your-new-password
```

Then update `backend/.env`:
```env
DATABASE_URL="postgresql://qaptain:your-new-password@localhost:5432/qaptain_db"
```

### Redis Configuration

**Default Settings:**
- Host: `localhost`
- Port: `6379`
- No password

**Enable Redis Password:**

Edit `docker-compose.yml`:
```yaml
redis:
  command: redis-server --requirepass your-redis-password
```

Update `backend/.env`:
```env
REDIS_PASSWORD="your-redis-password"
```

### JWT Configuration

**Development:**
```env
JWT_SECRET="dev-secret-key"
JWT_EXPIRATION="7d"
```

**Production (⚠️ IMPORTANT):**
```env
JWT_SECRET="<generate-secure-random-string-32-chars>"
JWT_EXPIRATION="24h"
```

Generate secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🏃 Running the Application

### Development Mode

**Start everything:**
```bash
npm run dev
```

**Start backend only:**
```bash
cd backend
npm run dev
```

**Start frontend only:**
```bash
cd frontend
npm run dev
```

**Start test worker:**
```bash
cd backend
npm run worker
```

### Production Build

**Build backend:**
```bash
cd backend
npm run build
```

**Build frontend:**
```bash
cd frontend
npm run build
```

**Run production backend:**
```bash
cd backend
npm start
```

**Serve production frontend:**
```bash
cd frontend
npx serve -s dist
```

---

## 🗄️ Database Management

### Prisma Commands

**Generate Prisma Client:**
```bash
cd backend
npm run db:generate
```

**Create Migration:**
```bash
cd backend
npx prisma migrate dev --name description-of-changes
```

**Deploy Migrations (Production):**
```bash
cd backend
npm run db:migrate:deploy
```

**Reset Database (⚠️ DELETES ALL DATA):**
```bash
cd backend
npx prisma migrate reset
```

**Seed Database:**
```bash
cd backend
npm run db:seed
```

**Open Prisma Studio (GUI):**
```bash
cd backend
npm run db:studio
```

Then open http://localhost:5555

### PostgreSQL Direct Access

**Using psql:**
```bash
docker exec -it qaptain-postgres psql -U qaptain -d qaptain_db
```

**Common SQL Commands:**
```sql
-- List all tables
\dt

-- View users
SELECT * FROM users;

-- View apps
SELECT * FROM apps;

-- Exit psql
\q
```

---

## 📊 Redis Management

### Redis CLI

**Connect to Redis:**
```bash
docker exec -it qaptain-redis redis-cli
```

**Common Redis Commands:**
```bash
# Test connection
PING

# View all keys
KEYS *

# View queue jobs
KEYS bull:test-runs:*

# Monitor real-time commands
MONITOR

# Exit
exit
```

### Queue Statistics

The backend exposes queue stats via the API (future enhancement).

---

## 🐳 Docker Management

### Docker Compose Commands

**Start services:**
```bash
docker-compose up -d
```

**Stop services:**
```bash
docker-compose down
```

**Restart services:**
```bash
docker-compose restart
```

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f redis
```

**Remove volumes (⚠️ DELETES DATA):**
```bash
docker-compose down -v
```

### Individual Container Management

**Stop container:**
```bash
docker stop qaptain-postgres
docker stop qaptain-redis
```

**Start container:**
```bash
docker start qaptain-postgres
docker start qaptain-redis
```

**View container logs:**
```bash
docker logs -f qaptain-postgres
docker logs -f qaptain-redis
```

---

## 🔍 Troubleshooting

### Port Already in Use

**Error:** `Port 3000 (or 5173, 5432, 6379) is already in use`

**Solution:**

1. Find the process using the port:
   ```bash
   # Linux/Mac
   lsof -i :3000
   
   # Windows
   netstat -ano | findstr :3000
   ```

2. Kill the process or change the port in configuration

### Database Connection Failed

**Error:** `Can't reach database server`

**Solutions:**

1. Check Docker is running:
   ```bash
   docker ps
   ```

2. Restart PostgreSQL container:
   ```bash
   docker-compose restart postgres
   ```

3. Check logs:
   ```bash
   docker-compose logs postgres
   ```

4. Verify DATABASE_URL in `.env` is correct

### Redis Connection Failed

**Error:** `Redis connection refused`

**Solutions:**

1. Check Redis is running:
   ```bash
   docker ps | grep redis
   ```

2. Restart Redis:
   ```bash
   docker-compose restart redis
   ```

3. Test Redis connection:
   ```bash
   docker exec -it qaptain-redis redis-cli PING
   ```

### Prisma Client Not Generated

**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
cd backend
npm run db:generate
```

### Migration Failed

**Error:** `Migration failed to apply`

**Solution:**

1. Check database connection
2. Reset database (development only):
   ```bash
   cd backend
   npx prisma migrate reset
   ```

3. Re-run migrations:
   ```bash
   npm run db:migrate
   ```

### Frontend Build Errors

**Error:** TypeScript compilation errors

**Solution:**

1. Clean install:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check TypeScript version compatibility

### Worker Not Processing Jobs

**Issue:** Test runs stuck in QUEUED status

**Solutions:**

1. Start the worker:
   ```bash
   cd backend
   npm run worker
   ```

2. Check Redis connection in worker logs

3. Verify BullMQ queue:
   ```bash
   docker exec -it qaptain-redis redis-cli
   KEYS bull:test-runs:*
   ```

---

## 🧪 Testing the Setup

### 1. Create an App

**Via API:**
```bash
# Login first
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@qaptain.app","password":"demo123"}'

# Copy the token from response

# Create app
curl -X POST http://localhost:3000/api/apps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "My Test App",
    "url": "https://example.com",
    "authType": "NONE"
  }'
```

**Via UI:**
- Login to http://localhost:5173
- Click "Add New App"
- Fill in the form
- Save

### 2. Upload Test Files

Test files should be Playwright tests (`.spec.ts` or `.spec.js`).

Example test file (`example.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});
```

### 3. Run Tests

**Via API:**
```bash
curl -X POST http://localhost:3000/api/test-runs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "appId": "your-app-id",
    "suiteId": "your-suite-id",
    "browser": "chromium",
    "workers": 4
  }'
```

**Via UI:**
- Navigate to app detail page
- Click "Run Tests"
- Select suite and options
- Start run

---

## 📚 Additional Resources

- **Prisma Docs:** https://www.prisma.io/docs
- **Playwright Docs:** https://playwright.dev/
- **BullMQ Docs:** https://docs.bullmq.io/
- **React Docs:** https://react.dev/
- **Vite Docs:** https://vitejs.dev/
- **Tailwind CSS:** https://tailwindcss.com/

---

## 🆘 Need Help?

1. Check this SETUP.md for common issues
2. Review [README.md](./README.md) for overview
3. Check [docs/PRD.md](./docs/PRD.md) for product details
4. Open an issue on GitHub

---

**Happy Testing! 🧪**
