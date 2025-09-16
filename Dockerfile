## Clean optimized multi-stage Dockerfile for api-highland
# Stages:
# 1) build: install dev deps and compile TypeScript
# 2) deps: install production-only node_modules (cached separately)
# 3) runtime: smallest image with production node_modules and built assets

FROM node:18.20.0-alpine3.18 AS build
WORKDIR /app

# Install dev dependencies (use CI if lockfile exists). This stage includes tsc.
COPY package*.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund || npm install

# Copy sources and build
COPY . .
RUN npx tsc --build

FROM node:18.20.0-alpine3.18 AS deps
WORKDIR /app
COPY package*.json ./
# Install production deps only, optimized for cache
RUN npm ci --only=production --no-audit --no-fund || npm install --omit=dev

FROM node:18.20.0-alpine3.18 AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy production node_modules and built dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Minimal metadata
COPY package*.json ./

# Create non-root user and fix ownership
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && chown -R appuser:appgroup /app
USER appuser

EXPOSE 3001

# Healthcheck: use node runtime to avoid adding curl/wget to image
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+ (process.env.PORT || 3001) +'/health', res => { if (res.statusCode !== 200) process.exit(1) })" || exit 1

CMD ["node", "dist/index.js"]

