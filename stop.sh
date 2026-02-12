#!/bin/bash

# Qaptain Test Automation Platform - Stop Script

set -e

echo "🛑 Stopping Qaptain Test Automation Platform..."
echo ""

# Determine docker compose command
if docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Stop containers
echo "📦 Stopping containers..."
$DOCKER_COMPOSE down

echo ""
echo "✅ All services stopped."
echo ""
echo "💡 Tips:"
echo "   - Start again:        ./start.sh"
echo "   - Remove volumes:     $DOCKER_COMPOSE down -v"
echo "   - View containers:    docker ps -a"
echo ""
