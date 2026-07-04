# Diary

A dated log of the non-obvious things found while building. Newest first. The
point is to not re-learn the same sharp edge twice — when something surprises
you, write down what happened and what fixed it. Convert relative dates to
absolute.

---

## 2026-07-04 — The icon sprite must resolve next to `common.js`, not the page

`<x-icon>` first fetched `'icons.svg'`, which the browser resolves relative to
the **page**. That's fine for a root page but 404s from `examples/` (it looks for
`examples/icons.svg`). On a 404, `http.server` returns an HTML error page, which
got injected as the "sprite" — so icons silently drew nothing.

Fix: `fetch(new URL('icons.svg', import.meta.url))` — resolve relative to the
module, so an icon works from a page at any depth. General lesson: an asset a
shared module loads should be found relative to the module (`import.meta.url`),
not the document. (Also: when icons vanish, check the browser cached an older
`common.js` — hard-reload before debugging.)

## 2026-07-04 — Don't transition a registered `@property` color token

Setting `transition: --ink 0.3s` on `:root` (to cross-fade the theme flip) left
`--ink` **stuck at its starting value forever** — dark mode never applied.
Confirmed: with transitions forced off, every token computes correctly.

The fix: don't animate the tokens. Animate the properties that *read* them
(`background`, `color`) instead — those are ordinary and transition fine. In the
end even that was dropped, because a `background`/`color` transition whose value
comes *through* a registered token also froze at the start. The theme snaps now,
which is clean and reliable. If you want a theme cross-fade later, do it on a
one-off overlay, not on the tokens.

## 2026-07-04 — A custom property can't add a step to its own inherited value

The layer system first tried: each `.layer` reads `--surface-l`, paints itself,
then sets `--surface-l: calc(var(--surface-l) + step)` for its children. That's
a **cascade cycle** — `--surface-l` referring to itself on the same element — so
the browser throws both out and falls back to the `@property` initial value.
Result: nesting did nothing and dark mode read as light.

The fix: spell depth out with nesting selectors
(`:where(.layer,.card) :where(.layer,.card) { ... }`, one rule per level), all
using `:where()` so they carry no specificity and the deepest match wins by
source order. Not clever, but it actually works, and seven levels is far past
any real layout.

## 2026-07-04 — `renderVariant` and templates that are bare text

A localized string is often just text: `<template>{count} items</template>` —
no wrapping element. The first `renderVariant` did `firstElementChild.cloneNode`
and crashed on `null`. Now it clones the whole `content` fragment and returns
either the single wrapping element (a list row) or the fragment (inline text).
Both drop straight into `append`/`replaceChildren`.

## 2026-07-04 — Re-importing `common.js` re-runs `customElements.define`

Only bites during hot-reload / re-import (a second `define('x-icon')` throws and
aborts the module). Guarded with `if (!customElements.get('x-icon'))`. Harmless
in normal single-load, but the guard makes the module safe to import twice.
