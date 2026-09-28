# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/frontend/package*.json ./apps/frontend/

RUN npm install

COPY apps/frontend/ ./apps/frontend/

RUN npm run build --workspace=@infrasphere/shared-types
RUN npm run build --workspace=@infrasphere/frontend

# Production Stage
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
