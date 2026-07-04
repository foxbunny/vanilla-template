# design — develop the look through tokens and the gallery

Make a look-and-feel change in `public/common.css` and verify it in
`design-system.html`, in both themes. The boundary: it **changes shared style; it
doesn't add page-specific one-offs.**

**Top guardrail: change tokens, not literals — and never style a one-off in a page
when the change belongs to a token.** Forked colours are how a design system rots.

## 1. Open the gallery

Open `design-system.html` against the static server and keep it open — it renders
every component on the same `common.css` the app ships.

## 2. Make the change in `common.css`

- Colour / spacing / radius / timing → edit the token in `:root`, and keep its
  dark-mode counterparts (`@media (prefers-color-scheme: dark)` and
  `:root[data-theme="dark"]`) in step.
- A component's look → edit that component's rule, expressing new shared values as
  tokens, not literals.
- Relative units only (rem/em/%), no `px`; no literal colours in component rules.

## 3. Reload and check both themes

Toggle with the Theme button (it flips `:root[data-theme]`). Confirm a nested
`.card` still reads as layered, and that focus rings and `:user-invalid` states
still look right.

## 4. Keep the gallery complete

If you added a component to the app, add it to `design-system.html` too.

## Notes

- The theme snaps rather than fades on purpose — don't put a `transition` on a
  registered `@property` token; it freezes at the start value (see
  `todo/diary.md`).
- One token set, one look — don't fork colours per page.
