# Stage 1: Build frontend
FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@9.5.0

# Copy root configs
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json .npmrc tsconfig.base.json ./

# Copy workspace package.json files
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/shared/package.json ./packages/shared/
COPY packages/xiangqi-core/package.json ./packages/xiangqi-core/
COPY frontend/package.json ./frontend/

# Copy tsconfig files
COPY packages/typescript-config/*.json ./packages/typescript-config/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/xiangqi-core/tsconfig.json ./packages/xiangqi-core/
COPY frontend/tsconfig.json ./frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/shared/src ./packages/shared/src
COPY packages/xiangqi-core/src ./packages/xiangqi-core/src
COPY frontend/src ./frontend/src
COPY frontend/index.html ./frontend/
COPY frontend/vite.config.ts ./frontend/
COPY frontend/tailwind.config.ts ./frontend/
COPY frontend/postcss.config.js ./frontend/

# Build
RUN pnpm run build --filter=@repo/web

# Stage 2: Serve with nginx
FROM nginx:1.27-alpine AS runtime
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY infrastructure/nginx/xiangqi.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
