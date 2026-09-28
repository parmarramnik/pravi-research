# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/services/ai-service/package*.json ./apps/services/ai-service/

RUN npm install

COPY apps/services/ai-service/ ./apps/services/ai-service/

RUN npm run build --workspace=@infrasphere/shared-types
RUN npm run build --workspace=@infrasphere/shared-utils
RUN npm run build --workspace=@infrasphere/ai-service

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/services/ai-service/dist ./apps/services/ai-service/dist
COPY --from=builder /app/apps/services/ai-service/package.json ./apps/services/ai-service/package.json

USER node
EXPOSE 3005

CMD ["node", "apps/services/ai-service/dist/main.js"]
