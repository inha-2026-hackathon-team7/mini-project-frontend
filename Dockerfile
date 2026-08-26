# Stage 1: Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies. package-lock.json이 package.json과 어긋나 있어
# 엄격한 `npm ci` 대신 `npm install`을 사용한다. (호스트 락파일은 건드리지 않음)
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Copy source code and build the project.
# 이 프로젝트는 기본적으로 Cloudflare Worker(cloudflare-module) 프리셋으로 빌드된다.
# Node 서버(.output/server/index.mjs)로 실행하려면 Nitro 프리셋을 node-server로 지정해야 한다.
COPY . .
RUN NITRO_PRESET=node-server npm run build

# Stage 2: Production stage
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Only copy the self-contained Nitro node-server output
COPY --from=builder /app/.output ./.output

EXPOSE 3000

# Start the Nitro node-server (listens on $PORT / $HOST)
CMD ["node", ".output/server/index.mjs"]
