# InfraSphere Security Architecture

1. **Authentication**:
   - RFC 7519 JSON Web Tokens (JWT) signed with HMAC-SHA256.
   - Passwords hashed using bcrypt (10 salt rounds). No plain text stored anywhere.
2. **Role-Based Access Control (RBAC)**:
   - `ADMIN`: Full platform access across all domains.
   - `ASSET_MANAGER`: Asset registration, spatial geometry, and dependency updates.
   - `INSPECTOR`: Scheduling audits and logging critical defects.
   - `MAINTENANCE_MANAGER`: Managing work orders and recording repairs.
   - `VIEWER`: Read-only access to GIS map and dashboard analytics.
3. **Network Boundary Protection**:
   - Only the Frontend (5173 / 80) and API Gateway (3000) are exposed externally.
   - Microservices communicate strictly over the internal isolated bridge network (`infrasphere-network`).
4. **File Upload Security (MinIO)**:
   - File uploads validated for MIME types (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`).
   - Filenames randomized into UUID-based storage keys to prevent path traversal.
