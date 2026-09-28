# InfraSphere RabbitMQ Event-Driven Architecture

## Exchange & Topology

- **Exchange**: `infrastructure.events`
- **Type**: `topic`
- **Durable**: `true`

## Routing Keys & Event Flow

```mermaid
sequenceDiagram
    participant Inspector
    participant InspectionService
    participant RabbitMQ
    participant RiskService
    participant NotificationService
    participant AuditService

    Inspector->>InspectionService: POST /api/inspections/:id/complete (CRITICAL findings)
    InspectionService->>InspectionService: Calculate findings deduction & persist
    InspectionService->>RabbitMQ: Publish "inspection.completed"
    RabbitMQ-->>RiskService: Consume "inspection.completed"
    RiskService->>RiskService: Deterministic Rule Engine Recalculation
    RiskService->>RabbitMQ: Publish "risk.updated" (Risk: CRITICAL)
    RabbitMQ-->>NotificationService: Consume "risk.updated"
    NotificationService->>NotificationService: Create Critical Risk Alert
    RabbitMQ-->>AuditService: Consume "inspection.completed" & "risk.updated"
    AuditService->>AuditService: Insert immutable audit log
```

## Idempotency Strategy

Every event includes an envelope:
```json
{
  "eventId": "c7a86f91-...",
  "eventType": "inspection.completed",
  "timestamp": "2026-03-28T07:15:00.000Z",
  "source": "inspection-service",
  "payload": { ... }
}
```
Consumers maintain an in-memory / Redis cache of processed `eventId`s. If an event is re-delivered by RabbitMQ, the consumer acknowledges immediately without re-executing side effects.
