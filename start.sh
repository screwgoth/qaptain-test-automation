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
