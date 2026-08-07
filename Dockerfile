# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:lts-alpine AS builder
WORKDIR /app

RUN corepack enable

# Lockfile + manifest first for better layer caching
COPY package.json pnpm-lock.yaml .npmrc ./

# onlyBuiltDependencies in package.json/.npmrc pre-approves native build
# scripts (esbuild) so this never drops into the interactive
# `pnpm approve-builds` prompt and hangs/fails the image build.
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
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

EXPOSE 4321
ENV HOST=0.0.0.0 PORT=4321 NODE_ENV=production
CMD ["node", "dist/server/entry.mjs"]
