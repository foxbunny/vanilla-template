# AGENTS.md

The entry point for any AI agent working in this repo — read it first, whatever
tool you're driving. Everything an agent needs is here and in `rules/`; nothing
below assumes a particular assistant. (See **Tooling** at the end for how this
maps onto specific tools.)

Fuller reasoning is in `README.md`; the detailed per-language rules are in
`rules/`; sharp edges already hit are in `todo/diary.md`.

## First-time setup (skip if already done)

A one-time, per-project check — gated on what's on disk, so re-reading it costs
nothing once it's done. Give the `skills/` workflows a native trigger for the tool
you're driving:

1. Look for this tool's command files (e.g. `.claude/skills/*`, `.cursor/commands/*`,
   `.github/prompts/*`). **If they already exist for every `skills/*.md`, this is
   done — skip the rest.** (Claude Code's wrappers ship with the template, so for
   Claude this is already done.)
2. If they're missing and your tool has a command mechanism, wrap each
   `skills/<name>.md` body in your tool's format using the mapping in
   `skills/README.md` — the body is reused verbatim; only the header and argument
   token change. Then **stop and report** what you created; don't start feature
   work in the same pass.
3. Standing context (this file + `rules/`) needs no per-tool step for tools that
   read `AGENTS.md`. If your tool has its own rules format, point it at these files.

This block never deletes itself: it stays so every fresh copy of the template runs
the check once, and a tool that's already set up reads it and moves on.

## What this is

A vanilla web-app template: HTML, CSS, and a little JavaScript served straight to
the browser. No build step, no framework, no `node_modules`. Local-first — data
lives in IndexedDB, works offline, no server required. Built to be written by an
AI agent, so it favours a few consistent rules over cleverness.

## The one rule that drives everything

**Describe it in HTML. Style it and time it in CSS. Let JavaScript move only raw
data.** Before you write JS, ask whether the platform already does it — forms,
validation, `<dialog>`, `<details>`, navigation, history, animation. Usually it
does.

## Three namespaces that never cross

| Attribute        | Owned by | Rule                                    |
| ---------------- | -------- | --------------------------------------- |
| `data-part="x"`  | JS       | How JS finds an element. **Never styled.** |
| `id` / `class`   | CSS      | How CSS styles it. **Never selected by JS.** |
| `data-*` (state) | both     | JS sets it, CSS reacts to it.           |

If you catch yourself writing `.querySelector('.thing')` in JS or
`[data-part="thing"]` in CSS, stop — you've crossed a line.

## The toolkit — `public/common.js`

```js
import { $, $$, delegate, api, renderTemplate, renderList, fillParts,
         showToast, renderVariant, pickTemplate, setLocale } from './common.js'

$('@email')                 // querySelector('[data-part="email"]'), @ = data-part
$$('@row')                  // all matches, as a real array
delegate('click', '@row', (e, el) => …)   // one listener for a whole list
await api.get('/api/x'); await api.post('/api/x', body)   // fetch, JSON, throws on !ok

renderTemplate(tpl, { title: '…', body: node })   // clone a <template>, fill [data-part]
renderList(container, items, item => renderTemplate(rowTpl, item), {
  update: (node, item) => fillParts(node, item),  // reuses + moves rows, keyed
})

showToast('Saved.', 'success')            // lifetime is a CSS animation
renderVariant('cart', { count: 3 })       // pick <template> by lang + plural/axes
```

Custom element: `<x-icon name="check">` — one SVG sprite, sized to text, coloured
by `currentColor`. Add icons in `public/icons.svg` as `<symbol id="icon-NAME">`.

## Storing data — `public/lib/idb.js`

```js
import { openDB } from './lib/idb.js'
let db = openDB('appname', [ db => db.createObjectStore('items', { keyPath: 'id' }) ])
await db.put('items', obj); await db.getAll('items'); await db.delete('items', id)
db.onChange(render)   // fires here AND in other tabs — one render() covers both
```

Version = number of migrations. Never edit a shipped migration; append a new one.

## Anchoring — the reflexes to drop

Ordinary web work trains you to reach for framework machinery. Here that machinery
is the thing you skip; the platform, the cache, or a few lines of your own get the
same result.

- **No build/bundler.** Serve source as-is. Consolidate a page's code by hand for
  its load pattern — that's the bundler's job, done per page.
- **No npm dependency tree** — but libraries are fine: vendor one as a single ES
  module you `import` directly. You skip the tree and the bundler, not libraries.
- **No framework for structure.** Structure is the three namespaces + the
  examples. Copy a pattern; don't install one.
- **No reactive runtime.** Update with an explicit `render()` + `renderList`.
- **No client router.** One HTML file per page. Query params or nginx rewrites for
  deep links.
- **No HTML from strings.** `textContent` and the template helpers only.
- **No TypeScript build.** `console.assert` for contracts, JSDoc for hints.
- **No polyfills.** Target evergreen browsers; guard sharp features with
  `@supports`; let them fail soft.
- **Dev tools that don't ship are fine** — test runner, linter, formatter, CI.

Two real costs, don't pretend otherwise: custom widgets still need ARIA done by
hand, and nothing re-renders itself (you call `render()`).

## House style

Structure is strict; syntax is relaxed. `async/await`, `===`, `const`/`let`, tabs
for indent. Text that a translator could translate lives in HTML, never in a JS
string. Match the surrounding code — it should read like one person wrote it.

**`design-system.html` is the authoritative catalog of UI patterns.** It renders
every shared component with the shipping `common.css`, so it — not any one page —
is what "the patterns" means. When you check whether a page follows the patterns,
or need the right markup for a component (the app shell, a card, a button, a
form), read the gallery and copy from it. If a page and the gallery disagree, the
gallery wins and the page is the thing to fix.

**A new shared visual element is built in the design system first, then applied to
the page.** Anything more than one page will reuse — a header, a sidebar, a card
style, a button shape — gets designed and eyeballed in `design-system.html` before
it lands in a real page. Build it in the gallery, get it right there, then reuse
that pattern on the page; the page never invents shared chrome on its own. (This is
what `skills/design.md` walks through.)

## Everyday workflows

The multi-step jobs are written up once, agent-neutrally, in `skills/` — each is a
portable command body you follow (and, per tool, invoke by name). Reach for:

- **`skills/new-page.md`** — start a page from the canonical example trio.
- **`skills/add-icon.md`** — add a `<symbol>` to `icons.svg` for `<x-icon>`.
- **`skills/design.md`** — change the look through `common.css` tokens + the gallery.
- **`skills/add-font.md`** — add a self-hosted web font (subset woff2 + `@font-face`).
- **`skills/review.md`** — check changed files against `rules/`; report, don't fix.
- **`skills/diary.md`** — append a dated entry to `todo/diary.md`.
- **`skills/up.md`** — start the app in nginx via Docker at localhost:5000.
- **`skills/down.md`** — stop the Docker server `/up` started.

These are the *invokable commands*; the *standing context* is this file plus
`rules/`. A command references a rule; it never restates it. See
`skills/README.md` for the model and how each command wraps onto a specific tool.

## Before you finish

- Follow `skills/review.md` over your changes.
- Open `design-system.html` to eyeball components; it uses the same `common.css`.
- Log anything non-obvious you discovered via `skills/diary.md`.

## Tooling

Two primitives, both tool-neutral: **standing context** (this file + `rules/`) and
**invokable commands** (the portable bodies in `skills/`). Everything an agent
needs is in those plain-Markdown files. Each tool just wraps them its own way:

- **Claude Code** reads `CLAUDE.md` (which points here) and picks up
  `.claude/skills/` as slash commands (`/new-page`, `/add-icon`, `/design`,
  `/review`, `/diary`, `/up`, `/down`) — thin headers that each say "follow
  `skills/<name>.md`".
- **Any other agent** ignores `.claude/` and works from this file, `rules/`, and
  `skills/`. To give the commands a native trigger, wrap each `skills/<name>.md`
  body in your tool's command format — the body is reused verbatim, only the
  header and argument token change. `skills/README.md` has the per-agent mapping.
