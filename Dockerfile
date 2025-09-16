# multi-stage Dockerfile for api-highland
# build stage
FROM node:18.20.0-alpine3.18 AS build
WORKDIR /app

# install build dependencies
COPY package*.json ./
RUN npm ci

# copy source and build
COPY . .
RUN npx tsc

# runtime stage
FROM node:18.20.0-alpine3.18 AS runtime
WORKDIR /app
ENV NODE_ENV=production

# only install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# copy built artifacts from build stage
COPY --from=build /app/dist ./dist

EXPOSE 3000

# basic healthcheck (assumes app exposes /health on PORT)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- --tries=1 --timeout=2 http://localhost:3000/health || exit 1

# default command — adjust if your entry point differs
CMD ["node", "dist/index.js"]
