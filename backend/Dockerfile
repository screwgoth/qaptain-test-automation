# Multi-stage build for backend (monorepo-aware)
# Build context should be repository root
FROM node:20-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install all dependencies (workspace-aware)
RUN npm install

# Copy backend source
COPY backend ./backend

# Build backend
WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY --from=builder /app/backend/package*.json ./

# Install production dependencies (includes tsx for seeding)
RUN npm install --omit=dev

# Copy Prisma schema, migrations, and seed
COPY --from=builder /app/backend/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy built files
COPY --from=builder /app/backend/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "dist/index.js"]
