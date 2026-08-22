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
COPY backend/package.json ./backend/

# Copy tsconfig files for all packages
COPY packages/typescript-config/*.json ./packages/typescript-config/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/xiangqi-core/tsconfig.json ./packages/xiangqi-core/
COPY packages/engine-client/tsconfig.json ./packages/engine-client/
COPY backend/tsconfig.json ./backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/shared/src ./packages/shared/src
COPY packages/xiangqi-core/src ./packages/xiangqi-core/src
COPY packages/engine-client/src ./packages/engine-client/src
COPY backend/src ./backend/src
COPY backend/nest-cli.json ./backend/
COPY backend/tsconfig.build.json ./backend/

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
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/package.json

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

WORKDIR /app/backend
CMD ["node", "dist/main.js"]
