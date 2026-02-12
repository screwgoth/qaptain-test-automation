# Docker Deployment Guide

## Quick Start

### 1. Start Qaptain
```bash
./start.sh
```

This will:
- Build Docker images for frontend and backend
- Start PostgreSQL, Redis, Backend, and Frontend containers
- Run database migrations automatically
- Seed demo users

### 2. Access Qaptain
- **Frontend UI:** http://localhost
- **Backend API:** http://localhost:3000

**Demo Login:**
- Email: `demo@qaptain.app`
- Password: `demo123`

### 3. Stop Qaptain
```bash
./stop.sh
```

---

## Manual Docker Commands

### Build Images
```bash
docker-compose build
```

### Start Services
```bash
docker-compose up -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Check Status
```bash
docker-compose ps
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes (CAUTION: Deletes data!)
```bash
docker-compose down -v
```

---

## Services

| Service | Container Name | Port | Purpose |
|---------|---------------|------|---------|
| **Frontend** | qaptain-frontend | 80 | React UI (nginx) |
| **Backend** | qaptain-backend | 3000 | Express API |
| **PostgreSQL** | qaptain-postgres | 5432 | Database |
| **Redis** | qaptain-redis | 6379 | Job queue |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Browser → http://localhost                     │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Frontend Container (nginx)                     │
│  - Serves React SPA                             │
│  - Proxies /api → backend                       │
│  - Proxies /socket.io → backend                 │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Backend Container (Node.js)                    │
│  - Express REST API                             │
│  - WebSocket for real-time updates              │
│  - Playwright test execution                    │
└─────────────────────────────────────────────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│  PostgreSQL     │    │  Redis          │
│  - User data    │    │  - Job queue    │
│  - Test data    │    │  - Sessions     │
└─────────────────┘    └─────────────────┘
```

---

## Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

**Important:** Change JWT secrets in production!

---

## Data Persistence

Data is persisted in Docker volumes:
- `postgres_data` - Database files
- `redis_data` - Redis data
- `./backend/uploads` - Test files
- `./backend/test-results` - Screenshots, videos

To backup data:
```bash
docker run --rm -v qaptain-test-automation_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

---

## Troubleshooting

### Services not starting
```bash
# Check logs
docker-compose logs

# Check service health
docker-compose ps
```

### Database connection errors
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check if migrations ran
docker-compose exec backend npx prisma migrate status
```

### Port conflicts
If ports 80, 3000, 5432, or 6379 are in use:
```bash
# Stop conflicting services
sudo lsof -i :80
sudo lsof -i :3000

# Or change ports in docker-compose.yml
```

### Reset everything
```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Start fresh
./start.sh
```

---

## Production Deployment

### Security Checklist
- [ ] Change JWT secrets in `.env`
- [ ] Use strong PostgreSQL password
- [ ] Enable HTTPS (add nginx SSL config)
- [ ] Set `NODE_ENV=production`
- [ ] Restrict CORS origins
- [ ] Set up firewall rules
- [ ] Enable Docker logging

### Recommended Changes
1. Use Docker secrets for sensitive data
2. Set up external PostgreSQL (managed service)
3. Use Redis cluster for high availability
4. Add nginx SSL termination
5. Set up monitoring (Prometheus + Grafana)

---

## Development vs Production

### Development (local)
```bash
# Use docker-compose.yml
./start.sh
```

### Production
```bash
# Use docker-compose.prod.yml (to be created)
docker-compose -f docker-compose.prod.yml up -d
```

---

## Updating Qaptain

```bash
# Pull latest code
git pull origin dev

# Rebuild images
docker-compose build

# Restart services
docker-compose up -d

# Run new migrations
docker-compose exec backend npx prisma migrate deploy
```

---

## Scaling

### Horizontal Scaling
Run multiple backend workers:
```bash
docker-compose up -d --scale backend=3
```

Use a load balancer (nginx, HAProxy) to distribute traffic.

### Vertical Scaling
Adjust resources in `docker-compose.yml`:
```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '1'
        memory: 1G
```

---

**Made with ❤️ by screwgoth**
