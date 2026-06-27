# Stage 1: Build TypeScript
FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@9.5.0

# Copy root configs
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json .npmrc tsconfig.base.json ./

# Copy workspace package.json files
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/shared/package.json ./packages/shared/
COPY packages/xiangqi-core/package.json ./packages/xiangqi-core/
COPY packages/engine-client/package.json ./packages/engine-client/
COPY apps/api/package.json ./apps/api/

# Copy tsconfig files for all packages
COPY packages/typescript-config/*.json ./packages/typescript-config/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/xiangqi-core/tsconfig.json ./packages/xiangqi-core/
COPY packages/engine-client/tsconfig.json ./packages/engine-client/
COPY apps/api/tsconfig.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/shared/src ./packages/shared/src
COPY packages/xiangqi-core/src ./packages/xiangqi-core/src
COPY packages/engine-client/src ./packages/engine-client/src
COPY apps/api/src ./apps/api/src
COPY apps/api/nest-cli.json ./apps/api/
COPY apps/api/tsconfig.build.json ./apps/api/ 2>/dev/null || true

# Build all packages in dependency order
RUN pnpm run build --filter=@repo/api

# Stage 2: Runtime
FROM node:22-alpine AS runtime
RUN apk add --no-cache libstdc++ libgcc

# Create non-root user
RUN addgroup -S xiangqi && adduser -S xiangqi -G xiangqi

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Copy workspace node_modules for internal packages
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/xiangqi-core/dist ./packages/xiangqi-core/dist
COPY --from=builder /app/packages/engine-client/dist ./packages/engine-client/dist

RUN chown -R xiangqi:xiangqi /app

USER xiangqi

ENV NODE_ENV=production
ENV ENGINE_PATH=/usr/local/bin/pikafish
ENV PORT=3000

EXPOSE 3000

WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
