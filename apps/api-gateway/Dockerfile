FROM node:20-alpine as builder

WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Copy the shared-kernel dependency
COPY apps/shared-kernel ./apps/shared-kernel/

# Copy the service source
COPY apps/api-gateway ./apps/api-gateway/

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm --filter shared-kernel build
RUN pnpm --filter api-gateway build

FROM node:20-alpine as runner

WORKDIR /app

# Copy from build stage
COPY --from=builder /app/apps/shared-kernel/dist ./apps/shared-kernel/dist
COPY --from=builder /app/apps/api-gateway/dist ./apps/api-gateway/dist
COPY --from=builder /app/apps/api-gateway/package.json ./apps/api-gateway/package.json
COPY --from=builder /app/apps/shared-kernel/package.json ./apps/shared-kernel/package.json
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Install production dependencies only
RUN npm install -g pnpm
RUN pnpm install --prod

# Set environment variables
ENV NODE_ENV=production

# Expose the service port
EXPOSE 3000

# Start the service
CMD ["node", "apps/api-gateway/dist/main"]
