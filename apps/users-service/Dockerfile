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

# Copy users-service package
COPY apps/users-service/package.json ./apps/users-service/
COPY apps/users-service/tsconfig.json ./apps/users-service/
COPY apps/users-service/nest-cli.json ./apps/users-service/
COPY apps/users-service/src ./apps/users-service/src

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared-kernel first
WORKDIR /app/apps/shared-kernel
RUN pnpm build

# Build users-service
WORKDIR /app/apps/users-service
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

# Copy users-service
COPY --from=builder /app/apps/users-service/package.json ./apps/users-service/
COPY --from=builder /app/apps/users-service/dist ./apps/users-service/dist

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

WORKDIR /app/apps/users-service

EXPOSE 3001

CMD ["node", "dist/main.js"]
