FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# =====================================================

FROM deps AS builder

ENV NODE_ENV=production

COPY . .

RUN pnpm prisma generate

RUN pnpm build

#=======================================================

FROM builder AS migrator

WORKDIR /app

CMD ["pnpm", "prisma", "migrate", "deploy"]

#=======================================================

FROM node:22-alpine AS production

RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV DATABASE_URL="file:./database/passwordManager.db"

# hasil standalone (sudah termasuk node_modules minimal + server.js)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# schema prisma dibutuhkan kalau kamu run migrate di runtime/entrypoint
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/database ./database

RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]