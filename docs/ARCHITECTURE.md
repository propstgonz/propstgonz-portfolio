# Architecture

This document describes how the site's backend is structured, what each
server route does, and how it talks to the one external API it depends on
(the blog content source). It assumes familiarity with Astro's SSR model.

## Runtime model

The site is **not static**. It's built with `output: 'server'` and the
`@astrojs/node` adapter in `standalone` mode, meaning the build produces a
self-contained Node HTTP server (`dist/server/entry.mjs`) rather than a
folder of pre-rendered HTML. Every request — page or API route — is
handled by that running Node process. This is required because:

- the contact form needs a server to send mail through SMTP,
- the click counter needs somewhere server-side to persist state,
- the blog needs to fetch and render content from an external source at
  request time.

There is no client-side framework (no React/Vue/Svelte). Interactivity is
implemented as small, self-contained `<script>` blocks scoped to individual
`.astro` components — the vanilla-JS equivalent of Astro islands. Each
interactive component re-initializes itself on the `astro:page-load` event
so it keeps working correctly across client-side navigations (see
"View Transitions" below).

## Server routes (`src/pages/api/`)

All routes live under `src/pages/api/` and are plain Astro
[`APIRoute`](https://docs.astro.build/en/guides/endpoints/) handlers —
no separate backend process, no external framework like Express.

### `GET|POST /api/counter`

Backs the click counter (`ClickCounter.astro`). `GET` returns the current
count as `{ count }`; `POST` increments it by one and returns the new
value. `POST` requests must send a non-form `Content-Type` (the client
sends `application/json` with an empty `{}` body) — Astro's built-in CSRF
protection otherwise treats the request as a `<form>` submission and
rejects it behind Traefik; see "Bugs found and fixed" below for why. Both
`GET` and `POST` read/write a JSON file on disk — the path comes from
`COUNTER_FILE`, which in production is a bind-mounted host directory
(`/media/raid/database/portfolio-counter` — see `docker-compose.yml`'s
`volumes:`), so the count is one shared number for every visitor and
survives container rebuilds/redeploys.

Concurrent `POST`s are serialized through an in-memory lock (a resolved
promise chained onto for each request) before the read-modify-write
cycle runs, so two clicks arriving close together can't both read the
same starting count and silently lose one of the increments. This only
guards against races within a single Node process, which is fine here —
this deployment only ever runs one instance of the container.

This route previously broke silently in production because the bind-mounted
host path didn't exist yet (or had the wrong permissions after a
redeploy), so every write failed quietly and the count reset — see "Bugs
found and fixed" below. The fix wasn't to drop server-side persistence;
it was to make sure the host path always exists before the container
starts, which is now the Jenkins pipeline's job (`Preflight` stage runs
`mkdir -p` on it before every deploy).

### `GET /api/counter/stream`

Server-Sent Events endpoint that pushes the new count to every open tab
the moment anyone's `POST /api/counter` writes it, so the number on the
homepage goes up live for every visitor watching, not just the one who
clicked. `ClickCounter.astro` opens exactly one `EventSource` per tab
(guarded at module scope so it survives re-running `setup()` on every
client-side navigation) and re-queries `#counter-num` on every message
instead of holding a reference to it, since View Transitions replace that
node on navigation.

The route itself holds open connections with a `ReadableStream`, backed
by an in-process `EventEmitter` (`src/lib/counterEvents.ts`) that
`/api/counter`'s `POST` handler emits on after a successful write — no
external pub/sub, no polling, just callbacks held in the same Node
process for as long as this deployment only ever runs one instance of
the container. A 25-second heartbeat comment keeps the connection alive
through Traefik, which (like most proxies) will otherwise close an idle
connection after its own timeout; `docker-compose.yml`'s `no-buffer`
middleware is what lets chunks reach the browser as they're written
instead of sitting in Traefik's response buffer until it fills up.

### `GET /api/latest-posts`

Returns the 3 most recent post titles as `{ posts: [{ title, slug }] }`,
for the blog teaser on the homepage (`BlogHighlight.astro`). This exists
specifically so the homepage's initial render never depends on the blog
backend: `BlogHighlight.astro` renders a static fallback immediately and
fetches this endpoint **client-side**, after the page has already
painted, swapping in the real list if it arrives. Previously
`BlogHighlight.astro` called `getPosts()` directly during SSR, which
meant the *entire homepage response* — on every single visit, and on
every client-side navigation back to `/` — waited on the blog backend
being fast and reachable. If that backend was ever slow (cold Mongo
query, network hiccup) or briefly unreachable, the whole site felt like
it was hanging, not just the blog. `/blog` and `/posts/[slug]` still
fetch server-side, since fetching posts is the entire point of visiting
those pages — but nothing else on the site should ever wait on a
third-party service it doesn't need.

### `POST /api/sendMail`

Backs the contact form (`ContForm.astro`). Accepts `multipart/form-data`
(not JSON — the client sends a real `FormData` object, and this route
reads it with `request.formData()`; the two used to be mismatched, which
is why the form silently didn't work before this rewrite). Supports one
optional file attachment (`file` field), capped at 25MB, forwarded as a
`nodemailer` attachment.

Required fields: `name`, `email`, `message` — all validated as non-empty
strings server-side before anything is sent. On success, sends mail via
`nodemailer` using SMTP credentials from environment variables (see
`.env.example`). Returns `{ ok: true }` or `{ error: string }` with an
appropriate HTTP status.

### `POST /api/track`

Records one visit for the weekly metrics report (see "Visitor metrics
and consent" below). Only ever called by `ConsentBanner.astro`, and only
after the visitor has explicitly accepted — nothing calls this route,
and no IP is ever resolved or stored, for a visitor who declines or
hasn't answered yet. Resolves the caller's IP with the same
`resolveClientIp()` helper as `/api/whoami` (`src/lib/ip.ts`), records it
via `src/lib/metrics.ts`, and returns `{ ok: true }`. Like `/api/counter`,
requires a non-form `Content-Type` on the request for the same
CSRF-related reason — see "Bugs found and fixed" below.

## Visitor IP widget

The `IP` widget on the homepage and the "do you know what my IP is" FAQ
joke (`Faq.astro`'s `#client-ip` span) both call the same
`initIpDisplay()` helper (`src/assets/scripts/whoami.ts`), which fetches
`https://api.ipify.org?format=json` **directly from the browser**. This
has to run client-side: a server-side call to ipify would report this
server's own public IP, not the visitor's, since ipify only ever sees
whoever's TCP connection reaches it. There used to be an `/api/whoami`
route that resolved the IP server-side from proxy headers instead (no
third-party call at all) — that worked correctly in production behind
Traefik, but returned a loopback address in local dev with no reverse
proxy in front to set those headers. It was replaced with the direct
client-side ipify call so the widget behaves the same way in every
environment. The route itself is still there (`resolveClientIp()` in
`src/lib/ip.ts`, shared with `/api/track` below) — just no longer wired
into the IP widget's own display logic.

`initIpDisplay()` is gated behind the same consent as `/api/track` (see
"Visitor metrics and consent" below): it checks `localStorage`'s
`propstgonz-consent` before calling ipify at all, and shows "requires
consent" instead if the visitor hasn't accepted. This isn't about this
site's own server — it never sees this call — but handing the visitor's
IP to a third party (ipify.org) is still a form of IP collection, so it
waits for the same explicit accept rather than firing unconditionally on
every page load regardless of what the visitor chose.

## Visitor metrics and consent

`ConsentBanner.astro`, included once in `Layout.astro` so it's present
on every page, gates all visitor tracking behind an explicit opt-in — a
bottom banner asking to log the visitor's IP and visit count for basic
traffic stats. The choice is remembered in `localStorage`
(`propstgonz-consent`) so it's asked at most once per browser:

- **Accept** → calls `POST /api/track` for this visit, and every visit
  after, without asking again. The IP widget (previous section) also
  starts resolving and displaying the visitor's IP from this point on.
- **Decline** → never calls `/api/track`, ever, for that browser. No IP
  is resolved or stored for a visitor who declines — the route simply
  never runs. The IP widget stays showing "requires consent" instead of
  calling ipify.org.

Both buttons dispatch a `propstgonz:consent-changed` `CustomEvent` on
`window` after recording the choice, so any IP widget already on screen
updates immediately instead of only taking effect on the next
navigation — `IP.astro` and `Faq.astro` both listen for it alongside
their usual `astro:page-load` re-init.

The banner's script deliberately does **not** hook into the
`astro:page-load` event the way most interactive components in this
codebase do (see "View Transitions" below). That event fires on every
client-side navigation, not just the first real page load, so binding
the tracking call to it would count one visitor browsing several pages
in one sitting as several "visits." Instead the tracking check runs once
at module scope, which itself only executes once per real browser
session — the module stays loaded across View Transitions' client-side
navigations without re-running, the same property that lets
`ClickCounter.astro`'s `EventSource` connection open exactly once too.

`src/lib/metrics.ts` persists to a JSON file (`METRICS_FILE`, the same
bind-mounted directory as the click counter's `COUNTER_FILE` — see
`docker-compose.yml`) with two parts:

- `perIp` — a lifetime count and last-seen timestamp per IP, never
  cleared.
- `log` — every visit since the last weekly report, cleared once that
  report is actually sent.

A `setInterval` inside that module, started as a side effect the first
time it's imported (which happens at server startup, since Astro's Node
adapter loads every route module to build its routing manifest), checks
hourly whether 7 days have passed since `lastReportAt`. When they have,
it emails `METRICS_REPORT_TO` (via the same `nodemailer` + `SMTP_*`
setup as the contact form) the number of unique IPs and the total number
of visits in `log`, then clears `log` and resets `lastReportAt` — so the
next report only covers the week that just elapsed. If sending fails for
any reason (SMTP hiccup, `METRICS_REPORT_TO` not set), `log` and
`lastReportAt` are left untouched, so the next hourly check retries with
the same accumulated data instead of silently losing a week's numbers.
No external cron, no extra container — just a periodic check against the
same JSON file every visit already writes to, living for as long as the
Node process does.

## Blog: the one external API integration

The blog is the only feature that talks to an external service — the real
[propstgonz-portfolio-backend](https://github.com/propstgonz/propstgonz-portfolio-backend)
(Express + Prisma/MongoDB), configured via `POSTS_API_ENDPOINT`. All of
this logic lives in `src/lib/api.ts` and `src/lib/markdown.ts` — no
dependency (no `marked`, no schema-validation library) is involved; both
the HTTP layer and the markdown rendering are hand-rolled on purpose, to
keep the dependency surface as small as possible.

### Contract

`GET {POSTS_API_ENDPOINT}` returns:

```json
{
  "status": "success",
  "data": [
    { "id": "some-id", "url": "https://bucket-host/some-post.md" }
  ],
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

`getPosts()` reads the array from `.data` (falling back to treating the
body itself as the array, for compatibility with a plainer contract).
Each `url` is expected to serve raw Markdown as plain text when fetched —
in the real deployment, `url` points at a **different host** than the API
itself: a separate nginx "bucket" service that just serves the raw
Markdown files. `POSTS_CONTENT_ORIGINS` (comma-separated) tells
`getPostContent()` which origins besides `POSTS_API_ENDPOINT`'s own are
allowed to be fetched for actual post content — see the origin check
below for why this matters.

### Request flow

```
Browser → GET /blog
            │
            ▼
    src/pages/blog.astro
            │  calls getPosts()
            ▼
    src/lib/api.ts: getPosts()
            │  fetch(POSTS_API_ENDPOINT)   [3s timeout]
            │  unwraps { status, data, timestamp } → data
            │  validates every array item has string id + url
            │  (silently drops anything malformed instead of throwing)
            ▼
    renders list of valid posts as links to /posts/[slug]

Browser → GET /posts/some-post
            │
            ▼
    src/pages/posts/[slug].astro
            │  calls getPosts() again to find the matching entry by slug
            │  calls getPostContent(url)
            ▼
    src/lib/api.ts: getPostContent(url)
            │  origin-check: url's origin must be POSTS_API_ENDPOINT's own
            │  origin OR one listed in POSTS_CONTENT_ORIGINS, or the      ← security boundary
            │  fetch is refused
            │  fetch(url)                  [5s timeout]
            ▼
    src/lib/markdown.ts: markdownToHtml(markdown)
            │  escapes all HTML first, then applies markdown rules
            │  (headings, bold/italic, inline code, code blocks, lists,
            │  http(s)/mailto links only)
            ▼
    rendered as trusted HTML via set:html in posts/[slug].astro
```

### Why the origin check matters — and why it's a list, not one origin

`getPosts()` returns whatever `url` values the external endpoint gives it.
Without a check, `getPostContent()` would happily `fetch()` **any** URL an
attacker could get into that response (if the endpoint were ever
compromised, or if it proxies untrusted input) — including internal
network addresses reachable from the server (SSRF). Earlier versions of
this check only allowed `POSTS_API_ENDPOINT`'s own origin, which broke
the blog entirely in production: the real backend's API and the real
content host are two different origins by design (see Contract above).
`POSTS_CONTENT_ORIGINS` makes the allow-list explicit and configurable
instead of assuming API and content always live on the same origin.

### Recommended networking: internal container DNS, not the public URL

`POSTS_API_ENDPOINT` can be the public URL
(`http://baronette.es:3742/api/posts`) or, if the web and backend
containers share the same Docker network (`traefik-net` in
`docker-compose.yml`), the internal container hostname
(`http://propstgonz-backend:3000/api/posts`, matching `container_name` in
the backend repo's own `docker-compose.yml`). The internal address is
recommended: it skips a round trip out to the public internet and back in
through NAT/Traefik, which is slower and, on some router/NAT setups, can
hang or fail outright (a same-host "hairpin NAT" request). The content
host (the nginx bucket) is a separate concern — its URLs come from
whatever's stored in the backend's database, so it can't be swapped to an
internal address the same way.

### Why markdown is hand-rolled instead of using a library

Two reasons, both deliberate:

1. **Fewer dependencies** — this was an explicit requirement for this
   project (see the Docker section below for the pnpm situation that
   motivated it further).
2. **Sanitization by construction** — `markdownToHtml()` escapes all input
   as HTML *before* applying any markdown rule, so there's no path for a
   `<script>` tag (or any other raw HTML) coming from the external posts
   endpoint to end up in the rendered page. Links are restricted to
   `http(s)://` and `mailto:` schemes only (no `javascript:` URIs).

If `POSTS_API_ENDPOINT` is unset, the blog renders an empty state instead
of erroring — the rest of the site works fine without it.

## View Transitions and per-component re-initialization

The site uses Astro's `<ClientRouter />` (View Transitions) for SPA-like
navigation. This has one consequence every interactive component has to
account for: **DOM nodes are replaced on every navigation**, so any script
that captures a DOM reference once, at module scope, will end up holding a
reference to a *detached* node after the user navigates away and back.

The fix used consistently across this codebase (`ClickCounter.astro`,
`ContForm.astro`, `IP.astro`, `Logs.astro`, `Faq.astro`): wrap all DOM
queries and event binding inside a `setup()` function, call it once
immediately, and call it again on every `astro:page-load` event. That way
each navigation re-queries the *current* DOM instead of relying on a stale
reference.

A few components are the deliberate exception: `Avatar.astro` and
`Typewriter.astro` are marked `transition:persist` in `Header.astro`, so
they're **not** remounted on navigation at all — their running state (the
looping typewriter, the avatar video) survives across pages untouched.
`ConsentBanner.astro` is persisted the same way in `Layout.astro`, for a
different reason: it needs its tracking check to run exactly once per
browser session (see "Visitor metrics and consent" above), not once per
page like the `setup()` pattern above would give it, and persisting it
also means an undecided visitor who clicks a link before answering keeps
seeing the same banner instead of it vanishing with the old DOM.
`Nav.astro` is intentionally *not* persisted, since it needs to re-render
per page to highlight the correct active link.

## Environment variables

See `.env.example` for the full list. Summary:

| Variable | Used by | Required |
|---|---|---|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO` | `/api/sendMail` | Yes, for the contact form to work |
| `POSTS_API_ENDPOINT` | `/blog`, `/posts/[slug]`, `/api/latest-posts` | No — blog shows an empty state if unset |
| `POSTS_CONTENT_ORIGINS` | `/posts/[slug]` | No — but every post will fail to load without it, since content lives on a different origin than the API (see Blog section above) |
| `COUNTER_FILE` | `/api/counter` | No — falls back to a tmp path locally; Docker sets it to the bind-mounted host path in production |
| `METRICS_FILE` | `/api/track`, weekly report | No — falls back to a tmp path locally; Docker sets it to the bind-mounted host path in production |
| `METRICS_REPORT_TO` | Weekly report (`src/lib/metrics.ts`) | No — visits still get recorded for consenting visitors, the weekly email just never sends without it |

## Docker & the pnpm `onlyBuiltDependencies` fix

pnpm blocks native postinstall/build scripts of dependencies by default
and normally prompts interactively (`pnpm approve-builds`) to approve
them — which hangs a non-interactive Docker build. Two packages in this
project need their build scripts to run: `esbuild` (used internally by
Vite/Astro) and `sharp` (used by `astro:assets` to serve the stack logos
as optimized WebP). Both are pre-approved statically via
`pnpm.onlyBuiltDependencies` in `package.json` (backed up by an
equivalent `.npmrc` entry), so `pnpm install --frozen-lockfile` completes
non-interactively in CI/Docker.

`sharp` is also listed as a **direct** dependency in `package.json`, not
just relied on as Astro's optional dependency — in pnpm's strict
`node_modules` layout, a transitive optional dependency isn't hoisted to
the top-level `node_modules/`, and the built `dist/server` bundle resolves
bare imports from there. Without the direct dependency, `astro:assets`'
image endpoint fails at runtime with `MissingSharp` even though the build
itself succeeds.

## Deploy safety: fixed image tag + automatic rollback

The Jenkins pipeline (`Jenkinsfile`) is designed around one failure mode
that matters more than any other for a personal site: **a bad deploy
should never leave the site down**. Two things make that possible:

1. **`docker-compose.yml` pins `image: propstgonz-web:latest`** instead
   of relying on Compose's default image name, which is derived from the
   project directory name. Without this, the built image's tag would
   silently change if Jenkins ever ran the job from a different
   workspace path (a new job, a renamed folder, a second agent) — and a
   rollback step tagging "the previous image" would have no stable name
   to target.
2. **The `Snapshot previous image` stage tags the current `:latest` as
   `:rollback` before `Build` overwrites it.** This costs nothing (it's
   a tag, not a copy) and means there's always a known-good image on the
   host to fall back to, right up until the moment a new one is confirmed
   working.

If `docker compose up` fails outright, or the container starts and then
exits before the health check's first successful poll, the pipeline
re-tags `:rollback` back onto `:latest` and runs
`docker compose up -d --no-build` — which reuses the already-tagged image
instead of rebuilding — then fails the build. The net effect: the commit
that broke things is clearly marked as failed in Jenkins, but the site
itself is back on the last version that worked, unattended. The one case
this can't help is the very first deploy on a fresh host, where there's
no previous image to snapshot — the pipeline logs that explicitly instead
of pretending a rollback happened.

This is deliberately narrower than a generic blue/green or canary setup:
there's only one host and one container, downtime during the brief
`docker compose up` swap is expected and acceptable, and the goal is
purely "don't stay down because of a bad commit," not zero-downtime
deploys.

### Why "crashed" and "slow to respond" are handled differently

The health check stage distinguishes two states that look similar from
the outside but mean very different things:

- **The container process exited.** Checked via
  `docker inspect -f '{{.State.Running}}'`. This can only mean the app
  itself failed to start — a thrown exception during boot, a missing
  required env var, a port already in use inside the container. There is
  nothing to wait for; retrying the HTTP probe would just fail forever.
  This triggers rollback.
- **The container is running but hasn't answered a request yet.** This
  covers a slow cold start or a brief moment where the Node process is up
  but not yet listening. The container is confirmed alive, so there's no
  reason to treat this as a failed deploy — it's logged as a warning
  (with the last 80 lines of container logs attached for whoever looks at
  the build) and the pipeline continues to `SUCCESS`.

The probe itself runs as `docker exec propstgonz-web wget ...
http://127.0.0.1:4321/` — from *inside* the container — rather than
curling `localhost:4321` from the Jenkins agent. Jenkins commonly runs
containerized itself, in which case its own "localhost" is a different
network namespace from the host's, so a plain `curl` from the agent would
never reach the port `docker-compose.yml` publishes no matter how healthy
the deploy is. `docker exec` sidesteps that entirely: it goes through the
same Docker socket every other `docker` command in this pipeline already
uses, and always lands inside the target container's own network
namespace regardless of where Jenkins itself happens to run.

Conflating these two in an earlier version of this pipeline (a single
`curl -sf ... || exit 1` after a fixed `sleep 10`) is what used to mark
genuinely successful deploys as failed on a slow cold start, while
providing no actual recovery for the case that matters — a container that
crashed outright.

## Bugs found and fixed after the first production deploy

These were found by actually cloning and reading
[propstgonz-portfolio-backend](https://github.com/propstgonz/propstgonz-portfolio-backend)
and comparing against real Jenkins deploy logs, rather than assumed —
kept here so the reasoning isn't lost the next time something looks
similar.

- **The blog silently never worked.** `getPosts()` assumed
  `POSTS_API_ENDPOINT` returned a bare JSON array. The real backend wraps
  it in `{ status, data, timestamp }`, so `Array.isArray(body)` was always
  `false` and every post silently vanished. Fixed by unwrapping `.data`.
- **Post content fetches were always rejected.** The origin-check
  (SSRF guard) required a post's `url` to share `POSTS_API_ENDPOINT`'s own
  origin. In the real deployment, post content is served from a separate
  nginx "bucket" service on a different host entirely. Fixed with the
  configurable `POSTS_CONTENT_ORIGINS` allow-list.
- **The click counter incremented by 2 per click** (and the contact form
  could double-submit on a fresh page load). `astro:page-load` fires on
  the *initial* page load too (since Astro 5.4.2), not just subsequent
  navigations — every affected component was calling `setup()` immediately
  **and** registering it as a listener for that same event, double-binding
  every handler the first time a page was opened. Fixed by relying solely
  on the `astro:page-load` listener everywhere.
- **Jenkins deploys failed at the health check stage.** `docker-compose.yml`
  never published port 4321 to the host, so `curl localhost:4321` from the
  Jenkins agent had nothing to connect to even though the container was
  healthy. Fixed by adding a `ports:` mapping.
- **Wrong Docker network name(s).** An earlier version of this file used
  `proxy` + `internal` as two separate external networks, guessed from a
  stale copy of the original `docker-compose.yml`. The actual host network
  is a single `traefik-net`, confirmed by reading the real backend's own
  `docker-compose.yml` (which only ever attaches to `traefik-net`).
- **The whole site felt slow, not just the blog.** The homepage's blog
  teaser used to fetch posts server-side (`await getPosts()`) as part of
  rendering `/`, so *every* visit to the homepage — and every client-side
  navigation back to it — waited on the blog backend, even though that
  data isn't essential to the page. Combined with the two contract bugs
  above (which made the fetch effectively pointless anyway), this was the
  main cause of "everything hangs on first load" and "navigating feels
  stuck." Fixed by moving that fetch to `/api/latest-posts`, called
  client-side after the page has already rendered — see the route's own
  section above.
- **The click counter didn't persist.** It wrote to a JSON file at a
  bind-mounted host path; if that path didn't exist yet, or had the wrong
  owner/permissions after a redeploy, writes failed silently and the count
  reset. This was first "fixed" by dropping server-side persistence
  entirely and moving the count to `localStorage` — which worked, but
  traded away the one thing that made it fun: a single shared number
  going up for every visitor, not a private per-browser count. The actual
  fix was to stop treating the host path as something that might or might
  not exist: the Jenkins `Preflight` stage now runs `mkdir -p` on
  `/media/raid/database/portfolio-counter` before every single deploy, so
  the bind mount always has somewhere to write, and `/api/counter` (see
  "Server routes" above) is back to being the source of truth.
- **The visitor IP showed a loopback/container address in local dev.**
  The IP widget used to resolve the visitor's IP server-side
  (`/api/whoami`) from proxy headers Traefik sets in production
  (`X-Forwarded-For`, `CF-Connecting-IP`, `X-Real-IP`), rejecting any
  candidate in a private/loopback range before accepting it. That worked
  correctly in production but, with no reverse proxy in front locally,
  had nothing to fall back on except the raw socket address —
  `127.0.0.1`/`::1`. Replaced with a direct client-side call to
  `api.ipify.org` (see "Visitor IP widget" above), which reports the
  browser's real public IP the same way in every environment, at the
  cost of depending on a third-party service.
- **Jenkins marked working deploys as failed.** The health check stage
  used to call `error()` on a failed `curl`, failing the whole pipeline
  even though `docker compose up` had already succeeded and the container
  was running — "failure" there was really just "health check couldn't
  confirm it yet," not "the deploy didn't happen." It's now informational
  only: it retries for up to 30 seconds and logs the outcome (including
  the container's recent logs on failure) but never fails the build by
  itself. `Build` and `Deploy` failing for real still fails the pipeline,
  as they should.
- **The health check never once succeeded, even on healthy deploys.**
  Every single attempt logged `HTTP 000` — curl's code for "couldn't
  connect at all" — while the container logs in that same build showed
  `@astrojs/node` had already started listening. Jenkins itself runs in
  its own container (`/var/jenkins_home/...`), so `curl localhost:4321`
  executed as a plain agent step was hitting the *Jenkins* container's
  loopback interface, not the host's — the published port was never
  reachable from there in the first place, regardless of how the deploy
  went. This was silent because the stage is informational-only by
  design (see above), so it just logged a warning on every build forever
  instead of ever actually confirming anything. Fixed by running the
  probe with `docker exec propstgonz-web wget ...` instead of curling
  from the agent — see "Why crashed and slow to respond are handled
  differently" above.
- **The click counter didn't work on the deployed site at all.** Every
  `POST /api/counter` returned `403 Cross-site POST form submissions are
  forbidden` — Astro's built-in CSRF protection (`security.checkOrigin`,
  on by default) treats a POST with no explicit non-form `Content-Type`
  as a `<form>` submission and requires its `Origin` header to exactly
  match the request's own computed origin. Behind Traefik, `@astrojs/node`
  doesn't read `X-Forwarded-Proto`, so it always computes its own origin
  as plain `http://...` even though Traefik terminates TLS and the
  browser's real `Origin` is `https://propstgonz.baronette.es` — scheme
  mismatch, request rejected, every time, for every visitor, regardless
  of what `Origin` header the browser actually sent. Confirmed directly
  against production: a bare POST failed, a POST with a matching `Origin`
  header *still* failed, but a POST with `Content-Type: application/json`
  succeeded immediately — that content type isn't something a plain HTML
  `<form>` can send, so Astro's form-submission heuristic doesn't apply
  the origin check to it at all. Fixed by having `ClickCounter.astro`
  send that header (and an empty JSON body) instead of trying to get
  Astro to trust the proxy's forwarded headers, which would have meant
  either a global `security.checkOrigin: false` (weakening CSRF
  protection for every route, not just this one) or configuring
  `@astrojs/node` to trust `X-Forwarded-*`, which it doesn't currently
  support doing.
