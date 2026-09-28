# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/services/maintenance-service/package*.json ./apps/services/maintenance-service/
COPY apps/services/maintenance-service/prisma ./apps/services/maintenance-service/prisma

RUN npm install

COPY apps/services/maintenance-service/ ./apps/services/maintenance-service/

RUN npx prisma generate --schema=./apps/services/maintenance-service/prisma/schema.prisma
RUN npm run build --workspace=@infrasphere/shared-types
RUN npm run build --workspace=@infrasphere/shared-events
RUN npm run build --workspace=@infrasphere/shared-utils
RUN npm run build --workspace=@infrasphere/maintenance-service

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/services/maintenance-service/dist ./apps/services/maintenance-service/dist
COPY --from=builder /app/apps/services/maintenance-service/package.json ./apps/services/maintenance-service/package.json
COPY --from=builder /app/apps/services/maintenance-service/prisma ./apps/services/maintenance-service/prisma

USER node
EXPOSE 3003

CMD ["node", "apps/services/maintenance-service/dist/main.js"]
