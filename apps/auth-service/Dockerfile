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

# Copy auth-service package
COPY apps/auth-service/package.json ./apps/auth-service/
COPY apps/auth-service/tsconfig.json ./apps/auth-service/
COPY apps/auth-service/nest-cli.json ./apps/auth-service/
COPY apps/auth-service/src ./apps/auth-service/src

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared-kernel first
WORKDIR /app/apps/shared-kernel
RUN pnpm build

# Build auth-service
WORKDIR /app/apps/auth-service
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

# Copy auth-service
COPY --from=builder /app/apps/auth-service/package.json ./apps/auth-service/
COPY --from=builder /app/apps/auth-service/dist ./apps/auth-service/dist

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

WORKDIR /app/apps/auth-service

EXPOSE 3002

CMD ["node", "dist/main.js"]
