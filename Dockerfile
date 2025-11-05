# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS base
# Prisma engines require openssl on Alpine
RUN apk add --no-cache libc6-compat openssl
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# ---------- deps: install node modules + generate Prisma client
FROM base AS deps
# copy only what we need for deps + prisma generate
COPY package*.json ./
COPY prisma ./prisma
# install with dev deps so "prisma" CLI is available
RUN if [ -f package-lock.json ]; then \
      npm ci --include=dev; \
    else \
      npm install --include=dev; \
    fi
# generate Prisma client now that schema + CLI exist
RUN npx prisma generate

# ---------- builder: build Next.js app (standalone)
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next.js standalone requires output=standalone in next.config.js
RUN npm run build
# optional: remove dev deps after build
RUN npm prune --omit=dev

# ---------- runner: minimal image
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy standalone output created by Next.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Prisma client uses engines at runtime; include schema if you keep it nearby
COPY prisma ./prisma

EXPOSE 3000
CMD ["node", "server.js"]
