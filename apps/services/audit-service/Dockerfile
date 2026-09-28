# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/services/audit-service/package*.json ./apps/services/audit-service/
COPY apps/services/audit-service/prisma ./apps/services/audit-service/prisma

RUN npm install

COPY apps/services/audit-service/ ./apps/services/audit-service/

RUN npx prisma generate --schema=./apps/services/audit-service/prisma/schema.prisma
RUN npm run build --workspace=@infrasphere/shared-types
RUN npm run build --workspace=@infrasphere/shared-events
RUN npm run build --workspace=@infrasphere/shared-utils
RUN npm run build --workspace=@infrasphere/audit-service

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/services/audit-service/dist ./apps/services/audit-service/dist
COPY --from=builder /app/apps/services/audit-service/package.json ./apps/services/audit-service/package.json
COPY --from=builder /app/apps/services/audit-service/prisma ./apps/services/audit-service/prisma

USER node
EXPOSE 3007

CMD ["node", "apps/services/audit-service/dist/main.js"]
