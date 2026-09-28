# InfraSphere Architecture Documentation

## 1. High-Level Architecture Overview

InfraSphere is an enterprise-grade Unified Infrastructure Asset Lifecycle & Intelligence Platform built on a distributed microservices pattern. It provides mission-critical tracking, GIS spatial mapping, deterministic risk and health evaluations, event-driven reactive updates, and AI assistance powered by Google Gemini.

```mermaid
flowchart TD
    Users([Municipal & Infrastructure Operators]) --> |HTTPS / Web| Frontend[React + TypeScript + Leaflet SPA]
    Frontend --> |REST / Bearer JWT| Gateway[API Gateway :3000]

    subgraph Core_Microservices [Microservices Layer]
        Gateway --> |Reverse Proxy| AssetService[Asset Service :3001]
        Gateway --> |Reverse Proxy| InspService[Inspection Service :3002]
        Gateway --> |Reverse Proxy| MaintService[Maintenance Service :3003]
        Gateway --> |Reverse Proxy| RiskService[Risk Service :3004]
        Gateway --> |Reverse Proxy| AIService[AI Service :3005]
        Gateway --> |Reverse Proxy| NotifService[Notification Service :3006]
        Gateway --> |Reverse Proxy| AuditService[Audit Service :3007]
    end

    subgraph Event_Broker [Asynchronous Event Bus]
        InspService --> |inspection.completed| RabbitMQ[RabbitMQ :5672 Topic Exchange]
        MaintService --> |workorder.completed| RabbitMQ
        MaintService --> |maintenance.completed| RabbitMQ
        AssetService --> |asset.created / updated| RabbitMQ

        RabbitMQ --> |Consume| RiskService
        RabbitMQ --> |Consume| NotifService
        RabbitMQ --> |Consume| AuditService
    end

    subgraph Intelligence_Layer [AI Assistance Layer]
        AIService --> |Structured Context| GeminiAPI[Google Gemini 1.5/2.5 Flash]
    end

    subgraph Storage_And_Databases [Persistence & Caching]
        AssetService --> DB_Asset[(asset_db PostGIS)]
        InspService --> DB_Insp[(inspection_db)]
        MaintService --> DB_Maint[(maintenance_db)]
        RiskService --> DB_Risk[(risk_db)]
        NotifService --> DB_Notif[(notification_db)]
        AuditService --> DB_Audit[(audit_db)]
        AssetService --> MinIO[(MinIO S3 Storage :9000)]
        Gateway --> Redis[(Redis Cache :6379)]
    end
```

## 2. Service Separation & Logical Domain Architecture

Instead of anti-pattern microservice sprawl (e.g., creating 15 microservices for every individual asset type), domain modules are unified inside the **Asset Service**:
- **Buildings & Facilities Module**: Hospitals, government secretariats, emergency bunkers, educational shelters
- **Water Infrastructure Module**: Treatment complexes, pumping stations, distribution reservoirs, aqueducts
- **Transport Infrastructure Module**: Cable-stayed bridges, elevated expressway viaducts, tunnels, smart street corridors
- **Electrical Infrastructure Module**: 220kV/33kV substations, power transformers, Ring Main Units, backup generators

## 3. Communication Patterns

1. **Synchronous (REST / JSON)**: Client-to-Gateway requests and Gateway-to-Service routing operate over low-latency HTTP REST.
2. **Asynchronous (RabbitMQ Topic Exchange)**: State modifications publish immutable domain events (`infrastructure.events`) ensuring decoupled eventual consistency.
   - Example: Completing an inspection with critical defects immediately publishes `inspection.completed`.
   - The **Risk Service** recalculates the deterministic Health Score and Risk Score.
   - The **Notification Service** registers real-time alerts.
   - The **Audit Service** writes an immutable provenance record.
