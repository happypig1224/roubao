# ==============================================================================
# Roubao (肉包) 前端多阶段构建 Dockerfile
# 运行环境: Node.js 20 Alpine (轻量、安全、最小镜像)
# 架构特性: Next.js 16 Standalone 独立输出 + Turbopack 构建
# ==============================================================================

# --- Stage 1: 依赖安装阶段 ---
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 启用 corepack 并指定 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Stage 2: 构建打包阶段 ---
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 生产环境变量注入与打包
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm build

# --- Stage 3: 生产运行阶段 ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 创建非 root 专属用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs \
    && apk add --no-cache wget

# 仅拷贝独立运行时产物
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# 存活健康探针
HEALTHCHECK --interval=20s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
