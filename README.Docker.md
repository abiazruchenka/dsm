# Docker Setup for DSM Project

This project uses Docker Compose to run the full stack (PostgreSQL, Backend, Frontend).

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v3.8+

## Quick Start

### Production Build

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (database data will be lost)
docker-compose down -v
```

### Development Mode

```bash
# Start with development Dockerfiles (hot reload)
docker-compose -f docker-compose.dev.yml up -d --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## Services

- **PostgreSQL**: Port 5432 (default)
- **Backend**: Port 8080 (default)
- **Frontend**: Port 3000 (default) - Production uses nginx on port 80, mapped to 3000

## Environment Variables

**⚠️ REQUIRED**: Create a `.env` file in the root directory. All variables are mandatory for production:

```env
# PostgreSQL Configuration (REQUIRED)
POSTGRES_DB=dsmdb
POSTGRES_USER=dsmuser
POSTGRES_PASSWORD=dsmpassword
POSTGRES_PORT=5432

# Backend Configuration (REQUIRED)
BACKEND_PORT=8080
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false

# Frontend Configuration (REQUIRED)
FRONTEND_PORT=3000
REACT_APP_API_URL=http://localhost:8080
```

**Security Note**: For production, use strong, unique passwords and never commit `.env` file to version control. Consider using Docker secrets or a secrets management service.

## Useful Commands

```bash
# Rebuild a specific service
docker-compose build backend
docker-compose up -d backend

# Access PostgreSQL
docker-compose exec postgres psql -U dsmuser -d dsmdb

# Access backend container
docker-compose exec backend sh

# Access frontend container
docker-compose exec frontend sh

# View service status
docker-compose ps

# Remove all containers and volumes
docker-compose down -v --rmi all
```

## Network

All services are connected via the `dsm-network` bridge network.

- Frontend can access backend at: `http://backend:8080`
- Backend can access PostgreSQL at: `postgres:5432`

## Troubleshooting

1. **Port already in use**: Change ports in `.env` file or stop conflicting services
2. **Build fails**: Make sure all required files are present and Docker has enough resources
3. **Database connection issues**: Check if PostgreSQL is healthy: `docker-compose ps`
4. **Frontend can't connect to backend**: Verify `REACT_APP_API_URL` in `.env` matches backend URL
