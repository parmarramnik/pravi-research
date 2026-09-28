-- ========================================================
-- InfraSphere PostgreSQL Initialization Script
-- Creates individual logical databases for microservices
-- Enables PostGIS extension on spatial-enabled databases
-- ========================================================

-- 1. Create logical databases if they do not exist
SELECT 'CREATE DATABASE asset_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'asset_db')\gexec
SELECT 'CREATE DATABASE inspection_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inspection_db')\gexec
SELECT 'CREATE DATABASE maintenance_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'maintenance_db')\gexec
SELECT 'CREATE DATABASE risk_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'risk_db')\gexec
SELECT 'CREATE DATABASE notification_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'notification_db')\gexec
SELECT 'CREATE DATABASE audit_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'audit_db')\gexec

-- Grant privileges to the infrasphere user
GRANT ALL PRIVILEGES ON DATABASE asset_db TO infrasphere;
GRANT ALL PRIVILEGES ON DATABASE inspection_db TO infrasphere;
GRANT ALL PRIVILEGES ON DATABASE maintenance_db TO infrasphere;
GRANT ALL PRIVILEGES ON DATABASE risk_db TO infrasphere;
GRANT ALL PRIVILEGES ON DATABASE notification_db TO infrasphere;
GRANT ALL PRIVILEGES ON DATABASE audit_db TO infrasphere;

-- 2. Configure PostGIS and UUID extensions on asset_db
\c asset_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 3. Configure UUID extension on other microservice databases
\c inspection_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c maintenance_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c risk_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c notification_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c audit_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
