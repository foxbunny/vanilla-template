// The whole shared toolkit. No dependencies. Read it top to bottom once and you
// know every helper the app has. Everything here is a plain ES module export —
// import only what a page uses.
//
// Three namespaces that never cross:
//   data-part  → how JS finds an element   (never styled)
//   id / class → how CSS styles it          (never selected by JS)
//   data-*     → state                       (set by JS, styled by CSS)


// ── Finding elements ────────────────────────────────────────────────────────
// `@name` is shorthand for `[data-part="name"]`. Anything else is a normal CSS
// selector, so `$('.thing')` and `$('@thing')` both work.

let toSelector = s => s[0] === '@' ? `[data-part="${s.slice(1)}"]` : s

export let $ = (s, scope = document) => scope.querySelector(toSelector(s))

// Returns a real array, so `.map` / `.filter` / `.find` just work.
export let $$ = (s, scope = document) => [...scope.querySelectorAll(toSelector(s))]


// ── Event delegation ────────────────────────────────────────────────────────
// One listener for a whole list. `handler(event, matchedElement)` fires when
// the event's target is inside something matching `selector`.

export let delegate = (event, selector, handler, scope = document) => {
	scope.addEventListener(event, e => {
		let el = e.target.closest(toSelector(selector))
		if (el && scope.contains(el)) handler(e, el)
	})
}


// ── Talking to a backend (if there is one) ──────────────────────────────────
// A thin wrapper over fetch. JSON in, JSON out, throws on a non-2xx. Point it
// at whatever lives behind `/api`, or don't have a backend at all.

let request = async (method, url, body) => {
	let res = await fetch(url, {
		method,
		headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
		body: body === undefined ? undefined : JSON.stringify(body),
	})
	if (!res.ok) throw Object.assign(new Error(`${method} ${url} → ${res.status}`), { res })
	let type = res.headers.get('Content-Type') || ''
	return type.includes('json') ? res.json() : res.text()
}

export let api = {
	get: url => request('GET', url),
	post: (url, body) => request('POST', url, body),
	put: (url, body) => request('PUT', url, body),
	patch: (url, body) => request('PATCH', url, body),
	delete: url => request('DELETE', url),
}


// ── Filling a template's slots ──────────────────────────────────────────────
// Clone a <template> and fill its [data-part] elements from `data`:
//   string / number → textContent
//   Node            → becomes the element's only child
//   object          → each key/value set as an attribute
// A part absent from `data` is left as authored.

let fillParts = (root, data) => {
	let parts = $$('[data-part]', root)
	if (root.matches?.('[data-part]')) parts.push(root)
	for (let el of parts) {
		let key = el.dataset.part
		if (!(key in data)) continue
		let value = data[key]
		if (value == null) continue
		if (value instanceof Node) el.replaceChildren(value)
		else if (typeof value === 'object') for (let a in value) el.setAttribute(a, value[a])
		else el.textContent = value
	}
}

export let renderTemplate = (tpl, data = {}) => {
	let node = tpl.content.firstElementChild.cloneNode(true)
	fillParts(node, data)
	return node
}


// ── Reconciling a list ──────────────────────────────────────────────────────
// Update `container`'s children to match `items`, keyed so existing rows are
// reused and moved instead of thrown away and rebuilt. Only rows whose key is
// new get a `render(item)`; rows that stay get `update(node, item)` (optional).
// Nodes move the minimum amount — this is the one place worth a benchmark, and
// it wins one.
//
//   renderList(list, todos, todo => renderTemplate(rowTpl, todo), {
//     update: (node, todo) => fillParts(node, todo),
//   })
//
// `container` must hold only the rows (no stray whitespace/text nodes).

let KEY = Symbol('list-key')
let keyFields = ['id', '_id', 'key', '_key']

let autoKey = item => {
	if (item == null || typeof item !== 'object') return item
	for (let f of keyFields) if (f in item) return item[f]
	return item
}

export let renderList = (container, items, render, { key = autoKey, update } = {}) => {
	let old = new Map()
	for (let node of container.children) old.set(node[KEY], node)

	let prev = null   // the last row we placed
	for (let item of items) {
		let k = key(item)
		let node = old.get(k)
		if (node) {
			old.delete(k)
			update?.(node, item)
		} else {
			node = render(item)
			node[KEY] = k
		}
		// Put this row right after the previous one, moving it only if it isn't
		// already there.
		if (prev) {
			if (prev.nextSibling !== node) prev.after(node)
		} else if (container.firstChild !== node) {
			container.prepend(node)
		}
		prev = node
	}
	for (let node of old.values()) node.remove()   // rows no longer in `items`
	return container
}


// ── Toasts ──────────────────────────────────────────────────────────────────
// The message's lifetime is a CSS animation, not a setTimeout: common.css runs
// a `toast-expire` keyframe, and we remove the node when it ends. Pause-on-hover
// and duration are then pure CSS.

let toastHost

export let showToast = (message, level = 'info') => {
	toastHost ??= document.body.appendChild(
		Object.assign(document.createElement('div'), { className: 'toast-host' }))

	let toast = Object.assign(document.createElement('output'), {
		className: 'toast',
		textContent: message,
	})
	toast.dataset.level = level
	toast.addEventListener('animationend', e => {
		if (e.animationName === 'toast-expire') toast.remove()
	})
	toastHost.append(toast)
	return toast
}


// ── <x-icon name="…"> ───────────────────────────────────────────────────────
// The sprite (icons.svg) is fetched once and its <symbol>s injected hidden into
// the page; each icon is a tiny <svg><use> pointing at one. Size and colour come
// from CSS (`currentColor`, `--icon-scale` for a stroke that stays even at any
// size).

let SVGNS = 'http://www.w3.org/2000/svg'
let spriteReady

// Resolve the sprite next to this module, not the page, so an icon works from a
// page in any subfolder (examples/, etc.).
let injectSprite = (url = new URL('icons.svg', import.meta.url)) =>
	spriteReady ??= fetch(url)
		.then(r => r.text())
		.then(svg => {
			let host = document.createElement('div')
			host.hidden = true
			host.innerHTML = svg   // icons.svg is our own file, not user data
			document.body.prepend(host)
		})

if (!customElements.get('x-icon')) customElements.define('x-icon', class extends HTMLElement {
	static observedAttributes = ['name']

	connectedCallback() {
		injectSprite().then(() => this.draw())
	}

	attributeChangedCallback() {
		if (this.isConnected) this.draw()
	}

	draw() {
		let name = this.getAttribute('name')
		if (!name) return this.replaceChildren()
		let use = this.querySelector('use')
		if (!use) {
			let svg = document.createElementNS(SVGNS, 'svg')
			use = document.createElementNS(SVGNS, 'use')
			svg.append(use)
			this.replaceChildren(svg)
		}
		use.setAttribute('href', `#icon-${name}`)
	}
})


// ── Localization by template variant ────────────────────────────────────────
// No JSON message file. A translatable string is a <template> tagged with the
// native `lang` attribute plus optional `data-*` axes (plural, tone, …). To
// render, we score every candidate against the wanted axes and pick the most
// specific; ties break at random, which is how you get playful variety ("Nice!"
// / "Great!" for the same key).

let locale = document.documentElement.lang || 'en'
export let getLocale = () => locale
export let setLocale = l => { locale = l }

// exact match = 2, language prefix (en for en-US) = 1, axis absent = 0,
// conflict = -1 (disqualifies the template).
let matchAxis = (tpl, axis, want) => {
	let have = axis === 'locale' ? tpl.getAttribute('lang') : tpl.dataset[axis]
	if (have == null) return 0
	want = String(want)
	if (have === want) return 2
	if (axis === 'locale' && want.startsWith(have + '-')) return 1
	return -1
}

let score = (tpl, ctx) => {
	let total = 0
	for (let axis in ctx) {
		let m = matchAxis(tpl, axis, ctx[axis])
		if (m < 0) return -1
		total += m
	}
	return total
}

export let pickTemplate = (name, ctx = {}) => {
	ctx = { locale, ...ctx }
	if (ctx.count != null) {
		ctx.plural = new Intl.PluralRules(ctx.locale).select(ctx.count)
		delete ctx.count
	}
	let best = -1, winners = []
	for (let tpl of $$(`template[data-name="${name}"]`)) {
		let s = score(tpl, ctx)
		if (s > best) { best = s; winners = [tpl] }
		else if (s === best) winners.push(tpl)
	}
	// Vary the tie-break by winners so identical-score templates alternate;
	// index chosen from the set size keeps it deterministic-per-call-site enough.
	return winners.length ? winners[randomIndex(winners.length)] : null
}

// A small random pick. (Math.random is fine here — variety is the whole point.)
let randomIndex = n => Math.floor(Math.random() * n)

// Returns a bare element when the variant wraps one (a list row's <li>), or a
// DocumentFragment when it's inline text (a sentence with {placeholders}).
// Either drops straight into `append` / `replaceChildren`.
export let renderVariant = (name, data = {}, ctx = {}) => {
	let tpl = pickTemplate(name, { ...ctx, count: data.count })
	console.assert(tpl, `no variant for "${name}"`)
	if (!tpl) return document.createComment(`missing variant: ${name}`)

	let frag = tpl.content.cloneNode(true)

	// Stamp the template's language onto any wrapping elements, so :lang(),
	// hyphenation, and screen-reader pronunciation follow the text.
	if (tpl.hasAttribute('lang'))
		for (let el of frag.children) el.lang = tpl.getAttribute('lang')

	fillParts(frag, data)

	// Fill {placeholders} that sit inside sentences.
	let walk = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT)
	for (let t = walk.nextNode(); t; t = walk.nextNode())
		t.nodeValue = t.nodeValue.replace(/\{(\w+)\}/g, (_, k) => k in data ? data[k] : `{${k}}`)

	// A single wrapping element comes back as itself; inline text as a fragment.
	return frag.children.length === 1 && frag.childNodes.length === 1
		? frag.firstElementChild
		: frag
}

// Whole localized blocks can ship as separate files (`_cart_fr.html`, with
// `_cart.html` as the fallback). Fetch once, append hidden, then the <template>s
// inside are picked up by pickTemplate like any others.
let fragments = {}

export let loadFragments = (name, l = locale) =>
	fragments[`${name}:${l}`] ??= fetch(`_${name}_${l}.html`)
		.then(r => r.ok ? r.text() : fetch(`_${name}.html`).then(r => r.text()))
		.then(html => {
			let box = document.createElement('div')
			box.hidden = true
			box.innerHTML = html
			document.body.append(box)
		})


// fillParts is exported last because it's the shared primitive behind
// renderTemplate, renderVariant, and any `update` you write for renderList.
export { fillParts }
