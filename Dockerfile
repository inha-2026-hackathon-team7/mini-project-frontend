# Stage 1: Build stage
FROM node:25-alpine AS builder
WORKDIR /app

# Install dependencies based on package.json
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code and build the project
COPY . .
RUN npx vite build

# Stage 2: Production stage
FROM node:25-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Only copy the production build outputs
COPY --from=builder /app/.output ./.output

EXPOSE 3000

# Start the Nitro production server
CMD ["node", ".output/server/index.mjs"]
