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

# Copy accounts-service package
COPY apps/accounts-service/package.json ./apps/accounts-service/
COPY apps/accounts-service/tsconfig.json ./apps/accounts-service/
COPY apps/accounts-service/nest-cli.json ./apps/accounts-service/
COPY apps/accounts-service/src ./apps/accounts-service/src

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared-kernel first
WORKDIR /app/apps/shared-kernel
RUN pnpm build

# Build accounts-service
WORKDIR /app/apps/accounts-service
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

# Copy accounts-service
COPY --from=builder /app/apps/accounts-service/package.json ./apps/accounts-service/
COPY --from=builder /app/apps/accounts-service/dist ./apps/accounts-service/dist

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

WORKDIR /app/apps/accounts-service

EXPOSE 3004

CMD ["node", "dist/main.js"]
