# propstgonz-web

My personal portfolio/site — built with [Astro](https://astro.build), server-rendered,
minimal dependencies by design. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for
a detailed look at the backend, its API routes, and how the blog integrates with an
external content source.

## Pages

| Route | What it is |
|---|---|
| `/` | Home — about me, socials, click counter, IP widget, blog highlight, contact form, philosophy, changelog, stack, rigs teaser |
| `/rigs` | Rigs (my machines, original specs verbatim from the pre-rewrite site), full stack, FAQ teaser |
| `/faq` | Frequently asked questions |
| `/links` | Sites I like, grouped by category |
| `/blog` | Post list, pulled from [propstgonz-portfolio-backend](https://github.com/propstgonz/propstgonz-portfolio-backend) |
| `/posts/[slug]` | Individual post |

## Tech stack

- **Astro 6**, `output: 'server'`, `@astrojs/node` adapter (`standalone` mode)
- **Tailwind CSS 4** via `@tailwindcss/vite` — theme tokens and reusable
  component classes live in `src/styles/global.css` (`@theme` / `@layer components`)
- **nodemailer** for the contact form
- **sharp**, via `astro:assets`, to serve the stack logos as optimized WebP
- **pnpm** as the package manager
- No UI framework. Interactivity is plain, component-scoped `<script>`
  blocks — see "Component structure" below.
- No markdown/sanitization/schema-validation libraries — both are
  hand-rolled in `src/lib/` on purpose (see architecture doc for why)

## Project structure

```
src/
  types/        one file per domain — the shape of each piece of data
  data/         the actual content, typed against src/types/
  components/   one responsibility per component (see below)
  layouts/      Layout.astro — <head>, ClientRouter, global styles
  pages/        routes + API routes (src/pages/api/)
  lib/          hand-rolled markdown renderer + external posts API client
  assets/       stack logos (imported via astro:assets) + client scripts
docs/
  ARCHITECTURE.md   backend routes, external API contract, security notes
```

`src/data/` and `src/types/` are split by domain (`aboutme`, `tags`,
`socials`, `tools`, `computers`, `logs`, `faq`, `links`) instead of one
big file — that's a deliberate change from the previous version of this
site, which had all content mixed into a handful of files and became hard
to maintain.

## Component structure

Every interactive piece of the page lives in its own `.astro` component
with its own scoped `<script>` — the vanilla-JS equivalent of an Astro
island, since there's no UI framework in this project. Notable ones:

- `Avatar.astro` / `Typewriter.astro` — persisted across navigations
  (`transition:persist`) so they don't reset on every page change
- `ClickCounter.astro`, `ContForm.astro`, `IP.astro`, `Logs.astro`, `Faq.astro` —
  re-initialize on every `astro:page-load` event so they keep working
  correctly across client-side navigations (View Transitions replace DOM
  nodes on every route change; see architecture doc for details)
- `BlogHighlight.astro`, `RigsHighlight.astro`, `Philosophy.astro`,
  `LinkCategoryBlock.astro` — content teasers/blocks, no scripts

## Environment variables

Copy `.env.example` to `.env` and fill in SMTP credentials (required for
the contact form) and `POSTS_API_ENDPOINT` (optional — the blog shows an
empty state without it). Full reference in `docs/ARCHITECTURE.md`.

## Development

```bash
corepack enable
pnpm install
pnpm dev
```

## Production (without Docker)

```bash
pnpm build
pnpm start
```

## Production (Docker + Traefik)

```bash
docker compose build --no-cache --pull
docker compose up -d --remove-orphans
```

The click counter persists to a bind mount on the host
(`/media/raid/database/portfolio-counter`, see `docker-compose.yml`) —
make sure that path exists on the host before the first `docker compose up`,
and check write permissions if the container reports errors persisting
the count.

This service shares the `traefik-net` Docker network with
[propstgonz-portfolio-backend](https://github.com/propstgonz/propstgonz-portfolio-backend)
— that network must already exist on the host (`docker network ls`) before
`docker compose up`, since it's declared `external: true` here rather than
created by this compose file. Port `4321` is also published to the host
(not just routed through Traefik) so external health checks — including
the Jenkins pipeline's `curl localhost:4321` — can reach the container
directly.

CI/CD is a Jenkins pipeline (`Jenkinsfile`) with five stages: Checkout →
Build → Deploy → Health check → Cleanup.
