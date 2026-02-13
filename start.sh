#!/bin/bash

# Qaptain Test Automation Platform - Start Script

set -e

echo "🚀 Starting Qaptain Test Automation Platform..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Determine docker compose command
if docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo "📦 Building Docker images..."
$DOCKER_COMPOSE build

echo ""
echo "🐳 Starting database and redis first..."
$DOCKER_COMPOSE up -d postgres redis

echo ""
echo "⏳ Waiting for database to be healthy..."
until $DOCKER_COMPOSE exec -T postgres pg_isready -U qaptain > /dev/null 2>&1; do
    echo "   Waiting for postgres..."
    sleep 2
done
echo "✅ Database is ready!"

# Check for and fix failed migrations
echo ""
echo "🔍 Checking migration status..."
FAILED_MIGRATIONS=$($DOCKER_COMPOSE exec -T postgres psql -U qaptain -d qaptain_db -t -c "SELECT COUNT(*) FROM _prisma_migrations WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL;" 2>/dev/null | tr -d ' ' || echo "0")

if [ "$FAILED_MIGRATIONS" != "0" ] && [ "$FAILED_MIGRATIONS" != "" ]; then
    echo "⚠️  Found failed migrations. Cleaning up..."
    $DOCKER_COMPOSE exec -T postgres psql -U qaptain -d qaptain_db -c "DELETE FROM _prisma_migrations WHERE finished_at IS NULL;" 2>/dev/null || true
    echo "✅ Cleaned up failed migrations"
fi

echo ""
echo "🐳 Starting all services..."
$DOCKER_COMPOSE up -d

echo ""
echo "⏳ Waiting for backend to be healthy..."
RETRIES=30
until [ $RETRIES -eq 0 ] || curl -s http://localhost:3000/health > /dev/null 2>&1; do
    RETRIES=$((RETRIES-1))
    echo "   Waiting for backend... ($RETRIES attempts left)"
    sleep 2
done

if [ $RETRIES -eq 0 ]; then
    echo "⚠️  Backend didn't become healthy in time. Checking logs..."
    $DOCKER_COMPOSE logs backend --tail 30
    echo ""
    echo "Try running: $DOCKER_COMPOSE logs backend -f"
    exit 1
fi
echo "✅ Backend is ready!"

# Run database seed (only if users table is empty)
echo ""
echo "🌱 Checking if seeding is needed..."
USER_COUNT=$($DOCKER_COMPOSE exec -T postgres psql -U qaptain -d qaptain_db -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ' || echo "0")

if [ "$USER_COUNT" = "0" ] || [ "$USER_COUNT" = "" ]; then
    echo "🌱 Seeding database..."
    # Run seed inside the backend container
    $DOCKER_COMPOSE exec -T backend sh -c "npx tsx prisma/seed.ts" 2>/dev/null || {
        # Fallback: try from host if tsx is available
        if command -v npx &> /dev/null; then
            cd backend && DATABASE_URL="postgresql://qaptain:qaptain_dev_password@localhost:5432/qaptain_db" npx tsx prisma/seed.ts && cd ..
        else
            echo "⚠️  Seed failed - run manually after install:"
            echo "   cd backend && npm install && DATABASE_URL=\"postgresql://qaptain:qaptain_dev_password@localhost:5432/qaptain_db\" npx tsx prisma/seed.ts"
        fi
    }
else
    echo "✅ Database already seeded ($USER_COUNT users found)"
fi

# Check service health
echo ""
echo "🔍 Checking service status..."
$DOCKER_COMPOSE ps

echo ""
echo "✅ Qaptain is starting up!"
echo ""
echo "📍 Services:"
echo "   - Frontend:  http://localhost"
echo "   - Backend:   http://localhost:3000"
echo "   - API Docs:  http://localhost:3000/api"
echo ""
echo "🔐 Demo Login:"
echo "   Email:    demo@qaptain.app"
echo "   Password: demo123"
echo ""
echo "📊 View logs:"
echo "   $DOCKER_COMPOSE logs -f"
echo ""
echo "🛑 Stop services:"
echo "   ./stop.sh"
echo ""
