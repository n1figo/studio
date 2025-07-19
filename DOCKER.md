# Docker Development Environment for Studio

This document provides instructions for setting up and using the Docker development environment for the Studio project.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0 or higher
- Git (for cloning the repository)

## Quick Start

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd studio
   ```

2. **Start the development environment**:
   ```bash
   ./scripts/docker-dev.sh
   ```

3. **Access the application**:
   - Application: http://localhost:9002
   - Database: localhost:5432
   - Redis: localhost:6379
   - Supabase: http://localhost:54321

## Services Overview

### Application (app)
- **Framework**: Next.js 15.3.3 with TypeScript
- **Port**: 9002
- **Features**: Hot reload, Turbopack, AI integration
- **Dependencies**: PostgreSQL, Redis

### Database (postgres)
- **Image**: PostgreSQL 15 Alpine
- **Port**: 5432
- **Database**: studio_dev
- **User**: studio_user
- **Password**: studio_password

### Cache (redis)
- **Image**: Redis 7 Alpine
- **Port**: 6379
- **Purpose**: Caching and session storage

### Supabase (supabase)
- **Image**: Supabase latest
- **Port**: 54321
- **Purpose**: Local Supabase development environment

## Environment Configuration

### Development Environment

Copy the example environment file:
```bash
cp .env.example .env.local
```

Update the following variables in `.env.local`:
- `GOOGLE_GENAI_API_KEY`: Your Google AI API key
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

### Production Environment

For production deployment, use `.env.production` and the production docker-compose file:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Development Commands

### Start Services
```bash
# Start all services
docker-compose up -d

# Start with logs
docker-compose up

# Build and start
docker-compose up --build
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### View Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f postgres
```

### Access Containers
```bash
# Access app container
docker-compose exec app bash

# Access database
docker-compose exec postgres psql -U studio_user -d studio_dev

# Access Redis
docker-compose exec redis redis-cli
```

### Database Operations
```bash
# Run database migrations
docker-compose exec app npm run db:migrate

# Seed database
docker-compose exec app npm run db:seed

# Database shell
docker-compose exec postgres psql -U studio_user -d studio_dev
```

## File Structure

```
studio/
├── Dockerfile              # Production image
├── Dockerfile.dev          # Development image
├── docker-compose.yml      # Development services
├── docker-compose.prod.yml # Production services
├── .dockerignore           # Docker ignore file
├── .env.example            # Environment template
├── scripts/
│   ├── docker-dev.sh       # Development setup script
│   └── init.sql            # Database initialization
└── DOCKER.md               # This documentation
```

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Check what's using the port
   lsof -i :9002
   
   # Kill the process or change the port in docker-compose.yml
   ```

2. **Database connection issues**:
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # View PostgreSQL logs
   docker-compose logs postgres
   ```

3. **Node modules issues**:
   ```bash
   # Rebuild the app container
   docker-compose build --no-cache app
   ```

### Clean Start
```bash
# Stop all services and remove volumes
docker-compose down -v

# Remove all containers, networks, and images
docker system prune -a

# Start fresh
./scripts/docker-dev.sh
```

## Performance Tips

1. **Use volume mounts** for faster development (already configured)
2. **Enable BuildKit** for faster builds:
   ```bash
   export DOCKER_BUILDKIT=1
   ```
3. **Allocate more memory** to Docker Desktop (4GB+ recommended)

## Security Notes

- Development environment uses default passwords
- Production environment uses Docker secrets
- Never commit `.env.local` or production secrets to version control
- Use strong passwords and API keys in production

## Next Steps

1. Update environment variables in `.env.local`
2. Start the development environment
3. Access the application at http://localhost:9002
4. Begin development with hot reload enabled

For more information about the project, see the main README.md file.