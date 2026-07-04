# JavaScript rules

## Shape

- ES modules only (`<script type="module">`). `import`/`export`, no globals, no
  bundler. Add a library by vendoring one ES-module file and importing it; an
  import map can tidy the name. No npm dependency tree.
- Modern syntax is welcome: `async/await`, `===`, `const`/`let` (no `var`),
  arrow functions, optional chaining, `??`. Tabs for indent.
- No TypeScript build. Use JSDoc for editor hints and `console.assert(cond, msg)`
  for contracts you want to catch in dev.

## Finding and updating the DOM

- Find elements with the toolkit: `$('@name')` / `$$('@name')` resolve the `@`
  sigil to `[data-part="name"]`. Don't select by `class` or `id` — those are
  CSS's.
- One delegated listener for a list, not one per row: `delegate('click', '@row',
  (e, el) => …)`.
- Set **state** as a `data-*` attribute and let CSS render it; don't set styles
  from JS (`el.style.x = …`) when a state attribute + CSS rule will do.
- Re-render explicitly. There's no reactive runtime: after a change, call your
  `render()`. For lists, `renderList` reuses and moves rows (keyed by `id`/`_id`/
  `key`/`_key`, or pass `{ key }`) so you can re-render freely and cheaply.

## Text and safety

- **Never build HTML from strings** (`innerHTML = …` with data, string
  concatenation into markup). Inject values with `textContent` or the template
  helpers. The CSP is self-only; keep it that way.
- Translatable text belongs in HTML, not JS. To render a string that varies by
  language or count, author `<template data-name="…" lang="…" data-plural="…">`
  and call `renderVariant(name, data)`. It picks the most specific match, fills
  `[data-part]` fields and `{placeholders}`, and stamps `lang` on the result.

## Data and state

- Store with `lib/idb.js` (`openDB` + `put`/`getAll`/`delete`). Subscribe with
  `db.onChange(render)` — it fires for this tab's writes and other tabs' alike, so
  a single `render` keeps everything in sync.
- Keep state in one place you can re-derive the UI from (the store, or a plain
  object) and render from it. Don't scatter truth across DOM reads.

## Async and lifecycle

- `await` real work; don't fire-and-forget a promise whose failure matters. Catch
  where you can act; let genuinely fatal errors surface.
- Use `AbortController` to cancel listeners/fetches tied to something that goes
  away. Prefer `requestAnimationFrame` for per-frame work over `setInterval`.
- A custom element does its setup in `connectedCallback` and reacts to attribute
  changes in `attributeChangedCallback` (list them in `observedAttributes`).
