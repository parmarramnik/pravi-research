# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/services/risk-service/package*.json ./apps/services/risk-service/
COPY apps/services/risk-service/prisma ./apps/services/risk-service/prisma

RUN npm install

COPY apps/services/risk-service/ ./apps/services/risk-service/

RUN npx prisma generate --schema=./apps/services/risk-service/prisma/schema.prisma
RUN npm run build --workspace=@infrasphere/shared-types
RUN npm run build --workspace=@infrasphere/shared-events
RUN npm run build --workspace=@infrasphere/shared-utils
RUN npm run build --workspace=@infrasphere/risk-service

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/services/risk-service/dist ./apps/services/risk-service/dist
COPY --from=builder /app/apps/services/risk-service/package.json ./apps/services/risk-service/package.json
COPY --from=builder /app/apps/services/risk-service/prisma ./apps/services/risk-service/prisma

USER node
EXPOSE 3004

CMD ["node", "apps/services/risk-service/dist/main.js"]
