# Vanilla Template

A starting point for building small, fast, long-lived web apps with nothing between
you and the browser. No build step, no framework, no `node_modules`. You write HTML,
CSS, and a little JavaScript; the browser runs exactly what you wrote.

It is also built to be written *by an AI agent*: a few consistent, machine-checkable
rules and a set of worked examples, so an agent can hold the whole app in its head
and produce code that looks like the rest of the codebase.

---

## Philosophy

One idea runs through everything:

> **Describe it in HTML. Style it and time it in CSS. Let JavaScript move only raw
> data.**

The browser already does most of what an app needs — forms, validation, dialogs,
disclosure, navigation, history, animation. Most app code exists to re-implement
things the platform gives you for free. This template's job is to *not* do that.

The beliefs that follow from it:

- **HTML is the source of the structure.** If a translator could translate a string,
  it lives in HTML, never in JS. JS injects values (a name, a count), not sentences.
- **CSS owns appearance *and timing*.** State is a `data-*` attribute on an element;
  CSS decides what that state looks like. Even timers — a toast that dismisses itself
  after five seconds — are CSS animations, not `setTimeout`.
- **Three namespaces that never cross.** `data-part` is how JS finds an element.
  `id` and `class` are how CSS styles it. `data-*` is state. JS never reads a class;
  CSS never reads a `data-part`. This one rule keeps behavior, appearance, and state
  from ever tangling — and it makes the code unambiguous for a person *or* a model.
- **Reuse the layers, not components.** HTML, CSS, and JS are reused independently, so
  reuse multiplies instead of adds: the same classes style any markup, the same helper
  drives any structure, the same `<template>` renders under any styling.
- **Structure is shown, not shipped.** A framework imposes structure with a runtime you
  download; here it's a few conventions demonstrated in examples the agent copies — zero
  bytes on the page.
- **The rule is about the shipped payload, not the toolbox.** Nothing goes between your
  source and what runs in the browser. Dev tools that don't ship — test runner, linter,
  formatter, dev server, CI — are fine.
- **What you write is what runs.** No transpile, no bundle. The line numbers in the
  debugger are the line numbers in your file. There is no source map because there is
  no source transformation.
- **Local-first.** Data lives in the browser (IndexedDB). The app works offline, costs
  nothing to host, and has no server to run, deploy, or keep patched.
- **One design system, shown on a page that can't drift.** `design-system.html`
  renders every component in every state *using the same `common.css` the app ships* —
  so it is documentation, a component gallery, and a smoke test at once.

---

## What you get

- **Nothing to rot.** No bundler, no transpiler, no dependency tree. A framework you
  adopt today needs upgrading for years; standards don't break. A page written to the
  platform in 2010 still runs. This will too.
- **A whole "framework" you can read in ten minutes.** `common.js` is about 200 lines
  with no dependencies: element selection, event delegation, a `fetch` wrapper,
  `<template>` rendering with a keyed list reconciler, toasts, an icon element, and the
  variant/i18n engine. That's the entire shared surface.
- **Fast by construction.** A few consolidated files shaped per page, no framework runtime
  to parse, animations that run off the main thread in CSS, and a service worker that
  caches everything after the first load.
- **Debuggable.** The code in the browser *is* your code.
- **Cheap and portable.** Static files. Host them anywhere, or run them from a folder.
- **Offline.** Install it; use it on a plane.
- **Writable by an agent.** Few rules, all consistent, all checkable — plus examples
  that act as the spec. An AI can copy a pattern instead of inventing one.

### The toolkit (`public/common.js`)

- `$('@name')` / `$$('@name')` — find elements by `data-part` (the `@` sigil), with an
  optional scope. Returns real arrays, so `.map`/`.filter` work.
- `delegate(sel, fn)` — one listener for a whole list.
- `api.get` / `api.post` — a thin `fetch` wrapper. Backend-agnostic; swap what's behind
  `/api` (or don't have one).
- `renderTemplate` + `renderList` — clone `<template>`s; update lists with a keyed
  reconciler that reuses nodes and touches only the fields that changed.
- `showToast(message, level)` — a toast whose lifetime is a CSS animation.
- `<x-icon name="…">` — one SVG sprite, fetched once, sized by CSS.
- `renderVariant` / `pickTemplate` / `loadFragments` — pick the right template by
  language and any other axis (plural, tone…). See *Localization*.

### Localization without a catalog

There is no `.json` message file. A localized string is a `<template>` tagged with the
native `lang` attribute (plus optional `data-*` axes like plural):

```html
<template data-name="cart" lang="en" data-plural="one">{count} item in your cart</template>
<template data-name="cart" lang="en" data-plural="other">{count} items in your cart</template>
<template data-name="cart" lang="fr" data-plural="other">{count} articles dans le panier</template>
```

`renderVariant('cart', { count: 3 })` picks the most specific match for the current
language (with `en` falling back for `en-US`), fills `{count}`, and stamps `lang` on the
result so `:lang()`, hyphenation, and screen-reader pronunciation all work. Whole
localized blocks can ship as `_cart_fr.html` files, loaded on demand. The translator
edits HTML — the same place the text already lives.

---

## How to use it

### Start a project from this template

Grab a clean copy with [degit](https://github.com/Rich-Harris/degit) — a snapshot
with no git history and no tie back to this repo:

```sh
npx degit foxbunny/vanilla-template my-app
cd my-app
```

That's your own copy; run `git init` when you're ready to track it. To make it
yours in one step instead — renaming the manifest, page titles, and the IndexedDB
name, and running `git init` plus a first commit — clone and run `scaffold.sh`:

```sh
git clone https://github.com/foxbunny/vanilla-template.git
./vanilla-template/scaffold.sh "My App"
```

Then serve it — any static file server works, there's no build:

```sh
cd my-app/public && python3 -m http.server 8000
```

### Everyday use

1. **Serve the folder.** Any static file server works. There is no build.
2. **Develop the look in `design-system.html`.** Change tokens in `common.css`, watch
   every component update. This is where you decide how the app feels.
3. **Start a page by copying the canonical example** (`public/index.html` +
   `index.js` + `index.css`). Each page is its own HTML file — real navigation, no
   client-side router.
4. **Store data with `lib/idb.js`** — a small Promise wrapper over IndexedDB, versioned
   by a list of migrations, with cross-tab sync over `BroadcastChannel`.
5. **Browse `examples/`** for a working version of each pattern (a reconciled list, a
   dialog form, a localized list, a theme toggle) and copy the one you need.

### The AI-first workflow

- `AGENTS.md` is the tool-neutral cheat-sheet an agent reads first — the one rule,
  the three namespaces, the toolkit, and the anchoring notes. `rules/*.md` are the
  detailed, per-language house rules. Together they're the **standing context**,
  and nothing in them is tied to a particular assistant.
- The multi-step workflows are **invokable commands**, written once as portable
  bodies in `skills/` (`new-page`, `add-icon`, `design`, `review`, `diary`) — the
  body prose is reused across agents, only the header and argument syntax change.
  Claude Code wraps each as a slash command (`.claude/skills/`); any other agent
  wraps the same body its own way. `skills/README.md` explains the model and the
  per-agent mapping. (The approach is borrowed from the `skillcraft` library.)
- `todo/notes.md` holds the design decided up front; `todo/diary.md` is a dated log of
  every non-obvious thing discovered while building — the record that stops an agent
  (or you) from re-learning the same sharp edge twice.

The rules keep the **structure** (the three namespaces, state-in-CSS, tokens, relative
units, text-in-HTML) but stay out of the way on **syntax** — `async/await`, `===`, and
`const` are all fine. The point is code that reads like the rest of the repo, not a
style cage that fights the way the model already writes.

---

## Anchoring

For an agent working here. Ordinary web code trains a reflex to reach for framework
machinery — a bundler, an `npm install`, a client router, a coupled component. Here that
machinery is the thing you skip; the platform, the cache, or a few lines of your own code
get the same outcome. When the reflex fires, don't:

- **No build step or bundler.** Serve source as-is. Consolidate a page's code by hand for
  its load pattern — the job a bundler would do, done per page with knowledge of what that
  page needs.
- **No minifier.** Keep code lean at the source (no framework, no deps, ~200-line shared
  toolkit); the host's gzip/brotli covers the rest.
- **No npm dependency tree — libraries are still allowed, just added differently.** The
  platform covers dates, `fetch`, validation, `<dialog>`, drag, animation, IndexedDB, so
  usually you need nothing. When one truly earns it, vendor it as a single ES module — a
  file in the repo you `import` directly (an import map can tidy the name). You skip the
  *tree* of transitive dependencies and the bundler that resolves them, not libraries as
  such. Vendoring also keeps it offline and within the self-only CSP.
- **No framework for "structure."** Structure is shown, not shipped: follow the examples
  and the three-namespace split (`data-part` / `class` / `data-*`).
- **No reactive runtime or state library.** Update with explicit `render()` + the keyed
  reconciler. Build a small memoized slice only for the one screen dense enough to need it.
- **No coupled components.** Reuse HTML, CSS, and JS independently — shared classes,
  `common.js` helpers, `<template>`s.
- **No client router.** Separate HTML pages are the routes. Deep-link with query params
  (`?project=42&tab=notes`), or an nginx rewrite for clean paths.
- **No TypeScript build.** `console.assert` for contracts, JSDoc for editor hints.
- **No HTML built from strings.** Inject data only via `textContent`; self-only CSP. This
  is what keeps it XSS-safe.
- **No polyfills or transpilation.** Target evergreen browsers; guard sharp features with
  `@supports`; let them fail soft.
- **No CSS-in-JS or scoped-style tooling.** Scope by `id`, section, and custom element;
  never style `data-part`; put shared decisions in tokens.
- **Dev tools that don't ship are fine** — test runner, linter, formatter, dev server, CI.

Two real costs — don't pretend otherwise:

- **Custom widgets need ARIA.** Native elements carry accessibility for free; a widget with
  no native equivalent still needs ARIA done right. Don't add ARIA the browser already
  provides; do add it where it can't.
- **Nothing re-renders itself.** You call `render()`. Cheap and explicit, but you have to
  remember it.

When a requirement actually comes up:

- **SEO** → a thin server that renders per-URL metadata only (`<title>`, description, Open
  Graph); content stays client-side. Never render the whole page on both sides.
- **Multi-user** → add a backend; point `api` at it, the frontend is unchanged.
- **Wrong tool** for content-heavy pages that must read without JS, or a dense auto-reactive
  UI (a spreadsheet engine, a live-collab canvas) — use server rendering or a reactive
  runtime instead.

---

## Structure

```
public/
  common.js            the ~200-line toolkit (selection, api, render, toast, icons, i18n)
  common.css           design tokens + every base component
  icons.svg            the SVG sprite
  design-system.html   living gallery — develop the look here
  design-system.css    gallery layout only (no component styles)
  design-system.js     wires the gallery's interactive demos
  index.html/.js/.css  the canonical example page — copy this to start
  error.html
  manifest.json        PWA manifest
  service-worker.js    cache-first offline support
  lib/                 opt-in modules, loaded only when used
    idb.js             IndexedDB + BroadcastChannel cross-tab sync
    format.js          Intl date/number/money helpers
  examples/            one self-contained demo per pattern
AGENTS.md              the tool-neutral cheat-sheet an agent reads first
rules/                 standing context — per-language house rules (html, css, javascript)
skills/                portable command bodies (new-page, add-icon, design, review, diary)
                       + README.md on the model and wrapping them per agent
CLAUDE.md              pointer to AGENTS.md (so Claude Code auto-loads it)
.claude/
  skills/              Claude Code wrappers — thin headers pointing at skills/*.md
todo/
  notes.md             design decided up front
  diary.md             dated log of everything discovered while building
scaffold.sh            stamp out a new named project from this template
```
