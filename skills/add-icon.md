# add-icon — add an icon to the sprite

Add one `<symbol id="icon-NAME">` to `public/icons.svg` so `<x-icon name="NAME">`
renders it. The boundary: it **adds a glyph; it doesn't restyle icons** — colour
and stroke already come from `common.css`.

**Top guardrail: a symbol carries geometry only — no `fill`, `stroke`, `style`, or
`stroke-width`.** `common.css` colours and strokes it via `currentColor` and
`--icon-scale`; hardcoded presentation attributes fight that.

## 1. Name it — from the argument (kebab-case). The symbol id is `icon-NAME`.

## 2. Get 24×24 stroke geometry

Feather-style outlines. If handed an SVG, strip everything but the shape elements
(`<path>`, `<line>`, `<circle>`, `<polyline>`, `<polygon>`), drop every
presentation attribute, and confirm the `viewBox` is `0 0 24 24` (rescale the
coordinates if it isn't).

## 3. Add the symbol to `icons.svg`, near its neighbours

```html
<symbol id="icon-NAME" viewBox="0 0 24 24"> …shape elements… </symbol>
```

## 4. Solid glyph? Render it with `<x-icon name="NAME" data-fill>`

`common.css` fills a `data-fill` icon instead of stroking it.

## Notes

- `design-system.html`'s icon grid lists every symbol automatically — open it to
  check the new icon at a few sizes.
- Icons resolve relative to `common.js` (via `import.meta.url`), so they work from
  a page at any folder depth.
