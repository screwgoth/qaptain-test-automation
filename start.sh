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

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo "❌ Error: docker-compose is not installed."
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
echo "🐳 Starting containers..."
$DOCKER_COMPOSE up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Run database migrations
echo ""
echo "🗄️  Running database migrations..."
$DOCKER_COMPOSE exec -T backend sh -c "npx prisma migrate deploy" || {
    echo "⚠️  Migration failed or already up to date"
}

# Run database seed (only if users table is empty)
echo ""
echo "🌱 Checking if seeding is needed..."
USER_COUNT=$($DOCKER_COMPOSE exec -T postgres psql -U qaptain -d qaptain_db -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ' || echo "0")
if [ "$USER_COUNT" = "0" ]; then
    echo "🌱 Seeding database..."
    # Run seed from host (tsx not available in production container)
    cd backend && DATABASE_URL="postgresql://qaptain:qaptain_dev_password@localhost:5432/qaptain_db" npx tsx prisma/seed.ts && cd .. || {
        echo "⚠️  Seed failed - you may need to run it manually:"
        echo "   cd backend && DATABASE_URL=\"postgresql://qaptain:qaptain_dev_password@localhost:5432/qaptain_db\" npx tsx prisma/seed.ts"
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
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   ./stop.sh"
echo ""
