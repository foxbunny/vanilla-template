# CSS rules

## Tokens and units

- **No literal colours, sizes, or timings in component rules.** Use the tokens in
  `common.css` (`--accent`, `--ink`, `--space-3`, `--radius`, `--fast`…). Need a
  new shared value? Add a token.
- **Relative units only** — `rem`, `em`, `%`, `vw/vh`, `ch`. Never `px`. One
  exception: hairline borders may use a small `rem` (`0.1rem`), not `px`. Sizing
  in `rem`/`em` means one font-size change rescales everything.
- **Breakpoints are about content, not devices.** `@media (width < 48rem)` when
  the layout needs it, not `768px` for "tablet".

## What CSS owns

- **Appearance and timing both.** If something happens after a delay — a toast
  expiring, a hint fading in — it's a `@keyframes` / `transition`, not a JS timer.
  JS reacts to `animationend`/`transitionend` when it needs to know it finished.
- **State styling reads `data-*`.** `.task[data-done] { … }`. JS sets the
  attribute; CSS decides the look. Never style `[data-part]`.

## Selectors

- Style by `id`, `class`, element, and `data-*` state. **Never** by `data-part` —
  that's JS's hook.
- Keep specificity low and flat. Prefer a class over a descendant chain. Use
  `:where()` for zero-specificity grouping.
- Scope component knobs as local custom properties: a component sets its own
  `--btn-bg` etc., and a variant (`[data-variant="primary"]`) overrides the knob,
  not the whole rule.

## Vertical rhythm

- The reset zeroes every margin, so nothing spaces itself. There is **one pattern
  for stacking things vertically: put `.flow` on the container** (`common.css`:
  `display: flex; flex-direction: column; gap`). Its children then get space
  between them — a prose passage, a page section, a form, a card's contents. Don't
  sprinkle per-element margins, and **don't hand-roll another
  flex-column-with-gap** — that's the inconsistency `.flow` exists to prevent.
- The gap defaults to `1em`, so prose tracks the text size. Retune one container by
  setting `--flow-space` to a `--space-*` token:
  `<ul class="flow" style="--flow-space: var(--space-1)">` for a dense list,
  `--flow-space: var(--space-5)` for airy page sections.
- `.row` is the horizontal counterpart (flex row with a gap).

## Theme and surfaces

- Light/dark comes from `prefers-color-scheme` plus a manual
  `:root[data-theme="…"]` override. Don't hardcode a single theme's colours.
- Nested surfaces (`.card`, `.layer`) shade themselves by depth — just nest them,
  don't set per-level colours. (How it works, and why it's spelled out with
  nesting selectors instead of self-referencing math, is in `todo/diary.md`.)
- **Don't put a `transition` on a registered `@property` colour token** — it
  freezes at the start value (see the diary). Transition the `background`/`color`
  that reads it, or let it snap.

## Modern features, guarded

- Target evergreen browsers. Use `oklch()`, `:has()`, container/`dvh` units,
  `@property`, subgrid freely.
- Guard a genuinely sharp feature with `@supports` and let it fail soft — the page
  must still work without it.
- Honour `@media (prefers-reduced-motion: reduce)` — cut animation and transition
  durations there.
