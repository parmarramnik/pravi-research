# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/services/inspection-service/package*.json ./apps/services/inspection-service/
COPY apps/services/inspection-service/prisma ./apps/services/inspection-service/prisma

RUN npm install

COPY apps/services/inspection-service/ ./apps/services/inspection-service/

RUN npx prisma generate --schema=./apps/services/inspection-service/prisma/schema.prisma
RUN npm run build --workspace=@infrasphere/shared-types
RUN npm run build --workspace=@infrasphere/shared-events
RUN npm run build --workspace=@infrasphere/shared-utils
RUN npm run build --workspace=@infrasphere/inspection-service

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/services/inspection-service/dist ./apps/services/inspection-service/dist
COPY --from=builder /app/apps/services/inspection-service/package.json ./apps/services/inspection-service/package.json
COPY --from=builder /app/apps/services/inspection-service/prisma ./apps/services/inspection-service/prisma

USER node
EXPOSE 3002

CMD ["node", "apps/services/inspection-service/dist/main.js"]
