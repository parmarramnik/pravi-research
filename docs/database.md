# InfraSphere Database Architecture Documentation

## Logical Database Separation

InfraSphere adheres to strict database ownership per microservice. No microservice directly queries or modifies another service's database tables.

```
PostgreSQL 16 (PostGIS)
 ├── asset_db          (Owned exclusively by Asset Service)
 ├── inspection_db     (Owned exclusively by Inspection Service)
 ├── maintenance_db    (Owned exclusively by Maintenance Service)
 ├── risk_db           (Owned exclusively by Risk Service)
 ├── notification_db   (Owned exclusively by Notification Service)
 └── audit_db          (Owned exclusively by Audit Service)
```

## Entity Relationship Overview

### 1. asset_db
- `Asset`: Core entity with UUID, human-readable `assetCode` (e.g. `ELC-000001`), location, latitude, longitude, condition, status, lifecycle.
- `BuildingDetails`, `WaterDetails`, `TransportDetails`, `ElectricalDetails`: 1-to-1 extensions storing domain-specific telemetry and physical specs.
- `AssetDependency`: Directed graph edge linking `sourceAssetId` to `targetAssetId` with `relationship` (`DEPENDS_ON`, `SUPPLIES`, `CONNECTS_TO`, `LOCATED_IN`, `SERVES`, `PROTECTS`, `REPLACED_BY`) and `criticality`.
- `AssetDocument`: MinIO S3 object metadata.
- `User`: Admin and operator identities with bcrypt password hashes.

### 2. inspection_db
- `Inspection`: Scheduled/completed inspections with `conditionObserved` and `overallScore`.
- `InspectionFinding`: Defect findings categorized by severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) with recommended remediation.

### 3. maintenance_db
- `WorkOrder`: Assigned technician, maintenance type (`PREVENTIVE`, `CORRECTIVE`, `EMERGENCY`), estimated & actual cost, resolution notes.
- `MaintenanceRecord`: Historical record of completed maintenance with verified condition restoration.

### 4. risk_db
- `AssetRiskRecord`: Deterministic calculation outputs (`healthScore`, `riskScore`, `riskLevel`, `maintenancePriority`, `breakdown`).
- `RiskConfigRecord`: Configurable weights for `conditionWeight`, `ageWeight`, `inspectionWeight`, `maintenanceWeight`.
- `RiskHistory`: Historical trend of calculated scores.

### 5. notification_db
- `Notification`: High-priority risk alerts, inspection schedules, and work order assignments.

### 6. audit_db
- `AuditLog`: Immutable append-only log capturing `action`, `entity`, `entityId`, `actorName`, `service`, `oldValues`, `newValues`, and `timestamp`.
