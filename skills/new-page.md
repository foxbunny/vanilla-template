# new-page — start a page from the canonical example

Produce a new `NAME.html` + `NAME.js` + `NAME.css` trio, copied from the canonical
example and trimmed to what the page needs, wired up and loading clean. The
boundary: it **scaffolds one page; it doesn't build the feature.**

**Top guardrail: keep the three namespaces intact — `data-part` for JS,
`class`/`id` for CSS, `data-*` for state.** Copied code makes it easy to blur them.

## 1. Name it — from the argument (kebab-case, no extension)

Call it `NAME`. If no argument is given, ask for one.

## 2. Copy the trio in `public/`

`index.html`→`NAME.html`, `index.js`→`NAME.js`, `index.css`→`NAME.css`.

## 3. Rewire `NAME.html`

Point the `<link>` and `<script>` at `NAME.css` / `NAME.js`; set a fresh `<title>`
and description; strip the task-list body down to the structure the page needs.
Keep `<link rel="stylesheet" href="common.css">`, the charset/viewport meta, and
`<script type="module" src="NAME.js">`.

## 4. Trim `NAME.js`

Keep the imports you use, delete the rest. Storing data? Keep the `openDB` +
`render` + `db.onChange(render)` shape; otherwise drop the `lib/idb.js` import.

## 5. Offline (optional)

If the page should work offline, add its three files to the `SHELL` array in
`public/service-worker.js` and bump `CACHE`.

## 6. Link it in

Reach the page with a plain `<a href>` from wherever it belongs. Deep-link state
with query params (`?tab=notes`), not a client router.

## Notes

- Run the `review` command over the three new files before finishing.
- Confirm the page loads with no console errors against the static server.
