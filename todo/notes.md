# Notes

The design decided up front — what this template is, the choices already made,
and why. Read this before starting a page so you build with the grain. The
`README.md` is the fuller spec; this is the working shorthand.

## What this is

A starting point for small, fast, long-lived web apps written straight to the
browser — no build step, no framework, no `node_modules`. Local-first: data
lives in the browser (IndexedDB), the app works offline, there's no server to
run. It's also meant to be written *by an AI agent*, so the rules are few,
consistent, and checkable, and the examples act as the spec.

## The one idea

Describe it in HTML. Style it and time it in CSS. Let JavaScript move only raw
data. Most app code re-implements what the platform already does; this template's
job is to not do that.

## Decisions already made (don't relitigate)

- **Three namespaces that never cross.** `data-part` = how JS finds an element
  (never styled). `id`/`class` = how CSS styles it (never selected by JS).
  `data-*` = state (set by JS, styled by CSS).
- **State in the DOM, appearance and timing in CSS.** A toast's five-second life
  is a `@keyframes`, not a `setTimeout`.
- **Sizes are relative** (rem/em/%), never px. Colours/sizes/timing are tokens.
- **One page = one HTML file.** Navigation and history come from the browser; no
  client router. Deep-link with query params, or an nginx rewrite for clean
  paths.
- **No HTML from strings.** Inject data with `textContent` / the template
  helpers. The CSP is self-only, which is what keeps it XSS-safe.
- **Libraries are allowed, added by vendoring** a single ES module you `import`
  directly — no npm dependency tree, no bundler.
- **Theme snaps, doesn't fade.** (See the diary for why a token transition
  freezes.)

## The build order

1. `common.js` + `common.css` — the shared toolkit and look. **Done, verified in
   a browser.**
2. `design-system.html` — the living gallery. **Done.**
3. `index.*` — the canonical example (local-first task list). **Done.**
4. `lib/idb.js`, `lib/format.js`, `service-worker.js`, `manifest.json`. **Done.**
5. `examples/` — one self-contained demo per pattern. **Done:** data table,
   drag-to-reorder, popover menu, form validation, localized fragments (all
   verified in a browser).
6. Agent instructions — two primitives, both tool-neutral (skillcraft model):
   **standing context** in `AGENTS.md` + `rules/`, and **invokable commands** as
   portable bodies in `skills/` (`new-page`, `add-icon`, `design`, `review`,
   `diary`) with a `skills/README.md` on wrapping them per agent. `CLAUDE.md`
   points to `AGENTS.md`; `.claude/skills/` are thin Claude Code wrappers that
   point at `skills/*.md`. Plus `scaffold.sh`. **Done** (scaffold tested end to
   end).

## Open questions / later

- `format.js` isn't exercised by a page yet — wire it into an example when a page
  needs dates or money.
- No test runner set up yet. Allowed (it doesn't ship); add one if the app grows
  logic worth testing.
- The template itself isn't a git repo yet — `git init` it when you're ready to
  track history.
