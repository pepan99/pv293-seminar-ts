# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.7.1 --activate

# Copy workspace configuration
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./

# Copy shared-kernel package
COPY apps/shared-kernel/package.json ./apps/shared-kernel/
COPY apps/shared-kernel/tsconfig.json ./apps/shared-kernel/
COPY apps/shared-kernel/src ./apps/shared-kernel/src

# Copy api-gateway package
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY apps/api-gateway/tsconfig.json ./apps/api-gateway/
COPY apps/api-gateway/nest-cli.json ./apps/api-gateway/
COPY apps/api-gateway/src ./apps/api-gateway/src

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared-kernel first
WORKDIR /app/apps/shared-kernel
RUN pnpm build

# Build api-gateway
WORKDIR /app/apps/api-gateway
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.7.1 --activate

# Copy workspace configuration
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./

# Copy shared-kernel
COPY --from=builder /app/apps/shared-kernel/package.json ./apps/shared-kernel/
COPY --from=builder /app/apps/shared-kernel/dist ./apps/shared-kernel/dist

# Copy api-gateway
COPY --from=builder /app/apps/api-gateway/package.json ./apps/api-gateway/
COPY --from=builder /app/apps/api-gateway/dist ./apps/api-gateway/dist

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

WORKDIR /app/apps/api-gateway

EXPOSE 3000

CMD ["node", "dist/main.js"]
