# add-font — add a self-hosted web font

Put a web font in the repo and wire it up: a subset `woff2` in `public/fonts/`
and an `@font-face` block in `public/fonts.css` (which `common.css` imports), so
any CSS can use the family. The boundary: it **installs a font; it doesn't design
the typography** — choosing where the family and weights are used is a separate
`design` change (set `--font` in `common.css`).

**Top guardrail: self-host the font — never link a third-party font CDN.** The
app's Content-Security-Policy allows only same-origin resources, so an external
font URL is blocked outright; and a remote font leaks every visitor to that host
and breaks offline. The font must be a file in this repo.

## Why download and convert, not hotlink

This is the whole point, so it's worth stating plainly:

- **Privacy.** A linked font (`<link href="fonts.googleapis.com…">`) sends every
  visitor's IP address and the page they're on to a third party on every load.
  Self-hosting makes that zero. (German courts have fined sites for exactly this
  under GDPR.)
- **The CSP requires it.** This template serves under a self-only
  Content-Security-Policy. A cross-origin font request simply fails. Self-hosting
  isn't a preference here — it's the only thing that works.
- **Offline.** A font cached by the service worker works on a plane; a CDN font
  doesn't. Local-first apps can't depend on a font server being reachable.
- **Speed.** No extra DNS lookup and TLS handshake to a font host, no
  render-blocking third-party stylesheet. One origin, and you can `preload` the
  woff2. Google's `<link>` is two round-trips to two origins before text draws.
- **Stability.** You pin the exact bytes. A CDN can swap hinting, glyphs, or the
  whole version under you; your file never changes unless you change it.
- **Smaller.** Converting yourself lets you subset to the glyphs you actually use
  (Latin, say) and keep a variable font variable — every weight from one small
  file. A generic CDN file carries glyphs and formats you'll never use.
- **No build step.** The woff2 is just a file served as-is — the same "what you
  write is what runs" the rest of the template follows.

Converting **locally** (a script) beats the web tool for the same reasons the
template avoids other web dependencies: it's repeatable, scriptable, uploads your
fonts to no one, and — importantly — it can keep a variable font variable, which
the popular web converter (Transfonter) flattens to a single weight.

## 1. Get the font

Download the source from Google Fonts (the "Get font" / repo `.ttf`) or the
foundry. Check the licence allows self-hosting/embedding — Google Fonts are OFL,
which does; keep the `OFL.txt` next to the font (see `public/fonts/`).

## 2. Convert and wire it in

One command either way:

```sh
./add-font.sh MyFont.ttf          # convert locally → subset woff2 (needs fonttools)
./add-font.sh transfonter-kit.zip # or drop in a Transfonter download as-is
```

It writes the woff2 to `public/fonts/` and appends an `@font-face` to
`public/fonts.css`. For a variable font the local path keeps the weight axis
(`font-weight: 300 800`); a Transfonter kit will be static (one weight per file).

Local conversion needs fonttools once: `pip install --user fonttools brotli`.

## 3. Use it

Point CSS at the family. To make it the whole app's font, set the token in
`common.css`:

```css
--font: 'My Font', system-ui, sans-serif;
```

`system-ui` stays as the fallback shown until the woff2 loads (the `@font-face`
uses `font-display: swap`, so text is never invisible).

## Notes

- **Subset to what you need.** `add-font.sh` subsets to Latin + Latin Extended by
  default; widen the `RANGES` in the script for Cyrillic/Greek/Vietnamese.
- **Variable beats many statics.** One variable woff2 covers every weight in its
  range — fewer files, real (not faux) bold at any weight.
- **Preload the critical face** for the fastest first paint:
  `<link rel="preload" href="fonts/my-font.woff2" as="font" type="font/woff2" crossorigin>`.
- Keep the licence file with the font, and don't hand-edit `fonts.css` url()s —
  let the script keep them pointing at `fonts/`.
