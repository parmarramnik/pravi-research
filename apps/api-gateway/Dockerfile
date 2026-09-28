# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/api-gateway/package*.json ./apps/api-gateway/

RUN npm install

COPY apps/api-gateway/ ./apps/api-gateway/

RUN npm run build --workspace=@infrasphere/shared-types
RUN npm run build --workspace=@infrasphere/shared-utils
RUN npm run build --workspace=@infrasphere/api-gateway

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api-gateway/dist ./apps/api-gateway/dist
COPY --from=builder /app/apps/api-gateway/package.json ./apps/api-gateway/package.json
COPY --from=builder /app/apps/api-gateway/src/swagger ./apps/api-gateway/dist/swagger

USER node
EXPOSE 3000

CMD ["node", "apps/api-gateway/dist/main.js"]
