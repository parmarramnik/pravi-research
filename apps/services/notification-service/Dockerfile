# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/services/notification-service/package*.json ./apps/services/notification-service/
COPY apps/services/notification-service/prisma ./apps/services/notification-service/prisma

RUN npm install

COPY apps/services/notification-service/ ./apps/services/notification-service/

RUN npx prisma generate --schema=./apps/services/notification-service/prisma/schema.prisma
RUN npm run build --workspace=@infrasphere/shared-types
RUN npm run build --workspace=@infrasphere/shared-events
RUN npm run build --workspace=@infrasphere/shared-utils
RUN npm run build --workspace=@infrasphere/notification-service

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/services/notification-service/dist ./apps/services/notification-service/dist
COPY --from=builder /app/apps/services/notification-service/package.json ./apps/services/notification-service/package.json
COPY --from=builder /app/apps/services/notification-service/prisma ./apps/services/notification-service/prisma

USER node
EXPOSE 3006

CMD ["node", "apps/services/notification-service/dist/main.js"]
