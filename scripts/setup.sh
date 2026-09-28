#!/usr/bin/env bash
# ========================================================
# InfraSphere Quick Setup Script
# Initializes infrastructure, spins up containers, and seeds databases
# ========================================================

set -e

echo "=== 1. Checking Environment Prerequisites ==="
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH."
    exit 1
fi

if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

echo "=== 2. Starting Infrastructure Services (Postgres, Redis, RabbitMQ) ==="
docker compose up -d postgres redis rabbitmq

echo "Waiting for PostgreSQL to be ready..."
until docker exec infrasphere-postgres pg_isready -U infrasphere -d infrasphere &> /dev/null; do
    echo "Postgres initializing..."
    sleep 2
done

echo "=== 3. Seeding Logical Databases with Realistic Infrastructure Data ==="
if [ -f scripts/build_all_sql_seeds.js ]; then
    node scripts/build_all_sql_seeds.js
    cat scripts/asset_db.sql | docker exec -i infrasphere-postgres psql -U infrasphere -d asset_db > /dev/null
    cat scripts/inspection_db.sql | docker exec -i infrasphere-postgres psql -U infrasphere -d inspection_db > /dev/null
    cat scripts/maintenance_db.sql | docker exec -i infrasphere-postgres psql -U infrasphere -d maintenance_db > /dev/null
    cat scripts/risk_db.sql | docker exec -i infrasphere-postgres psql -U infrasphere -d risk_db > /dev/null
    cat scripts/notification_db.sql | docker exec -i infrasphere-postgres psql -U infrasphere -d notification_db > /dev/null
    cat scripts/audit_db.sql | docker exec -i infrasphere-postgres psql -U infrasphere -d audit_db > /dev/null
    echo "All 6 databases seeded successfully!"
fi

echo "=== 4. Launching Microservices & Frontend ==="
docker compose up -d --build

echo "=== 5. Verifying Stack Health ==="
bash scripts/health-check.sh

echo "========================================================"
echo "InfraSphere is ready!"
echo "Frontend:  http://localhost:5173"
echo "Gateway:   http://localhost:3000"
echo "Swagger:   http://localhost:3000/docs"
echo "RabbitMQ:  http://localhost:15672 (infrasphere / infrasphere_secret)"
echo "========================================================"
