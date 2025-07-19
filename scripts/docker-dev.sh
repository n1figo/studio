#!/bin/bash

# Development Docker setup script for Studio

echo "🚀 Setting up Studio development environment..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual API keys and secrets"
fi

# Build and start services
echo "🔧 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Checking service status..."
docker-compose ps

# Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=10

echo "✅ Development environment is ready!"
echo "🌐 Application: http://localhost:9002"
echo "🗄️  Database: localhost:5432"
echo "🔑 Redis: localhost:6379"
echo "📖 Supabase: http://localhost:54321"
echo ""
echo "📝 Useful commands:"
echo "  docker-compose logs -f        # View logs"
echo "  docker-compose down           # Stop services"
echo "  docker-compose exec app bash  # Access app container"
echo "  docker-compose exec postgres psql -U studio_user -d studio_dev  # Database shell"