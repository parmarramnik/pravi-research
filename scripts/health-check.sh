#!/usr/bin/env bash
# ========================================================
# InfraSphere Health Check Script
# Verifies container states, database connectivity, and HTTP health endpoints
# ========================================================

echo "--- InfraSphere System Health Audit ---"

check_http() {
  local name="$1"
  local url="$2"
  local status_code
  status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
  if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 400 ]; then
    echo "[PASS] $name ($url) - HTTP $status_code"
  else
    echo "[WARN] $name ($url) - HTTP $status_code (Service may still be initializing)"
  fi
}

echo "1. Checking Infrastructure Containers..."
if docker exec infrasphere-postgres pg_isready -U infrasphere -d infrasphere &> /dev/null; then
  echo "[PASS] PostgreSQL + PostGIS (Container: infrasphere-postgres)"
else
  echo "[FAIL] PostgreSQL is not responsive"
fi

if docker exec infrasphere-redis redis-cli ping | grep -q "PONG"; then
  echo "[PASS] Redis Cache (Container: infrasphere-redis)"
else
  echo "[FAIL] Redis is not responsive"
fi

if docker exec infrasphere-rabbitmq rabbitmqctl status | grep -q "Runtime"; then
  echo "[PASS] RabbitMQ Broker (Container: infrasphere-rabbitmq)"
else
  echo "[FAIL] RabbitMQ is not responsive"
fi

echo ""
echo "2. Checking Microservices HTTP Health Endpoints..."
check_http "API Gateway" "http://localhost:3000/health"
check_http "Asset Service" "http://localhost:3001/health"
check_http "Inspection Service" "http://localhost:3002/health"
check_http "Maintenance Service" "http://localhost:3003/health"
check_http "Risk Service" "http://localhost:3004/health"
check_http "AI Service" "http://localhost:3005/health"
check_http "Notification Service" "http://localhost:3006/health"
check_http "Audit Service" "http://localhost:3007/health"
check_http "Frontend Web App" "http://localhost:5173"

echo "----------------------------------------"
