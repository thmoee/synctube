# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy root package.json and pnpm-lock.yaml
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy the backend package.json
COPY apps/backend/package.json ./apps/backend/

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy backend source code
COPY apps/backend/tsconfig.json ./apps/backend/
COPY apps/backend/src/ ./apps/backend/src/

# Build the TypeScript code
WORKDIR /app/apps/backend
RUN pnpm build

# Production stage
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy root package.json and pnpm-lock.yaml
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy the backend package.json
COPY apps/backend/package.json ./apps/backend/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built JavaScript files from builder stage
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Expose the port your WebSocket server runs on
EXPOSE 8080

# Use a non-root user for better security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs
USER nodejs

# Set working directory to the backend app
WORKDIR /app/apps/backend

# Start the server
CMD ["node", "dist/server.js"]

