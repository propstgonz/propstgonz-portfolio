# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:lts-alpine AS builder
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Disable Astro telemetry in CI
ENV ASTRO_TELEMETRY_DISABLED=1

RUN pnpm build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:lts-alpine
WORKDIR /app

RUN corepack enable

# Only production deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

EXPOSE 4321
ENV HOST=0.0.0.0 PORT=4321 NODE_ENV=production
CMD ["node", "dist/server/entry.mjs"]
