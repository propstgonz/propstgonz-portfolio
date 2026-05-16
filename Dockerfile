# ETAPA 1: BUILD
FROM node:lts-bullseye AS builder

RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --config.enable-pre-post-scripts=true
COPY . .
RUN pnpm run build
RUN pnpm prune --prod

# ETAPA 2: PRODUCCIÓN
FROM node:lts-bullseye AS runner

RUN corepack enable

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist

ENV HOST=0.0.0.0
ENV PORT=4321

EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]