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
- the visitor IP needs to be read from request headers,
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

Backs the click counter on the homepage.

| Method | Behavior |
|---|---|
| `GET`  | Reads the current count from disk and returns `{ count }`. |
| `POST` | Increments the count by 1, persists it, returns the new `{ count }`. |

State is stored as a single JSON file at `process.env.COUNTER_FILE`
(default: `/tmp/propstgonz-counter.json`). This is intentionally simple —
no database — since it's a single counter with no concurrency requirements
beyond "don't lose the count on redeploy." In Docker, `COUNTER_FILE` is
pointed at a bind-mounted path on the host (see `docker-compose.yml`) so
the count survives container rebuilds.

Astro's built-in CSRF protection (`security.checkOrigin`, on by default)
rejects `POST` requests whose `Origin` header doesn't match the site's own
origin. This is expected and correct — it's what stops third-party pages
from incrementing your counter via a forged request. It only applies to
`POST`; the `GET` is unauthenticated by design (public counter value).

### `GET /api/whoami`

Returns the caller's IP as `{ ip }`, resolved server-side from
`clientAddress` / the `X-Forwarded-For` header set by Traefik. No external
"what is my IP" service is called — this was previously a client-side
call to `api.ipify.org`; it's now resolved entirely from the incoming
request, which is both faster and doesn't leak the visit to a third party.

Used by two components: the homepage `IP` widget, and the "do you know
what my IP is" FAQ joke (`Faq.astro` hydrates a `#client-ip` span with the
same endpoint).

### `POST /api/sendMail`

Backs the contact form (`ContForm.astro`). Accepts `multipart/form-data`
(not JSON — the client sends a real `FormData` object, and this route
reads it with `request.formData()`; the two used to be mismatched, which
is why the form silently didn't work before this rewrite).

Required fields: `name`, `email`, `message` — all validated as non-empty
strings server-side before anything is sent. On success, sends mail via
`nodemailer` using SMTP credentials from environment variables (see
`.env.example`). Returns `{ ok: true }` or `{ error: string }` with an
appropriate HTTP status.

## Blog: the one external API integration

The blog is the only feature that talks to an external service, configured
via the `POSTS_API_ENDPOINT` environment variable. All of this logic lives
in `src/lib/api.ts` and `src/lib/markdown.ts` — there is no dependency
(no `marked`, no schema-validation library) involved; both the HTTP layer
and the markdown rendering are hand-rolled on purpose, to keep the
dependency surface as small as possible.

### Contract

`POSTS_API_ENDPOINT` is expected to return a JSON array of post metadata:

```json
[
  { "id": "some-id", "url": "https://your-posts-host/some-post.md" }
]
```

Each `url` is expected to serve raw Markdown as plain text when fetched.

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
            │  origin-check: url's origin must match POSTS_API_ENDPOINT's
            │  origin, or the fetch is refused                              ← security boundary
            │  fetch(url)                  [5s timeout]
            ▼
    src/lib/markdown.ts: markdownToHtml(markdown)
            │  escapes all HTML first, then applies markdown rules
            │  (headings, bold/italic, inline code, code blocks, lists,
            │  http(s)/mailto links only)
            ▼
    rendered as trusted HTML via set:html in posts/[slug].astro
```

### Why the origin check matters

`getPosts()` returns whatever `url` values the external endpoint gives it.
Without a check, `getPostContent()` would happily `fetch()` **any** URL an
attacker could get into that response (if the endpoint were ever
compromised, or if it proxies untrusted input) — including internal
network addresses reachable from the server (SSRF). The fix: before
fetching a post's content, `getPostContent()` requires that URL's origin to
exactly match `POSTS_API_ENDPOINT`'s origin. Anything else is refused.

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

Two components are the deliberate exception: `Avatar.astro` and
`Typewriter.astro` are marked `transition:persist` in `Header.astro`, so
they're **not** remounted on navigation at all — their running state (the
looping typewriter, the avatar video) survives across pages untouched.
`Nav.astro` is intentionally *not* persisted, since it needs to re-render
per page to highlight the correct active link.

## Environment variables

See `.env.example` for the full list. Summary:

| Variable | Used by | Required |
|---|---|---|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO` | `/api/sendMail` | Yes, for the contact form to work |
| `POSTS_API_ENDPOINT` | `/blog`, `/posts/[slug]` | No — blog shows an empty state if unset |
| `COUNTER_FILE` | `/api/counter` | No — defaults to `/tmp/propstgonz-counter.json` |

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
