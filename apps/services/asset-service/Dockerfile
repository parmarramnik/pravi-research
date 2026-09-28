# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace configurations
COPY package*.json ./
COPY packages/ ./packages/
COPY apps/services/asset-service/package*.json ./apps/services/asset-service/
COPY apps/services/asset-service/prisma ./apps/services/asset-service/prisma

RUN npm install

# Copy source and build
COPY apps/services/asset-service/ ./apps/services/asset-service/

RUN npx prisma generate --schema=./apps/services/asset-service/prisma/schema.prisma
RUN npm run build --workspace=@infrasphere/shared-types
RUN npm run build --workspace=@infrasphere/shared-events
RUN npm run build --workspace=@infrasphere/shared-utils
RUN npm run build --workspace=@infrasphere/asset-service

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/services/asset-service/dist ./apps/services/asset-service/dist
COPY --from=builder /app/apps/services/asset-service/package.json ./apps/services/asset-service/package.json
COPY --from=builder /app/apps/services/asset-service/prisma ./apps/services/asset-service/prisma

USER node
EXPOSE 3001

CMD ["node", "apps/services/asset-service/dist/main.js"]
